# Workflow

![Outline Detail Workflow](../assets/en-US/outline-detail-flow.svg)

## Why It Is Not One-Shot Generation

The core of `fast_ppt` is not "ask a model to output 60 finished slides in one pass". The core is to split the work into layers that can be checked and revised:

1. `outline`
2. `detail`

That matters because:

- structure problems should be solved at the structure layer
- page problems should be solved at the page layer
- diagram problems should be solved in SVG or layout components

Without that split, you end up with a deck that feels wrong everywhere but has no clean place to fix it.

## Standard Workflow

The normal sequence is:

1. prepare input materials
2. run `/fppt:outline`
3. review and confirm `outline.json`
4. run `/fppt:detail`
5. preview `deck.json + slides/*.json`
6. revise structure, pages, or assets

You can think of it this way:

- `outline` builds the skeleton
- `detail` builds the pages
- the viewer validates whether the result truly works

## Phase 1: Outline

### Input

- user requirements
- project materials
- type prompt
- main prompt

### Output

- `outline.json`

### What This Phase Must Decide

- PPT type
- chapter structure
- page order
- page intent
- likely `layout_type` for each page

### What This Phase Should Not Do Too Early

- do not try to fully write every page
- do not try to draw every graphic yet
- do not jump into final deck generation before structure is confirmed

## Phase 2: Detail

### Input

- confirmed `outline.json`

### Output

- `deck.json`
- `slides/*.json`
- `work/assets/*.svg`

### What This Phase Is Responsible For

- turning page structure into renderable JSON
- generating real SVG assets for graphic-heavy pages
- making pages complete enough for frontend preview

### What This Phase Should Not Be Used For

- redefining the overall chapter logic from scratch
- patching structural mistakes slide by slide

If every page is editable but the whole deck still feels wrong, you probably need to go back to `outline`.

## Which Layer to Fix

This is the part most teams mix up.

### Case 1: Chapter order is wrong

Fix:

- `outline.json`

Do not manually patch order only in `slides/*.json`.

### Case 2: A page uses the wrong layout

Prefer fixing:

- page intent / layout choice in `outline.json`

Then refine if needed in:

- `slides/*.json`

### Case 3: Text is fine, but the page is not graphical enough

Fix:

- `slides/*.json`
- `work/assets/*.svg`
- the corresponding viewer layout component

### Case 4: Viewer looks right, export does not

Fix:

- viewer layout
- `deckRenderer.ts`
- `pptxExport.mjs`

That is a rendering consistency issue, not a content issue.

## QA Loop

QA should validate not only the slides, but the workflow itself.

### 1. Skill Self-QA

Check whether:

- `outline -> detail` was followed strictly
- detail generation started only after type confirmation
- page intent was evaluated before layout choice
- graphic pages became real SVG or structured layouts
- every round reports clear pass / fail / revise actions

This layer checks whether the method is stable.

### 2. Outline QA

Check:

- correct PPT type
- complete chapter chain
- reasonable diagram ratio
- clear page intent
- no obvious duplicate or jumpy pages

### 3. Detail QA

Check:

- complete fields
- `slide_files` matches actual files
- assets actually exist
- content stays inside deck bounds
- comparison / phase / swimlane pages use the right layout
- `svg_full` is truly graphical

## Page Expression Rules

- comparison pages: prefer `comparison_table` or contrast cards
- phase pages: prefer `phases` / `steps`
- temporal workflow: prefer `swimlane_process`
- three-layer structure: prefer `svg_full`
- goal progression: prefer `target_map`
- execution state pages: prefer `kanban_board`
- funnel convergence: prefer `funnel_chart`
- `svg_full`: do not repeat the page title inside the SVG; the deck title already carries it

## A Very Common Wrong Flow

The wrong flow usually looks like this:

1. skip outline review
2. generate detail immediately
3. notice many pages are wrong
4. keep patching individual slides
5. end up with a deck that is locally fixed but globally messy

The better flow is:

1. make `outline.json` coherent first
2. then generate detail
3. validate in the viewer
4. revise by structure layer, page layer, or asset layer

## Continue Reading

- [Getting Started](getting-started.md): run your first pass
- [Structure](structure.md): where everything lives
- [Manual](manual.md): day-to-day working guidance
