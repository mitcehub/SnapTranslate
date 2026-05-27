import { escHtml, sendMessage, setHTML, replaceOuterHTML } from '../shared/constants.js';
import { svgIcon } from './ui/icons.js';
import { buildDropdown, buildEngineDropdown, position, positionPanel, closeDropdown, showToast, attachSpeakHandlers, attachCopyHandler } from './ui/components.js';
import { isEditable, doReplace } from './input-translate.js';

let tBar = null;
let panel = null;
let busy = false;
let hoverTimer = null;
let panelTimer = null;
let actInput = null;
let selText = "";
let lastX = 0;
let lastY = 0;

export function getTBar() { return tBar; }
export function setTBar(v) { tBar = v; }
export function getPanel() { return panel; }
export function setPanel(v) { panel = v; }
export function getBusy() { return busy; }
export function getActInput() { return actInput; }
export function getSelText() { return selText; }
export function getLastX() { return lastX; }
export function getLastY() { return lastY; }
export function setLastX(v) { lastX = v; }
export function setLastY(v) { lastY = v; }

export function clearAll() {
  closeDropdown();
  if (tBar) { tBar.remove(); tBar = null; }
  if (panel) { panel.remove(); panel = null; }
  if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
  if (panelTimer) { clearTimeout(panelTimer); panelTimer = null; }
  busy = false;
}

export function getSelection() {
  const ae = document.activeElement;
  if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA")) {
    const st = ae.selectionStart, en = ae.selectionEnd;
    if (st !== en) {
      actInput = ae;
      selText = ae.value.substring(st, en);
      return { text: selText, isInput: true, el: ae };
    }
  }

  const s = window.getSelection();
  if (!s || s.isCollapsed || !s.rangeCount) return null;
  const txt = s.toString().trim();
  if (!txt || txt.length < 2 || txt.length > 2000) return null;

  actInput = null;
  selText = txt;

  const an = s.anchorNode;
  if (an) {
    let p = an.parentElement;
    while (p) {
      if (p.isContentEditable) { actInput = p; break; }
      p = p.parentElement;
    }
  }

  return { text: txt, isInput: !!actInput, el: actInput };
}

export function showToolbar(x, y, txt, isInput, S) {
  clearAll();

  tBar = document.createElement("div");
  tBar.className = "tr-bar";
  setHTML(tBar, `<button class="tr-btn tr-primary tr-btn-icon" id="tr-translate-btn">${svgIcon("translate")}</button>`);
  document.body.appendChild(tBar);

  const defaultTL = isInput ? (S.inputTL || "en") : (S.selTL || "en");
  const defaultEngine = isInput ? (S.inputEngine || "google") : (S.selEngine || "google");

  requestAnimationFrame(() => {
    if (!tBar) return;
    position(tBar, x, y);

    const btn = tBar.querySelector("#tr-translate-btn");
    if (!btn) return;

    btn.addEventListener("mouseenter", () => {
      hoverTimer = setTimeout(() => showPanel(txt, defaultTL, defaultEngine), 250);
    });
    btn.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimer);
    });
  });
}

export function showPanel(txt, tl, engine) {
  if (busy) return;
  if (panel) { panel.remove(); panel = null; }
  busy = true;

  const curEngine = engine || "google";

  panel = document.createElement("div");
  panel.className = "tr-panel";

  const head = document.createElement("div");
  head.className = "tr-phead";

  const langWrap = document.createElement("div");
  langWrap.className = "tr-plang";

  const srcDD = buildDropdown("tr-panel-src", "auto", true, () => { }, true, panel);
  const arrow = document.createElement("span");
  arrow.className = "tr-arrow";
  arrow.textContent = "→";
  const tgtDD = buildDropdown("tr-panel-tgt", tl, false, (code) => {
    reTranslate(txt, code, panel.dataset.engine || curEngine);
  }, false, panel);

  langWrap.appendChild(srcDD);
  langWrap.appendChild(arrow);
  langWrap.appendChild(tgtDD);

  const engineSep = document.createElement("span");
  engineSep.className = "tr-engine-sep";
  langWrap.appendChild(engineSep);

  const engineDD = buildEngineDropdown("tr-panel-engine", curEngine, (eng) => {
    panel.dataset.engine = eng;
    const srcBtn = panel.querySelector("#tr-panel-src");
    const sl = srcBtn ? srcBtn.dataset.code : "auto";
    const tgtBtn = panel.querySelector("#tr-panel-tgt");
    const newTL = tgtBtn ? tgtBtn.dataset.code : tl;
    reTranslate(txt, newTL, eng);
  }, panel);

  langWrap.appendChild(engineDD);

  const closeBtn = document.createElement("button");
  closeBtn.className = "tr-pclose";
  setHTML(closeBtn, svgIcon("close"));
  closeBtn.addEventListener("click", () => clearAll());

  head.appendChild(langWrap);
  head.appendChild(closeBtn);

  const body = document.createElement("div");
  body.className = "tr-pbody";
  setHTML(body, `
    <div class="tr-original">${escHtml(txt.substring(0, 200))}</div>
    <div class="tr-loading"><span class="tr-spinner"></span>Translating...</div>
  `);

  panel.appendChild(head);
  panel.appendChild(body);
  panel.dataset.engine = curEngine;

  document.body.appendChild(panel);
  positionPanel(panel, tBar);
  doTranslate(txt, "auto", tl, curEngine);
  startPanelTimer();
}

