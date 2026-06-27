# Installation

## Requirements

- Node.js 18 or higher
- npm
- Trae IDE (Skill auto-registered via `skills/SKILL.md`, no manual steps needed)
- macOS / Linux / Windows all supported

## Trae Skill Registration

This project's Skill is defined in `skills/SKILL.md`. Trae IDE automatically detects and loads it. No manual registration required.

Skill file structure:
- `skills/SKILL.md` — Skill entry point, defines name, description, and commands
- `skills/prompts/ppt/` — PPT generation prompts by type

## Install Dependencies

The project has two dependency trees to install:

```bash
# 1. Root dependencies (pptxgenjs, etc.)
npm install

# 2. ppt-viewer frontend dependencies (Vue + Vite)
npm --prefix ppt-viewer install
```

If root `npm install` errors due to pptxgenjs version issues, run:
`npm install pptxgenjs@latest`

## Build Frontend

```bash
npm --prefix ppt-viewer run build
```

Output goes to `ppt-viewer/dist/`, served by `server.mjs` as static files.

## Start Preview Server

Default port `9030`:

```bash
node server.mjs
```

Open: `http://localhost:9030/`

View specific project: `http://localhost:9030/?project=3` (e.g., 003_visual_spec)

## Recommended Full Setup

```bash
npm install                          # root dependencies
npm --prefix ppt-viewer install      # frontend dependencies
npm --prefix ppt-viewer run build    # build frontend
node server.mjs                      # start server
```

Or use convenience commands:

```bash
npm run dev   # = build + start
npm start     # start directly (must have build completed)
```
