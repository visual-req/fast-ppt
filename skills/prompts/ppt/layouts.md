本文件列出 PPT 的 layout 类型库与推荐字段，用作生成 `work/ppt/001_项目名/slides/*.json` 的参考。

补充约定：如果当前类型库里没有完全匹配的新 layout，允许先使用 `svg_full` + `work/assets/*.svg` 落地，不必为了新增版式强行增加新的 `layout_type`。只有当该版式会被反复复用、字段结构稳定时，再考虑沉淀为独立 layout。

## deck.json 结构

```json
{
  "deck": { "aspect_ratio": "16:9", "style": "consulting", "language": "zh-CN", "type": "方案类" },
  "slide_files": ["slides/001_cover.json"]
}
```

`language` 三选一：`zh-CN`（中文）/ `ja-JP`（日语）/ `en-US`（英语）。全部页面内容必须统一语言。

## layout 类型与字段

基础与导航：

- `cover`: `title` `subtitle` `meta`
- `agenda`: `title` `bullets`
- `section_divider`: `title` `subtitle?` `bullets?`
- `summary`: `title` `bullets`
- `thank_you`: `title` `subtitle?`
- `appendix`: `title` `bullets?`

文本与结构化：

- `title_bullets`: `title` `bullets` `subtitle?` `cards?` `foreground?` `background?`（适合“一个总判断 + 3-6 条要点”，也适合“执行摘要 / 一个底座 + 多类能力 + 保障”这类页；`cards` 可补充 2-4 个并列结果卡片）
- `two_column`: `title` `columns`（2 列）
- `three_column`: `title` `columns`（3 列）
- `before_after`: `title` `before` `after`（before / after 各支持 `title` + `text`（段落） + `bullets`（列表）。`text` 与 `bullets` 可共存（text 在上、bullets 在下），也可只填其一。before 红底，after 绿底。）

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
- `quadrant_axes`: `title` `x_label` `y_label` `quadrants`（带坐标轴的 4 象限）
- `pyramid`: `title` `levels` 或 `bullets` 或 `blocks`
- `logic_tree`: `title` `root`（text/children）
- `icicle_tree`: `title` `root`（text/children）
- `architecture_layered`: `title` `layers`（{ title, icon?, bullets? }[]）
- `dependency_graph`: `title` `nodes` `links`
- `fishbone`: `title` `effect` `bones`（{ category, causes }[]，适合根因分析）
- `process_flow`: `title` `steps` `footer_cards?` `summary?`（适合“线性流程 + 输出卡 / 支撑卡 / 指标卡”的页面；`steps` 为 { title, subtitle?, text?, bullets?, icon?, accent?, panels? }[]，`panels` 为步骤内的子卡片）
- `timeline`: `title` `bullets` 或 `table`
- `roadmap`: `title` `items?` `actions?` `goal?`（`items` 支持 { title, period?, text?, subtitle? }[]，`actions` 适合“下一步启动建议 / 关键动作”）
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
- `coordinate_axis`: `title` `x_label` `y_label` `points`（x/y/label/size?/color?）
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
- `steps`: `title` `steps`（{ title, icon?, text?, bullets? }[]；适合“三步/四步/五步方法论”“集成路径”“样板 -> 复制 -> 规模化”等线性推进内容）
- `phases`: `title` `phases` `narrow?`（{ title, icon?, text?, bullets?, gate? }[]；`narrow: true` 适合 5 阶段左右的紧凑总览）
- `four_grid`: `title` `items`（4 个：{ title, icon?, text?, bullets? }）
- `nine_grid`: `title` `items`（9 个：{ title, icon?, text?, bullets? }；适合“系统边界 / 能力地图 / 平台全景 / 九类模块总览”）
- `journey_map`: `title` `stages`（{ name, touchpoints?, painpoints?, opportunities? }[]）
- `swimlane_process`: `title` `headers?` `lanes`（{ name, steps }[]；适合“角色 × 阶段”矩阵型流程，如用户/派车员/司机的协同流程）
- `metro_loop`: `title` `center` `stops` `metrics?`（适合“持续改进闭环 / AIOps 闭环 / 地铁环线式阶段链路”；`center` 含 `title/text`，`stops` 为 { title, text?, icon?, line?, color? }[]，`metrics` 为底部摘要指标）

表格与对比：

- `comparison_table`: `title` `table`（headers/rows）
- `plan_table`: `title` `table`
- `cost_benefit`: `title` `table`
- `raci`: `title` `table`（headers/rows）

案例与证据：

- `case_study`: `title` `blocks`（背景/做法/成效/启示）
- `evidence_gallery`: `title` `bullets`
