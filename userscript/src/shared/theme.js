let isDark = false;
let themeObserver = null;
let applyingTheme = false;

function getIsDark() { return isDark; }

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

function watchTheme(fn) {
  if (themeObserver) return;
  themeObserver = new MutationObserver(() => {
    requestAnimationFrame(() => fn());
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme", "color"] });
  if (document.body) {
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "style", "data-theme", "color"] });
  }
}

function getIconUrl() {
  return isDark ? ASSETS.dark : ASSETS.light;
}
