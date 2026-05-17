(function () {
  'use strict';

  const API = "https://translate.googleapis.com/translate_a/single";
  const GOOGLE_TIMEOUT = 10000;

  async function translateGoogle(text, sl, tl) {
    const params = new URLSearchParams({ client: "dict-chrome-ex", sl, tl, dt: "t", q: text });
    const url = `${API}?${params}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GOOGLE_TIMEOUT);
    try {
      const resp = await fetch(url, { signal: controller.signal });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      let result = "";
      if (data && data[0]) {
        result = data[0].filter((i) => i && i[0]).map((i) => i[0]).join("");
      }
      return result;
    } catch (e) {
      if (e.name === "AbortError") throw new Error("Request timeout");
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

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

  async function translateBing(text, sl, tl) {
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

  const LANG_CODES = [
    "auto", "zh-CN", "zh-TW", "en", "ja", "ko", "fr", "de", "es",
    "pt", "ru", "ar", "th", "vi", "id", "it", "nl", "pl", "tr", "hi",
  ];

  const ENGINES = [
    { id: "google", name: "Google" },
    { id: "bing", name: "Bing" },
  ];

  const BROWSER_LANG_MAP = {
    "zh": "zh-CN", "zh-cn": "zh-CN", "zh-tw": "zh-TW", "zh-hk": "zh-TW",
    "en": "en", "en-us": "en", "en-gb": "en",
    "ja": "ja", "ko": "ko", "fr": "fr", "de": "de",
    "es": "es", "pt": "pt", "pt-br": "pt",
    "ru": "ru", "ar": "ar", "th": "th", "vi": "vi",
    "id": "id", "it": "it", "nl": "nl", "pl": "pl",
    "tr": "tr", "hi": "hi",
  };

  function getBrowserLang() {
    const nav = navigator.language || "en";
    const lower = nav.toLowerCase();
    if (BROWSER_LANG_MAP[lower]) return BROWSER_LANG_MAP[lower];
    const prefix = lower.split("-")[0];
    return BROWSER_LANG_MAP[prefix] || "en";
  }

  function isBlacklisted(hostname, blacklist) {
    if (!Array.isArray(blacklist)) return false;
    return blacklist.some((pattern) => {
      if (typeof pattern !== "string") return false;
      if (pattern.startsWith("*.")) {
        const base = pattern.slice(2);
        return hostname === base || hostname.endsWith("." + base);
      }
      return hostname === pattern || hostname.endsWith("." + pattern);
    });
  }

  const EN_LANG_NAMES = {
    auto: "Detect Language", "zh-CN": "Chinese (Simplified)", "zh-TW": "Chinese (Traditional)",
    en: "English", ja: "Japanese", ko: "Korean", fr: "French", de: "German",
    es: "Spanish", pt: "Portuguese", ru: "Russian", ar: "Arabic", th: "Thai",
    vi: "Vietnamese", id: "Indonesian", it: "Italian", nl: "Dutch", pl: "Polish",
    tr: "Turkish", hi: "Hindi",
  };

  const LANGS = LANG_CODES.map((code) => ({ code, name: EN_LANG_NAMES[code] || code }));

  const DEF = {
    selTL: getBrowserLang(),
    inputSL: "auto",
    inputTL: "en",
    pgTL: getBrowserLang(),
    enSel: true,
    enInput: true,
    enPage: true,
    enFloat: true,
    autoTranslate: false,
    ignLangs: [],
    selEngine: "google",
    inputEngine: "google",
    pgEngine: "google",
    blacklist: [],
    autoBlacklist: [],
    rulesUrl: "",
    allowRemoteTTS: false,
  };

  async function getSettings() {
    const r = await chrome.storage.local.get(["settings"]);
    return { ...DEF, ...(r.settings || {}) };
  }

  var rules = [
  	{
  		name: "1688",
  		matches: [
  			"www.1688.com"
  		],
  		injectedCss: [
  			"[class^='defaultSubNav'],[class^='loginButton'] {height:unset!important;}",
  			"[data-tracker='category'] > font {white-space:nowrap!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "1paragraph",
  		matches: [
  			"1paragraph.app"
  		],
  		selectors: [
  			"#book"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "1password",
  		matches: [
  			"*.1password.com"
  		],
  		excludeSelectors: [
  			".secret-key"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ac.nowcoder",
  		matches: [
  			"ac.nowcoder.com"
  		],
  		excludeSelectors: [
  			".answer-module",
  			".question-intr",
  			".language-list",
  			".question-oi"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "afreecatv",
  		matches: [
  			"www.afreecatv.com"
  		],
  		globalStyles: {
  			"a.title": "max-height:unset;-webkit-line-clamp:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "aha",
  		matches: [
  			"*.ideas.aha.io"
  		],
  		excludeSelectors: [
  			".comment-header",
  			".vote-status",
  			".idea-meta",
  			".filters-title",
  			".ideas-showing-count",
  			".my-ideas-filters-wrapper",
  			".statuses-filters-wrapper",
  			".categories-filters-wrapper",
  			"[class^='attachment']",
  			"span[class^='attachment-name']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "aliexpress",
  		matches: [
  			"*.aliexpress.*"
  		],
  		excludeSelectors: [
  			"[class*='multi--price']"
  		],
  		injectedCss: [
  			"[class*='multi--title'],.G7dOC {-webkit-line-clamp:unset;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "aljazeera",
  		matches: [
  			"www.aljazeera.com"
  		],
  		excludeSelectors: [
  			"#immersive-translate-caption-window",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "allmyfaves",
  		matches: [
  			"https://allmyfaves.com/"
  		],
  		selectors: [
  			"p"
  		],
  		paragraphMinTextCount: 2,
  		paragraphMinWordCount: 1,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "alphaxiv",
  		matches: [
  			"www.alphaxiv.org"
  		],
  		injectedCss: [
  			"[class*=line-clamp] {-webkit-line-clamp:unset;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "amazon",
  		matches: [
  			"www.amazon.*"
  		],
  		excludeSelectors: [
  			"#navFooter",
  			".s-price-instructions-style",
  			"[class*='-star ']",
  			"[data-hook='acr-average-stars-rating-text']",
  			".a-color-price,.a-price",
  			"[data-testid='price-section']",
  			"[data-component='dui-badge']",
  			"#glow-ingress-block,#nav-link-accountList,#nav-orders,#nav-cart"
  		],
  		extraBlockSelectors: [
  			".a-size-small.a-link-normal.page-banner-link.a-nowrap"
  		],
  		injectedCss: [
  			".a-carousel-viewport {height:unset;}",
  			"[class*='clamp'] {max-height: unset!important;-webkit-line-clamp: unset!important;}",
  			"[data-rows] {max-height: unset!important;-webkit-line-clamp: unset!important;}",
  			"[data-a-expander-name='review_text_read_more'] { max-height: unset;}",
  			".compact.primaryText.primaryTextOnly {max-height: unset;-webkit-line-clamp: unset;}",
  			".format {-webkit-line-clamp: unset;}",
  			".dcl-truncate,[class*='textButton'],span[data-a-max-rows] {max-height:unset!important;-webkit-line-clamp: unset!important;}"
  		],
  		paragraphMinTextCount: 4,
  		paragraphMinWordCount: 2,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "androidpolice",
  		matches: [
  			"www.androidpolice.com"
  		],
  		excludeSelectors: [
  			".author",
  			".w-total-info",
  			".images-header-menu-list",
  			".w-display-card-details",
  			".w-display-card-extra"
  		],
  		injectedCss: [
  			".display-card-title,.display-card-title * {height:unset!important;-webkit-line-clamp:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "angel",
  		matches: [
  			"www.angel.com"
  		],
  		excludeSelectors: [
  			".bmpui-subtitle-position-vtt *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "annasArchive",
  		matches: [
  			"*.annas-archive.org",
  			"annas-archive.org"
  		],
  		extraBlockSelectors: [
  			"a.custom-a"
  		],
  		globalStyles: {
  			"div[id^='link-index-']": "height: unset; max-height: unset;",
  			"main div[class*='h-[125]']": "height:auto"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "app.element.io",
  		matches: [
  			"app.element.io"
  		],
  		excludeSelectors: [
  			".mx_DisambiguatedProfile",
  			".mx_ReplyChain_wrapper",
  			".mx_ThreadSummary_replies_amount"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "app.rapidlaunch.wtf",
  		matches: [
  			"app.rapidlaunch.wtf"
  		],
  		excludeSelectors: [
  			"div.border-b.border-gray-700\\/50.flex",
  			"a.text-blue-400",
  			".flex.items-center.text-xs.text-gray-400",
  			".flex.items-center.gap-1\\.5.mb-1"
  		],
  		injectedCss: [
  			".max-h-24 { max-height: unset !important; }",
  			".line-clamp-2 {-webkit-line-clamp: unset !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "app.schildi.chat",
  		matches: [
  			"app.schildi.chat"
  		],
  		excludeSelectors: [
  			".mx_DisambiguatedProfile",
  			".mx_MessageTimestamp",
  			".mx_EventTile_avatar"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "apple",
  		matches: [
  			"developer.apple.com"
  		],
  		excludeSelectors: [
  			".developer-video-player",
  			".vue-recycle-scroller",
  			".developer-video-player *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "appleDeveloper",
  		matches: [
  			"developer.apple.com/documentation/*"
  		],
  		selectors: [
  			".container",
  			"h3.title",
  			"div.content"
  		],
  		excludeSelectors: [
  			".vue-recycle-scroller"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "appleinsider",
  		matches: [
  			"appleinsider.com"
  		],
  		excludeSelectors: [
  			"#topic-nav"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "appsumo",
  		matches: [
  			"appsumo.com"
  		],
  		globalStyles: {
  			"[class*='line-clamp']": "-webkit-line-clamp: unset"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ar5iv",
  		matches: [
  			"ar5iv.labs.arxiv.org"
  		],
  		excludeSelectors: [
  			".ltx_bibliography",
  			".ltx_tag.ltx_tag_item",
  			".ltx_listing.ltx_lstlisting.ltx_listing",
  			".ltx_eqn_table"
  		],
  		stayOriginalSelectors: [
  			".ltx_note"
  		],
  		extraBlockSelectors: [
  			".ltx_p"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "arca",
  		matches: [
  			"arca.live"
  		],
  		excludeSelectors: [
  			"span.user-info"
  		],
  		globalStyles: {
  			".vrow.column": "height:unset !important;",
  			".body .board-article .article-list .list-table .vrow.column .vcol": "width:unset !important;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "archiveofourown",
  		matches: [
  			"archiveofourown.org"
  		],
  		excludeSelectors: [
  			".meta,.navigation,.byline,.pagination,.datetime,.stats",
  			"#add_comment",
  			"#footer",
  			".summary > h3",
  			".notes > h3"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "archiveofourown-chapter",
  		matches: [
  			"archiveofourown.org/works*chapters/*"
  		],
  		excludeSelectors: [
  			".meta,.navigation,.byline,.pagination,.datetime,.stats",
  			"#add_comment",
  			"#footer",
  			".summary > h3",
  			".notes > h3"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "archiveToday",
  		matches: [
  			"archive.today",
  			"archive.ph",
  			"archive.is",
  			"archive.md"
  		],
  		excludeSelectors: [
  			"#HEADER"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ardmediathek",
  		matches: [
  			"www.ardmediathek.*"
  		],
  		excludeSelectors: [
  			".ardplayer-viewport-addon-overlays",
  			".ardplayer-viewport-addon-overlays *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "arena",
  		matches: [
  			"lmarena.ai"
  		],
  		excludeSelectors: [
  			"table"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "arte",
  		matches: [
  			"www.arte.tv"
  		],
  		excludeSelectors: [
  			"#immersive-translate-caption-window",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "artstationArtwork",
  		matches: [
  			"www.artstation.com/artwork/*"
  		],
  		selectors: [
  			".project-description",
  			"div.project-comment-text",
  			".asset-caption"
  		],
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "artstationBlog",
  		matches: [
  			"https://www.artstation.com/blogs",
  			"https://www.artstation.com/blogs/*"
  		],
  		excludeSelectors: [
  			"blog-card-thumbnail",
  			"blog-card-header",
  			".blog-card-author",
  			".blog-card-meta",
  			".blog-view-header",
  			".blog-grid-title",
  			".post-meta-header"
  		],
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "artstationLearning",
  		matches: [
  			"www.artstation.com/learning/courses/*"
  		],
  		excludeSelectors: [
  			".learning-card-meta",
  			".vjs-text-track-display",
  			"#immersive-translate-caption-window",
  			".vjs-text-track-display *",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "arxiv",
  		matches: [
  			"https://browse.arxiv.org",
  			"https://arxiv.org/html/*"
  		],
  		excludeSelectors: [
  			".desktop_header",
  			"[class*='ltx_lst_language_']",
  			"div.package-alerts",
  			".ltx_toclist",
  			".ltx_authors",
  			".ltx_bibliography"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "arxiv-vanity.com",
  		matches: [
  			"www.arxiv-vanity.com"
  		],
  		excludeSelectors: [
  			".arxiv-vanity-wrapper"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "asu",
  		matches: [
  			"api.playposit.com"
  		],
  		excludeSelectors: [
  			"#overlay-container",
  			"#overlay-container *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "auth0Openai",
  		matches: [
  			"auth0.openai.com"
  		],
  		excludeSelectors: [
  			"form",
  			"header > h1"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "autoHeight",
  		matches: [
  			"*.sooplive.*",
  			"zen-browser.app",
  			"message.alibaba.com",
  			"erp.91miaoshou.com",
  			"jddonline.com",
  			"cis.vemic.com",
  			"scripod.com",
  			"drjoedispenza.com",
  			"www.x-mol.com",
  			"webvpn.bnu.*",
  			"www.connectedpapers.com",
  			"isappscience.org",
  			"www.dtmstation.com",
  			"kalshi.com",
  			"engoo.com",
  			"puchipurabu.com",
  			"www.wildberries.ru",
  			"m.163.com",
  			"discord.com/discovery*",
  			"zhenghedata.com",
  			"yoeshop.ssweet.*"
  		],
  		selectors: [
  			"#plugin-product-comment",
  			".plugin-product-comment-collections",
  			"[class*='line-clamp-']"
  		],
  		injectedCss: [
  			".side_list a,.title a,.tit,.item-title {-webkit-line-clamp:unset!important;height:unset!important;}",
  			"details {height:unset!important;}",
  			".product-title {height:unset!important;-webkit-line-clamp:unset!important;}",
  			".plugin-product-comment-content {height:unset!important;-webkit-line-clamp:unset!important;}",
  			"div.jdd-product-info-box {height:unset!important;}",
  			"span.hotData-text { -webkit-line-clamp: unset !important; line-clamp: unset !important;}",
  			"div.line-clamp-4 { -webkit-line-clamp: unset; max-height: unset;}",
  			"[class*='titleTypography'] {-webkit-line-clamp: unset !important;}",
  			".div-text-line-three { -webkit-line-clamp: unset; max-height: unset;}",
  			".data-title { -webkit-line-clamp: unset!important; max-height: unset!important;}",
  			".paper-title,.search-result-abstract.folded,.list-group-item-mod h5 { -webkit-line-clamp: unset!important; max-height: unset!important;}",
  			".kb-advanced-heading-link,.limited-text { -webkit-line-clamp: unset!important; max-height: unset!important;}",
  			".entry-card-title,.entry-card-snippet { -webkit-line-clamp: unset!important; max-height: unset!important;}",
  			"span.line-clamp-2 { -webkit-line-clamp: unset!important; max-height: unset!important;}",
  			".css-1yo0yr8 {-webkit-line-clamp: unset!important; max-height: unset!important;}",
  			"[class*='line-clamp-'],[class*='line-clamp-'] font {white-space:unset!important;-webkit-line-clamp: unset!important; max-height: unset!important;}",
  			".product-card__brand-wrap {white-space:unset;}",
  			".card-recommend-oneImg article h4 {max-height:unset;-webkit-line-clamp:unset;}",
  			".description__4cb8a {max-height:unset;-webkit-line-clamp:unset;}",
  			".link-container {height:unset!important;-webkit-line-clamp:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "babelR-render",
  		selectors: [
  			".babelR-offline-render"
  		],
  		excludeSelectors: [
  			".babelR-offline-reflow-container",
  			".babelR-offline-preserve-container"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "baiduXueshu",
  		matches: [
  			"xueshu.baidu.com"
  		],
  		globalStyles: {
  			".abstract_wr": "height: unset; overflow: visible; max-height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "balthild",
  		matches: [
  			"balthild.github.io"
  		],
  		injectedCss: [
  			".immersive-translate-target-wrapper [aria-hidden=true] {display:none;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "bardGoogle",
  		matches: [
  			"bard.google.com"
  		],
  		excludeSelectors: [
  			"mat-sidenav",
  			"div.capabilities-disclaimer",
  			"#cdk-overlay-6",
  			"message-actions button",
  			".mdc-button__label .ng-star-inserted",
  			".mdc-list-item__primary-text"
  		],
  		isTranslateTitle: false,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "barotem",
  		matches: [
  			"www.barotem.com"
  		],
  		injectedCss: [
  			".product_name {-webkit-line-clamp: unset!important;}",
  			".lists_goods_content > div {height: unset!important; min-height: 76px}",
  			".immersive-translate-target-inner {font-family: sans-serif !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "barrons",
  		matches: [
  			"www.barrons.com"
  		],
  		extraInlineSelectors: [
  			"article p span"
  		],
  		injectedCss: [
  			"font.immersive-translate-target-wrapper > br {display:none;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "batchUnlimitHeight",
  		matches: [
  			"https://www.inven.co.kr/*",
  			"*.grandefratello.mediaset.*"
  		],
  		injectedCss: [
  			"li {height:unset!important;}",
  			".big_box,article .text,article .title {height:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "bb-rich",
  		selectors: [
  			"bb-rich-text-editor",
  			".bb-editor-root",
  			".ql-editor"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "bbc",
  		matches: [
  			"*.bbc.*"
  		],
  		excludeSelectors: [
  			"section.module--languages",
  			".drop-capped",
  			".smp-toucan-player",
  			"smp-subtitles",
  			"#subtitle_subtitle2",
  			"[data-testid='media-player-container-landscape'] *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "bbc-emp",
  		matches: [
  			"https://emp.bbc.*/emp/*"
  		],
  		excludeSelectors: [
  			".p_accessibleHitArea",
  			".p_accessibleHitArea *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "bbc-iplayer",
  		matches: [
  			"https://www.bbc.*/iplayer*"
  		],
  		excludeSelectors: [
  			".player",
  			".player *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "bilibili",
  		matches: [
  			"www.bilibili.com"
  		],
  		excludeSelectors: [
  			".bpx-player-subtitle-panel-text",
  			".bili-video-card__info--author, .bili-video-card__info--date",
  			"#pictures,#note,#info,#footer,#expander-footer,.playinfo,.upname,#bilibili-player"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "bing",
  		matches: [
  			"https://*.bing.com/search*"
  		],
  		excludeSelectors: [
  			".tptxt"
  		],
  		extraInlineSelectors: [
  			"a",
  			"i"
  		],
  		globalStyles: {
  			"[class*='lineclamp'],.b_title": "-webkit-line-clamp:unset;",
  			".b_gwaDl,.b_snipwithnsl": "height:unset !important;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "bingNews",
  		matches: [
  			"https://*.bing.com/news/search*"
  		],
  		globalStyles: {
  			".newsitem .title": "max-height: none; -webkit-line-clamp: 10",
  			".newsitem .snippet": "max-height: none; -webkit-line-clamp: 10"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "bitwarden.com",
  		matches: [
  			"bitwarden.com"
  		],
  		excludeSelectors: [
  			".status-widget__state"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "bloomberg",
  		matches: [
  			"www.bloomberg.com"
  		],
  		excludeSelectors: [
  			".ticker-bar",
  			"nav",
  			"[aria-label=Banner]",
  			"aside",
  			"[data-component=ticker-bar]",
  			"footer.bb-global-footer",
  			".vjs-text-track-display"
  		],
  		excludeMatches: [
  			"https://www.bloomberg.com/live/*"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "bmvrMarseille",
  		matches: [
  			"www.bmvr.marseille.fr"
  		],
  		globalStyles: {
  			"a > div": "display:block;",
  			"[style*='358px;']": "width: 33.3333%; height: auto; padding: 0px; position: relative; margin: 0px;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "book-douban",
  		matches: [
  			"book.douban.com"
  		],
  		excludeSelectors: [
  			"a.author-name",
  			"p.user > a",
  			"div#collector > div > div[style^='padding-left'] > a",
  			"div#info a"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "braynzarsoft",
  		matches: [
  			"www.braynzarsoft.net"
  		],
  		excludeSelectors: [
  			"#content-header",
  			".sidebar-section",
  			".rating-box",
  			".tutorial-stat",
  			"#bookmark-btn",
  			".question-footer",
  			".adsbygoogle",
  			".footer",
  			".type",
  			".views",
  			".questioninputcode"
  		],
  		injectedCss: [
  			".tutorial-desc {overflow: scroll !important;}",
  			".question-title {display:inline-flex !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "brown",
  		matches: [
  			"cs.brown.edu"
  		],
  		excludeSelectors: [
  			".SCodeFlow"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "brutalist",
  		matches: [
  			"brutalist.report"
  		],
  		selectors: [
  			"li > a:first-child",
  			"aside",
  			"nav > a",
  			"h1 > a",
  			"h3 > a",
  			"h2 >a"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "bsky.app",
  		matches: [
  			"https://bsky.app"
  		],
  		excludeSelectors: [
  			"[class='css-146c3p1 r-dnmrzs r-1udh08x r-1udbk01 r-3s2u2q r-1iln25a']",
  			"[class='css-175oi2r r-1la3zjv r-3o4zer']",
  			"[data-testid^=homeScreenFeedTabs]",
  			"[class='css-146c3p1 r-1loqt21']",
  			"[class='css-1jxf684 r-1loqt21']",
  			"[data-testid^=repostCount]",
  			"[data-testid^=likeCount]",
  			"[data-testid^=quoteCount]",
  			"[data-testid^=replyBtn]",
  			"[aria-label='View profile']"
  		],
  		injectedCss: [
  			".r-xoduu5 {display:inline!important;}",
  			"[style*='-webkit-line-clamp'] {-webkit-line-clamp:unset!important;}"
  		],
  		isTranslateTitle: false,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "bugsKde",
  		matches: [
  			"bugs.kde.org"
  		],
  		excludeSelectors: [
  			".bz_first_comment_head",
  			".bz_comment_head",
  			".related_actions"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "businessinsider",
  		matches: [
  			"www.businessinsider.com"
  		],
  		excludeSelectors: [
  			"header",
  			"nav",
  			"section.live-updates-module "
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "casino",
  		matches: [
  			"www.casino.org"
  		],
  		excludeSelectors: [
  			".material-symbols-outlined"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "cbsnews",
  		matches: [
  			"www.cbsnews.com"
  		],
  		excludeSelectors: [
  			".avia-container",
  			".avia-container *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ccfddl",
  		matches: [
  			"ccfddl.com"
  		],
  		excludeSelectors: [
  			"div.conf-timer > span[style^='color: black']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ceros",
  		matches: [
  			"view.ceros.com"
  		],
  		injectedCss: [
  			".page-object.group > .page-object.text > p { height: 100% !important; overflow: auto !important; }"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "championcross.jp",
  		matches: [
  			"https://championcross.jp"
  		],
  		injectedCss: [
  			"[class^='Original_section_title'] {overflow:hidden!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "character.ai",
  		matches: [
  			"character.ai"
  		],
  		extraInlineSelectors: [
  			".auto-content",
  			".auto-content *",
  			"#chat-messages > .group:first-child .prose *",
  			"#chat-messages > .group:not(:first-child) .font-display *"
  		],
  		injectedCss: [
  			".immersive-translate-target-wrapper br {display:none;}",
  			"[imt-state=dual] .prose p {margin:0;}"
  		],
  		globalStyles: {
  			".swiper,.rah-static,[class*=max-h],.line-clamp-1": "overflow:scroll;-webkit-line-clamp:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "chatGoogle",
  		matches: [
  			"chat.google.com"
  		],
  		selectors: [
  			"[jsname=bgckF]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "chatOpenai",
  		matches: [
  			"chat.openai.com",
  			"chatgpt.com"
  		],
  		excludeSelectors: [
  			"div.absolute.bottom-0.left-0.w-full",
  			"h1",
  			"div#headlessui-portal-root",
  			"nav",
  			"ul[aria-multiselectable]",
  			".markdown *",
  			"div[class='flex flex-col items-start']",
  			"div[class='flex items-center justify-center gap-1 border-b border-black/10 bg-gray-50 p-3 text-gray-500 dark:border-gray-900/50 dark:bg-gray-700 dark:text-gray-300']"
  		],
  		globalStyles: {
  			"[class*='line-clamp']": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;"
  		},
  		isTranslateTitle: false,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "chatpdf",
  		matches: [
  			"www.chatpdf.com"
  		],
  		excludeSelectors: [
  			".chat-message-row.ai *",
  			".pdf-viewer"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "chatter.hume.ai",
  		matches: [
  			"chatter.hume.ai"
  		],
  		extraInlineSelectors: [
  			"[class*=' flex-wrap'] > span"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "chinadaily",
  		matches: [
  			"www.chinadaily.com.cn"
  		],
  		excludeSelectors: [
  			".topNav",
  			".topNav2_art > span",
  			".topNav_art2 > .dropdown",
  			".dibu-three",
  			".topBar"
  		],
  		injectedCss: [
  			"a { height: unset !important; }",
  			"li { height: unset !important; }",
  			"div { height: unset !important; }",
  			".immersive-translate-target-inner {color:black;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "chosun",
  		matches: [
  			"www.chosun.com"
  		],
  		injectedCss: [
  			"body {word-break: unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "chromium",
  		matches: [
  			"*.chromium.org"
  		],
  		excludeSelectors: [
  			"ancestors-breadcrumbs",
  			"depth-finder[role='tree']",
  			"repository-detail",
  			"issue-metadata-sidebar",
  			"nav",
  			".bv2-event-user",
  			".b-description-heading",
  			"b-attachment-viewer",
  			"i"
  		],
  		injectedCss: [
  			"font svg {display:none;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "claudeAi",
  		matches: [
  			"claude.ai"
  		],
  		excludeSelectors: [
  			".contents *",
  			".code-block__code"
  		],
  		injectedCss: [
  			"[data-testid='chat-menu-trigger'] br {display:none;}",
  			"[data-test-render-count] {overflow: scroll;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "claudeartifacts",
  		matches: [
  			"claudeartifacts.com"
  		],
  		excludeSelectors: [
  			"h1",
  			"h3 + span.rounded-full",
  			"[class='p-6 pt-0 flex justify-between items-center']",
  			"[class='text-xs text-gray-500']"
  		],
  		globalStyles: {
  			".line-clamp-3": "-webkit-line-clamp: unset"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "cnbc",
  		matches: [
  			"www.cnbc.com"
  		],
  		excludeSelectors: [
  			"#GlobalNavigation",
  			"#GlobalFooter",
  			".LiveBlogHeader-timestampAndShareBarContainer",
  			".LiveBlogHeader-liveUpdatesPill",
  			".QuoteInBody-inlineButton"
  		],
  		globalStyles: {
  			"div.Card-titleContainer > div": "-webkit-line-clamp: unset;max-height: unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "cnet",
  		matches: [
  			"www.cnet.com"
  		],
  		globalStyles: {
  			"h3,div,span,p": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "cnn",
  		matches: [
  			"*.cnn.com"
  		],
  		excludeSelectors: [
  			".ad-slot-header__wrapper",
  			"#pageFooter"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "codeium",
  		matches: [
  			"codeium.com"
  		],
  		excludeSelectors: [
  			"nav a[class*=C]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "codewithchris",
  		matches: [
  			"learn.codewithchris.com",
  			"*.rachelsenglishacademy.com",
  			"www.unrealsenseiacademy.com",
  			"www.comsol.com/video/*",
  			"www.comsol.com/blogs/*"
  		],
  		excludeSelectors: [
  			".w-captions",
  			".w-captions-line > div > span",
  			".w-captions *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "coindesk",
  		matches: [
  			"www.coindesk.com"
  		],
  		excludeSelectors: [
  			"[data-subtitles-container='true']",
  			"[data-subtitles-container='true'] *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "coinmarketcap",
  		matches: [
  			"coinmarketcap.com"
  		],
  		extraBlockSelectors: [
  			"div[class='sc-3502f6cd-0 JxHqg']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "common-query.pdfWebPage",
  		selectors: [
  			"[id=pdfCanvasContainer] > iframe[src*=pdf]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "common-vtt-jw",
  		matches: [
  			"*.rottentomatoes.com",
  			"megaplay.buzz",
  			"www.brighttalk.com"
  		],
  		excludeSelectors: [
  			".jw-wrapper",
  			".jw-wrapper *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "common.pdfWebPage",
  		selectors: [
  			"embed[type='application/pdf']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "common4.pdfWebPage",
  		selectors: [
  			"#statements-pdf"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "comsol",
  		matches: [
  			"*.comsol.com"
  		],
  		excludeSelectors: [
  			"#immersive-translate-caption-window",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "construct",
  		matches: [
  			"www.construct.net"
  		],
  		excludeSelectors: [
  			"div.topNav",
  			"div.usernameLink",
  			"ul.authorDetails",
  			"ul.tagViewer",
  			"ul.breadCrumbNav",
  			"ul.subForumForums",
  			"ul.postTools",
  			"li.comment ul.controls",
  			"div.forumTopNavWrap",
  			"div.downloadWrap",
  			"div.articleLeftMenu",
  			"div.usernameTextWrap",
  			"div.favouriteWrap",
  			"div.bannerWrapper",
  			"div.viewAddonRightMenu",
  			"div.extendedMenu.addonsSubMenu",
  			"#BottomLinks.bottomLinks",
  			"div#LeftSide.leftSide",
  			"div#BottomWrap.bottomWrap",
  			"div.courseListWrap div.overview",
  			"div.conversationControls",
  			"div.contentWrapper h1",
  			"td.location a#LocationLink",
  			"#TopLevelComments .topBar",
  			"#TopLevelComments .controls",
  			".tagViewWrap",
  			".changeCount",
  			".otherStats",
  			".FilterMenu",
  			".mobileTopicStats",
  			".forumControlsWrapper",
  			".forumsBottomNavWrap",
  			".breadCrumbNav",
  			".favouriteWrap",
  			".usernameLink",
  			".followWrapper",
  			".blogPostStats",
  			".manualContent dl dt"
  		],
  		stayOriginalSelectors: [
  			"a.usernameReference"
  		],
  		excludeMatches: [
  			"preview.construct.net",
  			"editor.construct.net"
  		],
  		globalStyles: {
  			"td.location a#LocationLink": "padding-top: 4px;",
  			"div.articleMain .tutCourseWrap": "align-items: flex-start;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "cooperativa",
  		matches: [
  			"cooperativa.cl"
  		],
  		injectedCss: [
  			"font.notranslate {display:unset!important}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "coursera1",
  		selectors: [
  			".rc-MetatagsWrapper .rc-VLPContainerWrapperCds"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "coursera2",
  		selectors: [
  			".rc-MetatagsWrapper .rc-Course"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "crunchyroll",
  		matches: [
  			"*.crunchyroll.com"
  		],
  		excludeSelectors: [
  			"#vilos",
  			"#immersive-translate-caption-window",
  			"#vilos *",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "csust",
  		matches: [
  			"tsgvpn2.csust.edu.cn"
  		],
  		injectedCss: [
  			"h2 {font-size:unset;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "curiositystream",
  		matches: [
  			"curiositystream.com"
  		],
  		excludeSelectors: [
  			"[data-testid=\"video-player\"]",
  			"[data-testid=\"video-player\"] *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "curseforge",
  		matches: [
  			"www.curseforge.com"
  		],
  		globalStyles: {
  			".project-card": "height:unset;grid-template-rows: auto auto auto auto;",
  			".project-card .description": "height:unset;-webkit-line-clamp:unset;",
  			"ul.details-list": "height:unset;",
  			".project-card .categories": "height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "czechvideo",
  		matches: [
  			"https://czechvideo.co/*"
  		],
  		globalStyles: {
  			".short-story": "height:unset;",
  			".short-title": "height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "dailyDev",
  		matches: [
  			"app.daily.dev"
  		],
  		selectors: [
  			"h1",
  			".typo-body",
  			"article h3",
  			"[class^=markdown_markdown]"
  		],
  		globalStyles: {
  			".line-clamp-3": "-webkit-line-clamp: unset"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "dailymotion",
  		matches: [
  			"*.dailymotion.com"
  		],
  		excludeSelectors: [
  			".player",
  			".player *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "dash-immersive",
  		matches: [
  			"https://dash.immersivetranslate.com/*",
  			"http://localhost:8000/dist/userscript/options*"
  		],
  		selectors: [
  			".hello"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "datacamp",
  		matches: [
  			"projector.datacamp.com"
  		],
  		excludeSelectors: [
  			".video",
  			".video *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "datalab.naver",
  		matches: [
  			"datalab.naver.com"
  		],
  		injectedCss: [
  			".tab_list_area .list_itm {height: unset !important;}",
  			".section.main_tab_opt .select {height: unset !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "dcinside",
  		matches: [
  			"*.dcinside.com"
  		],
  		excludeSelectors: [
  			".num",
  			".time"
  		],
  		injectedCss: [
  			".time_best .typet_list li a {font-size:unset !important;}",
  			"font {background:unset!important;padding:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "deeplearning",
  		matches: [
  			"learn.deeplearning.ai"
  		],
  		excludeSelectors: [
  			"[data-layout=\"video\"]",
  			"[data-layout=\"video\"] *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "deepwiki",
  		matches: [
  			"deepwiki.com"
  		],
  		excludeSelectors: [
  			"[class*='flex items-center break-all rounded-l px-2 py-1.5 bg-[#e5e5e5] text-[#333333] dark:bg-[#252525] dark:text-[#e4e4e4] rounded-r']",
  			"[class*='mb-1 mr-1 inline-flex items-stretch font-mono text-xs !no-underline transition-opacity hover:opacity-75']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "descript",
  		matches: [
  			"www.descript.com"
  		],
  		excludeSelectors: [
  			"h1.home-hero"
  		],
  		injectedCss: [
  			".immersive-translate-target-wrapper, .immersive-translate-target-wrapper *{color:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "developerChrome",
  		matches: [
  			"developer.chrome.com"
  		],
  		excludeSelectors: [
  			"web-tabs",
  			"ul.code-sections--summary"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "devEpicGames",
  		matches: [
  			"dev.epicgames.com"
  		],
  		excludeSelectors: [
  			".vjs-poster",
  			".vjs-poster *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "digitaltrends",
  		matches: [
  			"www.digitaltrends.com"
  		],
  		extraBlockSelectors: [
  			".b-mem-post__title"
  		],
  		injectedCss: [
  			".b-mem__inner .b-mem-post:first-child h3{-webkit-line-clamp: 2;}",
  			".b-mem__inner .b-mem-post:first-child .b-mem-post__excerpt{display:inline;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "digitimes",
  		matches: [
  			"www.digitimes.com"
  		],
  		excludeSelectors: [
  			".main-nav-frame",
  			".sub-header-wrapper",
  			".footer",
  			".date"
  		],
  		globalStyles: {
  			"a,.title,.abstract,.display-5,.top": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "discord",
  		matches: [
  			"https://discord.com/channels/*"
  		],
  		selectors: [
  			"li[id^=chat-messages] div[id^=message-content]",
  			"div[class^=headerText]",
  			"section[aria-label='Search Results'] div[id^=message-content]",
  			"div[class^=messagesPopout]",
  			"[class^='embedTitle']",
  			"[class^='embedDescription']",
  			"[class^='promptContent']",
  			"li[class^='container'] > div[class^='header']"
  		],
  		excludeSelectors: [
  			"[class*='username']",
  			"[class*='repliedMessage']"
  		],
  		extraBlockSelectors: [
  			"[class^='embedFieldValue']",
  			"li[class^='card'] div[class^='message']",
  			"[data-list-item-id^='forum-channel-list'] div[class^='headerText']"
  		],
  		injectedCss: [
  			"main div[class^=headerText],main div[class^=message],main div[class^=text] {max-height: unset;}",
  			"h3[data-text-variant='heading-lg/semibold'] {-webkit-line-clamp: unset;line-height: unset;}",
  			"[class*='guildDetails'] > [class*='description'] {-webkit-line-clamp: unset;}"
  		],
  		paragraphMinTextCount: 4,
  		paragraphMinWordCount: 2,
  		isTranslateTitle: false,
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "discussions.apple",
  		matches: [
  			"discussions.apple.com"
  		],
  		excludeSelectors: [
  			".page-number"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "disneyplus",
  		matches: [
  			"www.disneyplus.com"
  		],
  		excludeSelectors: [
  			".dss-hls-subtitle-overlay",
  			".dss-hls-subtitle-overlay *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "doc2x",
  		matches: [
  			"doc2x.com",
  			"doc2x.noedgeai.com"
  		],
  		excludeSelectors: [
  			"#md-scroll-top-dom"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "docs-swift",
  		matches: [
  			"docs.swift.org"
  		],
  		selectors: [
  			".content",
  			"#menu"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "docs-tutorials",
  		matches: [
  			"docs.pytorch.org"
  		],
  		extraBlockSelectors: [
  			".tutorial-filter"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "docs.unity.cn",
  		matches: [
  			"docs.unity.cn"
  		],
  		stayOriginalSelectors: [
  			".tooltip"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "docs.unity3d",
  		matches: [
  			"docs.unity3d.com"
  		],
  		stayOriginalSelectors: [
  			".tooltip"
  		],
  		injectedCss: [
  			".immersive-translate-target-inner .tooltiptext {display: none;}",
  			".immersive-translate-target-inner .tooltip {cursor:pointer;border-bottom:unset;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "docubay",
  		matches: [
  			"www.docubay.com"
  		],
  		excludeSelectors: [
  			"#immersive-translate-caption-window",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "docusaurus",
  		selectors: [
  			"#__docusaurus"
  		],
  		excludeSelectors: [
  			".DocSearch-Modal"
  		],
  		extraBlockSelectors: [
  			".hash-link"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "dolmods",
  		matches: [
  			"dolmods.net"
  		],
  		globalStyles: {
  			"[class*='max-h']": "max-height:unset!important;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "domestika",
  		matches: [
  			"www.domestika.org"
  		],
  		excludeSelectors: [
  			".vjs-text-track-display",
  			".vjs-text-track-display *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "donghuaworld",
  		matches: [
  			"dwserver.donghuaworld.com"
  		],
  		excludeSelectors: [
  			".jw-media",
  			".jw-media *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "doupocangqiong",
  		matches: [
  			"www.doupocangqiong.org"
  		],
  		injectedCss: [
  			"#play_0 ul { display: grid; grid-template-columns: repeat(3, 1fr); }",
  			"#play_0 ul li { height: unset !important; }"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "dr",
  		matches: [
  			"*.dr.dk"
  		],
  		excludeSelectors: [
  			".vjs-text-track-display > div",
  			"#immersive-translate-caption-window",
  			".vjs-text-track-display > div *",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "drizzle",
  		matches: [
  			"orm.drizzle.team"
  		],
  		excludeSelectors: [
  			"[class^='codetabs_tab']",
  			".npm__tab"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "dtmstation",
  		matches: [
  			"www.dtmstation.com"
  		],
  		extraBlockSelectors: [
  			".entry-card-title,.entry-card-snippet"
  		],
  		injectedCss: [
  			".entry-card-title,.entry-card-snippet { -webkit-line-clamp: unset!important; max-height: unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "duckduckgo",
  		matches: [
  			"duckduckgo.com"
  		],
  		globalStyles: {
  			"div[data-result='snippet'] > div > span": "-webkit-line-clamp:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "dw",
  		matches: [
  			"www.dw.com"
  		],
  		excludeSelectors: [
  			".focus-menu-shown"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "dynamic-repets",
  		matches: [
  			"khovar.tj"
  		],
  		excludeSelectors: [
  			".slide_container [style*='position: absolute']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ebay",
  		matches: [
  			"www.ebay.com"
  		],
  		excludeSelectors: [
  			"headers",
  			"[itemprop=offers]",
  			".dne-itemtile-original-price"
  		],
  		injectedCss: [
  			".iS4T .zgfQ .uHzw .Ep66 {-webkit-line-clamp: unset;max-height: unset;}",
  			"[itemprop=name],.merch-item-title {-webkit-line-clamp: unset;max-height: unset;}"
  		],
  		paragraphMinTextCount: 4,
  		paragraphMinWordCount: 2,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "economist",
  		matches: [
  			"www.economist.com"
  		],
  		excludeSelectors: [
  			"footer.ds-footer"
  		],
  		extraInlineSelectors: [
  			"span[data-caps='initial']"
  		],
  		injectedCss: [
  			"a::before {position:relative!important;}",
  			"[class^=button] span font {white-space:pre-wrap;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "edclub.com",
  		matches: [
  			"www.edclub.com"
  		],
  		excludeSelectors: [
  			".vjs-text-track-display",
  			".vjs-text-track-display *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "edx",
  		matches: [
  			"*.edx.org",
  			"courses.mitxonline.mit.edu"
  		],
  		excludeSelectors: [
  			".closed-captions",
  			".wrapper-video-bottom-section",
  			".secondary-controls"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "eightfold",
  		matches: [
  			"*.eightfold.ai"
  		],
  		injectedCss: [
  			".flexbox{width:100%}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "epam",
  		matches: [
  			"*.epam.com"
  		],
  		excludeSelectors: [
  			"#blog-page-sidebar-wrapper"
  		],
  		globalStyles: {
  			"[class*='ContentAnchorLinkList']": "word-break:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "epubReader",
  		matches: [
  			"epub-reader.online"
  		],
  		globalStyles: {
  			"span.slide-contents-item-label": "overflow:visible;max-height:unset;white-space:normal;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "espn",
  		matches: [
  			"*.espn.com"
  		],
  		excludeSelectors: [
  			"#fittPageContainer",
  			"#fittPageContainer *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "explainpaper",
  		matches: [
  			"https://www.explainpaper.com/reader*"
  		],
  		selectors: [
  			".leading-relaxed",
  			".chat-messages p",
  			".text-sm"
  		],
  		isTranslateTitle: false,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "explainshell",
  		matches: [
  			"explainshell.com"
  		],
  		selectors: [
  			"[class='help-box']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "f1tv",
  		matches: [
  			"f1tv.formula1.com"
  		],
  		excludeSelectors: [
  			"#main-embeddedPlayer",
  			"#main-embeddedPlayer *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "f95zone",
  		matches: [
  			"f95zone.to"
  		],
  		excludeSelectors: [
  			".pageNavWrapper",
  			".message-userExtras",
  			".message-name"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "facebook",
  		matches: [
  			"*.facebook.com"
  		],
  		selectors: [
  			"div[dir=auto][style]",
  			"div[dir=auto][class]",
  			"span[lang]",
  			"[data-pagelet=BizInboxMessengerMessageListContainer] span",
  			"[data-pagelet=BizInboxContextCardDetail] span",
  			".xod5an3",
  			"[class='x1i10hfl xjbqb8w x1ejq31n xd10rxx x1sy0etr x17r0tee x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xt0psk2 xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz x1sur9pj xkrqix3 xzsf02u x1pd3egz']",
  			"#PNG_EXPORT",
  			".fb_content.clearfix",
  			"[role='main']",
  			"[role='region']",
  			"[role='presentation']",
  			"form#platformDialogForm"
  		],
  		excludeSelectors: [
  			"[data-ad-comet-preview=message] [role=button]",
  			"object[type='nested/pressable']",
  			"[data-ad-rendering-role=profile_name]"
  		],
  		excludeMatches: [
  			"www.facebook.com/business/*",
  			"business.facebook.com/*",
  			"www.facebook.com/help*",
  			"www.facebook.com/settings*",
  			"www.facebook.com/ads/library/*",
  			"developers.facebook.com/*",
  			"www.facebook.com/v20.0/plugins/*",
  			"www.facebook.com/support*",
  			"www.facebook.com/terms*",
  			"www.facebook.com/privacy*"
  		],
  		injectedCss: [
  			"._4ik4._4ik5 {max-height:unset!important;}"
  		],
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "fanbox",
  		matches: [
  			"*.fanbox.cc"
  		],
  		excludeSelectors: [
  			"[class^='Body__PostBodyText']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "fandom",
  		matches: [
  			"*.fandom.com"
  		],
  		excludeSelectors: [
  			"header.fandom-community-header",
  			"div.ph-registration-buttons"
  		],
  		extraBlockSelectors: [
  			".mp-nav a"
  		],
  		injectedCss: [
  			".immersive-translate-target-translation-block-wrapper {display: unset!important;}"
  		],
  		globalStyles: {
  			"#mw-content-text > div > div:nth-child(1)": "height:100%;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "fautv",
  		matches: [
  			"www.fau.tv"
  		],
  		excludeSelectors: [
  			".jw-wrapper",
  			".jw-wrapper *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "feeder",
  		matches: [
  			"https://feeder.co/*"
  		],
  		globalStyles: {
  			".item-summary": "-webkit-line-clamp:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "feedly",
  		matches: [
  			"feedly.com"
  		],
  		excludeSelectors: [
  			".Leftnav"
  		],
  		globalStyles: {
  			".TitleOnlyLayout,.SelectedEntryScroller > div": "height:unset !important;",
  			".EntrySummary--u4,.EntrySummary--u5": "-webkit-line-clamp: unset;max-height:unset;",
  			".EntryTitleLink": "-webkit-line-clamp: unset;",
  			".SelectedEntryScroller > div :nth-child(2) :last-child": "-webkit-line-clamp: unset !important;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "feishu",
  		matches: [
  			"*.feishu.cn",
  			"*.larkoffice.com",
  			"*.larksuite.com"
  		],
  		excludeSelectors: [
  			".catalogue__list"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "feynmanlectures",
  		matches: [
  			"www.feynmanlectures.caltech.edu"
  		],
  		excludeSelectors: [
  			".videoview",
  			"#immersive-translate-caption-window",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ffmpeg",
  		matches: [
  			"ffmpeg.org"
  		],
  		excludeSelectors: [
  			".memproto",
  			".memtitle"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "fibery",
  		matches: [
  			"the.fibery.io"
  		],
  		stayOriginalSelectors: [
  			".entity-node-view-container"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "figmaCommunity",
  		matches: [
  			"www.figma.com/community/*"
  		],
  		excludeSelectors: [
  			"div[class*='metadataRight']",
  			"div[class*='commentMetaAndOptions']"
  		],
  		stayOriginalSelectors: [
  			"[data-tooltip='tooltip-user-info']"
  		],
  		globalStyles: {
  			"div[class*='mini_cardBottomRowSizing']": "height: 3em;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "finalCommon.pdfWebPage",
  		matches: [
  			"https://obgyn.onlinelibrary.wiley.com/doi/pdf/*",
  			"https://onlinelibrary.wiley.com/doi/pdf/*",
  			"https://docs.amd.com/v/u/*/*",
  			"https://arxiv.org/pdf/*"
  		],
  		selectors: [
  			"embed[type='application/pdf']",
  			"iframe[type='application/pdf']",
  			"[id=myPdfIframe][src*=pdf]",
  			"#article [type='application/pdf'][src*=pdf]",
  			".textFrame [type='application/pdf'][src*=pdf]",
  			".ggPdf",
  			"[id=pdfCanvasContainer] > iframe[src*=pdf]",
  			".viewercontent-container  iframe[src*=documents]",
  			"object[type='application/pdf']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "fiverr",
  		matches: [
  			"https://www.fiverr.com/inbox/*"
  		],
  		selectors: [
  			".message-body",
  			"article[data-testid=index-container]"
  		],
  		excludeSelectors: [
  			"[data-testid=basic-message-header]",
  			"[data-testid=message-header-timestamp]",
  			"time",
  			".user-name",
  			".user-info",
  			".header"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "fiverr-main",
  		matches: [
  			"*.fiverr.com"
  		],
  		excludeSelectors: [
  			".popular"
  		],
  		globalStyles: {
  			"h3 > a": "-webkit-line-clamp:unset;overflow:unset;",
  			h3: "-webkit-line-clamp:unset;overflow:unset;",
  			h5: "-webkit-line-clamp:unset;overflow:unset;",
  			p: "-webkit-line-clamp:unset;overflow:unset;",
  			".YLycza2.u9KHmsf": "height:unset;max-height:unset;",
  			".lt2ar2q.EhHcMiw": "height:unset; max-height: unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "fix-header",
  		matches: [
  			"societyforpsychotherapy.org",
  			"cbtm.manifestlao.com",
  			"notefolio.net"
  		],
  		selectors: [
  			"article header",
  			"header h1",
  			"header h2",
  			"header h3",
  			"header p",
  			"header nav"
  		],
  		excludeSelectors: [
  			".site-header"
  		],
  		extraBlockSelectors: [
  			".btn"
  		],
  		injectedCss: [
  			"[class*='line-clamp-'] {-webkit-line-clamp: unset!important; max-height: unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "floatSites",
  		matches: [
  			"docs.stripe.com"
  		],
  		injectedCss: [
  			".immersive-translate-target-translation-block-wrapper {display: inline !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "flutterDev",
  		matches: [
  			"docs.flutter.dev",
  			"docs.flutter.cn"
  		],
  		excludeSelectors: [
  			"span.expander.material-symbols",
  			"span.material-symbols"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "fmoviesz",
  		matches: [
  			"fmovies24.to",
  			"*.fmovies.co",
  			"vidplay.online",
  			"c8365730d4.nl",
  			"kerapoxy.cc",
  			"vid41c.site",
  			"https://*/*sub.info=*fmovies24.to*",
  			"https://*/*sub.info=*bflixhd.to*",
  			"mcloud.vvid30c.site",
  			"rabbitstream.net",
  			"kerolaunochan.*",
  			"megacloud.*",
  			"netusa.xyz",
  			"cdnstreame.net",
  			"9animetv.to",
  			"hianime.to",
  			"videostr.net",
  			"anthropic.skilljar.com",
  			"streameeeeee.site"
  		],
  		excludeSelectors: [
  			".jw-wrapper",
  			"#immersive-translate-caption-window",
  			".jw-wrapper *",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "followis",
  		matches: [
  			"https://app.follow.is/feeds/*"
  		],
  		excludeSelectors: [
  			".bg-native",
  			"main > div > div.h-full:first-child span"
  		],
  		injectedCss: [
  			"[class*='line-clamp'] {-webkit-line-clamp:unset;}"
  		],
  		isTranslateTitle: false,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "folo",
  		matches: [
  			"app.folo.is"
  		],
  		excludeSelectors: [
  			"[role=button]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "fontFmaily",
  		matches: [
  			"skyvipservices.com",
  			"book.novelpia.com"
  		],
  		injectedCss: [
  			"font {display:block !important;}",
  			"#book-box font {font-family:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "forum.unity",
  		matches: [
  			"forum.unity.com"
  		],
  		excludeSelectors: [
  			".bbCodeCode"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "forums.zotero",
  		matches: [
  			"forums.zotero.org"
  		],
  		selectors: [
  			".page-sidebar",
  			".page-content"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "foxnews",
  		matches: [
  			"www.foxnews.com"
  		],
  		excludeSelectors: [
  			".site-footer",
  			".components-MessageDetails-index__message-details-wrapper",
  			"div[class^=SlideDown__container]",
  			".components-MessageActions-index__messageActionsWrapper",
  			"span[data-openweb-allow-amp]",
  			"div.spcv_typing-users"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "freecodecamp",
  		matches: [
  			"www.freecodecamp.org"
  		],
  		excludeSelectors: [
  			".monaco-mouse-cursor-text",
  			".challenge-preview"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "frontendmasters",
  		matches: [
  			"frontendmasters.com"
  		],
  		excludeSelectors: [
  			".vjs-text-track-display",
  			".vjs-text-track-display *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ft",
  		matches: [
  			"www.ft.com"
  		],
  		excludeSelectors: [
  			"header",
  			"[aria-labelledby=cookie-banner-aria-label]",
  			"footer",
  			"[aria-label='Primary navigation']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "futuretools",
  		matches: [
  			"www.futuretools.io"
  		],
  		globalStyles: {
  			".collection-item-6": "height: unset !important;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "gagaoolala",
  		matches: [
  			"www.gagaoolala.com"
  		],
  		excludeSelectors: [
  			"#gl-id-video-container",
  			"#gl-id-video-container *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "gaia",
  		matches: [
  			"www.gaia.com"
  		],
  		excludeSelectors: [
  			"video-js",
  			"video-js *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ganjingworld",
  		matches: [
  			"www.ganjingworld.com"
  		],
  		excludeSelectors: [
  			".vidPlayerWrap",
  			".vidPlayerWrap *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "gemini.google",
  		matches: [
  			"gemini.google.com"
  		],
  		injectedCss: [
  			"[data-test-id=conversation] {height: unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "genuine",
  		matches: [
  			"blog.genuine.com"
  		],
  		excludeSelectors: [
  			"div.enlighter"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "getpocket",
  		matches: [
  			"getpocket.com"
  		],
  		selectors: [
  			"h2",
  			"div.excerpt p",
  			"article",
  			"h1"
  		],
  		globalStyles: {
  			"h2.title": "max-height:unset;-webkit-line-clamp:unset;",
  			"div.excerpt p": "max-height:unset;-webkit-line-clamp:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "gitbook",
  		selectors: [
  			".gitbook-root"
  		],
  		excludeSelectors: [
  			"[spellcheck='false']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "github",
  		matches: [
  			"github.com"
  		],
  		selectors: [
  			"h1",
  			"[aria-label=Issues] .markdown-title",
  			"[aria-labelledby=discussions-list] .markdown-title",
  			"h3 .markdown-title",
  			".markdown-body",
  			".Layout-sidebar p",
  			"div > span.search-match",
  			"li.repo-list-item p",
  			"#responsive-meta-container p",
  			"article p",
  			"feed-container article ul li a span",
  			"feed-container article .FormControl-caption",
  			"div.repo-description p",
  			"[itemprop=description]",
  			".integrations-auth-wrapper",
  			".new-feed-onboarding-notice",
  			"article section[aria-label='card content'] > div > div > div  > div:nth-child(2)",
  			".js-notice h2, .js-notice p",
  			".TimelineItem-body a span, .TimelineItem-body a div, .TimelineItem-body form span, .TimelineItem-body form div",
  			"[role=\"navigation\"] p",
  			"[data-testid=\"commit-row-item\"] h4",
  			".font-mktg",
  			".search-title,.search-match",
  			".pinned-item-desc",
  			"#repo-content-turbo-frame .markdown-title",
  			"[app-name='blackbird-search'] [data-hpc='true']",
  			".topic-box > a > p:nth-of-type(2)",
  			"[data-testid=\"listitem-title-link\"]",
  			"#repo-content-turbo-frame p",
  			"#repo-content-turbo-frame h4",
  			"[aria-label=\"card content\"] .flex-column > div:nth-child(2)",
  			"[class*=TitleHeader]",
  			".bpDald",
  			".discussion-title",
  			".copilotPreview__footer",
  			".heading-element",
  			".js-feed-item-component h3 a[data-hovercard-type=pull_request]",
  			"[aria-labelledby=outline-id] nav",
  			"[data-testid='issue-pr-title-link']",
  			"div.user-profile-bio",
  			"div.news > div.js-notice",
  			"#memex-project-view-root a [class^='prc-Text-Text']",
  			"[class^=OverviewContent] [class*=DirectoryRichtextContent]",
  			"[id^=pullrequestreview]",
  			"[class^='ChatMessage']",
  			"a[data-hovercard-type='issue']",
  			"[class*=prc-FormControl] > [class*=prc-Text], [class*=prc-FormControl] [class*=prc-FormControl-LabelContainer] [class*=prc-Text]",
  			"[data-testid='beginners-playlist-section']",
  			"[data-testid='getting-started-checklist-section']",
  			"[data-testid='docs-section']",
  			"[data-testid='recommendations-section']",
  			".Layout-main react-partial pre",
  			".feed-item-content section[data-view-component] [class='flex-1 d-flex flex-column'] div:nth-child(2)",
  			"#org-new-form",
  			".trial-info-large",
  			".dfd-trial__container-form",
  			"dialog-helper",
  			".blankslate-heading",
  			".activity-overview-box",
  			"#spaces-list",
  			"[class*='ContentView-module__serviceDescription']",
  			".BannerDescription",
  			"copilot-user-settings",
  			"h2:has(~ copilot-user-settings)",
  			"div:has(~ copilot-user-settings)",
  			"[class='f4 color-fg-muted col-md-6 mx-auto']",
  			"[class='col-lg-9 position-relative pr-lg-5 mb-6 mr-lg-5']",
  			"[class*='IssueIndexPage-module__middlePaneGrid'] div[class='p-4 text-center rounded-2 border color-border-muted']",
  			"[class*='ModelsPlaygroundRoute-module__playgroundContainer']",
  			"article [class='f6 color-fg-muted mt-1']"
  		],
  		excludeSelectors: [
  			"[data-test-selector='commit-tease-commit-message']",
  			"[data-test-selector='create-branch.developmentForm']",
  			"div.Box-header.position-relative",
  			"div.blob-wrapper-embedded",
  			"div.Box.Box--condensed.my-2",
  			"div.jp-CodeCell",
  			"[aria-label=\"Account\"] .markdown-title",
  			".js-repos-container .markdown-title",
  			"a.anchor",
  			"div.file-navigation + div.Box",
  			"[data-testid^='breadcrumbs']",
  			"[data-ga-click*=Star]",
  			".markdown-body h3",
  			"div.vcard-names-container",
  			"div.js-disable-context-menu",
  			".BorderGrid-cell a[role='link']",
  			".BorderGrid-cell .topic-tag-link",
  			"table[class*='Table-module__Box']",
  			".author,.assignee",
  			".blob-code",
  			".timeline-comment-header",
  			".review-thread-reply",
  			".codeRepository",
  			"a[data-hovercard-type]",
  			"[title='Label: Private']",
  			"[aria-label*='language']",
  			".js-suggested-changes-blob.diff-view",
  			"h1[data-component=PH_Title] span[class*='issueNumberText']",
  			".react-blob-sticky-header *"
  		],
  		stayOriginalSelectors: [
  			".issue-link"
  		],
  		extraInlineSelectors: [
  			"g-emoji",
  			"a.anchor"
  		],
  		extraBlockSelectors: [
  			"bdi"
  		],
  		excludeMatches: [
  			"https://github.com/*/*/settings",
  			"https://github.com/*/*/settings/*",
  			"https://github.com/settings/*",
  			"https://github.com/sponsors/*",
  			"https://github.com/readme/*",
  			"https://github.com/readme/",
  			"https://github.com/features/*",
  			"https://github.com/codespaces",
  			"https://github.com/customer-stories/*",
  			"https://github.com/signup",
  			"https://github.com/login",
  			"https://github.com/marketplace",
  			"https://github.com/github-copilot*",
  			"https://github.com/collections*",
  			"https://github.com/resources/events*",
  			"https://github.com/pricing*"
  		],
  		injectedCss: [
  			".bpDald,.discussion-title {-webkit-line-clamp:unset!important;}",
  			"li>div[class*='Box-sc'],div[class*='Box-sc']>button[class*='prc-Token-TokenBase'],li[class*='card-label-module']>button[class*='prc-Token-TokenBase'] {height:unset!important;}",
  			"#memex-project-view-root [class*=table-row__StyledTableRow-sc],#memex-project-view-root [class*=base-cell-module__Box] {height:unset!important;}",
  			"[class*='GridCard-module__description'] {-webkit-line-clamp: unset;}"
  		],
  		globalStyles: {
  			".TimelineItem-body .Link--primary": "-webkit-line-clamp: unset;"
  		},
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "github-blog",
  		matches: [
  			"github.blog"
  		],
  		injectedCss: [
  			"font {word-break: break-all !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "githubBlog",
  		matches: [
  			"github.blog"
  		],
  		globalStyles: {
  			".font-mktg": "word-break:normal;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "githubGist",
  		matches: [
  			"gist.github.com"
  		],
  		selectors: [
  			".markdown-body",
  			".readme"
  		],
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "githubNotebook",
  		matches: [
  			"notebooks.githubusercontent.com"
  		],
  		excludeSelectors: [
  			"div.jp-CodeCell"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "gitlab",
  		matches: [
  			"gitlab.com"
  		],
  		excludeSelectors: [
  			".tree-content-holder",
  			"nav",
  			".home-panel-metadata",
  			"div[data-testid=project_topic_list]",
  			".commit"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "gitpod",
  		matches: [
  			"www.gitpod.io/docs/*"
  		],
  		selectors: [
  			".content-docs"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "glasp",
  		matches: [
  			"glasp.co"
  		],
  		excludeSelectors: [
  			".home_overview_list_content_wrapper"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "goodreads",
  		matches: [
  			"www.goodreads.com"
  		],
  		excludeSelectors: [
  			".badgeYear",
  			".gr-mediaBox__desc",
  			".bookVotedRow",
  			".minirating",
  			"div[itemprop='aggregateRating']",
  			".wtrButtonContainer",
  			".RatingsHistogram__labelTitle",
  			".FollowButton",
  			".siteHeader__topLevelLink",
  			"#books > thead",
  			"td[class*='rating']",
  			"td[class*='shelves']",
  			"td[class*='date_read']",
  			"td[class*='date_added']",
  			"td[class*='actions']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "googleIndex",
  		matches: [
  			"https://www.google.com/",
  			"https://www.google.com.hk/"
  		],
  		excludeSelectors: [
  			"#gb",
  			"#SIvCob"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "googleMail",
  		matches: [
  			"mail.google.com"
  		],
  		globalStyles: {
  			"[role='listitem'] > div": "height:auto!important;white-space:unset!important;"
  		},
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "googleMeet",
  		matches: [
  			"meet.google.com"
  		],
  		excludeSelectors: [
  			".iOzk7[jsname='dsyhDe']",
  			".ygicle.VbkSUe",
  			".iOzk7[jsname='dsyhDe'] *"
  		],
  		extraInlineSelectors: [
  			".ygicle.VbkSUe"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "googleNews",
  		matches: [
  			"news.google.com"
  		],
  		excludeSelectors: [
  			".EyERq",
  			".AOl7G.eejsDc",
  			"[aria-label='Home']",
  			"[aria-label='For you']",
  			"[aria-label='Following']",
  			"[aria-label='World']",
  			"[aria-label='Local']",
  			".gb_Fc",
  			".wBQf7b",
  			".yPI8Rb",
  			".jKHa4e",
  			".u43Gd",
  			".Zgjpyb",
  			"[role='button']",
  			"[jsname='rymPhb']",
  			".cbz1ld",
  			".VfPpkd-P5QLlc",
  			".XvhY1d",
  			"time",
  			".bInasb"
  		],
  		injectedCss: [
  			".oovtQ,.MCAGUe,.To2ZZb.DbQnIe {height: unset;}",
  			"h4,.IBr9hb,.gPFEn{-webkit-line-clamp: unset!important;}",
  			".cp7Yvc > h2 {display: block;}"
  		],
  		blockMinTextCount: 26,
  		blockMinWordCount: 5,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "googlePlay",
  		matches: [
  			"play.google.com"
  		],
  		excludeSelectors: [
  			".vlGucd",
  			".ubGTjb",
  			".page-nums"
  		],
  		globalStyles: {
  			".Epkrse": "-webkit-line-clamp:unset;",
  			"div[data-g-id='description']": "-webkit-line-clamp:unset;max-height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "googleScholar",
  		matches: [
  			"scholar.google.*/*",
  			"scholar.google.com.*/*",
  			"scholar.google.co.*/*"
  		],
  		selectors: [
  			"h3 a[data-clk]",
  			"div.gs_rs",
  			"td a.gsc_a_at",
  			"td div.gs_gray:last-of-type",
  			"div.gsc_oci_value",
  			"#gs_opinion",
  			".gs_rt",
  			".gsh_csp",
  			".gs_fma_wpr",
  			"#gs_as_hp_main"
  		],
  		extraInlineSelectors: [
  			"br"
  		],
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "googleSearch",
  		matches: [
  			"www.google.*/search*"
  		],
  		excludeSelectors: [
  			"a h3 + div",
  			"div#sfooter",
  			".b5ZQcf",
  			".CEMjEf",
  			".MgUUmf.NUnG9d",
  			"#result-stats",
  			"[role=navigation]",
  			"div.sCuL3",
  			"div.eFM0qc.BCF2pd",
  			"div.WZ8Tjf",
  			"div.adDDi",
  			"#headerSection",
  			"#rateChatDiv",
  			".title-D5Lgyj",
  			"[data-attrid='VisualDigestVideoResult']",
  			".search-enhance-WDIEkP h4",
  			".SPZz6b h2",
  			".CtCigf",
  			".VLkRKc",
  			".EbH0bb",
  			".Wr0c6d",
  			".jleFbf",
  			"#searchform",
  			".yg51vc",
  			".CbAZb",
  			".B6fmyf.byrV5b.Mg1HEd",
  			"[class='SPa6uf Hqu6dd OSrXXb']",
  			"[class='ZtihLe YrbPuc']",
  			"[class='kb0PBd A9Y9g'] .TXwUJf,[class='kb0PBd cvP2Ce'] .TXwUJf",
  			"[class='wep10b vDF3Oc jIrdcd'],[class='gqF9jc YrbPuc']",
  			"span[data-ts]",
  			"[jscontroller='UsftYd']"
  		],
  		extraBlockSelectors: [
  			".MUFPAc",
  			"[role=heading]"
  		],
  		injectedCss: [
  			".V82bz,.uAKcGb,.F0FGWb,.Hdw6tb,.M1Sizc,.XVPTd,.Yt787.JGD2rd,.ITZIwc {-webkit-line-clamp: unset!important;max-height: unset!important;}",
  			".pe7FNb {-webkit-line-clamp: unset!important;}",
  			".promotion-3PDMAb {display: none!important;}",
  			"div[data-content-feature='1'] > div {-webkit-line-clamp: unset!important;max-height: unset!important;}",
  			"div[style='-webkit-line-clamp:*'] {-webkit-line-clamp: unset!important;max-height: unset!important;}",
  			".Pw4Ldf.RsCEN {height:unset!important;}",
  			".related-question-pair {overflow:auto!important;}"
  		],
  		blockMinTextCount: 32,
  		blockMinWordCount: 3,
  		isTranslateTitle: false,
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "gradio-app",
  		excludeSelectors: [
  			"[data-testid=\"block-label\"]",
  			".prose h1 + p",
  			"#model_selector_md > div > div > span > h3",
  			"table",
  			".tabs .md.svelte-8tpqd2.prose > p:nth-child(1)",
  			".tabs h4"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "gradioappdocs",
  		matches: [
  			"www.gradio.app/docs/*"
  		],
  		selectors: [
  			"div.obj"
  		],
  		excludeSelectors: [
  			"div#examples"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "graphcore",
  		matches: [
  			"www.graphcore.ai"
  		],
  		excludeSelectors: [
  			".morph"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "graphpad",
  		matches: [
  			"www.graphpad.com"
  		],
  		excludeSelectors: [
  			"div[data-handle='captions']",
  			"#immersive-translate-caption-window",
  			"div[data-handle='captions'] *",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ground",
  		matches: [
  			"ground.news"
  		],
  		globalStyles: {
  			".line-clamp-3": "-webkit-line-clamp: unset !important;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "gta5-mods",
  		matches: [
  			"www.gta5-mods.com"
  		],
  		excludeSelectors: [
  			"#main-nav"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "h5_nicovideo",
  		matches: [
  			"sp.*.nicovideo.*/watch/mg*"
  		],
  		excludeSelectors: [
  			".stream_comment"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "hackerNews",
  		matches: [
  			"news.ycombinator.com"
  		],
  		selectors: [
  			".titleline > a",
  			".comment > .commtext",
  			".toptext",
  			"a.hn-item-title",
  			".hn-comment-text",
  			".hn-story-title"
  		],
  		excludeSelectors: [
  			".reply",
  			".comhead",
  			".subtext"
  		],
  		excludeMatches: [
  			"https://news.ycombinator.com/submit",
  			"https://news.ycombinator.com/newsfaq.html",
  			"https://news.ycombinator.com/newsguidelines.html",
  			"https://news.ycombinator.com/security.html"
  		],
  		injectedCss: [
  			".immersive-translate-target-wrapper {content-visibility:auto;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "hadoop.apache.org",
  		matches: [
  			"hadoop.apache.org"
  		],
  		excludeSelectors: [
  			".xleft",
  			".xright",
  			"#navcolumn"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "hbomax",
  		matches: [
  			"play.max.com",
  			"play.hbomax.com"
  		],
  		excludeSelectors: [
  			"[data-testid='playerContainer']",
  			"[data-testid='CueBoxContainer']",
  			"[data-testid='playerContainer'] *",
  			"[data-testid='CueBoxContainer'] *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "healthline",
  		matches: [
  			"www.healthline.com"
  		],
  		excludeSelectors: [
  			".icon-hl-trusted-source-after"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "help.maxon.net",
  		matches: [
  			"help.maxon.net"
  		],
  		excludeSelectors: [
  			"#contentBody"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "hentai",
  		matches: [
  			"e-hentai.org"
  		],
  		excludeSelectors: [
  			"#i3"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "hikaritv",
  		matches: [
  			"boosterx.stream"
  		],
  		excludeSelectors: [
  			".jw-wrapper",
  			".jw-wrapper *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "hnAlgolia",
  		matches: [
  			"hn.algolia.com"
  		],
  		selectors: [
  			".Story_title > a:first-child",
  			".Story_comment > span"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "hoyolab",
  		matches: [
  			"www.hoyolab.com"
  		],
  		excludeSelectors: [
  			".reply-card__nickname",
  			".mhy-user-card__name",
  			".mhy-account-title__name"
  		],
  		extraBlockSelectors: [
  			".reply-card__content__detail p:first-child",
  			".reply-card-inner-reply__content > p:first-child"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "hstream",
  		matches: [
  			"hstream.moe"
  		],
  		excludeSelectors: [
  			".video-container",
  			".video-container *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "htdp",
  		matches: [
  			"htdp.org"
  		],
  		stayOriginalSelectors: [
  			".RktIn"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "htmlLangFirst",
  		selectors: [
  			"[lang=he-IL]",
  			"[lang=nl-NL]",
  			"[lang=ar-SA]",
  			"[lang=fa-IR]",
  			"[lang=fi]",
  			"[lang=fi-FI]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "hub.logseq",
  		matches: [
  			"hub.logseq.com"
  		],
  		globalStyles: {
  			"[class*=':h-[']": "height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "hubspotvideo",
  		matches: [
  			"*.hubspotvideo.com"
  		],
  		excludeSelectors: [
  			"#immersive-translate-caption-window",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "huggingface",
  		matches: [
  			"huggingface.co"
  		],
  		excludeSelectors: [
  			"thead",
  			"ul.text-base",
  			"a.group > div.flex-1",
  			"div.absolute.truncate",
  			"nav",
  			"ul[class*='dark:border-gray-800']",
  			"div[class*='from-gray-100-to-white']"
  		],
  		globalStyles: {
  			".line-clamp-2": "-webkit-line-clamp:unset;max-height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "hulu",
  		matches: [
  			"https://*.hulu.com",
  			"https://*.hulu.*"
  		],
  		excludeSelectors: [
  			".PlayerMetadata__subTitle",
  			".CaptionBox"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "iaabcfoundation",
  		matches: [
  			"learning.iaabcfoundation.org"
  		],
  		excludeSelectors: [
  			"[data-testid=\"video-player\"]",
  			"[data-testid=\"video-player\"] *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ieee",
  		matches: [
  			"spectrum.ieee.org"
  		],
  		extraBlockSelectors: [
  			"small"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ieeexplore",
  		matches: [
  			"ieeexplore.ieee.org"
  		],
  		stayOriginalSelectors: [
  			"a[ref-type]",
  			".inline-formula",
  			".display-formula"
  		],
  		excludeMatches: [
  			"ieeexplore.ieee.org/*/getPDF.jsp*"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ietf",
  		matches: [
  			"*.ietf.org/doc/html/*"
  		],
  		extraBlockSelectors: [
  			"[href^='#page']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "iflix",
  		matches: [
  			"www.iflix.com",
  			"wetv.vip"
  		],
  		excludeSelectors: [
  			".text-track",
  			".player-wrapper *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "imdb",
  		matches: [
  			"www.imdb.com",
  			"m.imdb.com"
  		],
  		excludeSelectors: [
  			".jw-text-track-container",
  			".jw-text-track-container *"
  		],
  		injectedCss: [
  			"[class*=overflow] {max-height:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "imigresen-online",
  		matches: [
  			"imigresen-online.imi.gov.my"
  		],
  		excludeSelectors: [
  			"#clock"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "immersive",
  		matches: [
  			"https://immersivetranslate.*",
  			"https://*.immersivetranslate.*",
  			"http://localhost:38001",
  			"https://app.infread.com",
  			"https://*.immersivetranslate.*/*"
  		],
  		excludeSelectors: [
  			"#imt-navbar *",
  			".preview-original-body *",
  			"#imt-navbar"
  		],
  		injectedCss: [
  			".docx-wrapper p {line-height: unset!important;}"
  		],
  		blockMinTextCount: 0,
  		blockMinWordCount: 0,
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "immersive-word",
  		matches: [
  			"https://*.immersivetranslate.*/word*",
  			"https://*.immersivetranslate.*/*/word*",
  			"https://immersivetranslate.com/*/document/word/*"
  		],
  		excludeSelectors: [
  			"#imt-navbar *",
  			".preview-original-body *",
  			"#imt-navbar"
  		],
  		paragraphMinTextCount: 0,
  		paragraphMinWordCount: 0,
  		blockMinTextCount: 0,
  		blockMinWordCount: 0,
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "immersiveTranslateIosOnBoarding",
  		selectors: [
  			"meta[name=immersiveTranslateIosOnBoarding]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "immersiveTranslateIosOnBoardingStep1",
  		selectors: [
  			"meta[name=immersiveTranslateIosOnBoardingStep1]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "indeed",
  		matches: [
  			"*.indeed.com"
  		],
  		globalStyles: {
  			"span,.css-19rjr9w.e1wnkr790": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "indiehackers",
  		matches: [
  			"www.indiehackers.com"
  		],
  		excludeSelectors: [
  			".portal-entry__date",
  			".portal-entry__byline",
  			".firestore-post__header-metadata",
  			".story__counts",
  			".story__time-ago",
  			".story__byline",
  			".partnerships__age",
  			".job__pay",
  			".author-bio__name-link",
  			".comment__footer"
  		],
  		injectedCss: [
  			".meetups__meetup-name,.partnerships__title { -webkit-line-clamp: unset!important;max-height: unset!important; }"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "inoreader",
  		matches: [
  			"www.inoreader.com",
  			"*.inoreader.com"
  		],
  		selectors: [
  			".article_header_title",
  			".article_title_link",
  			".article_content",
  			".article_magazine_title_link",
  			".blog-post-page",
  			"#welcome_center",
  			".gad_overview_articles_wrapper",
  			".library_article_text h4",
  			".header_name",
  			".blog-content"
  		],
  		excludeMatches: [
  			"https://www.inoreader.com/features*",
  			"https://www.inoreader.com/blog*",
  			"https://www.inoreader.com/discover*",
  			"https://www.inoreader.com/contact*",
  			"https://www.inoreader.com/pricing*",
  			"https://www.inoreader.com/enterprise*"
  		],
  		injectedCss: [
  			".article_title_link,.library_article_text h4,.gadget_overview_article_title,.article_magazine_title_link,.reader_pane_view_style_2 .column_view_title {-webkit-line-clamp: unset!important;max-height: unset!important;}",
  			".article_tile_content_wraper,div.article_tile {overflow:auto}",
  			".article_header_title {white-space:normal;max-height: unset!important;}",
  			".article_header_title span {display:flex !important;flex-direction: column;}",
  			".ar.article_no_thumbnail,[data-type=article] {height:unset!important;}",
  			".view_style_2 #reader_pane .ar .article_header_text .column_view_info {position:relative!important;}"
  		],
  		observeUrlChange: false,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "instagramMessage",
  		matches: [
  			"https://www.instagram.com/direct/*"
  		],
  		selectors: [
  			"div[dir=auto].html-div"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "instagramPost",
  		matches: [
  			"https://www.instagram.com/p/*",
  			"https://www.instagram.com/reels/*"
  		],
  		selectors: [
  			"h1",
  			"ul li h3+div span[dir=auto]",
  			"hr+div span[dir=auto][style]",
  			"div > div[dir=auto]",
  			"div:not([class]) > div > div:nth-child(2)"
  		],
  		excludeSelectors: [
  			"hr+div span[dir=auto][style] > span"
  		],
  		paragraphMinTextCount: 2,
  		blockMinTextCount: 1,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "internetfundamentals",
  		matches: [
  			"internetfundamentals.com"
  		],
  		excludeSelectors: [
  			"#vjs_video_3",
  			"#immersive-translate-caption-window",
  			"#vjs_video_3 *",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ipinfo",
  		matches: [
  			"ipinfo.io"
  		],
  		injectedCss: [
  			".text-bali-hai-primary:last-child {display:none!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "isEbook",
  		selectors: [
  			"meta[name='immersive-translate-ebook-viewer'][content='true']"
  		],
  		excludeSelectors: [
  			"#drop-target",
  			"#drop-target h1",
  			"#side-bar",
  			"h1#side-bar-title"
  		],
  		extraInlineSelectors: [
  			"span.dropcaps"
  		],
  		injectedCss: [
  			".immersive-translate-target-translation-block-wrapper {display:block;}"
  		],
  		paragraphMinTextCount: 4,
  		paragraphMinWordCount: 2,
  		blockMinTextCount: 1,
  		blockMinWordCount: 1,
  		isTranslateTitle: false,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "isEbookBuilder",
  		matches: [
  			"https://*.immersivetranslate.*/ebook/make*",
  			"https://*.immersivetranslate.*/ebook/make/*",
  			"https://app.infread.com/ebook/make*",
  			"http://localhost:38001/ebook/make*",
  			"http://localhost:3000/*/ebook-make*",
  			"https://*.immersivetranslate.*/*/*/ebook-make*",
  			"https://immersivetranslate.*/*/*/ebook-make*",
  			"https://immersivetranslate.com/*/document/ebook-make/*"
  		],
  		selectors: [
  			"meta[name='immersive-translate-ebook-builder'][content='true']"
  		],
  		excludeSelectors: [
  			"h1.notranslate",
  			"#drop-target",
  			"#drop-target h1",
  			"#side-bar",
  			"h1#side-bar-title",
  			"#tool",
  			".Code",
  			"[default-translate]"
  		],
  		injectedCss: [
  			".immersive-translate-target-translation-block-wrapper {display:block;}"
  		],
  		paragraphMinTextCount: 1,
  		paragraphMinWordCount: 1,
  		blockMinTextCount: 1,
  		blockMinWordCount: 1,
  		isTranslateTitle: false,
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "isSubtitleBuilder",
  		matches: [
  			"https://*.immersivetranslate.*/subtitle*",
  			"https://*.immersivetranslate.*/*/download-subtitle",
  			"http://localhost:38001/*/download-subtitle*",
  			"https://*.immersivetranslate.*/*/subtitle*",
  			"https://immersivetranslate.com/*/document/subtitle/*",
  			"https://immersivetranslate.com/*/document/download-subtitle/*"
  		],
  		selectors: [
  			"meta[name='immersive-translate-subtitle-builder'][content='true']"
  		],
  		paragraphMinTextCount: 4,
  		paragraphMinWordCount: 2,
  		isTranslateTitle: false,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "iview",
  		matches: [
  			"iview.abc.net.au"
  		],
  		excludeSelectors: [
  			".jwplayer",
  			".jwplayer *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "jable",
  		matches: [
  			"https://jable.tv/*"
  		],
  		globalStyles: {
  			".title": "white-space:unset;max-height:unset;",
  			".img-box > a": "position:relative;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "janitorai",
  		matches: [
  			"https://janitorai.com"
  		],
  		excludeSelectors: [
  			"[data-testid=virtuoso-scroller] .css-104fsj *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "javbus",
  		matches: [
  			"https://www.javbus.com/*"
  		],
  		excludeSelectors: [
  			".item-tag",
  			"date"
  		],
  		globalStyles: {
  			".photo-info": "height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "javdb",
  		matches: [
  			"https://javdb*.com/*"
  		],
  		excludeSelectors: [
  			".video-number",
  			".score",
  			".has-addons"
  		],
  		globalStyles: {
  			".video-title": "white-space:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "jddonline.com",
  		matches: [
  			"jddonline.com"
  		],
  		injectedCss: [
  			".article-body {column-count:unset;-webkit-column-count:unset;-moz-column-count:unset;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "JeffyReader",
  		selectors: [
  			"br-span"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "jetbrains",
  		matches: [
  			"https://*.jetbrains.com"
  		],
  		excludeSelectors: [
  			".toolbar__ee8",
  			"[data-test=\"left-sidebar\"]",
  			".comment__info",
  			".symbol.monospace"
  		],
  		extraBlockSelectors: [
  			"[data-test=prompt]"
  		],
  		globalStyles: {
  			".card p,.card h4": "-webkit-line-clamp:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "jfrog",
  		matches: [
  			"jfrog.com"
  		],
  		stayOriginalSelectors: [
  			".readercontent-topic-codeblockcontainer"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "jira",
  		matches: [
  			"jira.*.com/browse/*",
  			"jira.*.com/projects/*"
  		],
  		selectors: [
  			"[id=descriptionmodule]",
  			"[id=summary-val]",
  			"div.action-body",
  			"td.stsummary"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "jmir",
  		matches: [
  			"*.jmir.org"
  		],
  		stayOriginalSelectors: [
  			".article-content .footers"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "journals.aps",
  		matches: [
  			"journals.aps.*"
  		],
  		stayOriginalSelectors: [
  			"button"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "jscires",
  		matches: [
  			"jscires.org"
  		],
  		excludeSelectors: [
  			".jatsa_contrib_info"
  		],
  		extraBlockSelectors: [
  			".jatsauthtab_title"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "jstor",
  		matches: [
  			"www.jstor.org"
  		],
  		excludeSelectors: [
  			".audio-duration",
  			"[data-qa='card-item-count']"
  		],
  		excludeMatches: [
  			"www.jstor.org/stable/pdf*"
  		],
  		globalStyles: {
  			".card__heading": "-webkit-line-clamp:unset;",
  			"search-results-vue-pharos-image-card,search-ui-pharos-image-card": "display:flex;",
  			"search-results-vue-pharos-link": "display:inline;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "jwxs",
  		matches: [
  			"www.jwxs.org/book/*"
  		],
  		injectedCss: [
  			"#list dd { height: 5rem !important; line-height: unset !important; }",
  			".readbtn .chapterlist { margin: unset !important; }"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "kadaza",
  		matches: [
  			"https://www.kadaza.com/"
  		],
  		selectors: [
  			".header span.title",
  			".custom-content-footer"
  		],
  		paragraphMinTextCount: 2,
  		paragraphMinWordCount: 1,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "kaggle",
  		matches: [
  			"www.kaggle.com"
  		],
  		excludeSelectors: [
  			".sc-kHItYk.kCjSZT",
  			".sc-hagvSa.guBIfV",
  			".sc-jhZTHU.btgPPn",
  			"#editor-sidebar-scroll-container"
  		],
  		injectedCss: [
  			".km-listitem--large {height:unset !important;}",
  			".km-listitem--large .jWyUHl {height:unset !important;}",
  			"[role=listitem] {overflow:scroll;}",
  			"[role=listitem] div {-webkit-line-clamp:unset;}",
  			"[class*='km-listitem--medium'] {height:unset !important;}",
  			".MuiListItem-root a > div :nth-child(2) {height:unset !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "kanopy",
  		matches: [
  			"*.kanopy.com"
  		],
  		excludeSelectors: [
  			".vjs-text-track-display",
  			".vjs-text-track-display *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "khanacademy",
  		matches: [
  			"www.khanacademy.org"
  		],
  		stayOriginalSelectors: [
  			".mathjax-wrapper"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "khflix",
  		matches: [
  			"khflix.com",
  			"watch.globaltv.com"
  		],
  		excludeSelectors: [
  			"#video-playlist",
  			"#video-playlist *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "klibs",
  		matches: [
  			"klibs.io"
  		],
  		excludeSelectors: [
  			"[class*='styles_footerWrapper']",
  			"[class*='styles_searchFilterContainerWrapper']",
  			"[class*='styles_headingWrapper']",
  			"[class*='styles_navigation']",
  			"[class*='styles_rightSideColumnWrapper']",
  			".breadcrumb"
  		],
  		injectedCss: [
  			"[class*='styles_card'] {height:unset!important; -webkit-line-clamp:unset!important; max-height:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "law.mit.edu",
  		matches: [
  			"law.mit.edu"
  		],
  		injectedCss: [
  			"@media screen and (min-width: 768px) { .pub-header-theme-light {top:-80% !important;} }"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "learningSap",
  		matches: [
  			"learning.sap.com"
  		],
  		excludeSelectors: [
  			".playkit-subtitles",
  			"#immersive-translate-caption-window",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "learnopengl",
  		matches: [
  			"learnopengl.com"
  		],
  		globalStyles: {
  			"function": "position:relative;z-index:1000;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "lecturio",
  		matches: [
  			"app.lecturio.com"
  		],
  		excludeSelectors: [
  			"#vjs_video_3",
  			"#vjs_video_3 *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "lesswrong",
  		matches: [
  			"www.lesswrong.com"
  		],
  		excludeSelectors: [
  			".PostsPagePostHeader-authorAndSecondaryInfo",
  			".Answer-answerHeader",
  			"time",
  			".CommentsItemMeta-root",
  			".CommentsListMeta-root",
  			".CommentsTableOfContents-tocPostedAt",
  			".CommentsTableOfContents-commentAuthor",
  			".CommentBottom-bottom"
  		],
  		extraBlockSelectors: [
  			"span.commentOnSelection"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "letsjelly",
  		matches: [
  			"app.letsjelly.com"
  		],
  		selectors: [
  			".message-content",
  			".h1-subject-button",
  			".cil-subject",
  			".cil-body-wrapper",
  			".text-body"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "libreddit",
  		matches: [
  			"libreddit.de"
  		],
  		selectors: [
  			"h2.post_title",
  			".comment_body > .md"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "linkedinFeed",
  		matches: [
  			"https://linkedin.com/feed/*"
  		],
  		selectors: [
  			"h1",
  			".feed-shared-update-v2__description-wrapper"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "linkin",
  		matches: [
  			"*.linkedin.com"
  		],
  		excludeSelectors: [
  			".vjs-text-track-display",
  			".vjs-text-track-display *"
  		],
  		injectedCss: [
  			".linked-area * {max-height: unset !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "live_attach_basic",
  		selectors: [
  			"meta[name='immersive-translate-live-attach-basic'][content='true']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "lobste",
  		matches: [
  			"lobste.rs"
  		],
  		selectors: [
  			".u-repost-of",
  			".comment_text",
  			".story_text"
  		],
  		excludeMatches: [
  			"https://lobste.rs/about",
  			"https://lobste.rs/chat"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "lookintobitcoin",
  		matches: [
  			"https://www.lookintobitcoin.com/charts/*"
  		],
  		excludeSelectors: [
  			"svg"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "lowendtalk",
  		matches: [
  			"lowendtalk.com"
  		],
  		selectors: [
  			"[role=heading]",
  			"h1",
  			".userContent",
  			".DismissMessage",
  			".PanelColumn",
  			".Meta-Discussion"
  		],
  		excludeSelectors: [
  			".ClearFix .Count"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "lowstresshandling",
  		matches: [
  			"university.lowstresshandling.com"
  		],
  		excludeSelectors: [
  			"div[data-vjs-player]",
  			"div[data-vjs-player] *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "luminousfox",
  		matches: [
  			"www.luminousfox.com/book/*"
  		],
  		injectedCss: [
  			"#detail_chapter .box_content ul li { height: unset !important; overflow: visible !important; }"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "mail-yandex",
  		matches: [
  			"mail.yandex.com"
  		],
  		selectors: [
  			"article",
  			".Text_color_primary",
  			".mail-MessageSnippet-Item_subject"
  		],
  		globalStyles: {
  			".mail-MessageSnippet": "height: unset; line-height:unset;",
  			".immersive-translate-target-translation-block-wrapper": "margin:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "mangaplus-shueisha",
  		matches: [
  			"mangaplus.shueisha.*"
  		],
  		excludeSelectors: [
  			".zao-surface"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "marketsurge",
  		matches: [
  			"marketsurge.investors.com"
  		],
  		excludeSelectors: [
  			".jwplayer",
  			".jwplayer *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "marquee-gs",
  		matches: [
  			"marquee.gs.com"
  		],
  		excludeSelectors: [
  			"[class*='article-header-sub-header']",
  			"[role=img]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "masterclass",
  		matches: [
  			"www.masterclass.com",
  			"learn.microsoft.com"
  		],
  		excludeSelectors: [
  			".mc-video--text-track",
  			".mc-video--text-track *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "mastodon",
  		matches: [
  			"mastodon.social",
  			"mastodon.online",
  			"kolektiva.social",
  			"indieweb.social",
  			"mastodon.world",
  			"infosec.exchange"
  		],
  		selectors: [
  			"div.status__content__text",
  			".about__section__body",
  			".content",
  			".form-container",
  			".account__header__extra",
  			"div#mastodon"
  		],
  		isTranslateTitle: false,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "mathsisfun",
  		matches: [
  			"www.mathsisfun.com"
  		],
  		stayOriginalSelectors: [
  			".center.large"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "maxroll",
  		matches: [
  			"maxroll.gg"
  		],
  		excludeSelectors: [
  			"span[class^='text-opac'] + span[class^='text-']"
  		],
  		extraInlineSelectors: [
  			".d4t-sprite-icon",
  			".d4t-icon"
  		],
  		injectedCss: [
  			"font {font-family: sans-serif !important;}",
  			".d4t-sprite-icon {display: unset !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "medbridge",
  		matches: [
  			"www.medbridge.com"
  		],
  		excludeSelectors: [
  			"#player-video",
  			"#player-video *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "mediadelivery",
  		matches: [
  			"iframe.mediadelivery.net"
  		],
  		excludeSelectors: [
  			".plyr__captions",
  			"#immersive-translate-caption-window",
  			".plyr__captions *",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "mediaspace",
  		matches: [
  			"mediaspace.illinois.edu"
  		],
  		excludeSelectors: [
  			".playkit-overlay-action ",
  			".playkit-overlay-action  *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "medici",
  		matches: [
  			"www.medici.tv"
  		],
  		excludeSelectors: [
  			"#player-movie-page",
  			"#player-movie-page *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "medium",
  		matches: [
  			"medium.com",
  			"*.medium.com"
  		],
  		selectors: [
  			"h1,h2,h3",
  			"article section",
  			"[aria-hidden='false'] pre",
  			"article p",
  			".postMetaInline",
  			"a .u-fontSize24",
  			"pre .ha",
  			"pre > div > div > div",
  			"div > p > span",
  			"section p,section span",
  			"a div span",
  			".ppapp-form-info,.request-form",
  			"meta[property='al:ios:url'][content^='medium://']"
  		],
  		excludeSelectors: [
  			"[aria-label='Post Preview Reading Time']",
  			".speechify-ignore",
  			"article pre",
  			"pre > span"
  		],
  		injectedCss: [
  			".u-lineClamp4,.u-lineClamp3,.u-lineClamp2 {-webkit-line-clamp:unset!important;max-height:unset!important;}"
  		],
  		globalStyles: {
  			"h2,h3": "-webkit-line-clamp: unset;max-height:unset;",
  			"article p": "-webkit-line-clamp: unset;max-height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "mfacebook",
  		matches: [
  			"m.facebook.com"
  		],
  		selectors: [
  			"div[dir=auto][style]",
  			"div[dir=auto][class]",
  			"span[lang]",
  			"[data-pagelet=BizInboxMessengerMessageListContainer] span",
  			"[data-pagelet=BizInboxContextCardDetail] span",
  			"[data-type=container][data-mcomponent=MContainer][class='m displayed'] .native-text",
  			"[data-mcomponent=ServerTextArea] .native-text"
  		],
  		excludeSelectors: [
  			"[data-ad-comet-preview=message] [role=button]",
  			"[role=button]"
  		],
  		injectedCss: [
  			".native-text.rslh {line-height:unset!important;}"
  		],
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "mgtv",
  		matches: [
  			"w.mgtv.com"
  		],
  		excludeSelectors: [
  			"#immersive-translate-caption-window",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "microsoft",
  		matches: [
  			"https://apps.microsoft.com/store/detail/*"
  		],
  		globalStyles: {
  			".line-clamp": "-webkit-line-clamp:unset;max-height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "migadu",
  		matches: [
  			"webmail.migadu.com"
  		],
  		selectors: [
  			".bodyText"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "mindvalley",
  		matches: [
  			"home.mindvalley.com"
  		],
  		excludeSelectors: [
  			".vjs-text-track-display",
  			".vjs-text-track-display *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "missav",
  		matches: [
  			"https://missav.*/*"
  		],
  		excludeSelectors: [
  			".leading-normal",
  			"[class='absolute bottom-1 right-1 rounded-lg px-2 py-1 text-xs text-nord5 bg-gray-800 bg-opacity-75']",
  			"[class='absolute bottom-1 left-1 rounded-lg px-2 py-1 text-xs text-nord5 bg-blue-800 bg-opacity-75']"
  		],
  		globalStyles: {
  			".truncate": "white-space:unset;",
  			".overflow-y-hidden": "max-height:unset;overflow-y:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "mitre",
  		matches: [
  			"cwe.mitre.org"
  		],
  		globalStyles: {
  			"span.list_entry": "height: unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "mkdocs-material",
  		selectors: [
  			"article",
  			".md-sidebar__inner",
  			".md-container[data-md-component]"
  		],
  		injectedCss: [
  			".md-sidebar__inner .immersive-translate-target-wrapper {display: inline-flex;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ml4vis",
  		matches: [
  			"ml4vis.github.io"
  		],
  		excludeSelectors: [
  			".jss45"
  		],
  		globalStyles: {
  			".jss42": "height:unset;",
  			".jss44": "max-height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "mobalytics",
  		matches: [
  			"mobalytics.gg"
  		],
  		extraInlineSelectors: [
  			"p.xlpi6m9.x5qbwci.xw7yly9 span span"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "modelhub",
  		matches: [
  			"https://www.modelhub.com/*"
  		],
  		globalStyles: {
  			".videoTitle": "height:unset;",
  			a: "height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "moltbook",
  		matches: [
  			"www.moltbook.com"
  		],
  		excludeSelectors: [
  			"[class='flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-[#7c7c7c] mb-1.5 sm:mb-2 flex-wrap']",
  			"[class='flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-[#7c7c7c]']",
  			"[class='flex items-center gap-2 p-2 rounded-lg transition-all duration-200 group animate-fadeIn bg-gradient-to-r from-[#ffd700]/10 to-transparent hover:from-[#ffd700]/20']",
  			"[class='flex flex-col items-center gap-0.5 sm:gap-1 text-center min-w-[32px] sm:min-w-[40px]']",
  			"[class='bg-white border border-[#e0e0e0] rounded-lg overflow-hidden'] .p-2",
  			"[class='text-xs text-[#818384] mb-2']",
  			"[class='w-12 bg-[#161617] rounded-l-lg flex flex-col items-center py-3 text-sm']",
  			"[class='bg-[#1a1a1b] px-4 py-3 flex items-center justify-between sticky top-[52px] z-40 rounded-t-lg border border-[#333] shadow-md']",
  			"[class='flex items-center gap-3 text-xs text-[#818384]']",
  			"a[class='text-[#d7dadc] font-medium hover:underline']"
  		],
  		injectedCss: [
  			"[class*='line-clamp']{-webkit-line-clamp:unset !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "monmouthcoffee",
  		matches: [
  			"www.monmouthcoffee.*"
  		],
  		excludeSelectors: [
  			"#basket"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "motrix.app",
  		matches: [
  			"motrix.app"
  		],
  		excludeSelectors: [
  			".download-section__right .el-tabs__nav"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "movie-web",
  		matches: [
  			"movie-web.app/media*",
  			"movie-web-me.vercel.app/media*",
  			"*.vidbinge.com",
  			"vidsrc.xyz"
  		],
  		excludeSelectors: [
  			"#root",
  			"#root *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "msn",
  		matches: [
  			"www.msn.com"
  		],
  		excludeSelectors: [
  			".attribution",
  			".super-nav-container",
  			"#follow-button",
  			".media-info-container",
  			".ad-label",
  			".provider-name",
  			".weather-container",
  			".money-info-content",
  			"casual-games-card",
  			".match-data",
  			".me-stripe-container"
  		],
  		injectedCss: [
  			".root {overflow-y: scroll!important;}",
  			".heading {-webkit-line-clamp: unset!important;}",
  			".content .text {overflow-y: scroll !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "murlok",
  		matches: [
  			"murlok.io"
  		],
  		injectedCss: [
  			".vi-media-object {display:flex;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "nature",
  		matches: [
  			"https://www.nature.com/articles/*"
  		],
  		excludeSelectors: [
  			".c-header",
  			".c-recommendations-header",
  			".c-recommendations-list-container",
  			".c-article-references__links",
  			".c-article-identifiers",
  			".c-article-author-list",
  			".c-article-metrics-bar__wrapper",
  			".c-article__pill-button",
  			"#author-information-content",
  			"#article-info-section",
  			".pdf-content"
  		],
  		excludeMatches: [
  			"https://www.nature.com/articles/*.pdf"
  		],
  		injectedCss: [
  			".immersive-translate-target-wrapper {content-visibility:auto;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "nbcnews",
  		matches: [
  			"www.nbcnews.com"
  		],
  		excludeSelectors: [
  			".jw-wrapper.jw-reset",
  			".jw-wrapper.jw-reset *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "nebula",
  		matches: [
  			"nebula.tv"
  		],
  		excludeSelectors: [
  			"[data-subtitles-container='true']",
  			"[data-subtitles-container='true'] *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "nebula.starbreeze",
  		matches: [
  			"https://nebula.starbreeze.com/support"
  		],
  		injectedCss: [
  			"main section>div {overflow-y:scroll !important;}",
  			"main section>div::-webkit-scrollbar {display: none;width: 0px;background: transparent;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "netflav",
  		matches: [
  			"https://netflav*.com/*"
  		],
  		extraBlockSelectors: [
  			".genre_filter_item",
  			"button"
  		],
  		globalStyles: {
  			".grid_title": "max-height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "netflix",
  		matches: [
  			"www.netflix.com"
  		],
  		excludeSelectors: [
  			".player-timedtext",
  			".player-timedtext *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "newsminimalist",
  		matches: [
  			"https://www.newsminimalist.com/"
  		],
  		extraBlockSelectors: [
  			".inline-flex"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "newyorker",
  		matches: [
  			"www.newyorker.com"
  		],
  		excludeSelectors: [
  			"[data-testid=PersistentTop]",
  			"[data-testid=StackedNavigationHeader]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "next_westlaw",
  		matches: [
  			"*.next.westlaw.com"
  		],
  		stayOriginalSelectors: [
  			".docLinkWrapper"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "nextjs",
  		matches: [
  			"nextjs.org"
  		],
  		injectedCss: [
  			"[imt-state=dual] .styled-scrollbar ul li ul li ul li ul li a {white-space:nowrap!important;}",
  			"[imt-state=dual] .styled-scrollbar ul li font.immersive-translate-target-wrapper {text-align: right;width: 100%;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "nexusmods",
  		matches: [
  			"www.nexusmods.com"
  		],
  		excludeMatches: [
  			"https://www.nexusmods.com/games/*"
  		],
  		injectedCss: [
  			"[class*='line-clamp-'] {-webkit-line-clamp: unset!important; max-height: unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "nicovideo",
  		matches: [
  			"seiga.nicovideo.*/watch/mg*"
  		],
  		excludeSelectors: [
  			".page",
  			".stream_comment"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "nikkei",
  		matches: [
  			"www.nikkei.com"
  		],
  		globalStyles: {
  			"h3,div,span,p": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "nitter",
  		selectors: [
  			".tweet-content",
  			".quote-text",
  			"meta[property='og:site_name'][content='Nitter']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "nmaart",
  		matches: [
  			"www.nma.art"
  		],
  		excludeSelectors: [
  			".video-container",
  			".video-container *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "noon",
  		matches: [
  			"www.noon.com"
  		],
  		excludeSelectors: [
  			"[class*='priceContainer']",
  			"[class*='ProductImageFooter']",
  			"[class*='Nudges_nudges']"
  		],
  		injectedCss: [
  			"[class*='ProductDetailsSection'] {-webkit-line-clamp:unset!important;}",
  			"[class*='title'] {-webkit-line-clamp:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "notateslaapp",
  		matches: [
  			"www.notateslaapp.com"
  		],
  		extraBlockSelectors: [
  			".nav > *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "notionSite",
  		matches: [
  			"notion.site",
  			"*.notion.site"
  		],
  		selectors: [
  			".notion-html body",
  			".notion-app"
  		],
  		excludeSelectors: [
  			".notion-code-block"
  		],
  		injectedCss: [
  			"[aria-label='Templates'] font br {display:none;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "NoTranslate",
  		matches: [
  			"*.tiktok.com",
  			"altis.world",
  			"*.newthingsunderthesun.com",
  			"*.gumroad.com",
  			"edstem.org",
  			"actions.tldrnewsletter.com",
  			"community.linkingyourthinking.com",
  			"winaero.com",
  			"community.afforai.com",
  			"www.perplexity.ai",
  			"hdsr.mitpress.mit.edu",
  			"rent.men",
  			"*.rwth-aachen.*",
  			"www.backcountry.com",
  			"intranet.alxswe.com",
  			"www.steepandcheap.com",
  			"whoer.is",
  			"community.seniorswc.com",
  			"www.skool.com",
  			"sfget.jp",
  			"talentcentral.eu.shl.com",
  			"www.crd.york.ac.*",
  			"www.campo.fau.de",
  			"s.hoothin.com",
  			"feedback.featurebase.app",
  			"typefully.com",
  			"*.affine.*",
  			"*.shopify.com",
  			"*.marscode.com",
  			"nexus.evenant.com",
  			"portal.achieve3000.net",
  			"triumph-cubic.com",
  			"ieeeforms.wufoo.com",
  			"www.midjourney.com",
  			"fifakitcreator.com",
  			"app.voxy.com",
  			"www.zome.*",
  			"electrical-engineering-portal.com",
  			"www.surveymonkey.com",
  			"www.rawpixel.com",
  			"mail.cstnet.cn",
  			"mail.nudt.edu.cn",
  			"lkml.org",
  			"mail.qq.com",
  			"kalimat.anghami.com",
  			"changewindows.org",
  			"scispace.com",
  			"ww2.mathworks.cn",
  			"paragon-eu.amazon.com"
  		],
  		selectors: [
  			"html[translate=no]",
  			"body[translate=no]",
  			"body[class=notranslate]",
  			"body[class^='notranslate']",
  			"#app[translate=no]",
  			"#root[translate=no]",
  			"#editor-core-root [translate=no]",
  			".notranslate.chrome",
  			".main-content [translate=no]",
  			"body.notranslate.rtb-desktop",
  			".survey-body .notranslate",
  			".ProseMirror[translate=no]",
  			"#mainWrapper[translate=no]",
  			"body.notranslate"
  		],
  		excludeMatches: [
  			"eproofing.springer.com/*/journals/*"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "novel-site",
  		matches: [
  			"www.piaotia.com",
  			"www.zhenhunxiaoshuo.com",
  			"www.hetushu.com"
  		],
  		injectedCss: [
  			".centent ul { display: flex; }",
  			".centent ul li { height: unset !important; float: none !important; }",
  			"article.excerpt { white-space: normal !important; overflow: visible !important; }",
  			"#dir dd { white-space: normal !important; overflow: visible !important; }"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "npmjs",
  		matches: [
  			"https://www.npmjs.com/package/*"
  		],
  		selectors: [
  			"#tabpanel-readme > div:first-child"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "nrk",
  		matches: [
  			"tv.nrk.no"
  		],
  		excludeSelectors: [
  			"tv-player[data-testid=\"tv-player\"]",
  			"#immersive-translate-caption-window",
  			"tv-player[data-testid=\"tv-player\"] *",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "nytimes",
  		matches: [
  			"www.nytimes.com"
  		],
  		excludeSelectors: [
  			"#app > div > div > header",
  			"#app > div > div > div > div > header",
  			"#in-story-masthead",
  			"[data-testid=masthead-container]",
  			"[data-testid=user-header]",
  			"[data-testid^='recommend-button']",
  			"[data-testid=copy-link]",
  			".css-mydst6 > a"
  		],
  		injectedCss: [
  			"a::after {position:relative!important;}",
  			"footer {line-height: unset!important;;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ocrtraining",
  		matches: [
  			"ocrtraining.cit.nih.gov",
  			"videocast.nih.gov"
  		],
  		excludeSelectors: [
  			"#videocastPlayer",
  			"#videocastPlayer *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "oldReddit",
  		matches: [
  			"old.reddit.com/*/.compact",
  			"old.reddit.com/.compact",
  			"www.reddit.com/*/.compact",
  			"www.reddit.com/.compact"
  		],
  		selectors: [
  			".title > a",
  			".usertext-body"
  		],
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ollama",
  		matches: [
  			"ollama.com"
  		],
  		excludeSelectors: [
  			"#file-explorer",
  			"span[x-test-search-response-title]",
  			"a[x-test-model-name]",
  			"span[x-test-size]",
  			"span[x-test-capability]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "openaiDocs",
  		matches: [
  			"https://platform.openai.com/docs*"
  		],
  		excludeSelectors: [
  			".pheader"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "openrouter",
  		matches: [
  			"openrouter.ai"
  		],
  		excludeSelectors: [
  			".line-clamp-1.text-lg",
  			".text-muted-foreground.text-sm.col-span-4.text-right",
  			"div[title='Tokens this week']",
  			".text-green-600.font-medium",
  			".text-xl.text-slate-11",
  			"button[role='tab']",
  			"[data-badge-type=http-method]",
  			"div[role='region'] > div > ul"
  		],
  		globalStyles: {
  			"button.text-primary-foreground": "height: 100%;white-space: normal;word-wrap: break-word;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "orchestraltools",
  		matches: [
  			"www.orchestraltools.com"
  		],
  		injectedCss: [
  			".immersive-translate-target-wrapper *, .immersive-translate-target-wrapper {font-size: inherit !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "orvehogar",
  		matches: [
  			"www.orvehogar.com"
  		],
  		injectedCss: [
  			"h3.vtex-product-summary-2-x-productNameContainer{height: unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "osmosis",
  		matches: [
  			"*.osmosis.org"
  		],
  		excludeSelectors: [
  			"#video-player-container",
  			"#immersive-translate-caption-window",
  			"#video-player-container *",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "other-chatapps",
  		matches: [
  			"app.salesmartly.com/chat"
  		],
  		selectors: [
  			".chat__inbox_item_text_ordinary",
  			".ivu-tooltip [title]"
  		],
  		injectedCss: [
  			"._ss_2FLBr4_u {height:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "otherGoogle",
  		matches: [
  			"*.google.com",
  			"dart.dev",
  			"*.google",
  			"*.googleapis.com"
  		],
  		excludeSelectors: [
  			".o_35",
  			"[style*='Google Symbols']",
  			"md-icon-button",
  			".material-symbols-outlined",
  			".cfc-result-card-table",
  			".material-symbols",
  			".gemini-large-text__overlay",
  			"code",
  			"view-line",
  			"#modelSelector",
  			".leaderboard-content",
  			"#selected-count",
  			"#selected-cat"
  		],
  		extraInlineSelectors: [
  			"ms-cmark-node > strong > ms-cmark-node",
  			"p ms-cmark-node",
  			"span > button"
  		],
  		injectedCss: [
  			".scSearchSearch_results_listSearchresultslistsnippet { -webkit-line-clamp:unset;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "otherInstagram",
  		matches: [
  			"https://www.instagram.com/*"
  		],
  		selectors: [
  			"h1",
  			"article span[dir=auto] > span[dir=auto]",
  			"._ab1y",
  			"ul li h3+div span[dir=auto]",
  			"hr+div span[dir=auto][style]",
  			"span[dir=auto] > div > span",
  			"div > h1[dir=auto]",
  			".x1fkh5qu.x1ddbhtg.x1dlrdel",
  			"a[href*='explore/locations/']"
  		],
  		excludeMatches: [
  			"https://www.instagram.com/b/*"
  		],
  		paragraphMinTextCount: 2,
  		blockMinWordCount: 1,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "otherMathSites",
  		selectors: [
  			"math",
  			"mjx-container",
  			"[class*='MathJax']",
  			"[class*='math-']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "otherOldReddit",
  		matches: [
  			"old.reddit.com"
  		],
  		selectors: [
  			"p.title > a",
  			"[role=main] .md-container",
  			".media-gallery .usertext",
  			".expando .usertext",
  			".res-expando-box .md"
  		],
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "outlook",
  		matches: [
  			"outlook.live.com"
  		],
  		excludeSelectors: [
  			".jHAG3.XG5Jd",
  			".OZZZK",
  			".lDdSm",
  			".ZfoST.VlT6S.azUpZ",
  			".GssDD,.xpAva,.oHwUF,.D1eg_",
  			"[id=CenterRegion]",
  			"[id=RibbonRoot]",
  			"[role=toolbar]",
  			".qQbyL,.bkYAr,.gpJ9q,.threeColumnCirclePersonaDivWidth",
  			"[class='_rWRU Ejrkd qq2gS D8iyG']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "overflow-sites",
  		matches: [
  			"www.highfrequencyelectronics.com",
  			"www.uzh.ch",
  			"www-mail.icloud-sandbox.com",
  			"*.cpaaustralia.com.*",
  			"www.8du8.net/*",
  			"ieltscat.xdf.*",
  			"moddota.com",
  			"www.nogizaka46.com"
  		],
  		injectedCss: [
  			"#main-content {overflow:unset;}",
  			".TextImage--inner {overflow:auto !important;}",
  			"body{overflow-y:scroll!important;}",
  			"li.expanded > div{ overflow:scroll; }",
  			".book_list ul li { height: unset !important; overflow: visible !important; }",
  			"#tabs-content-wrap {overflow:scroll;}",
  			".ReactVirtualized__Grid__innerScrollContainer {overflow:scroll!important;}",
  			".b--wrap {overflow:scroll!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "panopto",
  		matches: [
  			"southampton.cloud.panopto.eu_no_subitle"
  		],
  		excludeSelectors: [
  			".primaryPlayer",
  			".primaryPlayer *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "paramountplus",
  		matches: [
  			"*.paramountplus.com"
  		],
  		excludeSelectors: [
  			".aa-player-skin",
  			".aa-player-skin *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "patreon",
  		matches: [
  			"www.patreon.com"
  		],
  		excludeSelectors: [
  			".video-container",
  			".video-container *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "pbs",
  		matches: [
  			"*.pbs.org"
  		],
  		excludeSelectors: [
  			".wrapper",
  			"#immersive-translate-caption-window",
  			".wrapper *",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "pdf",
  		matches: [
  			"https://app.immersivetranslate.*/pdf",
  			"https://test-app.immersivetranslate.*/pdf",
  			"https://app.immersivetranslate.*/pdf/*",
  			"https://test-app.immersivetranslate.*/pdf/*",
  			"https://immersivetranslate.com/*/document/pdf/*",
  			"https://app.infread.com/pdf/*",
  			"http://localhost:38001/pdf*"
  		],
  		selectors: [
  			"#viewerContainer p",
  			"meta[name='immersive-translate-pdf-viewer'][content='true']"
  		],
  		injectedCss: [
  			".immersive-translate-target-wrapper {display: contents!important;position:absolute;}",
  			".immersive-translate-target-wrapper br {display: none;!important;}",
  			".immersive-translate-target-wrapper span {position: relative;!important;}",
  			".immersive-translate-error-wrapper {padding:0px !important;margin:0px !important;}",
  			".immersive-translate-target-translation-block-wrapper {display: unset!important;}",
  			".immersive-translate-target-inner div div {border:unset!important;padding:0!important;}",
  			".immersive-translate-target-wrapper[dir='rtl'] {text-align: right;display: inline-block!important;position:unset;}"
  		],
  		isTranslateTitle: false,
  		detectParagraphLanguage: true,
  		excludeSelectorsRegexes: {
  			p: [
  				"/^$/"
  			]
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "peacocktv",
  		matches: [
  			"*.peacocktv.com"
  		],
  		injectedCss: [
  			".video-player__subtitles__line > font,.video-player__subtitles__line:only-child{display:block;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "perplexity",
  		matches: [
  			"https://www.perplexity.ai"
  		],
  		excludeSelectors: [
  			"[data-framer-name='Desktop']"
  		],
  		stayOriginalSelectors: [
  			"a.citation",
  			"[class='my-md pb-xs pt-sm']"
  		],
  		excludeMatches: [
  			"https://www.perplexity.ai/hub/*",
  			"https://www.perplexity.ai/*/hub/*",
  			"https://www.perplexity.ai/onboarding",
  			"https://www.perplexity.ai/enterprise*",
  			"https://www.perplexity.ai/2024recap"
  		],
  		globalStyles: {
  			"[class*=line-clamp]": "-webkit-line-clamp: unset !important;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "piAi",
  		matches: [
  			"pi.ai/talk"
  		],
  		globalStyles: {
  			"[class*='text-brand-green']": "flex-direction:column;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "pinboard",
  		matches: [
  			"pinboard.in"
  		],
  		injectedCss: [
  			"div.blurb_box,div.homepage_quad,div.signup_button {height: unset !important;}",
  			"h1.magazine_title {line-height: 1.2 !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "pixiv",
  		matches: [
  			"www.pixiv.net"
  		],
  		injectedCss: [
  			"[id*='expandable-paragraph'] {max-height:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "pkg",
  		matches: [
  			"https://pkg.go.dev/*"
  		],
  		selectors: [
  			"div.UnitDetails",
  			"#_nav_group_README",
  			"p.SearchSnippet-infoLabel",
  			".go-Container"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "pkgStd",
  		matches: [
  			"https://pkg.go.dev/std"
  		],
  		selectors: [
  			"td.UnitDirectories-desktopSynopsis"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "plati",
  		matches: [
  			"plati.market"
  		],
  		injectedCss: [
  			".card .custom-link{-webkit-line-clamp: unset !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "player.vimeo",
  		matches: [
  			"https://player.vimeo.com/video/*",
  			"www.physeo.com"
  		],
  		selectors: [
  			"iframe[src*='player.vimeo.com']"
  		],
  		excludeSelectors: [
  			".vp-captions-line",
  			".vp-captions *",
  			".vp-captions-line *"
  		],
  		extraBlockSelectors: [
  			"span.vp-captions-line",
  			"span[class^=CaptionsRenderer_]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "pluto",
  		matches: [
  			"pluto.tv"
  		],
  		excludeSelectors: [
  			".video-player-layout",
  			".video-player-layout *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "podcasts",
  		matches: [
  			"podcasts.apple.com"
  		],
  		excludeSelectors: [
  			".detailed-play-button-wrapper"
  		],
  		injectedCss: [
  			".multiline-clamp { display: flex!important;flex-direction: column; }",
  			".headings__title,.powerswoosh__title,[data-testid=truncate-text] {-webkit-line-clamp:unset!important;}",
  			".show-artwork {height:fit-content!important;}",
  			".powerswoosh__lockup-details-container,.powerswoosh__chin,[data-testid=amp-review__text] {max-height:unset!important;height:unset!important;}",
  			".episode-hero__overlay {overflow:auto!important;}",
  			"ul .multiline-clamp {display:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "poe",
  		matches: [
  			"https://poe.com/*"
  		],
  		excludeSelectors: [
  			".Markdown_markdownContainer__Tz3HQ *",
  			".MarkdownLink_linkifiedLink__KxC9G",
  			"menu",
  			"aside"
  		],
  		globalStyles: {
  			"[class^='BotListItem_botDescription']": "-webkit-line-clamp: unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "poeditor",
  		matches: [
  			"https://poeditor.com/projects/*"
  		],
  		selectors: [
  			".comment-body",
  			".reference_language .source-string"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "polymarket",
  		matches: [
  			"polymarket.com"
  		],
  		excludeSelectors: [
  			"number-flow-react",
  			"button",
  			"a.inline-flex"
  		],
  		injectedCss: [
  			"div[data-index] p.decoration-2 {-webkit-line-clamp:unset;}",
  			"div[data-index] .items-start.relative.gap-2.px-3.flex.w-full {height:unset; max-height:unset;}",
  			"div[data-index] .absolute.w-full {overflow:scroll;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "pornhub",
  		matches: [
  			"*.pornhub.com",
  			"pornhub.com"
  		],
  		extraBlockSelectors: [
  			".trendingNow",
  			".searchItem",
  			".tagcloud > a"
  		],
  		excludeMatches: [
  			"*.pornhub.com/insights/*",
  			"pornhub.com/insights/*"
  		],
  		globalStyles: {
  			"span.title": "height:unset; max-height:unset;",
  			".detailedInfo": "max-height:unset;",
  			".pcVideoListItem": "max-height:unset;",
  			".wrap": "height:unset;",
  			".entry-header": "height:unset;",
  			".entry-title > a": "height:unset;-webkit-line-clamp:unset;"
  		},
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "preSites",
  		matches: [
  			"mail.163.com",
  			"mail.jabber.org",
  			"antirez.com",
  			"patchwork.kernel.org",
  			"lists.apache.org",
  			"manned.org",
  			"bugs.webkit.org",
  			"bugzilla.mozilla.org",
  			"scriptbin.works",
  			"bugs.gentoo.org",
  			"lwn.net/Articles/*",
  			"docs.haproxy.org",
  			"*.freebsd.org",
  			"www.oreilly.com/openbook/opensources/book/*",
  			"gamefaqs.gamespot.com",
  			"bugs.java.com/bugdatabase/view_bug.do",
  			"rachelsenglish.com",
  			"privatter.net",
  			"www.asuswrt-merlin.net",
  			"tic80.com",
  			"www.impo.*",
  			"sotf-mods.com",
  			"www.bls.gov",
  			"www.sreality.cz",
  			"alar.95chat.cloud",
  			"novel.prcm.jp",
  			"im.jinritemai.com",
  			"lftp.yar.ru",
  			"*.mercadolibre.com",
  			"corpus-texmex.irisa.*",
  			"www.imageen.com",
  			"seller-id.tokopedia.com",
  			"tortoisegit.org",
  			"www.dove.com",
  			"man7.org",
  			"phrack.org"
  		],
  		selectors: [
  			"pre.changelog"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "primevideo",
  		matches: [
  			"www.primevideo.com",
  			"https://*.amazon.co.*/*video*",
  			"https://*.amazon.com/*video*",
  			"https://*.amazon.*/*video*"
  		],
  		excludeSelectors: [
  			"#dv-web-player",
  			"#dv-web-player *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "pro-pdf-immersive",
  		matches: [
  			"https://*.immersivetranslate.*/pdf-pro*",
  			"https://immersivetranslate.com/*/document/pdf-pro/*"
  		],
  		excludeSelectors: [
  			".mmd-context-menu",
  			".preview-original-body *",
  			"#imt-navbar"
  		],
  		extraInlineSelectors: [
  			".sub-table",
  			".sub-table td",
  			".sub-table tr"
  		],
  		injectedCss: [
  			".immersive-translate-target-wrapper {white-space: unset;}",
  			"[data-immersive-translate_rtl] .immersive-translate-target-translation-block-wrapper {width:100%}",
  			"* {text-decoration:unset;}"
  		],
  		detectParagraphLanguage: true,
  		excludeSelectorsRegexes: {
  			"[class='inline-tabular'] > table > tbody > tr > td": [
  				"/^[A-Z0-9\\-_.]+$/g",
  				"^[0-9,]+\\s+tokens$",
  				"^Up to [a-zA-Z]*\\s+\\d*$",
  				"^(/[A-Z0-9\\-_.]+)+$"
  			]
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "producthunt",
  		matches: [
  			"www.producthunt.com"
  		],
  		excludeSelectors: [
  			".styles_extraInfo__Xs_5Y",
  			"[data-test=\"show-more-shoutouts-button\"]",
  			".styles_buttons__kKy_S",
  			".styles_count___6_8F"
  		],
  		excludeMatches: [
  			"https://www.producthunt.com/stories/*"
  		],
  		globalStyles: {
  			"h5 + p": "height:unset;",
  			".noOfLines-1,.noOfLines-2,.noOfLines-3,.styles_noOfLines-2__k_Ta_,[data-test=\"post-name-481116\"]": "-webkit-line-clamp:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "proko",
  		matches: [
  			"www.proko.com"
  		],
  		excludeSelectors: [
  			".proko-preview-statistic-wrap",
  			".lesson-instructors-wrap",
  			".proko-comments-item-title",
  			".proko-comments-item-vote-wrap",
  			".course-card__details .border-outline075",
  			".category-subscribe"
  		],
  		injectedCss: [
  			".lesson-video-banner-skip,.lesson-title,.lesson-content,.course-card__details {height:unset!important;overflow:scroll;}",
  			"[class*='clamp'],.course-card__description{-webkit-line-clamp:unset!important;overflow:unset;}",
  			"proko-button{z-index:1;}",
  			".truncate {white-space:unset;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "promptingguide",
  		matches: [
  			"www.promptingguide.ai"
  		],
  		selectors: [
  			"article",
  			"li"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "pubmed",
  		matches: [
  			"pubmed.ncbi.nlm.nih.gov",
  			"pubmed*.pubmed*",
  			"*.ncbi.nlm.nih.gov"
  		],
  		excludeSelectors: [
  			".docsum-journal-citation",
  			".citation-part",
  			".docsum-authors",
  			".top-wrapper",
  			".article-source",
  			".citation-doi",
  			".identifiers",
  			".cite",
  			".share",
  			".arrow-link",
  			".multiple-results-actions",
  			".sort-dropdown .option-label",
  			".display-options .button-label",
  			".actions-buttons.sidebar",
  			".title-copy",
  			"#Scholarscope_HighlightContent",
  			"#Scholarscope_HighlightContent span"
  		],
  		extraBlockSelectors: [
  			".mixed-citation"
  		],
  		excludeMatches: [
  			"*.ncbi.nlm.nih.gov/*.pdf",
  			"pubmed*.pubmed*/*.pdf"
  		],
  		injectedCss: [
  			"#Scholarscope_HighlightOrigin > p font,#Scholarscope_HighlightContent > p font {display: inline!important;}",
  			"#Scholarscope_HighlightOrigin > p font br,#Scholarscope_HighlightContent > p font br {display: none!important;}",
  			".title-translate {display:block;}",
  			".immersive-translate-target-inner br{display:none;}",
  			".immersive-translate-target-wrapper {content-visibility:auto;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "pubs.acs.org",
  		matches: [
  			"pubs.acs.org"
  		],
  		excludeSelectors: [
  			".articleHeaderDropzone2",
  			"header"
  		],
  		excludeMatches: [
  			"pubs.acs.org/doi/pdf*"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "pubs.rsc.org",
  		matches: [
  			"pubs.rsc.org"
  		],
  		stayOriginalSelectors: [
  			"[class*='eqn']"
  		],
  		excludeMatches: [
  			"https://pubs.rsc.org/*/articlepdf/*"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "pytorch",
  		matches: [
  			"pytorch.org"
  		],
  		excludeSelectors: [
  			".with-down-arrow",
  			".hello-bar",
  			"[data-cta='join']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "qidian",
  		matches: [
  			"www.qidian.com"
  		],
  		extraBlockSelectors: [
  			".type-list a"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "qqMail",
  		matches: [
  			"*.mail.qq.com"
  		],
  		excludeSelectors: [
  			".xmail-cmp-account"
  		],
  		globalStyles: {
  			".mail-list-page-wide-item": "height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "quantinsti",
  		matches: [
  			"quantra.quantinsti.com"
  		],
  		excludeSelectors: [
  			"#vjs_video_3",
  			"#vjs_video_3 *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "quark",
  		matches: [
  			"pan.quark.*"
  		],
  		excludeSelectors: [
  			".video-container",
  			".video-container *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "queenslibrary.org",
  		matches: [
  			"queenslibrary.org"
  		],
  		excludeSelectors: [
  			"#Web-QBPL-Menu"
  		],
  		injectedCss: [
  			"font.notranslate { all: unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "quora",
  		matches: [
  			"*.quora.com",
  			"quora.com"
  		],
  		excludeSelectors: [
  			".dom_annotate_multifeed_bundle_AskQuestionPromptBundle",
  			".dom_annotate_feed_switcher",
  			"[class='q-box qu-py--small qu-color--gray_light']",
  			"[class='q-box spacing_log_answer_header']",
  			"[class='q-box qu-flex--auto']",
  			"[class='q-text qu-dynamicFontSize--small qu-mt--small qu-color--gray_light qu-passColorToLinks']",
  			".AnswerFooter___StyledFlex-sc-2xbo88-0",
  			"[class='q-box qu-mb--small']",
  			"button.q-click-wrapper",
  			"[class='q-text qu-dynamicFontSize--tiny qu-pb--tiny qu-mt--small qu-color--gray_light qu-passColorToLinks']",
  			"[class='q-text qu-dynamicFontSize--tiny qu-mt--small qu-color--gray_light qu-passColorToLinks']",
  			".qt_read_more",
  			"[class='q-flex qu-alignItems--flex-start']",
  			"[class='q-box qu-pl--tiny']",
  			".qu-zIndex--action_bar"
  		],
  		globalStyles: {
  			".qu-truncateLines--3": "-webkit-line-clamp: unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "react",
  		matches: [
  			"react.dev"
  		],
  		injectedCss: [
  			"[class*='h-\\[40px\\]'] {height: unset !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "read.amazon",
  		matches: [
  			"read.amazon.com"
  		],
  		extraInlineSelectors: [
  			"span.kg-a11y-rel[role=text]"
  		],
  		injectedCss: [
  			"font { color:#333!important; white-space: pre-wrap;}",
  			"p > font { position:absolute;left:0;right:0; }",
  			".kg-a11y-rel { background:white!important; }"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "readwise",
  		matches: [
  			"read.readwise.io"
  		],
  		selectors: [
  			"div[class^='_titleRow_']",
  			"#document-text-content"
  		],
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "realpython",
  		matches: [
  			"realpython.com"
  		],
  		selectors: [
  			"h1",
  			"h2",
  			".my-0",
  			".my-1",
  			".article-body",
  			"table-of-contents",
  			"#disqus_recommendations"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "rebang",
  		matches: [
  			"rebang.today"
  		],
  		globalStyles: {
  			".multirow-ellipsis-3": "-webkit-line-clamp:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "reddit",
  		matches: [
  			"*.reddit.com/*"
  		],
  		selectors: [
  			"#search-results-tab-slot",
  			"h1",
  			".PostHeader__post-title-line",
  			"[data-click-id=body] h3",
  			"[data-click-id=background] h3",
  			"[data-testid=comment]",
  			"[data-adclicklocation='title'] h3",
  			"[data-testid='post-title-text']",
  			"[data-testid=search-subreddit-desc-text]",
  			"[slot=comment]",
  			"[data-adclicklocation=media]",
  			".PostContent",
  			".post-content",
  			".Comment__body",
  			"faceplate-batch .md",
  			"[slot=text-body]",
  			"p.title > a",
  			"[role=main] .md-container",
  			"#-post-rtjson-content",
  			".RichTextJSON-root",
  			"[slot='title']",
  			".room-message-text",
  			"[source=re_reddit] div > a.text-neutral-content-weak",
  			"#response-container",
  			"#streaming-response",
  			"[noun='recommendation']",
  			"#subgrid-container h1, #subgrid-container h2",
  			".i18n-subreddit-description",
  			"#response-container_streaming",
  			"search-telemetry-tracker > a.text-neutral-content-strong",
  			"span[data-testid='guides-title']",
  			".rendererd-rtjson > p",
  			"community-recommendation p"
  		],
  		excludeSelectors: [
  			".text-neutral-content-weak"
  		],
  		excludeMatches: [
  			"https://www.reddit.com/r/*/wiki/*",
  			"https://www.reddit.com/settings/*",
  			"https://www.reddit.com/message/sent/*"
  		],
  		globalStyles: {
  			"div.XPromoBottomBar": "display:none",
  			"[class*='line-clamp']": "-webkit-line-clamp: unset"
  		},
  		paragraphMinTextCount: 5,
  		paragraphMinWordCount: 2,
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "redditList",
  		matches: [
  			"https://www.reddit.com/r/*/comments/*/*",
  			"https://www.reddit.com/",
  			"https://www.reddit.com/hot/",
  			"https://www.reddit.com/new/",
  			"https://www.reddit.com/top/"
  		],
  		selectors: [
  			"h1",
  			".PostHeader__post-title-line",
  			"[data-click-id=body] h3",
  			"[data-click-id=background] h3",
  			"[data-testid=comment]",
  			"[data-adclicklocation='title'] h3",
  			"[data-adclicklocation=media]",
  			"[data-testid='post-title-text']",
  			".PostContent",
  			".post-content",
  			".Comment__body",
  			"faceplate-batch .md",
  			"[slot=comment]",
  			".RichTextJSON-root",
  			"[slot=title]",
  			"[slot=text-body]",
  			"p.title > a",
  			"[role=main] .md-container",
  			".room-message-text",
  			".crosspost-title",
  			"div.md[id^=t3_]",
  			".pt-md"
  		],
  		excludeSelectors: [
  			"shreddit-comment-action-row",
  			"faceplate-hovercard"
  		],
  		excludeMatches: [
  			"https://www.reddit.com/r/*/wiki/*"
  		],
  		globalStyles: {
  			"div.XPromoBottomBar": "display:none",
  			"[class*='line-clamp']": "-webkit-line-clamp: unset",
  			"a.pointer-events-none": "pointer-events: unset",
  			"a.absolute.inset-0": "inset: unset !important;"
  		},
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "remove_em",
  		matches: [
  			"git-scm.com",
  			"models.com"
  		],
  		stayOriginalSelectors: [
  			"em"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "researchgate",
  		matches: [
  			"www.researchgate.net"
  		],
  		excludeSelectors: [
  			".nova-legacy-v-publication-item__meta-data",
  			".nova-legacy-v-publication-item__person-list",
  			".js-authors-list"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "reuters",
  		matches: [
  			"www.reuters.com"
  		],
  		excludeSelectors: [
  			"[promotext]",
  			"[data-testid=Leaderboard]",
  			"[data-testid=HomeTickerV2]",
  			"[data-testid=SiteFooter]",
  			"[class^=refinitiv-promo-bar__container]",
  			"[data-testid=ResponsiveAdSlot]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "rmit",
  		matches: [
  			"www.rmit.edu.au"
  		],
  		injectedCss: [
  			".colfeature-content{height:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "rtve",
  		matches: [
  			"www.rtve.*"
  		],
  		injectedCss: [
  			".errorHead * {font-size: 3.2rem!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ru-sites",
  		matches: [
  			"www.wildberries.ru",
  			"www.ozon.ru"
  		],
  		excludeSelectors: [
  			".product-card__tip--sale",
  			".price,[class^=priceWrap]",
  			".j-big-media-placements-block",
  			"[class^='priceBlock'],[class^='product-card__rating'],[class^=productLinePrice],[class^=sizesList]",
  			".c35_3_16-a0,.pdp_jb1,.b5_6_3-a3,.tsHeadline600Large,.tsHeadline500Medium"
  		],
  		injectedCss: [
  			".product-page,.comment-card,.comment-card__message {block-size:unset!important;}",
  			"[class^=supplierName],[class^=supplierName] * {white-space:unset;}",
  			"[class*=categoryLinkNav] {width:min-content;}",
  			".bq03_5_3-a6,.bq03_5_3-a5,.a2p5_6_9-a0 {-webkit-line-clamp:unset!important;height:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "runoob",
  		matches: [
  			"www.runoob.com"
  		],
  		excludeSelectors: [
  			".example_code"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "sakura",
  		matches: [
  			"www.sakura.fm"
  		],
  		injectedCss: [
  			".immersive-translate-target-wrapper, .immersive-translate-target-translation-block-wrapper, .immersive-translate-target-inner span { opacity: 1 !important; }"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "scholar.cnki.net",
  		matches: [
  			"scholar.cnki.net"
  		],
  		injectedCss: [
  			".result .searchItem {height: auto!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "science",
  		matches: [
  			"www.science.org"
  		],
  		excludeSelectors: [
  			".core-self-citation",
  			".contributors"
  		],
  		stayOriginalSelectors: [
  			".open-in-viewer"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "sciencedirect",
  		matches: [
  			"www.sciencedirect.com"
  		],
  		excludeSelectors: [
  			".bibliography",
  			".author-group"
  		],
  		stayOriginalSelectors: [
  			"span.display",
  			"span.math"
  		],
  		extraBlockSelectors: [
  			"span.display",
  			"span.captions",
  			"span[id^=cap]"
  		],
  		excludeMatches: [
  			"www.sciencedirect.com/*/pdf/download/*"
  		],
  		injectedCss: [
  			"h2 {font-size:unset;}",
  			".u-clamp-2-lines {-webkit-line-clamp:unset!important;}",
  			".immersive-translate-target-wrapper {content-visibility:auto;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "scmp",
  		matches: [
  			"www.scmp.com"
  		],
  		globalStyles: {
  			".topic__article-list": "height: unset;",
  			".adverisers__adveriser": "height: unset;",
  			".advertiser__content": "height: unset;",
  			".content-title__link": "display:unset;overflow:unset;-webkit-line-clamp:unset;",
  			".title__text": "max-height:unset; -webkit-line-clamp:unset;",
  			".news-list-item__news-title": "max-height:unset; -webkit-line-clamp:unset;",
  			"a[class*='link'] > .link__headline": "max-height:unset; -webkit-line-clamp:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "scrimba",
  		matches: [
  			"scrimba.com"
  		],
  		injectedCss: [
  			"[class*='trunc'] {-webkit-line-clamp: unset !important;}",
  			".tile {overflow: scroll;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "sdk-cooperate",
  		matches: [
  			"pandaily.com"
  		],
  		excludeSelectors: [
  			"[data-discover]",
  			"header"
  		],
  		extraInlineSelectors: [
  			"h3"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "section.blog.naver.com",
  		matches: [
  			"section.blog.naver.com"
  		],
  		excludeSelectors: [
  			".comments",
  			".time"
  		],
  		extraBlockSelectors: [
  			".item",
  			".heading a",
  			".info_find a"
  		],
  		globalStyles: {
  			".text,.title_post,.text_post,p,strong,div": "-webkit-line-clamp:unset;max-height:unset;height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "seekingalpha",
  		matches: [
  			"seekingalpha.com/article/*",
  			"seekingalpha.com/news/*"
  		],
  		selectors: [
  			"[data-test-id=card-container]",
  			"[data-test-id=comments-section]"
  		],
  		excludeSelectors: [
  			"[data-test-id=post-page-meta]",
  			"header > div:first-child"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "seller-tiktok",
  		matches: [
  			"seller.tiktok.com",
  			"seller-my.tiktok.com",
  			"affiliate.tiktok*.com",
  			"seller.*.tiktokglobalshop.com",
  			"seller.tiktokshopglobalselling.com"
  		],
  		excludeSelectors: [
  			".chatd-message-userName"
  		],
  		injectedCss: [
  			"[data-tid=m4b_overflow_text_multiply] {height:unset!important;-webkit-line-clamp:unset!important;}",
  			"[class^=replyText],[class^=productItemInfo],[class^=reviewText] {height:unset!important;-webkit-line-clamp:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "sentry",
  		matches: [
  			"docs.sentry.io"
  		],
  		extraInlineSelectors: [
  			".term-wrapper",
  			"span.description"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "service-now",
  		matches: [
  			"*.service-now.com"
  		],
  		selectors: [
  			"article",
  			".email-content",
  			"section"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "shangpaAcademy",
  		matches: [
  			"shangpa-academy.mn.co"
  		],
  		excludeSelectors: [
  			".mighty-video-player-container",
  			".mighty-video-player-container *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "shonenjumpplus",
  		matches: [
  			"shonenjumpplus.com",
  			"viewer.heros-web.com",
  			"comic-days.com",
  			"www.corocoro.jp",
  			"tonarinoyj.jp",
  			"rimacomiplus.jp",
  			"kuragebunch.com",
  			"comic-gardo.com",
  			"ichicomi.com",
  			"rookie.shonenjump.com"
  		],
  		selectors: [
  			"img.page-image.js-page-image"
  		],
  		injectedCss: [
  			"[class^='Original_section_title'] {overflow:hidden!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "shopee",
  		matches: [
  			"seller.shopee.*",
  			"shopee.*"
  		],
  		injectedCss: [
  			".WBVL_7,.ellipsis-content {-webkit-line-clamp:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "skillshare",
  		matches: [
  			"www.skillshare.com"
  		],
  		excludeSelectors: [
  			".vjs-text-track-display",
  			".vjs-text-track-display *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "skinstore",
  		matches: [
  			"www.skinstore.com"
  		],
  		excludeSelectors: [
  			".responsiveFlyoutMenu_levelOneLink"
  		],
  		paragraphMinTextCount: 4,
  		paragraphMinWordCount: 2,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "skool",
  		matches: [
  			"www.skool.com"
  		],
  		excludeSelectors: [
  			"[class^=styled__ShowMore]",
  			"[class^=styled__UserNameText]",
  			"[class^=styled__GroupNameWrapper]",
  			"[class^=styled__ButtonWrapper]",
  			"[class^=styled__LeaderboardsPreviewTitle]",
  			"[class^=styled__ExpandRepliesWrapper]",
  			"[class^=styled__GroupFeedLinkLabel]",
  			"[class^=styled__HeaderLinks]",
  			"[class^=styled__RecentActivityLabel]",
  			"[class^=styled__PostedDate]",
  			"[class^=styled__MemberInfo]",
  			"[class^=styled__UserRoleTag]",
  			"[class^=styled__DateAndLabelWrapper]",
  			"[class^=styled__PinnedOverlay]",
  			"[class^=styled__CommentsCount]",
  			"[class^=styled__LastMessageTime]",
  			"[class^=styled__LikeLabel]",
  			"[class^=styled__TypographyWrapper]",
  			"[class^=styled__MemberPercentage]",
  			"[class^=styled__LevelBlockTitle]"
  		],
  		injectedCss: [
  			".erGJuk {max-height:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "slack",
  		matches: [
  			"*.slack.com"
  		],
  		selectors: [
  			".p-rich_text_block",
  			".p-message_pane__foreword",
  			".c-alert__message",
  			"[data-qa=message_attachment_text]"
  		],
  		stayOriginalSelectors: [
  			"[data-qa=emoji]"
  		],
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "slideslive",
  		matches: [
  			"slideslive.com"
  		],
  		excludeSelectors: [
  			".slp__video",
  			".slp__video *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "smokingbehindthesupermarket.com",
  		matches: [
  			"smokingbehindthesupermarket.com"
  		],
  		selectors: [
  			"div.post-single-content#content"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "smzdm",
  		matches: [
  			"www.smzdm.com"
  		],
  		excludeSelectors: [
  			".z-highlight",
  			".feed-block-info",
  			".z-feed-foot",
  			".feed-block-descripe",
  			"#J_column_tab_box",
  			".crumbs"
  		],
  		globalStyles: {
  			".feed-block-title": "height:unset"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "sobqg",
  		matches: [
  			"www.sobqg.com/book/*"
  		],
  		excludeSelectors: [
  			"#hot .g_book > span"
  		],
  		injectedCss: [
  			"#volumes { display: flex; flex-wrap: wrap; }",
  			"a.ell { white-space: normal !important; overflow: visible !important; }",
  			"#hot .g_book > a > h3 { white-space: normal; overflow: visible; max-height: none; -webkit-line-clamp: none; }",
  			"#hot .g_book { height: 330px; }"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "soundcloud",
  		matches: [
  			"soundcloud.com"
  		],
  		excludeSelectors: [
  			".searchTitle__textContent",
  			".searchOptions__container",
  			".compactTrackListItem__additional",
  			".soundTitle__tagContainer",
  			".searchResultGroupHeading",
  			".sc-ministats-group",
  			".compactTrackList__moreLink",
  			".sound__soundActions"
  		],
  		injectedCss: [
  			".compactTrackListItem {height: unset !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "sp-codeSites",
  		matches: [
  			"docs.wxwidgets.org"
  		],
  		excludeSelectors: [
  			".doxygen-awesome-fragment-wrapper"
  		],
  		injectedCss: [
  			".textblock p > font{display:flex;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "sp.nexusmods",
  		injectedCss: [
  			"[class*='line-clamp'] {-webkit-line-clamp:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "spankbang",
  		matches: [
  			"https://spankbang.com/*"
  		],
  		excludeSelectors: [
  			".stats",
  			".thumb"
  		],
  		extraBlockSelectors: [
  			".searches > a",
  			".tag > a",
  			".extra > a",
  			".positions > li"
  		],
  		globalStyles: {
  			".video-item > a": "white-space:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "sphinx-rtd-theme",
  		selectors: [
  			".wy-nav-side"
  		],
  		excludeSelectors: [
  			"header[default-translate]",
  			"footer[default-translate]",
  			"dt"
  		],
  		stayOriginalSelectors: [
  			".math.notranslate"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "stackoverflow",
  		matches: [
  			"stackoverflow.com",
  			"*.stackexchange.com",
  			"superuser.com",
  			"askubuntu.com",
  			"serverfault.com"
  		],
  		excludeSelectors: [
  			".votecell",
  			"header",
  			"#footer",
  			"#question-header + div",
  			"div.postcell div.mb0",
  			"div[id^=comments-link-]",
  			"#answers-header",
  			".new-post-login",
  			".form-submit",
  			"a[href='/questions/ask']",
  			"#left-sidebar",
  			"a.comment-user",
  			"span.comment-date",
  			"div.s-prose.js-post-body + div",
  			".bottom-notice",
  			"div[data-campaign-name=stk]",
  			".s-post-summary--stats",
  			".s-post-summary--meta"
  		],
  		extraBlockSelectors: [
  			"span.comment-copy"
  		],
  		globalStyles: {
  			".s-post-summary--content-excerpt": "-webkit-line-clamp:unset;"
  		},
  		paragraphMinTextCount: 4,
  		paragraphMinWordCount: 2,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "startme",
  		matches: [
  			"start.me"
  		],
  		selectors: [
  			".rss-article__title",
  			".rss-articles-list__article-link",
  			".rss-showcase__title",
  			".rss-showcase__text"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "starz",
  		matches: [
  			"www.starz.com"
  		],
  		excludeSelectors: [
  			"starz-player",
  			"starz-player *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "statista",
  		matches: [
  			"www.statista.com"
  		],
  		globalStyles: {
  			".itemContent__text": "height:unset;max-height:unset;",
  			".itemContent__subline": "height:unset;max-height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "steamcommunity",
  		matches: [
  			"steamcommunity.com"
  		],
  		excludeSelectors: [
  			".forum_paging",
  			".forum_topic_reply_count",
  			".forum_topic_lastpost",
  			".forum_topic_award_count",
  			".discussion_search_pagingcontrols",
  			".found_helpful,.vote_header,.date_posted,.early_access_review,.apphub_CardContentAuthorBlock"
  		],
  		extraBlockSelectors: [
  			".apphub_sectionTab"
  		],
  		injectedCss: [
  			".forum_topic,.rightbox_list_option,.appHubShortcut {height: unset;}",
  			".forum_topic_name {white-space:normal;line-height: 1.25rem; padding: 6px 20px 0 0;}",
  			".forum_topic_op {clear: left; padding: 0 0 6px 2rem;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "steampoweredApp",
  		matches: [
  			"store.steampowered.com/app/*"
  		],
  		excludeSelectors: [
  			"#global_actions",
  			"#store_controls",
  			"#foryou_tab",
  			"[class*=persona]",
  			"a.btn_medium",
  			".persona_name",
  			".hours.ellipsis",
  			".checkcol",
  			".postedDate",
  			".dev_row .summary",
  			".already_in_library",
  			".game_header_image_ctn .grid_content",
  			".ds_flag.ds_wishlist_flag",
  			".early_access_review.tooltip",
  			".communitylink_achievement_images",
  			".user_reviews_summary_row.summary",
  			".review_award_ctn",
  			".add_to_wishlist_area",
  			".next_in_queue_content",
  			".glance_tags.popular_tags",
  			".game_purchase_action",
  			".vote_button_ctn",
  			"#VoteUpDownBtnCtn",
  			"#footer",
  			"#ViewAllReviewssummary",
  			".user_reviews",
  			".ReviewContentCtn .title",
  			".author_counts,.control_block,.vote_info"
  		],
  		extraInlineSelectors: [
  			".pulldown"
  		],
  		globalStyles: {
  			".game_description_snippet": "max-height:unset; overflow: scroll;",
  			".game_purchase_area_friends_want": "height: auto; padding-bottom: 6px;",
  			".div.early_access_banner": "height: 84px",
  			".franchise_notice > *": "height: 84px"
  		},
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "substack",
  		matches: [
  			"*.substack.com",
  			"newsletter.rootsofprogress.org"
  		],
  		selectors: [
  			"link[href^='https://substackcdn.com/bundle/'][rel=preload]"
  		],
  		excludeSelectors: [
  			".publication-footer",
  			".subscribe-footer",
  			".main-menu",
  			".navbar-title-link",
  			"[data-testid='navbar']",
  			".navbar-title",
  			".captioned-button-wrap",
  			".subscription-widget-wrap",
  			".tweet-header",
  			".tweet-link-bottom",
  			".expanded-link",
  			".meta-subheader",
  			".comment-meta",
  			".comment-actions"
  		],
  		extraBlockSelectors: [
  			".reader2-post-title",
  			".tweet-link-top",
  			".tweet-link-bottom",
  			".expanded-link"
  		],
  		globalStyles: {
  			".reader2-clamp-lines": "max-height: unset; -webkit-line-clamp: unset;",
  			"[class*='clamp-']": "max-height: unset; -webkit-line-clamp:unset;",
  			".blurb-text": "max-height: unset;",
  			".comment-body": "max-height: unset;",
  			"[class*='_hideSelectio']": "overflow: scroll;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "svelte",
  		matches: [
  			"svelte.dev/docs/*",
  			"learn.svelte.dev"
  		],
  		selectors: [
  			".text"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "swaycloud",
  		matches: [
  			"sway.cloud.microsoft"
  		],
  		injectedCss: [
  			".text_wrapper ul li {max-height:unset!important;}",
  			".container {overflow:scroll;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "tandfonline",
  		matches: [
  			"*.tandfonline.com"
  		],
  		extraInlineSelectors: [
  			"span.off-screen"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "taobao",
  		matches: [
  			"*.taobao.com"
  		],
  		excludeSelectors: [
  			".text-price"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "tass",
  		matches: [
  			"tass.ru"
  		],
  		globalStyles: {
  			"#__next": "font-size: 19px;line-height:28px;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "teacherspayteachers",
  		matches: [
  			"www.teacherspayteachers.com/browse/*"
  		],
  		injectedCss: [
  			".ProductRowCard-module__cardTitleLink--YPqiC { display:unset !important; }"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "team",
  		matches: [
  			"teams.live.com",
  			"teams.microsoft.com"
  		],
  		excludeSelectors: [
  			".ui-box .ui-box[class='ui-box']",
  			"[data-tid='author']",
  			".fui-ChatMessageCompact__author",
  			".ui-box .ui-box[class='ui-box'] *"
  		],
  		stayOriginalSelectors: [
  			"span[title][style='min-width: 20px; height: 20px;']"
  		],
  		extraInlineSelectors: [
  			"[data-tid='closed-caption-text']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ted",
  		matches: [
  			"www.ted.com"
  		],
  		excludeSelectors: [
  			"#video",
  			"#video *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "telegram",
  		matches: [
  			"web.telegram.org/z/*",
  			"web.telegram.org/a/*",
  			"web.telegram.org/k/*",
  			"web.telegram.org/k/"
  		],
  		selectors: [
  			".text-content",
  			".message",
  			".reply-markup-button-text",
  			".bot-commands-list-element-description",
  			"[class*='tabs-tab page-password active']",
  			"#auth-qr-form"
  		],
  		excludeSelectors: [
  			".time",
  			".peer-title",
  			".document-wrapper",
  			".message.spoilers-container custom-emoji-element"
  		],
  		extraBlockSelectors: [
  			".message.spoilers-container em",
  			".message.spoilers-container strong"
  		],
  		isTranslateTitle: false,
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "termynal",
  		selectors: [
  			"link[href*='termynal.css']"
  		],
  		stayOriginalSelectors: [
  			".termy"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "thaipbs",
  		matches: [
  			"www.thaipbs.*",
  			"players.brightcove.net"
  		],
  		excludeSelectors: [
  			".video-container",
  			".video-container *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "theatlantic",
  		matches: [
  			"www.theatlantic.com",
  			"https://mashable.com/*"
  		],
  		excludeSelectors: [
  			"footer:last-of-type",
  			"nav",
  			"header div.subtitle-2.w-full"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "thehackernews",
  		matches: [
  			"thehackernews.com"
  		],
  		excludeSelectors: [
  			"span#blog-pager-older-link",
  			"span.h-datetime"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "thehill",
  		matches: [
  			"thehill.com"
  		],
  		excludeSelectors: [
  			"div.featured-cards__byline",
  			"div.list-item__meta",
  			".tags__item",
  			"div.extended-scroll__header",
  			".submitted-by",
  			".site-header--has-alert-banner",
  			".homepage__container__opinion__item__byline",
  			".homepage__container__header",
  			".archive__item__meta"
  		],
  		injectedCss: [
  			".most-popular-item { max-height: unset !important; }",
  			".most-popular-item__link { -webkit-line-clamp: unset !important; }"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "themotionmagic",
  		matches: [
  			"player.hotmart.com"
  		],
  		selectors: [
  			"iframe[src*='player.hotmart.com']"
  		],
  		excludeSelectors: [
  			"#immersive-translate-caption-window",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "theverge",
  		matches: [
  			"www.theverge.com"
  		],
  		excludeSelectors: [
  			".k8dtcj0",
  			"._2xqpwjf._2xqpwj0"
  		],
  		extraBlockSelectors: [
  			"[role='article'] p"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "threads",
  		matches: [
  			"www.threads.net"
  		],
  		excludeSelectors: [
  			".x6s0dn4.x40hh3e.xrvj5dj.xxfwaov",
  			".x6s0dn4.x78zum5",
  			".xpvyfi4.x1xdureb.x1agbcgv",
  			".xpvyfi4.x1npkx4u.x1ms6mhf"
  		],
  		stayOriginalSelectors: [
  			".x1rg5ohu",
  			".xat24cr.xdj266r a"
  		],
  		globalStyles: {
  			"span,.x569fbc": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "threejs-journey",
  		matches: [
  			"threejs-journey.com"
  		],
  		excludeSelectors: [
  			".video-area",
  			".video-area *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "tiktok",
  		matches: [
  			"https://www.tiktok.com/*/video/*",
  			"https://www.tiktok.com/*"
  		],
  		excludeSelectors: [
  			"[class*='DivInfoPosition']",
  			"[data-e2e*='-count']",
  			"[data-e2e='nav-foryou']",
  			"[data-e2e*='view-more']",
  			"[data-e2e*='comment-reply']",
  			"[data-e2e*='comment-username']",
  			"[class*='DivCommentSubContentSplitWrapper']",
  			"[class*='DivViewRepliesContainer']",
  			"[class*='DivInfoPosition'] *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "time",
  		matches: [
  			"time.com"
  		],
  		excludeSelectors: [
  			".date-and-duration"
  		],
  		globalStyles: {
  			".headline": "-webkit-line-clamp:unset;overflow:unset;height:unset;",
  			h3: "-webkit-line-clamp:unset;overflow:unset;",
  			p: "-webkit-line-clamp:unset;overflow:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "tinytask",
  		matches: [
  			"https://www.tinytask.net"
  		],
  		globalStyles: {
  			"table > tbody > tr > td > center > table > tbody > tr > td > ul > li": "height: 100%"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "toneking",
  		matches: [
  			"www.toneking.com"
  		],
  		injectedCss: [
  			"ul li {text-wrap:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "trade",
  		matches: [
  			"axiom.trade"
  		],
  		extraInlineSelectors: [
  			"[class^=tweet-body_root]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "transformer-circuits.pub",
  		matches: [
  			"transformer-circuits.pub"
  		],
  		stayOriginalSelectors: [
  			"d-cite"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "translation-font-size-unset",
  		matches: [
  			"m.yxlady.com",
  			"web3.fireverseai.com"
  		],
  		injectedCss: [
  			".immersive-translate-target-wrapper, .immersive-translate-target-translation-block-wrapper, .immersive-translate-target-inner { font-size: unset; }"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "tripadvisor",
  		matches: [
  			"www.tripadvisor.com"
  		],
  		injectedCss: [
  			".ZTpaU,.alvrA {-webkit-line-clamp:unset;}"
  		],
  		paragraphMinTextCount: 4,
  		paragraphMinWordCount: 2,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "tubitv",
  		matches: [
  			"tubitv.com"
  		],
  		excludeSelectors: [
  			".vjs-text-track-display",
  			".vjs-text-track-display *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "tumblr",
  		matches: [
  			"www.tumblr.com"
  		],
  		selectors: [
  			"article h1",
  			"article > header + div",
  			"[data-testid=notes-root] p",
  			"div.k31gt",
  			"p",
  			"article ul",
  			"article h2",
  			"article h3",
  			"article h4",
  			"article h5",
  			"article h6",
  			"article blockquote",
  			"article ol"
  		],
  		excludeSelectors: [
  			"div.fAAi8",
  			"div.wvu3V"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "tv.adobe",
  		matches: [
  			"https://*.tv.adobe.com"
  		],
  		excludeSelectors: [
  			".mpc-player",
  			".mpc-player *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "tver",
  		matches: [
  			"tver.jp"
  		],
  		excludeSelectors: [
  			"div[class*=\"player_container\"]",
  			"#immersive-translate-caption-window",
  			"div[class*=\"player_container\"] *",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "twitch",
  		matches: [
  			"www.twitch.tv"
  		],
  		excludeSelectors: [
  			".persistent-player",
  			".chat-line__username-container",
  			".chat-line__no-background span[aria-hidden=true]",
  			"[data-a-target=animated-channel-viewers-count],.live-time"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "twitter",
  		matches: [
  			"twitter.com",
  			"mobile.twitter.com",
  			"tweetdeck.twitter.com",
  			"pro.twitter.com",
  			"platform.twitter.com/embed*",
  			"x.com",
  			"mobile.x.com",
  			"tweetdeck.x.com",
  			"pro.x.com",
  			"platform.x.com/embed*"
  		],
  		selectors: [
  			"[data-testid='tweetText']",
  			"[style*='-webkit-line-clamp']",
  			".tweet-text",
  			"[data-testid='tweet'] [class='css-175oi2r r-13awgt0 r-eqz5dr r-iphfwy r-3o4zer r-ttdzmv']",
  			"[data-testid='tweet'] .css-175oi2r span",
  			".js-quoted-tweet-text",
  			"[data-testid='card.layoutSmall.detail'] > div:nth-child(2)",
  			"[data-testid='developerBuiltCardContainer'] > div:nth-child(2)",
  			"[data-testid='card.layoutLarge.detail'] > div:nth-child(2)",
  			"[data-testid='cellInnerDiv'] div[data-testid='UserCell'] > div> div:nth-child(2)",
  			"[data-testid='UserDescription']",
  			"[data-testid='HoverCard'] div[dir=auto]",
  			"[data-testid='HoverCard'] span[dir=auto]",
  			"[data-testid='HoverCard'] [role='dialog'] div[dir=ltr]",
  			"[data-testid='birdwatch-pivot'] div[dir=ltr]",
  			"[data-testid='twitterArticleReadView']",
  			"[aria-label='Grok']",
  			"[role=dialog]",
  			"[class='css-175oi2r r-1awozwy r-13awgt0 r-1rnoaur r-13qz1uu']",
  			"[class='css-175oi2r r-kemksi r-1kqtdi0 r-1q9bdsx r-1phboty r-rs99b7 r-1udh08x r-13qz1uu']",
  			"[class='css-175oi2r r-uef6q5 r-dnmrzs r-97e31f r-13qz1uu r-13awgt0 r-dgnwoc r-1me0s30 r-t3sqpr r-1dqxon3']",
  			"[class='css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0']",
  			"[data-testid='inlinePrompt']",
  			"span[class='css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3 r-n6v787 r-1cwl3u0']",
  			"[data-testid=primaryColumn] [class='css-175oi2r r-kzbkwu r-3pj75a'] > div > span[class='css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3']"
  		],
  		excludeSelectors: [
  			"[aria-describedby][role=button]",
  			"header",
  			"[data-testid='radioGroupplayback_rate'] div",
  			"[data-testid='userFollowIndicator']",
  			"[class='css-901oao r-14j79pv r-37j5jr r-n6v787 r-16dba41 r-1cwl3u0 r-bcqeeo r-qvutc0']",
  			"[class='css-175oi2r r-1wbh5a2 r-dnmrzs']",
  			"[aria-label=Grok] button",
  			"[aria-label=Grok] [style*='rgb(89, 93, 98)']",
  			"[aria-label=Grok] .r-uho16t",
  			"[data-testid=User-Name]",
  			"[data-testid=socialContext]",
  			"[data-testid=tweet-text-show-more-link]",
  			"[aria-label=Grok] [class='css-175oi2r r-1habvwh r-vqp9x9 r-1q9bdsx r-1loqt21 r-9njtsq r-1wtj0ep r-nsbfu8 r-xbdcod r-13c7hvr'] > div:last-child",
  			"[role='tab']",
  			"[data-testid=hoverCardParent] [role=menuitem]",
  			"[data-testid=sidebarColumn]",
  			"h2[role=heading]",
  			"[class='css-175oi2r r-1awozwy r-18u37iz r-1wtj0ep r-6gpygo'],[class='css-175oi2r r-1d09ksm r-18u37iz r-1wbh5a2 r-1471scf'],[class='css-175oi2r r-1kbdv8c r-18u37iz r-1wtj0ep r-1ye8kvj r-1s2bzr4']",
  			".imt-caption-container *",
  			"[data-testid=videoComponent]"
  		],
  		stayOriginalSelectors: [
  			"[data-testid=\"tweetText\"] a",
  			"[data-testid='UserDescription'] a",
  			"[data-testid='HoverCard'] a",
  			"[data-testid='UserCell'] a",
  			"[data-testid='birdwatch-pivot'] a",
  			".DocsMarkdown--link-external-icon"
  		],
  		extraInlineSelectors: [
  			"[data-testid=\"tweetText\"] div.r-xoduu5",
  			"[data-testid=\"tweetText\"] span",
  			"[data-testid=\"UserDescription\"] div",
  			"[data-testid='HoverCard'] div[dir=auto] div",
  			"[data-testid='HoverCard'] span[dir=auto] div"
  		],
  		extraBlockSelectors: [
  			"[data-testid=\"tweetText\"] div.r-6koalj"
  		],
  		excludeMatches: [
  			"twitter.com/i/premium_sign_up",
  			"twitter.com/settings/subscription",
  			"twitter.com/jobs/*",
  			"x.com/i/premium_sign_up",
  			"x.com/settings/subscription",
  			"x.com/settings/account",
  			"x.com/jobs/*",
  			"x.com/*/tos*",
  			"x.com/*/privacy*",
  			"x.com/account/access*",
  			"x.com/i/account_analytics*",
  			"x.com/i/chat*",
  			"x.com/settings*"
  		],
  		injectedCss: [
  			"[data-testid='card.layoutLarge.detail'] > div:nth-child(2) {-webkit-line-clamp: unset!important;}",
  			"[data-testid='card.layoutSmall.detail'] > div:nth-child(2) {-webkit-line-clamp: unset!important;}",
  			"[data-testid='tweetText'],[style*='-webkit-line-clamp'] {-webkit-line-clamp: unset!important;}",
  			"[role=dialog] [style*='webkit-line-clamp'] {-webkit-line-clamp: unset!important;}",
  			".r-h9hxbl{width:unset;}",
  			"[aria-label=Grok] [data-testid=ScrollSnap-SwipeableList] [role=presentation] > div > div { max-height: unset !important; }",
  			".css-9pa8cd.imt-img {top: 50%!important;left: 50%!important;transform: translate(-50%, -50%)!important;position:absolute!important;height:unset!important;object-fit: cover !important;}"
  		],
  		paragraphMinTextCount: 2,
  		paragraphMinWordCount: 1,
  		blockMinTextCount: 0,
  		blockMinWordCount: 0,
  		isTranslateTitle: false,
  		observeUrlChange: false,
  		excludeSelectorsRegexes: {
  			"[data-testid=tweetText] span": [
  				"^[0-9a-zA-Z]{30,}$"
  			]
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "txt",
  		matches: [
  			"*://*/*.txt",
  			"file://*/*.txt"
  		],
  		selectors: [
  			"body > pre",
  			".transcripts > pre"
  		],
  		excludeSelectors: [
  			".api-code",
  			"pre.highlight.def",
  			"body"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "typora",
  		matches: [
  			"typora.io"
  		],
  		excludeSelectors: [
  			".tab-slider--nav"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ubuntu",
  		matches: [
  			"manpages.ubuntu.com"
  		],
  		selectors: [
  			"pre"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "ucdavis",
  		matches: [
  			"aggievideo.canvas.ucdavis.edu"
  		],
  		excludeSelectors: [
  			"[data-testid=\"video-player\"]",
  			"[data-testid=\"video-player\"] *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "udacity",
  		matches: [
  			"*.udacity.com"
  		],
  		excludeSelectors: [
  			".vjs-text-track-display",
  			".vjs-text-track-display *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "udemy",
  		matches: [
  			"*.udemy.com"
  		],
  		excludeSelectors: [
  			"[data-purpose='captions-cue-text']",
  			".shaka-text-container",
  			"[data-purpose='captions-cue-text'] *",
  			".shaka-text-container *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "uni-trier",
  		matches: [
  			"dblp.uni-trier.de"
  		],
  		selectors: [
  			"h1",
  			"h2",
  			".title",
  			".external",
  			"dd p"
  		],
  		excludeSelectors: [
  			".side-column"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "updraft",
  		matches: [
  			"updraft.cyfrin.io"
  		],
  		excludeSelectors: [
  			"#immersive-translate-caption-window",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "urlComment",
  		selectors: [
  			"meta[name='generator'][content^='Discourse']"
  		],
  		excludeSelectors: [
  			".username",
  			".post-infos",
  			".topic-category",
  			".topic-timeline",
  			".topic-map",
  			".topic-list-header",
  			".number",
  			".activity"
  		],
  		extraBlockSelectors: [
  			"header ol li a"
  		],
  		injectedCss: [
  			"header.d-header {height: 6em !important;}",
  			".topic-list .main-link .raw-topic-link > font {pointer-events:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "urplay",
  		matches: [
  			"urplay.se"
  		],
  		excludeSelectors: [
  			".jw-media",
  			".jw-media *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "uxtension",
  		matches: [
  			"www.uxento.io"
  		],
  		selectors: [
  			"[class='px-4 pb-4 text-sm leading-relaxed break-words text-white overflow-hidden']",
  			"[class='text-xs leading-relaxed break-words text-[#AAAAB9] mb-2 overflow-hidden']",
  			"[class='px-4 pb-4 text-sm leading-relaxed break-words text-white']",
  			"[class='text-xs leading-relaxed break-words text-[#AAAAB9] mb-2']",
  			"[class='flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip'] section",
  			"h2",
  			"article",
  			"article h2",
  			"article p"
  		],
  		excludeSelectors: [
  			"article div[class='flex justify-between items-center px-3']",
  			"article div[class='flex items-center gap-2 mb-2']",
  			"article div[class='flex justify-between items-center pr-4']",
  			"article div[class='px-3 pb-3 pt-1 grid grid-cols-2 gap-4']",
  			"article div[class='flex flex-wrap gap-1 mt-1']",
  			"article div[class='flex items-center gap-3 pr-12']"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "vaseven",
  		matches: [
  			"www.vaseven.com"
  		],
  		excludeSelectors: [
  			".et_pb_main_blurb_image"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "vdi-nachrichten",
  		matches: [
  			"www.vdi-nachrichten.com"
  		],
  		excludeSelectors: [
  			".header-menu__item > a",
  			".linkbar__item",
  			".header__button-group"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "vercel",
  		matches: [
  			"vercel.com"
  		],
  		excludeSelectors: [
  			"[class^=fade-in-words]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "viki",
  		matches: [
  			"www.viki.com"
  		],
  		excludeSelectors: [
  			".vjs-text-track-display",
  			".vjs-text-track-display *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "vimeo",
  		matches: [
  			"vimeo.com",
  			"training.leveleffect.com"
  		],
  		excludeSelectors: [
  			".vp-captions",
  			".vp-captions *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "visualstudioMarketplace",
  		matches: [
  			"marketplace.visualstudio.com"
  		],
  		excludeSelectors: [
  			".core-info-second-row",
  			".core-info-third-row",
  			".meta-data-list",
  			".item-title",
  			".breadcrumb",
  			".itemDetails-right",
  			".ux-user-name",
  			".ux-updated-date",
  			".ux-item-second-row-wrapper",
  			".stats-and-offer",
  			".header-container"
  		],
  		globalStyles: {
  			".item-details-control-root.ux-item-shortdesc": "height: unset; overflow: visible; max-height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "viu",
  		matches: [
  			"www.viu.com"
  		],
  		excludeSelectors: [
  			".bmpui-ui-viu-subtitle-overlay",
  			".bmpui-ui-viu-subtitle-overlay *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "vodtw",
  		matches: [
  			"www.vodtw.com/book/*"
  		],
  		injectedCss: [
  			"dl { display: flex; flex-wrap: wrap; }",
  			"dl dd { white-space: normal !important; overflow: visible !important; }",
  			"#info p { height: unset !important; }"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "wandb",
  		matches: [
  			"wandb.ai"
  		],
  		stayOriginalSelectors: [
  			"span[data-slate-inline=true]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "wattpad",
  		matches: [
  			"www.wattpad.com"
  		],
  		globalStyles: {
  			".story-info .item-description": "overflow: scroll;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "wayfair",
  		matches: [
  			"www.wayfair.com"
  		],
  		injectedCss: [
  			"[data-enzyme-id=\"Collapse-Collapsible\"] {height:unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "webofscience",
  		matches: [
  			"https://www.webofscience.com/*",
  			"https://webofscience.clarivate.*/*",
  			"www-webofscience-com-*.*",
  			"webofscience-clarivate*.*",
  			"*.ustc.edu.*/*wos*"
  		],
  		selectors: [
  			"app-wos.mat-typography"
  		],
  		excludeSelectors: [
  			"app-custom-breadcrumbs",
  			".summary-left-panel",
  			".authors",
  			"app-full-record-keywords mark",
  			"mat-sidenav",
  			"[name=pubdate]",
  			"[data-ta^=Summary-]",
  			"app-summary-authors",
  			".search-text",
  			".mat-drawer-inner-container",
  			"[class*='sidenav-panel']"
  		],
  		extraBlockSelectors: [
  			"app-summary-authors + div",
  			"app-full-record-keywords span span",
  			"[data-ta=summary-record-title-link]",
  			"[cdxanalyticscategory=wos-recordCard_ExpandAbstract]"
  		],
  		globalStyles: {
  			".abstract": "height:auto !important;",
  			".show-more-lines": "height:unset !important;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "weibo",
  		matches: [
  			"weibo.com",
  			"*.weibo.*"
  		],
  		selectors: [
  			"div[class^='detail_wbtext']",
  			".weibo-text",
  			".m-feed",
  			".wbpro-feed-content",
  			".wbpro-list .text"
  		],
  		stayOriginalSelectors: [
  			".expand"
  		],
  		excludeMatches: [
  			"passport.weibo.com/sso/signin*"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "weverse",
  		matches: [
  			"weverse.io"
  		],
  		excludeSelectors: [
  			".pzp-pc__video",
  			".pzp-pc__video *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "whatsapp",
  		matches: [
  			"web.whatsapp.com"
  		],
  		selectors: [
  			"._akbu",
  			"[role=list]",
  			".copyable-text",
  			".quoted-mention"
  		],
  		excludeSelectors: [
  			"[aria-hidden=true]"
  		],
  		extraInlineSelectors: [
  			".x1lliihq"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "wikipedia",
  		matches: [
  			"*.wikipedia.org"
  		],
  		excludeSelectors: [
  			".mw-editsection",
  			".mw-cite-backlink",
  			"#p-lang-btn",
  			"#right-navigation",
  			"#p-associated-pages",
  			".vector-header",
  			".lazy-image-placeholder"
  		],
  		stayOriginalSelectors: [
  			".chemf",
  			".mwe-math-element",
  			"[role=math]",
  			".nowrap"
  		],
  		extraInlineSelectors: [
  			".chemf",
  			".mwe-math-element",
  			"[role=math]",
  			".nowrap"
  		],
  		injectedCss: [
  			".immersive-translate-target-translation-block-wrapper { display: block !important; }",
  			".mwe-popups-extract {max-height:unset!important;height:unset!important;}",
  			".immersive-translate-target-wrapper {content-visibility:auto;}"
  		],
  		globalStyles: {
  			".no-article-text-sister-projects li": "height:unset;"
  		},
  		paragraphMinTextCount: 4,
  		paragraphMinWordCount: 2,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "wiley",
  		matches: [
  			"*.wiley.com"
  		],
  		excludeSelectors: [
  			".loa-authors",
  			".MuiBox-root > .MuiTypography-root.MuiTypography-body2"
  		],
  		excludeMatches: [
  			"onlinelibrary.wiley.com/action/downloadSupplement*",
  			"onlinelibrary.wiley.com/doi/pdf/*",
  			"onlinelibrary.wiley.com/doi/am-pdf/*"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "wisdom",
  		matches: [
  			"wisdom.nec.com"
  		],
  		injectedCss: [
  			"a > font {width: max-content;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "wistia",
  		matches: [
  			"ahrefs.com",
  			"*.wistia.net",
  			"*.thinkific.com",
  			"courses.kevinpowell.co",
  			"learn.ni.com",
  			"cgcookie.com",
  			"academy.yoast.com",
  			"courses.mavenanalytics.io",
  			"apclassroom.collegeboard.org"
  		],
  		selectors: [
  			".wistia_embed"
  		],
  		excludeSelectors: [
  			"div[data-handle='captions']",
  			"#immersive-translate-caption-window",
  			"div[data-handle='captions'] *",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "wistia-hook",
  		matches: [
  			"agencysupremacy.io",
  			"dynamous.ai",
  			"dynamous.wistia.com"
  		],
  		excludeSelectors: [
  			"div[data-handle='captions']",
  			"div[data-handle='captions'] *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "wsj",
  		matches: [
  			"www.wsj.com",
  			"cn.wsj.com"
  		],
  		excludeSelectors: [
  			"header",
  			"footer",
  			"nav",
  			"[aria-label='Markets summary']"
  		],
  		extraBlockSelectors: [
  			".series-nav__link-thumbnail"
  		],
  		injectedCss: [
  			".immersive-translate-target-wrapper br {display:none;}",
  			".spcv_list-item .immersive-translate-target-translation-block-wrapper {display:inline-block;margin-top:8px;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "www.acrobiosystems.com",
  		matches: [
  			"www.acrobiosystems.com"
  		],
  		injectedCss: [
  			".productDetialDetail .productLink {overflow: hidden;}",
  			".productDetialDetail .productLink .box a {display: flex; justify-content: center; white-space: nowrap;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "www.dgl.ai",
  		matches: [
  			"www.dgl.ai"
  		],
  		excludeSelectors: [
  			"header"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "www.ey.com",
  		matches: [
  			"www.ey.com"
  		],
  		injectedCss: [
  			".up-rich-text__container {height: unset!important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "www.iq.com",
  		matches: [
  			"www.iq.com"
  		],
  		excludeSelectors: [
  			".iqp-subtitle",
  			".iqp-subtitle *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "www.metacritic.com",
  		matches: [
  			"www.metacritic.com"
  		],
  		injectedCss: [
  			".c-finderProductCard_info .c-finderProductCard_meta {display: block;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "www.sixthtone.com",
  		matches: [
  			"www.sixthtone.com"
  		],
  		excludeSelectors: [
  			"#footer",
  			"[class^=index_time]",
  			"[class^=index_anthorList]",
  			"[class^=index_node]",
  			"[class^=index_popupWrapper]"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "xianqihaotianmi",
  		matches: [
  			"www.xianqihaotianmi.org"
  		],
  		injectedCss: [
  			".list-charts { display: flex; flex-wrap: wrap; }",
  			".list-charts li { white-space: normal !important; overflow: visible !important; }"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "xiaohongshu.com",
  		matches: [
  			"www.xiaohongshu.com"
  		],
  		excludeSelectors: [
  			".author-wrapper",
  			".info",
  			".side-bar",
  			".interactions",
  			".show-more",
  			".bottom-container",
  			".total",
  			".reds-sticky"
  		],
  		globalStyles: {
  			"a.title": "-webkit-line-clamp:3"
  		},
  		blockMinTextCount: 6,
  		blockMinWordCount: 1,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "xiaosaas",
  		matches: [
  			"*.xiaosaas.com"
  		],
  		excludeSelectors: [
  			"p.marginRight10",
  			"p.marginLeft10"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "xiapi",
  		matches: [
  			"*.xiapibuy.*"
  		],
  		globalStyles: {
  			".WBVL_7,.tauwWr.jqRqhn": "-webkit-line-clamp:unset;max-height:unset;height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "xvideos",
  		matches: [
  			"https://www.xvideos.com/*"
  		],
  		excludeSelectors: [
  			".video-hd-mark"
  		],
  		globalStyles: {
  			".title": "-webkit-line-clamp:unset;max-height:unset;",
  			".mozaique": "display:flex; flex-wrap:wrap;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "yahoo",
  		matches: [
  			"*.yahoo.*"
  		],
  		excludeSelectors: [
  			"._ys_jiqava",
  			"#Col2-5-Rmp-Proxy",
  			".readmore",
  			".ticker-item-wrapper",
  			".ticker-list",
  			".footer"
  		],
  		extraBlockSelectors: [
  			".SIPGg",
  			".sc-kzMCTH.pSZXj"
  		],
  		injectedCss: [
  			"[class*='line-clamp'],h3.clamp {-webkit-line-clamp:unset!important;}",
  			"#atomic .Mt\\(20px\\) {margin-top: 100px;}",
  			"[class*='LineClamp'] {-webkit-line-clamp:unset;max-height:unset;}",
  			"a[class*='js-content-viewer']> div[class*='Td\\(n\\)'] {overflow: scroll;}",
  			"[class*='_ys_24482e'] {-webkit-line-clamp:unset;}",
  			"#Aside > :first-child {overflow:scroll;}"
  		],
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "yandex",
  		matches: [
  			"https://yandex.com/video/*"
  		],
  		selectors: [
  			".serp-item__title",
  			".serp-item__text",
  			".Keypoints-ItemTitle",
  			".bes-epmjnzm-idtktyj",
  			".OrganicTitle-LinkText",
  			"h1.VideoTitle"
  		],
  		globalStyles: {
  			".serp-item__title": "-webkit-line-clamp: unset;max-height:unset;",
  			".serp-item__text": "-webkit-line-clamp: unset;max-height:unset;",
  			".OrganicTitle-LinkText": "-webkit-line-clamp: unset;max-height:unset;",
  			"h1.VideoTitle": "-webkit-line-clamp: unset;max-height:unset;",
  			".link .serp-item__keypoints": "bottom:2px;",
  			".OrganicTitle": "max-height:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "yandexIndex",
  		matches: [
  			"https://yandex.com/"
  		],
  		selectors: [
  			".tabs__item-text"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "yandexSearch",
  		matches: [
  			"https://yandex.com/search/*"
  		],
  		excludeSelectors: [
  			".KeyValue-Row",
  			".EntityFeedbackFooter",
  			".Organic-Subtitle",
  			".SerpFooter-Content",
  			".serp-user",
  			".Pager"
  		],
  		globalStyles: {
  			".ExtendedText-Toggle": "white-space:normal;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "yna",
  		matches: [
  			"*.yna*"
  		],
  		injectedCss: [
  			"font > br {display:none}"
  		],
  		globalStyles: {
  			"a,strong": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;",
  			"div,p,li,.item-box01,.news-con": "height:unset;max-height:unset;-webkit-line-clamp:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "yodayo.chat",
  		matches: [
  			"https://yodayo.com/*/chat/*"
  		],
  		extraBlockSelectors: [
  			".inline-flex span"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "you",
  		matches: [
  			"https://you.com/search"
  		],
  		excludeSelectors: [
  			"div.hpIWZO"
  		],
  		globalStyles: {
  			h3: "max-height:unset;-webkit-line-clamp:unset;",
  			".caKYaC": "max-height:unset;-webkit-line-clamp:unset;",
  			".dDwDsu": "max-height:unset;-webkit-line-clamp:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "youku.tv",
  		matches: [
  			"www.youku.tv"
  		],
  		excludeSelectors: [
  			"#subtitle",
  			"#subtitle *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "yourporn",
  		matches: [
  			"https://www.youporn.com/*"
  		],
  		extraBlockSelectors: [
  			".button"
  		],
  		globalStyles: {
  			".video-box": "max-height:unset;",
  			".video-box-title": "white-space:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "youtube",
  		matches: [
  			"www.youtube.com"
  		],
  		selectors: [
  			"yt-formatted-string[slot=content].ytd-comment-renderer",
  			"yt-formatted-string.ytd-video-renderer",
  			"yt-formatted-string#content-text",
  			"h1",
  			"yt-formatted-string#video-title",
  			".ytLockupMetadataViewModelTitle,.shortsLockupViewModelHostOutsideMetadataTitle",
  			"yt-formatted-string.span",
  			"span#video-title",
  			"a#video-title",
  			"yt-formatted-string.ytd-transcript-segment-renderer",
  			"#description-inline-expander > yt-attributed-string > span",
  			"yt-attributed-string > span",
  			"yt-formatted-string > span",
  			"ytd-notification-renderer .message",
  			"#message",
  			".yt_to_text_transcript_text",
  			"video-summary-content-view-model",
  			".yt-core-attributed-string",
  			"#title",
  			".product-item-title",
  			".product-item-price",
  			"#commentCanvas .cmt",
  			".ytwTranscriptSegmentViewModelHost"
  		],
  		excludeSelectors: [
  			".ytp-caption-window-container",
  			"text",
  			".imt-caption-container",
  			"ytd-button-renderer",
  			".ytp-sfn-content div :last-child",
  			"ytd-live-chat-frame",
  			"yt-button-shape",
  			"ytd-comments-header-renderer",
  			"yt-content-metadata-view-model",
  			"yt-description-preview-view-model button",
  			".yt-page-header-view-model__page-header-title",
  			".imt-caption-container *"
  		],
  		extraBlockSelectors: [
  			"yt-formatted-string.ytd-transcript-segment-renderer",
  			".caption-visual-line"
  		],
  		injectedCss: [
  			".immersive-translate-target-wrapper img { width: 16px; height: 16px }",
  			".metadata-snippet-container {max-height: unset !important;}",
  			".immersive-translate-target-wrapper {text-align: left;}",
  			".immersive-translate-target-wrapper[dir=rtl] {text-align: right;}",
  			"#commentCanvas .cmt {display:flex;flex-direction: column;}",
  			"#commentCanvas .cmt font br {display: none;}",
  			"#video-title,h1.ytd-watch-metadata,.ytd-video-renderer,.yt-lockup-metadata-view-model-wiz__title {-webkit-line-clamp: unset !important;max-height: unset !important;}",
  			"yt-formatted-string#video-title,.ShortsLockupViewModelHostOutsideMetadataTitle {-webkit-line-clamp: unset !important;max-height: unset !important;}",
  			"ytd-expander.ytd-comment-renderer {--ytd-expander-max-lines: 1000;}",
  			".page-header-view-model-wiz__page-header-title--page-header-title-large {-webkit-line-clamp: unset !important;max-height: unset !important;}",
  			"#title,#video-title,.yt-lockup-metadata-view-model__title,.ytLockupMetadataViewModelTitle,.shortsLockupViewModelHostOutsideMetadataTitle,h1.ytd-watch-metadata,.ytwFeedAdMetadataViewModelHostTextsStyleStandardHeadline {-webkit-line-clamp: unset !important;max-height: unset !important;}"
  		],
  		blockMinTextCount: 0,
  		blockMinWordCount: 0,
  		isTranslateTitle: false,
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "youtube-subtitle",
  		matches: [
  			"www.youtube-nocookie.com",
  			"music.youtube.com"
  		],
  		excludeSelectors: [
  			".captions-text",
  			".ytp-caption-segment"
  		],
  		extraBlockSelectors: [
  			".caption-visual-line"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "youtubekids",
  		matches: [
  			"www.youtubekids.com"
  		],
  		globalStyles: {
  			"#video-title": "-webkit-line-clamp: unset;max-height: unset;",
  			"h1.ytd-watch-metadata": "-webkit-line-clamp: unset;max-height: unset;",
  			"yt-formatted-string#video-title": "-webkit-line-clamp: unset;max-height: unset;",
  			"ytd-expander.ytd-comment-renderer": "--ytd-expander-max-lines: 1000;",
  			".details.ytk-compact-video-renderer": "height: unset;",
  			".primary-text.ytk-compact-video-renderer": "-webkit-line-clamp: unset;max-height: unset;"
  		},
  		blockMinTextCount: 0,
  		blockMinWordCount: 0,
  		isTranslateTitle: false,
  		detectParagraphLanguage: true,
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "youtubeMobile",
  		matches: [
  			"m.youtube.com"
  		],
  		selectors: [
  			".comment-text",
  			"#content-text",
  			".media-item-headline",
  			".slim-video-information-title",
  			".yt-spec-button-view-model",
  			".yt-core-attributed-string > span",
  			".yt-core-attributed-string",
  			".shortsLockupViewModelHostMetadataTitle",
  			".YtmCommentRendererText",
  			".ytAttributedStringHost",
  			".title"
  		],
  		excludeSelectors: [
  			".ytm-badge-and-byline-item-byline",
  			".ytp-caption-window-container",
  			"text",
  			".imt-caption-container",
  			"ytd-live-chat-frame",
  			".imt-caption-container *"
  		],
  		extraBlockSelectors: [
  			".caption-visual-line"
  		],
  		injectedCss: [
  			".immersive-translate-target-wrapper img { width: 16px; height: 16px }",
  			".shortsLockupViewModelHostMetadataTitle,h4.compact-media-item-headline {max-height:unset !important;line-clamp:unset !important;overflow:unset !important;-webkit-line-clamp:unset !important;}",
  			".comment-text {max-height:unset;}",
  			".details,.subhead,.video-card-title,.media-item-headline {max-height:unset!important;-webkit-line-clamp:unset!important;}",
  			"truncated-text-content {max-height: unset !important;}"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "yuque",
  		matches: [
  			"https://www.yuque.com/*"
  		],
  		excludeSelectors: [
  			".lark-virtual-tree"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "z-lib",
  		matches: [
  			"*.z-lib.*"
  		],
  		globalStyles: {
  			".title,.book-info": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;"
  		},
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "zdf.de",
  		matches: [
  			"www.zdf.de"
  		],
  		excludeSelectors: [
  			".zdfplayer-video-container",
  			"#immersive-translate-caption-window",
  			".zdfplayer-video-container *",
  			"#immersive-translate-caption-window *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "zebrack-shueisha",
  		matches: [
  			"zebrack-comic.shueisha.*"
  		],
  		excludeSelectors: [
  			".eAvsta_root"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "zendesk",
  		matches: [
  			"https://*.zendesk.com/agent/*"
  		],
  		selectors: [
  			"[data-test-id*=subject]",
  			"[data-test-id*=content] > span",
  			".zd-comment",
  			".title"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "zenva",
  		matches: [
  			"academy.zenva.com"
  		],
  		excludeSelectors: [
  			".video-container",
  			".video-container *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "zoom",
  		matches: [
  			"*.zoom.us"
  		],
  		excludeSelectors: [
  			".live-transcription-subtitle__box",
  			".live-transcription-subtitle__box *"
  		],
  		extraInlineSelectors: [
  			".live-transcription-subtitle__item"
  		],
  		autoTranslate: true,
  		translateUI: false
  	},
  	{
  		name: "zoom-asu",
  		matches: [
  			"*.zoom.us/rec/*"
  		],
  		excludeSelectors: [
  			".player-share .video-js",
  			".player-share .video-js *"
  		],
  		autoTranslate: true,
  		translateUI: false
  	}
  ];

  const DEFAULT_RULES_URL = "https://raw.githubusercontent.com/translate-ext/rules/main/rules.json";

  let cachedMerged = null;
  let remoteRules = null;
  let rulesETag = null;
  let rulesLastFetch = 0;
  const RULES_CACHE_TTL = 4 * 60 * 60 * 1000;

  function mergeRules(base, remote) {
    if (!remote || !remote.length) return base;
    const map = new Map();
    for (const r of base) map.set(r.name, r);
    for (const r of remote) {
      if (!r.name) continue;
      map.set(r.name, r);
    }
    return [...map.values()];
  }

  async function loadRulesFromStorage() {
    try {
      const data = await chrome.storage.local.get(["remoteRules", "siteRulesETag", "siteRulesLastFetch"]);
      if (data.remoteRules) {
        remoteRules = data.remoteRules;
        rulesETag = data.siteRulesETag || null;
        rulesLastFetch = data.siteRulesLastFetch || 0;
        cachedMerged = mergeRules(rules, remoteRules);
        return cachedMerged;
      }
    } catch { }
    return null;
  }

  async function saveRemoteRules(rules$1, etag) {
    try {
      remoteRules = rules$1;
      rulesETag = etag;
      rulesLastFetch = Date.now();
      cachedMerged = mergeRules(rules, rules$1);
      await chrome.storage.local.set({
        remoteRules: rules$1,
        siteRulesETag: etag || null,
        siteRulesLastFetch: rulesLastFetch
      });
    } catch { }
  }

  async function fetchRemoteRules() {
    const settings = await getSettings();
    const rulesUrl = settings.rulesUrl || DEFAULT_RULES_URL;
    try {
      const headers = {};
      if (rulesETag) headers["If-None-Match"] = rulesETag;
      const resp = await fetch(rulesUrl, { headers, cache: "no-cache" });
      if (resp.status === 304) return cachedMerged;
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const rules = await resp.json();
      if (!Array.isArray(rules)) throw new Error("Invalid rules format");
      const newETag = resp.headers.get("ETag");
      await saveRemoteRules(rules, newETag);
      return cachedMerged;
    } catch (e) {
      return cachedMerged || rules;
    }
  }

  async function getSiteRules() {
    if (cachedMerged) {
      const now = Date.now();
      if ((now - rulesLastFetch) < RULES_CACHE_TTL) return cachedMerged;
    }
    if (!cachedMerged) {
      const stored = await loadRulesFromStorage();
      if (stored) {
        fetchRemoteRules().catch(() => { });
        return stored;
      }
    }
    const rules$1 = await fetchRemoteRules();
    if (!rules$1) return rules;
    return rules$1;
  }

  function extractHostPattern(pattern) {
    let host = pattern;
    if (host.includes('://')) host = host.split('://')[1];
    if (host.includes('/')) host = host.split('/')[0];
    return host;
  }

  function matchGlob(value, glob) {
    const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
    try { return new RegExp('^' + escaped + '$').test(value); } catch { return false; }
  }

  function matchHostnameOrUrl(url, pattern) {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    // Extract hostname portion and path portion from pattern
    let hostPattern = pattern;
    let pathPart = null;
    if (hostPattern.includes('://')) hostPattern = hostPattern.split('://')[1];
    const slashIdx = hostPattern.indexOf('/');
    if (slashIdx !== -1) {
      pathPart = hostPattern.substring(slashIdx);
      hostPattern = hostPattern.substring(0, slashIdx);
    }

    // Wildcard host with path
    if (hostPattern === '*') {
      if (pathPart) return matchGlob(parsed.pathname + parsed.search, pathPart);
      return true;
    }

    // Hostname matching
    let hostMatch = false;
    if (hostPattern === hostname) hostMatch = true;
    else if (hostname.endsWith('.' + hostPattern)) hostMatch = true;
    else if (hostPattern.startsWith('*.') && (hostname === hostPattern.slice(2) || hostname.endsWith('.' + hostPattern.slice(2)))) hostMatch = true;
    else if (matchGlob(hostname, hostPattern)) hostMatch = true;

    if (!hostMatch) return false;
    if (pathPart) return matchGlob(parsed.pathname + parsed.search, pathPart);
    return true;
  }

  function matchExcludeUrl(url, pattern) {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    const hostPattern = extractHostPattern(pattern);
    if (!hostname.endsWith(hostPattern) && hostPattern !== hostname) {
      const dotHost = '.' + hostPattern;
      if (!hostname.endsWith(dotHost) && hostname !== hostPattern) return false;
    }
    const slashIdx = pattern.indexOf('/', pattern.indexOf('://') + 3);
    if (slashIdx === -1) return true;
    const pathPart = pattern.substring(slashIdx);
    const urlPath = parsed.pathname + parsed.search;
    const escaped = pathPart.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
    try {
      return new RegExp('^' + escaped + '$').test(urlPath);
    } catch { return false; }
  }

  function matchUrlAgainstPatterns(url, patterns) {
    if (!patterns?.length) return false;
    for (const p of patterns) {
      const pattern = p.trim();
      if (!pattern) continue;
      if (matchHostnameOrUrl(url, pattern)) return true;
    }
    return false;
  }

  function matchRule(rules, url) {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname;
      for (const rule of rules) {
        if (rule.excludeMatches?.length) {
          let excluded = false;
          for (const p of rule.excludeMatches) {
            if (matchExcludeUrl(url, p)) { excluded = true; break; }
          }
          if (excluded) continue;
        }
        if (rule.matches?.length) {
          if (matchUrlAgainstPatterns(url, rule.matches)) return rule;
          continue;
        }
        if (!rule.urlPattern) continue;
        const patterns = rule.urlPattern.split("|");
        for (const p of patterns) {
          const pattern = p.trim();
          if (!pattern) continue;
          if (matchHostname(hostname, pattern)) return rule;
        }
      }
    } catch { }
    return null;
  }

  async function initRules() {
    const stored = await loadRulesFromStorage();
    if (!stored) {
      cachedMerged = [...rules];
      fetchRemoteRules().catch(() => { });
    }
  }

  function resetRulesCache() {
    rulesLastFetch = 0;
    cachedMerged = null;
  }

  function handleMessage(req, sender, respond) {
    if (req.action === "translate") {
      translate(req.text, req.sourceLang || "auto", req.targetLang || "en", req.engine)
        .then((r) => respond({ success: true, result: r }))
        .catch((e) => respond({ success: false, error: e.message }));
      return true;
    }

    if (req.action === "translateBatch") {
      translateBatch(req.texts, req.sourceLang || "auto", req.targetLang || "en", req.engine)
        .then((r) => respond({ success: true, results: r }))
        .catch((e) => respond({ success: false, error: e.message }));
      return true;
    }

    if (req.action === "getSettings") {
      getSettings().then((s) => respond({ settings: s }));
      return true;
    }

    if (req.action === "saveSettings") {
      chrome.storage.local.set({ settings: req.settings }).then(() => {
        respond({ success: true });
      });
      return true;
    }

    if (req.action === "getLanguages") {
      respond({ languages: LANGS });
      return false;
    }

    if (req.action === "getEngines") {
      respond({ engines: ENGINES });
      return false;
    }

    if (req.action === "testEngine") {
      const engine = req.engine || "google";
      translate("Hello world", "en", "zh-CN", engine)
        .then((r) => respond({ success: true, result: r, engine }))
        .catch((e) => respond({ success: false, error: e.message, engine }));
      return true;
    }

    if (req.action === "openOptions") {
      chrome.runtime.openOptionsPage();
      respond({ success: true });
      return false;
    }

    if (req.action === "setEnFloat") {
      getSettings().then(async (s) => {
        s.enFloat = !!req.value;
        await chrome.storage.local.set({ settings: s });
        respond({ success: true });
      });
      return true;
    }

    if (req.action === "checkBlacklist") {
      getSettings().then((s) => {
        let blacklisted = false;
        try {
          const hostname = new URL(req.url).hostname;
          blacklisted = isBlacklisted(hostname, s.blacklist || []);
        } catch { }
        respond({ blacklisted });
      });
      return true;
    }

    if (req.action === "addBlacklist") {
      getSettings().then(async (s) => {
        if (!s.blacklist) s.blacklist = [];
        if (!s.blacklist.includes(req.host)) {
          s.blacklist.push(req.host);
          await chrome.storage.local.set({ settings: s });
        }
        respond({ success: true });
      });
      return true;
    }

    if (req.action === "addAutoBlacklist") {
      getSettings().then(async (s) => {
        if (!s.autoBlacklist) s.autoBlacklist = [];
        if (!s.autoBlacklist.includes(req.host)) {
          s.autoBlacklist.push(req.host);
          await chrome.storage.local.set({ settings: s });
        }
        respond({ success: true });
      });
      return true;
    }

    if (req.action === "removeAutoBlacklist") {
      getSettings().then(async (s) => {
        if (!s.autoBlacklist) s.autoBlacklist = [];
        s.autoBlacklist = s.autoBlacklist.filter((h) => h !== req.host);
        await chrome.storage.local.set({ settings: s });
        respond({ success: true });
      });
      return true;
    }

    if (req.action === "removeBlacklist") {
      getSettings().then(async (s) => {
        if (!s.blacklist) s.blacklist = [];
        s.blacklist = s.blacklist.filter((h) => h !== req.host);
        await chrome.storage.local.set({ settings: s });
        respond({ success: true });
      });
      return true;
    }

    if (req.action === "getSiteRule") {
      getSiteRules().then((rules) => {
        const url = req.url || sender.tab?.url || "";
        respond({ rule: matchRule(rules, url) });
      });
      return true;
    }

    if (req.action === "getAllRules") {
      getSiteRules().then((rules) => respond({ rules }));
      return true;
    }

    if (req.action === "refreshRules") {
      resetRulesCache();
      fetchRemoteRules().then((rules) => respond({ rules: rules || [] }));
      return true;
    }

    if (req.action === "updateRules") {
      if (!Array.isArray(req.rules)) { respond({ success: false }); return false; }
      saveRemoteRules(req.rules, null).then(() => respond({ success: true }));
      return true;
    }

    return false;
  }

  chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
  });

  chrome.runtime.onMessage.addListener((req, sender, respond) => {
    if (req.action === "checkUpdate") {
      checkUpdate().then((r) => respond(r));
      return true;
    }
    return handleMessage(req, sender, respond);
  });

  const VERSION = chrome.runtime.getManifest().version;

  async function checkUpdate() {
    try {
      const resp = await fetch("https://api.github.com/repos/mitcehub/EZ-Translate/releases/latest", {
        signal: AbortSignal.timeout(10000),
      });
      if (!resp.ok) return { hasUpdate: false, error: "HTTP " + resp.status };
      const data = await resp.json();
      const latest = data.tag_name?.replace(/^v/, "") || "";
      if (!latest) return { hasUpdate: false, error: "no tag" };
      const hasUpdate = compareVersions(latest, VERSION) > 0;
      if (hasUpdate) {
        chrome.action.setBadgeText({ text: "NEW" });
        chrome.action.setBadgeBackgroundColor({ color: "#dc2626" });
      }
      return { hasUpdate, current: VERSION, latest, url: data.html_url };
    } catch (e) {
      return { hasUpdate: false, error: e.message };
    }
  }

  function compareVersions(a, b) {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const na = pa[i] || 0, nb = pb[i] || 0;
      if (na > nb) return 1;
      if (na < nb) return -1;
    }
    return 0;
  }

  chrome.runtime.onInstalled.addListener(() => {
    checkUpdate().catch(() => {});
  });

  setInterval(() => {
    chrome.storage.local.get(["lastUpdateCheck"], (r) => {
      const last = r.lastUpdateCheck || 0;
      if (Date.now() - last > 86400000) {
        chrome.storage.local.set({ lastUpdateCheck: Date.now() }, () => {
          checkUpdate().catch(() => {});
        });
      }
    });
  }, 3600000);

  initRules();

})();
