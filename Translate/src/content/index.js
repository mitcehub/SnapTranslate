import { isOwn, showToast, closeDropdown, positionPanel, attachSpeakHandlers, attachCopyHandler } from './ui/components.js';
import { svgIcon } from './ui/icons.js';
import { escHtml, sendMessage, isIgnored, isBlacklisted as checkBlacklist } from '../shared/constants.js';
import { isEditable, doReplace } from './input-translate.js';
import { getSelection, showToolbar, showPanel, clearAll, setTBar, setPanel, setLastX, setLastY, getLastX, getLastY, startPanelTimer } from './sel-translate.js';
import { applyPageRule, stopObserver } from './page-translate.js';
import { getIconUrl, applyTheme, watchTheme } from '../shared/theme.js';

const GENERIC_RULE = {
  name: "通用规则",
  selectors: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "article", "main", "section", "blockquote", "li", "td", "th", "figcaption", "details", "summary", "label", "dd", "dt"],
  excludeMatches: [],
  autoTranslate: true,
  translateUI: false,
};

const LS_PREFIX = "snap-translate:";

function detectContentLang() {
  const body = document.body;
  if (!body) return '';
  const sample = body.innerText.substring(0, 800);
  const totalNonSpace = (sample.match(/[^\s]/g) || []).length;
  if (totalNonSpace < 20) return '';
  const zhChars = (sample.match(/[\u4e00-\u9fff]/g) || []).length;
  const jaChars = (sample.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
  const koChars = (sample.match(/[\uac00-\ud7af]/g) || []).length;
  const ruChars = (sample.match(/[\u0400-\u04ff]/g) || []).length;
  const arChars = (sample.match(/[\u0600-\u06ff]/g) || []).length;
  const enChars = (sample.match(/[a-zA-Z]/g) || []).length;
  if (zhChars / totalNonSpace > 0.15) return 'zh';
  if (jaChars / totalNonSpace > 0.1) return 'ja';
  if (koChars / totalNonSpace > 0.1) return 'ko';
  if (ruChars / totalNonSpace > 0.15) return 'ru';
  if (arChars / totalNonSpace > 0.15) return 'ar';
  if (enChars / totalNonSpace > 0.3) return 'en';
  return '';
}

function detectPageLang() {
  const htmlLang = document.documentElement?.getAttribute('lang') || '';
  if (htmlLang) return htmlLang.split('-')[0].toLowerCase();

  const metaLang = document.querySelector('meta[http-equiv="content-language"]');
  if (metaLang) {
    const c = metaLang.getAttribute('content') || '';
    if (c) return c.split('-')[0].toLowerCase();
  }

  return detectContentLang();
}

function shouldSkipTranslation(targetLang) {
  const declaredLang = detectPageLang();
  const contentLang = detectContentLang();
  const t = (targetLang || '').split('-')[0].toLowerCase();

  if (!declaredLang && !contentLang) return false;

  const declaredMatch = declaredLang && (declaredLang === t || (t === 'zh' && declaredLang === 'zh'));
  const contentMatch = contentLang && (contentLang === t || (t === 'zh' && contentLang === 'zh'));

  if (declaredMatch && contentMatch) return true;
  if (declaredMatch && !contentMatch && contentLang) return false;
  if (contentMatch) return true;

  return false;
}
function lsGet(key) {
  try {
    const val = localStorage.getItem(LS_PREFIX + key);
    if (val !== null) return val;
    const oldVal = localStorage.getItem(key);
    if (oldVal !== null) { localStorage.setItem(LS_PREFIX + key, oldVal); localStorage.removeItem(key); }
    return oldVal;
  } catch { return null; }
}
function lsSet(key, value) {
  try { localStorage.setItem(LS_PREFIX + key, value); } catch { }
}
function lsRemove(key) {
  try { localStorage.removeItem(LS_PREFIX + key); localStorage.removeItem(key); } catch { }
}

let S = {
  selTL: "en", inputSL: "auto", inputTL: "en", pgTL: "en",
  enSel: true, enInput: true, enPage: true, enFloat: true, autoTranslate: true,
  ignLangs: [], selEngine: "google", inputEngine: "google", pgEngine: "google",
  blacklist: [], autoBlacklist: [], rulesUrl: ""
};
let ready = false;
let isBlacklisted = false;
let isAutoBlacklisted = false;
let sessionDisabled = false;
let pgTranslating = false;
let pageLangDisabled = false;
let siteRule = null;
let float = null;
let floatPos = null;
let floatDragged = false;
let floatMenu = null;
let currentUrl = location.href;
let urlChangeTimer = null;

function setupSpaUrlDetection() {
  const origPushState = history.pushState.bind(history);
  const origReplaceState = history.replaceState.bind(history);

  history.pushState = function (...args) {
    const result = origPushState(...args);
    onUrlChange("pushState");
    return result;
  };

  history.replaceState = function (...args) {
    const result = origReplaceState(...args);
    onUrlChange("replaceState");
    return result;
  };

  window.addEventListener("popstate", () => onUrlChange("popstate"));
}

function onUrlChange(source) {
  const newUrl = location.href;
  if (newUrl === currentUrl) return;

  const oldPath = new URL(currentUrl).pathname;
  const newPath = new URL(newUrl).pathname;
  currentUrl = newUrl;

  if (oldPath === newPath) return;

  if (urlChangeTimer) clearTimeout(urlChangeTimer);
  urlChangeTimer = setTimeout(() => handleSpaNavigation(), 300);
}

async function handleSpaNavigation() {
  if (!S.enPage || isBlacklisted) return;

  if (pgTranslating) {
    revertPageTranslation();
  }

  const targetLang = S.pgTL || S.selTL;

  try {
    const resp = await sendMessage({ action: "getSiteRule", url: location.href });
    siteRule = resp?.rule || null;
  } catch { }

  if (siteRule) {
    if (S.autoTranslate && !isAutoBlacklisted && siteRule.autoTranslate) {
      pgTranslating = true;
      await applyPageRule(siteRule, "auto", targetLang, S.pgEngine || "google");
      if (pgTranslating && float) float.classList.add("tr-translated");
      updateToolbarIcon();
    }
  } else {
    pageLangDisabled = shouldSkipTranslation(targetLang);
    if (pageLangDisabled) return;
    if (S.autoTranslate && !isAutoBlacklisted) {
      siteRule = GENERIC_RULE;
      const st = await showTransStatus("未匹配到规则，使用通用规则");
      await applyPageRule(GENERIC_RULE, "auto", targetLang, S.pgEngine || "google");
      clearTransStatus(st);
      updateToolbarIcon();
    }
  }
}

function loadFloatPos() {
  try {
    const raw = lsGet("tr-float-pos");
    if (raw) { floatPos = JSON.parse(raw); floatDragged = true; }
  } catch { }
  if (!floatPos) floatPos = { right: 24, top: Math.round(innerHeight / 2 - 18) };
}

function saveFloatPos() {
  if (!float || !floatPos) return;
  try { lsSet("tr-float-pos", JSON.stringify(floatPos)); } catch { }
}

function applyFloatPos() {
  if (!float || !floatPos) return;
  const fw = 36, fh = 36;
  let l, t;
  if (floatPos.left != null) l = floatPos.left;
  else if (floatPos.right != null) l = innerWidth - floatPos.right - fw;
  if (floatPos.top != null) t = floatPos.top;
  else if (floatPos.bottom != null) t = innerHeight - floatPos.bottom - fh;
  l = Math.max(4, Math.min(l, innerWidth - fw - 4));
  t = Math.max(4, Math.min(t, innerHeight - fh - 4));
  float.style.left = l + "px";
  float.style.top = t + "px";
}

function closeFloatMenu() {
  if (floatMenu) { floatMenu.remove(); floatMenu = null; }
}

function updateToolbarIcon() {
  sendMessage({ action: "setTranslatedBadge", translated: pgTranslating }).catch(() => {});
}

function revertPageTranslation() {
  stopObserver();
  document.querySelectorAll("[data-snap-translated='page']").forEach((el) => {
    if (el.hasAttribute('data-snap-original')) {
      const original = el.getAttribute('data-snap-original');
      const textNode = document.createTextNode(original);
      el.parentNode.replaceChild(textNode, el);
    }
  });
  document.querySelectorAll("[data-snap-translated='fixed']").forEach((el) => {
    el.removeAttribute("data-snap-translated");
  });
  pgTranslating = false;
  if (float) float.classList.remove("tr-translated");
  updateToolbarIcon();
}

function showDisableMenu() {
  closeFloatMenu();
  floatMenu = document.createElement("div");
  floatMenu.className = "tr-float-menu";
  const rect = float.getBoundingClientRect();
  const items = [
    { icon: svgIcon("eyeOff"), label: "下次打开", desc: "关闭本次，下次访问时重新显示", action: () => { removeFloat(); closeFloatMenu(); } },
    { icon: svgIcon("clock"), label: "临时禁用", desc: "本次会话中不再显示", action: () => { try { sessionStorage.setItem(LS_PREFIX + "tr-float-disabled", "1"); } catch { } removeFloat(); closeFloatMenu(); showToast("已临时禁用"); } },
    { icon: svgIcon("autoOff"), label: "禁用自动翻译", desc: "此网站不自动翻译，可手动点击翻译", action: async () => { const host = location.hostname; if (isAutoBlacklisted) { try { await sendMessage({ action: "removeAutoBlacklist", host }); } catch { } isAutoBlacklisted = false; showToast("已启用自动翻译"); } else { try { await sendMessage({ action: "addAutoBlacklist", host }); } catch { } isAutoBlacklisted = true; if (pgTranslating) revertPageTranslation(); showToast("已禁用自动翻译"); } closeFloatMenu(); } },
    { icon: svgIcon("ban"), label: "永久禁用此网站", desc: "此网站完全禁用网页翻译", cls: "danger", action: async () => { const host = location.hostname; try { await sendMessage({ action: "addBlacklist", host }); } catch { } revertPageTranslation(); removeFloat(); closeFloatMenu(); showToast("已加入网页翻译黑名单"); } },
  ];
  items.forEach((it) => {
    const div = document.createElement("div");
    div.className = "tr-float-menu-item" + (it.cls ? " " + it.cls : "");
    div.innerHTML = it.icon + `<div class="tr-menu-text"><span class="tr-menu-label">${it.label}</span><span class="tr-menu-desc">${it.desc}</span></div>`;
    div.addEventListener("click", (ev) => { ev.stopPropagation(); it.action(); });
    floatMenu.appendChild(div);
  });
  const sep = document.createElement("div");
  sep.className = "tr-menu-sep";
  floatMenu.appendChild(sep);
  const settingsItem = document.createElement("div");
  settingsItem.className = "tr-float-menu-item";
  settingsItem.innerHTML = svgIcon("settings") + `<div class="tr-menu-text"><span class="tr-menu-label">设置</span></div>`;
  settingsItem.addEventListener("click", (ev) => { ev.stopPropagation(); sendMessage({ action: "openOptions" }); closeFloatMenu(); });
  floatMenu.appendChild(settingsItem);
  document.body.appendChild(floatMenu);
  const mw = floatMenu.offsetWidth;
  const mh = floatMenu.offsetHeight;
  let left = rect.left + rect.width / 2 - mw / 2;
  let top = rect.top - 8;
  if (left + mw > innerWidth - 8) left = innerWidth - mw - 8;
  if (left < 8) left = 8;
  if (top - mh < 8) top = rect.bottom + 8;
  else top = top - mh;
  floatMenu.style.left = left + "px";
  floatMenu.style.top = top + "px";
  setTimeout(() => {
    const handler = (ev) => {
      if (floatMenu && !floatMenu.contains(ev.target) && !float.contains(ev.target)) {
        closeFloatMenu();
        document.removeEventListener("mousedown", handler, true);
      }
    };
    document.addEventListener("mousedown", handler, true);
  }, 50);
}

function createFloat() {
  if (float || isBlacklisted || (siteRule ? false : pageLangDisabled) || sessionDisabled) return;
  loadFloatPos();
  float = document.createElement("div");
  float.className = "tr-float";
  const img = document.createElement("img");
  img.src = getIconUrl();
  img.alt = "";
  float.appendChild(img);
  const check = document.createElement("div");
  check.className = "tr-float-check";
  check.innerHTML = svgIcon("check");
  float.appendChild(check);
  const xBtn = document.createElement("div");
  xBtn.className = "tr-float-x";
  xBtn.innerHTML = svgIcon("close");
  float.appendChild(xBtn);
  float.title = "Translate this page";
  if (pgTranslating) float.classList.add("tr-translated");
  applyFloatPos();
  let dragging = false, dragMoved = false;
  let startMX = 0, startMY = 0, startL = 0, startT = 0;
  float.addEventListener("mousedown", (e) => {
    if (e.target === xBtn || xBtn.contains(e.target)) return;
    if (e.button !== 0) return;
    e.preventDefault();
    dragging = true;
    dragMoved = false;
    startMX = e.clientX;
    startMY = e.clientY;
    const rect = float.getBoundingClientRect();
    startL = rect.left;
    startT = rect.top;
    float.classList.add("tr-dragging");
    document.addEventListener("mousemove", onDragMove);
    document.addEventListener("mouseup", onDragEnd);
  });
  function onDragMove(e) {
    if (!dragging) return;
    const dx = e.clientX - startMX;
    const dy = e.clientY - startMY;
    if (!dragMoved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) dragMoved = true;
    if (dragMoved) {
      const fw = 36, fh = 36;
      let l = startL + dx;
      let t = startT + dy;
      l = Math.max(4, Math.min(l, innerWidth - fw - 4));
      t = Math.max(4, Math.min(t, innerHeight - fh - 4));
      float.style.left = l + "px";
      float.style.top = t + "px";
    }
  }
  function onDragEnd() {
    if (!dragging) return;
    dragging = false;
    float.classList.remove("tr-dragging");
    document.removeEventListener("mousemove", onDragMove);
    document.removeEventListener("mouseup", onDragEnd);
    if (dragMoved) {
      const rect = float.getBoundingClientRect();
      floatPos = { left: rect.left, top: rect.top };
      saveFloatPos();
      closeFloatMenu();
    } else {
      if (pgTranslating) {
        revertPageTranslation();
      } else {
        startPageTranslate();
      }
    }
  }
  xBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (floatMenu) closeFloatMenu();
    else showDisableMenu();
  });
  document.body.appendChild(float);
}

