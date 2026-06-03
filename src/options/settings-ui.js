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
    chip.style.cssText = "display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border:1px solid var(--border);border-radius:14px;font-size:11px;color:var(--text-secondary);cursor:pointer;transition:all .15s;user-select:none;";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = l.code;
    cb.checked = ignLangs.includes(l.code);
    cb.style.cssText = "margin:0;width:12px;height:12px;accent-color:var(--accent);cursor:pointer;";
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
    chip.style.background = "var(--accent-bg)";
    chip.style.borderColor = "var(--accent-border)";
    chip.style.color = "var(--accent)";
  } else {
    chip.style.background = "var(--bg-surface)";
    chip.style.borderColor = "var(--border)";
    chip.style.color = "var(--text-secondary)";
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
  document.getElementById("allowRemoteTTS").checked = settings.allowRemoteTTS !== false;

  renderIgnLangs(settings.ignLangs || [], (newIgnLangs) => {
    settings.ignLangs = newIgnLangs;
    save();
  });

  // Blacklist
  const blacklistText = document.getElementById("blacklistText");
  if (blacklistText) {
    blacklistText.value = (settings.blacklist || []).join('\n');
    blacklistText.addEventListener("input", () => {
      settings.blacklist = blacklistText.value.split('\n').map(s => s.trim()).filter(Boolean);
      save();
    });
  }

  // Whitelist
  const whitelistText = document.getElementById("whitelistText");
  if (whitelistText) {
    whitelistText.value = (settings.autoWhitelist || []).join('\n');
    whitelistText.addEventListener("input", () => {
      settings.autoWhitelist = whitelistText.value.split('\n').map(s => s.trim()).filter(Boolean);
      save();
    });
  }

  // Sort buttons - toggle asc/desc
  document.getElementById("sortBlacklist")?.addEventListener("click", (e) => {
    if (!settings.blacklist?.length) return;
    const btn = e.currentTarget;
    const order = btn.dataset.order === "asc" ? "desc" : "asc";
    btn.dataset.order = order;
    btn.textContent = order === "asc" ? "排序 ↑" : "排序 ↓";
    settings.blacklist = [...settings.blacklist].sort((a, b) =>
      order === "asc" ? a.localeCompare(b) : b.localeCompare(a)
    );
    blacklistText.value = settings.blacklist.join('\n');
    save();
  });

  document.getElementById("sortWhitelist")?.addEventListener("click", (e) => {
    if (!settings.autoWhitelist?.length) return;
    const btn = e.currentTarget;
    const order = btn.dataset.order === "asc" ? "desc" : "asc";
    btn.dataset.order = order;
    btn.textContent = order === "asc" ? "排序 ↑" : "排序 ↓";
    settings.autoWhitelist = [...settings.autoWhitelist].sort((a, b) =>
      order === "asc" ? a.localeCompare(b) : b.localeCompare(a)
    );
    whitelistText.value = settings.autoWhitelist.join('\n');
    save();
  });

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
      allowRemoteTTS: document.getElementById("allowRemoteTTS")?.checked ?? true,
      ignLangs: settings.ignLangs || [],
      blacklist: settings.blacklist || [],
      autoWhitelist: settings.autoWhitelist || [],
      rulesUrl: settings.rulesUrl || "",
    };
    chrome.runtime.sendMessage({ action: "saveSettings", settings: newSettings });
  }

  ["selTL", "inputTL", "pgTL"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", save);
  });
  ["selEngine", "inputEngine", "pgEngine"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", save);
  });
  ["enSel", "enInput", "enPage", "enFloat", "autoTranslate", "allowRemoteTTS"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", save);
  });

  document.getElementById("testSelEngine").addEventListener("click", () => testEngine("testSelEngine", "selEngine"));
  document.getElementById("testInputEngine").addEventListener("click", () => testEngine("testInputEngine", "inputEngine"));
  document.getElementById("testPgEngine")?.addEventListener("click", () => testEngine("testPgEngine", "pgEngine"));
}
