import { translateGoogle } from './translate-google.js';
import { translateBing } from './translate-bing.js';

const cache = new Map();
const CACHE_MAX = 500;

export async function translate(text, sl, tl, engine) {
  if (!text || !text.trim()) return "";
  if (sl === tl && sl !== "auto") return text;

  const eng = engine || "google";
  const key = `${eng}:${sl}:${tl}:${text.substring(0, 200)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  let result;

  switch (eng) {
    case "bing":
      result = await translateBing(text, sl, tl);
      break;
    default:
      result = await translateGoogle(text, sl, tl);
  }

  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(key, result);
  return result;
}
