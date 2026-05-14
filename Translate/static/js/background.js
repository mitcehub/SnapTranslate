importScripts("rules.js");

const API = "https://translate.googleapis.com/translate_a/single";

const ENGINES = [
  { id: "google", name: "Google" },
  { id: "bing", name: "Bing" },
];

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

const DEF = {
  selTL: getBrowserLang(),
  inputSL: "auto",
  inputTL: "en",
  pgTL: getBrowserLang(),
  enSel: true,
  enInput: true,
  enFloat: true,
  enContext: true,
  ignLangs: [],
  blacklist: [],
  selEngine: "google",
  inputEngine: "google",
  pgEngine: "google",
  rulesUrl: "",
};

const cache = new Map();
const CACHE_MAX = 500;

async function getSettings() {
  const r = await chrome.storage.local.get(["settings"]);
  return { ...DEF, ...(r.settings || {}) };
}

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

async function translate(text, sl, tl, engine) {
  if (!text || !text.trim()) return "";
  if (sl === tl && sl !== "auto") return text;

  const eng = engine || "google";
  const key = `${eng}:${sl}:${tl}:${text.substring(0, 200)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  let result;
  if (eng === "bing") {
    result = await translateBing(text, sl, tl);
  } else {
    result = await translateGoogle(text, sl, tl);
  }

  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(key, result);
  return result;
}

function isBlacklisted(url, blacklist) {
  if (!blacklist || !blacklist.length) return false;
  try {
    const host = new URL(url).hostname;
    return blacklist.some((pattern) => {
      if (pattern.startsWith("*.")) {
        return host === pattern.slice(2) || host.endsWith(pattern.slice(1));
      }
      return host === pattern || host.endsWith("." + pattern);
    });
  } catch {
    return false;
  }
}

async function updateContextMenus() {
  await chrome.contextMenus.removeAll();
  const settings = await getSettings();
  if (!settings.enContext) return;
  chrome.contextMenus.create({ id: "tr-page", title: "Translate this page", contexts: ["page"] });
  chrome.contextMenus.create({ id: "tr-sep", type: "separator", contexts: ["selection"] });
  LANGS.filter((l) => l.code !== "auto").forEach((l) => {
    chrome.contextMenus.create({ id: `tr-to-${l.code}`, title: `Translate to ${l.name}`, contexts: ["selection"] });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  updateContextMenus();
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "tr-page") {
    const settings = await getSettings();
    if (isBlacklisted(tab.url, settings.blacklist)) {
      chrome.tabs.sendMessage(tab.id, { action: "show-toast", msg: "This site is in the blacklist" });
      return;
    }
    chrome.tabs.sendMessage(tab.id, { action: "page-translate" });
    return;
  }
  if (info.menuItemId.startsWith("tr-to-") && info.selectionText) {
    const tl = info.menuItemId.replace("tr-to-", "");
    const settings = await getSettings();
    try {
      const r = await translate(info.selectionText.trim(), "auto", tl, settings.selEngine || "google");
      chrome.tabs.sendMessage(tab.id, { action: "showTranslation", text: info.selectionText, result: r, tl });
    } catch {}
  }
});

chrome.runtime.onMessage.addListener((req, sender, respond) => {
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
      updateContextMenus();
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

  if (req.action === "checkBlacklist") {
    getSettings().then((s) => {
      respond({ blacklisted: isBlacklisted(req.url || "", s.blacklist || []) });
    });
    return true;
  }

  if (req.action === "addBlacklist") {
    getSettings().then(async (s) => {
      const bl = s.blacklist || [];
      if (!bl.includes(req.host)) {
        bl.push(req.host);
        s.blacklist = bl;
        await chrome.storage.local.set({ settings: s });
      }
      respond({ success: true, blacklist: bl });
    });
    return true;
  }

  if (req.action === "removeBlacklist") {
    getSettings().then(async (s) => {
      s.blacklist = (s.blacklist || []).filter((h) => h !== req.host);
      await chrome.storage.local.set({ settings: s });
      respond({ success: true, blacklist: s.blacklist });
    });
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
      rulesLastFetch = 0;
      cachedMerged = null;
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
});

initRules();
