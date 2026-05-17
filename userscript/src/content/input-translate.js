function isEditable(el) {
  if (!el) return false;
  if (el.tagName === "INPUT") {
    const type = (el.type || "").toLowerCase();
    return ["text", "search", "url", "tel", "email", "password", "number"].includes(type);
  }
  if (el.tagName === "TEXTAREA") return true;
  if (el.isContentEditable) return true;
  return false;
}

function doReplace(el, text) {
  if (!el || text == null) return;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = el.value.substring(0, start);
    const after = el.value.substring(end);
    el.value = before + text + after;
    el.selectionStart = el.selectionEnd = start + text.length;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  } else if (el.isContentEditable) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
