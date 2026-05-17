const PAGE_MARKER = 'data-ez-translated';
const MAX_TEXT_LENGTH_PER_REQUEST = 1800;
const MAX_TEXT_GROUP_LENGTH = 50;
const SCROLL_LIMIT_SCREENS = 1;
const TRANSLATION_CACHE_KEY_PREFIX = 'tr-cache:';
const DEFER_CHARS_PER_FRAME = 5000;

let injectedCssCache = new Set();

function injectRuleCss(cssRules) {
  if (!cssRules?.length) return;
  const key = cssRules.join('|');
  if (injectedCssCache.has(key)) return;
  injectedCssCache.add(key);
  try {
    const style = document.createElement('style');
    style.setAttribute('data-ez-css', '');
    style.textContent = cssRules.join('\n');
    document.head.appendChild(style);
  } catch { }
}

function applyGlobalStyles(styles) {
  if (!styles) return;
  try {
    const styleId = 'ez-global-styles';
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
      if (el.getAttribute(PAGE_MARKER)) continue;
      const txt = el.textContent.trim();
      if (txt && txt !== text) {
        el.textContent = text;
        el.setAttribute(PAGE_MARKER, 'fixed');
      }
    }
  }
}

function collectVisibleTextNodes(root, excluded, skipTags) {
  const nodes = [];
  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.textContent.trim();
      if (!text) continue;
      const parent = node.parentElement;
      if (!parent) continue;
      if (parent.closest(`[${PAGE_MARKER}]`)) continue;
      if (shouldSkipElement(parent, excluded)) continue;
      if (skipTags.has(parent.tagName)) continue;
      nodes.push(node);
    }
  } catch { }
  return nodes;
}

function walkShadowText(root, excluded, skipTags, nodes, excludeSlots, enterShadow) {
  if (root.nodeType === Node.ELEMENT_NODE) {
    if (excludeSlots?.length) {
      const slot = root.getAttribute('slot');
      if (slot && excludeSlots.includes(slot)) return;
    }
  }
  if (root.nodeType === Node.TEXT_NODE) {
    const parent = root.parentElement;
    if (!parent) return;
    if (parent.closest(`[${PAGE_MARKER}]`)) return;
    if (shouldSkipElement(parent, excluded)) return;
    if (skipTags.has(parent.tagName)) return;
    if (!root.textContent.trim()) return;
    nodes.push(root);
    return;
  }
  if (enterShadow !== false && root.shadowRoot) {
    walkShadowText(root.shadowRoot, excluded, skipTags, nodes, excludeSlots, enterShadow);
  }
  let child = root.firstChild;
  while (child) {
    walkShadowText(child, excluded, skipTags, nodes, excludeSlots, enterShadow);
    child = child.nextSibling;
  }
}

function collectByContainerMode(rule) {
  const containers = document.querySelectorAll(rule.containerSelector);
  if (!containers.length) return [];
  const excluded = buildExcludeSet(rule.excludeSelectors);
  if (rule.excludeSlots?.length) {
    for (const container of containers) {
      const allElements = container.querySelectorAll('*');
      for (let i = 0; i < allElements.length; i++) {
        const slot = allElements[i].getAttribute('slot');
        if (slot && rule.excludeSlots.includes(slot)) excluded.add(allElements[i]);
      }
    }
  }
  const blockTags = new Set(rule.extraBlockSelectors || []);
  const skipTags = new Set([...IGNORE_TAGS, ...(rule.extraBlockTags || []), ...STAY_ORIGINAL_TAGS, ...blockTags]);
  const nodes = [];
  const enterShadow = !rule.shadowSelectors?.length;
  for (const root of containers) {
    walkShadowText(root, excluded, skipTags, nodes, rule.excludeSlots, enterShadow);
  }
  if (rule.shadowSelectors?.length) {
    for (const sel of rule.shadowSelectors) {
      const parts = sel.split(' >>> ');
      if (parts.length === 2) {
        const hosts = document.querySelectorAll(parts[0]);
        for (const host of hosts) {
          if (host.shadowRoot) {
            const targets = host.shadowRoot.querySelectorAll(parts[1]);
            for (const target of targets) {
              if (target.getAttribute(PAGE_MARKER)) continue;
              if (excluded.has(target)) continue;
              const inner = collectVisibleTextNodes(target, excluded, skipTags);
              nodes.push(...inner);
            }
          }
        }
      } else {
        for (const el of document.querySelectorAll(sel)) {
          if (el.getAttribute(PAGE_MARKER)) continue;
          if (excluded.has(el)) continue;
          const inner = collectVisibleTextNodes(el, excluded, skipTags);
          nodes.push(...inner);
        }
      }
    }
  }
  return nodes;
}

