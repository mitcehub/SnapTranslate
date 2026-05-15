import { translate } from './translate-engine.js';
import { initRules } from './rules-data.js';
import { handleMessage } from './message-handler.js';

const action = chrome.action || chrome.browserAction;
action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((req, sender, respond) => {
  return handleMessage(req, sender, respond);
});

initRules();
