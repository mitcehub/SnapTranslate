import { LANG_CODES, ENGINES, getBrowserLang } from '../shared/constants.js';

const EN_LANG_NAMES = {
  auto: "Detect Language", "zh-CN": "Chinese (Simplified)", "zh-TW": "Chinese (Traditional)",
  en: "English", ja: "Japanese", ko: "Korean", fr: "French", de: "German",
  es: "Spanish", pt: "Portuguese", ru: "Russian", ar: "Arabic", th: "Thai",
  vi: "Vietnamese", id: "Indonesian", it: "Italian", nl: "Dutch", pl: "Polish",
  tr: "Turkish", hi: "Hindi",
};

export const LANGS = LANG_CODES.map((code) => ({ code, name: EN_LANG_NAMES[code] || code }));
export { ENGINES };

const DEF = {
  selTL: getBrowserLang(),
  inputSL: "auto",
  inputTL: getBrowserLang(),
  pgTL: getBrowserLang(),
  enSel: true,
  enInput: true,
  enPage: true,
  enFloat: true,
  autoTranslate: true,
  ignLangs: [],
  selEngine: "google",
  inputEngine: "google",
  pgEngine: "google",
  blacklist: [],
  autoWhitelist: [],
  rulesUrl: "",
  allowRemoteTTS: true,
};

export async function getSettings() {
  const r = await chrome.storage.local.get(["settings"]);
  return { ...DEF, ...(r.settings || {}) };
}
