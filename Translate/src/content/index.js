import { injectStyles } from './ui/styles.js';
import { isOwn, showToast, closeDropdown, positionPanel, attachSpeakHandlers, attachCopyHandler } from './ui/components.js';
import { svgIcon } from './ui/icons.js';
import { escHtml, sendMessage, isIgnored } from '../shared/constants.js';
import { isEditable, doReplace } from './input-translate.js';
import { getSelection, showToolbar, showPanel, clearAll, setTBar, setPanel, setLastX, setLastY, getLastX, getLastY, startPanelTimer } from './sel-translate.js';

let S = { selTL: "en", inputSL: "auto", inputTL: "en", enSel: true, enInput: true, ignLangs: [], selEngine: "google", inputEngine: "google" };
let ready = false;

document.addEventListener("mouseup", (e) => {
  if (!ready) return;
  setLastX(e.clientX);
  setLastY(e.clientY);
  setTimeout(() => {
    if (isOwn(e.target)) return;
    const sel = getSelection();
    if (!sel) { clearAll(); return; }
    if (sel.isInput && !S.enInput) return;
    if (!sel.isInput && !S.enSel) return;
    if (isIgnored(sel.text, S.ignLangs)) return;
    showToolbar(getLastX(), getLastY(), sel.text, sel.isInput, S);
  }, 10);
}, true);

document.addEventListener("mousedown", (e) => {
  if (!ready) return;
  const panel = document.querySelector(".tr-panel");
  if (panel && panel.contains(e.target)) {
    if (!e.target.closest(".tr-dd-item")) closeDropdown();
    return;
  }
  const tBar = document.querySelector(".tr-bar");
  if (tBar && tBar.contains(e.target)) return;
  if (isOwn(e.target)) return;
  clearAll();
}, true);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { clearAll(); }
}, true);

async function init() {
  injectStyles();
  try {
    const r = await sendMessage({ action: "getSettings" });
    if (r && r.settings) S = { ...S, ...r.settings };
  } catch {}

  ready = true;

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "show-toast" && msg.msg) showToast(msg.msg);
    if (msg.action === "showTranslation" && msg.result) {
      clearAll();
      let tBar = document.createElement("div");
      tBar.className = "tr-bar";
      tBar.style.left = (innerWidth / 2) + "px";
      tBar.style.top = "100px";
      document.body.appendChild(tBar);
      setTBar(tBar);
      let panel = document.createElement("div");
      panel.className = "tr-panel";
      setPanel(panel);
      const head = document.createElement("div");
      head.className = "tr-phead";
      head.innerHTML = `<div class="tr-plang"><span style="font-size:11px;color:#6b7280">→ ${msg.tl}</span></div><button class="tr-pclose">${svgIcon("close")}</button>`;
      head.querySelector(".tr-pclose").addEventListener("click", () => clearAll());
      const body = document.createElement("div");
      body.className = "tr-pbody";
      body.innerHTML = `<div class="tr-original"><span class="tr-original-text">${escHtml((msg.text || "").substring(0, 200))}</span><button class="tr-speak-btn" data-lang="auto">${svgIcon("volume")}</button></div><div class="tr-result"><span class="tr-result-text">${escHtml(msg.result)}</span><button class="tr-speak-btn" data-lang="${msg.tl}">${svgIcon("volume")}</button></div><div class="tr-actions"><button class="tr-copy-btn">${svgIcon("copy")}Copy</button></div>`;
      attachCopyHandler(body.querySelector(".tr-copy-btn"), msg.result);
      attachSpeakHandlers(body);
      panel.appendChild(head);
      panel.appendChild(body);
      document.body.appendChild(panel);
      requestAnimationFrame(() => {
        const pw = panel.offsetWidth, ph = panel.offsetHeight;
        let l = (innerWidth - pw) / 2, t = 60;
        if (l < 8) l = 8;
        if (t + ph > innerHeight - 8) t = Math.max(8, innerHeight - ph - 8);
        panel.style.left = l + "px";
        panel.style.top = t + "px";
      });
      startPanelTimer();
    }
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings) {
      S = { ...S, ...changes.settings.newValue };
    }
  });
}

init();