function collectBySelectMode(rule) {
  const selectors = rule.selectors;
  if (!selectors?.length) return [];
  const excluded = buildExcludeSet(rule.excludeSelectors);
  const blockTags = new Set(rule.extraBlockSelectors || []);
  const skipTags = new Set([...IGNORE_TAGS, ...STAY_ORIGINAL_TAGS, ...blockTags]);
  const nodes = [];
  for (const sel of selectors) {
    if (sel.includes(' >>> ')) {
      const parts = sel.split(' >>> ');
      if (parts.length === 2) {
        const hosts = document.querySelectorAll(parts[0]);
        for (const host of hosts) {
          if (host.shadowRoot) {
            const targets = host.shadowRoot.querySelectorAll(parts[1]);
            for (const target of targets) {
              if (target.getAttribute(PAGE_MARKER)) continue;
              if (excluded.has(target)) continue;
              const inner = collectVisibleTextNodes(target, excluded, skipTags);
              nodes.push(...inner);
            }
          }
        }
      }
    } else if (sel.includes(' -> ')) {
      const parts = sel.split(' -> ').map(s => s.trim());
      let current = document;
      for (let i = 0; i < parts.length; i++) {
        const isLast = i === parts.length - 1;
        const found = current.querySelectorAll(parts[i]);
        if (!found.length) break;
        if (isLast) {
          for (const el of found) {
            if (el.getAttribute(PAGE_MARKER)) continue;
            if (excluded.has(el)) continue;
            const inner = collectVisibleTextNodes(el, excluded, skipTags);
            nodes.push(...inner);
          }
        } else {
          const next = found[0];
          current = next.shadowRoot || next;
        }
      }
    } else {
      let els = document.querySelectorAll(sel);
      for (const el of els) {
        if (el.getAttribute(PAGE_MARKER)) continue;
        if (excluded.has(el)) continue;
        const inner = collectVisibleTextNodes(el, excluded, skipTags);
        nodes.push(...inner);
      }
      for (const host of document.querySelectorAll('*')) {
        if (!host.shadowRoot) continue;
        try {
          els = host.shadowRoot.querySelectorAll(sel);
          for (const el of els) {
            if (el.getAttribute(PAGE_MARKER)) continue;
            if (excluded.has(el)) continue;
            const inner = collectVisibleTextNodes(el, excluded, skipTags);
            nodes.push(...inner);
          }
        } catch { }
      }
    }
  }
  return nodes;
}

function collectTargetNodes(rule) {
  if (rule.selectors?.length) return collectBySelectMode(rule);
  return collectByContainerMode(rule);
}

function isNodeVisible(node) {
  const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  if (!el) return false;
  return !shouldSkipByVisibility(el);
}

function isNodeInViewport(node, screens) {
  const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  if (!el) return true;
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const maxScroll = vh * (screens || SCROLL_LIMIT_SCREENS);
  return rect.top < vh + maxScroll && rect.bottom > -maxScroll;
}

function splitTextIntoGroups(nodes, maxLength, maxGroupLength) {
  const groups = [];
  let currentGroup = [];
  let currentLength = 0;
  for (const node of nodes) {
    const text = node.textContent.trim();
    if (!text) continue;
    if (text.length > maxLength) {
      if (currentGroup.length) {
        groups.push(currentGroup);
        currentGroup = [];
        currentLength = 0;
      }
      groups.push([node]);
      continue;
    }
    if (currentLength + text.length > maxLength || currentGroup.length >= maxGroupLength) {
      if (currentGroup.length) {
        groups.push(currentGroup);
        currentGroup = [];
        currentLength = 0;
      }
    }
    currentGroup.push(node);
    currentLength += text.length;
  }
  if (currentGroup.length) groups.push(currentGroup);
  return groups;
}

