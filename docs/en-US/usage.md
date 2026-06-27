# Usage

## When to Use

Use this Skill when the user wants to turn input materials into a PPT / deck / presentation, with the final output as web PPT JSON.

Typical requests include:

- "Generate a PPT"
- "Turn this document into a deck"
- "Output a viewable web PPT"

## Basic Flow

### 1. Generate Outline

Use `/fppt:outline`:

- Determine PPT type
- Plan chapters
- Select page intent and layout per page
- Write `outline.json`

### 2. Confirm Outline

Before generating detail pages, confirm:

- Chapter order is logical
- Page intent is reasonable
- Layout selection is appropriate
- No key pages are missing

### 3. Generate Detail Pages

Use `/fppt:detail`:

- Generate `deck.json`
- Generate `slides/*.json`
- Generate or reference `work/assets/*.svg`
- Complete graphics, structure diagrams, comparison tables, phase diagrams, etc.

### 4. QA

Two rounds of QA:

- Outline QA
- Detail QA

Each round outputs at minimum: passed items, failed items, fix actions, phase verdict.

## Output Directory

```
work/ppt/001_project/
  outline.json
  deck.json
  slides/
```

Assets output to:

```
work/assets/
```
