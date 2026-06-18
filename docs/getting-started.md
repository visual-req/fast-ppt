# Getting Started

![Outline Detail Workflow](assets/outline-detail-flow.svg)

## 快速开始

### 1. 准备输入

把项目材料放到：

```text
work/input/001_项目名/
```

输入材料可以是需求说明、原始文稿、课程草案或方案描述。

### 2. 生成大纲

先运行 Skill 的第一阶段：

```text
/fppt:outline
```

这一阶段会生成：

```text
work/ppt/001_项目名/outline.json
```

### 3. 确认结构

在进入详细页之前，先确认：

- 章节是否完整
- 页序是否合理
- 页面意图是否清晰
- 是否已经规划足够的图页

### 4. 生成详细页

确认无误后再运行：

```text
/fppt:detail
```

这一阶段会生成：

- `deck.json`
- `slides/*.json`
- `work/assets/*.svg`

### 5. 打开预览

启动本地服务后，在浏览器打开：

```text
http://localhost:9030/
```

如果页面没有刷新到最新结果，建议强刷浏览器缓存。
