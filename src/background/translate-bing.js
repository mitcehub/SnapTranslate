let bingConfig = null;

const BING_LANG_MAP = {
  "auto": "auto-detect",
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
};

function bingLang(code) {
  return BING_LANG_MAP[code] || code;
}

async function fetchBingConfig() {
  const resp = await fetch("https://www.bing.com/translator");
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const html = await resp.text();

  const igMatch = html.match(/IG:"([^"]+)"/) || html.match(/IG\s*=\s*"([^"]+)"/);
  if (!igMatch) throw new Error("Failed to extract IG");
  const ig = igMatch[1];

  const iidMatch = html.match(/data-iid="([^"]+)"/);
  if (!iidMatch) throw new Error("Failed to extract IID");
  const iid = iidMatch[1];

  const paramsMatch = html.match(/params_AbusePreventionHelper\s*=\s*\[(\d+),\s*"([^"]*)",\s*(\d+)\]/);
  if (!paramsMatch) throw new Error("Failed to extract abuse prevention params");
  const token = paramsMatch[2];
  const key = paramsMatch[1];
  const tokenExpiryInterval = parseInt(paramsMatch[3], 10);

  bingConfig = {
    ig,
    iid,
    token,
    key,
    expiry: Date.now() + tokenExpiryInterval,
  };
  return bingConfig;
}

async function getBingConfig() {
  if (bingConfig && Date.now() < bingConfig.expiry) return bingConfig;
  return fetchBingConfig();
}

function clearBingConfig() {
  bingConfig = null;
}

export async function translateBing(text, sl, tl) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const config = await getBingConfig();
      const bsl = bingLang(sl);
      const btl = bingLang(tl);

      const body = new URLSearchParams({
        fromLang: bsl,
        text: text,
        token: config.token,
        key: config.key,
        to: btl,
      });

      const url = `https://www.bing.com/ttranslatev3?isVertical=1&IG=${config.ig}&IID=${config.iid}.1`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Referer": "https://www.bing.com/translator",
        },
        body: body.toString(),
      });

      if (!resp.ok) {
        const err = new Error(`HTTP ${resp.status}`);
        lastError = err;
        if (attempt === 0) { clearBingConfig(); continue; }
        throw err;
      }

      const data = await resp.json();

      if (data.ShowCaptcha || data.StatusCode === 401) {
        const err = new Error(data.ShowCaptcha ? "Captcha required" : "Unauthorized");
        lastError = err;
        if (attempt === 0) { clearBingConfig(); continue; }
        throw err;
      }

      if (!data || !data[0] || !data[0].translations || !data[0].translations[0]) {
        throw new Error("Unexpected response format");
      }

      return data[0].translations[0].text;
    } catch (e) {
      lastError = e;
      if (attempt === 0) { clearBingConfig(); continue; }
      throw lastError;
    }
  }
  throw lastError || new Error("Translation failed");
}
