import { sendMessage, detectTextLang } from '../shared/constants.js';
import {
  buildExcludeSet, shouldSkipText, shouldSkipElement,
  shouldSkipByVisibility, applySemanticMarkers, STAY_ORIGINAL_TAGS,
  SKIP_TAGS, isBlockElement
} from './universal-rules.js';

const MARKER = 'data-snap-translated';
const WRAPPER_CLASS = 'snap-target-wrapper';
const INNER_CLASS = 'snap-target-inner';
const MAX_TEXT_LENGTH_PER_REQUEST = 1800;
const MAX_PARAGRAPH_LENGTH = 5000;
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

export function applyFixedElements(fixedElements) {
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
  if (document.getElementById(styleId)) return;
  const css = `
.${WRAPPER_CLASS} { display: inline; }
.${INNER_CLASS} { display: inline; }
.${ORIGINAL_CLASS} { display: none !important; }
  `.trim();
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
  const maxScroll = vh * (screens || SCROLL_LIMIT_SCREENS);
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
  originalContainer.style.display = 'none';
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
      originalContainer.style.display = 'none';
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
    if (isInViewport(rootEl, 0)) {
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

export function stopObserver() {
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

export async function applyPageRule(rule, sl, tl, engine) {
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

export function revertPageTranslation() {
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
