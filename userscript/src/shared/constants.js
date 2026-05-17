export const LANG_CODES = [
  "auto", "zh-CN", "zh-TW", "en", "ja", "ko", "fr", "de", "es",
  "pt", "ru", "ar", "th", "vi", "id", "it", "nl", "pl", "tr", "hi",
];

const LANG_NAMES = {
  auto: "Detect", "zh-CN": "中文(简体)", "zh-TW": "中文(繁体)",
  en: "English", ja: "日本語", ko: "한국어", fr: "Français",
  de: "Deutsch", es: "Español", pt: "Português", ru: "Русский",
  ar: "العربية", th: "ไทย", vi: "Tiếng Việt", id: "Indonesia",
  it: "Italiano", nl: "Nederlands", pl: "Polski", tr: "Türkçe", hi: "हिन्दी",
};

export const LANGS = LANG_CODES.map((code) => ({ code, name: LANG_NAMES[code] }));

export const ENGINES = [
  { id: "google", name: "Google" },
  { id: "bing", name: "Bing" },
];

export const INLINE_DISPLAYS = new Set([
  "inline", "inline-block", "inline-flex", "inline-grid",
  "inline-table", "ruby", "ruby-base", "ruby-text",
  "math", "inline-math",
]);

export const IGNORE_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "SELECT",
  "CODE", "KBD", "SVG", "MATH", "INPUT", "BUTTON",
  "IMG", "VIDEO", "AUDIO", "IFRAME", "OBJECT", "EMBED",
  "CANVAS", "MAP", "AREA", "TRACK", "WBR", "BR",
]);

export const BLOCK_TAGS = new Set([
  "DIV", "SECTION", "ARTICLE", "MAIN", "HEADER", "FOOTER",
  "ASIDE", "NAV", "DETAILS", "SUMMARY", "FIGURE", "FIGCAPTION",
  "FIELDSET", "FORM", "H1", "H2", "H3", "H4", "H5", "H6",
  "P", "BLOCKQUOTE", "PRE", "OL", "UL", "LI", "DL", "DT", "DD",
  "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TD", "TH",
  "HR", "ADDRESS",
]);

export const BROWSER_LANG_MAP = {
  "zh": "zh-CN", "zh-cn": "zh-CN", "zh-tw": "zh-TW", "zh-hk": "zh-TW",
  "en": "en", "en-us": "en", "en-gb": "en",
  "ja": "ja", "ko": "ko", "fr": "fr", "de": "de",
  "es": "es", "pt": "pt", "pt-br": "pt",
  "ru": "ru", "ar": "ar", "th": "th", "vi": "vi",
  "id": "id", "it": "it", "nl": "nl", "pl": "pl",
  "tr": "tr", "hi": "hi",
};

export const TTS_LANG_MAP = {
  "auto": "en", "zh-CN": "zh-CN", "zh-TW": "zh-TW", "en": "en",
  "ja": "ja", "ko": "ko", "fr": "fr", "de": "de", "es": "es",
  "pt": "pt", "ru": "ru", "ar": "ar", "th": "th", "vi": "vi",
  "id": "id", "it": "it", "nl": "nl", "pl": "pl", "tr": "tr", "hi": "hi",
};

export function getBrowserLang() {
  const nav = navigator.language || "en";
  const lower = nav.toLowerCase();
  if (BROWSER_LANG_MAP[lower]) return BROWSER_LANG_MAP[lower];
  const prefix = lower.split("-")[0];
  return BROWSER_LANG_MAP[prefix] || "en";
}

export function detectTextLang(text) {
  if (/[\u4e00-\u9fff]/.test(text)) {
    if (!/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return "zh-CN";
  }
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return "ja";
  if (/[\uac00-\ud7af]/.test(text)) return "ko";
  if (/[\u0400-\u04ff]/.test(text)) return "ru";
  if (/[\u0600-\u06ff]/.test(text)) return "ar";
  if (/[\u0e00-\u0e7f]/.test(text)) return "th";
  if (/[\u0100-\u01ef\u0300-\u033f]/.test(text)) return "vi";
  if (/[\u0900-\u097f]/.test(text)) return "hi";
  if (/[a-zA-Z]/.test(text)) return "en";
  return null;
}

export function escHtml(s) {
  if (s == null) return "";
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

export function isIgnored(text, ignLangs) {
  if (!ignLangs || !ignLangs.length) return false;
  const detected = detectTextLang(text);
  if (!detected) return false;
  return ignLangs.some((ign) => {
    if (ign === detected) return true;
    return ign.split("-")[0] === detected.split("-")[0];
  });
}

export function isHostBlacklisted(hostname, blacklist) {
  if (!Array.isArray(blacklist)) return false;
  return blacklist.some((pattern) => {
    if (typeof pattern !== "string") return false;
    if (pattern.startsWith("*.")) {
      const base = pattern.slice(2);
      return hostname === base || hostname.endsWith("." + base);
    }
    return hostname === pattern || hostname.endsWith("." + pattern);
  });
}

// In userscript, sendMessage directly calls the message handler
let _messageHandler = null;
export function setMessageHandler(fn) {
  _messageHandler = fn;
}
export function sendMessage(msg) {
  return new Promise((resolve) => {
    const result = _messageHandler(msg, null, (response) => {
      resolve(response);
    });
    if (typeof result === 'boolean' && !result) {
      resolve(undefined);
    }
  });
}
