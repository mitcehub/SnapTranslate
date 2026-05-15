(function () {
  'use strict';

  const LANGS = [
    { code: "zh-CN", name: "中文(简体)" },
    { code: "zh-TW", name: "中文(繁体)" },
    { code: "en", name: "English" },
    { code: "ja", name: "日本語" },
    { code: "ko", name: "한국어" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "es", name: "Español" },
    { code: "pt", name: "Português" },
    { code: "ru", name: "Русский" },
    { code: "ar", name: "العربية" },
    { code: "th", name: "ไทย" },
    { code: "vi", name: "Tiếng Việt" },
    { code: "id", name: "Indonesia" },
    { code: "it", name: "Italiano" },
    { code: "nl", name: "Nederlands" },
    { code: "pl", name: "Polski" },
    { code: "tr", name: "Türkçe" },
    { code: "hi", name: "हिन्दी" },
  ];

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
      enableFloatBtn: "Enable Floating Button",
      enableFloatBtnDesc: "Show floating translate button on pages",
      enableContext: "Enable Context Menu",
      enableContextDesc: "Show translate options in right-click menu",
      blacklistTitle: "Page Translation Blacklist",
      blacklistDesc: "Sites in this list will not be auto-translated. Selection translation still works.",
      blacklistPlaceholder: "e.g. example.com or *.example.com",
      addBtn: "Add",
      emptyBlacklist: "No sites in blacklist",
      tabGeneral: "General",
      tabPage: "Page Translation",
      tabSelection: "Selection Translation",
      tabInput: "Input Translation",
      engineLabel: "Translation Engine",
      engineDesc: "Select translation service provider",
      testBtn: "Test",
      testSuccess: "✓",
      testFail: "✗",
      rulesTitle: "Site Rules",
      rulesUrlLabel: "Remote Rules URL",
      rulesUrlDesc: "Load site-specific translation rules from a remote JSON file (GitHub raw URL recommended). Leave empty to use built-in rules.",
      refreshRulesBtn: "Refresh Rules",
      refreshRulesSuccess: "Rules updated ✓",
      refreshRulesFail: "Failed to fetch rules",
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
      enableFloatBtn: "启用浮动按钮",
      enableFloatBtnDesc: "在页面上显示浮动翻译按钮",
      enableContext: "启用右键菜单",
      enableContextDesc: "在右键菜单中显示翻译选项",
      blacklistTitle: "网页翻译黑名单",
      blacklistDesc: "黑名单中的网站不会自动翻译整页，划词翻译仍可正常使用",
      blacklistPlaceholder: "例如 example.com 或 *.example.com",
      addBtn: "添加",
      emptyBlacklist: "暂无黑名单网站",
      tabGeneral: "通用",
      tabPage: "网页翻译",
      tabSelection: "划词翻译",
      tabInput: "输入框翻译",
      engineLabel: "翻译引擎",
      engineDesc: "选择翻译服务提供商",
      testBtn: "测试",
      testSuccess: "✓",
      testFail: "✗",
      rulesTitle: "网站规则",
      rulesUrlLabel: "远程规则 URL",
      rulesUrlDesc: "从远程 JSON 文件加载网站特定翻译规则（推荐 GitHub raw URL）。留空则使用内置规则。",
      refreshRulesBtn: "刷新规则",
      refreshRulesSuccess: "规则已更新 ✓",
      refreshRulesFail: "获取规则失败",
    },
    ja: {
      langSettings: "言語設定",
      selTargetLang: "選択テキストの翻訳先言語",
      selTargetLangDesc: "選択したテキストの翻訳先言語",
      inputTargetLang: "入力ボックス翻訳先言語",
      inputTargetLangDesc: "入力ボックスの翻訳先言語",
      pageTargetLang: "ページ翻訳先言語",
      pageTargetLangDesc: "ページ全体の翻訳先言語",
      featureSettings: "機能設定",
      enableSelTrans: "選択翻訳を有効にする",
      enableSelTransDesc: "テキスト選択時に翻訳ボタンを表示",
      enableInputTrans: "入力翻訳を有効にする",
      enableInputTransDesc: "入力ボックスに翻訳ボタンを表示",
      ignoreLangs: "除外言語",
      ignoreLangsDesc: "これらの言語のテキストは翻訳しません",
      enableFloatBtn: "フローティングボタンを有効にする",
      enableFloatBtnDesc: "ページにフローティング翻訳ボタンを表示",
      enableContext: "コンテキストメニューを有効にする",
      enableContextDesc: "右クリックメニューに翻訳オプションを表示",
      blacklistTitle: "ページ翻訳ブラックリスト",
      blacklistDesc: "ブラックリストのサイトはページ翻訳されません。選択翻訳は引き続き使用できます",
      blacklistPlaceholder: "例: example.com または *.example.com",
      addBtn: "追加",
      emptyBlacklist: "ブラックリストにサイトがありません",
      tabGeneral: "一般",
      tabPage: "ページ翻訳",
      tabSelection: "選択翻訳",
      tabInput: "入力翻訳",
      engineLabel: "翻訳エンジン",
      engineDesc: "翻訳サービスプロバイダーを選択",
      testBtn: "テスト",
      testSuccess: "✓",
      testFail: "✗",
      rulesTitle: "サイトルール",
      rulesUrlLabel: "リモートルール URL",
      rulesUrlDesc: "リモート JSON ファイルからサイト固有の翻訳ルールを読み込みます（GitHub raw URL 推奨）。空欄の場合は組み込みルールを使用します。",
      refreshRulesBtn: "ルールを更新",
      refreshRulesSuccess: "ルールを更新しました ✓",
      refreshRulesFail: "ルールの取得に失敗しました",
    },
    ko: {
      langSettings: "언어 설정",
      selTargetLang: "선택 텍스트 번역 대상 언어",
      selTargetLangDesc: "선택한 텍스트의 번역 대상 언어",
      inputTargetLang: "입력 상자 번역 대상 언어",
      inputTargetLangDesc: "입력 상자 번역의 대상 언어",
      pageTargetLang: "페이지 번역 대상 언어",
      pageTargetLangDesc: "전체 페이지 번역의 대상 언어",
      featureSettings: "기능 설정",
      enableSelTrans: "선택 번역 활성화",
      enableSelTransDesc: "텍스트 선택 시 번역 버튼 표시",
      enableInputTrans: "입력 번역 활성화",
      enableInputTransDesc: "입력 상자에 번역 버튼 표시",
      ignoreLangs: "제외 언어",
      ignoreLangsDesc: "이 언어의 텍스트는 번역하지 않습니다",
      enableFloatBtn: "플로팅 버튼 활성화",
      enableFloatBtnDesc: "페이지에 플로팅 번역 버튼 표시",
      enableContext: "컨텍스트 메뉴 활성화",
      enableContextDesc: "우클릭 메뉴에 번역 옵션 표시",
      blacklistTitle: "페이지 번역 블랙리스트",
      blacklistDesc: "블랙리스트의 사이트는 페이지 번역이 제한됩니다. 선택 번역은 계속 사용 가능합니다",
      blacklistPlaceholder: "예: example.com 또는 *.example.com",
      addBtn: "추가",
      emptyBlacklist: "블랙리스트에 사이트가 없습니다",
      tabGeneral: "일반",
      tabPage: "페이지 번역",
      tabSelection: "선택 번역",
      tabInput: "입력 번역",
      engineLabel: "번역 엔진",
      engineDesc: "번역 서비스 제공업체 선택",
      testBtn: "테스트",
      testSuccess: "✓",
      testFail: "✗",
      rulesTitle: "사이트 규칙",
      rulesUrlLabel: "원격 규칙 URL",
      rulesUrlDesc: "원격 JSON 파일에서 사이트별 번역 규칙을 로드합니다 (GitHub raw URL 권장). 비워두면 기본 규칙이 사용됩니다.",
      refreshRulesBtn: "규칙 새로고침",
      refreshRulesSuccess: "규칙 업데이트됨 ✓",
      refreshRulesFail: "규칙 가져오기 실패",
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

  function applyI18N() {
    const lang = getUILang();
    const strings = I18N[lang] || I18N.en;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (strings[key]) el.textContent = strings[key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (strings[key]) el.placeholder = strings[key];
    });
    document.documentElement.lang = lang;
  }

  function populateSelect(id, selected) {
    const sel = document.getElementById(id);
    if (!sel) return;
    LANGS.forEach((l) => {
      const opt = document.createElement("option");
      opt.value = l.code;
      opt.textContent = l.name;
      if (l.code === selected) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function setEngineSelect(id, selected) {
    const sel = document.getElementById(id);
    if (!sel) return;
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === selected) {
        sel.selectedIndex = i;
        break;
      }
    }
  }

  const IGN_LANG_OPTIONS = [
    { code: "zh-CN", label: "中文" },
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
    { code: "ko", label: "한국어" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "es", label: "Español" },
    { code: "ru", label: "Русский" },
  ];

  function renderIgnLangs(ignLangs, onChange) {
    const container = document.getElementById("ignLangsContainer");
    if (!container) return;
    container.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;";
    IGN_LANG_OPTIONS.forEach((l) => {
      const chip = document.createElement("label");
      chip.style.cssText = "display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border:1px solid #e2e8f0;border-radius:14px;font-size:11px;color:#475569;cursor:pointer;transition:all .15s;user-select:none;";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = l.code;
      cb.checked = ignLangs.includes(l.code);
      cb.style.cssText = "margin:0;width:12px;height:12px;accent-color:#6366f1;cursor:pointer;";
      cb.addEventListener("change", () => {
        const checked = [...wrap.querySelectorAll("input:checked")].map((i) => i.value);
        onChange(checked);
        updateChipStyle(chip, cb.checked);
      });
      chip.appendChild(cb);
      chip.appendChild(document.createTextNode(l.label));
      wrap.appendChild(chip);
      updateChipStyle(chip, cb.checked);
    });
    container.appendChild(wrap);
  }

  function updateChipStyle(chip, checked) {
    if (checked) {
      chip.style.background = "#eef2ff";
      chip.style.borderColor = "#c7d2fe";
      chip.style.color = "#4338ca";
    } else {
      chip.style.background = "#fff";
      chip.style.borderColor = "#e2e8f0";
      chip.style.color = "#475569";
    }
  }

  function testEngine(btnId, engineId) {
    const btn = document.getElementById(btnId);
    const engineSel = document.getElementById(engineId);
    if (!btn || !engineSel) return;
    const engine = engineSel.value;
    const lang = getUILang();
    const strings = I18N[lang] || I18N.en;
    btn.disabled = true;
    btn.textContent = "...";
    btn.classList.remove("test-success", "test-fail");
    chrome.runtime.sendMessage({ action: "testEngine", engine }, (r) => {
      if (r && r.success) {
        btn.textContent = strings.testSuccess;
        btn.classList.add("test-success");
      } else {
        btn.textContent = strings.testFail;
        btn.classList.add("test-fail");
      }
      btn.disabled = false;
      setTimeout(() => {
        btn.textContent = strings.testBtn;
        btn.classList.remove("test-success", "test-fail");
      }, 3000);
    });
  }

  async function initSettingsUI() {
    applyI18N();

    let settings = {};
    try {
      const r = await chrome.runtime.sendMessage({ action: "getSettings" });
      if (r && r.settings) settings = r.settings;
    } catch {}

    populateSelect("selTL", settings.selTL || "en");
    populateSelect("inputTL", settings.inputTL || "en");

    setEngineSelect("selEngine", settings.selEngine || "google");
    setEngineSelect("inputEngine", settings.inputEngine || "google");

    document.getElementById("enSel").checked = settings.enSel !== false;
    document.getElementById("enInput").checked = settings.enInput !== false;

    renderIgnLangs(settings.ignLangs || [], (newIgnLangs) => {
      settings.ignLangs = newIgnLangs;
      save();
    });

    const rulesUrlInput = document.getElementById("rulesUrl");
    if (rulesUrlInput) rulesUrlInput.value = settings.rulesUrl || "";

    function save() {
      const newSettings = {
        selTL: document.getElementById("selTL").value,
        inputTL: document.getElementById("inputTL").value,
        selEngine: document.getElementById("selEngine").value,
        inputEngine: document.getElementById("inputEngine").value,
        enSel: document.getElementById("enSel").checked,
        enInput: document.getElementById("enInput").checked,
        ignLangs: settings.ignLangs || [],
        rulesUrl: document.getElementById("rulesUrl")?.value || "",
      };
      chrome.runtime.sendMessage({ action: "saveSettings", settings: newSettings });
    }

    ["selTL", "inputTL"].forEach((id) => {
      document.getElementById(id).addEventListener("change", save);
    });
    ["selEngine", "inputEngine"].forEach((id) => {
      document.getElementById(id).addEventListener("change", save);
    });
    ["enSel", "enInput"].forEach((id) => {
      document.getElementById(id).addEventListener("change", save);
    });

    document.getElementById("testSelEngine").addEventListener("click", () => testEngine("testSelEngine", "selEngine"));
    document.getElementById("testInputEngine").addEventListener("click", () => testEngine("testInputEngine", "inputEngine"));

    if (rulesUrlInput) {
      rulesUrlInput.addEventListener("change", save);
    }

    document.getElementById("refreshRules")?.addEventListener("click", () => {
      const btn = document.getElementById("refreshRules");
      const lang = getUILang();
      const strings = I18N[lang] || I18N.en;
      btn.disabled = true;
      btn.textContent = "...";
      chrome.runtime.sendMessage({ action: "refreshRules" }, (r) => {
        btn.disabled = false;
        if (r && r.rules) {
          btn.textContent = strings.refreshRulesSuccess;
        } else {
          btn.textContent = strings.refreshRulesFail;
        }
        setTimeout(() => { btn.textContent = strings.refreshRulesBtn; }, 3000);
      });
    });
  }

  initSettingsUI();

  (function(){
    var btns=document.querySelectorAll('.tab-btn');
    var contents=document.querySelectorAll('.tab-content');
    btns.forEach(function(btn){
      btn.addEventListener('click',function(){
        btns.forEach(function(b){b.classList.remove('tab-active');});
        contents.forEach(function(c){c.classList.remove('tab-content-active');});
        btn.classList.add('tab-active');
        var target=document.getElementById('tab-'+btn.getAttribute('data-tab'));
        if(target)target.classList.add('tab-content-active');
      });
    });
  })();

})();
//# sourceMappingURL=options.js.map
