# fast_ppt

`fast_ppt` 是一个用来生成“网页 PPT”的项目。

它不是一次性吐出一份静态文稿，而是先生成 `outline.json`，确认结构后再生成 `deck.json + slides/*.json`，最后交给前端 viewer 打开和验证。

如果你是第一次看这个项目，可以先记住一句话：

- 这是一个“先出大纲，再出详细页，再在浏览器里预览”的 PPT 生成系统。

## 它能做什么

- 生成可直接被前端读取的 PPT JSON 产物
- 支持 `课件类`、`方案类`、`汇报类`、`演示类` 四种类型
- 支持图形化页面、SVG 素材、结构化 layout
- 支持在本地浏览器中打开、检查和回改
- 支持继续 fork 成你自己的风格和类型体系

## 新手先看这里

如果你只想先跑起来，按这个顺序就够了：

1. 安装前端依赖
2. 启动本地预览服务
3. 打开浏览器看 `9030`

命令如下：

```bash
npm --prefix ppt-viewer install
node server.mjs
```

浏览器打开：

```text
http://localhost:9030/
```

如果你想先看更详细的上手流程，直接读：

- [docs/getting-started.md](docs/getting-started.md)
- [docs/manual.md](docs/manual.md)

如果你在这一步就卡住了，优先看：

- [docs/installation.md](docs/installation.md)
- [docs/troubleshooting.md](docs/troubleshooting.md)

## 3 分钟上手

如果你只想在最短时间内理解这套系统，记住下面 3 件事：

### 1. 它不是直接生成一个最终 PPT 文件

它先生成：

- `outline.json`

再生成：

- `deck.json`
- `slides/*.json`
- `work/assets/*.svg`

也就是说，这套系统更像“先规划，再展开，再预览”。

### 2. 你真正会反复用到的只有两个命令阶段

- `/fppt:outline`
- `/fppt:detail`

一个负责先把结构定住，一个负责把内容和图形补完整。

### 3. 你最后是在浏览器里看结果

启动服务后直接打开：

```text
http://localhost:9030/
```

如果你能理解这三件事，就已经能开始使用这个项目了。

## 最核心的工作方式

这套系统强制采用两阶段流程：

1. `/fppt:outline`
2. `/fppt:detail`

含义是：

- `/fppt:outline` 先生成 `outline.json`
- `/fppt:detail` 再基于已确认的大纲生成 `deck.json + slides/*.json`

这样做的目的，是先把“结构”定住，再展开“内容”和“图形表达”，避免一次生成整套 deck 时失控。

## 你会看到哪些文件

项目的核心产物在：

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

可以把它理解成：

- `work/input/` 放原始材料
- `outline.json` 放章节结构
- `deck.json + slides/*.json` 放页面内容
- `work/assets/*.svg` 放图形素材

## 一个最小使用流程

### 1. 准备输入材料

把你的需求、文稿或资料放到：

```text
work/input/001_项目名/
```

### 2. 先生成大纲

运行：

```text
/fppt:outline
```

这一步会生成：

```text
work/ppt/001_项目名/outline.json
```

### 3. 确认大纲没问题

重点检查：

- 章节顺序是否合理
- 页面类型是否合理
- 图页比例是否足够
- 是否已经选了合适的 layout

### 4. 再生成详细页

运行：

```text
/fppt:detail
```

这一步会生成：

- `deck.json`
- `slides/*.json`
- `work/assets/*.svg`

### 5. 打开浏览器预览

启动服务后访问：

```text
http://localhost:9030/
```

## 适合谁使用

这套系统适合：

- 需要把材料快速整理成网页 PPT 的人
- 想把 PPT 生成流程做成可重复工程的人
- 想继续扩展自己的 layout、风格和类型体系的人

如果你只是想“直接看看怎么操作”，优先读：

- [docs/manual.md](docs/manual.md)

如果你是想“理解为什么这样设计”，优先读：

- [docs/concept.md](docs/concept.md)
- [docs/workflow.md](docs/workflow.md)

如果你是想“自己继续改和扩展”，优先读：

- [docs/layouts.md](docs/layouts.md)
- [docs/fork.md](docs/fork.md)

## 文档导航

- [docs/installation.md](docs/installation.md)
  - 安装依赖、启动服务、构建 viewer
- [docs/getting-started.md](docs/getting-started.md)
  - 新手快速开始
- [docs/manual.md](docs/manual.md)
  - 如何启动和操作前端界面
- [docs/structure.md](docs/structure.md)
  - 项目目录和文件职责
- [docs/concept.md](docs/concept.md)
  - 为什么要先 outline 再 detail，为什么用 SVG / JSON
- [docs/usage.md](docs/usage.md)
  - 实际使用方式
- [docs/workflow.md](docs/workflow.md)
  - 生成流程和质检流程
- [docs/troubleshooting.md](docs/troubleshooting.md)
  - 页面不对、内容不对时怎么排查
- [docs/layouts.md](docs/layouts.md)
  - layout 类型库、示意图和 JSON 示例
- [docs/fork.md](docs/fork.md)
  - 如何改风格、加 layout、改大纲、扩新类型
- [skills/SKILL.md](skills/SKILL.md)
  - Skill 入口说明

## 常见问题入口

如果你是第一次使用，最常见的问题通常是下面几类：

- 不知道先运行什么
  - 先看 [docs/getting-started.md](docs/getting-started.md)
- 服务启动了，但浏览器看不到页面
  - 先看 [docs/installation.md](docs/installation.md)
  - 再看 [docs/troubleshooting.md](docs/troubleshooting.md)
- 页面出来了，但内容不对、layout 不对、图不对
  - 先看 [docs/troubleshooting.md](docs/troubleshooting.md)
  - 再看 [docs/layouts.md](docs/layouts.md)
- 想理解为什么要先 `outline` 再 `detail`
  - 看 [docs/concept.md](docs/concept.md)
  - 看 [docs/workflow.md](docs/workflow.md)
- 想按自己的风格继续改
  - 看 [docs/fork.md](docs/fork.md)

## 如果你要继续扩展

你可以在这几个方向继续演进：

- 调整 viewer 风格
- 新增自己的 layout
- 固定一套自己的大纲结构
- 新增新的 PPT 类型
- 增加自己的质检规则

对应入口文档：

- [docs/layouts.md](docs/layouts.md)
- [docs/fork.md](docs/fork.md)

## 许可证

本项目使用 MIT License，见 [LICENSE](LICENSE)。
