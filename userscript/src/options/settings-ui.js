function populateSelect(sel, options, selected) {
  sel.innerHTML = "";
  options.forEach((l) => {
    const opt = document.createElement("option");
    opt.value = l.code;
    opt.textContent = l.name;
    if (l.code === selected) opt.selected = true;
    sel.appendChild(opt);
  });
}

function setEngineSelect(sel, selected) {
  for (let i = 0; i < sel.options.length; i++) {
    if (sel.options[i].value === selected) {
      sel.selectedIndex = i;
      break;
    }
  }
}

function renderBlacklist(container, blacklist, onRemove) {
  container.innerHTML = "";
  if (!blacklist || !blacklist.length) {
    const empty = document.createElement("div");
    empty.style.cssText = "color:#9ca3af;font-size:12px;padding:8px 0;";
    empty.textContent = t("emptyBlacklist");
    container.appendChild(empty);
    return;
  }
  const wrap = document.createElement("div");
  wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;";
  blacklist.forEach((host) => {
    const chip = document.createElement("div");
    chip.style.cssText = "display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border:1px solid #fecaca;border-radius:14px;font-size:11px;color:#dc2626;background:#fef2f2;";
    chip.innerHTML = `<span>${escHtml(host)}</span><button data-remove style="border:none;background:none;color:#dc2626;cursor:pointer;font-size:14px;padding:0 2px;">&times;</button>`;
    chip.querySelector("[data-remove]").addEventListener("click", () => onRemove(host));
    wrap.appendChild(chip);
  });
  container.appendChild(wrap);
}

