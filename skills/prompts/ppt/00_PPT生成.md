## 目标

将项目内容输出为“前端可直接打开的 PPT JSON 数据”，但生成过程必须保留 `outline.json` 这一必要中间产物：先产出并确认大纲，再生成页面级 JSON。

## 命令入口

- `/fppt:outline`：生成并写出 `outline.json`，用于确认章节结构、页面顺序、页面布局选择和每页核心结论。这一步是必需的，不能跳过。
- `/fppt:detail`：在已存在且已确认的 `outline.json` 基础上，生成 `deck.json + slides/*.json`，重点补充每页 JSON 的 text、blocks、table、chart 占位、讲述要点和页面文案。

执行规则：

1. `/fppt:outline` 先做“类型判定 + 章节规划 + 页面结构设计”，并落盘 `outline.json` 供用户确认。
2. `/fppt:outline` 完成后，必须先做一轮大纲质检；未通过时先回改 `outline.json`，不能直接进入下一阶段。
3. `/fppt:detail` 不重写整体结构，优先基于已确认的 `outline.json` 细化页面字段与表达。
4. 如果还没有 `outline.json`，则不能直接执行 `/fppt:detail`；如果 `outline.json` 尚未确认，也不应直接生成详细内容。
5. `/fppt:detail` 完成后，必须再做一轮详细页质检；未通过时先回改页面，再交付结果。
6. `deck.json + slides/*.json` 是详细交付物，不用于替代 `outline.json` 的确认环节。
7. 若类型为 `课件类`，默认进入“详尽课件模式”，优先保证教学完整性、章节展开和多页讲解，不主动压缩页数。

## 工作区约定（必须遵守）

以"项目"为单位组织输入与输出，目录命名统一为 `001_项目名`：

- 输入：`work/input/001_项目名/`
- 输出：`work/ppt/001_项目名/`
- 素材：`work/assets/`（用于放置图片、截图、示意图，供 PPT 页面引用）

## 文件同步与编号规则（必须遵守）

1. `deck.json` 与 `outline.json` 必须完全同步：修改任一文件时，另一个必须同时更新。两文件的 slide 数量、编号、顺序必须一致。
2. slides 目录下的文件名必须是 `001.json` ~ `NNN.json`，编号必须连续无跳号。调整顺序时必须同时重命名文件，使用两步法避免覆盖：先全部加 `X_` 前缀，再逐一改为目标序号。
3. 同类页面必须集中放置：例如所有痛点汇总页紧邻，所有痛点详解页紧随其后，不得将同类内容分散在不同段落。
4. 任何时候修改文件后，必须执行 `cd ppt-viewer && npm run build` 构建前端。

## 可视化交付硬约束

生成 PPT 时，不能只保证“结构完整”，还必须保证“画面可读”。以下要求默认为硬约束：

- 最终 `deck.json + slides/*.json` 中，至少 `30%` 页面应采用图表、结构图、流程图、矩阵、图文双栏、架构图、泳道图或关系图等强视觉布局，不能长期被纯文字页占满
- 任意一个完整章节，至少应包含 `1` 张结构图 / 关系图页，以及 `1` 张图表 / 表格 / 图文组合页
- 不允许连续出现 `3` 页以上纯文字说明页；连续两页文字密度较高时，下一页应优先切换到图形化布局
- 对“演进、架构、关系、流程、职责、路径、规则”类内容，优先使用 `svg_full`、`mind_map`、`architecture_layered`、`logic_tree`、`journey_map`、`swimlane_process`、`dependency_graph`
- 对“趋势、对比、构成、成熟度、优先级、排期、收益风险”类内容，优先使用 `bar_chart`、`line_chart`、`radar_chart`、`impact_effort`、`gantt_chart`、`cost_benefit`、`risk_register`
- 若页面采用 `two_column` 且一侧声明为 `image`，则详细阶段必须提供真实素材路径，不能把“建议配图”直接当作最终交付
- 对“阶段、质检链路、执行链路、工作流”类内容，必须体现时间顺序或阶段顺序，不能画成静态散点式关系图

### 布局选择与图形生成规则（必须遵守）

