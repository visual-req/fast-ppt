# Installation

## Requirements

- An AI tool that supports the Skills CLI
- Node.js 18 or higher (for `npx skills` or local development)
- npm
- macOS / Linux / Windows all supported

## Install the Skill

Recommended: install it with the Skills CLI:

```bash
npx skills add visual-req/fast-ppt@proposal-generator -g -y
```

You can also just tell your AI tool:

```text
Please help me install the proposal-generator skill from fast-ppt
```

After installation, you can use:

- `/fppt:outline`
- `/fppt:detail`
- `/fppt:viewer`

Notes:
- `proposal-generator` is the Skill name in this repository
- `visual-req/fast-ppt` is the source repository
- `-g` installs it globally
- `-y` skips confirmation prompts

Skill file structure:
- `skills/SKILL.md` — Skill entry point, defines name, description, and commands
- `skills/prompts/ppt/` — PPT generation prompts by type

## Local Repository Development

If you want to fork or modify this repository locally, instead of only installing the Skill, install these two dependency trees:

```bash
# 1. Root dependencies (pptxgenjs, etc.)
npm install

# 2. ppt-viewer frontend dependencies (Vue + Vite)
npm --prefix ppt-viewer install
```

If root `npm install` errors due to pptxgenjs version issues, run:
`npm install pptxgenjs@latest`

## Build Frontend Locally

```bash
npm --prefix ppt-viewer run build
```

Output goes to `ppt-viewer/dist/`, served by `server.mjs` as static files.

## Start Preview Server Locally

Default port `9030`:

```bash
node server.mjs
```

Open: `http://localhost:9030/`

View specific project: `http://localhost:9030/?project=3` (e.g., 003_visual_spec)

## Recommended Local Dev Setup

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
