export function isEditable(el) {
  return !!(el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable));
}

export function doReplace(translated, actInput, selText, showToastFn) {
  if (!actInput || !selText) return;
  try {
    if (actInput.tagName === "INPUT" || actInput.tagName === "TEXTAREA") {
      const st = actInput.selectionStart, en = actInput.selectionEnd;
      actInput.setRangeText(translated, st, en, "select");
      actInput.dispatchEvent(new Event("input", { bubbles: true }));
      actInput.dispatchEvent(new Event("change", { bubbles: true }));
    } else if (actInput.isContentEditable) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(translated));
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    showToastFn("Replaced ✓");
  } catch {}
}