function removeFloat() {
  if (float) { float.remove(); float = null; }
}

async function showTransStatus(msg) {
  const t = document.createElement("div");
  t.className = "tr-toast";
  t.textContent = msg;
  document.body.appendChild(t);
  return t;
}

function clearTransStatus(el) {
  if (el) el.remove();
}

async function startPageTranslate() {
  if (isBlacklisted) {
    showToast("此网站已在网页翻译黑名单中");
    return;
  }
  if (!siteRule && pageLangDisabled) {
    showToast("此页面语言与目标语言相同，无需翻译");
    return;
  }
  if (pgTranslating) {
    revertPageTranslation();
    return;
  }
  pgTranslating = true;
  let statusEl = null;
  try {
    const rr = await sendMessage({ action: "getSiteRule", url: location.href });
    siteRule = rr?.rule || null;
  } catch { }
  if (!siteRule) {
    siteRule = GENERIC_RULE;
    statusEl = await showTransStatus("未匹配到网站规则，使用通用规则翻译");
  } else {
    statusEl = await showTransStatus(`匹配规则: ${siteRule.name}，开始翻译`);
  }
  await applyPageRule(siteRule, "auto", S.pgTL || S.selTL, S.pgEngine || "google");
  clearTransStatus(statusEl);
  if (pgTranslating) {
    showToast("翻译完成 ✓");
    if (float) float.classList.add("tr-translated");
    updateToolbarIcon();
  }
}

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
    if (!sel.isInput && isIgnored(sel.text, S.ignLangs)) return;
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
  if (e.key === "Escape") { clearAll(); revertPageTranslation(); }
}, true);

