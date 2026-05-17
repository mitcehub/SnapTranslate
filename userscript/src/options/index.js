let optionsPanel = null;

async function showOptionsPanel() {
  if (optionsPanel && document.body.contains(optionsPanel)) {
    optionsPanel.remove();
    optionsPanel = null;
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "ez-options-overlay";
  const panel = document.createElement("div");
  panel.id = "ez-options-panel";
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  optionsPanel = overlay;

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay && !e.target.closest("#ez-options-panel")) {
      overlay.remove();
      optionsPanel = null;
    }
  });

  await initSettingsPanel(panel);
}