const IGN_LANG_OPTIONS = [
  { code: "zh-CN", label: "中文" }, { code: "en", label: "English" },
  { code: "ja", label: "日本語" }, { code: "ko", label: "한국어" },
  { code: "fr", label: "Français" }, { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" }, { code: "ru", label: "Русский" },
];

function renderIgnLangs(container, ignLangs, onChange) {
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;";
  IGN_LANG_OPTIONS.forEach((l) => {
    const label = document.createElement("label");
    label.style.cssText = "display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border:1px solid #e2e8f0;border-radius:14px;font-size:11px;cursor:pointer;user-select:none;";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = l.code;
    cb.checked = ignLangs.includes(l.code);
    cb.style.cssText = "margin:0;width:12px;height:12px;accent-color:#6366f1;cursor:pointer;";
    cb.addEventListener("change", () => {
      const checked = [...wrap.querySelectorAll("input:checked")].map((i) => i.value);
      onChange(checked);
    });
    label.appendChild(cb);
    label.appendChild(document.createTextNode(l.label));
    wrap.appendChild(label);
  });
  container.appendChild(wrap);
}

async function initSettingsPanel(panel) {
  let settings = {};
  try {
    const r = await sendMessage({ action: "getSettings" });
    if (r && r.settings) settings = r.settings;
  } catch {}

  panel.innerHTML = `
    <style>
      #ez-options-overlay { position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px; }
      #ez-options-panel { background:#fff;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.3);width:520px;max-width:90vw;max-height:85vh;overflow:hidden;display:flex;flex-direction:column; }
      .ez-dark #ez-options-panel { background:#1e1e2e;color:#cdd6f4; }
      .ez-opt-header { display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #e5e7eb;font-weight:600;font-size:15px; }
      .ez-dark .ez-opt-header { border-color:#313244; }
      .ez-opt-close { border:none;background:none;font-size:20px;cursor:pointer;padding:4px 8px;border-radius:6px;color:#6b7280; }
      .ez-opt-close:hover { background:#f3f4f6; }
      .ez-dark .ez-opt-close { color:#a6adc8; }
      .ez-dark .ez-opt-close:hover { background:#313244; }
      .ez-opt-body { padding:16px 20px;overflow-y:auto;flex:1; }
      .ez-opt-section { margin-bottom:16px; }
      .ez-opt-section-title { font-weight:600;font-size:13px;margin-bottom:8px;color:#374151; }
      .ez-dark .ez-opt-section-title { color:#cdd6f4; }
      .ez-opt-row { display:flex;align-items:center;justify-content:space-between;padding:6px 0; }
      .ez-opt-label { color:#4b5563;font-size:12px; }
      .ez-dark .ez-opt-label { color:#a6adc8; }
      .ez-opt-desc { color:#9ca3af;font-size:11px;margin-top:1px; }
      .ez-opt-select { padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;background:#fff;color:#111827; }
      .ez-dark .ez-opt-select { background:#313244;border-color:#45475a;color:#cdd6f4; }
      .ez-opt-input { padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;width:220px;background:#fff;color:#111827; }
      .ez-dark .ez-opt-input { background:#313244;border-color:#45475a;color:#cdd6f4; }
      .ez-opt-btn { padding:4px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;cursor:pointer;background:#fff;color:#374151; }
      .ez-opt-btn:hover { background:#f3f4f6; }
      .ez-dark .ez-opt-btn { background:#313244;border-color:#45475a;color:#cdd6f4; }
      .ez-dark .ez-opt-btn:hover { background:#45475a; }
      .ez-toggle { position:relative;width:36px;height:20px;cursor:pointer; }
      .ez-toggle input { position:absolute;opacity:0;width:0;height:0; }
      .ez-toggle-slider { position:absolute;inset:0;background:#d1d5db;border-radius:10px;transition:.2s; }
      .ez-toggle-slider::before { content:'';position:absolute;width:16px;height:16px;left:2px;bottom:2px;background:#fff;border-radius:50%;transition:.2s; }
      .ez-toggle input:checked + .ez-toggle-slider { background:#6366f1; }
      .ez-toggle input:checked + .ez-toggle-slider::before { transform:translateX(16px); }
      .ez-dark .ez-toggle-slider { background:#45475a; }
      .ez-opt-hr { border:none;border-top:1px solid #e5e7eb;margin:8px 0; }
      .ez-dark .ez-opt-hr { border-color:#313244; }
    </style>
    <div class="ez-opt-header">
      <span>${t("optionsTitle")}</span>
      <button class="ez-opt-close" data-close>&times;</button>
    </div>
    <div class="ez-opt-body">
      <div class="ez-opt-section">
        <div class="ez-opt-section-title">${t("langSettings")}</div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("selTargetLang")}</div><div class="ez-opt-desc">${t("selTargetLangDesc")}</div></div>
          <select id="ez-selTL" class="ez-opt-select"></select>
        </div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("inputTargetLang")}</div><div class="ez-opt-desc">${t("inputTargetLangDesc")}</div></div>
          <select id="ez-inputTL" class="ez-opt-select"></select>
        </div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("pageTargetLang")}</div><div class="ez-opt-desc">${t("pageTargetLangDesc")}</div></div>
          <select id="ez-pgTL" class="ez-opt-select"></select>
        </div>
      </div>
      <hr class="ez-opt-hr">
      <div class="ez-opt-section">
        <div class="ez-opt-section-title">${t("featureSettings")}</div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("enableSelTrans")}</div><div class="ez-opt-desc">${t("enableSelTransDesc")}</div></div>
          <label class="ez-toggle"><input type="checkbox" id="ez-enSel"><span class="ez-toggle-slider"></span></label>
        </div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("enableInputTrans")}</div><div class="ez-opt-desc">${t("enableInputTransDesc")}</div></div>
          <label class="ez-toggle"><input type="checkbox" id="ez-enInput"><span class="ez-toggle-slider"></span></label>
        </div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("enablePageTrans")}</div><div class="ez-opt-desc">${t("enablePageTransDesc")}</div></div>
          <label class="ez-toggle"><input type="checkbox" id="ez-enPage"><span class="ez-toggle-slider"></span></label>
        </div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("enableFloatBtn")}</div><div class="ez-opt-desc">${t("enableFloatBtnDesc")}</div></div>
          <label class="ez-toggle"><input type="checkbox" id="ez-enFloat"><span class="ez-toggle-slider"></span></label>
        </div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("autoTranslate")}</div><div class="ez-opt-desc">${t("autoTranslateDesc")}</div></div>
          <label class="ez-toggle"><input type="checkbox" id="ez-autoTranslate"><span class="ez-toggle-slider"></span></label>
        </div>
      </div>
      <hr class="ez-opt-hr">
      <div class="ez-opt-section">
        <div class="ez-opt-section-title">${t("engineLabel")}</div>
        <div class="ez-opt-desc" style="margin-top:0;margin-bottom:8px;">${t("engineDesc")}</div>
        <div class="ez-opt-row">
          <span class="ez-opt-label">${t("tabSelection")}</span>
          <select id="ez-selEngine" class="ez-opt-select"></select>
          <button class="ez-opt-btn" id="ez-testSelEngine">${t("testBtn")}</button>
        </div>
        <div class="ez-opt-row">
          <span class="ez-opt-label">${t("tabInput")}</span>
          <select id="ez-inputEngine" class="ez-opt-select"></select>
          <button class="ez-opt-btn" id="ez-testInputEngine">${t("testBtn")}</button>
        </div>
        <div class="ez-opt-row">
          <span class="ez-opt-label">${t("tabPage")}</span>
          <select id="ez-pgEngine" class="ez-opt-select"></select>
          <button class="ez-opt-btn" id="ez-testPgEngine">${t("testBtn")}</button>
        </div>
      </div>
      <hr class="ez-opt-hr">
      <div class="ez-opt-section">
        <div class="ez-opt-section-title">${t("ignoreLangs")}</div>
        <div class="ez-opt-desc" style="margin-top:0;margin-bottom:8px;">${t("ignoreLangsDesc")}</div>
        <div id="ez-ignLangsContainer"></div>
      </div>
      <hr class="ez-opt-hr">
      <div class="ez-opt-section">
        <div class="ez-opt-section-title">${t("blacklistTitle")}</div>
        <div class="ez-opt-desc" style="margin-top:0;margin-bottom:8px;">${t("blacklistDesc")}</div>
        <div style="display:flex;gap:6px;margin-bottom:8px;">
          <input id="ez-blacklistInput" class="ez-opt-input" placeholder="${t("blacklistPlaceholder")}">
          <button id="ez-addBlacklistBtn" class="ez-opt-btn">${t("addBtn")}</button>
        </div>
        <div id="ez-blacklistContainer"></div>
      </div>
      <hr class="ez-opt-hr">
      <div class="ez-opt-section">
        <div class="ez-opt-section-title">${t("rulesTitle")}</div>
        <div class="ez-opt-desc" style="margin-top:0;margin-bottom:8px;">${t("rulesUrlDesc")}</div>
        <div style="display:flex;gap:6px;margin-bottom:8px;">
          <input id="ez-rulesUrl" class="ez-opt-input" placeholder="GitHub raw URL" style="flex:1;">
          <button id="ez-refreshRulesBtn" class="ez-opt-btn">${t("refreshRulesBtn")}</button>
        </div>
        <div id="ez-rulesList"></div>
      </div>
    </div>
  `;

  const isDark = document.documentElement.getAttribute("data-tr-theme") === "dark";
  if (isDark) panel.classList.add("ez-dark");

  populateSelect(panel.querySelector("#ez-selTL"), OPTIONS_LANGS, settings.selTL || "en");
  populateSelect(panel.querySelector("#ez-inputTL"), OPTIONS_LANGS, settings.inputTL || "en");
  populateSelect(panel.querySelector("#ez-pgTL"), OPTIONS_LANGS, settings.pgTL || "en");

  const engineOpts = [{ code: "google", name: "Google" }, { code: "bing", name: "Bing" }];
  for (const id of ["ez-selEngine", "ez-inputEngine", "ez-pgEngine"]) {
    const sel = panel.querySelector("#" + id);
    populateSelect(sel, engineOpts, settings[id.replace("ez-", "").replace("Engine", "") + "Engine"] || "google");
  }

  panel.querySelector("#ez-enSel").checked = settings.enSel !== false;
  panel.querySelector("#ez-enInput").checked = settings.enInput !== false;
  panel.querySelector("#ez-enPage").checked = settings.enPage !== false;
  panel.querySelector("#ez-enFloat").checked = settings.enFloat !== false;
  panel.querySelector("#ez-autoTranslate").checked = settings.autoTranslate === true;

  renderIgnLangs(panel.querySelector("#ez-ignLangsContainer"), settings.ignLangs || [], (newIgn) => {
    settings.ignLangs = newIgn;
    saveSettings(settings);
  });

  const onBLRemove = (host) => {
    settings.blacklist = (settings.blacklist || []).filter((h) => h !== host);
    saveSettings(settings);
    renderBlacklist(panel.querySelector("#ez-blacklistContainer"), settings.blacklist, onBLRemove);
  };
  renderBlacklist(panel.querySelector("#ez-blacklistContainer"), settings.blacklist || [], onBLRemove);

  panel.querySelector("#ez-addBlacklistBtn").addEventListener("click", () => {
    const input = panel.querySelector("#ez-blacklistInput");
    const host = input.value.trim();
    if (!host) return;
    if (!settings.blacklist) settings.blacklist = [];
    if (!settings.blacklist.includes(host)) {
      settings.blacklist.push(host);
      saveSettings(settings);
      renderBlacklist(panel.querySelector("#ez-blacklistContainer"), settings.blacklist, onBLRemove);
    }
    input.value = "";
  });

  panel.querySelector("#ez-refreshRulesBtn").addEventListener("click", async () => {
    const btn = panel.querySelector("#ez-refreshRulesBtn");
    btn.disabled = true;
    btn.textContent = "...";
    try {
      const r = await sendMessage({ action: "refreshRules" });
      btn.textContent = "OK ✓";
      if (r && r.rules) {
        const list = panel.querySelector("#ez-rulesList");
        list.innerHTML = `<span style="color:#059669;font-size:12px;">${r.rules.length} rules loaded</span>`;
      }
    } catch {
      btn.textContent = "Fail ✗";
    }
    btn.disabled = false;
    setTimeout(() => { btn.textContent = t("refreshRulesBtn"); }, 3000);
  });

  function onSave() {
    const ns = {
      selTL: panel.querySelector("#ez-selTL").value,
      inputTL: panel.querySelector("#ez-inputTL").value,
      pgTL: panel.querySelector("#ez-pgTL").value,
      selEngine: panel.querySelector("#ez-selEngine").value,
      inputEngine: panel.querySelector("#ez-inputEngine").value,
      pgEngine: panel.querySelector("#ez-pgEngine").value,
      enSel: panel.querySelector("#ez-enSel").checked,
      enInput: panel.querySelector("#ez-enInput").checked,
      enPage: panel.querySelector("#ez-enPage").checked,
      enFloat: panel.querySelector("#ez-enFloat").checked,
      autoTranslate: panel.querySelector("#ez-autoTranslate").checked,
      ignLangs: settings.ignLangs || [],
      blacklist: settings.blacklist || [],
      rulesUrl: panel.querySelector("#ez-rulesUrl").value || "",
    };
    saveSettings(ns);
    settings = ns;
  }

  for (const id of ["ez-selTL", "ez-inputTL", "ez-pgTL", "ez-selEngine", "ez-inputEngine", "ez-pgEngine"]) {
    panel.querySelector("#" + id).addEventListener("change", onSave);
  }
  for (const id of ["ez-enSel", "ez-enInput", "ez-enPage", "ez-enFloat", "ez-autoTranslate"]) {
    panel.querySelector("#" + id).addEventListener("change", onSave);
  }
  panel.querySelector("#ez-rulesUrl").addEventListener("change", onSave);

  for (const id of ["ez-testSelEngine", "ez-testInputEngine", "ez-testPgEngine"]) {
    panel.querySelector("#" + id).addEventListener("click", async () => {
      const btn = panel.querySelector("#" + id);
      const engId = id.replace("test", "").replace("Engine", "").toLowerCase();
      const engineSel = panel.querySelector("#ez-" + engId + "Engine");
      if (!engineSel) return;
      btn.disabled = true;
      btn.textContent = "...";
      try {
        const r = await sendMessage({ action: "testEngine", engine: engineSel.value });
        btn.textContent = r?.success ? t("testSuccess") : t("testFail");
        btn.style.color = r?.success ? "#059669" : "#dc2626";
      } catch {
        btn.textContent = t("testFail");
        btn.style.color = "#dc2626";
      }
      btn.disabled = false;
      setTimeout(() => { btn.textContent = t("testBtn"); btn.style.color = ""; }, 3000);
    });
  }

  panel.querySelector("[data-close]").addEventListener("click", () => {
    closeOptionsPanel();
  });
}
