(function () {
  'use strict';

  const LANG_CODES = [
    "auto", "zh-CN", "zh-TW", "en", "ja", "ko", "fr", "de", "es",
    "pt", "ru", "ar", "th", "vi", "id", "it", "nl", "pl", "tr", "hi",
  ];

  const LANG_NAMES = {
    auto: "Detect", "zh-CN": "中文(简体)", "zh-TW": "中文(繁体)",
    en: "English", ja: "日本語", ko: "한국어", fr: "Français",
    de: "Deutsch", es: "Español", pt: "Português", ru: "Русский",
    ar: "العربية", th: "ไทย", vi: "Tiếng Việt", id: "Indonesia",
    it: "Italiano", nl: "Nederlands", pl: "Polski", tr: "Türkçe", hi: "हिन्दी",
  };

  const LANGS = LANG_CODES.map((code) => ({ code, name: LANG_NAMES[code] }));

  const ENGINES = [
    { id: "google", name: "Google" },
    { id: "bing", name: "Bing" },
  ];

  const IGNORE_TAGS = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "SELECT",
    "CODE", "KBD", "SVG", "MATH", "INPUT", "BUTTON",
    "IMG", "VIDEO", "AUDIO", "IFRAME", "OBJECT", "EMBED",
    "CANVAS", "MAP", "AREA", "TRACK", "WBR", "BR",
  ]);

  const TTS_LANG_MAP = {
    "auto": "en", "zh-CN": "zh-CN", "zh-TW": "zh-TW", "en": "en",
    "ja": "ja", "ko": "ko", "fr": "fr", "de": "de", "es": "es",
    "pt": "pt", "ru": "ru", "ar": "ar", "th": "th", "vi": "vi",
    "id": "id", "it": "it", "nl": "nl", "pl": "pl", "tr": "tr", "hi": "hi",
  };

  function detectTextLang(text) {
    if (/[\u4e00-\u9fff]/.test(text)) {
      if (!/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return "zh-CN";
    }
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return "ja";
    if (/[\uac00-\ud7af]/.test(text)) return "ko";
    if (/[\u0400-\u04ff]/.test(text)) return "ru";
    if (/[\u0600-\u06ff]/.test(text)) return "ar";
    if (/[\u0e00-\u0e7f]/.test(text)) return "th";
    if (/[\u0100-\u01ef\u0300-\u033f]/.test(text)) return "vi";
    if (/[\u0900-\u097f]/.test(text)) return "hi";
    if (/[a-zA-Z]/.test(text)) return "en";
    return null;
  }

  function escHtml(s) {
    if (s == null) return "";
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function isIgnored(text, ignLangs) {
    if (!ignLangs || !ignLangs.length) return false;
    const detected = detectTextLang(text);
    if (!detected) return false;
    return ignLangs.some((ign) => {
      if (ign === detected) return true;
      return ign.split("-")[0] === detected.split("-")[0];
    });
  }

  function isBlacklisted$1(hostname, blacklist) {
    if (!Array.isArray(blacklist)) return false;
    return blacklist.some((pattern) => {
      if (typeof pattern !== "string") return false;
      if (pattern.startsWith("*.")) {
        const base = pattern.slice(2);
        return hostname === base || hostname.endsWith("." + base);
      }
      return hostname === pattern || hostname.endsWith("." + pattern);
    });
  }

  function sendMessage(msg) {
    return chrome.runtime.sendMessage(msg);
  }

  const icons = {
    translate: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1.5" y="1.5" width="17" height="17" rx="3.5"/><path d="M6.5 11.5l3.5-6 3.5 6"/><path d="M8 10h4"/></svg>',
    copy: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"><polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    replace: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"><polyline points="17 1 21 5 17 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 11V9a4 4 0 014-4h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="7 23 3 19 7 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 13v2a4 4 0 01-4 4H3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ban: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" stroke-width="2"/></svg>',
    revert: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><polyline points="1 4 1 10 7 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    settings: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    eyeOff: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
    clock: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    powerOff: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 11-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>',
    autoOff: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><polygon points="10,8 10,16 16,12"/></svg>',
    volume: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>',
  };

  function svgIcon(name) {
    return icons[name] || "";
  }

  let currentAudio = null;

  function clearSpeakingBtn() {
    document.querySelectorAll(".tr-speak-btn.speaking").forEach((btn) => btn.classList.remove("speaking"));
  }

  function stopSpeak() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; currentAudio = null; }
    clearSpeakingBtn();
  }

  async function isRemoteTTSAllowed() {
    try {
      const r = await chrome.storage.local.get(["settings"]);
      return r.settings?.allowRemoteTTS === true;
    } catch { return false; }
  }

  function speak(text, lang) {
    stopSpeak();
    const ttsLang = TTS_LANG_MAP[lang] || "en";

    if (window.speechSynthesis) {
      const voices = speechSynthesis.getVoices();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = ttsLang;
      utter.rate = 1;
      const matched = voices.find((v) => v.lang === ttsLang);
      if (matched) utter.voice = matched;
      utter.addEventListener("end", () => clearSpeakingBtn());
      utter.addEventListener("error", async () => {
        clearSpeakingBtn();
        if (await isRemoteTTSAllowed()) {
          speakGoogleTTS(text, ttsLang);
        }
      });
      speechSynthesis.speak(utter);
      return;
    }

    isRemoteTTSAllowed().then((allowed) => {
      if (allowed) speakGoogleTTS(text, ttsLang);
    });
  }

  function speakGoogleTTS(text, lang) {
    const truncated = text.length > 200 ? text.substring(0, 200) : text;
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(truncated)}&tl=${lang}&client=dict-chrome-ex`;
    const audio = new Audio(url);
    currentAudio = audio;
    const onDone = () => { currentAudio = null; clearSpeakingBtn(); };
    audio.addEventListener("ended", onDone);
    audio.addEventListener("error", onDone);
    audio.play().catch(onDone);
  }

  let openDropdown = null;

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

  function isEditable(el) {
    return !!(el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable));
  }

  function doReplace(translated, actInput, selText, showToastFn) {
    if (!actInput || !selText) return;
    try {
      if (actInput.tagName === "INPUT" || actInput.tagName === "TEXTAREA") {
        const st = actInput.selectionStart, en = actInput.selectionEnd;
        if (actInput.value.substring(st, en) !== selText) {
          showToastFn("选择区域已变化，请重新选择");
          return;
        }
        actInput.setRangeText(translated, st, en, "select");
        actInput.dispatchEvent(new Event("input", { bubbles: true }));
        actInput.dispatchEvent(new Event("change", { bubbles: true }));
      } else if (actInput.isContentEditable) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(translated));
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
      showToastFn("Replaced ✓");
    } catch (e) {
      showToastFn("替换失败");
    }
  }

  let tBar = null;
  let panel = null;
  let busy = false;
  let hoverTimer = null;
  let panelTimer = null;
  let actInput = null;
  let selText = "";
  let lastX = 0;
  let lastY = 0;
  function setTBar(v) { tBar = v; }
  function setPanel(v) { panel = v; }
  function getLastX() { return lastX; }
  function getLastY() { return lastY; }
  function setLastX(v) { lastX = v; }
  function setLastY(v) { lastY = v; }

  function clearAll() {
    closeDropdown();
    if (tBar) { tBar.remove(); tBar = null; }
    if (panel) { panel.remove(); panel = null; }
    if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
    if (panelTimer) { clearTimeout(panelTimer); panelTimer = null; }
    busy = false;
  }

  function getSelection() {
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

  function showToolbar(x, y, txt, isInput, S) {
    clearAll();

    tBar = document.createElement("div");
    tBar.className = "tr-bar";
    tBar.innerHTML = `<button class="tr-btn tr-primary tr-btn-icon" id="tr-translate-btn">${svgIcon("translate")}</button>`;
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

  function showPanel(txt, tl, engine) {
    if (busy) return;
    if (panel) { panel.remove(); panel = null; }
    busy = true;

    const curEngine = engine;

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
      srcBtn ? srcBtn.dataset.code : "auto";
      const tgtBtn = panel.querySelector("#tr-panel-tgt");
      const newTL = tgtBtn ? tgtBtn.dataset.code : tl;
      reTranslate(txt, newTL, eng);
    }, panel);

    langWrap.appendChild(engineDD);

    const closeBtn = document.createElement("button");
    closeBtn.className = "tr-pclose";
    closeBtn.innerHTML = svgIcon("close");
    closeBtn.addEventListener("click", () => clearAll());

    head.appendChild(langWrap);
    head.appendChild(closeBtn);

    const body = document.createElement("div");
    body.className = "tr-pbody";
    body.innerHTML = `
    <div class="tr-original">${escHtml(txt.substring(0, 200))}</div>
    <div class="tr-loading"><span class="tr-spinner"></span>Translating...</div>
  `;

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

  async function doTranslate(txt, sl, tl, engine) {
    const loadingEl = panel && panel.querySelector(".tr-loading");
    if (!panel) return;
    try {
      const r = await sendMessage({ action: "translate", text: txt, sourceLang: sl, targetLang: tl, engine: engine || "google" });
      if (r.success && panel) {
        const body = panel.querySelector(".tr-pbody");
        const isInput = actInput && isEditable(actInput);
        const srcLang = sl || "auto";
        body.innerHTML = `
        <div class="tr-original"><span class="tr-original-text">${escHtml(txt.substring(0, 200))}</span><button class="tr-speak-btn" data-lang="${srcLang}">${svgIcon("volume")}</button></div>
        <div class="tr-result"><span class="tr-result-text">${escHtml(r.result)}</span><button class="tr-speak-btn" data-lang="${tl}">${svgIcon("volume")}</button></div>
        <div class="tr-actions">
          <button class="tr-copy-btn">${svgIcon("copy")}Copy</button>
          ${isInput ? `<button class="tr-replace-btn">${svgIcon("replace")}Replace</button>` : ""}
        </div>
      `;
        requestAnimationFrame(() => positionPanel(panel, tBar));
        attachSpeakHandlers(body);
        attachCopyHandler(body.querySelector(".tr-copy-btn"), r.result);
        const rpBtn = body.querySelector(".tr-replace-btn");
        if (rpBtn) rpBtn.addEventListener("click", () => { doReplace(r.result, actInput, selText, showToast); clearAll(); });
      } else if (!r.success && panel && loadingEl) {
        loadingEl.outerHTML = `<div class="tr-result" style="color:#ef4444;">Translation failed: ${escHtml(r.error || "unknown error")}</div>`;
        requestAnimationFrame(() => positionPanel(panel, tBar));
      }
    } catch (e) {
      if (panel && loadingEl) loadingEl.outerHTML = `<div class="tr-result" style="color:#ef4444;">Error: ${escHtml(e.message)}</div>`;
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
    body.innerHTML = `<div class="tr-original">${escHtml(txt.substring(0, 200))}</div><div class="tr-loading"><span class="tr-spinner"></span>Translating...</div>`;
    doTranslate(txt, sl, newTL, engine || "google");
  }

  const UNIVERSAL_EXCLUDE_SELECTORS = [
    "[contenteditable=\"true\"]",
    ".notranslate",
    "[translate=\"no\"]",
    ".material-icons",
    "material-icon",
    "i.fa",
    "i[class^=fa-]",
    ".google-symbols",
    "span[class^=material-symbols-]",
    "time",
    ".countdown",
    ".visuallyhidden",
    ".social-share",
    ".prism-code",
    ".enlighter-code",
    ".rc-CodeBlock",
    "[role=code]",
    "[role=group]",
    "div[class^=codeBlockContent]",
    "div[class^=codeBlockLines]",
    "table.highlight",
    "div[data-paste-markdown-skip]",
    ".reference-citations",
    "cds-code-snippet",
    ".interactive-markdown__code",
    "#ace-editor",
    ".jp-CodeMirrorEditor",
    "[data-test='json-editor']",
    "table.processedcode",
    "[value=ka]",
    "times",
    "[data-ez-translated]",
    "[data-click-id]",
    "#immersive-translate-popup",
    "#immersive-translate-float-ball",
    "#monica-content-root",
    "script",
    "style",
    "noscript",
  ];
  const STAY_ORIGINAL_SELECTORS = [
    "span.katex",
    ".math-block",
    ".MathJax_Preview",
    ".MathJax_Display",
    ".math-container",
    ".MathJax",
    ".MathJax_SVG",
    "math-renderer",
    ".mwe-math-element",
    "kbd",
    "pre code",
    ".code",
    ".snippet-code",
    ".lang-",
    ".blob-code",
    ".CodeMirror",
    ".react-code-text",
    ".reference",
    ".citation",
  ];
  const STAY_ORIGINAL_TAGS = new Set([
    "CODE", "TT", "IMG", "SUP", "SUB", "SAMP",
    "MATH", "SEMANTICS", "MROW", "MO", "MFRAC",
    "MSUP", "MI", "MN", "MSQRT", "D-MATH",
    "MTEXT", "MSUB", "MSUBSUP", "MUNDER", "MOVER",
    "MUNDEROVER", "MTABLE", "MTR", "MTD", "MLABELEDTR",
    "MPADDED", "MPHANTOM", "MSPACE",
  ]);
  const SEMANTIC_MARKERS = {
    "header": { "default-translate": "no" },
    "nav": { "side": "1", "default-translate": "no" },
    "footer:last-of-type": { "default-translate": "no" },
  };
  function applySemanticMarkers() {
    for (const [sel, attrs] of Object.entries(SEMANTIC_MARKERS)) {
      try {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          for (const [key, val] of Object.entries(attrs)) {
            if (!el.hasAttribute(key)) el.setAttribute(key, val);
          }
        }
      } catch { }
    }
  }
  function buildExcludeSet(excludeSelectors) {
    const excluded = new Set();
    for (const sel of UNIVERSAL_EXCLUDE_SELECTORS) {
      try { for (const el of document.querySelectorAll(sel)) excluded.add(el); } catch { }
    }
    for (const sel of STAY_ORIGINAL_SELECTORS) {
      try { for (const el of document.querySelectorAll(sel)) excluded.add(el); } catch { }
    }
    for (const sel of (excludeSelectors || [])) {
      try { for (const el of document.querySelectorAll(sel)) excluded.add(el); } catch { }
    }
    return excluded;
  }
  function shouldSkipText(text, tl) {
    if (!text) return true;
    const trimmed = text.trim();
    if (!trimmed) return true;
    if (trimmed.length < 2) return true;
    if (/^\d+$/.test(trimmed)) return true;
    if (/^[\s\W]*$/.test(trimmed)) return true;
    const words = trimmed.split(/\s+/).filter(w => /\w/.test(w));
    if (words.length < 1) return true;
    if (tl) {
      const tlLower = tl.toLowerCase();
      if (tlLower.startsWith("zh") && /[\u4e00-\u9fff]/.test(trimmed)) return true;
      if (tlLower === "ja" && /[\u3040-\u309f\u30a0-\u30ff]/.test(trimmed)) return true;
      if (tlLower === "ko" && /[\uac00-\ud7af]/.test(trimmed)) return true;
    }
    return false;
  }
  function shouldSkipElement(el, excluded) {
    while (el) {
      if (excluded.has(el)) return true;
      el = el.parentElement;
    }
    return false;
  }

  const MARKER = 'data-ez-translated';
  const MAX_TEXT_LENGTH_PER_REQUEST = 1800;
  const MAX_TEXT_GROUP_LENGTH = 50;
  const TRANSLATION_CACHE_KEY_PREFIX = 'tr-cache:';
  const DEFER_CHARS_PER_FRAME = 5000;

  let injectedCssCache = new Set();

  function injectRuleCss(cssRules) {
    if (!cssRules?.length) return;
    const key = cssRules.join('|');
    if (injectedCssCache.has(key)) return;
    injectedCssCache.add(key);
    try {
      const style = document.createElement('style');
      style.setAttribute('data-ez-css', '');
      style.textContent = cssRules.join('\n');
      document.head.appendChild(style);
    } catch { }
  }

  function applyGlobalStyles(styles) {
    if (!styles) return;
    try {
      const styleId = 'ez-global-styles';
      if (document.getElementById(styleId)) return;
      const css = Object.entries(styles)
        .map(([sel, rules]) => `${sel} { ${rules} }`)
        .join('\n');
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = css;
      document.head.appendChild(style);
    } catch { }
  }

  function applyFixedElements(fixedElements) {
    if (!fixedElements?.length) return;
    for (const { selector, text } of fixedElements) {
      const els = document.querySelectorAll(selector);
      for (const el of els) {
        if (el.getAttribute(MARKER)) continue;
        const txt = el.textContent.trim();
        if (txt && txt !== text) {
          el.textContent = text;
          el.setAttribute(MARKER, 'fixed');
        }
      }
    }
  }

  function collectVisibleTextNodes(root, excluded, skipTags) {
    const nodes = [];
    try {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent.trim();
        if (!text) continue;
        const parent = node.parentElement;
        if (!parent) continue;
        if (parent.closest(`[${MARKER}]`)) continue;
        if (shouldSkipElement(parent, excluded)) continue;
        if (skipTags.has(parent.tagName)) continue;
        nodes.push(node);
      }
    } catch { }
    return nodes;
  }

  function walkShadowText(root, excluded, skipTags, nodes, excludeSlots, enterShadow) {
    if (root.nodeType === Node.ELEMENT_NODE) {
      if (excludeSlots?.length) {
        const slot = root.getAttribute('slot');
        if (slot && excludeSlots.includes(slot)) return;
      }
    }
    if (root.nodeType === Node.TEXT_NODE) {
      const parent = root.parentElement;
      if (!parent) return;
      if (parent.closest(`[${MARKER}]`)) return;
      if (shouldSkipElement(parent, excluded)) return;
      if (skipTags.has(parent.tagName)) return;
      if (!root.textContent.trim()) return;
      nodes.push(root);
      return;
    }
    if (enterShadow !== false && root.shadowRoot) {
      walkShadowText(root.shadowRoot, excluded, skipTags, nodes, excludeSlots, enterShadow);
    }
    let child = root.firstChild;
    while (child) {
      walkShadowText(child, excluded, skipTags, nodes, excludeSlots, enterShadow);
      child = child.nextSibling;
    }
  }

  function collectByContainerMode(rule) {
    const containers = document.querySelectorAll(rule.containerSelector);
    if (!containers.length) return [];
    const excluded = buildExcludeSet(rule.excludeSelectors);
    if (rule.excludeSlots?.length) {
      for (const container of containers) {
        const allElements = container.querySelectorAll('*');
        for (let i = 0; i < allElements.length; i++) {
          const slot = allElements[i].getAttribute('slot');
          if (slot && rule.excludeSlots.includes(slot)) excluded.add(allElements[i]);
        }
      }
    }
    const blockTags = new Set(rule.extraBlockSelectors || []);
    const skipTags = new Set([...IGNORE_TAGS, ...(rule.extraBlockTags || []), ...STAY_ORIGINAL_TAGS, ...blockTags]);
    const nodes = [];
    const enterShadow = !rule.shadowSelectors?.length;
    for (const root of containers) {
      walkShadowText(root, excluded, skipTags, nodes, rule.excludeSlots, enterShadow);
    }
    if (rule.shadowSelectors?.length) {
      for (const sel of rule.shadowSelectors) {
        const parts = sel.split(' >>> ');
        if (parts.length === 2) {
          const hosts = document.querySelectorAll(parts[0]);
          for (const host of hosts) {
            if (host.shadowRoot) {
              const targets = host.shadowRoot.querySelectorAll(parts[1]);
              for (const target of targets) {
                if (target.getAttribute(MARKER)) continue;
                if (excluded.has(target)) continue;
                const inner = collectVisibleTextNodes(target, excluded, skipTags);
                nodes.push(...inner);
              }
            }
          }
        } else {
          for (const el of document.querySelectorAll(sel)) {
            if (el.getAttribute(MARKER)) continue;
            if (excluded.has(el)) continue;
            const inner = collectVisibleTextNodes(el, excluded, skipTags);
            nodes.push(...inner);
          }
        }
      }
    }
    return nodes;
  }

  function collectBySelectMode(rule) {
    const selectors = rule.selectors;
    if (!selectors?.length) return [];
    const excluded = buildExcludeSet(rule.excludeSelectors);
    const blockTags = new Set(rule.extraBlockSelectors || []);
    const skipTags = new Set([...IGNORE_TAGS, ...STAY_ORIGINAL_TAGS, ...blockTags]);
    const nodes = [];
    for (const sel of selectors) {
      if (sel.includes(' >>> ')) {
        const parts = sel.split(' >>> ');
        if (parts.length === 2) {
          const hosts = document.querySelectorAll(parts[0]);
          for (const host of hosts) {
            if (host.shadowRoot) {
              const targets = host.shadowRoot.querySelectorAll(parts[1]);
              for (const target of targets) {
                if (target.getAttribute(MARKER)) continue;
                if (excluded.has(target)) continue;
                const inner = collectVisibleTextNodes(target, excluded, skipTags);
                nodes.push(...inner);
              }
            }
          }
        }
      } else if (sel.includes(' -> ')) {
        const parts = sel.split(' -> ').map(s => s.trim());
        let current = document;
        for (let i = 0; i < parts.length; i++) {
          const isLast = i === parts.length - 1;
          const found = current.querySelectorAll(parts[i]);
          if (!found.length) break;
          if (isLast) {
            for (const el of found) {
              if (el.getAttribute(MARKER)) continue;
              if (excluded.has(el)) continue;
              const inner = collectVisibleTextNodes(el, excluded, skipTags);
              nodes.push(...inner);
            }
          } else {
            const next = found[0];
            current = next.shadowRoot || next;
          }
        }
      } else {
        let els = document.querySelectorAll(sel);
        for (const el of els) {
          if (el.getAttribute(MARKER)) continue;
          if (excluded.has(el)) continue;
          const inner = collectVisibleTextNodes(el, excluded, skipTags);
          nodes.push(...inner);
        }
        for (const host of document.querySelectorAll('*')) {
          if (!host.shadowRoot) continue;
          try {
            els = host.shadowRoot.querySelectorAll(sel);
            for (const el of els) {
              if (el.getAttribute(MARKER)) continue;
              if (excluded.has(el)) continue;
              const inner = collectVisibleTextNodes(el, excluded, skipTags);
              nodes.push(...inner);
            }
          } catch { }
        }
      }
    }
    return nodes;
  }

  function collectTargetNodes(rule) {
    if (rule.selectors?.length) return collectBySelectMode(rule);
    return collectByContainerMode(rule);
  }

  function splitTextIntoGroups(nodes, maxLength, maxGroupLength) {
    const groups = [];
    let currentGroup = [];
    let currentLength = 0;
    for (const node of nodes) {
      const text = node.textContent.trim();
      if (!text) continue;
      if (text.length > maxLength) {
        if (currentGroup.length) {
          groups.push(currentGroup);
          currentGroup = [];
          currentLength = 0;
        }
        groups.push([node]);
        continue;
      }
      if (currentLength + text.length > maxLength || currentGroup.length >= maxGroupLength) {
        if (currentGroup.length) {
          groups.push(currentGroup);
          currentGroup = [];
          currentLength = 0;
        }
      }
      currentGroup.push(node);
      currentLength += text.length;
    }
    if (currentGroup.length) groups.push(currentGroup);
    return groups;
  }

  let translationCache = new Map();
  let translationCacheSize = 0;
  const CACHE_SIZE_LIMIT = 5000;

  function getCacheKey(text, sl, tl, engine) {
    return `${TRANSLATION_CACHE_KEY_PREFIX}${engine}:${sl}->${tl}:${text.length}:${text.substring(0, 50)}`;
  }

  function cacheGet(key) {
    const entry = translationCache.get(key);
    if (entry) return entry;
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        translationCache.set(key, stored);
        translationCacheSize++;
        return stored;
      }
    } catch { }
    return null;
  }

  function cacheSet(key, value) {
    translationCache.set(key, value);
    translationCacheSize++;
    if (translationCacheSize > CACHE_SIZE_LIMIT) {
      const firstKey = translationCache.keys().next().value;
      if (firstKey !== undefined) {
        translationCache.delete(firstKey);
        translationCacheSize--;
      }
    }
    try {
      if (translationCacheSize <= 200) {
        sessionStorage.setItem(key, value);
      }
    } catch { }
  }

  async function translateNodes(nodes, sl, tl, engine, languageFilter) {
    if (!nodes.length) return 0;
    const maxLength = MAX_TEXT_LENGTH_PER_REQUEST;
    const maxGroupLength = MAX_TEXT_GROUP_LENGTH;
    const groups = splitTextIntoGroups(nodes, maxLength, maxGroupLength);
    let translated = 0;
    let charsThisFrame = 0;
    for (const group of groups) {
      const toTranslate = [];
      const cached = [];
      for (const node of group) {
        const text = node.textContent.trim();
        if (shouldSkipText(text, languageFilter === 'skip-target' ? tl : null)) continue;
        const key = getCacheKey(text, sl, tl, engine);
        const cachedResult = cacheGet(key);
        if (cachedResult) {
          cached.push({ node, text: cachedResult, original: text });
        } else {
          toTranslate.push({ node, text, key });
        }
      }
      for (const { node, text, original } of cached) {
        if (!node.parentNode) continue;
        const span = document.createElement('span');
        span.textContent = text;
        span.setAttribute(MARKER, 'page');
        span.setAttribute('data-ez-original', original);
        node.parentNode.replaceChild(span, node);
        translated++;
      }
      if (toTranslate.length) {
        const texts = toTranslate.map(t => t.text);
        for (const { node } of toTranslate) {
          if (!node.parentNode) continue;
          const placeholder = document.createElement('span');
          placeholder.className = 'tr-translating';
          placeholder.setAttribute(MARKER, 'translating');
          placeholder.textContent = node.textContent;
          node.parentNode.replaceChild(placeholder, node);
          node._placeholder = placeholder;
        }
        try {
          const r = await sendMessage({
            action: "translateBatch",
            texts,
            sourceLang: sl,
            targetLang: tl,
            engine
          });
          if (r?.success && Array.isArray(r.results)) {
            for (let i = 0; i < toTranslate.length; i++) {
              const { node, key } = toTranslate[i];
              const resultText = r.results[i];
              if (resultText == null) continue;
              const placeholder = node._placeholder;
              if (!placeholder || !placeholder.parentNode) continue;
              const original = node.textContent.trim();
              cacheSet(key, resultText);
              const span = document.createElement('span');
              span.textContent = resultText;
              span.setAttribute(MARKER, 'page');
              span.setAttribute('data-ez-original', original);
              placeholder.parentNode.replaceChild(span, placeholder);
              translated++;
            }
          } else {
            for (const { node } of toTranslate) {
              const ph = node._placeholder;
              if (ph && ph.parentNode) {
                ph.parentNode.replaceChild(node, ph);
              }
            }
          }
        } catch {
          for (const { node } of toTranslate) {
            const ph = node._placeholder;
            if (ph && ph.parentNode) {
              ph.parentNode.replaceChild(node, ph);
            }
          }
        }
      }
      charsThisFrame += group.reduce((sum, node) => sum + node.textContent.length, 0);
      if (charsThisFrame >= DEFER_CHARS_PER_FRAME) {
        await new Promise(r => requestAnimationFrame(r));
        charsThisFrame = 0;
      }
    }
    return translated;
  }

  let observer = null;
  let pollTimer = null;
  let retranslateTimer = null;
  let currentRule = null;
  let currentSl = null;
  let currentTl = null;
  let currentEngine = null;

  async function retranslate() {
    if (retranslateTimer) return;
    retranslateTimer = setTimeout(() => { retranslateTimer = null; }, 300);
    const nodes = collectTargetNodes(currentRule);
    if (nodes.length) {
      await translateNodes(nodes, currentSl, currentTl, currentEngine, currentRule.languageFilter);
    }
  }

  function startObserver() {
    if (observer) observer.disconnect();
    let pending = false;
    const callback = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        retranslate();
      });
    };
    observer = new MutationObserver(callback);
    observer.observe(document.body, { childList: true, subtree: true });
    let polls = 0;
    pollTimer = setInterval(() => {
      if (document.hidden) return;
      if (polls++ > 60) {
        clearInterval(pollTimer);
        pollTimer = setInterval(() => {
          if (document.hidden) return;
          retranslate();
        }, 5000);
        return;
      }
      retranslate();
    }, 2000);
  }

  function stopObserver() {
    if (observer) { observer.disconnect(); observer = null; }
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (retranslateTimer) { clearTimeout(retranslateTimer); retranslateTimer = null; }
    currentRule = null;
  }

  async function waitForContainers(containerSelector, maxRetries = 30, delay = 200) {
    if (!containerSelector) return [];
    for (let i = 0; i < maxRetries; i++) {
      const els = document.querySelectorAll(containerSelector);
      if (els.length) return els;
      await new Promise(r => setTimeout(r, delay));
    }
    return document.querySelectorAll(containerSelector);
  }

  async function waitForSelectors(selectors, maxRetries = 30, delay = 200) {
    for (let i = 0; i < maxRetries; i++) {
      for (const sel of selectors) {
        const cleanSel = sel.split(' >>> ')[0].split(' -> ')[0].trim();
        if (document.querySelectorAll(cleanSel).length) return true;
      }
      await new Promise(r => setTimeout(r, delay));
    }
    return false;
  }

  async function applyPageRule(rule, sl, tl, engine) {
    applySemanticMarkers();
    applyFixedElements(rule.fixedElements);

    if (rule.injectedCss?.length) injectRuleCss(rule.injectedCss);
    if (rule.globalStyles) applyGlobalStyles(rule.globalStyles);

    if (rule.selectors?.length) {
      await waitForSelectors(rule.selectors);
    } else if (rule.containerSelector) {
      await waitForContainers(rule.containerSelector);
    }
    currentRule = rule;
    currentSl = sl;
    currentTl = tl;
    currentEngine = engine;
    const nodes = collectTargetNodes(rule);
    if (nodes.length) {
      await translateNodes(nodes, sl, tl, engine, rule.languageFilter);
    }
    startObserver();
  }

  let isDark = false;
  let themeObserver = null;
  let applyingTheme = false;

  function applyTheme(floatEl, getIconUrlFn) {
    if (applyingTheme) return;
    applyingTheme = true;
    detectDark();
    if (isDark) document.documentElement.setAttribute("data-tr-theme", "dark");
    else document.documentElement.removeAttribute("data-tr-theme");
    applyingTheme = false;
  }

  function detectDark() {
    isDark = false;
    const el = document.documentElement;
    if (!el) return;
    const cs = el.getAttribute("data-color-mode") || el.getAttribute("data-theme") || "";
    if (cs.includes("dark")) { isDark = true; return; }
    const cl = el.className || "";
    if (/\b(dark|night|moon)\b/i.test(cl)) { isDark = true; return; }
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      isDark = true;
      return;
    }
    const bg = window.getComputedStyle(el).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
      const m = bg.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (m) {
        const lum = (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
        if (lum < 0.5) { isDark = true; return; }
      }
    }
  }

  function watchTheme(applyThemeFn) {
    if (themeObserver) return;
    themeObserver = new MutationObserver(() => {
      requestAnimationFrame(() => applyThemeFn());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme", "color"] });
    if (document.body) {
      themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "style", "data-theme", "color"] });
    }
  }

  function getIconUrl() {
    return chrome.runtime.getURL(isDark ? "assets/dark-256.png" : "assets/256.png");
  }

  const GENERIC_RULE = {
    name: "通用规则",
    selectors: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "article", "main", "section", "blockquote", "li", "td", "th", "figcaption", "details", "summary", "label", "dd", "dt"],
    excludeMatches: [],
    autoTranslate: true,
    translateUI: false,
  };

  const LS_PREFIX = "ez-translate:";

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
      onUrlChange();
      return result;
    };

    history.replaceState = function (...args) {
      const result = origReplaceState(...args);
      onUrlChange();
      return result;
    };

    window.addEventListener("popstate", () => onUrlChange());
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

    if (!siteRule && shouldSkipTranslation(targetLang)) return;

    if (siteRule) {
      if (S.autoTranslate && !isAutoBlacklisted && siteRule.autoTranslate) {
        pgTranslating = true;
        await applyPageRule(siteRule, "auto", targetLang, S.pgEngine || "google");
        if (pgTranslating && float) float.classList.add("tr-translated");
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

  function revertPageTranslation() {
    stopObserver();
    document.querySelectorAll("[data-ez-translated='page']").forEach((el) => {
      if (el.hasAttribute('data-ez-original')) {
        const original = el.getAttribute('data-ez-original');
        const textNode = document.createTextNode(original);
        el.parentNode.replaceChild(textNode, el);
      }
    });
    document.querySelectorAll("[data-ez-translated='fixed']").forEach((el) => {
      el.removeAttribute("data-ez-translated");
    });
    pgTranslating = false;
    if (float) float.classList.remove("tr-translated");
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
    if (float || isBlacklisted || (!siteRule && pageLangDisabled) || sessionDisabled) return;
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
      statusEl = await showTransStatus("未匹配到网站规则，使用通用规则翻译");
    } else {
      statusEl = await showTransStatus(`匹配规则: ${siteRule.name}，开始翻译`);
    }
    await applyPageRule(siteRule, "auto", S.pgTL || S.selTL, S.pgEngine || "google");
    clearTransStatus(statusEl);
    if (pgTranslating) {
      showToast("翻译完成 ✓");
      if (float) float.classList.add("tr-translated");
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
      isBlacklisted = isBlacklisted$1(location.hostname, S.blacklist);
    }

    if (S.autoBlacklist?.length) {
      isAutoBlacklisted = isBlacklisted$1(location.hostname, S.autoBlacklist);
    }

    try {
      if (sessionStorage.getItem(LS_PREFIX + "tr-float-disabled") === "1") sessionDisabled = true;
    } catch { }

    setupSpaUrlDetection();

    applyTheme();
    watchTheme(() => {
      applyTheme();
      if (float) {
        const img = float.querySelector("img");
        if (img) img.src = getIconUrl();
      }
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
          isBlacklisted = isBlacklisted$1(location.hostname, S.blacklist || []);
          isAutoBlacklisted = isBlacklisted$1(location.hostname, S.autoBlacklist || []);
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
      }
    } else {
      pageLangDisabled = shouldSkipTranslation(targetLang);
      if (S.enPage && !pageLangDisabled && S.enFloat) createFloat();
      if (S.enPage && !pageLangDisabled && S.autoTranslate && !isAutoBlacklisted) {
        siteRule = GENERIC_RULE;
        const st = await showTransStatus("未匹配到规则，使用通用规则");
        await applyPageRule(GENERIC_RULE, "auto", targetLang, S.pgEngine || "google");
        clearTransStatus(st);
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
        isBlacklisted = isBlacklisted$1(location.hostname, S.blacklist || []);
        isAutoBlacklisted = isBlacklisted$1(location.hostname, S.autoBlacklist || []);
        if (S.enFloat && !isBlacklisted && (siteRule || !pageLangDisabled) && !sessionDisabled) createFloat();
        else removeFloat();
      }
    });
  }

  init();

})();
