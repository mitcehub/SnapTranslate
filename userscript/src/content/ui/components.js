let openDropdown = null;

function setOpenDropdown(dd) { openDropdown = dd; }
function getOpenDropdown() { return openDropdown; }

function closeDropdown() {
  if (openDropdown) {
    openDropdown.list.classList.remove("tr-dd-open");
    openDropdown = null;
  }
}

function buildDropdown(id, val, includeAuto, onChange, disabled, panelRef) {
  const dd = document.createElement("div");
  dd.className = "tr-dd";

  const btn = document.createElement("button");
  btn.className = "tr-dd-btn";
  btn.id = id;
  if (disabled) btn.disabled = true;

  const list = document.createElement("div");
  list.className = "tr-dd-list";

  let currentName = "";
  LANGS.forEach((l) => {
    if (!includeAuto && l.code === "auto") return;
    const item = document.createElement("div");
    item.className = "tr-dd-item" + (l.code === val ? " tr-dd-active" : "");
    item.textContent = l.name;
    item.dataset.code = l.code;
    if (l.code === val) currentName = l.name;
    item.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.textContent = l.name;
      btn.dataset.code = l.code;
      list.querySelectorAll(".tr-dd-item").forEach((it) => it.classList.remove("tr-dd-active"));
      item.classList.add("tr-dd-active");
      closeDropdown();
      if (onChange) onChange(l.code);
    });
    list.appendChild(item);
  });

  btn.textContent = currentName;
  btn.dataset.code = val;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (btn.disabled) return;
    if (list.classList.contains("tr-dd-open")) {
      closeDropdown();
    } else {
      closeDropdown();
      const panelRect = panelRef ? panelRef.getBoundingClientRect() : null;
      const btnRect = btn.getBoundingClientRect();
      if (panelRect) {
        const available = panelRect.bottom - btnRect.bottom - 8;
        list.style.maxHeight = Math.max(60, available) + "px";
      }
      list.classList.add("tr-dd-open");
      openDropdown = { btn, list };
    }
  });

  dd.appendChild(btn);
  dd.appendChild(list);
  return dd;
}

function buildEngineDropdown(id, val, onChange, panelRef) {
  const dd = document.createElement("div");
  dd.className = "tr-dd";

  const btn = document.createElement("button");
  btn.className = "tr-dd-btn tr-engine-btn";
  btn.id = id;

  const list = document.createElement("div");
  list.className = "tr-dd-list";

  let currentName = "";
  ENGINES.forEach((e) => {
    const item = document.createElement("div");
    item.className = "tr-dd-item" + (e.id === val ? " tr-dd-active" : "");
    item.textContent = e.name;
    item.dataset.code = e.id;
    if (e.id === val) currentName = e.name;
    item.addEventListener("mousedown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
    });
    item.addEventListener("click", (ev) => {
      ev.stopPropagation();
      btn.textContent = e.name;
      btn.dataset.code = e.id;
      list.querySelectorAll(".tr-dd-item").forEach((it) => it.classList.remove("tr-dd-active"));
      item.classList.add("tr-dd-active");
      closeDropdown();
      if (onChange) onChange(e.id);
    });
    list.appendChild(item);
  });

  btn.textContent = currentName;
  btn.dataset.code = val;

  btn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    if (list.classList.contains("tr-dd-open")) {
      closeDropdown();
    } else {
      closeDropdown();
      const panelRect = panelRef ? panelRef.getBoundingClientRect() : null;
      const btnRect = btn.getBoundingClientRect();
      if (panelRect) {
        const available = panelRect.bottom - btnRect.bottom - 8;
        list.style.maxHeight = Math.max(60, available) + "px";
      }
      list.classList.add("tr-dd-open");
      openDropdown = { btn, list };
    }
  });

  dd.appendChild(btn);
  dd.appendChild(list);
  return dd;
}

function position(el, x, y) {
  const r = el.getBoundingClientRect();
  const w = r.width || 150;
  const h = r.height || 36;
  let l = x - w / 2, t = y + 12;
  if (l < 8) l = 8;
  if (l + w > innerWidth - 8) l = innerWidth - w - 8;
  if (t + h > innerHeight - 8) t = y - h - 12;
  if (t < 8) t = 8;
  el.style.left = l + "px";
  el.style.top = t + "px";
}

function positionPanel(panel, tBar) {
  if (!panel || !tBar) return;
  const barRect = tBar.getBoundingClientRect();
  const pw = panel.offsetWidth;
  const ph = panel.offsetHeight;
  const vw = innerWidth;
  const vh = innerHeight;
  let l = barRect.left, t = barRect.bottom + 8;
  if (l + pw > vw - 8) l = vw - pw - 8;
  if (l < 8) l = 8;
  if (t + ph > vh - 8) {
    const aboveT = barRect.top - ph - 8;
    if (aboveT >= 8) {
      t = aboveT;
    } else {
      t = Math.max(8, vh - ph - 8);
    }
  }
  if (t < 8) t = 8;
  panel.style.left = l + "px";
  panel.style.top = t + "px";
}

function isOwn(el) {
  return !!(el && (el.closest(".tr-bar") || el.closest(".tr-panel") || el.closest(".tr-bilingual")));
}

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "tr-toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

function attachSpeakHandlers(container) {
  container.querySelectorAll(".tr-speak-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      if (this.classList.contains("speaking")) {
        stopSpeak();
        return;
      }
      const lang = this.dataset.lang;
      const textEl = this.previousElementSibling;
      const text = textEl ? textEl.textContent : "";
      if (!text) return;
      stopSpeak();
      this.classList.add("speaking");
      speak(text, lang);
    });
  });
}

function attachCopyHandler(btn, text) {
  btn.addEventListener("click", async function () {
    try {
      await navigator.clipboard.writeText(text);
      this.innerHTML = `${svgIcon("check")}Copied`;
      this.classList.add("copied");
      setTimeout(() => { this.innerHTML = `${svgIcon("copy")}Copy`; this.classList.remove("copied"); }, 2000);
    } catch {}
  });
}
