import { getSettings } from './settings.js';
import { rules as BUNDLED_RULES } from '../rules.json';

const DEFAULT_RULES_URL = "https://raw.githubusercontent.com/translate-ext/rules/main/rules.json";

let cachedMerged = null;
let remoteRules = null;
let rulesETag = null;
let rulesLastFetch = 0;
const RULES_CACHE_TTL = 4 * 60 * 60 * 1000;

function mergeRules(base, remote) {
  if (!remote || !remote.length) return base;
  const map = new Map();
  for (const r of base) map.set(r.name, r);
  for (const r of remote) {
    if (!r.name) continue;
    map.set(r.name, r);
  }
  return [...map.values()];
}

async function loadRulesFromStorage() {
  try {
    const data = await chrome.storage.local.get(["remoteRules", "siteRulesETag", "siteRulesLastFetch"]);
    if (data.remoteRules) {
      remoteRules = data.remoteRules;
      rulesETag = data.siteRulesETag || null;
      rulesLastFetch = data.siteRulesLastFetch || 0;
      cachedMerged = mergeRules(BUNDLED_RULES, remoteRules);
      return cachedMerged;
    }
  } catch { }
  return null;
}

export async function saveRemoteRules(rules, etag) {
  try {
    remoteRules = rules;
    rulesETag = etag;
    rulesLastFetch = Date.now();
    cachedMerged = mergeRules(BUNDLED_RULES, rules);
    await chrome.storage.local.set({
      remoteRules: rules,
      siteRulesETag: etag || null,
      siteRulesLastFetch: rulesLastFetch
    });
  } catch { }
}

async function fetchRemoteRules() {
  const settings = await getSettings();
  const rulesUrl = settings.rulesUrl || DEFAULT_RULES_URL;
  try {
    const headers = {};
    if (rulesETag) headers["If-None-Match"] = rulesETag;
    const resp = await fetch(rulesUrl, { headers, cache: "no-cache" });
    if (resp.status === 304) return cachedMerged;
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const rules = await resp.json();
    if (!Array.isArray(rules)) throw new Error("Invalid rules format");
    const newETag = resp.headers.get("ETag");
    await saveRemoteRules(rules, newETag);
    return cachedMerged;
  } catch (e) {
    return cachedMerged || BUNDLED_RULES;
  }
}

export async function getSiteRules() {
  if (cachedMerged) {
    const now = Date.now();
    if ((now - rulesLastFetch) < RULES_CACHE_TTL) return cachedMerged;
  }
  if (!cachedMerged) {
    const stored = await loadRulesFromStorage();
    if (stored) {
      fetchRemoteRules().catch(() => { });
      return stored;
    }
  }
  const rules = await fetchRemoteRules();
  if (!rules) return BUNDLED_RULES;
  return rules;
}

function extractHostPattern(pattern) {
  let host = pattern;
  if (host.includes('://')) host = host.split('://')[1];
  if (host.includes('/')) host = host.split('/')[0];
  return host;
}

function matchGlob(value, glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  try { return new RegExp('^' + escaped + '$').test(value); } catch { return false; }
}

function matchHostnameOrUrl(url, pattern) {
  const parsed = new URL(url);
  const hostname = parsed.hostname;

  // Extract hostname portion and path portion from pattern
  let hostPattern = pattern;
  let pathPart = null;
  if (hostPattern.includes('://')) hostPattern = hostPattern.split('://')[1];
  const slashIdx = hostPattern.indexOf('/');
  if (slashIdx !== -1) {
    pathPart = hostPattern.substring(slashIdx);
    hostPattern = hostPattern.substring(0, slashIdx);
  }

  // Wildcard host with path
  if (hostPattern === '*') {
    if (pathPart) return matchGlob(parsed.pathname + parsed.search, pathPart);
    return true;
  }

  // Hostname matching
  let hostMatch = false;
  if (hostPattern === hostname) hostMatch = true;
  else if (hostname.endsWith('.' + hostPattern)) hostMatch = true;
  else if (hostPattern.startsWith('*.') && (hostname === hostPattern.slice(2) || hostname.endsWith('.' + hostPattern.slice(2)))) hostMatch = true;
  else if (matchGlob(hostname, hostPattern)) hostMatch = true;

  if (!hostMatch) return false;
  if (pathPart) return matchGlob(parsed.pathname + parsed.search, pathPart);
  return true;
}

function matchExcludeUrl(url, pattern) {
  const parsed = new URL(url);
  const hostname = parsed.hostname;
  const hostPattern = extractHostPattern(pattern);
  if (!hostname.endsWith(hostPattern) && hostPattern !== hostname) {
    const dotHost = '.' + hostPattern;
    if (!hostname.endsWith(dotHost) && hostname !== hostPattern) return false;
  }
  const slashIdx = pattern.indexOf('/', pattern.indexOf('://') + 3);
  if (slashIdx === -1) return true;
  const pathPart = pattern.substring(slashIdx);
  const urlPath = parsed.pathname + parsed.search;
  const escaped = pathPart.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  try {
    return new RegExp('^' + escaped + '$').test(urlPath);
  } catch { return false; }
}

function matchUrlAgainstPatterns(url, patterns) {
  if (!patterns?.length) return false;
  for (const p of patterns) {
    const pattern = p.trim();
    if (!pattern) continue;
    if (matchHostnameOrUrl(url, pattern)) return true;
  }
  return false;
}

export function matchRule(rules, url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    for (const rule of rules) {
      if (rule.excludeMatches?.length) {
        let excluded = false;
        for (const p of rule.excludeMatches) {
          if (matchExcludeUrl(url, p)) { excluded = true; break; }
        }
        if (excluded) continue;
      }
      if (rule.matches?.length) {
        if (matchUrlAgainstPatterns(url, rule.matches)) return rule;
      }
      if (rule.urlPattern) {
        const patterns = rule.urlPattern.split("|");
        for (const p of patterns) {
          const pattern = p.trim();
          if (!pattern) continue;
          if (matchHostname(hostname, pattern)) return rule;
        }
      }
    }
  } catch { }
  return null;
}

export async function initRules() {
  const stored = await loadRulesFromStorage();
  if (!stored) {
    cachedMerged = [...BUNDLED_RULES];
    fetchRemoteRules().catch(() => { });
  }
}

export function resetRulesCache() {
  rulesLastFetch = 0;
  cachedMerged = null;
}

export { fetchRemoteRules };
