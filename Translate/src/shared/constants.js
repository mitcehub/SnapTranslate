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
  if (!text) return null;
  const stripped = text.replace(/[\s\d!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~\u00A0-\u00BF\u2000-\u206F\u3000-\u303F]/g, '');
  const total = stripped.length;
  if (total < 2) return null;

  const zh = (stripped.match(/[\u4e00-\u9fff]/g) || []).length;
  const ja = (stripped.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
  const ko = (stripped.match(/[\uac00-\ud7af]/g) || []).length;
  const ru = (stripped.match(/[\u0400-\u04ff]/g) || []).length;
  const ar = (stripped.match(/[\u0600-\u06ff]/g) || []).length;
  const th = (stripped.match(/[\u0e00-\u0e7f]/g) || []).length;
  const vi = (stripped.match(/[\u0100-\u01ef\u0300-\u033f]/g) || []).length;
  const hi = (stripped.match(/[\u0900-\u097f]/g) || []).length;
  const en = (stripped.match(/[a-zA-Z]/g) || []).length;

  if (ko / total > 0.1) return "ko";
  if (ja / total > 0.1) return "ja";
  if (zh * 2.5 / total > 0.5) return "zh-CN";
  if (ru > total * 0.4) return "ru";
  if (ar > total * 0.4) return "ar";
  if (th > total * 0.4) return "th";
  if (vi > total * 0.4) return "vi";
  if (hi > total * 0.4) return "hi";
  if (en > total * 0.3) return "en";
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

export function isBlacklisted(hostname, blacklist) {
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

export function sendMessage(msg) {
  return chrome.runtime.sendMessage(msg);
}
