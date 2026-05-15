(function () {
  'use strict';

  const API = "https://translate.googleapis.com/translate_a/single";

  async function translateGoogle(text, sl, tl) {
    const params = new URLSearchParams({ client: "dict-chrome-ex", sl, tl, dt: "t", q: text });
    const url = `${API}?${params}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    let result = "";
    if (data && data[0]) {
      result = data[0].filter((i) => i && i[0]).map((i) => i[0]).join("");
    }
    return result;
  }

  let bingConfig = null;

  const BING_LANG_MAP = {
    "auto": "auto-detect",
    "zh-CN": "zh-Hans",
    "zh-TW": "zh-Hant",
  };

  function bingLang(code) {
    return BING_LANG_MAP[code] || code;
  }

  async function fetchBingConfig() {
    const resp = await fetch("https://www.bing.com/translator");
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const html = await resp.text();

    const igMatch = html.match(/IG:"([^"]+)"/) || html.match(/IG\s*=\s*"([^"]+)"/);
    if (!igMatch) throw new Error("Failed to extract IG");
    const ig = igMatch[1];

    const iidMatch = html.match(/data-iid="([^"]+)"/);
    if (!iidMatch) throw new Error("Failed to extract IID");
    const iid = iidMatch[1];

    const paramsMatch = html.match(/params_AbusePreventionHelper\s*=\s*\[(\d+),\s*"([^"]*)",\s*(\d+)\]/);
    if (!paramsMatch) throw new Error("Failed to extract abuse prevention params");
    const token = paramsMatch[2];
    const key = paramsMatch[1];
    const tokenExpiryInterval = parseInt(paramsMatch[3], 10);

    bingConfig = {
      ig,
      iid,
      token,
      key,
      expiry: Date.now() + tokenExpiryInterval,
    };
    return bingConfig;
  }

  async function getBingConfig() {
    if (bingConfig && Date.now() < bingConfig.expiry) return bingConfig;
    return fetchBingConfig();
  }

  function clearBingConfig() {
    bingConfig = null;
  }

  async function translateBing(text, sl, tl, _retry) {
    const config = await getBingConfig();
    const bsl = bingLang(sl);
    const btl = bingLang(tl);

    const body = new URLSearchParams({
      fromLang: bsl,
      text: text,
      token: config.token,
      key: config.key,
      to: btl,
    });

    const url = `https://www.bing.com/ttranslatev3?isVertical=1&IG=${config.ig}&IID=${config.iid}.1`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": "https://www.bing.com/translator",
      },
      body: body.toString(),
    });

    if (!resp.ok) {
      if (!_retry) {
        clearBingConfig();
        return translateBing(text, sl, tl, true);
      }
      throw new Error(`HTTP ${resp.status}`);
    }

    const data = await resp.json();

    if (data.ShowCaptcha || data.StatusCode === 401) {
      if (!_retry) {
        clearBingConfig();
        return translateBing(text, sl, tl, true);
      }
      throw new Error(data.ShowCaptcha ? "Captcha required" : "Unauthorized");
    }

    if (!data || !data[0] || !data[0].translations || !data[0].translations[0]) {
      throw new Error("Unexpected response format");
    }

    return data[0].translations[0].text;
  }

  const cache = new Map();
  const CACHE_MAX = 500;

  async function translate(text, sl, tl, engine) {
    if (!text || !text.trim()) return "";
    if (sl === tl && sl !== "auto") return text;

    const eng = engine || "google";
    const key = `${eng}:${sl}:${tl}:${text.substring(0, 200)}`;
    const cached = cache.get(key);
    if (cached) return cached;

    let result;

    switch (eng) {
      case "bing":
        result = await translateBing(text, sl, tl);
        break;
      default:
        result = await translateGoogle(text, sl, tl);
    }

    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
    cache.set(key, result);
    return result;
  }

  const BROWSER_LANG_MAP = {
    "zh": "zh-CN", "zh-cn": "zh-CN", "zh-tw": "zh-TW", "zh-hk": "zh-TW",
    "en": "en", "en-us": "en", "en-gb": "en",
    "ja": "ja", "ko": "ko", "fr": "fr", "de": "de",
    "es": "es", "pt": "pt", "pt-br": "pt",
    "ru": "ru", "ar": "ar", "th": "th", "vi": "vi",
    "id": "id", "it": "it", "nl": "nl", "pl": "pl",
    "tr": "tr", "hi": "hi",
  };

  function getBrowserLang() {
    const nav = navigator.language || "en";
    const lower = nav.toLowerCase();
    if (BROWSER_LANG_MAP[lower]) return BROWSER_LANG_MAP[lower];
    const prefix = lower.split("-")[0];
    return BROWSER_LANG_MAP[prefix] || "en";
  }

  const LANGS = [
    { code: "auto", name: "Detect Language" },
    { code: "zh-CN", name: "Chinese (Simplified)" },
    { code: "zh-TW", name: "Chinese (Traditional)" },
    { code: "en", name: "English" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "es", name: "Spanish" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ar", name: "Arabic" },
    { code: "th", name: "Thai" },
    { code: "vi", name: "Vietnamese" },
    { code: "id", name: "Indonesian" },
    { code: "it", name: "Italian" },
    { code: "nl", name: "Dutch" },
    { code: "pl", name: "Polish" },
    { code: "tr", name: "Turkish" },
    { code: "hi", name: "Hindi" },
  ];

  const ENGINES = [
    { id: "google", name: "Google" },
    { id: "bing", name: "Bing" },
  ];

  const DEF = {
    selTL: getBrowserLang(),
    inputSL: "auto",
    inputTL: "en",
    enSel: true,
    enInput: true,
    ignLangs: [],
    selEngine: "google",
    inputEngine: "google",
    rulesUrl: "",
  };

  async function getSettings() {
    const r = await chrome.storage.local.get(["settings"]);
    return { ...DEF, ...(r.settings || {}) };
  }

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

  async function saveRemoteRules(rules, etag) {
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

  async function getSiteRules() {
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

  function matchRule(rules, url) {
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

  async function initRules() {
    const stored = await loadRulesFromStorage();
    if (!stored) {
      cachedMerged = [...DEF_RULES];
      fetchRemoteRules().catch(() => {});
    }
  }

  function resetRulesCache() {
    rulesLastFetch = 0;
    cachedMerged = null;
  }

  function handleMessage(req, sender, respond) {
    if (req.action === "translate") {
      translate(req.text, req.sourceLang || "auto", req.targetLang || "en", req.engine)
        .then((r) => respond({ success: true, result: r }))
        .catch((e) => respond({ success: false, error: e.message }));
      return true;
    }

    if (req.action === "getSettings") {
      getSettings().then((s) => respond({ settings: s }));
      return true;
    }

    if (req.action === "saveSettings") {
      chrome.storage.local.set({ settings: req.settings }).then(() => {
        respond({ success: true });
      });
      return true;
    }

    if (req.action === "getLanguages") {
      respond({ languages: LANGS });
      return false;
    }

    if (req.action === "getEngines") {
      respond({ engines: ENGINES });
      return false;
    }

    if (req.action === "testEngine") {
      const engine = req.engine || "google";
      translate("Hello world", "en", "zh-CN", engine)
        .then((r) => respond({ success: true, result: r, engine }))
        .catch((e) => respond({ success: false, error: e.message, engine }));
      return true;
    }

    if (req.action === "openOptions") {
      chrome.runtime.openOptionsPage();
      respond({ success: true });
      return false;
    }

    if (req.action === "setEnFloat") {
      getSettings().then(async (s) => {
        s.enFloat = !!req.value;
        await chrome.storage.local.set({ settings: s });
        respond({ success: true });
      });
      return true;
    }

    if (req.action === "getSiteRule") {
      (async () => {
        const rules = await getSiteRules();
        const url = req.url || sender.tab?.url || "";
        const rule = matchRule(rules, url);
        respond({ rule });
      })();
      return true;
    }

    if (req.action === "getAllRules") {
      (async () => {
        const rules = await getSiteRules();
        respond({ rules });
      })();
      return true;
    }

    if (req.action === "refreshRules") {
      (async () => {
        resetRulesCache();
        const rules = await fetchRemoteRules();
        respond({ rules: rules || [] });
      })();
      return true;
    }

    if (req.action === "updateRules") {
      (async () => {
        const rules = req.rules;
        if (!Array.isArray(rules)) { respond({ success: false }); return; }
        await saveRemoteRules(rules, null);
        respond({ success: true });
      })();
      return true;
    }

    return false;
  }

  chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
  });

  chrome.runtime.onMessage.addListener((req, sender, respond) => {
    return handleMessage(req, sender, respond);
  });

  initRules();

})();
//# sourceMappingURL=background.js.map
