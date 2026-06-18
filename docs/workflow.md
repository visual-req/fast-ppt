# Workflow

![Outline Detail Workflow](assets/outline-detail-flow.svg)

## 两阶段模型

该 Skill 强制使用两阶段生成流程：

1. `outline`
2. `detail`

这不是实现细节，而是产物质量控制机制。

## 阶段一：Outline

输入：

- 用户需求
- 项目材料
- 类型提示词
- 总提示词

输出：

- `outline.json`

目标：

- 明确 PPT 类型
- 明确章节结构
- 明确页面顺序
- 明确页面意图
- 明确每页 layout 选择

## 阶段二：Detail

输入：

- 已确认的 `outline.json`

输出：

- `deck.json`
- `slides/*.json`
- `work/assets/*.svg`

目标：

- 把页面级结构落成可渲染 JSON
- 把图示类页面落成真实 SVG 资产
- 把页面内容补足到前端可直接打开的程度

## 质检闭环

质检不只针对生成出来的 PPT 产物，也针对 Skill 本身的工作方式是否稳定。

### Skill 自身质检

检查重点：

- 是否严格执行了 `outline -> detail` 两阶段
- 是否在类型未确认时错误开始生成
- 是否先判断页面意图，再选择 layout
- 是否把图形页真的落成 SVG，而不是退回纯文字
- 是否在每轮生成后给出明确的通过项、未通过项和回改动作

这一层的目标不是看页面好不好看，而是看 Skill 自己有没有按正确方法工作。

### 大纲质检

检查重点：

- 类型是否正确
- 章节链路是否完整
- 是否已经规划图页
- 页面意图是否清晰

### 详细页质检

检查重点：

- 字段是否完整
- `slide_files` 是否一致
- 资产是否真实存在
- 对比页/阶段页/泳道页是否选对 layout
- `svg_full` 是否真正图形化表达

## 页面表达规则

- 对比页：优先 `comparison_table` 或对比卡片
- 阶段页：优先 `phases` / `steps`
- 时序工作流：优先 `swimlane_process`
- 三层结构：优先 `svg_full`
- `svg_full`：SVG 内不重复写页面标题，标题默认由 deck 页标题承担
