# Usage

## 适用场景

当用户希望把输入材料生成成 PPT / deck / presentation，且最终产物需要落为网页 PPT JSON 时，使用该 Skill。

典型诉求包括：

- “帮我生成 PPT”
- “把这份材料做成 deck”
- “输出可直接打开的网页 PPT”

## 基本流程

### 1. 生成大纲

使用 `/fppt:outline`：

- 判定 PPT 类型
- 规划章节
- 选择每页的页面意图与 layout
- 落盘 `outline.json`

### 2. 确认大纲

在进入详细页之前，必须确认：

- 章节顺序合理
- 页面意图合理
- 布局选择合理
- 关键页面没有缺失

### 3. 生成详细页

使用 `/fppt:detail`：

- 生成 `deck.json`
- 生成 `slides/*.json`
- 生成或引用 `work/assets/*.svg`
- 补齐图形、结构图、对比表格、阶段图等

### 4. 进行质检

需要分别执行两轮质检：

- 大纲质检
- 详细页质检

每轮质检至少输出：

- 通过项
- 未通过项
- 修改动作
- 阶段判定

## 输出目录

```text
work/ppt/001_项目名/
  outline.json
  deck.json
  slides/
```

素材输出到：

```text
work/assets/
```
