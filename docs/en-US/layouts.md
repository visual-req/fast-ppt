# Layouts

See the complete [Chinese version](../zh-CN/layouts.md) for all layout types with SVG previews and JSON examples.

The following layouts are available in `ppt-viewer`:

## Basic & Navigation
- `cover`, `agenda`, `section_divider`, `summary`, `thank_you`, `appendix`

## Text & Structure
- `title_bullets`, `two_column`, `three_column`, `quote`, `problem_statement`, `before_after`

## Graphics
- `kpi_cards`, `swot`, `matrix_2x2`, `pyramid`, `logic_tree`, `icicle_tree`, `architecture_layered`, `dependency_graph`, `process_flow`, `timeline`, `roadmap`, `milestones`, `org_roles`, `risk_register`

## Data Charts
- `pie_chart`, `donut_chart`, `bar_chart`, `line_chart`, `area_chart`, `waterfall_chart`, `funnel_chart`, `heatmap`, `treemap`, `sankey`, `gauge`, `radar_chart`, `impact_effort`, `gantt_chart`

## Specialized
- `mind_map`, `top_bottom`, `nine_grid`, `journey_map`, `plan_table`, `cost_benefit`, `raci`, `case_study`, `evidence_gallery`, `phases`, `swimlane_process`, `svg_full`, `comparison_table`, `steps`, `four_grid`, `matrix_2x2`, `quadrant_axes`, `coordinate_axis`, `scatter_plot`, `bubble_chart`

## Selection Principles
- Page intent before layout choice
- Comparison pages → don't use step diagrams
- Phase pages → don't fall back to plain tables
- Workflow pages → preserve sequence and swimlane semantics
- Three-layer diagrams → use `svg_full`, don't write as bullets
- Data comparison → `bar_chart`, trends → `line_chart`/`area_chart`
- Composition → `pie_chart`/`donut_chart`, multi-metric → `radar_chart`
- Project planning → `gantt_chart`, deliverable lists → `plan_table`
