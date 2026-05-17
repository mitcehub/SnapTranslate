const OPTIONS_LANGS = (function() {
  const names = {
    "zh-CN": "中文(简体)", "zh-TW": "中文(繁体)",
    en: "English", ja: "日本語", ko: "한국어", fr: "Français",
    de: "Deutsch", es: "Español", pt: "Português", ru: "Русский",
    ar: "العربية", th: "ไทย", vi: "Tiếng Việt", id: "Indonesia",
    it: "Italiano", nl: "Nederlands", pl: "Polski", tr: "Türkçe", hi: "हिन्दी",
  };
  return LANG_CODES.map((code) => ({ code, name: names[code] || code }));
})();

const I18N = {
  en: {
    langSettings: "Language Settings",
    selTargetLang: "Selection Target Language",
    selTargetLangDesc: "Target language for selected text translation",
    inputTargetLang: "Input Translation Target",
    inputTargetLangDesc: "Target language for input box translation",
    pageTargetLang: "Page Translation Target",
    pageTargetLangDesc: "Target language for full page translation",
    featureSettings: "Feature Settings",
    enableSelTrans: "Enable Selection Translation",
    enableSelTransDesc: "Show translate button on text selection",
    enableInputTrans: "Enable Input Translation",
    enableInputTransDesc: "Show translate button in input boxes",
    ignoreLangs: "Exclude Languages",
    ignoreLangsDesc: "Skip translation for these languages",
    enablePageTrans: "Enable Page Translation",
    enablePageTransDesc: "Auto-translate pages matching rules",
    enableFloatBtn: "Enable Float Button",
    enableFloatBtnDesc: "Show floating button on supported pages",
    autoTranslate: "Auto Translate",
    autoTranslateDesc: "Automatically translate when visiting supported sites",
    blacklistTitle: "Page Translation Blacklist",
    blacklistDesc: "Sites in this list will not be auto-translated.",
    blacklistPlaceholder: "e.g. example.com or *.example.com",
    addBtn: "Add",
    emptyBlacklist: "No sites in blacklist",
    tabGeneral: "General",
    tabPage: "Page Translation",
    tabSelection: "Selection",
    tabInput: "Input",
    engineLabel: "Translation Engine",
    engineDesc: "Select translation service provider",
    testBtn: "Test",
    testSuccess: "✓",
    testFail: "✗",
    rulesTitle: "Site Rules",
    rulesUrlLabel: "Remote Rules URL",
    rulesUrlDesc: "Load rules from a remote JSON file. Leave empty for built-in.",
    refreshRulesBtn: "Refresh Rules",
    refreshRulesSuccess: "Rules updated ✓",
    refreshRulesFail: "Failed to fetch rules",
    optionsTitle: "EZ-Translate Settings",
    closeBtn: "Close",
  },
  "zh-CN": {
    langSettings: "语言设置",
    selTargetLang: "划词翻译目标语言",
    selTargetLangDesc: "选中文本翻译的目标语言",
    inputTargetLang: "输入框翻译目标语言",
    inputTargetLangDesc: "输入框中翻译的目标语言",
    pageTargetLang: "网页翻译目标语言",
    pageTargetLangDesc: "整页翻译的目标语言",
    featureSettings: "功能设置",
    enableSelTrans: "启用划词翻译",
    enableSelTransDesc: "选中文本时显示翻译按钮",
    enableInputTrans: "启用输入框翻译",
    enableInputTransDesc: "在输入框中显示翻译按钮",
    ignoreLangs: "排除语言",
    ignoreLangsDesc: "不翻译这些语言的文本",
    enablePageTrans: "启用网页翻译",
    enablePageTransDesc: "自动翻译匹配规则的网页",
    enableFloatBtn: "启用悬浮按钮",
    enableFloatBtnDesc: "在支持的页面上显示悬浮按钮",
    autoTranslate: "自动翻译",
    autoTranslateDesc: "访问支持的网站时自动翻译",
    blacklistTitle: "网页翻译黑名单",
    blacklistDesc: "黑名单中的网站不会自动翻译整页",
    blacklistPlaceholder: "例如 example.com 或 *.example.com",
    addBtn: "添加",
    emptyBlacklist: "暂无黑名单网站",
    tabGeneral: "通用",
    tabPage: "网页翻译",
    tabSelection: "划词翻译",
    tabInput: "输入框",
    engineLabel: "翻译引擎",
    engineDesc: "选择翻译服务提供商",
    testBtn: "测试",
    testSuccess: "✓",
    testFail: "✗",
    rulesTitle: "网站规则",
    rulesUrlLabel: "远程规则 URL",
    rulesUrlDesc: "从远程 JSON 文件加载规则。留空则使用内置规则。",
    refreshRulesBtn: "刷新规则",
    refreshRulesSuccess: "规则已更新 ✓",
    refreshRulesFail: "获取规则失败",
    optionsTitle: "EZ-Translate 设置",
    closeBtn: "关闭",
  },
};

function getUILang() {
  const nav = navigator.language || "en";
  const lower = nav.toLowerCase();
  if (I18N[lower]) return lower;
  const prefix = lower.split("-")[0];
  if (I18N[prefix]) return prefix;
  for (const key of Object.keys(I18N)) {
    if (key.toLowerCase().startsWith(prefix)) return key;
  }
  return "en";
}

function t(key) {
  const lang = getUILang();
  const strings = I18N[lang] || I18N.en;
  return strings[key] || key;
}
