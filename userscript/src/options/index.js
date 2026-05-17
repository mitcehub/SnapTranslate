let optionsPanel = null;

async function showOptionsPanel() {
  if (optionsPanel && document.body.contains(optionsPanel)) {
    closeOptionsPanel();
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "ez-options-overlay";
  const panel = document.createElement("div");
  panel.id = "ez-options-panel";
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOptionsPanel();
  });

  try {
    await initSettingsPanel(panel);
  } catch (e) {
    console.error("EZ-Translate settings panel error:", e);
    overlay.remove();
    return;
  }

  optionsPanel = overlay;
}

function closeOptionsPanel() {
  if (optionsPanel) {
    optionsPanel.remove();
    optionsPanel = null;
  }
}