window.addEventListener("resize", () => {
  if (!float) return;
  if (!floatDragged) {
    floatPos = { right: 24, top: Math.round(innerHeight / 2 - 18) };
  }
  applyFloatPos();
});

async function init() {
  try {
    const r = await sendMessage({ action: "getSettings" });
    if (r && r.settings) S = { ...S, ...r.settings };
  } catch { }

  const targetLang = S.pgTL || S.selTL;

  if (S.blacklist?.length) {
    isBlacklisted = checkBlacklist(location.hostname, S.blacklist);
  }

  if (S.autoBlacklist?.length) {
    isAutoBlacklisted = checkBlacklist(location.hostname, S.autoBlacklist);
  }

  updateToolbarIcon();

  setupSpaUrlDetection();

  applyTheme(float, getIconUrl);
  watchTheme(() => {
    applyTheme(float, getIconUrl);
  });

  if (isBlacklisted) {
    ready = true;
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === "show-toast" && msg.msg) showToast(msg.msg);
      if (msg.action === "page-translate") startPageTranslate();
    });
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.settings) {
        S = { ...S, ...changes.settings.newValue };
        isBlacklisted = checkBlacklist(location.hostname, S.blacklist || []);
        isAutoBlacklisted = checkBlacklist(location.hostname, S.autoBlacklist || []);
      }
    });
    return;
  }

  try {
    const resp = await sendMessage({ action: "getSiteRule", url: location.href });
    if (resp?.rule) siteRule = resp.rule;
  } catch { }

  if (siteRule) {
    if (S.enPage && S.enFloat) createFloat();
    if (S.enPage && S.autoTranslate && !isAutoBlacklisted && siteRule.autoTranslate) {
      pgTranslating = true;
      const st = await showTransStatus(`匹配规则: ${siteRule.name}，自动翻译`);
      await applyPageRule(siteRule, "auto", targetLang, S.pgEngine || "google");
      clearTransStatus(st);
      if (pgTranslating && float) float.classList.add("tr-translated");
      updateToolbarIcon();
    }
  } else {
    pageLangDisabled = shouldSkipTranslation(targetLang);
    if (S.enPage && !pageLangDisabled && S.enFloat) createFloat();
    if (S.enPage && !pageLangDisabled && S.autoTranslate && !isAutoBlacklisted) {
      siteRule = GENERIC_RULE;
      const st = await showTransStatus("未匹配到规则，使用通用规则");
      await applyPageRule(GENERIC_RULE, "auto", targetLang, S.pgEngine || "google");
      clearTransStatus(st);
      updateToolbarIcon();
    }
  }

  ready = true;

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "show-toast" && msg.msg) showToast(msg.msg);
    if (msg.action === "page-translate") startPageTranslate();
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
      head.innerHTML = `<div class="tr-plang"><span style="font-size:11px;color:#6b7280">→ ${escHtml(msg.tl || '')}</span></div><button class="tr-pclose">${svgIcon("close")}</button>`;
      head.querySelector(".tr-pclose").addEventListener("click", () => clearAll());
      const body = document.createElement("div");
      body.className = "tr-pbody";
      body.innerHTML = `<div class="tr-original"><span class="tr-original-text">${escHtml((msg.text || "").substring(0, 200))}</span><button class="tr-speak-btn" data-lang="auto">${svgIcon("volume")}</button></div><div class="tr-result"><span class="tr-result-text">${escHtml(msg.result)}</span><button class="tr-speak-btn" data-lang="${escHtml(msg.tl || '')}">${svgIcon("volume")}</button></div><div class="tr-actions"><button class="tr-copy-btn">${svgIcon("copy")}Copy</button></div>`;
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
      const newTargetLang = S.pgTL || S.selTL;
      pageLangDisabled = shouldSkipTranslation(newTargetLang);
      isBlacklisted = checkBlacklist(location.hostname, S.blacklist || []);
      isAutoBlacklisted = checkBlacklist(location.hostname, S.autoBlacklist || []);
      if (S.enFloat && !isBlacklisted && (siteRule || !pageLangDisabled) && !sessionDisabled) createFloat();
      else removeFloat();
    }
  });
}

init();
