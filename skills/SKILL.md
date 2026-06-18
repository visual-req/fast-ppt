---
name: "proposal-generator"
description: "按项目先生成并确认 outline.json，再生成 deck.json + slides/*.json，并通过前端工程打开。Invoke when user asks to generate PPT / deck / presentation."
---

# proposal-generator

该 Skill 用于生成可直接被前端打开的网页 PPT JSON 数据。

它的核心约束不是“一次性输出 deck”，而是采用两阶段流程：

1. 先生成并确认 `outline.json`
2. 再生成 `deck.json + slides/*.json`

## 适用场景

- 用户要求“做成 PPT / 汇报稿 / 路演稿 / deck”
- 用户希望输出可直接打开的网页 PPT
- 用户希望同时得到结构大纲、详细页与图形素材

## Commands

### `/fppt:outline`

生成并写出 `work/ppt/001_项目名/outline.json`，用于确认章节结构、页面顺序、布局选择和每页核心结论。

流程：
1. 判断 PPT 类型（课件类/方案类/汇报类/演示类）
2. 读取对应类型提示词（`skills/prompts/ppt/01~04_*.md`）
3. 规划章节结构、页面顺序、每页 layout_type 和决策目的
4. 写出 `outline.json`
5. 执行大纲质检，通过后才能进入下一阶段

### `/fppt:detail`

基于已确认的 `outline.json`，生成 `deck.json + slides/*.json`，补齐每页的文案、图表字段和素材引用。

流程：
1. 读取已确认的 `outline.json`
2. 逐页生成 slide JSON，填充 title/subtitle/blocks/table/chart/svg 等字段
3. 对图形页主动在 `work/assets/` 下生成 SVG 资产
4. 写出 `deck.json` 和所有 `slides/*.json`
5. 执行详细页质检，通过后再交付

### `/fppt:viewer`

启动前端预览服务。

流程：
1. 如果 `ppt-viewer/dist/` 不存在，先执行 `npm --prefix ppt-viewer run build`
2. 执行 `node server.mjs`
3. 服务启动在 `http://localhost:9030/`

也可以用项目根目录的快捷命令：
- `npm run dev`：先 build 再启动
- `npm start`：直接启动（需已 build）

### `/fppt:review`

基于已生成的 detail（deck.json + slides），站在听众视角对内容进行全面的审阅评判。

流程：
1. 读取 `deck.json` 确定 PPT 类型（课件类/方案类/汇报类/演示类）
2. 读取 `skills/prompts/ppt/05_review.md` 中的审阅标准
3. 先检查 deck 的页顺序、章节归属、前后承接和主题一致性，再逐页读取 slides JSON 评判：
   - 可理解性：听众一次性能否听懂核心信息？
   - 结构清晰度：页面信息层级是否一目了然？
   - 信息密度：是否过于拥挤或过于空洞？
   - 视觉匹配度：layout_type 选择是否合理？
   - 承接连贯性：前后页逻辑是否流畅？
   - 章节归属合理性：页面是否放在正确章节
   - 主题关联性：标题、内容、章节主题是否一致
   - 布局合理性：当前 layout_type 是否真的适合内容表达
   - 图形质量：如为图表/SVG/流程图，额外检查结构、内容、序号、对齐与完整显示
4. 根据 PPT 类型叠加专用审阅维度（见 05_review.md）
5. 输出 `work/ppt/XXX/review-yyyyMMddHHmmss.md`，包含：
   - 总体评分与总评
   - 逐页诊断（问题 + 严重等级 + 改进建议）
   - 优先级排序的修改清单

## 工作区结构

```text
work/
  input/
    001_项目名/
  ppt/
    001_项目名/
      outline.json
      deck.json
      slides/
        001_cover.json
        002_agenda.json
        ...
  assets/
    *.svg
```

## 类型支持

生成时必须先确定 `deck.type`，四选一：

- `课件类`
- `方案类`
- `汇报类`
- `演示类`

类型一旦确定，必须继续读取对应提示词：

- `skills/prompts/ppt/01_课件类.md`
- `skills/prompts/ppt/02_方案类.md`
- `skills/prompts/ppt/03_汇报类.md`
- `skills/prompts/ppt/04_演示类.md`

## 输出要求

必须输出到项目目录：

- `work/ppt/001_项目名/outline.json`
- `work/ppt/001_项目名/deck.json`
- `work/ppt/001_项目名/slides/*.json`

图示类素材默认输出到：

- `work/assets/*.svg`

前端工程通过读取 `deck.json + slides/*.json` 聚合展示，不再要求生成 `deck.html`。

## 质量要求

- 强制使用 `outline -> detail` 两阶段流程
- `outline` 阶段结束后必须先做一轮大纲质检
- `detail` 阶段结束后必须再做一轮详细页质检
- 图示类页面优先采用 `svg_full`、`phases`、`swimlane_process`、`comparison_table` 等结构化表达
- `svg_full` 默认不在 SVG 内重复写页面标题，标题由 deck 页标题承担
- 页面标题必须是业务主题或结论，禁止直接使用布局名称作为标题；不要出现“九宫格”“四宫格”“步骤图”“流程图”“甘特图”等命名

## 提示词目录

```text
fast_ppt/
  README.md
  LICENSE
  docs/
    usage.md
    workflow.md
    layouts.md
  skills/
    SKILL.md
    prompts/
      ppt/
        00_PPT生成.md
        01_课件类.md
        02_方案类.md
        03_汇报类.md
        04_演示类.md
        05_review.md
        layouts.md
        layout_rules.md
        examples/
```

## 参考文档

- [README.md](../README.md)
- [docs/usage.md](../docs/usage.md)
- [docs/workflow.md](../docs/workflow.md)
- [docs/layouts.md](../docs/layouts.md)
