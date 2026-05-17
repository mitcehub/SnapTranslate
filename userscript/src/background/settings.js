const EN_LANG_NAMES = {
  auto: "Detect Language", "zh-CN": "Chinese (Simplified)", "zh-TW": "Chinese (Traditional)",
  en: "English", ja: "Japanese", ko: "Korean", fr: "French", de: "German",
  es: "Spanish", pt: "Portuguese", ru: "Russian", ar: "Arabic", th: "Thai",
  vi: "Vietnamese", id: "Indonesian", it: "Italian", nl: "Dutch", pl: "Polish",
  tr: "Turkish", hi: "Hindi",
};

const SETTINGS_LANGS = LANG_CODES.map((code) => ({ code, name: EN_LANG_NAMES[code] || code }));

const DEF = {
  selTL: getBrowserLang(),
  inputSL: "auto",
  inputTL: "en",
  pgTL: getBrowserLang(),
  enSel: true,
  enInput: true,
  enPage: true,
  enFloat: true,
  autoTranslate: false,
  ignLangs: [],
  selEngine: "google",
  inputEngine: "google",
  pgEngine: "google",
  blacklist: [],
  rulesUrl: "",
  allowRemoteTTS: false,
};

async function getSettings() {
  let stored = null;
  if (typeof GM_getValue !== 'undefined') {
    try {
      const raw = GM_getValue('settings');
      if (raw) stored = JSON.parse(raw);
    } catch {}
  }
  return { ...DEF, ...(stored || {}) };
}

async function saveSettings(settings) {
  if (typeof GM_setValue !== 'undefined') {
    GM_setValue('settings', JSON.stringify(settings));
  }
}
