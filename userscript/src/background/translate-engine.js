const REGISTRY = new Map();
const cache = new Map();
const CACHE_MAX = 2000;

function textHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

function registerEngine(name, translateFn) {
  REGISTRY.set(name, translateFn);
}
registerEngine("google", translateGoogle);
registerEngine("bing", translateBing);

function makeCacheKey(text, sl, tl, eng) {
  const textKey = text.length <= 200 ? text : `${text.substring(0, 200)}#${textHash(text)}`;
  return `${eng}:${sl}:${tl}:${textKey}`;
}

function cacheGet(key) {
  if (cache.has(key)) {
    const val = cache.get(key);
    cache.delete(key);
    cache.set(key, val);
    return val;
  }
  return null;
}

function cacheSet(key, val) {
  cache.set(key, val);
  while (cache.size > CACHE_MAX) {
    const first = cache.keys().next().value;
    if (first !== undefined) cache.delete(first);
  }
}

async function translateWithRetry(fn, text, sl, tl, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(text, sl, tl);
    } catch (e) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
      } else {
        throw e;
      }
    }
  }
}

async function translate(text, sl, tl, engine) {
  if (!text || !text.trim()) return "";
  if (sl === tl && sl !== "auto") return text;
  const eng = engine || "google";
  const key = makeCacheKey(text, sl, tl, eng);
  const cached = cacheGet(key);
  if (cached) return cached;
  const fn = REGISTRY.get(eng);
  if (!fn) throw new Error(`Unknown translation engine: ${eng}`);
  const result = await translateWithRetry(fn, text, sl, tl);
  cacheSet(key, result);
  return result;
}

async function translateBatch(texts, sl, tl, engine) {
  if (!texts?.length) return [];
  const eng = engine || "google";
  const fn = REGISTRY.get(eng);
  if (!fn) throw new Error(`Unknown translation engine: ${eng}`);
  const results = [];
  const uncached = [];
  const uncachedIdx = [];
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    if (!text || !text.trim()) {
      results[i] = "";
      continue;
    }
    const key = makeCacheKey(text, sl, tl, eng);
    const cached = cacheGet(key);
    if (cached) {
      results[i] = cached;
    } else {
      results[i] = undefined;
      uncached.push(text);
      uncachedIdx.push(i);
    }
  }
  if (uncached.length) {
    const batchResults = await Promise.allSettled(
      uncached.map(text => translateWithRetry(fn, text, sl, tl))
    );
    for (let j = 0; j < uncachedIdx.length; j++) {
      const idx = uncachedIdx[j];
      const r = batchResults[j];
      if (r.status === 'fulfilled') {
        results[idx] = r.value;
        const key = makeCacheKey(uncached[j], sl, tl, eng);
        cacheSet(key, r.value);
      } else {
        results[idx] = null;
      }
    }
  }
  return results;
}
