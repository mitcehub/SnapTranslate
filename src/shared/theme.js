let isDark = false;
let themeObserver = null;
let applyingTheme = false;

export function getIsDark() { return isDark; }

export function applyTheme(floatEl, getIconUrlFn) {
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

export function watchTheme(applyThemeFn) {
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

export function getIconUrl() {
  return chrome.runtime.getURL(isDark ? "assets/dark-256.png" : "assets/256.png");
}
