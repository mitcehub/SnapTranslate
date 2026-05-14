(() => {
  "use strict";

  const L = [
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

  const INLINE_DISPLAYS = new Set([
    "inline", "inline-block", "inline-flex", "inline-grid",
    "inline-table", "ruby", "ruby-base", "ruby-text",
    "math", "inline-math",
  ]);

  const IGNORE_TAGS = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "SELECT",
    "CODE", "KBD", "SVG", "MATH", "INPUT", "BUTTON",
    "IMG", "VIDEO", "AUDIO", "IFRAME", "OBJECT", "EMBED",
    "CANVAS", "MAP", "AREA", "TRACK", "WBR", "BR",
  ]);

  const BLOCK_TAGS = new Set([
    "DIV", "SECTION", "ARTICLE", "MAIN", "HEADER", "FOOTER",
    "ASIDE", "NAV", "DETAILS", "SUMMARY", "FIGURE", "FIGCAPTION",
    "FIELDSET", "FORM", "H1", "H2", "H3", "H4", "H5", "H6",
    "P", "BLOCKQUOTE", "PRE", "OL", "UL", "LI", "DL", "DT", "DD",
    "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TD", "TH",
    "HR", "ADDRESS",
  ]);

  const PG_IGNORE_SELECTOR = "button, footer, pre, mark, nav, svg, img, [class*='logo'], [id*='logo'], .tr-float, .tr-bar, .tr-panel, .tr-bilingual, .tr-br, [contenteditable]";
  const PG_MIN_TEXT = 2;
  const PG_MAX_TEXT = 5000;

  let S = { selTL: "en", inputSL: "auto", inputTL: "en", pgTL: "en", enSel: true, enInput: true, enFloat: true, enContext: true, ignLangs: [], blacklist: [], selEngine: "google", inputEngine: "google", pgEngine: "google" };
  let ready = false;
  let tBar = null, panel = null, float = null;
  let busy = false, hoverTimer = null, panelTimer = null;
  let actInput = null, selText = "";
  let lastX = 0, lastY = 0;
  let pgTranslating = false;
  let siteRule = null;
  let openDropdown = null;
  let isBlacklisted = false;
  let sessionDisabled = false;

  let isDark = false;
  let themeObserver = null;
  let applyingTheme = false;

  function detectDark() {
    isDark = false;
    const els = [document.body, document.documentElement];
    for (const el of els) {
      if (!el) continue;
      const bg = window.getComputedStyle(el).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        const m = bg.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (m) {
          const lum = (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
          if (lum < 0.5) { isDark = true; return; }
          return;
        }
      }
    }
  }

  function applyTheme() {
    if (applyingTheme) return;
    applyingTheme = true;
    detectDark();
    if (isDark) document.documentElement.setAttribute("data-tr-theme", "dark");
    else document.documentElement.removeAttribute("data-tr-theme");
    if (float) {
      const img = float.querySelector("img");
      if (img) img.src = getIconUrl();
    }
    applyingTheme = false;
  }

  function watchTheme() {
    if (themeObserver) return;
    themeObserver = new MutationObserver(() => {
      requestAnimationFrame(() => applyTheme());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme", "color"] });
    if (document.body) {
      themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "style", "data-theme", "color"] });
    }
  }

  function injectStyles() {
    if (document.getElementById("tr-ext-styles")) return;
    const s = document.createElement("style");
    s.id = "tr-ext-styles";
    s.textContent = `
.tr-float{position:fixed;z-index:2147483640;width:36px;height:36px;border-radius:50%;background:transparent;border:none;box-shadow:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s;user-select:none;overflow:visible;touch-action:none}.tr-float:hover{transform:scale(1.1)}.tr-float.tr-dragging{transition:none;transform:scale(1.15)}.tr-float img{width:32px;height:32px;border-radius:50%;object-fit:cover;pointer-events:none}.tr-float-check{position:absolute;bottom:-2px;right:-2px;width:16px;height:16px;border-radius:50%;background:#4CAF50;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.3);transition:opacity .2s,transform .2s;pointer-events:none}.tr-float-check svg{width:10px;height:10px;color:#fff}.tr-float.tr-translated .tr-float-check{opacity:1;transform:scale(1)}.tr-float-x{position:absolute;top:-5px;right:-5px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.5);transition:opacity .15s,transform .15s;cursor:pointer;z-index:1}.tr-float-x svg{width:10px;height:10px;color:#9ca3af;pointer-events:none}.tr-float:hover .tr-float-x{opacity:1;transform:scale(1)}.tr-float-x:hover{background:#fee2e2}.tr-float-x:hover svg{color:#ef4444}.tr-float-menu{position:fixed;z-index:2147483641;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.14);padding:6px 0;min-width:200px;font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;animation:trFadeIn .12s ease}.tr-float-menu-item{display:flex;align-items:flex-start;gap:10px;padding:9px 14px;cursor:pointer;color:#374151;transition:background .1s}.tr-float-menu-item:hover{background:#f3f4f6}.tr-float-menu-item.danger{color:#ef4444}.tr-float-menu-item.danger .tr-menu-desc{color:#fca5a5}.tr-float-menu-item svg{width:16px;height:16px;flex-shrink:0;margin-top:2px}.tr-menu-text{display:flex;flex-direction:column;gap:1px}.tr-menu-label{font-size:13px;line-height:1.3;white-space:nowrap}.tr-menu-desc{font-size:11px;color:#9ca3af;line-height:1.3;white-space:nowrap}.tr-menu-sep{height:1px;background:#f3f4f6;margin:4px 0}
.tr-bar{position:fixed;z-index:2147483645;display:flex;align-items:center;padding:0;background:transparent;border:none;box-shadow:none;font:12px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;user-select:none;animation:trFadeIn .12s ease;gap:2px}@keyframes trFadeIn{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}
.tr-btn{display:inline-flex;align-items:center;justify-content:center;height:28px;padding:0 10px;border:none;border-radius:7px;background:transparent;color:#374151;cursor:pointer;font:12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:500;transition:all .15s;gap:4px;white-space:nowrap}.tr-btn:hover{background:#f3f4f6}.tr-btn.tr-primary{background:#4f46e5;color:#fff}.tr-btn.tr-primary:hover{background:#4338ca}.tr-btn svg{width:14px;height:14px;flex-shrink:0}
.tr-panel{position:fixed;z-index:2147483644;min-width:280px;max-width:480px;max-height:min(420px,calc(100vh - 24px));background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.14),0 2px 6px rgba(0,0,0,.08);font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;animation:trFadeIn .15s ease;overflow:visible;display:flex;flex-direction:column}.tr-phead{display:flex;align-items:center;justify-content:space-between;padding:10px 14px 0}.tr-plang{display:flex;align-items:center;gap:4px;position:relative}.tr-arrow{color:#9ca3af;font-size:13px;flex-shrink:0}.tr-pclose{width:22px;height:22px;border:none;border-radius:4px;background:transparent;color:#9ca3af;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center}.tr-pclose:hover{background:#f3f4f6;color:#374151}.tr-pbody{padding:8px 14px 12px;overflow-y:auto;flex:1;min-height:0}.tr-original{font-size:11px;color:#9ca3af;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #f3f4f6;word-break:break-word;max-height:70px;overflow-y:auto;display:flex;align-items:flex-start;gap:6px}.tr-original-text{flex:1;min-width:0}.tr-result{color:#1f2937;word-break:break-word;font-size:13px;line-height:1.6;max-height:240px;overflow-y:auto;display:flex;align-items:flex-start;gap:6px}.tr-result-text{flex:1;min-width:0}.tr-speak-btn{flex-shrink:0;width:24px;height:24px;border:none;border-radius:4px;background:transparent;color:#9ca3af;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:color .15s,background .15s}.tr-speak-btn:hover{color:#4f46e5;background:#eef2ff}.tr-speak-btn.speaking{color:#4f46e5;animation:trPulse 1s ease infinite}.tr-loading{display:flex;align-items:center;gap:8px;color:#9ca3af;padding:8px 0}.tr-spinner{width:14px;height:14px;border:2px solid #e5e7eb;border-top-color:#4f46e5;border-radius:50%;animation:trSpin .6s linear infinite}@keyframes trSpin{to{transform:rotate(360deg)}}@keyframes trPulse{0%,100%{opacity:1}50%{opacity:.4}}
.tr-actions{display:flex;gap:6px;margin-top:8px}.tr-copy-btn,.tr-replace-btn{padding:5px 10px;border:1px solid #e5e7eb;border-radius:5px;background:#f9fafb;color:#6b7280;cursor:pointer;font-size:11px;font-weight:500;transition:all .15s;display:inline-flex;align-items:center;gap:3px}.tr-copy-btn:hover,.tr-replace-btn:hover{background:#f3f4f6;color:#374151}.tr-copy-btn.copied{background:#ecfdf5;color:#059669;border-color:#a7f3d0}.tr-replace-btn{background:#eef2ff;color:#4f46e5;border-color:#c7d2fe}.tr-replace-btn:hover{background:#e0e7ff}
.tr-toast{position:fixed;z-index:2147483647;bottom:80px;left:50%;transform:translateX(-50%);padding:8px 20px;background:#059669;color:#fff;border-radius:8px;font:13px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:500;pointer-events:none;animation:trToast .3s ease}@keyframes trToast{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.tr-bilingual{color:inherit;word-break:break-word}
.tr-br{display:block;margin-top:2px;content:""}
.tr-dd{position:relative;display:inline-block}.tr-dd-btn{height:26px;line-height:26px;padding:0 20px 0 6px;border:1px solid #e5e7eb;border-radius:5px;font-size:11px;color:#374151;background:#fff;cursor:pointer;outline:none;min-width:85px;text-align:left;appearance:none;-webkit-appearance:none;position:relative;vertical-align:middle}.tr-dd-btn:hover{border-color:#d1d5db}.tr-dd-btn::after{content:"▾";position:absolute;right:5px;top:50%;transform:translateY(-50%);font-size:10px;color:#9ca3af;pointer-events:none}.tr-dd-btn[disabled]{opacity:.5;cursor:default;background:#f9fafb}.tr-dd-list{position:absolute;top:100%;left:0;z-index:10;min-width:100%;max-height:min(280px,calc(100vh - 80px));overflow-y:auto;background:#fff;border:1px solid #e5e7eb;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);margin-top:2px;padding:2px 0;display:none}.tr-dd-list.tr-dd-open{display:block}.tr-dd-item{padding:4px 8px;font-size:11px;color:#374151;cursor:pointer;white-space:nowrap;line-height:1.4}.tr-dd-item:hover{background:#f3f4f6}.tr-dd-item.tr-dd-active{color:#4f46e5;font-weight:600}
.tr-engine-sep{width:1px;height:16px;background:#e5e7eb;margin:0 2px;flex-shrink:0}.tr-engine-btn{min-width:60px;font-size:10px;height:22px;line-height:22px;padding:0 16px 0 4px;border-radius:4px}
[data-tr-theme="dark"] .tr-float{background:transparent;border:none;box-shadow:none}[data-tr-theme="dark"] .tr-float-x{background:#2d2d2d;box-shadow:0 1px 4px rgba(0,0,0,.4)}[data-tr-theme="dark"] .tr-float-x:hover{background:#7f1d1d}[data-tr-theme="dark"] .tr-float-x svg{color:#6b7280}[data-tr-theme="dark"] .tr-float-x:hover svg{color:#fca5a5}[data-tr-theme="dark"] .tr-float-menu{background:#1e1e1e;border-color:#333;box-shadow:0 8px 32px rgba(0,0,0,.4)}[data-tr-theme="dark"] .tr-float-menu-item{color:#d1d5db}[data-tr-theme="dark"] .tr-float-menu-item:hover{background:#2d2d2d}[data-tr-theme="dark"] .tr-float-menu-item.danger{color:#f87171}[data-tr-theme="dark"] .tr-float-menu-item.danger .tr-menu-desc{color:#7f1d1d}[data-tr-theme="dark"] .tr-menu-desc{color:#6b7280}[data-tr-theme="dark"] .tr-menu-sep{background:#333}[data-tr-theme="dark"] .tr-bar{background:transparent;border:none;box-shadow:none}[data-tr-theme="dark"] .tr-btn{color:#d1d5db}[data-tr-theme="dark"] .tr-btn:hover{background:#2d2d2d}[data-tr-theme="dark"] .tr-btn.tr-primary{background:#4f46e5;color:#fff}[data-tr-theme="dark"] .tr-btn.tr-primary:hover{background:#6366f1}[data-tr-theme="dark"] .tr-panel{background:#1e1e1e;border-color:#333;box-shadow:0 8px 32px rgba(0,0,0,.5),0 2px 6px rgba(0,0,0,.3)}[data-tr-theme="dark"] .tr-pclose{color:#6b7280}[data-tr-theme="dark"] .tr-pclose:hover{background:#2d2d2d;color:#d1d5db}[data-tr-theme="dark"] .tr-arrow{color:#6b7280}[data-tr-theme="dark"] .tr-original{color:#6b7280;border-bottom-color:#333}[data-tr-theme="dark"] .tr-result{color:#e5e7eb}[data-tr-theme="dark"] .tr-loading{color:#6b7280}[data-tr-theme="dark"] .tr-spinner{border-color:#333;border-top-color:#6366f1}[data-tr-theme="dark"] .tr-copy-btn,[data-tr-theme="dark"] .tr-replace-btn{background:#2d2d2d;border-color:#333;color:#9ca3af}[data-tr-theme="dark"] .tr-copy-btn:hover,[data-tr-theme="dark"] .tr-replace-btn:hover{background:#374151;color:#e5e7eb}[data-tr-theme="dark"] .tr-copy-btn.copied{background:#064e3b;color:#34d399;border-color:#065f46}[data-tr-theme="dark"] .tr-replace-btn{background:#312e81;color:#a5b4fc;border-color:#3730a3}[data-tr-theme="dark"] .tr-replace-btn:hover{background:#3730a3}[data-tr-theme="dark"] .tr-dd-btn{background:#1e1e1e;border-color:#333;color:#d1d5db}[data-tr-theme="dark"] .tr-dd-btn:hover{border-color:#4b5563}[data-tr-theme="dark"] .tr-dd-btn[disabled]{background:#1a1a1a;color:#6b7280}[data-tr-theme="dark"] .tr-dd-list{background:#1e1e1e;border-color:#333;box-shadow:0 4px 16px rgba(0,0,0,.4)}[data-tr-theme="dark"] .tr-dd-item{color:#d1d5db}[data-tr-theme="dark"] .tr-dd-item:hover{background:#2d2d2d}[data-tr-theme="dark"] .tr-dd-item.tr-dd-active{color:#818cf8}[data-tr-theme="dark"] .tr-engine-sep{background:#333}[data-tr-theme="dark"] .tr-engine-btn{background:#1e1e1e;border-color:#333;color:#d1d5db}[data-tr-theme="dark"] .tr-speak-btn{color:#6b7280}[data-tr-theme="dark"] .tr-speak-btn:hover{color:#818cf8;background:#1e1e1e}[data-tr-theme="dark"] .tr-speak-btn.speaking{color:#818cf8}[data-tr-theme="dark"] .tr-toast{background:#059669;color:#fff}
`;
    document.head.appendChild(s);
  }

  function svgIcon(name) {
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
    return icons[name] || "";
  }

  function escHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function closeDropdown() {
    if (openDropdown) {
      openDropdown.list.classList.remove("tr-dd-open");
      openDropdown = null;
    }
  }

  function clearAll() {
    closeDropdown();
    closeFloatMenu();
    stopSpeak();
    if (tBar) { tBar.remove(); tBar = null; }
    if (panel) { panel.remove(); panel = null; }
    if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
    if (panelTimer) { clearTimeout(panelTimer); panelTimer = null; }
    busy = false;
  }

  const TTS_LANG_MAP = {
    "auto": "en", "zh-CN": "zh-CN", "zh-TW": "zh-TW", "en": "en",
    "ja": "ja", "ko": "ko", "fr": "fr", "de": "de", "es": "es",
    "pt": "pt", "ru": "ru", "ar": "ar", "th": "th", "vi": "vi",
    "id": "id", "it": "it", "nl": "nl", "pl": "pl", "tr": "tr", "hi": "hi",
  };

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

  let floatMenu = null;

  function closeFloatMenu() {
    if (floatMenu) { floatMenu.remove(); floatMenu = null; }
  }

  function showDisableMenu() {
    closeFloatMenu();

    floatMenu = document.createElement("div");
    floatMenu.className = "tr-float-menu";

    const rect = float.getBoundingClientRect();

    const items = [
      { icon: svgIcon("eyeOff"), label: "下次打开", desc: "关闭本次，下次访问时重新显示", action: () => { removeFloat(); closeFloatMenu(); } },
      { icon: svgIcon("clock"), label: "临时禁用", desc: "本次会话中不再显示", action: () => { sessionDisabled = true; try { sessionStorage.setItem("tr-float-disabled", "1"); } catch {} removeFloat(); closeFloatMenu(); showToast("已临时禁用"); } },
      { icon: svgIcon("ban"), label: "永久禁用此网站", desc: "将此网站加入网页翻译黑名单", cls: "danger", action: async () => { const host = location.hostname; try { await chrome.runtime.sendMessage({ action: "addBlacklist", host }); } catch {} isBlacklisted = true; revertPageTranslation(); removeFloat(); closeFloatMenu(); showToast("已加入网页翻译黑名单"); } },
      { icon: svgIcon("powerOff"), label: "全局禁用", desc: "关闭所有网站的浮动按钮", action: async () => { try { await chrome.runtime.sendMessage({ action: "setEnFloat", value: false }); } catch {} S.enFloat = false; removeFloat(); closeFloatMenu(); showToast("已全局禁用浮动按钮"); } },
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
    settingsItem.addEventListener("click", (ev) => { ev.stopPropagation(); chrome.runtime.sendMessage({ action: "openOptions" }); closeFloatMenu(); });
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

  function buildDropdown(id, val, includeAuto, onChange, disabled) {
    const dd = document.createElement("div");
    dd.className = "tr-dd";

    const btn = document.createElement("button");
    btn.className = "tr-dd-btn";
    btn.id = id;
    if (disabled) btn.disabled = true;

    const list = document.createElement("div");
    list.className = "tr-dd-list";

    let currentName = "";
    L.forEach((l) => {
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
        const panelRect = panel ? panel.getBoundingClientRect() : null;
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

  function buildEngineDropdown(id, val, onChange) {
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
        const panelRect = panel ? panel.getBoundingClientRect() : null;
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

  function positionPanel() {
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

  function isEditable(el) {
    return !!(el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable));
  }

  function isOwn(el) {
    return !!(el && (el.closest(".tr-bar") || el.closest(".tr-panel") || el.closest(".tr-float") || el.closest(".tr-float-x") || el.closest(".tr-float-menu") || el.closest(".tr-bilingual")));
  }

  function isIgnored(text) {
    if (!S.ignLangs || !S.ignLangs.length) return false;
    const detected = detectTextLang(text);
    if (!detected) return false;
    return S.ignLangs.some((ign) => {
      if (ign === detected) return true;
      return ign.split("-")[0] === detected.split("-")[0];
    });
  }

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

  function showToolbar(x, y, txt, isInput) {
    clearAll();
    applyTheme();

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

    const curEngine = engine || "google";

    panel = document.createElement("div");
    panel.className = "tr-panel";

    const head = document.createElement("div");
    head.className = "tr-phead";

    const langWrap = document.createElement("div");
    langWrap.className = "tr-plang";

    const srcDD = buildDropdown("tr-panel-src", "auto", true, () => {}, true);
    const arrow = document.createElement("span");
    arrow.className = "tr-arrow";
    arrow.textContent = "→";
    const tgtDD = buildDropdown("tr-panel-tgt", tl, false, (code) => {
      reTranslate(txt, code, panel.dataset.engine || curEngine);
    });

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
    });

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
    positionPanel();
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
      const r = await chrome.runtime.sendMessage({ action: "translate", text: txt, sourceLang: sl, targetLang: tl, engine: engine || "google" });
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
        requestAnimationFrame(() => positionPanel());
        body.querySelectorAll(".tr-speak-btn").forEach((btn) => {
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
        body.querySelector(".tr-copy-btn").addEventListener("click", async function () {
          try {
            await navigator.clipboard.writeText(r.result);
            this.innerHTML = `${svgIcon("check")}Copied`;
            this.classList.add("copied");
            setTimeout(() => { this.innerHTML = `${svgIcon("copy")}Copy`; this.classList.remove("copied"); }, 2000);
          } catch {}
        });
        const rpBtn = body.querySelector(".tr-replace-btn");
        if (rpBtn) rpBtn.addEventListener("click", () => { doReplace(r.result); clearAll(); });
      } else if (!r.success && panel && loadingEl) {
        loadingEl.outerHTML = `<div class="tr-result" style="color:#ef4444;">Translation failed: ${escHtml(r.error || "unknown error")}</div>`;
        requestAnimationFrame(() => positionPanel());
      }
    } catch (e) {
      if (panel && loadingEl) loadingEl.outerHTML = `<div class="tr-result" style="color:#ef4444;">Error: ${escHtml(e.message)}</div>`;
      if (panel) requestAnimationFrame(() => positionPanel());
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

  function doReplace(translated) {
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
      showToast("Replaced ✓");
    } catch {}
  }

  function showToast(msg) {
    const t = document.createElement("div");
    t.className = "tr-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
  }

  document.addEventListener("mouseup", (e) => {
    if (!ready) return;
    lastX = e.clientX;
    lastY = e.clientY;
    setTimeout(() => {
      if (isOwn(e.target)) return;
      const sel = getSelection();
      if (!sel) { clearAll(); return; }
      if (sel.isInput && !S.enInput) return;
      if (!sel.isInput && !S.enSel) return;
      if (isIgnored(sel.text)) return;
      showToolbar(lastX, lastY, sel.text, sel.isInput);
    }, 10);
  }, true);

  document.addEventListener("mousedown", (e) => {
    if (!ready) return;
    if (panel && panel.contains(e.target)) {
      if (!e.target.closest(".tr-dd-item")) closeDropdown();
      return;
    }
    if (tBar && tBar.contains(e.target)) return;
    if (isOwn(e.target)) return;
    clearAll();
  }, true);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { clearAll(); revertPageTranslation(); }
  }, true);

  let floatPos = null;
  let floatDragged = false;

  function loadFloatPos() {
    try {
      const raw = localStorage.getItem("tr-float-pos");
      if (raw) { floatPos = JSON.parse(raw); floatDragged = true; }
    } catch {}
    if (!floatPos) floatPos = { right: 24, top: Math.round(innerHeight / 2 - 18) };
  }

  function saveFloatPos() {
    if (!float || !floatPos) return;
    try {
      localStorage.setItem("tr-float-pos", JSON.stringify(floatPos));
    } catch {}
  }

  function applyFloatPos() {
    if (!float || !floatPos) return;
    const fw = 36, fh = 36;
    let l, t;
    if (floatPos.left != null) {
      l = floatPos.left;
    } else if (floatPos.right != null) {
      l = innerWidth - floatPos.right - fw;
    }
    if (floatPos.top != null) {
      t = floatPos.top;
    } else if (floatPos.bottom != null) {
      t = innerHeight - floatPos.bottom - fh;
    }
    l = Math.max(4, Math.min(l, innerWidth - fw - 4));
    t = Math.max(4, Math.min(t, innerHeight - fh - 4));
    float.style.left = l + "px";
    float.style.top = t + "px";
  }

  function getIconUrl() {
    return chrome.runtime.getURL(isDark ? "assets/dark-256.png" : "assets/256.png");
  }

  window.addEventListener("resize", () => {
    if (!float) return;
    if (!floatDragged) {
      floatPos = { right: 24, top: Math.round(innerHeight / 2 - 18) };
    }
    applyFloatPos();
  });

  function createFloat() {
    if (float || isBlacklisted || sessionDisabled) return;
    loadFloatPos();
    applyTheme();
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
      if (!dragMoved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        dragMoved = true;
      }
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

    function onDragEnd(e) {
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
        if (pgTranslating) revertPageTranslation();
        else startPageTranslate();
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

  function isBlockNode(node) {
    if (node.nodeType === Node.TEXT_NODE) return false;
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    const tag = node.tagName;
    if (BLOCK_TAGS.has(tag)) return true;
    const cs = window.getComputedStyle(node);
    const display = (cs.display || "").split(" ")[0];
    return !INLINE_DISPLAYS.has(display);
  }

  function isIgnoredElement(el, isLeaf) {
    if (IGNORE_TAGS.has(el.tagName)) return true;
    if (el.closest(PG_IGNORE_SELECTOR)) return true;
    if (isLeaf && el.querySelector("input,textarea,select")) return true;
    const cs = window.getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return true;
    return false;
  }

  function insertTranslation(el, translated, tl) {
    const isBlock = isBlockNode(el);

    const font = document.createElement("font");
    font.className = "tr-bilingual notranslate";
    font.setAttribute("translate", "no");
    font.setAttribute("lang", tl || "");
    font.textContent = translated;

    const cs = window.getComputedStyle(el);
    font.style.fontSize = cs.fontSize;
    font.style.fontFamily = cs.fontFamily;
    font.style.fontWeight = cs.fontWeight;
    font.style.lineHeight = cs.lineHeight;
    font.style.letterSpacing = cs.letterSpacing;
    font.style.textAlign = cs.textAlign;

    if (isBlock) {
      const br = document.createElement("br");
      br.className = "tr-br";
      el.appendChild(br);
    } else {
      el.appendChild(document.createTextNode("\u00a0\u00a0"));
    }
    el.appendChild(font);
  }

  function collectParagraphs(root, rule) {
    const paragraphs = [];
    const visited = new Set();

    const extraBlockTags = new Set((rule?.extraBlockTags || []).map(t => t.toUpperCase()));
    const ruleExcludeSelectors = rule?.excludeSelectors || [];

    function isBlockLeaf(el) {
      if (!isBlockNode(el) && !extraBlockTags.has(el.tagName)) return false;
      return !Array.from(el.children).some(ch => !IGNORE_TAGS.has(ch.tagName) && (isBlockNode(ch) || extraBlockTags.has(ch.tagName)));
    }

    function isRuleExcluded(el) {
      if (!ruleExcludeSelectors.length) return false;
      for (const sel of ruleExcludeSelectors) {
        if (el.matches?.(sel)) return true;
      }
      return false;
    }

    function walk(node) {
      if (!node) return;
      if (visited.has(node)) return;

      if (node.nodeType === Node.ELEMENT_NODE) {
        if (IGNORE_TAGS.has(node.tagName)) return;
        if (node.classList.contains("tr-bilingual") || node.classList.contains("tr-br")) return;
        if (isRuleExcluded(node)) return;

        const leaf = isBlockLeaf(node);
        if (isIgnoredElement(node, leaf)) return;
        visited.add(node);

        if (leaf) {
          const innerText = (node.innerText || node.textContent || "").trim();
          if (innerText.length >= PG_MIN_TEXT && innerText.length <= PG_MAX_TEXT) {
            paragraphs.push({ element: node, text: innerText });
          }
          return;
        }

        for (const child of node.childNodes) {
          walk(child);
        }
        return;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text || !text.trim()) return;
        const parent = node.parentElement;
        if (!parent) return;
        if (IGNORE_TAGS.has(parent.tagName)) return;
        if (parent.classList.contains("tr-bilingual") || parent.classList.contains("tr-br")) return;
        if (parent.closest(PG_IGNORE_SELECTOR)) return;
        if (isRuleExcluded(parent)) return;
        const cs = window.getComputedStyle(parent);
        if (cs.display === "none" || cs.visibility === "hidden") return;

        if (isBlockLeaf(parent)) {
          if (!visited.has(parent)) {
            visited.add(parent);
            if (isIgnoredElement(parent, true)) return;
            const innerText = (parent.innerText || parent.textContent || "").trim();
            if (innerText.length >= PG_MIN_TEXT && innerText.length <= PG_MAX_TEXT) {
              paragraphs.push({ element: parent, text: innerText });
            }
          }
          return;
        }

        if (!visited.has(node)) {
          visited.add(node);
          paragraphs.push({ element: parent, text: text.trim() });
        }
      }
    }

    walk(root);
    return paragraphs;
  }

  let originalTitle = null;

  function revertPageTranslation() {
    document.querySelectorAll(".tr-bilingual").forEach((el) => {
      const prev = el.previousSibling;
      if (prev && prev.nodeType === Node.ELEMENT_NODE && prev.classList.contains("tr-br")) {
        prev.remove();
      } else if (prev && prev.nodeType === Node.TEXT_NODE && prev.textContent === "\u00a0\u00a0") {
        prev.remove();
      }
      el.remove();
    });
    document.querySelectorAll(".tr-br").forEach((el) => el.remove());
    if (originalTitle !== null) {
      document.title = originalTitle;
      originalTitle = null;
    }
    pgTranslating = false;
    if (float) float.classList.remove("tr-translated");
  }

  async function startPageTranslate() {
    if (isBlacklisted) {
      showToast("此网站已在网页翻译黑名单中");
      return;
    }

    if (pgTranslating) {
      revertPageTranslation();
      return;
    }

    const tl = S.pgTL || S.selTL || "en";
    const pgEngine = S.pgEngine || "google";
    pgTranslating = true;

    try {
      const rr = await chrome.runtime.sendMessage({ action: "getSiteRule", url: location.href });
      siteRule = rr?.rule || null;
    } catch {}

    let root;
    if (siteRule?.containerSelector) {
      const selectors = siteRule.containerSelector.split(",").map(s => s.trim());
      for (const sel of selectors) {
        root = document.querySelector(sel);
        if (root) break;
      }
    }
    if (!root) root = document.querySelector("main, article, [role='main']") || document.body;
    const paragraphs = collectParagraphs(root, siteRule);
    if (!paragraphs.length) {
      showToast("No translatable content found");
      pgTranslating = false;
      return;
    }

    showToast(`Translating ${paragraphs.length} paragraphs...`);

    if (document.title && !document.title.includes("\u200b")) {
      try {
        const r = await chrome.runtime.sendMessage({
          action: "translate",
          text: document.title,
          sourceLang: "auto",
          targetLang: tl,
          engine: pgEngine,
        });
        if (r.success && r.result) {
          originalTitle = document.title;
          document.title = r.result + " \u200b";
        }
      } catch {}
    }

    const BATCH = 5;
    for (let i = 0; i < paragraphs.length; i += BATCH) {
      if (!pgTranslating) break;

      const batch = paragraphs.slice(i, i + BATCH).filter((p) => {
        if (!p.element || !p.element.isConnected) return false;
        if (p.element.querySelector(".tr-bilingual")) return false;
        return true;
      });

      const promises = batch.map(async (p) => {
        try {
          const r = await chrome.runtime.sendMessage({
            action: "translate",
            text: p.text,
            sourceLang: "auto",
            targetLang: tl,
            engine: pgEngine,
          });
          return { paragraph: p, result: r.success ? r.result : null };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(promises);

      for (const item of results) {
        if (!item || !item.result || !pgTranslating) continue;
        if (!item.paragraph.element || !item.paragraph.element.isConnected) continue;
        insertTranslation(item.paragraph.element, item.result, tl);
      }
    }

    if (pgTranslating) {
      showToast("Translation complete ✓");
      if (float) float.classList.add("tr-translated");
    }
  }

  async function init() {
    injectStyles();
    applyTheme();
    watchTheme();
    try {
      const r = await chrome.runtime.sendMessage({ action: "getSettings" });
      if (r && r.settings) S = { ...S, ...r.settings };
    } catch {}

    try {
      const r = await chrome.runtime.sendMessage({ action: "checkBlacklist", url: location.href });
      if (r && r.blacklisted) isBlacklisted = true;
    } catch {}

    try {
      if (sessionStorage.getItem("tr-float-disabled") === "1") sessionDisabled = true;
    } catch {}

    ready = true;

    if (S.enFloat && !isBlacklisted && !sessionDisabled) createFloat();

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === "page-translate") startPageTranslate();
      if (msg.action === "show-toast" && msg.msg) showToast(msg.msg);
      if (msg.action === "showTranslation" && msg.result) {
        clearAll();
        tBar = document.createElement("div");
        tBar.className = "tr-bar";
        tBar.style.left = (innerWidth / 2) + "px";
        tBar.style.top = "100px";
        document.body.appendChild(tBar);
        panel = document.createElement("div");
        panel.className = "tr-panel";
        const head = document.createElement("div");
        head.className = "tr-phead";
        head.innerHTML = `<div class="tr-plang"><span style="font-size:11px;color:#6b7280">→ ${msg.tl}</span></div><button class="tr-pclose">${svgIcon("close")}</button>`;
        head.querySelector(".tr-pclose").addEventListener("click", () => clearAll());
        const body = document.createElement("div");
        body.className = "tr-pbody";
        body.innerHTML = `<div class="tr-original"><span class="tr-original-text">${escHtml((msg.text || "").substring(0, 200))}</span><button class="tr-speak-btn" data-lang="auto">${svgIcon("volume")}</button></div><div class="tr-result"><span class="tr-result-text">${escHtml(msg.result)}</span><button class="tr-speak-btn" data-lang="${msg.tl}">${svgIcon("volume")}</button></div><div class="tr-actions"><button class="tr-copy-btn">${svgIcon("copy")}Copy</button></div>`;
        body.querySelector(".tr-copy-btn").addEventListener("click", async function () {
          try { await navigator.clipboard.writeText(msg.result); this.innerHTML = `${svgIcon("check")}Copied`; this.classList.add("copied"); setTimeout(() => { this.innerHTML = `${svgIcon("copy")}Copy`; this.classList.remove("copied"); }, 2000); } catch {}
        });
        body.querySelectorAll(".tr-speak-btn").forEach((btn) => {
          btn.addEventListener("click", function () {
            if (this.classList.contains("speaking")) { stopSpeak(); return; }
            const lang = this.dataset.lang;
            const textEl = this.previousElementSibling;
            const text = textEl ? textEl.textContent : "";
            if (!text) return;
            stopSpeak();
            this.classList.add("speaking");
            speak(text, lang);
          });
        });
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
        const newBL = S.blacklist || [];
        const wasBlacklisted = isBlacklisted;
        isBlacklisted = newBL.some((pattern) => {
          const host = location.hostname;
          if (pattern.startsWith("*.")) {
            return host === pattern.slice(2) || host.endsWith(pattern.slice(1));
          }
          return host === pattern || host.endsWith("." + pattern);
        });
        if (wasBlacklisted && !isBlacklisted) {
          sessionDisabled = false;
          try { sessionStorage.removeItem("tr-float-disabled"); } catch {}
        }
        if (S.enFloat && !isBlacklisted && !sessionDisabled) createFloat();
        else removeFloat();
      }
    });
  }

  init();
})();
