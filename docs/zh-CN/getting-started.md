# Getting Started

![Outline Detail Workflow](../assets/zh-CN/outline-detail-flow.svg)

## 这份文档适合谁

如果你是第一次接触 `fast_ppt`，最推荐按这份文档走一遍。目标不是先把所有概念看懂，而是先把一套最小流程跑通：

1. 准备输入材料
2. 生成 `outline.json`
3. 确认结构
4. 生成 `deck.json + slides/*.json`
5. 打开 viewer 预览

读完后，你应该知道三件事：

- 材料应该放哪里
- `outline` 和 `detail` 分别做什么
- 预览结果不对时，应该回到哪一层修改

## 前置准备

开始之前，先确保本地环境已经可用：

- 已安装依赖：`npm install`
- 已安装 viewer 依赖：`npm --prefix ppt-viewer install`
- 能启动本地服务：`node server.mjs`

如果还没做这些，请先看[安装说明](installation.md)。

## 第 1 步：准备输入材料

把一个项目的原始材料放进：

```text
work/input/001_项目名/
```

推荐做法：

- 一个项目一个目录，使用三位数字前缀：`001_项目名`
- 输入材料尽量集中，不要散落在多个无关目录
- 文件命名尽量能看出用途，例如：
  - `需求说明.md`
  - `课程草案.md`
  - `原始讲稿.txt`
  - `参考资料.pdf`

这些材料可以是：

- 需求说明
- 课程大纲
- 演讲草稿
- 方案描述
- 原始调研材料

## 第 2 步：先生成大纲

第一阶段只做结构，不直接生成全部页面：

```text
/fppt:outline
```

这一步的核心产物是：

```text
work/ppt/001_项目名/outline.json
```

这一阶段主要解决：

- 这是课件、方案、汇报还是演示
- 章节应该怎么拆
- 页序怎么排
- 哪些页面适合图形化表达
- 每页大概应该用什么 `layout_type`

## 第 3 步：确认大纲，不要直接跳 detail

很多质量问题，根源不是某一页写得差，而是结构在 outline 阶段就歪了。

进入 detail 之前，建议至少检查这些点：

- 章节链路是否完整
- 页序是否顺
- 有没有明显重复页
- 页面意图是否明确
- 是否已经安排足够的图页，而不是全是文字页

如果这一步不对，应该回改 `outline.json`，而不是急着生成详细页。

更多原因可以看[工作流](workflow.md)。

## 第 4 步：再生成详细页

确认大纲后，再进入第二阶段：

```text
/fppt:detail
```

这一阶段会生成：

- `deck.json`
- `slides/*.json`
- `work/assets/*.svg`

你会在下面这个目录里看到完整结果：

```text
work/ppt/001_项目名/
```

其中：

- `deck.json`：整套 deck 的全局配置
- `slides/*.json`：每一页的页面数据
- `work/assets/*.svg`：图示类页面引用的真实 SVG 资产

## 第 5 步：启动预览

启动本地服务：

```bash
node server.mjs
```

然后在浏览器打开：

```text
http://localhost:9030/
```

如果你有多个项目，可以通过项目编号或目录名切换预览。

常见用法：

- `http://localhost:9030/?project=001`
- `http://localhost:9030/?project=001_项目名`

## 第 6 步：怎么看预览结果

预览时，重点不要只看“好不好看”，还要看结构是否真的成立。

建议检查：

- 标题和内容是否一致
- layout 是否选对
- 内容有没有超出 deck 范围
- SVG 页面是不是图形化表达，而不是把一堆文字塞进图里
- agenda / cover / section divider 是否有明显层次感

如果问题属于结构层，就回 `outline`；
如果问题属于页面表达层，就回 `slides/*.json` 或 SVG 资产。

## 一条最常用的最小流程

```bash
npm install
npm --prefix ppt-viewer install
node server.mjs
```

然后在对话里按顺序执行：

```text
/fppt:outline
/fppt:detail
```

## 下一步看什么

跑通第一遍后，建议按这个顺序继续看：

1. [工作流](workflow.md)：为什么一定要分 `outline -> detail`
2. [项目结构](structure.md)：各目录分别放什么
3. [布局类型库](layouts.md)：每页能用哪些 layout
4. [操作手册](manual.md)：实际工作时怎么配合使用
