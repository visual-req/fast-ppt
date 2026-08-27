<h3 align="center">fast_ppt</h3>
<p align="center">Outline → Detail → Preview: An engineered Skill system for turning materials into web PPTs</p>
<p align="center">
  <a href="README.md">中文</a> · <a href="README.en-US.md">English</a> · <a href="README.ja-JP.md">日本語</a>
  <br/>
  <a href="docs/en-US/getting-started.md">Getting Started</a> · <a href="docs/en-US/manual.md">Manual</a> · <a href="docs/en-US/examples.md">Examples</a> · <a href="docs/en-US/concept.md">Concept</a>
</p>
<hr />

License: MIT ([LICENSE](LICENSE))

## One-Liner

Not a one-shot static PPT generator — **outline.json → confirm → deck.json + slides/*.json → browser preview**.

## What It Does

- Generates PPT JSON directly readable by the frontend
- Four types: Courseware / Proposal / Report / Demo
- Three languages: zh-CN / ja-JP / en-US
- 50+ structured layouts (cards, charts, swimlanes, architecture, etc.)
- Graphics-first: SVG for diagrams, ECharts for data charts
- One-click PPTX export
- Fully forkable

## Quick Start

Install the Skill first:

```bash
npx skills add visual-req/fast-ppt@proposal-generator -g -y
```

Or just tell your AI tool: `Please help me install the proposal-generator skill from the GitHub repository https://github.com/visual-req/fast-ppt`

After installation, use:

- `/fppt:outline`
- `/fppt:detail`
- `/fppt:viewer`

If you are forking this repository and want to modify the code locally, see the "Local repository development" section in [Installation](docs/en-US/installation.md).

## Workflow

![outline-detail-flow](docs/assets/en-US/outline-detail-flow.svg)

1. Prepare input → `work/input/001_project/`
2. `/fppt:outline` → generates `outline.json`
3. Confirm structure (chapters / page order / diagram ratio / layout)
4. `/fppt:detail` → generates `deck.json` + `slides/*.json` + SVG assets
5. `node server.mjs` → preview at `http://localhost:9030/`

## Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `/fppt:outline` | Generate outline structure | `outline.json` |
| `/fppt:detail` | Generate detail pages + SVG assets | `deck.json` + `slides/*.json` + `work/assets/*.svg` |

## Project Structure

![project-structure](docs/assets/en-US/project-structure.svg)

## Docs

Get started:
- [Getting Started](docs/en-US/getting-started.md)
- [Installation](docs/en-US/installation.md)
- [Manual](docs/en-US/manual.md)
- [Examples](docs/en-US/examples.md)

Understand:
- [Concept](docs/en-US/concept.md)
- [Workflow](docs/en-US/workflow.md)
- [Structure](docs/en-US/structure.md)

Deep dive:
- [Layouts](docs/en-US/layouts.md)
- [Usage](docs/en-US/usage.md)
- [Troubleshooting](docs/en-US/troubleshooting.md)

Customize:
- [Fork Guide](docs/en-US/fork.md)

Full index: [docs/index.md](docs/index.md)

## FAQ

- Languages supported?
  PPT generation: zh-CN / ja-JP / en-US. Docs and README are available as separate files in all three languages.
- Where do outputs go?
  `work/ppt/001_project/` (outline.json + deck.json + slides/), assets in `work/assets/`.
- How to preview?
  `node server.mjs` then open `http://localhost:9030/`.
