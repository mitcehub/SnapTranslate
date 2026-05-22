(function () {
  'use strict';

  const LANG_CODES = [
    "auto", "zh-CN", "zh-TW", "en", "ja", "ko", "fr", "de", "es",
    "pt", "ru", "ar", "th", "vi", "id", "it", "nl", "pl", "tr", "hi",
  ];

  function escHtml(s) {
    if (s == null) return "";
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function makeLangNames(names) {
    return LANG_CODES.map((code) => ({ code, name: names[code] || code }));
  }

  const LANGS = makeLangNames({
    "zh-CN": "中文(简体)", "zh-TW": "中文(繁体)",
    en: "English", ja: "日本語", ko: "한국어", fr: "Français",
    de: "Deutsch", es: "Español", pt: "Português", ru: "Русский",
    ar: "العربية", th: "ไทย", vi: "Tiếng Việt", id: "Indonesia",
    it: "Italiano", nl: "Nederlands", pl: "Polski", tr: "Türkçe", hi: "हिन्दी",
  });

  const I18N = {
    en: {
      langSettings: "Language Settings",
      selTargetLang: "Selection Target Language",
      selTargetLangDesc: "Target language for selected text translation",
      inputTargetLang: "Input Translation Target",
      inputTargetLangDesc: "Target language for input box translation",
      pageTargetLang: "Page Translation Target",
      pageTargetLangDesc: "Target language for full page translation",
      pgTargetLang: "Page Target Language",
      pgTargetLangDesc: "Target language for page translation",
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
      enableContext: "Enable Context Menu",
      enableContextDesc: "Show translate options in right-click menu",
      autoTranslate: "Auto Translate",
      autoTranslateDesc: "Automatically translate when visiting supported sites",
      blacklistTitle: "Page Translation Blacklist",
      blacklistDesc: "Sites in this list will not be auto-translated. Selection translation still works.",
      blacklistPlaceholder: "e.g. example.com or *.example.com",
      autoBlacklistTitle: "Auto-Translate Blacklist",
      autoBlacklistDesc: "Sites in this list will not auto-translate, but manual translation still works.",
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
      pgTargetLang: "网页目标语言",
      pgTargetLangDesc: "网页翻译的目标语言",
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
      enableContext: "启用右键菜单",
      enableContextDesc: "在右键菜单中显示翻译选项",
      autoTranslate: "自动翻译",
      autoTranslateDesc: "访问支持的网站时自动翻译",
      blacklistTitle: "网页翻译黑名单",
      blacklistDesc: "黑名单中的网站不会自动翻译整页，划词翻译仍可正常使用",
      blacklistPlaceholder: "例如 example.com 或 *.example.com",
      autoBlacklistTitle: "自动翻译黑名单",
      autoBlacklistDesc: "此列表中的网站不会自动翻译，但手动翻译仍可正常使用",
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
      pgTargetLang: "ページ翻訳先言語",
      pgTargetLangDesc: "ページ翻訳の対象言語",
      featureSettings: "機能設定",
      enableSelTrans: "選択翻訳を有効にする",
      enableSelTransDesc: "テキスト選択時に翻訳ボタンを表示",
      enableInputTrans: "入力翻訳を有効にする",
      enableInputTransDesc: "入力ボックスに翻訳ボタンを表示",
      ignoreLangs: "除外言語",
      ignoreLangsDesc: "これらの言語のテキストは翻訳しません",
      enablePageTrans: "ページ翻訳を有効にする",
      enablePageTransDesc: "ルールに一致するページを自動翻訳",
      enableFloatBtn: "フローティングボタンを有効にする",
      enableFloatBtnDesc: "対応ページにフローティングボタンを表示",
      enableContext: "コンテキストメニューを有効にする",
      enableContextDesc: "右クリックメニューに翻訳オプションを表示",
      autoTranslate: "自動翻訳",
      autoTranslateDesc: "対応サイト訪問時に自動翻訳",
      blacklistTitle: "ページ翻訳ブラックリスト",
      blacklistDesc: "ブラックリストのサイトはページ翻訳されません。選択翻訳は引き続き使用できます",
      blacklistPlaceholder: "例: example.com または *.example.com",
      autoBlacklistTitle: "自動翻訳ブラックリスト",
      autoBlacklistDesc: "このリストのサイトは自動翻訳されませんが、手動翻訳は引き続き使用できます",
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
      pgTargetLang: "페이지 번역 대상 언어",
      pgTargetLangDesc: "페이지 번역의 대상 언어",
      featureSettings: "기능 설정",
      enableSelTrans: "선택 번역 활성화",
      enableSelTransDesc: "텍스트 선택 시 번역 버튼 표시",
      enableInputTrans: "입력 번역 활성화",
      enableInputTransDesc: "입력 상자에 번역 버튼 표시",
      ignoreLangs: "제외 언어",
      ignoreLangsDesc: "이 언어의 텍스트는 번역하지 않습니다",
      enablePageTrans: "페이지 번역 활성화",
      enablePageTransDesc: "규칙에 일치하는 페이지 자동 번역",
      enableFloatBtn: "플로팅 버튼 활성화",
      enableFloatBtnDesc: "지원 페이지에 플로팅 버튼 표시",
      enableContext: "컨텍스트 메뉴 활성화",
      enableContextDesc: "우클릭 메뉴에 번역 옵션 표시",
      autoTranslate: "자동 번역",
      autoTranslateDesc: "지원 사이트 방문 시 자동 번역",
      blacklistTitle: "페이지 번역 블랙리스트",
      blacklistDesc: "블랙리스트의 사이트는 페이지 번역이 제한됩니다. 선택 번역은 계속 사용 가능합니다",
      blacklistPlaceholder: "예: example.com 또는 *.example.com",
      autoBlacklistTitle: "자동 번역 블랙리스트",
      autoBlacklistDesc: "이 목록의 사이트는 자동 번역되지 않지만 수동 번역은 계속 사용 가능합니다",
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

  function renderRulesList(rules) {
    const container = document.getElementById("rulesList");
    if (!container) return;
    container.innerHTML = "";
    if (!rules || !rules.length) {
      const empty = document.createElement("div");
      empty.style.cssText = "color:#9ca3af;font-size:12px;padding:8px 0;";
      empty.textContent = "No rules loaded";
      container.appendChild(empty);
      return;
    }
    const list = document.createElement("div");
    list.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;padding-top:8px;";
    rules.forEach((rule) => {
      const chip = document.createElement("div");
      chip.style.cssText = "display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border:1px solid #e2e8f0;border-radius:14px;font-size:11px;color:#475569;background:#f8fafc;";
      const autoTag = rule.autoTranslate ? '<span style="color:#059669;font-weight:600;">Auto</span>' : '<span style="color:#9ca3af;">Manual</span>';
      chip.innerHTML = `<span style="font-weight:500;">${escHtml(rule.name)}</span>${autoTag}<span style="color:#94a3b8;">${escHtml(rule.urlPattern)}</span>`;
      list.appendChild(chip);
    });
    container.appendChild(list);
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
    } catch { }

    populateSelect("selTL", settings.selTL || "en");
    populateSelect("inputTL", settings.inputTL || "en");
    populateSelect("pgTL", settings.pgTL || "en");

    setEngineSelect("selEngine", settings.selEngine || "google");
    setEngineSelect("inputEngine", settings.inputEngine || "google");
    setEngineSelect("pgEngine", settings.pgEngine || "google");

    document.getElementById("enSel").checked = settings.enSel !== false;
    document.getElementById("enInput").checked = settings.enInput !== false;
    document.getElementById("enPage").checked = settings.enPage !== false;
    document.getElementById("enFloat").checked = settings.enFloat !== false;
    document.getElementById("autoTranslate").checked = settings.autoTranslate === true;

    renderIgnLangs(settings.ignLangs || [], (newIgnLangs) => {
      settings.ignLangs = newIgnLangs;
      save();
    });

    const rulesUrlInput = document.getElementById("rulesUrl");
    if (rulesUrlInput) rulesUrlInput.value = settings.rulesUrl || "";

    const blacklistText = document.getElementById("blacklistText");
    if (blacklistText) {
      blacklistText.value = (settings.blacklist || []).join('\n');
      blacklistText.addEventListener("input", () => {
        settings.blacklist = blacklistText.value.split('\n').map(s => s.trim()).filter(Boolean);
        save();
      });
    }

    const addChineseSitesBtn = document.getElementById("addChineseSitesBtn");
    const chineseSitesStatus = document.getElementById("chineseSitesStatus");
    if (addChineseSitesBtn && blacklistText) {
      addChineseSitesBtn.addEventListener("click", () => {
        const lines = blacklistText.value.split('\n').map(s => s.trim());
        if (lines.some(l => l === 'chinese-sites.txt' || l === '@import chinese-sites.txt')) {
          chineseSitesStatus.textContent = "已存在";
          chineseSitesStatus.style.color = "#f59e0b";
          return;
        }
        lines.push('chinese-sites.txt');
        blacklistText.value = lines.join('\n');
        settings.blacklist = lines.filter(Boolean);
        save();
        chineseSitesStatus.textContent = "已添加，正在验证...";
        chineseSitesStatus.style.color = "#6366f1";
        chrome.runtime.sendMessage({ action: "expandBlacklist" }, (r) => {
          if (r?.count) {
            chineseSitesStatus.textContent = `✓ 已加载 ${r.count} 个域名`;
            chineseSitesStatus.style.color = "#22c55e";
          } else {
            chineseSitesStatus.textContent = "加载失败，请检查网络";
            chineseSitesStatus.style.color = "#ef4444";
          }
        });
      });
    }

    const autoBlacklistText = document.getElementById("autoBlacklistText");
    if (autoBlacklistText) {
      autoBlacklistText.value = (settings.autoBlacklist || []).join('\n');
      autoBlacklistText.addEventListener("input", () => {
        settings.autoBlacklist = autoBlacklistText.value.split('\n').map(s => s.trim()).filter(Boolean);
        save();
      });
    }

    function save() {
      const newSettings = {
        selTL: document.getElementById("selTL").value,
        inputTL: document.getElementById("inputTL").value,
        pgTL: document.getElementById("pgTL")?.value || "en",
        selEngine: document.getElementById("selEngine").value,
        inputEngine: document.getElementById("inputEngine").value,
        pgEngine: document.getElementById("pgEngine")?.value || "google",
        enSel: document.getElementById("enSel").checked,
        enInput: document.getElementById("enInput").checked,
        enPage: document.getElementById("enPage")?.checked ?? true,
        enFloat: document.getElementById("enFloat")?.checked ?? true,
        autoTranslate: document.getElementById("autoTranslate")?.checked ?? false,
        ignLangs: settings.ignLangs || [],
        blacklist: settings.blacklist || [],
        autoBlacklist: settings.autoBlacklist || [],
        rulesUrl: document.getElementById("rulesUrl")?.value || "",
      };
      chrome.runtime.sendMessage({ action: "saveSettings", settings: newSettings });
    }

    ["selTL", "inputTL", "pgTL"].forEach((id) => {
      document.getElementById(id)?.addEventListener("change", save);
    });
    ["selEngine", "inputEngine", "pgEngine"].forEach((id) => {
      document.getElementById(id)?.addEventListener("change", save);
    });
    ["enSel", "enInput", "enPage", "enFloat", "autoTranslate"].forEach((id) => {
      document.getElementById(id)?.addEventListener("change", save);
    });

    document.getElementById("testSelEngine").addEventListener("click", () => testEngine("testSelEngine", "selEngine"));
    document.getElementById("testInputEngine").addEventListener("click", () => testEngine("testInputEngine", "inputEngine"));
    document.getElementById("testPgEngine")?.addEventListener("click", () => testEngine("testPgEngine", "pgEngine"));

    if (rulesUrlInput) {
      rulesUrlInput.addEventListener("change", save);
    }

    document.getElementById("refreshRulesBtn")?.addEventListener("click", () => {
      const btn = document.getElementById("refreshRulesBtn");
      const lang = getUILang();
      const strings = I18N[lang] || I18N.en;
      btn.disabled = true;
      btn.textContent = "...";
      chrome.runtime.sendMessage({ action: "refreshRules" }, (r) => {
        btn.disabled = false;
        if (r && r.rules) {
          btn.textContent = "OK ✓";
          renderRulesList(r.rules);
        } else {
          btn.textContent = "Fail ✗";
        }
        setTimeout(() => { btn.textContent = strings.refreshRulesBtn || "Refresh"; }, 3000);
      });
    });
  }

  initSettingsUI();

  document.getElementById("checkUpdateBtn")?.addEventListener("click", () => {
    const btn = document.getElementById("checkUpdateBtn");
    const status = document.getElementById("updateStatus");
    btn.disabled = true;
    status.textContent = "检查中...";
    chrome.runtime.sendMessage({ action: "checkUpdate" }, (r) => {
      btn.disabled = false;
      if (r?.hasUpdate) {
        status.innerHTML = `发现新版本 <a href="${r.url}" target="_blank">v${r.latest}</a>（当前 v${r.current}）`;
      } else if (r?.error) {
        status.textContent = "检查失败: " + r.error;
      } else {
        status.textContent = "已是最新版本 v" + r?.current;
      }
    });
  });

  (function () {
    var btns = document.querySelectorAll('.tab-btn');
    var contents = document.querySelectorAll('.tab-content');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('tab-active'); });
        contents.forEach(function (c) { c.classList.remove('tab-content-active'); });
        btn.classList.add('tab-active');
        var target = document.getElementById('tab-' + btn.getAttribute('data-tab'));
        if (target) target.classList.add('tab-content-active');
      });
    });
  })();

})();
