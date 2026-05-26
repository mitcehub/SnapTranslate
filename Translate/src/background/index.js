import { translate } from './translate-engine.js';
import { initRules } from './rules-data.js';
import { handleMessage } from './message-handler.js';

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((req, sender, respond) => {
  if (req.action === "checkUpdate") {
    checkUpdate().then((r) => respond(r));
    return true;
  }
  if (req.action === "setTranslatedBadge") {
    const tabId = sender.tab?.id;
    try {
      if (req.translated) {
        chrome.action.setBadgeBackgroundColor({ color: [5, 150, 105, 255], tabId });
        chrome.action.setBadgeText({ text: "✓", tabId }).catch(e => console.error("[EZ] setBadgeText failed:", e));
      } else {
        chrome.action.setBadgeText({ text: "", tabId }).catch(e => console.error("[EZ] clear badge failed:", e));
      }
    } catch(e) {
      console.error("[EZ] setTranslatedBadge error:", e);
    }
    respond({ success: true });
    return false;
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
