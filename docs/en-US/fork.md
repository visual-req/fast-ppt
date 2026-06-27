# Fork Guide

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
