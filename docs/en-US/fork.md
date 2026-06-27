# Fork Guide

## Fork vs. Download

This is a question that's often skipped but very important.

**Download (git clone / Download ZIP)**:

- You get a copy of the code to run locally
- You can modify it, but there's no connection to the original project
- When the original project updates, you have to manually re-download or merge
- Best for: just using the system as-is, no modifications, or one-off runs

**Fork (GitHub Fork)**:

- Creates a linked copy under your GitHub account connected to the original repo
- You can freely modify your fork while keeping the ability to sync with upstream
- When the original project updates, use `git pull upstream` to merge
- When you make valuable changes, you can send Pull Requests back to the original project
- Best for: continuous use, continuous customization, long-term maintenance of your own version

In a nutshell:

> Download = Take a copy and use it. Done.
> Fork = Take a copy and make it yours, while staying in sync with the original.

**How to Fork on GitHub**:

1. Open the original project page (e.g., `https://github.com/visual-req/fast-ppt`)
2. Click the **Fork** button in the top-right corner
3. Choose to fork to your personal account or organization
4. Clone your forked repo locally: `git clone https://github.com/your-account/fast-ppt.git`
5. Add the original as upstream: `git remote add upstream https://github.com/visual-req/fast-ppt.git`
6. To sync later: `git fetch upstream && git merge upstream/main`

**What "Fork" means in this guide**:

In this guide, "Fork" goes beyond the GitHub feature — it means **customizing this system into your own style and generation workflow**. After forking, you can:

- Change visual styles and layout components
- Add or modify PPT types
- Swap outline structures and QA rules
- Build your own prompt system and examples

If you only want to use this project to generate PPTs without modifying code, see [getting-started.md](getting-started.md) and [installation.md](installation.md) instead.

---

Want to customize this system? Fork at these layers:

- Visual style
- Layout components
- Outline structure
- PPT types
- QA rules

## Quick Start by Goal

### Change Visual Style
Edit: `ppt-viewer/src/style.css`, `ppt-viewer/src/components/layouts/*.vue`

### Add a New Layout
1. Create Vue component in `ppt-viewer/src/components/layouts/`
2. Register in `ppt-viewer/src/layoutRegistry.ts`
3. Update `docs/layouts.md` and `skills/prompts/ppt/layouts.md`
4. Add a sample slide in a project

### Add a New PPT Type
1. Create prompt file: `skills/prompts/ppt/05_NewType.md`
2. Create examples: `skills/prompts/ppt/examples/NewType/`
3. Update `skills/SKILL.md`
4. Update `docs/concept.md` and `docs/usage.md`
5. Verify with real input

### Adjust QA Rules
Edit: `skills/prompts/ppt/00_PPT生成.md`, `skills/prompts/ppt/layout_rules.md`

## Files Changed by Goal

| Goal | Files to Change |
|------|----------------|
| Visual style | `ppt-viewer/src/style.css`, `*.vue` |
| New layout | Component + registry + layouts.md + layout_rules.md |
| New outline structure | `01-04_*.md` prompts + examples |
| New type | New prompt + examples + SKILL.md + docs |
| QA rules | `00_PPT生成.md` + `layout_rules.md` |

## Recommended Fork Order

1. Style first (quickest visible win)
2. Add 1-2 most-used layouts
3. Fix preferred outline structure
4. Expand to new types last (largest scope)

## Verification

After forking, verify with a real deck:
1. Generate `outline.json`
2. Generate `deck.json + slides/*.json`
3. Preview in browser
4. Write findings back to prompts, components, and docs

For detailed walkthroughs and troubleshooting, see the complete [Chinese fork guide](../zh-CN/fork.md).
