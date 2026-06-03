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
    if (!text) return null;
    const stripped = text.replace(/[\s\d!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~\u00A0-\u00BF\u2000-\u206F\u3000-\u303F]/g, '');
    const total = stripped.length;
    if (total < 2) return null;

    const zh = (stripped.match(/[\u4e00-\u9fff]/g) || []).length;
    const ja = (stripped.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
    const ko = (stripped.match(/[\uac00-\ud7af]/g) || []).length;
    const ru = (stripped.match(/[\u0400-\u04ff]/g) || []).length;
    const ar = (stripped.match(/[\u0600-\u06ff]/g) || []).length;
    const th = (stripped.match(/[\u0e00-\u0e7f]/g) || []).length;
    const vi = (stripped.match(/[\u0100-\u01ef\u0300-\u033f]/g) || []).length;
    const hi = (stripped.match(/[\u0900-\u097f]/g) || []).length;
    const en = (stripped.match(/[a-zA-Z]/g) || []).length;

    if (ko / total > 0.1) return "ko";
    if (ja / total > 0.1) return "ja";
    if (zh * 2.5 / total > 0.5) return "zh-CN";
    if (ru > total * 0.4) return "ru";
    if (ar > total * 0.4) return "ar";
    if (th > total * 0.4) return "th";
    if (vi > total * 0.4) return "vi";
    if (hi > total * 0.4) return "hi";
    if (en > total * 0.3) return "en";
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

  const NON_TEXT_INPUT_TYPES = new Set([
    "checkbox", "radio", "submit", "reset", "button", "image",
    "file", "hidden", "range", "color", "date", "datetime-local",
    "month", "week", "time", "number",
  ]);

  function isEditable(el) {
    if (!el) return false;
    if (el.tagName === "TEXTAREA") return true;
    if (el.tagName === "INPUT") {
      const type = (el.getAttribute("type") || "text").toLowerCase();
      if (NON_TEXT_INPUT_TYPES.has(type)) return false;
      return !el.disabled && !el.readOnly;
    }
    if (el.isContentEditable) return true;
    return false;
  }

  function getDeepActiveElement(doc, skipSelf) {
    doc = doc || document;
    let el = doc.activeElement;
    if (!el || el === doc.body) return null;
    if (el.shadowRoot) {
      const deep = getDeepActiveElement(el.shadowRoot, false);
      if (deep) return deep;
    }
    try {
      if (el.contentDocument && el.contentDocument.body) {
        const deep = getDeepActiveElement(el.contentDocument, false);
        if (deep) return deep;
      }
    } catch {}
    if (skipSelf && !isEditable(el)) {
      return null;
    }
    return el;
  }

  function tryPasteStrategy(input, translated, selectedText) {
    try {
      const st = input.selectionStart;
      const en = input.selectionEnd;
      if (input.value.substring(st, en) !== selectedText) return false;

      const before = input.value.substring(0, st);
      const after = input.value.substring(en);
      const dataTransfer = new DataTransfer();
      dataTransfer.setData("text/plain", translated);
      const pasteEvent = new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: dataTransfer,
      });
      input.value = before + translated + after;
      const newCursor = st + translated.length;
      input.setSelectionRange(newCursor, newCursor);
      input.dispatchEvent(pasteEvent);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    } catch {
      return false;
    }
  }

  function tryExecCommandInsert(input, translated, selectedText) {
    try {
      input.focus();
      const st = input.selectionStart;
      const en = input.selectionEnd;
      if (input.value.substring(st, en) !== selectedText) return false;
      input.setSelectionRange(st, en);
      document.execCommand("insertText", false, translated);
      return true;
    } catch {
      return false;
    }
  }

  function tryDirectValueSet(input, translated, selectedText) {
    try {
      const st = input.selectionStart;
      const en = input.selectionEnd;
      if (input.value.substring(st, en) !== selectedText) return false;
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, "value"
      )?.set || Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, "value"
      )?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(input, input.value.substring(0, st) + translated + input.value.substring(en));
      } else {
        input.setRangeText(translated, st, en, "end");
      }
      const newCursor = st + translated.length;
      input.setSelectionRange(newCursor, newCursor);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    } catch {
      return false;
    }
  }

  function tryTextEvent(input, translated) {
    try {
      const textEvent = new TextEvent("textInput", {
        data: translated,
        inputType: "insertText",
      });
      input.dispatchEvent(textEvent);
      return true;
    } catch {
      return false;
    }
  }

  function replaceFormElement(input, translated, selectedText) {
    if (tryPasteStrategy(input, translated, selectedText)) return true;
    if (tryExecCommandInsert(input, translated, selectedText)) return true;
    if (tryDirectValueSet(input, translated, selectedText)) return true;
    if (tryTextEvent(input, translated)) return true;
    return false;
  }

  function replaceContentEditable(el, translated, selectedText, savedRange) {
    const sel = window.getSelection();

    if (savedRange) {
      try {
        sel.removeAllRanges();
        sel.addRange(savedRange);
      } catch {}
    }

    if (!sel || sel.isCollapsed || !sel.rangeCount) return false;
    try {
      const range = sel.getRangeAt(0);
      const selected = range.toString();
      if (selected !== selectedText) return false;

      el.focus();
      const isRichEditor = el.hasAttribute("data-lexical-editor") ||
        el.hasAttribute("data-gramm") ||
        el.hasAttribute("contenteditable") && el.closest('[data-lexical-editor], [data-gramm], .ProseMirror, .ql-editor, .public-DraftEditor-content');

      if (isRichEditor) {
        return document.execCommand("insertText", false, translated);
      }

      const beforeInputEvent = new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        inputType: "insertReplacementText",
        data: translated,
      });
      if (!el.dispatchEvent(beforeInputEvent)) return false;

      range.deleteContents();
      const textNode = document.createTextNode(translated);
      range.insertNode(textNode);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);

      el.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        inputType: "insertReplacementText",
        data: translated,
      }));
      return true;
    } catch {
      try {
        const sel2 = window.getSelection();
        if (sel2 && sel2.rangeCount) {
          const range2 = sel2.getRangeAt(0);
          range2.deleteContents();
          range2.insertNode(document.createTextNode(translated));
          range2.collapse(false);
          sel2.removeAllRanges();
          sel2.addRange(range2);
        }
        return true;
      } catch {
        return false;
      }
    }
  }

  function doReplace(translated, actInput, selText, showToastFn, savedRange) {
    if (!actInput || !selText) return;
    try {
      if (actInput.tagName === "INPUT" || actInput.tagName === "TEXTAREA") {
        if (replaceFormElement(actInput, translated, selText)) {
          showToastFn("Replaced ✓");
          return;
        }
        const st = actInput.selectionStart, en = actInput.selectionEnd;
        if (actInput.value.substring(st, en) !== selText) {
          showToastFn("选择区域已变化，请重新选择");
          return;
        }
        actInput.setRangeText(translated, st, en, "select");
        actInput.dispatchEvent(new Event("input", { bubbles: true }));
        actInput.dispatchEvent(new Event("change", { bubbles: true }));
        showToastFn("Replaced ✓");
      } else if (actInput.isContentEditable) {
        if (replaceContentEditable(actInput, translated, selText, savedRange)) {
          showToastFn("Replaced ✓");
        } else {
          showToastFn("替换失败");
        }
      }
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
  let savedRange = null;
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
    savedRange = null;
  }

  function getSelection(event) {
    let shadowInput = null;
    if (event && event.composedPath) {
      const path = event.composedPath();
      for (const target of path) {
        if (target.nodeType === Node.ELEMENT_NODE) {
          if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
            if (isEditable(target)) {
              shadowInput = target;
              break;
            }
          }
          if (target.isContentEditable) break;
        }
      }
    }

    if (shadowInput) {
      const st = shadowInput.selectionStart, en = shadowInput.selectionEnd;
      if (st !== en) {
        actInput = shadowInput;
        selText = shadowInput.value.substring(st, en);
        return { text: selText, isInput: true, el: shadowInput };
      }
    }

    const ae = getDeepActiveElement(document, true);
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

    if (s.rangeCount > 0) {
      savedRange = s.getRangeAt(0).cloneRange();
    }

    const an = s.anchorNode;
    if (an) {
      let p = an.nodeType === Node.ELEMENT_NODE ? an : an.parentElement;
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
        if (rpBtn) rpBtn.addEventListener("click", () => { doReplace(r.result, actInput, selText, showToast, savedRange); clearAll(); });
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
    "[data-snap-translated]",
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

  const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "SVG", "MATH", "IFRAME",
    "OBJECT", "EMBED", "TEMPLATE", "TEXTAREA", "SELECT",
    "BUTTON", "DIALOG", "FORM", "FIELDSET", "OUTPUT",
    "CANVAS", "MAP", "AREA", "AUDIO", "VIDEO",
    "TRACK", "SOURCE", "PICTURE", "SLOT", "PORTAL",
  ]);

  const INLINE_DISPLAYS = new Set([
    "inline", "inline-block", "inline-flex", "inline-grid",
    "inline-table", "ruby", "inline-box",
  ]);

  const BLOCK_DISPLAYS = new Set([
    "block", "flex", "grid", "table", "table-row",
    "table-cell", "table-caption", "list-item",
    "flow-root", "contents",
  ]);

  const BLOCK_TAGS = new Set([
    "DIV", "P", "H1", "H2", "H3", "H4", "H5", "H6",
    "UL", "OL", "LI", "TABLE", "TR", "TD", "TH",
    "SECTION", "ARTICLE", "ASIDE", "MAIN", "HEADER",
    "FOOTER", "NAV", "FIGURE", "FIGCAPTION", "DETAILS",
    "SUMMARY", "BLOCKQUOTE", "PRE", "HR", "ADDRESS",
    "FIELDSET", "DL", "DT", "DD",
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

  function isBlockElement(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
    if (BLOCK_TAGS.has(el.tagName)) return true;
    try {
      const display = window.getComputedStyle(el).display;
      if (BLOCK_DISPLAYS.has(display)) return true;
      if (INLINE_DISPLAYS.has(display)) return false;
    } catch { }
    return false;
  }

  function shouldSkipText(text, tl, options = {}) {
    if (!text) return true;
    const trimmed = text.trim();
    if (!trimmed) return true;
    if (trimmed.length < (options.minTextCount ?? 2)) return true;
    if (/^\d+$/.test(trimmed)) return true;
    if (/^[\s\W]*$/.test(trimmed)) return true;
    const words = trimmed.split(/\s+/).filter(w => /\w/.test(w));
    if (words.length < (options.minWordCount ?? 1)) return true;
    if (tl) {
      const detected = detectTextLang(trimmed);
      if (detected) {
        const tlLower = tl.toLowerCase();
        const detectedLower = detected.toLowerCase();
        if (tlLower === detectedLower) return true;
        if (options.ignoreZhCNandZhTW && tlLower.startsWith('zh') && detectedLower.startsWith('zh')) return true;
      }
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

  function shouldSkipByVisibility(el) {
    if (!el) return false;
    try {
      const style = window.getComputedStyle(el);
      if (style.display === 'none') return true;
      if (style.visibility === 'hidden') return true;
      const opacityVal = parseFloat(style.opacity);
      if (!isNaN(opacityVal) && opacityVal === 0) return true;
      if (el.offsetWidth === 0 && el.offsetHeight === 0) return true;
    } catch { }
    return false;
  }

  const MARKER = 'data-snap-translated';
  const WRAPPER_CLASS = 'snap-target-wrapper';
  const INNER_CLASS = 'snap-target-inner';
  const MAX_TEXT_LENGTH_PER_REQUEST = 1800;
  const SCROLL_LIMIT_SCREENS = 2;
  const TRANSLATION_CACHE_KEY_PREFIX = 'tr-cache:';
  const DEFER_CHARS_PER_FRAME = 8000;
  const CONCURRENT_BATCHES = 3;

  let injectedCssCache = new Set();

  function injectRuleCss(cssRules) {
    if (!cssRules?.length) return;
    const key = cssRules.join('|');
    if (injectedCssCache.has(key)) return;
    injectedCssCache.add(key);
    try {
      const style = document.createElement('style');
      style.setAttribute('data-snap-css', '');
      style.textContent = cssRules.join('\n');
      document.head.appendChild(style);
    } catch { }
  }

  function applyGlobalStyles(styles) {
    if (!styles) return;
    try {
      const styleId = 'snap-global-styles';
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

  function injectBaseStyles() {
    const styleId = 'snap-base-styles';
    const existing = document.getElementById(styleId);
    const css = `
.${WRAPPER_CLASS} { display: inline; }
.${INNER_CLASS} { display: inline; }
.${ORIGINAL_CLASS} { display: none !important; visibility: hidden !important; position: absolute !important; width: 0 !important; height: 0 !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; }
  `.trim();
    if (existing) {
      existing.textContent = css;
      return;
    }
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
  }

  let markedNodes = new WeakSet();

  function isMarked(node) {
    if (!node) return false;
    if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute(MARKER)) return true;
    if (node.nodeType === Node.TEXT_NODE && node.parentElement && node.parentElement.hasAttribute(MARKER)) return true;
    return markedNodes.has(node);
  }

  function markNode(node) {
    if (node) markedNodes.add(node);
  }

  function collectParagraphs(root, excluded, rule) {
    const paragraphs = [];
    let currentNodes = [];
    let currentText = '';
    let currentBlockRoot = null;

    function flushParagraph() {
      if (currentNodes.length === 0) return;
      const text = currentText.trim();
      if (!text || text.length < 2) {
        currentNodes = [];
        currentText = '';
        currentBlockRoot = null;
        return;
      }
      paragraphs.push({
        nodes: [...currentNodes],
        text: currentText.trim(),
        blockRoot: currentBlockRoot,
      });
      currentNodes = [];
      currentText = '';
      currentBlockRoot = null;
    }

    function addTextNode(node) {
      if (isMarked(node)) return;
      const text = node.textContent;
      if (!text.trim()) return;
      const parent = node.parentElement;
      if (!parent) return;
      if (SKIP_TAGS.has(parent.tagName)) return;
      if (STAY_ORIGINAL_TAGS.has(parent.tagName)) return;
      if (parent.classList?.contains(ORIGINAL_CLASS) || parent.classList?.contains(INNER_CLASS)) return;
      if (shouldSkipElement(parent, excluded)) return;
      if (shouldSkipByVisibility(parent)) return;
      currentNodes.push(node);
      currentText += text;
      markNode(node);
    }

    function walkDOM(el) {
      if (!el) return;
      if (el.nodeType === Node.TEXT_NODE) {
        addTextNode(el);
        return;
      }
      if (el.nodeType !== Node.ELEMENT_NODE) return;
      if (SKIP_TAGS.has(el.tagName)) return;
      if (el.classList?.contains(ORIGINAL_CLASS) || el.classList?.contains(INNER_CLASS)) return;
      if (isMarked(el)) return;
      if (shouldSkipElement(el, excluded)) return;
      if (shouldSkipByVisibility(el)) return;
      if (el.tagName === 'IFRAME') {
        try {
          if (el.contentDocument && el.contentDocument.body) {
            walkDOM(el.contentDocument.body);
          }
        } catch { }
        return;
      }
      if (el.shadowRoot) {
        walkDOM(el.shadowRoot);
      }
      const isBlock = isBlockElement(el);
      if (isBlock && currentNodes.length > 0) {
        flushParagraph();
      }
      if (isBlock) {
        currentBlockRoot = el;
      }
      let child = el.firstChild;
      while (child) {
        walkDOM(child);
        child = child.nextSibling;
      }
      if (isBlock && currentNodes.length > 0) {
        flushParagraph();
      }
    }

    if (rule.selectors?.length) {
      for (const sel of rule.selectors) {
        if (sel.includes(' >>> ')) {
          const parts = sel.split(' >>> ');
          if (parts.length === 2) {
            const hosts = document.querySelectorAll(parts[0]);
            for (const host of hosts) {
              if (host.shadowRoot) {
                const targets = host.shadowRoot.querySelectorAll(parts[1]);
                for (const target of targets) {
                  walkDOM(target);
                }
              }
            }
          }
        } else {
          const els = document.querySelectorAll(sel);
          for (const el of els) {
            walkDOM(el);
          }
          for (const host of document.querySelectorAll('*')) {
            if (!host.shadowRoot) continue;
            try {
              const shadowEls = host.shadowRoot.querySelectorAll(sel);
              for (const el of shadowEls) {
                walkDOM(el);
              }
            } catch { }
          }
        }
      }
    } else if (rule.containerSelector) {
      const containers = document.querySelectorAll(rule.containerSelector);
      for (const container of containers) {
        walkDOM(container);
      }
    } else {
      walkDOM(root);
    }

    flushParagraph();
    return paragraphs;
  }

  function isInViewport(el, screens) {
    if (!el) return true;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const maxScroll = vh * (SCROLL_LIMIT_SCREENS);
    return rect.top < vh + maxScroll && rect.bottom > -maxScroll;
  }

  function splitParagraphsIntoBatches(paragraphs, maxLength) {
    const batches = [];
    let currentBatch = [];
    let currentLength = 0;

    for (const para of paragraphs) {
      const text = para.text;
      if (currentLength + text.length > maxLength && currentBatch.length > 0) {
        batches.push(currentBatch);
        currentBatch = [];
        currentLength = 0;
      }
      currentBatch.push(para);
      currentLength += text.length;
    }
    if (currentBatch.length) batches.push(currentBatch);
    return batches;
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

  const ORIGINAL_CLASS = 'snap-original';

  function insertTranslationForParagraph(para, translatedText) {
    const nodes = para.nodes;
    if (!nodes.length) return 0;

    const firstNode = nodes[0];
    const lastNode = nodes[nodes.length - 1];
    const parent = firstNode.parentElement;
    if (!parent) return 0;

    const refNode = lastNode.nextSibling;

    const wrapper = document.createElement('span');
    wrapper.className = WRAPPER_CLASS;
    wrapper.setAttribute(MARKER, 'page');

    const originalContainer = document.createElement('span');
    originalContainer.className = ORIGINAL_CLASS;
    originalContainer.style.setProperty('display', 'none', 'important');
    for (const node of nodes) {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
      originalContainer.appendChild(node);
    }
    wrapper.appendChild(originalContainer);

    const inner = document.createElement('span');
    inner.className = INNER_CLASS;
    inner.textContent = translatedText;
    wrapper.appendChild(inner);

    if (refNode && refNode.parentNode === parent) {
      parent.insertBefore(wrapper, refNode);
    } else {
      parent.appendChild(wrapper);
    }

    return 1;
  }

  async function translateBatch(batch, sl, tl, engine, options = {}) {
    const { languageFilter, detectParagraphLanguage, ignoreZhCNandZhTW, excludeLanguages, paragraphMinTextCount, paragraphMinWordCount } = options;
    const doDetect = (languageFilter === 'skip-target') || detectParagraphLanguage;

    const texts = [];
    const parasToTranslate = [];

    for (const para of batch) {
      if (doDetect && excludeLanguages?.length) {
        const detected = detectTextLang(para.text);
        if (detected) {
          const isExcluded = excludeLanguages.some(lang => {
            if (lang === detected) return true;
            if (ignoreZhCNandZhTW && lang.startsWith('zh') && detected.startsWith('zh')) return true;
            return false;
          });
          if (isExcluded) continue;
        }
      }

      if (shouldSkipText(para.text, doDetect ? tl : null, {
        minTextCount: paragraphMinTextCount,
        minWordCount: paragraphMinWordCount,
        ignoreZhCNandZhTW,
      })) continue;
      const key = getCacheKey(para.text, sl, tl, engine);
      const cached = cacheGet(key);
      if (cached) {
        insertTranslationForParagraph(para, cached);
        continue;
      }
      texts.push(para.text);
      parasToTranslate.push({ para, key });
    }

    if (!parasToTranslate.length) return;

    for (const { para } of parasToTranslate) {
      const placeholder = document.createElement('span');
      placeholder.className = 'tr-translating';
      placeholder.setAttribute(MARKER, 'translating');
      placeholder.textContent = '...';
      const firstNode = para.nodes[0];
      const parent = firstNode?.parentElement;
      if (parent) {
        const lastNode = para.nodes[para.nodes.length - 1];
        const refNode = lastNode.nextSibling;
        const originalContainer = document.createElement('span');
        originalContainer.className = ORIGINAL_CLASS;
        originalContainer.style.setProperty('display', 'none', 'important');
        for (const node of para.nodes) {
          if (node.parentNode) node.parentNode.removeChild(node);
          originalContainer.appendChild(node);
        }
        placeholder.appendChild(originalContainer);
        if (refNode && refNode.parentNode === parent) {
          parent.insertBefore(placeholder, refNode);
        } else {
          parent.appendChild(placeholder);
        }
        para._placeholder = placeholder;
      }
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
        for (let i = 0; i < parasToTranslate.length; i++) {
          const { para, key } = parasToTranslate[i];
          const resultText = r.results[i];
          if (resultText == null) continue;
          cacheSet(key, resultText);
          const placeholder = para._placeholder;
          if (!placeholder || !placeholder.parentNode) continue;
          const origContainer = placeholder.querySelector(`.${ORIGINAL_CLASS}`);
          const wrapper = document.createElement('span');
          wrapper.className = WRAPPER_CLASS;
          wrapper.setAttribute(MARKER, 'page');
          if (origContainer) wrapper.appendChild(origContainer);
          const inner = document.createElement('span');
          inner.className = INNER_CLASS;
          inner.textContent = resultText;
          wrapper.appendChild(inner);
          placeholder.parentNode.replaceChild(wrapper, placeholder);
        }
      } else {
        for (const { para } of parasToTranslate) {
          restorePlaceholder(para);
        }
      }
    } catch {
      for (const { para } of parasToTranslate) {
        restorePlaceholder(para);
      }
    }
  }

  function restorePlaceholder(para) {
    const placeholder = para._placeholder;
    if (!placeholder || !placeholder.parentNode) return;
    const origContainer = placeholder.querySelector(`.${ORIGINAL_CLASS}`);
    if (origContainer) {
      const fragment = document.createDocumentFragment();
      while (origContainer.firstChild) {
        fragment.appendChild(origContainer.firstChild);
      }
      placeholder.parentNode.replaceChild(fragment, placeholder);
    } else {
      const fragment = document.createDocumentFragment();
      for (const node of para.nodes) {
        if (node) fragment.appendChild(node);
      }
      if (fragment.childNodes.length) {
        placeholder.parentNode.replaceChild(fragment, placeholder);
      } else {
        placeholder.remove();
      }
    }
  }

  async function translateParagraphs(paragraphs, sl, tl, engine, options = {}) {
    if (!paragraphs.length) return 0;

    const inViewport = [];
    const outOfViewport = [];
    for (const para of paragraphs) {
      const rootEl = para.blockRoot || (para.nodes[0]?.parentElement);
      if (isInViewport(rootEl)) {
        inViewport.push(para);
      } else {
        outOfViewport.push(para);
      }
    }

    const inViewportBatches = splitParagraphsIntoBatches(inViewport, MAX_TEXT_LENGTH_PER_REQUEST);
    const outOfViewportBatches = splitParagraphsIntoBatches(outOfViewport, MAX_TEXT_LENGTH_PER_REQUEST);

    let translated = 0;
    let charsThisFrame = 0;

    for (let i = 0; i < inViewportBatches.length; i += CONCURRENT_BATCHES) {
      const chunk = inViewportBatches.slice(i, i + CONCURRENT_BATCHES);
      await Promise.all(chunk.map(batch => translateBatch(batch, sl, tl, engine, options)));
      translated += chunk.reduce((sum, batch) => sum + batch.length, 0);
      charsThisFrame += chunk.reduce((sum, batch) => sum + batch.reduce((s, p) => s + p.text.length, 0), 0);
      if (charsThisFrame >= DEFER_CHARS_PER_FRAME) {
        await new Promise(r => requestAnimationFrame(r));
        charsThisFrame = 0;
      }
    }

    for (let i = 0; i < outOfViewportBatches.length; i += CONCURRENT_BATCHES) {
      const chunk = outOfViewportBatches.slice(i, i + CONCURRENT_BATCHES);
      await Promise.all(chunk.map(batch => translateBatch(batch, sl, tl, engine, options)));
      translated += chunk.reduce((sum, batch) => sum + batch.length, 0);
      charsThisFrame += chunk.reduce((sum, batch) => sum + batch.reduce((s, p) => s + p.text.length, 0), 0);
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
    const excluded = buildExcludeSet(currentRule?.excludeSelectors);
    const paragraphs = collectParagraphs(document.body, excluded, currentRule || {});
    if (paragraphs.length) {
      const options = {
        languageFilter: currentRule?.languageFilter,
        detectParagraphLanguage: currentRule?.detectParagraphLanguage,
        ignoreZhCNandZhTW: currentRule?.ignoreZhCNandZhTW,
        excludeLanguages: currentRule?.excludeLanguages,
        paragraphMinTextCount: currentRule?.paragraphMinTextCount,
        paragraphMinWordCount: currentRule?.paragraphMinWordCount,
      };
      await translateParagraphs(paragraphs, currentSl, currentTl, currentEngine, options);
    }
  }

  function startObserver() {
    if (observer) observer.disconnect();
    let pending = false;
    const callback = (mutations) => {
      if (pending) return;
      let shouldProcess = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList?.contains('tr-translating') ||
                  node.classList?.contains(WRAPPER_CLASS) ||
                  node.hasAttribute?.(MARKER) ||
                  node.id === 'snap-base-styles' ||
                  node.id === 'snap-global-styles' ||
                  node.getAttribute?.('data-snap-css') !== null) {
                continue;
              }
              shouldProcess = true;
              break;
            }
          }
        }
        if (shouldProcess) break;
      }
      if (!shouldProcess) return;
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
    injectBaseStyles();
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

    const excluded = buildExcludeSet(rule.excludeSelectors);
    const paragraphs = collectParagraphs(document.body, excluded, rule);

    if (paragraphs.length) {
      const options = {
        languageFilter: rule.languageFilter,
        detectParagraphLanguage: rule.detectParagraphLanguage,
        ignoreZhCNandZhTW: rule.ignoreZhCNandZhTW,
        excludeLanguages: rule.excludeLanguages,
        paragraphMinTextCount: rule.paragraphMinTextCount,
        paragraphMinWordCount: rule.paragraphMinWordCount,
      };
      await translateParagraphs(paragraphs, sl, tl, engine, options);
    }
    startObserver();
  }

  function revertPageTranslation$1() {
    stopObserver();
    markedNodes = new WeakSet();
    document.querySelectorAll(`.${WRAPPER_CLASS}`).forEach(wrapper => {
      const parent = wrapper.parentNode;
      if (!parent) return;
      const originalContainer = wrapper.querySelector(`.${ORIGINAL_CLASS}`);
      if (originalContainer) {
        const fragment = document.createDocumentFragment();
        while (originalContainer.firstChild) {
          fragment.appendChild(originalContainer.firstChild);
        }
        parent.replaceChild(fragment, wrapper);
      } else {
        wrapper.remove();
      }
    });
    document.querySelectorAll("[data-snap-translated='fixed']").forEach((el) => {
      el.removeAttribute(MARKER);
    });
    document.querySelectorAll('.tr-translating').forEach(el => {
      const parent = el.parentNode;
      if (!parent) { el.remove(); return; }
      const origContainer = el.querySelector(`.${ORIGINAL_CLASS}`);
      if (origContainer) {
        const fragment = document.createDocumentFragment();
        while (origContainer.firstChild) {
          fragment.appendChild(origContainer.firstChild);
        }
        parent.replaceChild(fragment, el);
      } else {
        el.remove();
      }
    });
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
    if (floatEl) {
      const img = floatEl.querySelector("img");
      if (img && getIconUrlFn) img.src = getIconUrlFn();
    }
    applyingTheme = false;
  }

  function detectDark() {
    isDark = false;
    const el = document.documentElement;
    if (!el) return;

    const cs = el.getAttribute("data-color-mode") || el.getAttribute("data-theme") || "";
    if (cs.includes("dark")) { isDark = true; return; }
    if (cs.includes("light")) { return; }

    const cl = el.className || "";
    if (/\b(dark|night|moon)\b/i.test(cl)) { isDark = true; return; }
    if (/\b(light|day)\b/i.test(cl)) { return; }

    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      const scheme = meta.content || meta.getAttribute("content") || "";
      if (/\bdark\b/i.test(scheme) && !/\blight\b/i.test(scheme)) { isDark = true; return; }
      if (/\blight\b/i.test(scheme) && !/\bdark\b/i.test(scheme)) { return; }
    }

    const styleScheme = el.style.colorScheme || "";
    if (/\bdark\b/i.test(styleScheme) && !/\blight\b/i.test(styleScheme)) { isDark = true; return; }
    if (/\blight\b/i.test(styleScheme) && !/\bdark\b/i.test(styleScheme)) { return; }

    const bg = getEffectiveBg();
    if (bg) {
      const m = bg.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (m) {
        const lum = (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
        if (lum < 0.5) { isDark = true; }
        return;
      }
    }

    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      const canvasOnly = document.querySelector('canvas') && !document.querySelector('article, main, section, p, h1, h2, h3');
      if (canvasOnly) { isDark = true; }
    }
  }

  function getEffectiveBg() {
    const html = document.documentElement;
    const body = document.body;
    const htmlBg = html ? window.getComputedStyle(html).backgroundColor : "";
    if (htmlBg && htmlBg !== "rgba(0, 0, 0, 0)" && htmlBg !== "transparent") return htmlBg;
    if (body) {
      const bodyBg = window.getComputedStyle(body).backgroundColor;
      if (bodyBg && bodyBg !== "rgba(0, 0, 0, 0)" && bodyBg !== "transparent") return bodyBg;
    }
    return "";
  }

  function watchTheme(applyThemeFn) {
    if (themeObserver) return;
    themeObserver = new MutationObserver(() => {
      requestAnimationFrame(() => applyThemeFn());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme", "data-color-mode", "color", "color-scheme"]
    });
    if (document.body) {
      themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["class", "style", "data-theme", "data-color-mode", "color"]
      });
    }
  }

  function getIconUrl() {
    return chrome.runtime.getURL(isDark ? "assets/dark-256.png" : "assets/256.png");
  }

  const GENERIC_RULE = {
    name: "通用规则",
    selectors: [],
    excludeMatches: [],
    autoTranslate: true,
    translateUI: false,
  };

  const LS_PREFIX = "snap-translate:";

  function detectContentLang(rule) {
    const sample = getContentSample(rule);
    if (!sample) return '';
    const totalNonSpace = (sample.match(/[^\s]/g) || []).length;
    if (totalNonSpace < 30) return '';
    const zhChars = (sample.match(/[\u4e00-\u9fff]/g) || []).length;
    const jaChars = (sample.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
    const koChars = (sample.match(/[\uac00-\ud7af]/g) || []).length;
    const ruChars = (sample.match(/[\u0400-\u04ff]/g) || []).length;
    const arChars = (sample.match(/[\u0600-\u06ff]/g) || []).length;
    const enChars = (sample.match(/[a-zA-Z]/g) || []).length;
    if (zhChars / totalNonSpace > 0.4) return 'zh';
    if (jaChars / totalNonSpace > 0.1) return 'ja';
    if (koChars / totalNonSpace > 0.1) return 'ko';
    if (ruChars / totalNonSpace > 0.15) return 'ru';
    if (arChars / totalNonSpace > 0.15) return 'ar';
    if (enChars / totalNonSpace > 0.3) return 'en';
    return '';
  }

  function getContentSample(rule) {
    let text = '';

    if (rule) {
      if (rule.containerSelector) {
        const containers = document.querySelectorAll(rule.containerSelector);
        for (const c of containers) {
          text += c.innerText + ' ';
          if (text.length > 3000) break;
        }
        if (text.trim()) return text.substring(0, 3000);
      }
      if (rule.selectors?.length) {
        for (const sel of rule.selectors) {
          const cleanSel = sel.split(' >>> ')[0].split(' -> ')[0].trim();
          try {
            const els = document.querySelectorAll(cleanSel);
            for (const el of els) {
              text += el.innerText + ' ';
              if (text.length > 3000) break;
            }
          } catch { }
          if (text.length > 3000) break;
        }
        if (text.trim()) return text.substring(0, 3000);
      }
    }

    const mainEl = document.querySelector('main, [role="main"], article');
    if (mainEl) {
      text = mainEl.innerText;
      if (text.trim()) return text.substring(0, 3000);
    }

    const articles = document.querySelectorAll('article, [role="article"]');
    for (const a of articles) {
      text += a.innerText + ' ';
      if (text.length > 3000) break;
    }
    if (text.trim()) return text.substring(0, 3000);

    const body = document.body;
    if (!body) return '';
    const clone = body.cloneNode(true);
    const uiTags = clone.querySelectorAll('nav, header, footer, aside, [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]');
    uiTags.forEach(el => el.remove());
    text = clone.innerText || '';
    return text.substring(0, 3000);
  }

  function shouldSkipTranslation(targetLang, rule) {
    const contentLang = detectContentLang(rule);
    const t = (targetLang || '').split('-')[0].toLowerCase();

    if (!contentLang) return false;

    return contentLang === t;
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
    selTL: "zh-CN", inputSL: "auto", inputTL: "zh-CN", pgTL: "zh-CN",
    enSel: true, enInput: true, enPage: true, enFloat: true, autoTranslate: true,
    ignLangs: [], selEngine: "google", inputEngine: "google", pgEngine: "google",
    blacklist: [], autoWhitelist: [], rulesUrl: "", allowRemoteTTS: true
  };
  let ready = false;
  let isBlacklisted = false;
  let isWhitelisted = false;
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

    if (siteRule) {
      pageLangDisabled = shouldSkipTranslation(targetLang, siteRule);
      if (pageLangDisabled) return;
      if ((S.autoTranslate || isWhitelisted) && siteRule.autoTranslate) {
        pgTranslating = true;
        await applyPageRule(siteRule, "auto", targetLang, S.pgEngine || "google");
        if (pgTranslating && float) float.classList.add("tr-translated");
        updateToolbarIcon();
      }
    } else {
      pageLangDisabled = shouldSkipTranslation(targetLang, null);
      if (pageLangDisabled) return;
      if (S.autoTranslate || isWhitelisted) {
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
    revertPageTranslation$1();
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
      { icon: svgIcon("autoOff"), label: "切换自动翻译", desc: isWhitelisted ? "从白名单移除，不再自动翻译" : "加入白名单，始终自动翻译", action: async () => { const host = location.hostname; if (isWhitelisted) { try { await sendMessage({ action: "removeWhitelist", host }); } catch { } isWhitelisted = false; showToast("已从白名单移除"); } else { try { await sendMessage({ action: "addWhitelist", host }); } catch { } isWhitelisted = true; if (!pgTranslating && !S.autoTranslate) { showToast("已加入白名单，刷新后生效"); } else { showToast("已加入白名单，始终自动翻译"); } } closeFloatMenu(); } },
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
    const targetLang = S.pgTL || S.selTL;
    if (shouldSkipTranslation(targetLang, siteRule)) {
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
      const sel = getSelection(e);
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
      isBlacklisted = isBlacklisted$1(location.hostname, S.blacklist);
    }

    if (S.autoWhitelist?.length) {
      isWhitelisted = isBlacklisted$1(location.hostname, S.autoWhitelist);
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
          isBlacklisted = isBlacklisted$1(location.hostname, S.blacklist || []);
          isWhitelisted = isBlacklisted$1(location.hostname, S.autoWhitelist || []);
        }
      });
      return;
    }

    try {
      const resp = await sendMessage({ action: "getSiteRule", url: location.href });
      if (resp?.rule) siteRule = resp.rule;
    } catch { }

    if (siteRule) {
      pageLangDisabled = shouldSkipTranslation(targetLang, siteRule);
      if (S.enPage && !pageLangDisabled && S.enFloat) createFloat();
      if (S.enPage && !pageLangDisabled && (S.autoTranslate || isWhitelisted) && siteRule.autoTranslate) {
        pgTranslating = true;
        const st = await showTransStatus(`匹配规则: ${siteRule.name}，自动翻译`);
        await applyPageRule(siteRule, "auto", targetLang, S.pgEngine || "google");
        clearTransStatus(st);
        if (pgTranslating && float) float.classList.add("tr-translated");
        updateToolbarIcon();
      }
    } else {
      pageLangDisabled = shouldSkipTranslation(targetLang, null);
      if (S.enPage && !pageLangDisabled && S.enFloat) createFloat();
      if (S.enPage && !pageLangDisabled && (S.autoTranslate || isWhitelisted)) {
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
        pageLangDisabled = shouldSkipTranslation(newTargetLang, siteRule);
        isBlacklisted = isBlacklisted$1(location.hostname, S.blacklist || []);
        isWhitelisted = isBlacklisted$1(location.hostname, S.autoWhitelist || []);
        if (S.enFloat && !isBlacklisted && (siteRule || !pageLangDisabled) && !sessionDisabled) createFloat();
        else removeFloat();
      }
    });
  }

  init();

})();
