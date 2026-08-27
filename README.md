<h3 align="center">fast_ppt</h3>
<p align="center">Outline → Detail → Preview：一套把材料整理成网页 PPT 的工程化 Skill 体系</p>
<p align="center">
  <a href="README.md">中文</a> · <a href="README.en-US.md">English</a> · <a href="README.ja-JP.md">日本語</a>
  <br/>
  <a href="docs/zh-CN/getting-started.md">快速开始</a> · <a href="docs/zh-CN/ppt-types.md">PPT 类型说明</a> · <a href="docs/zh-CN/examples.md">案例工程</a> · <a href="docs/index.md">文档总入口</a>
</p>
<hr />

License: MIT ([LICENSE](LICENSE))

## 一句话说明

不是一次性吐出一份静态 PPT，而是：**先生成 outline.json → 确认结构 → 再生成 deck.json + slides/*.json → 浏览器预览**。

## 新手先看这里

第一次接触 `fast_ppt`，建议只走这条最短路径：

1. 安装 Skill
2. 看 [快速开始](docs/zh-CN/getting-started.md)
3. 看 [PPT 类型说明](docs/zh-CN/ppt-types.md)
4. 执行 `/fppt:outline` 和 `/fppt:detail`
5. 用 `node server.mjs` 打开预览

如果你只想先跑通一套最小流程，不需要先读完所有文档。

## 它能做什么

- 生成可直接被前端读取的 PPT JSON 产物
- 支持 课件类 / 方案类 / 汇报类 / 演示类 四种类型
- 支持 zh-CN / ja-JP / en-US 三种语言
- 50+ 结构化 layout（卡片、图表、泳道、架构图等）
- 图形化页面优先 SVG，标准数据图支持 ECharts
- 一键导出 PPTX
- 可 fork 成你自己的风格和类型体系

## 快速安装

先安装 Skill：

```bash
npx skills add visual-req/fast-ppt@proposal-generator -g -y
```

或者直接在 AI 工具里说：`请帮我安装 GitHub 仓库 https://github.com/visual-req/fast-ppt 里的 proposal-generator skill`

安装完成后即可使用：

- `/fppt:outline`
- `/fppt:detail`
- `/fppt:viewer`

如果你是在本地 fork 这个仓库并准备改代码，再看 [安装说明](docs/zh-CN/installation.md) 中的“本地开发仓库”部分。

## 3 分钟跑通

### 第 1 步：准备一个项目目录

把材料放进：

```text
work/input/001_项目名/
```

### 第 2 步：先明确 PPT 类型

当前支持四类：

- `课件类`
- `方案类`
- `汇报类`
- `演示类`

不确定怎么选时，先看 [PPT 类型说明](docs/zh-CN/ppt-types.md)。

### 第 3 步：生成结构和详细页

在 AI 工具里依次执行：

```text
/fppt:outline
/fppt:detail
```

### 第 4 步：打开网页预览

```bash
node server.mjs
```

然后打开：

```text
http://localhost:9030/
```

更完整的上手说明，直接看 [快速开始](docs/zh-CN/getting-started.md)。

## 工作流总览

![outline-detail-flow](docs/assets/zh-CN/outline-detail-flow.svg)

1. 准备材料 → `work/input/001_项目名/`
2. `/fppt:outline` → 生成 `outline.json`
3. 确认大纲（章节/页序/图页比例/layout）
4. `/fppt:detail` → 生成 `deck.json` + `slides/*.json` + SVG 素材
5. `node server.mjs` → 浏览器预览 `http://localhost:9030/`

## 核心命令

| 命令 | 作用 | 产出 |
|------|------|------|
| `/fppt:outline` | 生成大纲结构 | `outline.json` |
| `/fppt:detail` | 生成详细页面 + SVG 素材 | `deck.json` + `slides/*.json` + `work/assets/*.svg` |

## 你现在该看哪份文档

按使用目的走，会比顺着目录找更快：

| 你现在想做什么 | 先看这里 |
|----------------|----------|
| 第一次上手，想先跑通一遍 | [快速开始](docs/zh-CN/getting-started.md) |
| 不知道该选哪种 PPT 类型 | [PPT 类型说明](docs/zh-CN/ppt-types.md) |
| 想直接打开现成示例看看效果 | [案例工程](docs/zh-CN/examples.md) |
| 想学会 viewer 操作和导出 PPTX | [操作手册](docs/zh-CN/manual.md) |
| 想回改章节结构、SVG、layout | [调整指南](docs/zh-CN/adjustment.md) |
| 想补背景图、装饰图、说明图 | [美化指南](docs/zh-CN/beautify.md) |
| 想系统理解目录和产物位置 | [项目结构](docs/zh-CN/structure.md) |
| 想做深度定制或 fork | [Fork 指南](docs/zh-CN/fork.md) |

## 文档阅读顺序

如果你是新手，推荐按这个顺序：

1. [快速开始](docs/zh-CN/getting-started.md)
2. [PPT 类型说明](docs/zh-CN/ppt-types.md)
3. [案例工程](docs/zh-CN/examples.md)
4. [操作手册](docs/zh-CN/manual.md)
5. [项目结构](docs/zh-CN/structure.md)

如果你已经跑通一遍，接着看：

- [布局类型库](docs/zh-CN/layouts.md)
- [调整指南](docs/zh-CN/adjustment.md)
- [美化指南](docs/zh-CN/beautify.md)
- [使用说明](docs/zh-CN/usage.md)
- [故障排查](docs/zh-CN/troubleshooting.md)

如果你要理解设计和做定制，再看：

- [工作流](docs/zh-CN/workflow.md)
- [设计理念](docs/zh-CN/concept.md)
- [Fork 指南](docs/zh-CN/fork.md)

文档索引：[docs/index.md](docs/index.md)

## 项目结构图

![project-structure](docs/assets/zh-CN/project-structure.svg)

## FAQ

- 支持什么语言？  
  PPT 生成支持 zh-CN / ja-JP / en-US，文档与 README 分别提供三语版本。
- 产出在哪里？  
  `work/ppt/001_项目名/` 下（outline.json + deck.json + slides/），素材在 `work/assets/`。
- 怎么预览？  
  `node server.mjs` 后打开 `http://localhost:9030/`。