- 先判断页面意图，再选 layout：定义/结构/关系 → 优先 `svg_full`（图解）或 `architecture_layered`/`steps`；对比/权衡 → `comparison_table`/`matrix_2x2`；流程/链路 → `steps`/`swimlane_process`
- 对比类页面必须用“对比布局”表达：优先 `comparison_table`，或用 `two_column`/`four_grid` 做对比卡片；不要用 `steps` 代替对比
- 阶段类页面必须用“阶段图”表达：如“大纲 -> 详细页 -> 质检 -> 回改”这类内容，优先 `steps`、`phases`，或直接用 `svg_full` 画阶段卡片与箭头，不要退回表格
- 生成 `four_grid`、`nine_grid`、`steps`、`phases`、`architecture_layered` 时，默认给每个模块生成一个 `icon` 字段；图标值使用简短英文 key，不使用 emoji
- 多角色、跨泳道、按时序推进的工作流，优先 `swimlane_process`；如果默认布局表现不够，应改用 `svg_full` 画成真正的泳道时序图，但仍要保留“按角色分泳道、按时间从左到右/从上到下推进”的结构
- 三层结构（上/中/下、金字塔、价值分层）优先 `svg_full`：每层内部要有清晰的名称块，内容用短句或标签表达，不要把每层重新退回 bullet 列表
- 除非页面意图就是“目录/知识树/分类树”，否则不要滥用树形结构（`mind_map`/`logic_tree`/`icicle_tree`）；避免出现“树形目录过多导致像文档提纲”的观感
- `svg_full` 默认要求：SVG 内不重复写页面标题；标题默认由 deck 页标题承担；只有在用户明确要求“该页不显示 deck 标题”时，才通过页面字段关闭外部标题。SVG 画面要填满 16:9（避免大量留白导致缩小）；所有文字必须中文（除非是代码/命令/路径）；避免密集 bullet，优先用卡片、标签、箭头、层次关系表达
- `impact_effort`/`before_after`/`dependency_graph` 等“容易看起来像纯文字”的页面，如果文字占比过高，优先转成 `svg_full` 的信息图表达
- 如果一页的核心任务是“比较差异”，就不要改成步骤图；如果一页的核心任务是“说明时序/阶段/执行路径”，就不要改成对比表格

### 素材兜底规则

当用户没有提供现成图片时，也不能把图页留成空壳。默认按以下顺序兜底：

1. 优先改用可直接渲染的结构化布局，而不是退回纯文字页
2. 如果页面天然适合“大图总览”，则主动在 `work/assets/` 下生成可引用的 `svg` 资产，并在页面 JSON 中写入真实路径
3. `svg_full`、`image`、课堂练习右侧配图位，一旦出现在详细页里，应尽量提供真实素材，而不是只写“建议放某图”
4. 若暂时只能做占位图，也必须输出真实文件，并在 caption 中说明图的表达对象、替换方向和使用目的

### 两阶段补充要求

- `/fppt:outline` 阶段除了规划页序，还必须说明每页采用哪种视觉表达方式，避免后续默认回退成文字页
- `/fppt:outline` 阶段必须同时标注页面意图：该页究竟是“对比页 / 阶段页 / 时序泳道页 / 结构关系页 / 三层分层页”，避免详细阶段选错 layout
- `/fppt:detail` 阶段除了补全文案，还必须落实图表字段、结构图字段和 `work/assets/` 素材文件
- `/fppt:detail` 阶段如果采用 `svg_full`，必须同时决定“是否显示 deck 页标题”；默认显示，只有用户明确要求时才关闭
- 质检时要单独检查“图页占比、素材是否真实落盘、是否仍存在大面积文字堆积”
- 质检时还要单独检查“对比页是否误用步骤图、阶段页是否误用表格、时序工作流是否真的按顺序表达”

## 语言（必须明确）

PPT 支持三种语言，`deck.language` 字段三选一：

- `zh-CN`：简体中文（**默认语言**）
- `ja-JP`：日本語
- `en-US`：English

### 语言选择方式

语言可通过以下两种方式之一确定：

**方式一：对话中直接指定**

用户可在对话中直接说明语言偏好，例如：
- "用日语生成 PPT"
- "这个 PPT 用英文"
- "ja-JP でお願いします"

此时直接使用用户指定的语言，无需确认。

**方式二：/fppt:outline 阶段交互选择**

如果用户未在对话中指定语言，`/fppt:outline` 阶段必须**主动使用 `AskUserQuestion` 工具**让用户选择语言：

```
header: "PPT 语言"
question: "请选择 PPT 的生成语言："
options:
  - 简体中文（默认, Recommended）
  - 日本語
  - English
```

### 语言确认规则

1. **默认语言**：如果用户全程未提及语言，且 outline 阶段也未明确选择，则默认使用 `zh-CN`（简体中文）。
2. **语义自动识别**：如果用户仅用某一种语言提问（如全程日语），可在 outline 阶段直接默认该语言，但仍需在 AskUserQuestion 中确认。
3. **语言确定后不可混用**：全部内容（标题、要点、图表文案、SVG 内所有文字）必须使用该语言，不得混用。
4. **输入文件多语混合**：若 `work/input/` 下的需求说明为多语混合，以用户确认的语言为准。

### 多语约束

