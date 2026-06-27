# Manual

## Starting the Frontend

### 1. Install Dependencies

From project root:

```bash
npm install
npm --prefix ppt-viewer install
```

### 2. Start Preview Server

From project root:

```bash
node server.mjs
```

Default:

```text
http://localhost:9030/
```

### 3. Open Browser

Go to:

```text
http://localhost:9030/
```

If you don't see the latest results, force-refresh:

- macOS: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

## Frontend Operations

### Navigation

- Use keyboard left/right arrows to flip pages
- Use UI controls to navigate
- Click "Home" to jump to page 1
- Enter a page number and press Enter to jump directly

### Outline View

- Click the "Outline" button at the top
- Navigate the tree in the drawer
- Click a section to jump to its page

### Export PPTX

- Click "Export PPTX" in the top toolbar
- Generates and downloads `deck.pptx` from current `deck.json + slides/*.json`

### Reviewing Pages

Key things to check:

- Are titles correct?
- Does the layout match the page intent?
- Are SVGs rendering properly?
- Is any content overflowing the screen?
- Are there too many table-like or bullet-like pages?

## Frontend Files

- `server.mjs`: local preview server & `/api/deck`
- `ppt-viewer/src/App.vue`: page shell & outline drawer
- `ppt-viewer/src/layoutRegistry.ts`: `layout_type` to component mapping
- `ppt-viewer/src/components/layouts/`: page layout components
