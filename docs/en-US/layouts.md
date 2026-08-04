# Layouts

See the complete [Chinese version](../zh-CN/layouts.md) for all layout types with SVG previews and JSON examples.

The following layouts are available in `ppt-viewer`:

## Basic & Navigation
- `cover`, `agenda`, `section_divider`, `summary`, `thank_you`, `appendix`

## Text & Structure
- `title_bullets`, `staff_list`, `two_column`, `symmetric_split`, `three_column`, `quote`, `problem_statement`, `before_after`, `triple_metrics`

## Graphics
- `kpi_cards`, `swot`, `matrix_2x2`, `pyramid`, `logic_tree`, `icicle_tree`, `architecture_layered`, `dependency_graph`, `process_flow`, `timeline`, `roadmap`, `milestones`, `org_roles`, `risk_register`, `target_map`, `sector_explainer`, `double_loop`, `house`, `radial_explainer`, `brain_explainer`, `profile_intro`, `chip_explainer`, `petal_explainer`, `fan_explainer`, `screen_explainer`, `stage_chevrons`, `stage_staircase`, `stage_zigzag`, `development_route`, `cycle_explainer`, `upward_arrows`, `iceberg`, `fishbone`, `kanban_board`, `month_calendar`

## Data Charts
- `pie_chart`, `donut_chart`, `bar_chart`, `line_chart`, `area_chart`, `waterfall_chart`, `funnel_chart`, `heatmap`, `treemap`, `sankey`, `gauge`, `radar_chart`, `impact_effort`, `gantt_chart`

## Specialized
- `mind_map`, `top_bottom`, `nine_grid`, `journey_map`, `plan_table`, `cost_benefit`, `raci`, `case_study`, `evidence_gallery`, `phases`, `swimlane_process`, `swimlane_board`, `metro_loop`, `svg_full`, `comparison_table`, `steps`, `four_grid`, `matrix_2x2`, `quadrant_axes`, `coordinate_axis`, `scatter_plot`, `bubble_chart`

## Recent Additions
- `title_bullets` now also covers executive-summary pages with `subtitle` and `cards`
- `steps` supports `icon + text + bullets` for linear rollout or integration paths
- `phases` supports `narrow: true` for compact 5-phase overviews
- `swimlane_process` can define `headers` for each stage column
- `swimlane_board` supports lane-by-lane responsibility or module breakdown with horizontal cards inside each lane
- `architecture_layered` supports `icon + text + bullets` for layered platform/system pages
- `nine_grid` supports `icon + text + bullets` for system-boundary or platform-overview pages
- `process_flow` now supports structured `steps + footer_cards + summary`, which fits input-process-output, stage chains, and workflow pages with result cards
- `roadmap` now supports `items.period`, bottom `actions`, and a closing `goal` summary
- `metro_loop` supports loop-style stages with a center card and bottom summary metrics
- `agenda` supports a left-exposed hero circle, enlarged lead card, and soft bubble decoration behind the topic list
- `double_loop` supports an infinity-shaped dual-loop layout with named nodes on both circles
- `house` now uses a lower and wider roof, side columns, a taller central house body, and a steadier foundation area
- `radial_explainer` supports a large center circle with a diagonally rotated 4-topic explanation structure
- `brain_explainer` supports a central brain graphic with surrounding explanation modules
- `profile_intro` supports a half-photo, half-structured personal profile page with tags and sections
- `chip_explainer` supports a dark tech-style central chip graphic with denser, thinner pins and four surrounding explanation cards
- `petal_explainer` supports four symmetric petals around a center core title
- `fan_explainer` supports an electric-fan style visual with a central fan body and four surrounding explanation modules
- `screen_explainer` supports a large center screen with floating explanation windows around it
- `stage_chevrons` supports shallow top chevrons with tall content rectangles below each stage
- `stage_staircase` supports staircase-like rising stages
- `stage_zigzag` supports alternating top-bottom stage chains
- `development_route` supports a multi-peak mountain backdrop with the route rising along the mountain ridges
- `cycle_explainer` supports a single-loop closed cycle with evenly distributed edge nodes, solid connectors, and directional arrows
- `upward_arrows` supports four progressively higher but wider upward arrows with lower arrowheads for denser content
- `iceberg` supports a more natural iceberg silhouette with layered facets above and below the waterline
- `fishbone` supports a full-width horizontal fishbone with evenly spread top and bottom branches
- `funnel_chart` supports stage values plus narrative cards on the right side
- `comparison_table` supports evenly distributed comparison columns with synchronized grid lines and text blocks
- `target_map` supports milestone-to-goal pages with a start badge, path markers, and a target summary
- `sector_explainer` supports left semi-circle sectors with labels spread more evenly along the vertical span plus right-side explanation cards
- `kanban_board` supports execution boards such as To Do / In Progress / Review / Done
- `month_calendar` supports month-view planning pages with weekday headers, day cells, and event tags
- `symmetric_split` supports mirrored left-right explanation pages with a centered axis and balanced panels
- `triple_metrics` supports three large circular metric displays for key data highlights
- `staff_list` supports a segmented proportion bar with red-gold staff decorations at both ends instead of an ordinary list
- New or experimental layouts do not have to become standalone viewer components first; they may be delivered as `svg_full` assets in `work/assets/*.svg`

## Selection Principles
- Page intent before layout choice
- Comparison pages → don't use step diagrams
- Phase pages → don't fall back to plain tables
- Workflow pages → preserve sequence and swimlane semantics
- Three-layer diagrams → use `svg_full`, don't write as bullets
- Data comparison → `bar_chart`, trends → `line_chart`/`area_chart`
- Composition → `pie_chart`/`donut_chart`, multi-metric → `radar_chart`
- Project planning → `gantt_chart`, deliverable lists → `plan_table`
