const GOOGLE_API = "https://translate.googleapis.com/translate_a/single";
const GOOGLE_TIMEOUT = 10000;

function gmFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || GOOGLE_TIMEOUT;
    const timer = setTimeout(() => {
      if (typeof GM_xmlhttpRequest !== 'undefined') {
        try { GM_xmlhttpRequest({ url, abort: () => {}, method: 'GET' }); } catch {}
      }
      reject(new Error('Request timeout'));
    }, timeout);

    if (typeof GM_xmlhttpRequest === 'undefined') {
      clearTimeout(timer);
      reject(new Error('GM_xmlhttpRequest not available'));
      return;
    }

    const req = GM_xmlhttpRequest({
      method: options.method || 'GET',
      url: url,
      headers: options.headers || {},
      data: options.body || null,
      onload: function(resp) {
        clearTimeout(timer);
        resolve(resp);
      },
      onerror: function(err) {
        clearTimeout(timer);
        reject(new Error(err?.error || 'Network error'));
      },
      ontimeout: function() {
        clearTimeout(timer);
        reject(new Error('Request timeout'));
      },
    });
  });
}

async function translateGoogle(text, sl, tl) {
  const params = new URLSearchParams({ client: "dict-chrome-ex", sl, tl, dt: "t", q: text });
  const url = `${GOOGLE_API}?${params}`;
  try {
    const resp = await gmFetch(url);
    if (resp.status !== 200) throw new Error(`HTTP ${resp.status}`);
    const data = JSON.parse(resp.responseText);
    let result = "";
    if (data && data[0]) {
      result = data[0].filter((i) => i && i[0]).map((i) => i[0]).join("");
    }
    return result;
  } catch (e) {
    throw e;
  }
}
