# Workflow

![Outline Detail Workflow](../assets/en-US/outline-detail-flow.svg)

## Two-Phase Model

This Skill enforces a two-phase generation process:

1. `outline`
2. `detail`

This is not an implementation detail — it's a quality control mechanism.

## Phase 1: Outline

**Input:** User requirements, project materials, type prompt, main prompt

**Output:** `outline.json`

**Goal:** Confirm PPT type, chapter structure, page order, page intent, layout selection per page.

## Phase 2: Detail

**Input:** Confirmed `outline.json`

**Output:** `deck.json`, `slides/*.json`, `work/assets/*.svg`

**Goal:** Convert page structure to renderable JSON, produce SVG assets for diagram pages, complete pages ready for frontend preview.

## QA Loop

QA applies to both the PPT output and the Skill's own working method.

### Skill Self-QA

Check if: the two-phase process was followed, type was confirmed before generation, page intent was judged before layout selection, graphic pages actually produce SVG, each round outputs clear pass/fail/retry actions.

### Outline QA

Check: correct type, complete chapter chain, planned diagram pages, clear page intent.

### Detail QA

Check: complete fields, consistent `slide_files`, assets actually exist, correct layout for comparison/phase/swimlane pages, `svg_full` truly graphical.

## Page Expression Rules

- Comparison pages: `comparison_table` or contrast cards
- Phase pages: `phases` / `steps`
- Temporal workflow: `swimlane_process`
- Three-layer architecture: `svg_full`
- `svg_full`: don't repeat page title inside SVG; title belongs to deck page
