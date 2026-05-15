import { translate } from './translate-engine.js';
import { getSettings, LANGS, ENGINES } from './settings.js';
import { getSiteRules, matchRule, resetRulesCache, fetchRemoteRules, saveRemoteRules } from './rules-data.js';

export function handleMessage(req, sender, respond) {
  if (req.action === "translate") {
    translate(req.text, req.sourceLang || "auto", req.targetLang || "en", req.engine)
      .then((r) => respond({ success: true, result: r }))
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

  if (req.action === "getSiteRule") {
    (async () => {
      const rules = await getSiteRules();
      const url = req.url || sender.tab?.url || "";
      const rule = matchRule(rules, url);
      respond({ rule });
    })();
    return true;
  }

  if (req.action === "getAllRules") {
    (async () => {
      const rules = await getSiteRules();
      respond({ rules });
    })();
    return true;
  }

  if (req.action === "refreshRules") {
    (async () => {
      resetRulesCache();
      const rules = await fetchRemoteRules();
      respond({ rules: rules || [] });
    })();
    return true;
  }

  if (req.action === "updateRules") {
    (async () => {
      const rules = req.rules;
      if (!Array.isArray(rules)) { respond({ success: false }); return; }
      await saveRemoteRules(rules, null);
      respond({ success: true });
    })();
    return true;
  }

  return false;
}
