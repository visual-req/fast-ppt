# Concept

![Outline Detail Workflow](../assets/en-US/outline-detail-flow.svg)

## What This System Solves

This system doesn't generate a static `.pptx` or a single long image. It produces a set of artifacts that can be rendered, iteratively improved, and reused by a frontend viewer.

The final deliverables are:

- `deck.json`
- `slides/*.json`
- `work/assets/*.svg`

The frontend renders, previews, and navigates based on this data.

## Why JSON Storage

JSON is chosen for three roles in the pipeline: generation, storage, and rendering.

**Reason 1: Output is naturally structured data.** A PPT here is deck metadata, page order, layout_type, titles, cards, tables, steps, swimlanes, diagram references — all naturally structured fields.

**Reason 2: Low frontend read cost.** `ppt-viewer` reads `deck.json` and `slides/*.json` directly. No document parsing or format conversion needed.

**Reason 3: Easy programmatic validation.** JSON enables checking field completeness, `layout_type` validity, `slide_files` consistency, SVG existence, and missing titles or headers — making QA rule-based, not just visual.

**Reason 4: Version-control friendly.** JSON is text, suitable for diff, review, partial edits, rollback, and batch replacement.

## Why Independent Deck Files

Each project gets its own directory:

```
work/ppt/001_project/deck.json
work/ppt/001_project/slides/*.json
```

**Reason 1:** A deck is a complete delivery unit with its own metadata, pages, and assets.

**Reason 2:** Independent directories allow parallel generation and editing without cross-project pollution.

**Reason 3:** The server loads by project directory — simpler than a monolithic file.

**Reason 4:** Problem isolation is fast — check `outline.json` → `deck.json` → specific slide JSON.

**Reason 5:** Easier to later add theme config, custom resources, or export results per project.

## Four PPT Types

Generate after confirming `deck.type`. Four types supported:

- **Courseware**: lecture sequence, knowledge breakdown, exercises, takeaways
- **Proposal**: problem, solution, architecture, path, risk
- **Report**: conclusions, metrics, progress, comparison, next steps
- **Demo**: narrative rhythm, key pages, live presentation impact

Type determines page rhythm, diagram ratio, layout selection, and copy density.

## Why Outline First, Then Detail

`outline` solves structure. `detail` solves content. They solve different problems.

**Outline solves:**
- What type is this deck
- How chapters are organized
- Whether page order is logical
- What each page intends to communicate
- Which layout each page should use

**Detail then solves:**
- Writing `deck.json`
- Writing `slides/*.json`
- Generating or referencing `work/assets/*.svg`
- Completing pages to previewable, QA-ready state

## Why SVG for Graphics

SVG is preferred for engineering-style PPT systems:

**Reason 1: Precise control.** Position, size, font, color, arrows, connections, layers — critical for structure, relationship, and flow diagrams.

**Reason 2: Version-control friendly.** Text-based, easy to edit: translations, layout, colors, card sizes, alignment.

**Reason 3: Stable scaling.** Remains sharp across screen sizes.

## Why ECharts

ECharts handles standard data charts (bar, line, pie, radar, area) where SVG handwriting would be inefficient. Mature chart types, data-driven, built-in axes/legends/labels.

Principle: structure/relationship/flow diagrams → SVG. Standard data charts → ECharts.

## Why Not High-Resolution Images

Bitmaps are hard to edit locally, poor for engineering reuse, unstable across resolutions, and unstructured for this pipeline's needs. SVG and ECharts are controllable and iterable.

## Summary

The core philosophy in one sentence: determine the type → outline → detail → frontend render & QA → graphics in SVG, data charts in ECharts → avoid hard-to-edit bitmaps.
