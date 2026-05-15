const API = "https://translate.googleapis.com/translate_a/single";

export async function translateGoogle(text, sl, tl) {
  const params = new URLSearchParams({ client: "dict-chrome-ex", sl, tl, dt: "t", q: text });
  const url = `${API}?${params}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  let result = "";
  if (data && data[0]) {
    result = data[0].filter((i) => i && i[0]).map((i) => i[0]).join("");
  }
  return result;
}
