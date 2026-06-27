# Troubleshooting

## When Pages Look Wrong

### Symptom 1: Wrong Layout

E.g., a comparison page showing as steps, workflow showing as table, layered architecture still showing as bullets.

**Fix:**
1. Open the page's `slides/*.json`
2. Check `layout_type`
3. Change to correct layout

Common mappings:
- Comparison: `comparison_table`
- Phases: `phases`
- Workflow: `swimlane_process`
- Structure/relationship/layered diagram: `svg_full`

### Symptom 2: Title Wrong or Missing

**Fix:**
1. Check `title` in page JSON
2. For `svg_full` pages, check if `show_title: true` is set
3. Don't duplicate page title inside SVG

### Symptom 3: SVG Image Wrong

E.g., text still in wrong language, image not updated, size/position off.

**Fix:**
1. Open `work/assets/*.svg` directly
2. Edit SVG text, structure, or dimensions
3. Verify `svg.src` in page JSON points to the correct file
4. Force-refresh browser

### Symptom 4: Content Overflowing Screen

**Fix:**
1. Reduce bullet density first
2. If inherently a structure diagram, change to `svg_full`
3. If a phase chain, change to `phases`
4. If a process, change to `swimlane_process`

## When Content Is Wrong

### Symptom 1: Inaccurate Page Expression

**Fix:**
1. Find the corresponding `slides/*.json`
2. Directly edit field content
3. If the issue is systemic, also update prompts

### Symptom 2: Too Few Diagrams / Too Text-Heavy

**Fix:**
1. Judge if the page should be graphical
2. If yes, add or replace with `work/assets/*.svg`
3. Change page to `svg_full`

### Symptom 3: Frontend Changed But Browser Won't Show

**Fix:**
1. Confirm service is running on port `9030`
2. Check `http://localhost:9030/api/deck` response
3. Force-refresh browser
4. Restart `node server.mjs` if needed

## Recommended Investigation Order

1. Check page JSON is correct
2. Check referenced SVG is correct
3. Check frontend layout component behavior
4. Finally update prompts to prevent recurrence