- SVG 内所有 `text`、`tspan` 节点的内容必须跟随选定语言
- 表格 headers、chart labels、步骤标题等所有文案必须统一语言
- 页面标题禁止出现跨语言混用（如中文标题出现英文 layout 名）
- `deck.json` 必须写入 `language` 字段，前端根据该字段适配 UI 文案

## PPT 类型（必须先选其一）

生成时必须先确定 PPT 类型，并在 `deck` 中写入 `type` 字段（四选一）：

- `课件类`：以“知识点/步骤/示例/练习”为主，适合培训与教学
- `方案类`：以“目标-现状-差距-方案-路径-成本收益-风险”为主，适合售前与咨询
- `汇报类`：以“结论先行-数据支撑-决策项-下一步”为主，适合管理层汇报
- `演示类`：以“故事线-卖点-场景-操作/效果”为主，适合产品/功能演示

类型确认顺序：

1. 先读取用户提供的需求文件。
2. 如果需求文件里明确写了 `PPT类型`，则直接按该类型生成。
3. 如果需求文件里没有写明 `PPT类型`，则必须先与用户交互选择，不要自行判断。

类型确定后，必须继续读取对应文件：

- `课件类` → `skills/proposal-generator/prompts/ppt/01_课件类.md`
- `方案类` → `skills/proposal-generator/prompts/ppt/02_方案类.md`
- `汇报类` → `skills/proposal-generator/prompts/ppt/03_汇报类.md`
- `演示类` → `skills/proposal-generator/prompts/ppt/04_演示类.md`

可选参考骨架：

- `课件类` → `skills/proposal-generator/prompts/ppt/examples/课件类/outline.json` + `deck.json` + `slides/*.json`
- `方案类` → `skills/proposal-generator/prompts/ppt/examples/方案类/outline.json` + `deck.json` + `slides/*.json`
- `汇报类` → `skills/proposal-generator/prompts/ppt/examples/汇报类/outline.json` + `deck.json` + `slides/*.json`
- `演示类` → `skills/proposal-generator/prompts/ppt/examples/演示类/outline.json` + `deck.json` + `slides/*.json`

总入口只做类型判定与公共约束，四类的详细结构和生成方法以下游类型文件为准。

`/fppt:outline` 可参考对应示例骨架起草，但必须结合当前项目输入重写页面标题、要点和结构，并先写入 `outline.json`。

对于 `课件类`，总入口还必须额外遵守：

- 先识别每章属于“多概念并列 / 方法框架 / 系统构成 / 普通知识讲解”中的哪一类
- 再套用 `01_课件类.md` 中对应的详尽章节模板
- 不允许只给出过度压缩的章节级提纲
- 不允许为了减少页数而跳过案例页、练习页、质量保证页、优化页等关键教学页面
- 生成文案时，默认把页面表达改成“老师可直接拿来讲”的课堂语气，而不是文档提纲、说明书或汇报口吻

## 四类统一执行矩阵

四类类型都必须遵守同一个两阶段流程：

1. `/fppt:outline`：先生成并确认 `outline.json`
2. `/fppt:detail`：再基于已确认的 `outline.json` 生成 `deck.json + slides/*.json`

如果 `outline.json` 未生成或未确认，则不能直接进入详细页生成。

各类型的默认执行重点如下：

- `课件类`
  目标：把知识讲会，而不是只给提纲
  默认结构：概念介绍 + 详细解析 + 案例介绍 + 练习/讨论 + 小结
  默认展开：复杂概念、多概念并列、方法框架、系统构成、Harness 主题都要主动拆页
  拆页触发：同页承担多个知识动作、详细解析包含两个以上解释维度、练习页缺少题目与配图位

- `方案类`
  目标：说明问题、提出方案、证明可行、推动决策
  默认结构：背景与目标 + 现状与问题 + 总体方案 + 分项设计 + 实施路径 + 收益/风险 + 建议
  默认展开：总体方案、分项设计、实施路径、风险保障应分别展开，不应压成一页
  拆页触发：同页同时出现问题、方案、计划、风险，或多个子方案仅被并列罗列

- `汇报类`
  目标：快速传达结论、支撑判断、推动决策
  默认结构：结论 + 事实支撑 + 问题/偏差 + 建议动作 + 决策项/支持请求 + 下一步
  默认展开：重要判断默认补齐“结论页 + 支撑页 + 动作/决策页”
  拆页触发：结论缺少事实支撑、问题缺少影响说明、决策请求被埋在普通说明页里

- `演示类`
  目标：吸引注意、建立兴趣、强化记忆、促成认可
  默认结构：场景引入 + 亮点主张 + 能力展示 + 使用流程 + 效果对比 + 行动引导
  默认展开：核心亮点默认补齐“亮点页 + 能力页 + 场景/效果页”，流程内容补齐“总览 + 关键步骤”
  拆页触发：同页同时承担场景、卖点、流程、效果，或 3 个以上卖点被堆成一页

