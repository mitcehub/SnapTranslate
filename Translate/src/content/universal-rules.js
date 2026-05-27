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
const SEMANTIC_MARKERS = {
  "header": { "default-translate": "no" },
  "nav": { "side": "1", "default-translate": "no" },
  "footer:last-of-type": { "default-translate": "no" },
};
export function applySemanticMarkers() {
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
export function buildExcludeSet(excludeSelectors) {
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
export function shouldSkipText(text, tl) {
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
export function shouldSkipElement(el, excluded) {
  while (el) {
    if (excluded.has(el)) return true;
    el = el.parentElement;
  }
  return false;
}
export function shouldSkipByVisibility(el) {
  if (!el) return false;
  try {
    const style = window.getComputedStyle(el);
    if (style.display === 'none') return true;
    if (style.visibility === 'hidden') return true;
    if (parseFloat(style.opacity) === 0) return true;
    if (el.offsetWidth === 0 && el.offsetHeight === 0) return true;
  } catch { }
  return false;
}
export { UNIVERSAL_EXCLUDE_SELECTORS, STAY_ORIGINAL_SELECTORS, STAY_ORIGINAL_TAGS, SEMANTIC_MARKERS };
