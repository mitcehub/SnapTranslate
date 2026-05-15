(function () {
  'use strict';

  function injectStyles() {
    if (document.getElementById("tr-ext-styles")) return;
    const s = document.createElement("style");
    s.id = "tr-ext-styles";
    s.textContent = `.tr-float{position:fixed;z-index:2147483640;width:36px;height:36px;border-radius:50%;background:transparent;border:none;box-shadow:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s;user-select:none;overflow:visible;touch-action:none}.tr-float:hover{transform:scale(1.1)}.tr-float.tr-dragging{transition:none;transform:scale(1.15)}.tr-float img{width:32px;height:32px;border-radius:50%;object-fit:cover;pointer-events:none}.tr-float-check{position:absolute;bottom:-2px;right:-2px;width:16px;height:16px;border-radius:50%;background:#4CAF50;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.3);transition:opacity .2s,transform .2s;pointer-events:none}.tr-float-check svg{width:10px;height:10px;color:#fff}.tr-float.tr-translated .tr-float-check{opacity:1;transform:scale(1)}.tr-float-x{position:absolute;top:-5px;right:-5px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.5);transition:opacity .15s,transform .15s;cursor:pointer;z-index:1}.tr-float-x svg{width:10px;height:10px;color:#9ca3af;pointer-events:none}.tr-float:hover .tr-float-x{opacity:1;transform:scale(1)}.tr-float-x:hover{background:#fee2e2}.tr-float-x:hover svg{color:#ef4444}.tr-float-menu{position:fixed;z-index:2147483641;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.14);padding:6px 0;min-width:200px;font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;animation:trFadeIn .12s ease}.tr-float-menu-item{display:flex;align-items:flex-start;gap:10px;padding:9px 14px;cursor:pointer;color:#374151;transition:background .1s}.tr-float-menu-item:hover{background:#f3f4f6}.tr-float-menu-item.danger{color:#ef4444}.tr-float-menu-item.danger .tr-menu-desc{color:#fca5a5}.tr-float-menu-item svg{width:16px;height:16px;flex-shrink:0;margin-top:2px}.tr-menu-text{display:flex;flex-direction:column;gap:1px}.tr-menu-label{font-size:13px;font-weight:500;line-height:1.3}.tr-menu-desc{font-size:11px;color:#9ca3af;line-height:1.3}.tr-menu-sep{height:1px;background:#e5e7eb;margin:4px 14px}.tr-bar{position:fixed;z-index:2147483645;display:flex;align-items:center;padding:0;background:transparent;border:none;box-shadow:none;font:12px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;user-select:none;animation:trFadeIn .12s ease;gap:2px}@keyframes trFadeIn{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}.tr-btn{display:inline-flex;align-items:center;justify-content:center;height:28px;padding:0 10px;border:none;border-radius:7px;background:transparent;color:#374151;cursor:pointer;font:12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:500;transition:all .15s;gap:4px;white-space:nowrap}.tr-btn:hover{background:#f3f4f6}.tr-btn.tr-primary{background:#4f46e5;color:#fff}.tr-btn.tr-primary:hover{background:#4338ca}.tr-btn svg{width:14px;height:14px;flex-shrink:0}.tr-panel{position:fixed;z-index:2147483644;min-width:280px;max-width:480px;max-height:min(420px,calc(100vh - 24px));background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.14),0 2px 6px rgba(0,0,0,.08);font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;animation:trFadeIn .15s ease;overflow:visible;display:flex;flex-direction:column}.tr-phead{display:flex;align-items:center;justify-content:space-between;padding:10px 14px 0}.tr-plang{display:flex;align-items:center;gap:4px;position:relative}.tr-arrow{color:#9ca3af;font-size:13px;flex-shrink:0}.tr-pclose{width:22px;height:22px;border:none;border-radius:4px;background:transparent;color:#9ca3af;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center}.tr-pclose:hover{background:#f3f4f6;color:#374151}.tr-pbody{padding:8px 14px 12px;overflow-y:auto;flex:1;min-height:0}.tr-original{font-size:11px;color:#9ca3af;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #f3f4f6;word-break:break-word;max-height:70px;overflow-y:auto;display:flex;align-items:flex-start;gap:6px}.tr-original-text{flex:1;min-width:0}.tr-result{color:#1f2937;word-break:break-word;font-size:13px;line-height:1.6;max-height:240px;overflow-y:auto;display:flex;align-items:flex-start;gap:6px}.tr-result-text{flex:1;min-width:0}.tr-speak-btn{flex-shrink:0;width:24px;height:24px;border:none;border-radius:4px;background:transparent;color:#9ca3af;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:color .15s,background .15s}.tr-speak-btn:hover{color:#4f46e5;background:#eef2ff}.tr-speak-btn.speaking{color:#4f46e5;animation:trPulse 1s ease infinite}.tr-loading{display:flex;align-items:center;gap:8px;color:#9ca3af;padding:8px 0}.tr-spinner{width:14px;height:14px;border:2px solid #e5e7eb;border-top-color:#4f46e5;border-radius:50%;animation:trSpin .6s linear infinite}@keyframes trSpin{to{transform:rotate(360deg)}}@keyframes trPulse{0%,100%{opacity:1}50%{opacity:.5}}.tr-actions{display:flex;gap:6px;margin-top:8px}.tr-copy-btn,.tr-replace-btn{padding:5px 10px;border:1px solid #e5e7eb;border-radius:5px;background:#f9fafb;color:#6b7280;cursor:pointer;font-size:11px;font-weight:500;transition:all .15s;display:inline-flex;align-items:center;gap:3px}.tr-copy-btn:hover,.tr-replace-btn:hover{background:#f3f4f6;color:#374151}.tr-copy-btn.copied{background:#ecfdf5;color:#059669;border-color:#a7f3d0}.tr-replace-btn{background:#eef2ff;color:#4f46e5;border-color:#c7d2fe}.tr-replace-btn:hover{background:#e0e7ff}.tr-toast{position:fixed;z-index:2147483647;bottom:80px;left:50%;transform:translateX(-50%);padding:8px 20px;background:#059669;color:#fff;border-radius:8px;font:13px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:500;pointer-events:none;animation:trToast .3s ease}@keyframes trToast{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}.tr-bilingual{color:inherit;word-break:break-word}.tr-br{display:block;margin-top:2px;content:""}.tr-dd{position:relative;display:inline-block}.tr-dd-btn{height:26px;line-height:26px;padding:0 20px 0 6px;border:1px solid #e5e7eb;border-radius:5px;font-size:11px;color:#374151;background:#fff;cursor:pointer;outline:none;min-width:85px;text-align:left;appearance:none;-webkit-appearance:none;position:relative;vertical-align:middle}.tr-dd-btn:hover{border-color:#d1d5db}.tr-dd-btn::after{content:"▾";position:absolute;right:5px;top:50%;transform:translateY(-50%);font-size:10px;color:#9ca3af;pointer-events:none}.tr-dd-btn[disabled]{opacity:.5;cursor:default;background:#f9fafb}.tr-dd-list{position:absolute;top:100%;left:0;z-index:10;min-width:100%;max-height:min(280px,calc(100vh - 80px));overflow-y:auto;background:#fff;border:1px solid #e5e7eb;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);margin-top:2px;padding:2px 0;display:none}.tr-dd-list.tr-dd-open{display:block}.tr-dd-item{padding:4px 8px;font-size:11px;color:#374151;cursor:pointer;white-space:nowrap;line-height:1.4}.tr-dd-item:hover{background:#f3f4f6}.tr-dd-item.tr-dd-active{color:#4f46e5;font-weight:600}.tr-engine-sep{width:1px;height:16px;background:#e5e7eb;margin:0 2px;flex-shrink:0}.tr-engine-btn{min-width:60px;font-size:10px;height:22px;line-height:22px;padding:0 16px 0 4px;border-radius:4px}[data-tr-theme="dark"] .tr-float{background:transparent;border:none;box-shadow:none}[data-tr-theme="dark"] .tr-float-x{background:#2d2d2d;box-shadow:0 1px 4px rgba(0,0,0,.4)}[data-tr-theme="dark"] .tr-float-x:hover{background:#7f1d1d}[data-tr-theme="dark"] .tr-float-x svg{color:#6b7280}[data-tr-theme="dark"] .tr-float-x:hover svg{color:#fca5a5}[data-tr-theme="dark"] .tr-float-menu{background:#1e1e1e;border-color:#333;box-shadow:0 8px 32px rgba(0,0,0,.4)}[data-tr-theme="dark"] .tr-float-menu-item{color:#d1d5db}[data-tr-theme="dark"] .tr-float-menu-item:hover{background:#2d2d2d}[data-tr-theme="dark"] .tr-float-menu-item.danger{color:#f87171}[data-tr-theme="dark"] .tr-float-menu-item.danger .tr-menu-desc{color:#7f1d1d}[data-tr-theme="dark"] .tr-menu-desc{color:#6b7280}[data-tr-theme="dark"] .tr-menu-sep{background:#333}[data-tr-theme="dark"] .tr-bar{background:transparent;border:none;box-shadow:none}[data-tr-theme="dark"] .tr-btn{color:#d1d5db}[data-tr-theme="dark"] .tr-btn:hover{background:#2d2d2d}[data-tr-theme="dark"] .tr-btn.tr-primary{background:#4f46e5;color:#fff}[data-tr-theme="dark"] .tr-btn.tr-primary:hover{background:#6366f1}[data-tr-theme="dark"] .tr-panel{background:#1e1e1e;border-color:#333;box-shadow:0 8px 32px rgba(0,0,0,.5),0 2px 6px rgba(0,0,0,.3)}[data-tr-theme="dark"] .tr-pclose{color:#6b7280}[data-tr-theme="dark"] .tr-pclose:hover{background:#2d2d2d;color:#d1d5db}[data-tr-theme="dark"] .tr-arrow{color:#6b7280}[data-tr-theme="dark"] .tr-original{color:#6b7280;border-bottom-color:#333}[data-tr-theme="dark"] .tr-result{color:#e5e7eb}[data-tr-theme="dark"] .tr-loading{color:#6b7280}[data-tr-theme="dark"] .tr-spinner{border-color:#333;border-top-color:#6366f1}[data-tr-theme="dark"] .tr-copy-btn,[data-tr-theme="dark"] .tr-replace-btn{background:#2d2d2d;border-color:#333;color:#9ca3af}[data-tr-theme="dark"] .tr-copy-btn:hover,[data-tr-theme="dark"] .tr-replace-btn:hover{background:#374151;color:#e5e7eb}[data-tr-theme="dark"] .tr-copy-btn.copied{background:#052e16;color:#34d399;border-color:#064e3b}[data-tr-theme="dark"] .tr-replace-btn{background:#312e81;color:#c7d2fe;border-color:#4338ca}[data-tr-theme="dark"] .tr-replace-btn:hover{background:#3730a3}[data-tr-theme="dark"] .tr-toast{background:#059669;color:#fff}[data-tr-theme="dark"] .tr-speak-btn{color:#6b7280}[data-tr-theme="dark"] .tr-speak-btn:hover{color:#818cf8;background:#2d2d2d}[data-tr-theme="dark"] .tr-speak-btn.speaking{color:#818cf8}[data-tr-theme="dark"] .tr-dd-btn{background:#2d2d2d;border-color:#333;color:#d1d5db}[data-tr-theme="dark"] .tr-dd-btn:hover{border-color:#4b5563}[data-tr-theme="dark"] .tr-dd-btn[disabled]{background:#1e1e1e;color:#6b7280}[data-tr-theme="dark"] .tr-dd-list{background:#2d2d2d;border-color:#333;box-shadow:0 4px 16px rgba(0,0,0,.5)}[data-tr-theme="dark"] .tr-dd-item{color:#d1d5db}[data-tr-theme="dark"] .tr-dd-item:hover{background:#374151}[data-tr-theme="dark"] .tr-dd-item.tr-dd-active{color:#818cf8}[data-tr-theme="dark"] .tr-engine-sep{background:#333}[data-tr-theme="dark"] .tr-float-menu-item.danger .tr-menu-desc{color:#7f1d1d}`;
    document.head.appendChild(s);
  }

  const LANGS = [
    { c: "auto", n: "Detect" },
    { c: "zh-CN", n: "中文(简体)" },
    { c: "zh-TW", n: "中文(繁体)" },
    { c: "en", n: "English" },
    { c: "ja", n: "日本語" },
    { c: "ko", n: "한국어" },
    { c: "fr", n: "Français" },
    { c: "de", n: "Deutsch" },
    { c: "es", n: "Español" },
    { c: "pt", n: "Português" },
    { c: "ru", n: "Русский" },
    { c: "ar", n: "العربية" },
    { c: "th", n: "ไทย" },
    { c: "vi", n: "Tiếng Việt" },
    { c: "id", n: "Indonesia" },
    { c: "it", n: "Italiano" },
    { c: "nl", n: "Nederlands" },
    { c: "pl", n: "Polski" },
    { c: "tr", n: "Türkçe" },
    { c: "hi", n: "हिन्दी" },
  ];

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
      if (/[\u4e00-\u9fff]/.test(text) && !/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return "zh-CN";
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

  function stopSpeak() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; currentAudio = null; }
    const playing = document.querySelector(".tr-speak-btn.speaking");
    if (playing) playing.classList.remove("speaking");
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
      utter.addEventListener("end", () => {
        const btn = document.querySelector(".tr-speak-btn.speaking");
        if (btn) btn.classList.remove("speaking");
      });
      utter.addEventListener("error", () => {
        speakGoogleTTS(text, ttsLang);
      });
      speechSynthesis.speak(utter);
      return;
    }

    speakGoogleTTS(text, ttsLang);
  }

  function speakGoogleTTS(text, lang) {
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=dict-chrome-ex`;
    const audio = new Audio(url);
    currentAudio = audio;
    audio.addEventListener("ended", () => {
      currentAudio = null;
      const btn = document.querySelector(".tr-speak-btn.speaking");
      if (btn) btn.classList.remove("speaking");
    });
    audio.addEventListener("error", () => {
      currentAudio = null;
      const btn = document.querySelector(".tr-speak-btn.speaking");
      if (btn) btn.classList.remove("speaking");
    });
    audio.play().catch(() => {
      currentAudio = null;
      const btn = document.querySelector(".tr-speak-btn.speaking");
      if (btn) btn.classList.remove("speaking");
    });
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
      if (!includeAuto && l.c === "auto") return;
      const item = document.createElement("div");
      item.className = "tr-dd-item" + (l.c === val ? " tr-dd-active" : "");
      item.textContent = l.n;
      item.dataset.code = l.c;
      if (l.c === val) currentName = l.n;
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

})();
//# sourceMappingURL=content.js.map
