# Layouts

## 说明

为了避免单个文档过长导致加载缓慢，布局类型库已经拆成：

- 一个总入口：当前页 `layouts.md`
- 四个分类页：`docs/zh-CN/layouts/*.md`

用法建议：

1. 先在本页看“怎么选”
2. 再按分类进入对应页面
3. 在分类页里用“本页目录”跳到具体 layout
4. 用页首和页尾导航跳到其他分类

字段全集和底层类型说明可对照：

- [skills/prompts/ppt/layouts.md](../skills/prompts/ppt/layouts.md)

## 选择建议

- 开场、章节封面：优先 `cover` / `section_divider`
- 结论和摘要页：优先 `title_bullets`
- 对比页：优先 `comparison_table`
- 阶段门禁页：优先 `phases`
- 按角色推进的工作流：优先 `swimlane_process`
- 需要真实图示表达的页面：优先 `svg_full`

## 分类目录

### 1. [封面、分段与泳道类](layouts/01-foundation-flow.md)

适合：封面、章节页、摘要、对比、门禁、泳道流程

- [`cover`](layouts/01-foundation-flow.md#cover)
- [`section_divider`](layouts/01-foundation-flow.md#section_divider)
- [`title_bullets`](layouts/01-foundation-flow.md#title_bullets)
- [`staff_list`](layouts/01-foundation-flow.md#staff_list)
- [`comparison_table`](layouts/01-foundation-flow.md#comparison_table)
- [`phases`](layouts/01-foundation-flow.md#phases)
- [`swimlane_process`](layouts/01-foundation-flow.md#swimlane_process)
- [`swimlane_board`](layouts/01-foundation-flow.md#swimlane_board)

### 2. [说明型与视觉中心页](layouts/02-explainers-visuals.md)

适合：中心概念、能力解释、人物介绍、环形/扇形/芯片式说明

- [`metro_loop`](layouts/02-explainers-visuals.md#metro_loop)
- [`double_loop`](layouts/02-explainers-visuals.md#double_loop)
- [`iceberg`](layouts/02-explainers-visuals.md#iceberg)
- [`house`](layouts/02-explainers-visuals.md#house)
- [`radial_explainer`](layouts/02-explainers-visuals.md#radial_explainer)
- [`brain_explainer`](layouts/02-explainers-visuals.md#brain_explainer)
- [`profile_intro`](layouts/02-explainers-visuals.md#profile_intro)
- [`chip_explainer`](layouts/02-explainers-visuals.md#chip_explainer)
- [`petal_explainer`](layouts/02-explainers-visuals.md#petal_explainer)
- [`fan_explainer`](layouts/02-explainers-visuals.md#fan_explainer)
- [`screen_explainer`](layouts/02-explainers-visuals.md#screen_explainer)

### 3. [结构、流程与架构页](layouts/03-structure-analysis.md)

适合：阶段推进、结构对称、问题定义、架构分层、依赖和根因分析

- [`stage_chevrons`](layouts/03-structure-analysis.md#stage_chevrons)
- [`stage_staircase`](layouts/03-structure-analysis.md#stage_staircase)
- [`stage_zigzag`](layouts/03-structure-analysis.md#stage_zigzag)
- [`development_route`](layouts/03-structure-analysis.md#development_route)
- [`cycle_explainer`](layouts/03-structure-analysis.md#cycle_explainer)
- [`svg_full`](layouts/03-structure-analysis.md#svg_full)
- [`two_column`](layouts/03-structure-analysis.md#two_column)
- [`symmetric_split`](layouts/03-structure-analysis.md#symmetric_split)
- [`three_column`](layouts/03-structure-analysis.md#three_column)
- [`problem_statement`](layouts/03-structure-analysis.md#problem_statement)
- [`before_after`](layouts/03-structure-analysis.md#before_after)
- [`kpi_cards`](layouts/03-structure-analysis.md#kpi_cards)
- [`steps`](layouts/03-structure-analysis.md#steps)
- [`four_grid`](layouts/03-structure-analysis.md#four_grid)
- [`matrix_2x2`](layouts/03-structure-analysis.md#matrix_2x2)
- [`quadrant_axes`](layouts/03-structure-analysis.md#quadrant_axes)
- [`architecture_layered`](layouts/03-structure-analysis.md#architecture_layered)
- [`dependency_graph`](layouts/03-structure-analysis.md#dependency_graph)
- [`fishbone`](layouts/03-structure-analysis.md#fishbone)

### 4. [图表、补充与计划页](layouts/04-data-extended.md)

适合：图表、计划、总结、角色分工、日历、案例和证据页

- [`bar_chart`](layouts/04-data-extended.md#bar_chart)
- [`line_chart`](layouts/04-data-extended.md#line_chart)
- [`agenda`](layouts/04-data-extended.md#agenda)
- [`summary`](layouts/04-data-extended.md#summary)
- [`thank_you`](layouts/04-data-extended.md#thank_you)
- [`appendix`](layouts/04-data-extended.md#appendix)
- [`quote`](layouts/04-data-extended.md#quote)
- [`triple_metrics`](layouts/04-data-extended.md#triple_metrics)
- [`swot`](layouts/04-data-extended.md#swot)
- [`pyramid`](layouts/04-data-extended.md#pyramid)
- [`logic_tree`](layouts/04-data-extended.md#logic_tree)
- [`icicle_tree`](layouts/04-data-extended.md#icicle_tree)
- [`process_flow`](layouts/04-data-extended.md#process_flow)
- [`timeline`](layouts/04-data-extended.md#timeline)
- [`roadmap`](layouts/04-data-extended.md#roadmap)
- [`milestones`](layouts/04-data-extended.md#milestones)
- [`org_roles`](layouts/04-data-extended.md#org_roles)
- [`risk_register`](layouts/04-data-extended.md#risk_register)
- [`pie_chart`](layouts/04-data-extended.md#pie_chart)
- [`donut_chart`](layouts/04-data-extended.md#donut_chart)
- [`area_chart`](layouts/04-data-extended.md#area_chart)
- [`coordinate_axis`](layouts/04-data-extended.md#coordinate_axis)
- [`scatter_plot`](layouts/04-data-extended.md#scatter_plot)
- [`bubble_chart`](layouts/04-data-extended.md#bubble_chart)
- [`waterfall_chart`](layouts/04-data-extended.md#waterfall_chart)
- [`funnel_chart`](layouts/04-data-extended.md#funnel_chart)
- [`heatmap`](layouts/04-data-extended.md#heatmap)
- [`treemap`](layouts/04-data-extended.md#treemap)
- [`sankey`](layouts/04-data-extended.md#sankey)
- [`gauge`](layouts/04-data-extended.md#gauge)
- [`radar_chart`](layouts/04-data-extended.md#radar_chart)
- [`impact_effort`](layouts/04-data-extended.md#impact_effort)
- [`gantt_chart`](layouts/04-data-extended.md#gantt_chart)
- [`mind_map`](layouts/04-data-extended.md#mind_map)
- [`top_bottom`](layouts/04-data-extended.md#top_bottom)
- [`nine_grid`](layouts/04-data-extended.md#nine_grid)
- [`journey_map`](layouts/04-data-extended.md#journey_map)
- [`plan_table`](layouts/04-data-extended.md#plan_table)
- [`cost_benefit`](layouts/04-data-extended.md#cost_benefit)
- [`raci`](layouts/04-data-extended.md#raci)
- [`target_map`](layouts/04-data-extended.md#target_map)
- [`sector_explainer`](layouts/04-data-extended.md#sector_explainer)
- [`upward_arrows`](layouts/04-data-extended.md#upward_arrows)
- [`kanban_board`](layouts/04-data-extended.md#kanban_board)
- [`month_calendar`](layouts/04-data-extended.md#month_calendar)
- [`case_study`](layouts/04-data-extended.md#case_study)
- [`evidence_gallery`](layouts/04-data-extended.md#evidence_gallery)

## 选型原则

- 页面意图先于 layout 选择
- 对比页不要误用步骤图
- 阶段页不要退回普通表格
- 工作流页优先保留时序和泳道语义
- 三层结构图优先 `svg_full`，且内容不要写成 bullets
- 数据对比优先 `bar_chart`，趋势优先 `line_chart/area_chart`
- 构成占比优先 `pie_chart/donut_chart`，多维评分优先 `radar_chart`
- 项目计划优先 `gantt_chart`，只想交付清单优先 `plan_table`
- 坐标定位优先 `coordinate_axis/scatter_plot/bubble_chart`，四象限解释优先 `quadrant_axes/impact_effort/matrix_2x2`
