import { BROWSER_LANG_MAP, getBrowserLang } from '../shared/constants.js';

export const LANGS = [
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

export const ENGINES = [
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

export async function getSettings() {
  const r = await chrome.storage.local.get(["settings"]);
  return { ...DEF, ...(r.settings || {}) };
}
