# Creating Extensions for EDITOR

Every extension is a **single `.html` file**. The file name must end with `-extension.html` (e.g. `markdown-preview-extension.html`). Install it through the settings panel (⛭ → Extensions → Install).

---

## 1. Meta Tags (Required)

The editor reads four meta tags from `<head>` to understand your extension. Two are required.

```html
<head>
  <meta name="extension-name"  content="Markdown Preview">
  <meta name="extension-types" content="md,markdown,mkd">
  <meta name="extension-mode"  content="split">
  <meta name="extension-bar"   content="true">
</head>
```

| Meta tag | Required | Values | Default |
|---|---|---|---|
| `extension-name` | **Yes** | Any display string | — |
| `extension-types` | **Yes** | Comma-separated file extensions | — |
| `extension-mode` | No | `full` · `split` · `overlay` | `full` |
| `extension-bar` | No | `true` | (omitted = no bar) |

The editor only offers the extension for files whose extension matches one of the values in `extension-types`.

---

## 2. Display Modes

### `full`
Your iframe replaces the entire editing area.

```
┌───────────────────────────────────────────────┐
│ HEADER (44px)                                 │
├───────────────────────────────────────────────┤
│                                               │
│          YOUR EXTENSION IFRAME                │
│          (100% of editor area)                │
│                                               │
├───────────────────────────────────────────────┤
│ STATUS BAR (28px)                             │
└───────────────────────────────────────────────┘
```

### `split`
Text on the left, your UI on the right, separated by a draggable 5px handle.

```
┌───────────────────┬───────────────────────────┐
│ HEADER (44px)     │                           │
├───────────────────┤                           │
│                   │  YOUR EXTENSION IFRAME    │
│  TEXTAREA         │  (right pane)             │
│                   │                           │
├───────────────────┴───────────────────────────┤
│ STATUS BAR (28px)                             │
└───────────────────────────────────────────────┘
         ▲ 5px draggable split handle
```

The split ratio is persisted in `localStorage` across sessions.

### `overlay`
Your iframe is absolutely positioned on top of the textarea (`z-index: 4`). The overlay container has `pointer-events: none` by default; your own elements must set `pointer-events: auto` where interaction is needed.

Good for: minimaps, annotation layers, floating toolbars.

### Extension bar (optional, any mode)

When `<meta name="extension-bar" content="true">` is present, the editor renders an additional **33px iframe** spanning the full editor width, just below the tab strip.

```
┌───────────────────────────────────────────────┐
│ TABS                                          │
├───────────────────────────────────────────────┤
│ EXTENSION BAR IFRAME (33px · full width)      │
├───────────────────────────────────────────────┤
│ LINE-WIDTH SLIDER                             │
├───────────────────┬───────────────────────────┤
│ TEXTAREA          │ MAIN EXTENSION PANE       │
└───────────────────┴───────────────────────────┘
```

The bar iframe is loaded from the **same HTML file** as your main pane. Use the `context` field in the first `editor:state` message (or the pre-seeded `window.__editorContext`) to distinguish bar from main:

```js
// Available synchronously before the first postMessage:
if (window.__editorContext === 'bar') {
  // render compact toolbar UI
} else {
  // render full main-pane UI
}
```

---

## 3. Design System

### CSS variables (dark theme default)

```css
:root {
  --bg-base:       #09090b;
  --bg-surface:    #18181b;
  --bg-editor:     #0a0a0b;
  --bg-hover:      #1f1f23;
  --bg-active:     #1c1c20;
  --border-color:  #27272a;  /* primary border */
  --border-subtle: #3f3f46;
  --text-primary:  #e4e4e7;
  --text-strong:   #f4f4f5;
  --text-secondary:#a1a1aa;
  --text-muted:    #71717a;
  --text-dim:      #78787f;
  --danger:        #ef4444;
  --danger-bg:     #7f1d1d;
}
```

Light theme values are applied via `[data-theme="light"]` on `<html>`. To detect the current theme inside your iframe:

```js
window.addEventListener('message', e => {
  // editor:state does not include a theme field –
  // query the parent document's dataset instead:
  const theme = window.parent?.document?.documentElement?.dataset?.theme ?? 'dark';
});
```

Because your iframe runs in a sandboxed context (`sandbox="allow-scripts"`) without `allow-same-origin`, the parent document is **not** accessible. To support both themes, use `prefers-color-scheme` as a proxy or mirror the CSS variable definitions in your extension and pick a sensible default.

### Typography

```css
body {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #e4e4e7;         /* --text-primary */
  background: #0a0a0b;    /* --bg-editor */
  margin: 0;
}

code, pre, textarea {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
               "Liberation Mono", "Courier New", monospace;
}
```

### Spacing scale

Use only: `4px 8px 12px 16px 20px 24px 32px`

### Component reference

**Header bar** (include in `full` and `split` modes)
```css
.ext-header {
  height: 44px;
  background: #18181b;           /* --bg-surface */
  border-bottom: 1px solid #27272a; /* --border-color */
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 13px;
  flex-shrink: 0;
}
```

**Footer / status strip**
```css
.ext-footer {
  height: 28px;
  background: #18181b;
  border-top: 1px solid #27272a;
  font-size: 12px;
  color: #71717a;                /* --text-muted */
  padding: 0 12px;
  display: flex;
  align-items: center;
}
```