使用要求：

1. 总入口先判断类型，再套用对应子 prompt。
2. 若主题较复杂，优先按各类型的默认结构补齐，而不是先压页数。
3. 详细阶段发现信息过载时，应回退到拆页，而不是继续堆 bullets。
4. `deck.json + slides/*.json` 必须体现对应类型的结构节奏，不能只有章标题和简短页名。

## 统一质检输出模板

四类类型在完成每一轮质检后，都应按统一模板输出检查结论，不要只写一句“已检查”。

推荐固定使用以下结构：

1. `通过项`
2. `未通过项`
3. `修改动作`
4. `阶段判定`

其中：

- `通过项`：列出当前已经满足的关键要求
- `未通过项`：列出当前仍存在的问题，不允许含糊带过
- `修改动作`：逐条说明准备如何修改未通过项
- `阶段判定`：只能二选一，写明“允许进入下一阶段”或“必须回改后再检查”

推荐格式：

```md
质检结论

- 通过项：
  - ...
- 未通过项：
  - ...
- 修改动作：
  - ...
- 阶段判定：允许进入下一阶段 / 必须回改后再检查
```

如果没有明确写出 `阶段判定`，则默认视为当前阶段尚未通过。

通用示例：

```md
质检结论

- 通过项：
  - 已生成 `outline.json`，并覆盖主要章节结构
  - 页面顺序已与当前类型的默认结构保持一致
- 未通过项：
  - 两个核心页面标题仍偏文档化，不够像可直接展示的页面
  - 关键支撑页不足，当前还不能进入详细页生成
- 修改动作：
  - 重写相关页面标题，改成更明确的页面意图表达
  - 补充缺失的支撑页后，再重新执行本轮质检
- 阶段判定：必须回改后再检查
```

## 输出形式（必须遵守）

写入：

- `work/ppt/001_项目名/outline.json`：章节大纲、页面规划、布局选择、每页核心结论，供 `/fppt:outline` 阶段确认
- `work/ppt/001_项目名/deck.json`：整套课程的元信息与页面顺序
- `work/ppt/001_项目名/slides/*.json`：每页一个 JSON，按顺序保存
- 前端工程通过读取 `deck.json + slides/*.json` 打开课程内容，不再生成 `deck.html`

阶段约束：

1. `outline.json` 是结构确认稿，必须先生成。
2. `deck.json + slides/*.json` 是确认后的详细稿，不能跳过前一阶段直接生成。
3. 若用户要求直接出详细页，也必须先在项目目录内补齐 `outline.json`。

并参考：

- `skills/proposal-generator/prompts/ppt/layouts.md`：layout 类型库与字段参考
- `skills/proposal-generator/prompts/ppt/layout_rules.md`：layout 选用规则（必须遵守）

## 页面结构（deck.json + slides/*.json）

`deck.json` 必须包含 `type` 和 `language` 字段，示例如下（三语）：

```json
// 中文
{ "deck": { "aspect_ratio": "16:9", "style": "consulting", "language": "zh-CN", "type": "方案类" } }

// 日语
{ "deck": { "aspect_ratio": "16:9", "style": "consulting", "language": "ja-JP", "type": "方案类" } }

// 英语
{ "deck": { "aspect_ratio": "16:9", "style": "consulting", "language": "en-US", "type": "方案类" } }
```

每页 JSON 必须声明 `layout_type`，例如：

```json
{
  "layout_type": "cover",
  "title": "",
  "subtitle": "",
  "meta": { "client": "", "date": "", "version": "" }
}
```

## 布局类型（只能从此列表选择）

基础与导航：

- cover / agenda / section_divider / summary / thank_you / appendix

文本与结构化：

- title_bullets / two_column / three_column / quote / problem_statement / before_after

图形化表达：

- kpi_cards / swot / matrix_2x2 / pyramid / logic_tree / icicle_tree / architecture_layered / dependency_graph / process_flow / timeline / roadmap / milestones / org_roles / risk_register

数据图表：

- pie_chart / donut_chart / bar_chart / line_chart / area_chart / radar_chart / scatter_plot / bubble_chart / waterfall_chart / funnel_chart / heatmap / treemap / sankey / gauge / impact_effort / gantt_chart / mind_map

结构化布局：

- top_bottom / steps / phases / four_grid / nine_grid / journey_map / swimlane_process

表格与对比：

- comparison_table / plan_table / cost_benefit / raci

案例与证据：

- case_study / evidence_gallery

## 规则

- 画幅 16:9
- 每页 1 个核心结论，正文不超过 6 行要点
- 无数据时允许占位符，但必须写清楚图的维度与含义