async function translateText(text, sl, tl, engine, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const r = await sendMessage({ action: "translate", text, sourceLang: sl, targetLang: tl, engine });
      if (r?.success) return r.result;
      throw new Error(r?.error || 'translate failed');
    } catch (e) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
      } else {
        throw e;
      }
    }
  }
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

async function translateNodes(nodes, sl, tl, engine, languageFilter) {
  if (!nodes.length) return 0;
  const maxLength = MAX_TEXT_LENGTH_PER_REQUEST;
  const maxGroupLength = MAX_TEXT_GROUP_LENGTH;
  const groups = splitTextIntoGroups(nodes, maxLength, maxGroupLength);
  let translated = 0;
  let charsThisFrame = 0;
  for (const group of groups) {
    const toTranslate = [];
    const cached = [];
    for (const node of group) {
      const text = node.textContent.trim();
      if (shouldSkipText(text, languageFilter === 'skip-target' ? tl : null)) continue;
      const key = getCacheKey(text, sl, tl, engine);
      const cachedResult = cacheGet(key);
      if (cachedResult) {
        cached.push({ node, text: cachedResult, original: text });
      } else {
        toTranslate.push({ node, text, key });
      }
    }
    for (const { node, text, original } of cached) {
      if (!node.parentNode) continue;
      const span = document.createElement('span');
      span.textContent = text;
      span.setAttribute(PAGE_MARKER, 'page');
      span.setAttribute('data-ez-original', original);
      node.parentNode.replaceChild(span, node);
      translated++;
    }
    if (toTranslate.length) {
      const texts = toTranslate.map(t => t.text);
      for (const { node } of toTranslate) {
        if (!node.parentNode) continue;
        const placeholder = document.createElement('span');
        placeholder.className = 'tr-translating';
        placeholder.setAttribute(PAGE_MARKER, 'translating');
        placeholder.textContent = node.textContent;
        node.parentNode.replaceChild(placeholder, node);
        node._placeholder = placeholder;
      }
      try {
        const r = await sendMessage({ action: "translateBatch", texts, sourceLang: sl, targetLang: tl, engine });
        if (r?.success && Array.isArray(r.results)) {
          for (let i = 0; i < toTranslate.length; i++) {
            const { node, key } = toTranslate[i];
            const resultText = r.results[i];
            if (resultText == null) continue;
            const placeholder = node._placeholder;
            if (!placeholder || !placeholder.parentNode) continue;
            const original = node.textContent.trim();
            cacheSet(key, resultText);
            const span = document.createElement('span');
            span.textContent = resultText;
            span.setAttribute(PAGE_MARKER, 'page');
            span.setAttribute('data-ez-original', original);
            placeholder.parentNode.replaceChild(span, placeholder);
            translated++;
          }
        } else {
          for (const { node } of toTranslate) {
            const ph = node._placeholder;
            if (ph && ph.parentNode) ph.parentNode.replaceChild(node, ph);
          }
        }
      } catch {
        for (const { node } of toTranslate) {
          const ph = node._placeholder;
          if (ph && ph.parentNode) ph.parentNode.replaceChild(node, ph);
        }
      }
    }
    charsThisFrame += group.reduce((sum, node) => sum + node.textContent.length, 0);
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
  const nodes = collectTargetNodes(currentRule);
  if (nodes.length) {
    await translateNodes(nodes, currentSl, currentTl, currentEngine, currentRule.languageFilter);
  }
}

function startObserver() {
  if (observer) observer.disconnect();
  let pending = false;
  const callback = () => {
    if (pending) return;
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
  const nodes = collectTargetNodes(rule);
  if (nodes.length) {
    await translateNodes(nodes, sl, tl, engine, rule.languageFilter);
  }
  startObserver();
}
