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

## 命令入口

- `/fppt:outline`
  - 生成并写出 `outline.json`
  - 用于确认章节结构、页面顺序、页面意图与布局选择
- `/fppt:detail`
  - 基于已确认的 `outline.json`
  - 生成 `deck.json + slides/*.json`
  - 补齐页面字段、图形表达与素材引用

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
        layouts.md
        layout_rules.md
        examples/
```

## 参考文档

- [README.md](../README.md)
- [docs/usage.md](../docs/usage.md)
- [docs/workflow.md](../docs/workflow.md)
- [docs/layouts.md](../docs/layouts.md)