function startPanelTimer() {
  if (panelTimer) clearTimeout(panelTimer);

  function scheduleClose() {
    panelTimer = setTimeout(() => {
      const pH = panel && panel.matches(":hover");
      const bH = tBar && tBar.matches(":hover");
      if (!pH && !bH) clearAll();
      else panelTimer = null;
    }, 500);
  }

  function cancelClose() {
    if (panelTimer) { clearTimeout(panelTimer); panelTimer = null; }
  }

  if (tBar) {
    tBar.addEventListener("mouseenter", cancelClose);
    tBar.addEventListener("mouseleave", scheduleClose);
  }
  if (panel) {
    panel.addEventListener("mouseenter", cancelClose);
    panel.addEventListener("mouseleave", scheduleClose);
  }
}

export { startPanelTimer };

async function doTranslate(txt, sl, tl, engine) {
  const loadingEl = panel && panel.querySelector(".tr-loading");
  if (!panel) return;
  try {
    const r = await sendMessage({ action: "translate", text: txt, sourceLang: sl, targetLang: tl, engine: engine || "google" });
    if (r.success && panel) {
      const body = panel.querySelector(".tr-pbody");
      const isInput = actInput && isEditable(actInput);
      const srcLang = sl || "auto";
      setHTML(body, `
        <div class="tr-original"><span class="tr-original-text">${escHtml(txt.substring(0, 200))}</span><button class="tr-speak-btn" data-lang="${srcLang}">${svgIcon("volume")}</button></div>
        <div class="tr-result"><span class="tr-result-text">${escHtml(r.result)}</span><button class="tr-speak-btn" data-lang="${tl}">${svgIcon("volume")}</button></div>
        <div class="tr-actions">
          <button class="tr-copy-btn">${svgIcon("copy")}Copy</button>
          ${isInput ? `<button class="tr-replace-btn">${svgIcon("replace")}Replace</button>` : ""}
        </div>
      `);
      requestAnimationFrame(() => positionPanel(panel, tBar));
      attachSpeakHandlers(body);
      attachCopyHandler(body.querySelector(".tr-copy-btn"), r.result);
      const rpBtn = body.querySelector(".tr-replace-btn");
      if (rpBtn) rpBtn.addEventListener("click", () => { doReplace(r.result, actInput, selText, showToast); clearAll(); });
    } else if (!r.success && panel && loadingEl) {
      replaceOuterHTML(loadingEl, `<div class="tr-result" style="color:#ef4444;">Translation failed: ${escHtml(r.error || "unknown error")}</div>`);
      requestAnimationFrame(() => positionPanel(panel, tBar));
    }
  } catch (e) {
    if (panel && loadingEl) { replaceOuterHTML(loadingEl, `<div class="tr-result" style="color:#ef4444;">Error: ${escHtml(e.message)}</div>`); }
    if (panel) requestAnimationFrame(() => positionPanel(panel, tBar));
  }
  busy = false;
}

async function reTranslate(txt, newTL, engine) {
  if (!panel) return;
  busy = true;
  const srcBtn = panel.querySelector("#tr-panel-src");
  const sl = srcBtn ? srcBtn.dataset.code : "auto";
  const body = panel.querySelector(".tr-pbody");
  setHTML(body, `<div class="tr-original">${escHtml(txt.substring(0, 200))}</div><div class="tr-loading"><span class="tr-spinner"></span>Translating...</div>`);
  doTranslate(txt, sl, newTL, engine || "google");
}
