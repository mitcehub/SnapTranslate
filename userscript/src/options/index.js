let settingsWindow = null;

async function showOptionsPanel() {
  if (settingsWindow && !settingsWindow.closed) {
    settingsWindow.focus();
    return;
  }
  const w = window.open('about:blank', 'ez-settings');
  if (!w) {
    console.warn('EZ-Translate: 请允许弹出窗口以打开设置');
    return;
  }
  const d = w.document;
  d.write('<!DOCTYPE html><html><head><title>EZ-Translate ' + t('optionsTitle') + '</title><meta charset="utf-8">');
  d.write('<style>body{margin:0;padding:16px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:13px;color:#111827;}body.ez-dark{background:#1e1e2e;color:#cdd6f4;}</style>');
  d.write('</head><body></body></html>');
  d.close();
  settingsWindow = w;

  const isDark = document.documentElement.getAttribute("data-tr-theme") === "dark";
  if (isDark) d.body.classList.add("ez-dark");

  const panel = d.createElement('div');
  d.body.appendChild(panel);
  try {
    await initSettingsPanel(panel);
  } catch (e) {
    console.error('EZ-Translate settings error:', e);
    w.close();
    settingsWindow = null;
  }
}

function closeOptionsPanel() {
  if (settingsWindow && !settingsWindow.closed) {
    settingsWindow.close();
    settingsWindow = null;
  }
}
