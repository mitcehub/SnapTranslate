import { detectTextLang } from '../shared/constants.js';

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

export function isBlockElement(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  if (BLOCK_TAGS.has(el.tagName)) return true;
  try {
    const display = window.getComputedStyle(el).display;
    if (BLOCK_DISPLAYS.has(display)) return true;
    if (INLINE_DISPLAYS.has(display)) return false;
  } catch { }
  return false;
}

export function isInlineElement(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  try {
    const display = window.getComputedStyle(el).display;
    return INLINE_DISPLAYS.has(display);
  } catch { }
  return false;
}

export function shouldSkipText(text, tl, options = {}) {
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
    const opacityVal = parseFloat(style.opacity);
    if (!isNaN(opacityVal) && opacityVal === 0) return true;
    if (el.offsetWidth === 0 && el.offsetHeight === 0) return true;
  } catch { }
  return false;
}

export { UNIVERSAL_EXCLUDE_SELECTORS, STAY_ORIGINAL_SELECTORS, STAY_ORIGINAL_TAGS, SKIP_TAGS, BLOCK_TAGS, SEMANTIC_MARKERS };
