# Structure

![Project Structure](assets/project-structure.svg)

## 项目目录

```text
fast_ppt/
  README.md
  LICENSE
  docs/
  skills/
    SKILL.md
    prompts/
      ppt/
  ppt-viewer/
  work/
    input/
    ppt/
    assets/
  server.mjs
```

## 目录职责

### `docs/`

放项目文档，包括安装、快速开始、工作流与概念说明。

### `skills/`

放 Skill 入口定义和提示词。

- `SKILL.md`：Skill 元信息与执行约束
- `prompts/ppt/`：PPT 生成提示词

### `ppt-viewer/`

网页 PPT 的前端渲染工程。

- 负责读取 `deck.json + slides/*.json`
- 按 `layout_type` 映射到对应 Vue 布局组件
- 提供预览与构建能力

### `work/input/`

放原始输入材料，按项目分目录。

### `work/ppt/`

放每个项目生成出来的 `outline.json`、`deck.json` 和 `slides/*.json`。

### `work/assets/`

放真实被页面引用的 SVG 图形素材。

### `server.mjs`

本地预览服务入口，用于聚合 deck 数据并提供浏览器访问。
