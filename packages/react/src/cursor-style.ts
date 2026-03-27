// packages/react/src/cursor-style.ts

const CURSOR_STYLE_ID = "sightglass-cursor-style";

const CURSOR_CSS = `
body { cursor: crosshair !important; }
body * { cursor: crosshair !important; }
[data-sightglass-chrome], [data-sightglass-chrome] * { cursor: default !important; }
[data-sightglass-chrome] button, [data-sightglass-chrome] a { cursor: pointer !important; }
[data-sightglass-chrome] input[type="text"], [data-sightglass-chrome] input[type="search"], [data-sightglass-chrome] input[type="password"], [data-sightglass-chrome] input[type="tel"], [data-sightglass-chrome] input[type="url"], [data-sightglass-chrome] input[type="email"], [data-sightglass-chrome] input[type="number"], [data-sightglass-chrome] textarea { cursor: text !important; }
[data-sightglass-chrome] select { cursor: pointer !important; }
[data-sightglass-chrome] input[type="range"] { cursor: ew-resize !important; }
[data-sightglass-chrome] [contenteditable] { cursor: text !important; }
[contenteditable] { cursor: text !important; caret-color: #2563eb !important; }
[contenteditable]:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
`.trim();

// Per-document reference counting so multiple providers or iframes work correctly
const counts = new WeakMap<Document, number>();

export const mountCursorStyle = (ownerDocument: Document): void => {
  const prev = counts.get(ownerDocument) ?? 0;
  counts.set(ownerDocument, prev + 1);
  if (prev > 0) return;

  const existing = ownerDocument.getElementById(CURSOR_STYLE_ID);
  if (existing) return;

  const style = ownerDocument.createElement("style");
  style.id = CURSOR_STYLE_ID;
  style.textContent = CURSOR_CSS;
  ownerDocument.head.appendChild(style);
};

export const unmountCursorStyle = (ownerDocument: Document): void => {
  const prev = counts.get(ownerDocument) ?? 0;
  const next = Math.max(0, prev - 1);
  counts.set(ownerDocument, next);
  if (next > 0) return;
  counts.delete(ownerDocument);

  const existing = ownerDocument.getElementById(CURSOR_STYLE_ID);
  if (existing) {
    existing.remove();
  }
};
