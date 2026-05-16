import { translateGoogle } from './translate-google.js';
import { translateBing } from './translate-bing.js';

const REGISTRY = new Map();
const cache = new Map();
const CACHE_MAX = 500;

export function registerEngine(name, translateFn) {
  REGISTRY.set(name, translateFn);
}

registerEngine("google", translateGoogle);
registerEngine("bing", translateBing);

export async function translate(text, sl, tl, engine) {
  if (!text || !text.trim()) return "";
  if (sl === tl && sl !== "auto") return text;

  const eng = engine || "google";
  const key = `${eng}:${sl}:${tl}:${text.substring(0, 200)}`;

  const cached = cache.get(key);
  if (cached) {
    cache.delete(key);
    cache.set(key, cached);
    return cached;
  }

  const fn = REGISTRY.get(eng);
  if (!fn) throw new Error(`Unknown translation engine: ${eng}`);

  const result = await fn(text, sl, tl);

  cache.set(key, result);
  if (cache.size > CACHE_MAX) {
    const first = cache.keys().next().value;
    if (first !== undefined) cache.delete(first);
  }
  return result;
}
