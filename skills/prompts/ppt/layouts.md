本文件列出 PPT 的 layout 类型库与推荐字段，用作生成 `work/ppt/001_项目名/slides/*.json` 的参考。

## deck.json 结构

```json
{
  "deck": { "aspect_ratio": "16:9", "style": "consulting", "language": "zh-CN" },
  "slide_files": ["slides/001_cover.json"]
}
```

## layout 类型与字段

基础与导航：

- `cover`: `title` `subtitle` `meta`
- `agenda`: `title` `bullets`
- `section_divider`: `title` `subtitle?` `bullets?`
- `summary`: `title` `bullets`
- `thank_you`: `title` `subtitle?`
- `appendix`: `title` `bullets?`

文本与结构化：

- `title_bullets`: `title` `bullets`
- `two_column`: `title` `columns`（2 列）
- `three_column`: `title` `columns`（3 列）
- `before_after`: `title` `before` `after`（对照，可包含 bullets/table/chart）

混合内容（表/图/要点）：

- `two_column` 推荐使用 `left/right`：
  - `left`: `title?` `bullets?` `blocks?` `table?` `chart?` `text?` `image?`
  - `right`: `title?` `bullets?` `blocks?` `table?` `chart?` `text?` `image?`
  - `chart` 需包含 `layout_type`（如 bar_chart / pie_chart）
  - `image` 支持 `{ "src": "work/assets/xxx.png", "caption": "" }`
- `quote`: `title` `quote` `by?` `notes?`
- `problem_statement`: `title` `blocks`（推荐：现象/影响/根因假设/证据）

图形化表达：

- `kpi_cards`: `title` `cards`（label/value/note）
- `svg_full`: `title?` `svg`（整页 SVG 展示，适合结构图、架构图、流程总图、对比大图）
- `swot`: `title` `quadrants`（4 象限）
- `matrix_2x2`: `title` `quadrants`（4 象限）
- `pyramid`: `title` `levels` 或 `bullets` 或 `blocks`
- `logic_tree`: `title` `root`（text/children）
- `icicle_tree`: `title` `root`（text/children）
- `architecture_layered`: `title` `layers`（{ title, bullets? }[]）
- `dependency_graph`: `title` `nodes` `links`
- `process_flow`: `title` `bullets` 或 `table`
- `timeline`: `title` `bullets` 或 `table`
- `roadmap`: `title` `bullets` 或 `table`
- `milestones`: `title` `table`
- `org_roles`: `title` `table`（或 `bullets`）
- `risk_register`: `title` `table`

数据图表：

- `pie_chart`: `title` `data`（label/value/color?）`unit?`
- `donut_chart`: `title` `data`（label/value/color?）`unit?`
- `bar_chart`: `title` `data` 或 `series` `unit?`
- `line_chart`: `title` `data` 或 `series` `unit?`
- `area_chart`: `title` `data` 或 `series` `unit?`
- `radar_chart`: `title` `categories` `values` 或 `series` `max?`
- `impact_effort`: `title` `items`（name/impact/effort/size?）
- `gantt_chart`: `title` `tasks`（name/start/end/owner?）
- `mind_map`: `title` `root`（text/children）
- `area_chart` / `scatter_plot` / `bubble_chart` / `waterfall_chart` / `funnel_chart` / `heatmap` / `treemap` / `sankey` / `gauge`

## SVG 大图字段

`svg_full` 推荐字段：

```json
{
  "layout_type": "svg_full",
  "title": "架构总览图",
  "svg": {
    "src": "work/assets/xxx.svg",
    "alt": "svg 说明",
    "caption": "图片说明"
  }
}
```

结构化布局：

- `top_bottom`: `title` `top` `bottom`
- `steps`: `title` `steps`（{ title, bullets? }[]）
- `phases`: `title` `phases`（{ title, bullets? }[]）
- `four_grid`: `title` `items`（4 个：{ title, bullets? }）
- `nine_grid`: `title` `items`（9 个：{ title, bullets? }）
- `journey_map`: `title` `stages`（{ name, touchpoints?, painpoints?, opportunities? }[]）
- `swimlane_process`: `title` `lanes`（{ name, steps }[]）

表格与对比：

- `comparison_table`: `title` `table`（headers/rows）
- `plan_table`: `title` `table`
- `cost_benefit`: `title` `table`
- `raci`: `title` `table`（headers/rows）

案例与证据：

- `case_study`: `title` `blocks`（背景/做法/成效/启示）
- `evidence_gallery`: `title` `bullets`
