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
