import { LANGS, I18N, getUILang, applyI18N } from './i18n.js';

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

function renderBlacklist(blacklist) {
  const list = document.getElementById("blacklistList");
  if (!list) return;
  list.innerHTML = "";
  if (!blacklist || !blacklist.length) {
    const lang = getUILang();
    const strings = I18N[lang] || I18N.en;
    const li = document.createElement("li");
    li.className = "blacklist-empty";
    li.textContent = strings.emptyBlacklist;
    list.appendChild(li);
    return;
  }
  blacklist.forEach((host) => {
    const li = document.createElement("li");
    li.className = "blacklist-item";
    li.innerHTML = `<span>${host}</span><button class="remove" title="Remove">&times;</button>`;
    li.querySelector(".remove").addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "removeBlacklist", host }, (r) => {
        if (r && r.success) renderBlacklist(r.blacklist);
      });
    });
    list.appendChild(li);
  });
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

export async function initSettingsUI() {
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
