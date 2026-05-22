import { LANGS, I18N, getUILang, applyI18N } from './i18n.js';
import { escHtml } from '../shared/constants.js';

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

function renderBlacklist(blacklist, saveFn) {
  const container = document.getElementById("blacklistContainer");
  if (!container) return;
  container.innerHTML = "";
  if (!blacklist || !blacklist.length) {
    const empty = document.createElement("div");
    empty.className = "blacklist-empty";
    empty.textContent = "No sites in blacklist";
    empty.style.cssText = "color:#9ca3af;font-size:12px;padding:8px 0;";
    container.appendChild(empty);
    return;
  }
  const list = document.createElement("div");
  list.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;";
  blacklist.forEach((host) => {
    const chip = document.createElement("div");
    chip.className = "blacklist-chip";
    chip.style.cssText = "display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border:1px solid #fecaca;border-radius:14px;font-size:11px;color:#dc2626;background:#fef2f2;";
    chip.innerHTML = `<span>${escHtml(host)}</span><button class="remove" style="border:none;background:none;color:#dc2626;cursor:pointer;font-size:14px;line-height:1;padding:0 2px;">&times;</button>`;
    chip.querySelector(".remove").addEventListener("click", () => {
      const updated = blacklist.filter((h) => h !== host);
      saveFn(updated);
    });
    list.appendChild(chip);
  });
  container.appendChild(list);
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

function renderAutoBlacklist(autoBlacklist, saveFn) {
  const container = document.getElementById("autoBlacklistContainer");
  if (!container) return;
  container.innerHTML = "";
  if (!autoBlacklist || !autoBlacklist.length) {
    const empty = document.createElement("div");
    empty.className = "blacklist-empty";
    empty.textContent = "No sites in blacklist";
    empty.style.cssText = "color:#9ca3af;font-size:12px;padding:8px 0;";
    container.appendChild(empty);
    return;
  }
  const list = document.createElement("div");
  list.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;";
  autoBlacklist.forEach((host) => {
    const chip = document.createElement("div");
    chip.style.cssText = "display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border:1px solid #e2e8f0;border-radius:14px;font-size:11px;color:#475569;background:#f8fafc;";
    chip.innerHTML = `<span>${escHtml(host)}</span><button class="remove" style="border:none;background:none;color:#6b7280;cursor:pointer;font-size:14px;line-height:1;padding:0 2px;">&times;</button>`;
    chip.querySelector(".remove").addEventListener("click", () => {
      const updated = autoBlacklist.filter((h) => h !== host);
      saveFn(updated);
    });
    list.appendChild(chip);
  });
  container.appendChild(list);
}

export async function initSettingsUI() {
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
