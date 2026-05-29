const NON_TEXT_INPUT_TYPES = new Set([
  "checkbox", "radio", "submit", "reset", "button", "image",
  "file", "hidden", "range", "color", "date", "datetime-local",
  "month", "week", "time", "number",
]);

export function isEditable(el) {
  if (!el) return false;
  if (el.tagName === "TEXTAREA") return true;
  if (el.tagName === "INPUT") {
    const type = (el.getAttribute("type") || "text").toLowerCase();
    if (NON_TEXT_INPUT_TYPES.has(type)) return false;
    return !el.disabled && !el.readOnly;
  }
  if (el.isContentEditable) return true;
  return false;
}

export function getDeepActiveElement(doc, skipSelf) {
  doc = doc || document;
  let el = doc.activeElement;
  if (!el || el === doc.body) return null;
  if (el.shadowRoot) {
    const deep = getDeepActiveElement(el.shadowRoot, false);
    if (deep) return deep;
  }
  try {
    if (el.contentDocument && el.contentDocument.body) {
      const deep = getDeepActiveElement(el.contentDocument, false);
      if (deep) return deep;
    }
  } catch {}
  if (skipSelf && !isEditable(el)) {
    return null;
  }
  return el;
}

function getContentEditableFocus() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  const node = sel.anchorNode;
  if (!node) return null;
  let el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  while (el) {
    if (el.isContentEditable) return el;
    el = el.parentElement;
  }
  return null;
}

function tryPasteStrategy(input, translated, selectedText) {
  try {
    const st = input.selectionStart;
    const en = input.selectionEnd;
    if (input.value.substring(st, en) !== selectedText) return false;

    const before = input.value.substring(0, st);
    const after = input.value.substring(en);
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", translated);
    const pasteEvent = new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData: dataTransfer,
    });
    input.value = before + translated + after;
    const newCursor = st + translated.length;
    input.setSelectionRange(newCursor, newCursor);
    input.dispatchEvent(pasteEvent);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  } catch {
    return false;
  }
}

function tryExecCommandInsert(input, translated, selectedText) {
  try {
    input.focus();
    const st = input.selectionStart;
    const en = input.selectionEnd;
    if (input.value.substring(st, en) !== selectedText) return false;
    input.setSelectionRange(st, en);
    document.execCommand("insertText", false, translated);
    return true;
  } catch {
    return false;
  }
}

function tryDirectValueSet(input, translated, selectedText) {
  try {
    const st = input.selectionStart;
    const en = input.selectionEnd;
    if (input.value.substring(st, en) !== selectedText) return false;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, "value"
    )?.set || Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, "value"
    )?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, input.value.substring(0, st) + translated + input.value.substring(en));
    } else {
      input.setRangeText(translated, st, en, "end");
    }
    const newCursor = st + translated.length;
    input.setSelectionRange(newCursor, newCursor);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  } catch {
    return false;
  }
}

function tryTextEvent(input, translated) {
  try {
    const textEvent = new TextEvent("textInput", {
      data: translated,
      inputType: "insertText",
    });
    input.dispatchEvent(textEvent);
    return true;
  } catch {
    return false;
  }
}

function replaceFormElement(input, translated, selectedText) {
  if (tryPasteStrategy(input, translated, selectedText)) return true;
  if (tryExecCommandInsert(input, translated, selectedText)) return true;
  if (tryDirectValueSet(input, translated, selectedText)) return true;
  if (tryTextEvent(input, translated)) return true;
  return false;
}

function replaceContentEditable(el, translated, selectedText, savedRange) {
  const sel = window.getSelection();

  if (savedRange) {
    try {
      sel.removeAllRanges();
      sel.addRange(savedRange);
    } catch {}
  }

  if (!sel || sel.isCollapsed || !sel.rangeCount) return false;
  try {
    const range = sel.getRangeAt(0);
    const selected = range.toString();
    if (selected !== selectedText) return false;

    el.focus();
    const isRichEditor = el.hasAttribute("data-lexical-editor") ||
      el.hasAttribute("data-gramm") ||
      el.hasAttribute("contenteditable") && el.closest('[data-lexical-editor], [data-gramm], .ProseMirror, .ql-editor, .public-DraftEditor-content');

    if (isRichEditor) {
      return document.execCommand("insertText", false, translated);
    }

    const beforeInputEvent = new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      inputType: "insertReplacementText",
      data: translated,
    });
    if (!el.dispatchEvent(beforeInputEvent)) return false;

    range.deleteContents();
    const textNode = document.createTextNode(translated);
    range.insertNode(textNode);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);

    el.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      inputType: "insertReplacementText",
      data: translated,
    }));
    return true;
  } catch {
    try {
      const sel2 = window.getSelection();
      if (sel2 && sel2.rangeCount) {
        const range2 = sel2.getRangeAt(0);
        range2.deleteContents();
        range2.insertNode(document.createTextNode(translated));
        range2.collapse(false);
        sel2.removeAllRanges();
        sel2.addRange(range2);
      }
      return true;
    } catch {
      return false;
    }
  }
}

export function doReplace(translated, actInput, selText, showToastFn, savedRange) {
  if (!actInput || !selText) return;
  try {
    if (actInput.tagName === "INPUT" || actInput.tagName === "TEXTAREA") {
      if (replaceFormElement(actInput, translated, selText)) {
        showToastFn("Replaced ✓");
        return;
      }
      const st = actInput.selectionStart, en = actInput.selectionEnd;
      if (actInput.value.substring(st, en) !== selText) {
        showToastFn("选择区域已变化，请重新选择");
        return;
      }
      actInput.setRangeText(translated, st, en, "select");
      actInput.dispatchEvent(new Event("input", { bubbles: true }));
      actInput.dispatchEvent(new Event("change", { bubbles: true }));
      showToastFn("Replaced ✓");
    } else if (actInput.isContentEditable) {
      if (replaceContentEditable(actInput, translated, selText, savedRange)) {
        showToastFn("Replaced ✓");
      } else {
        showToastFn("替换失败");
      }
    }
  } catch (e) {
    showToastFn("替换失败");
  }
}

export { getContentEditableFocus };
