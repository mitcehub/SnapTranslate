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

export function watchTheme(applyThemeFn) {
  if (themeObserver) return;
  themeObserver = new MutationObserver(() => {
    requestAnimationFrame(() => applyThemeFn());
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme", "color"] });
  if (document.body) {
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "style", "data-theme", "color"] });
  }
}

export function getIconUrl() {
  return chrome.runtime.getURL(isDark ? "assets/dark-256.png" : "assets/256.png");
}
