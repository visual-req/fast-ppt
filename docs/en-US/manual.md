# Manual

This manual focuses on only two things:

- how to operate the web PPT viewer
- how to export a PPTX file

For installation, dependencies, and local startup, see [Installation](installation.md) or [Getting Started](getting-started.md).

## Prerequisites

Before using the manual, make sure:

- the local preview service is already running
- the browser is open at `http://localhost:9030/`
- the current project already has `deck.json + slides/*.json`

If a project only has `outline.json`, you may still preview structure, but PPTX export will fail.

## Open the Web PPT

Default URL:

```text
http://localhost:9030/
```

To open a specific project, use the `project` query parameter:

```text
http://localhost:9030/?project=001
http://localhost:9030/?project=001_project-name
```

Notes:

- `project=001` auto-matches `work/ppt/001_*`
- `project=001_project-name` opens that directory directly
- the status area on the right shows the current project name

## Toolbar Operations

The top toolbar is the main daily entry point. A practical flow is:

### 1. Reload

- Click `Reload` to re-read the current `deck.json + slides/*.json`
- Use it after editing JSON, SVG, or style-related files
- If the browser still shows stale content, do a hard refresh

### 2. Page Navigation

- `Home`: jump to page 1
- `Prev / Next`: move page by page
- page number input + `Go`: jump directly

Keyboard shortcuts:

- `ArrowLeft` / `PageUp`: previous page
- `ArrowRight` / `PageDown` / `Space`: next page
- `Home`: first page
- `End`: last page

### 3. Outline Navigation

- Click `Outline` to open the chapter drawer
- Chapters are inferred from `section_divider`
- Clicking a chapter or slide jumps directly there
- Press `Esc` or click the mask to close the drawer

Useful for:

- checking chapter order
- jumping to a problem page quickly
- verifying whether section pages are recognized correctly

### 4. Theme Switching

The toolbar dropdown switches the current viewer theme.

Built-in presets:

- `consulting`
- `demo`
- `executive`
- `training`
- `aurora`
- `graphite`

Notes:

- the selected theme affects both preview and export
- the chosen theme is synced to the `style` query parameter
- if `deck.deck.style` exists but you choose another theme in the UI, the UI selection wins

Example:

```text
http://localhost:9030/?project=001&style=executive
```

## What to Check in the Viewer

Do not only judge whether a page "looks nice". Also check:

- titles, page order, and chapter structure
- whether `layout_type` matches the page intent
- whether SVGs, images, and icons actually render
- whether any content overflows the screen
- whether pages still feel too table-heavy or bullet-heavy
- whether colors and emphasis still work after theme switching

If something looks wrong, check:

- `ppt-viewer/src/layoutRegistry.ts`
- `ppt-viewer/src/components/layouts/*.vue`
- the current project's `deck.json`
- the current slide's `slides/*.json`

## Export PPTX

### How Export Works

- Click `Export PPTX` in the top toolbar
- the system exports using the current project and current style

The backend endpoint is:

```text
/api/export/pptx
```

If the current URL contains project and style parameters, export uses them automatically, for example:

```text
http://localhost:9030/?project=001&style=executive
```

This exports project `001` with the `executive` style.

### Exported File Name

- without a style override: `deck.pptx`
- with a style override: `deck-styleName.pptx`

Examples:

- `deck.pptx`
- `deck-executive.pptx`

### What to Verify Before Export

Before exporting, confirm at least:

- you are on the correct project
- the selected style is the intended one
- chapter order and slide order are correct
- images, SVGs, and charts render properly in the viewer
- there is no overflow or clipped content

### What to Check When Export Fails

Common causes:

- the current project does not have `deck.json`
- `slides/*.json` is missing or invalid
- an image or SVG path does not exist
- the viewer supports a layout but the export pipeline does not yet

Check these files first:

- `lib/pptxExport.mjs`
- `ppt-viewer/src/lib/*`
- `work/ppt/current-project/deck.json`
- `work/ppt/current-project/slides/*.json`

## Common Operation Paths

### Path 1: Review a Single Problem Page

1. Open the target project
2. Jump to the page by page number or outline
3. Check title, layout, SVG, and overflow
4. Click `Reload` after changes
5. Export PPTX only after the page looks correct

### Path 2: Compare Multiple Styles

1. Open the same project
2. Switch styles in the dropdown
3. Review cover, section pages, chart pages, and summary pages
4. Export PPTX after choosing the final style

### Path 3: Validate Chapter Structure

1. Open `Outline`
2. Verify that all section pages are recognized
3. Click chapters one by one and confirm the jump target
4. If structure is wrong, inspect `section_divider` first

## Related Files

- `server.mjs`: local preview server and PPTX export endpoint
- `ppt-viewer/src/App.vue`: toolbar, navigation, outline, theme switch, export button
- `ppt-viewer/src/layoutRegistry.ts`: `layout_type` to component mapping
- `ppt-viewer/src/components/layouts/`: page layout components
- `lib/pptxExport.mjs`: main PPTX export logic
