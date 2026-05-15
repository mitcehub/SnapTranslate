import { getSettings } from './settings.js';

const DEFAULT_RULES_URL = "https://raw.githubusercontent.com/translate-ext/rules/main/rules.json";

const DEF_RULES = [
  {
    name: "reddit",
    urlPattern: "reddit.com",
    containerSelector: "[data-testid='post-container'], .Post, .ListingLayout-outerContainer",
    excludeSelectors: [".voteButtons", ".post-roast-action-bar", "[data-testid='post-media']", "time", "shreddit-post-actions"],
    extraBlockTags: ["SHREDDIT-POST"]
  },
  {
    name: "twitter",
    urlPattern: "twitter.com|x.com",
    containerSelector: "[data-testid='tweetText'], [data-testid='tweet']",
    excludeSelectors: ["[data-testid='tweetPhoto']", "[role='group']", "time", "[data-testid='socialContext]"]
  },
  {
    name: "github",
    urlPattern: "github.com",
    containerSelector: ".markdown-body, .comment-body, .js-discussion",
    excludeSelectors: [".js-file-line", ".blob-code", ".CodeMirror", "pre code", ".react-code-text"]
  },
  {
    name: "youtube",
    urlPattern: "youtube.com",
    containerSelector: "#description-inner, #content-text, ytd-comment-renderer",
    excludeSelectors: ["ytd-thumbnail", "yt-icon", "#avatar", "#author-thumbnail"]
  },
  {
    name: "wikipedia",
    urlPattern: "wikipedia.org",
    containerSelector: "#mw-content-text",
    excludeSelectors: [".mw-editsection", ".reference", ".citation", ".navbox", ".sidebar", "table.infobox caption", ".toc"]
  },
  {
    name: "stackoverflow",
    urlPattern: "stackoverflow.com|stackexchange.com|superuser.com|askubuntu.com|serverfault.com",
    containerSelector: ".post-text, .comment-text",
    excludeSelectors: ["pre code", ".lang-", ".snippet-code", ".s-prose code"]
  }
];

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
      cachedMerged = mergeRules(DEF_RULES, remoteRules);
      return cachedMerged;
    }
  } catch {}
  return null;
}

export async function saveRemoteRules(rules, etag) {
  try {
    remoteRules = rules;
    rulesETag = etag;
    rulesLastFetch = Date.now();
    cachedMerged = mergeRules(DEF_RULES, rules);
    await chrome.storage.local.set({
      remoteRules: rules,
      siteRulesETag: etag || null,
      siteRulesLastFetch: rulesLastFetch
    });
  } catch {}
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
    return cachedMerged || DEF_RULES;
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
      fetchRemoteRules().catch(() => {});
      return stored;
    }
  }

  const rules = await fetchRemoteRules();
  if (!rules) return DEF_RULES;
  return rules;
}

export function matchRule(rules, url) {
  try {
    const hostname = new URL(url).hostname;
    for (const rule of rules) {
      if (!rule.urlPattern) continue;
      const patterns = rule.urlPattern.split("|");
      for (const p of patterns) {
        if (hostname.includes(p.trim())) return rule;
      }
    }
  } catch {}
  return null;
}

export async function initRules() {
  const stored = await loadRulesFromStorage();
  if (!stored) {
    cachedMerged = [...DEF_RULES];
    fetchRemoteRules().catch(() => {});
  }
}

export function resetRulesCache() {
  rulesLastFetch = 0;
  cachedMerged = null;
}

export { fetchRemoteRules };