**Buttons**
```css
button {
  height: 28px;            /* or 32px */
  padding: 0 12px;
  border-radius: 4px;
  background: #18181b;
  border: 1px solid #27272a;
  color: #e4e4e7;
  font-size: 13px;
  cursor: pointer;
}
button:hover  { background: #1f1f23; } /* --bg-hover */
button:active { background: #1c1c20; } /* --bg-active */
```

**Inputs**
```css
input, textarea {
  background: #111113;
  border: 1px solid #27272a;
  color: #e4e4e7;
  border-radius: 4px;
  padding: 6px 8px;
  font-family: ui-monospace, monospace;
}
```

**Cards / panels**
```css
.card {
  background: #18181b;              /* --bg-surface */
  border: 1px solid #27272a;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
```

---

## 4. Recommended HTML Skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="extension-name"  content="My Extension">
  <meta name="extension-types" content="txt,md">
  <meta name="extension-mode"  content="split">
  <!-- <meta name="extension-bar" content="true"> -->
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0; height: 100%;
      background: #0a0a0b;
      color: #e4e4e7;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
    }
    body { display: flex; flex-direction: column; }

    .ext-header {
      height: 44px; flex-shrink: 0;
      background: #18181b;
      border-bottom: 1px solid #27272a;
      display: flex; align-items: center;
      padding: 0 12px; font-size: 13px;
    }
    .ext-main { flex: 1; overflow: auto; padding: 12px; }
    .ext-footer {
      height: 28px; flex-shrink: 0;
      background: #18181b;
      border-top: 1px solid #27272a;
      font-size: 12px; color: #71717a;
      padding: 0 12px;
      display: flex; align-items: center;
    }

    /* Bar-specific layout (context === 'bar') */
    .ext-toolbar {
      height: 100%;
      display: flex; align-items: center;
      gap: 8px; padding: 0 12px; font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="ext-header">
    <span id="filename">—</span>
  </div>
  <div class="ext-main" id="main">
    <!-- your UI here -->
  </div>
  <div class="ext-footer" id="status">ready</div>

  <script>
    // The bar iframe is loaded from the same HTML file.
    // window.__editorContext is pre-seeded to 'bar' before postMessage arrives.
    const isBar = window.__editorContext === 'bar';

    if (isBar) {
      // Replace body with compact toolbar
      document.body.innerHTML = '<div class="ext-toolbar"><span>My Extension</span></div>';
    }

    window.addEventListener('message', e => {
      if (!e.data || e.data.type !== 'editor:state') return;

      const { content, cursorLine, cursorCol, lineWidthChars, filename, context } = e.data;

      if (context === 'bar') {
        // Update bar UI
        return;
      }

      // Update main-pane UI
      document.getElementById('filename').textContent = filename ?? '—';
      document.getElementById('status').textContent =
        `Ln ${cursorLine}, Col ${cursorCol}  |  width: ${lineWidthChars}`;

      render(content);
    });

    function render(content) {
      document.getElementById('main').textContent = content; // replace with real logic
    }

    // Push content changes back to the editor:
    function pushContent(newContent) {
      window.parent.postMessage({
        type: 'extension:updated',
        content: newContent,
        // cursorLine: 1,   // optional
        // cursorCol: 1     // optional
      }, '*');
    }
  </script>
</body>
</html>
```

---

## 5. Message Protocol

### Editor → Extension  (`editor:state`)

Sent on load, on every keystroke, and on cursor movement (for `split` and `overlay` modes, and for any extension with a bar).

```js
{
  type:           'editor:state',
  content:        string,           // current full text of the file
  cursorLine:     number,           // 1-based line number
  cursorCol:      number,           // 1-based column number
  lineWidthChars: number | '∞',     // current line-width setting
  filename:       string,           // e.g. "notes.md"
  context:        'bar' | undefined // 'bar' only when sent to the bar iframe
}
```

`context` is present **only** in messages sent to the bar iframe. The main-pane iframe receives no `context` field.

### Extension → Editor  (`extension:updated`)

Send this to write new content into the editor buffer. Only the active tab is updated.

```js
window.parent.postMessage({
  type:       'extension:updated',
  content:    string,    // new full text
  cursorLine: number,    // optional, 1-based
  cursorCol:  number     // optional, 1-based
}, '*');
```

Content updates via `extension:updated` work in `split` and `overlay` modes; in `full` mode the textarea is not visible but the file is still updated and saved.

---

## 6. Sandbox Constraints

Extension iframes run with `sandbox="allow-scripts"` only. This means:

- **No** `allow-same-origin` — cannot access parent DOM or localStorage.
- **No** `allow-forms`, `allow-popups`, `allow-top-navigation`.
- **Can** use `postMessage` to communicate with the editor.
- **Can** use `fetch` to external URLs (subject to the extension's own CSP).
- **Can** use most Web APIs available to scripts (Canvas, Web Workers via inline blobs, etc.).

If your extension includes a `<meta http-equiv="Content-Security-Policy">` header that forbids inline scripts, the `window.__editorContext` injection (see bar section above) will be blocked. Either omit the CSP header or add `'unsafe-inline'` to your `script-src`.

---

## 7. Installation

1. Name your file with a `-extension.html` suffix, e.g. `csv-viewer-extension.html`.
2. Open EDITOR → click ⛭ (settings) → **Extensions** → **Install Extension**.
3. Select your file. The editor parses the meta tags and registers the extension.
4. Open any file whose extension matches `extension-types` — the extension activates automatically.

To update an installed extension: re-install the new version of the file. If the `extension-name` matches an existing entry, it is replaced in place.

To uninstall: ⛭ → Extensions → click **Remove** next to the extension name.
