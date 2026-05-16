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
    if (/[\u1a00-\u1a1f]/.test(text)) return "vi";
    if (/[\u0900-\u097f]/.test(text)) return "hi";
    if (/[a-zA-Z]/.test(text)) return "en";
    return null;
  }

  function escHtml(s) {
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

  function sendMessage(msg) {
    return chrome.runtime.sendMessage(msg);
  }

  const icons = {
    translate: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"><path d="M5 8l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 4h7a2 2 0 012 2v12a2 2 0 01-2 2h-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 8h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 12h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 16h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
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
    volume: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>',
  };

  function svgIcon(name) {
    return icons[name] || "";
  }

  let currentAudio = null;

  function clearSpeakingBtn() {
    const btn = document.querySelector(".tr-speak-btn.speaking");
    if (btn) btn.classList.remove("speaking");
  }

  function stopSpeak() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; currentAudio = null; }
    clearSpeakingBtn();
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
      utter.addEventListener("error", () => { clearSpeakingBtn(); speakGoogleTTS(text, ttsLang); });
      speechSynthesis.speak(utter);
      return;
    }

    speakGoogleTTS(text, ttsLang);
  }

  function speakGoogleTTS(text, lang) {
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=dict-chrome-ex`;
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
        btn.textContent = l.n;
        btn.dataset.code = l.c;
        list.querySelectorAll(".tr-dd-item").forEach((it) => it.classList.remove("tr-dd-active"));
        item.classList.add("tr-dd-active");
        closeDropdown();
        if (onChange) onChange(l.c);
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
    } catch {}
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
        if (p.tagName === "INPUT" || p.tagName === "TEXTAREA") { actInput = p; break; }
        p = p.parentElement;
      }
    }

    return { text: txt, isInput: !!actInput, el: actInput };
  }

  function showToolbar(x, y, txt, isInput, S) {
    clearAll();

    tBar = document.createElement("div");
    tBar.className = "tr-bar";
    tBar.innerHTML = `<button class="tr-btn tr-primary" id="tr-translate-btn">${svgIcon("translate")}<span>翻译</span></button>`;
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

    const srcDD = buildDropdown("tr-panel-src", "auto", true, () => {}, true, panel);
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

})();
