# Fork

## Fork 和下载有什么区别

这是一个常被跳过但非常重要的问题。

**下载（clone / download ZIP）**：

- 拿到一份代码副本，放在本地运行
- 你可以改代码，但和原项目没有任何关联
- 原项目更新后，你需要手动重新下载或手动合并
- 适合：只想用这套系统、不改动，或者临时跑一次

**Fork（GitHub Fork）**：

- 在你的 GitHub 账号下创建一个与原项目关联的分支仓库
- 你可以在 Fork 上自由修改，同时保留与原项目的同步能力
- 当原项目更新时，可以通过 `git pull upstream` 拉取合并
- 当你做了有价值的改动，可以通过 Pull Request 回馈原项目
- 适合：想持续使用、持续定制、长期维护自己的版本

简单一句话：

> 下载 = 拿一份用，用完就完了。
> Fork = 拿一份改，改成自己的，还能跟上原项目的更新。

**GitHub 上 Fork 的操作路径**：

1. 打开原项目页面（如 `https://github.com/visual-req/fast-ppt`）
2. 点击右上角 **Fork** 按钮
3. 选择 Fork 到你的个人账号或组织
4. Clone 你 Fork 后的仓库到本地：`git clone https://github.com/你的账号/fast-ppt.git`
5. 添加原项目为 upstream：`git remote add upstream https://github.com/visual-req/fast-ppt.git`
6. 以后需要同步时：`git fetch upstream && git merge upstream/main`

**本项目的 Fork 特指什么**：

本文档中的 "Fork" 不止是 GitHub 上的功能操作，更是指**将这套系统定制成你自己的风格和生成体系**。Fork 之后，你可以：

- 改视觉风格、改 layout 组件
- 新增或调整 PPT 类型
- 换大纲结构和质检规则
- 形成你自己的提示词体系和 examples

如果你只是想用这个项目生成 PPT、不改代码，请直接看 [getting-started.md](getting-started.md) 和 [installation.md](installation.md)，不需要读 Fork 指南。

## 适用场景

当你希望把这套系统改成自己喜欢的风格，或者扩展自己的 PPT 生成方法时，可以从以下几层入手：

- 视觉风格
- layout 布局
- 大纲结构
- PPT 类型
- 质检规则

## 快速导航

如果你不是从头读，而是带着明确任务来，可以直接跳到下面对应部分：

- 想改整体视觉：看“调整自己喜欢的风格”
- 想新增一个 layout：看“补充自己喜欢的布局”和“一次完整 Fork 演练”
- 想改章节结构：看“调整大纲结构”
- 想新增一种 PPT 类型：看“扩展新的 PPT 类型”和“一个新增类型的完整演练”
- 想补自己的规则体系：看“调整质检规则”
- 想排查为什么改了没生效：看“Fork 后常见问题”和“推荐排查顺序”

如果你是第一次 fork，推荐阅读顺序：

1. 先看“调整自己喜欢的风格”
2. 再看“补充自己喜欢的布局”
3. 然后看“一次完整 Fork 演练”
4. 最后看“Fork 后常见问题”

这样更容易先理解系统怎么工作，再开始扩展。

## 最短上手路径

如果你不想一次看完整份文档，可以按你的目标直接走最短路径：

### 目标 1：只想改成自己喜欢的视觉

直接看：

1. “调整自己喜欢的风格”
2. “推荐验证方式”

最少改这些文件：

- `ppt-viewer/src/style.css`
- `ppt-viewer/src/components/layouts/*.vue`
- `skills/prompts/ppt/00_PPT生成.md`

### 目标 2：只想新增一个 layout

直接看：

1. “补充自己喜欢的布局”
2. “一次完整 Fork 演练”
3. “Fork 后常见问题”

最少改这些文件：

- `ppt-viewer/src/components/layouts/*.vue`
- `ppt-viewer/src/layoutRegistry.ts`
- `docs/layouts.md`
- `skills/prompts/ppt/layouts.md`

### 目标 3：只想扩一种新的 PPT 类型

直接看：

1. “扩展新的 PPT 类型”
2. “一个新增类型的完整演练”
3. “推荐验证方式”

最少改这些文件：

- `skills/prompts/ppt/05_新类型.md`
- `skills/prompts/ppt/examples/新类型/`
- `skills/SKILL.md`

### 目标 4：想做一套自己的完整版本

推荐阅读顺序：

1. “调整自己喜欢的风格”
2. “补充自己喜欢的布局”
3. “调整大纲结构”
4. “扩展新的 PPT 类型”
5. “调整质检规则”
6. “Fork 后常见问题”

## 改动文件总表

如果你准备动手改，但还不确定“这个目标到底要改哪些文件”，可以先看这张表。

| 目标 | 最少需要改的文件 | 建议一起检查 |
| --- | --- | --- |
| 改整体视觉 | `ppt-viewer/src/style.css` | `ppt-viewer/src/components/layouts/*.vue` |
| 新增一个 layout | `ppt-viewer/src/components/layouts/*.vue` `ppt-viewer/src/layoutRegistry.ts` `docs/layouts.md` `skills/prompts/ppt/layouts.md` | `ppt-viewer/src/lib/deckRenderer.ts` `skills/prompts/ppt/layout_rules.md` |
| 调整大纲结构 | `skills/prompts/ppt/01_课件类.md` `02_方案类.md` `03_汇报类.md` `04_演示类.md` | `skills/prompts/ppt/examples/` |
| 新增一种 PPT 类型 | `skills/prompts/ppt/05_新类型.md` `skills/prompts/ppt/examples/新类型/` `skills/SKILL.md` | `docs/concept.md` `docs/usage.md` |
| 调整质检规则 | `skills/prompts/ppt/00_PPT生成.md` `skills/prompts/ppt/layout_rules.md` | `docs/workflow.md` |
| 做真实项目验证 | `work/ppt/<项目名>/deck.json` `work/ppt/<项目名>/slides/*.json` | `work/assets/*.svg` |

你也可以把这些改动理解成 3 层：

- 提示词层：决定生成什么
- 渲染层：决定页面怎么显示
- 样例层：决定后续能不能稳定复用

如果只改其中一层，通常会出现：

- 能显示，但模型不用
- 模型会用，但页面不好看
- 本次能跑，下次又不稳定

## 调整自己喜欢的风格

### 改 viewer 的视觉风格

主要修改：

- `ppt-viewer/src/style.css`
- `ppt-viewer/src/components/layouts/*.vue`

常见可调项：

- 标题字号
- 圆角大小
- 卡片阴影
- 页面留白
- 主色与强调色
- 封面和章节页背景样式

建议优先固定一套自己的风格变量：

- 封面是否深色
- 正文页是否白底
- 卡片是否带阴影
- 标题字重和字号范围
- 图形页是否偏咨询风或课程风

推荐先决定 3 件事，再动代码：

- 你想要的是“课程感”还是“咨询感”
- 你希望页面更重图形还是更重结论
- 你接受的单页文字上限是多少

如果这 3 件事不先定下来，后面通常会出现：

- 组件样式已经改了，但提示词仍在生成旧风格内容
- 想要大留白，但模型还在塞很多 bullets
- 图形页变多了，但 summary / agenda 仍然写得很满

### 改默认文风和页面密度

主要修改：

- `skills/prompts/ppt/00_PPT生成.md`
- 各类型提示词：
  - `skills/prompts/ppt/01_课件类.md`
  - `skills/prompts/ppt/02_方案类.md`
  - `skills/prompts/ppt/03_汇报类.md`
  - `skills/prompts/ppt/04_演示类.md`

可以调整：

- 每页字数
- 图页比例
- bullet 密度
- 是否更偏结论式表达
- 是否更偏咨询风、课程风或演示风

如果你希望模型稳定生成“你喜欢的味道”，最好不要只改一句描述，而是同时改：

- 类型说明
- layout 选择规则
- 正反例
- 质检标准

建议把你自己的偏好写成明确规则，而不是抽象描述，例如：

- 不写“更高级一点”，改成“标题 1 行内，正文每页不超过 5 条 bullets”
- 不写“多一些图”，改成“概念页优先 `svg_full` / `logic_tree` / `architecture_layered`”
- 不写“更简洁”，改成“每个 block 最多 2 行，每行不超过 18 个字”

## 补充自己喜欢的布局

先说明当前工程里的真实情况：

- 有些 layout 已有独立组件，例如 `steps`、`phases`、`mind_map`、`journey_map`
- 有些 layout 复用了已有组件，例如 `agenda` / `summary` 复用 `TitleBullets`
- 有些 table 类 layout 直接走 `TableLayout`

这意味着 fork 时你可以有两种策略：

1. 先复用现有组件，快速得到结果
2. 再为自己高频使用的 layout 单独做组件，提升外观质量

### 1. 新增前端布局组件

在：

```text
ppt-viewer/src/components/layouts/
```

新增对应 Vue 组件。

建议直接复制一个最接近的已有组件再改，例如：

- 卡片类：参考 `TitleBullets.vue`
- 分栏类：参考 `TwoColumn.vue`
- 步骤类：参考 `Steps.vue`
- 分层类：参考 `Phases.vue`
- 大图类：参考 `SvgCanvas.vue`

例如你想新增一个 `metric_wall`：

- 外观上接近指标卡片
- 就可以先复制 `FourGrid.vue` 或 `TitleBullets.vue`
- 再把字段从 `items` / `bullets` 改成你自己的 `cards`

这样比从空文件开始更快，也更容易保持风格统一。

### 2. 注册 layout_type

在：

```text
ppt-viewer/src/layoutRegistry.ts
```

把新的 `layout_type` 映射到新组件。

当前真实注册文件是：

- `ppt-viewer/src/layoutRegistry.ts`

这里的一个重要经验是：

- 如果一个新 layout 只是“字段不同，视觉几乎一样”，可以先映射到已有组件
- 如果一个新 layout 有明显独立的视觉语义，再新增专用组件

例如：

- `agenda` 直接复用 `TitleBullets`
- `risk_register` 直接复用 `TableLayout`
- `swot` 直接复用 `Matrix2x2`

### 3. 更新静态渲染逻辑

如果静态导出也需要支持，继续更新：

```text
ppt-viewer/src/lib/deckRenderer.ts
```

如果 viewer 里能看、静态导出却不对，大概率是这里还没有和新 layout 对齐。

### 4. 回写提示词和文档

同步修改：

- `skills/prompts/ppt/layouts.md`
- `skills/prompts/ppt/layout_rules.md`
- `docs/layouts.md`

这样新 layout 才能真正进入生成链路，而不是只在前端存在。

### 5. 一个完整的新增 layout 实操模板

下面用 `metric_wall` 作为例子，说明一次完整新增怎么做。

第一步，决定字段结构：

```json
{
  "layout_type": "metric_wall",
  "title": "核心指标总览",
  "cards": [
    { "label": "交付页数", "value": "24", "note": "本轮 deck" },
    { "label": "图页占比", "value": "42%", "note": "优先 SVG" }
  ]
}
```

第二步，新增组件文件：

```text
ppt-viewer/src/components/layouts/MetricWall.vue
```

第三步，在：

```text
ppt-viewer/src/layoutRegistry.ts
```

增加映射：

```ts
import MetricWall from "./components/layouts/MetricWall.vue";

export const layoutComponentMap: Record<string, any> = {
  // ...
  metric_wall: MetricWall
};
```

第四步，如果静态导出也要支持，继续检查：

```text
ppt-viewer/src/lib/deckRenderer.ts
```

第五步，回写这些文档和提示词：

- `skills/prompts/ppt/layouts.md`
- `skills/prompts/ppt/layout_rules.md`
- `docs/layouts.md`

第六步，在 examples 或真实 slides 里放一页样例，例如：

```text
work/ppt/001_项目名/slides/010_metric_wall.json
```

第七步，实际验证 4 件事：

- 打开 viewer 是否显示正常
- 标题、卡片、间距是否和现有页面风格一致
- 静态导出是否一致
- 模型是否真的会选用这个 layout

#### 最小组件骨架示例

如果你想更快上手，可以先写一个最小可用版本，再慢慢美化。

下面这个骨架参考了当前工程里 `FourGrid.vue` 和 `TitleBullets.vue` 的写法：

```vue
<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

const cards = computed(() => {
  if (!Array.isArray(props.slide?.cards)) return [];
  return props.slide.cards.slice(0, 6);
});
</script>

<template>
  <div style="display: grid; gap: 16px; height: 100%">
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px">
      <div
        v-for="(card, i) in cards"
        :key="i"
        style="padding: 18px; border-radius: 18px; background: #f8fafc; border: 1px solid #dbeafe"
      >
        <div style="font-size: 13px; font-weight: 800; color: #2563eb; margin-bottom: 8px">
          {{ card?.label ?? card?.title ?? `指标 ${i + 1}` }}
        </div>
        <div style="font-size: 30px; font-weight: 900; color: #0f172a">
          {{ card?.value ?? "--" }}
        </div>
        <div style="font-size: 13px; color: #475569; margin-top: 8px">
          {{ card?.note ?? "" }}
        </div>
      </div>
    </div>
  </div>
</template>
```

这个版本先解决 3 件事：

- 字段能读到
- 页面能稳定显示
- 风格不会偏离现有 viewer 太远

等它可用以后，再考虑补：

- 深浅主题
- 自适应列数
- 超长文本截断
- 不同卡片强调样式

#### 最小 slide JSON 样例

如果你想马上验证这个 layout，可以先放一页最小样例：

```json
{
  "layout_type": "metric_wall",
  "title": "核心指标总览",
  "cards": [
    { "label": "总页数", "value": "24", "note": "本轮 deck" },
    { "label": "图页占比", "value": "42%", "note": "优先 SVG" },
    { "label": "返工轮次", "value": "2", "note": "detail 回改" }
  ]
}
```

如果这一页能在 viewer 里正常显示，说明至少这几层已经打通：

- slide JSON 字段
- layoutRegistry 映射
- Vue 组件渲染

### 6. 什么时候应该新建组件，什么时候先复用

优先复用已有组件的情况：

- 只是字段名字不同
- 视觉结构基本相同
- 当前目标是先让生成链路可用

应该新建组件的情况：

- 这个 layout 的空间结构和现有组件明显不同
- 这个 layout 是你的高频页面
- 你希望它在文档里长期作为独立能力存在

一个简单判断方法：

- 如果你能用一句话描述成“它本质上就是另一个组件的变体”，先复用
- 如果你会反复说“这个页面的结构和别的都不一样”，就新建组件

### 7. 给新 layout 补一个最小 JSON 样例

推荐在 examples 或真实 `work/ppt/<项目名>/slides/*.json` 中补一页最小样例，用来验证：

- 字段是否完整
- viewer 是否能正确显示
- 静态渲染是否一致
- 提示词是否真的会选到这个 layout

如果只改前端、不补样例和提示词，后续很容易出现“组件存在，但模型永远不用”的情况。

### 8. 常见遗漏

新增 layout 时，最常见的遗漏是：

- 只写了 Vue 组件，没有注册 `layout_type`
- 前端能看，静态导出没对齐
- 文档里有 layout，但提示词里没有
- 提示词里有 layout，但 examples 没样例
- 字段设计和组件实际读取字段不一致

建议每次新增 layout 都按这个顺序自检：

1. 字段结构是否先定义清楚
2. 组件是否能正确读取字段
3. registry 是否已注册
4. 文档是否补齐
5. examples 是否有最小样例
6. 真实 deck 是否验证过

## 调整大纲结构

如果你希望不同类型的 PPT 采用不同的章节结构，可以改：

- 各类型提示词文件
- 对应的 examples

重点位置：

```text
skills/prompts/ppt/examples/
```

这里可以直接放你偏好的：

- `outline.json`
- `deck.json`
- `slides/*.json`

作为新的参考骨架。

如果你想改变常见的大纲风格，可以直接在类型提示词里明确约束，例如：

- 课件类默认采用“背景 -> 原理 -> 方法 -> 案例 -> 总结”
- 方案类默认采用“问题 -> 目标 -> 方案 -> 计划 -> 风险”
- 汇报类默认采用“目标 -> 进展 -> 数据 -> 问题 -> 下一步”
- 演示类默认采用“场景 -> 能力 -> 示范 -> 价值 -> 收尾”

也可以进一步约束每一章下常见的页面类型，例如：

- 原理章节优先 `svg_full` / `logic_tree`
- 计划章节优先 `timeline` / `roadmap` / `gantt_chart`
- 总结章节优先 `summary` / `kpi_cards`

如果你想让“大纲结构”真正稳定，不要只改章节名称，还要一起改：

- 每章默认页数范围
- 每章常用 layout
- 哪一章必须出现图页
- 哪一章允许用 table

例如你可以写成这种约束：

- 方法章节通常 3 到 5 页
- 方法章节至少 1 页 `steps` 或 `phases`
- 原理章节至少 1 页 `svg_full`
- 收尾章节只能用 `summary` / `thank_you`

## 扩展新的 PPT 类型

当前系统支持四类：

- 课件类
- 方案类
- 汇报类
- 演示类

如果你要扩展新类型，例如：

- 培训营类
- 路演类
- 研究报告类

建议步骤：

1. 新增一个类型提示词文件
2. 新增对应 examples
3. 更新 `skills/SKILL.md`
4. 更新 `docs/concept.md` 和 `docs/usage.md`
5. 在类型判断逻辑中把新类型加入说明

如果你希望这个新类型“真的可用”，最好再补 1 件事：

6. 给这个类型准备一套最小输入和最小 deck 样例

#### 新类型提示词文件骨架

如果你准备新增一种类型，例如 `05_研究报告类.md`，可以先从下面这个骨架开始：

```md
# 研究报告类

## 适用任务

- 行业研究
- 数据复盘
- 趋势分析

## 默认目标

- 先给结论
- 再给证据
- 最后给建议

## 推荐大纲结构

1. 摘要
2. 背景与问题
3. 数据观察
4. 结论判断
5. 建议与计划
6. 附录

## 推荐 layout

- `summary`
- `bar_chart`
- `line_chart`
- `comparison_table`
- `risk_register`
- `appendix`

## 额外约束

- 前 3 页必须给出结论
- 至少 2 页图表
- 不要连续 3 页都是 bullets
```

这个文件至少要回答 4 个问题：

- 这是什么类型
- 它的默认结构是什么
- 它常用什么 layout
- 它有什么额外限制

如果这 4 个问题不明确，模型通常只会把“新类型”当成一个名字，而不会真的按新的模式生成。

#### 新类型最小 examples 清单

除了提示词文件，建议至少再准备：

- 一个最小 `outline.json`
- 一个最小 `deck.json`
- 两到三页最小 `slides/*.json`

这样你就能验证：

- 类型选择后，大纲是否真的变了
- 常用 layout 是否真的被用了
- 前端显示是否仍然稳定

扩展新类型时，建议同时定义 4 件事：

- 这类 PPT 解决什么问题
- 默认大纲结构是什么
- 常用 layout 组合是什么
- 哪些页面必须图形化

例如“研究报告类”通常会偏向：

- `summary`
- `bar_chart` / `line_chart` / `area_chart`
- `comparison_table`
- `risk_register`
- `appendix`

你也可以把“类型扩展”理解成一套新的默认组合包：

- 默认章节结构
- 默认 layout 集合
- 默认文风
- 默认图表偏好
- 默认质检规则

只有这 5 件事同时存在，新增类型才不是“多了一个名字”，而是真的多了一套生成模式。

## 调整质检规则

如果你有自己的审美或交付标准，可以改：

- `skills/prompts/ppt/00_PPT生成.md`
- `skills/prompts/ppt/layout_rules.md`

例如增加：

- 图页最低比例
- 某些页面必须用 `svg_full`
- 某些页面禁止再用表格
- 封面必须带背景图
- 三层结构必须使用段落短句而不是 bullets

也可以增加你自己的扩展规则，例如：

- 概念页中 `svg_full` 占比不得低于 30%
- `agenda` 只能出现在前 3 页
- `thank_you` 必须带联系方式
- `journey_map` 必须同时包含痛点和机会点
- `gantt_chart` 必须标出 owner

建议把质检规则分成 3 层：

- 结构层：章节顺序、页数、页面类型是否合理
- 表达层：layout 是否匹配页面意图
- 视觉层：是否缺图、是否超屏、是否过密

这样后面排查问题时，也更容易知道是：

- prompt 没写对
- layout 选错了
- 组件本身表现不够

## 推荐 Fork 顺序

这一节回答的是“多层改动时，先改哪一层更稳”。

1. 先改文档和提示词
2. 再改前端 layout 组件
3. 然后补 examples
4. 最后再做一轮真实 deck 验证

这样能避免只改了一层，其他层没跟上，导致系统行为不一致。

## 一个推荐 Fork 路线

这一节回答的是“如果你是第一次 fork，应该先做哪些目标，后做哪些目标”。

如果你是第一次 fork，推荐按下面的路线做：

1. 先只改风格，不改类型
2. 再补 1 到 2 个自己最常用的新 layout
3. 然后固定一套你喜欢的大纲结构
4. 最后再扩新的 PPT 类型

这样更稳，因为：

- 风格变化最容易直观看到
- layout 扩展最能提升页面质量
- 大纲结构会影响整套生成逻辑
- 类型扩展是改动面最大的最后一步

## 一个最小 Fork 清单

如果你不想一次做太大改动，可以把这节当成最低交付范围。

如果你只想做一个“自己的版本”，至少改这些文件：

- `ppt-viewer/src/style.css`
- `ppt-viewer/src/layoutRegistry.ts`
- `skills/prompts/ppt/00_PPT生成.md`
- `skills/prompts/ppt/layout_rules.md`
- `docs/layouts.md`
- `docs/fork.md`

如果你还要新增 layout，再额外改：

- `ppt-viewer/src/components/layouts/*.vue`
- `ppt-viewer/src/lib/deckRenderer.ts`
- `work/ppt/<项目名>/slides/*.json`

## 推荐验证方式

每次 fork 后，最好至少验证一遍：

1. 用一个真实输入先生成 `outline.json`
2. 检查大纲是否真的符合你的结构偏好
3. 再生成 `deck.json + slides/*.json`
4. 打开前端预览，检查 layout、标题、SVG 和超屏情况
5. 把发现的问题回写到提示词、layout 组件和文档

这样这套 fork 才会从“改过代码”变成“改成了可稳定复用的系统”。

## 推荐交付标准

你可以把自己的 fork 至少做到下面这个标准：

- 有一套稳定风格
- 有一套偏好的 layout 组合
- 有一套固定的大纲模板
- 有至少一个扩展 layout 的真实案例
- 有一套自己的质检规则

做到这一步，这个 fork 才不仅是“改了样式”，而是“拥有了自己的生成体系”。

## 一次完整 Fork 演练

如果你希望照着做一遍，这里给一个从 0 到 1 的最小演练路径。

目标：

- 新增一个 `metric_wall` layout
- 让它能在 viewer 中显示
- 让提示词和文档知道它存在
- 用一页真实 slide 验证它已经打通

如果你时间有限，只做前 6 步也可以先完成最小闭环：

1. 新增组件
2. 注册 layout
3. 准备 slide JSON
4. 挂进 deck
5. 打开 viewer
6. 看页面是否正常显示

这样至少能先判断这个 layout 在工程里是不是“技术上可用”。

### 第 1 步：先找一个最接近的参考

当前工程里最适合作为参考的组件通常有：

- `ppt-viewer/src/components/layouts/FourGrid.vue`
- `ppt-viewer/src/components/layouts/TitleBullets.vue`

如果你做的是：

- 指标卡片页，优先参考 `FourGrid.vue`
- 标题 + 列表 + 侧边卡片，优先参考 `TitleBullets.vue`
- 时间步骤页，优先参考 `Steps.vue`
- 分层页，优先参考 `Phases.vue`

### 第 2 步：新增组件文件

新增：

```text
ppt-viewer/src/components/layouts/MetricWall.vue
```

先放最小骨架，保证能显示，再慢慢做样式。

### 第 3 步：注册 layout_type

编辑：

```text
ppt-viewer/src/layoutRegistry.ts
```

把：

```ts
metric_wall: MetricWall
```

加入 `layoutComponentMap`。

如果你只是临时验证，也可以先把它映射到某个已有组件，等效果确认后再做真正组件。

### 第 4 步：准备一页真实 slide

推荐先在真实工作目录里放一页验证样例，例如：

```text
work/ppt/001_skill和harness/slides/052_metric_wall.json
```

内容可以先最小化：

```json
{
  "layout_type": "metric_wall",
  "title": "核心指标总览",
  "cards": [
    { "label": "总页数", "value": "24", "note": "本轮 deck" },
    { "label": "图页占比", "value": "42%", "note": "优先 SVG" },
    { "label": "返工轮次", "value": "2", "note": "detail 回改" }
  ]
}
```

如果你不想碰真实项目，也可以先在 examples 目录里加，例如：

```text
skills/prompts/ppt/examples/演示类/slides/010_metric_wall.json
```

### 第 5 步：把新 slide 挂进 deck

如果你是在真实项目里验证，还要同步更新：

```text
work/ppt/001_skill和harness/deck.json
```

把新 slide 文件加进 `slide_files`，否则前端不会读到。

如果你是在 examples 里验证，则同步更新对应 examples 下的：

```text
deck.json
```

### 第 6 步：打开 viewer 验证

重点看 5 件事：

- 页面能不能正常打开
- 标题是否和现有页面风格一致
- 卡片数量变多后会不会拥挤
- 数值和注释是否层级清楚
- 页面高度是否会超屏

如果 viewer 正常，但导出或静态页面不一致，再回头检查：

```text
ppt-viewer/src/lib/deckRenderer.ts
```

### 第 7 步：回写 layout 文档和提示词

至少同步改这 3 个文件：

- `skills/prompts/ppt/layouts.md`
- `skills/prompts/ppt/layout_rules.md`
- `docs/layouts.md`

建议补齐这 3 类信息：

- 适用场景
- 关键字段
- 最小 JSON 示例

这样后面你自己或者模型都知道：

- 什么情况下该用它
- 它需要哪些字段
- 一个合法输入长什么样

### 第 8 步：让类型提示词开始使用它

如果你希望模型真的选到 `metric_wall`，还要去对应类型提示词里加说明，例如：

- `skills/prompts/ppt/01_课件类.md`
- `skills/prompts/ppt/02_方案类.md`
- `skills/prompts/ppt/03_汇报类.md`
- `skills/prompts/ppt/04_演示类.md`

可以写成这种规则：

- 指标总览页优先 `metric_wall`
- 不再用普通 bullets 罗列核心指标
- 指标页最多展示 6 个 cards

### 第 9 步：补 examples，形成可复用模板

当前工程已经有一套 examples：

- `skills/prompts/ppt/examples/课件类/`
- `skills/prompts/ppt/examples/方案类/`
- `skills/prompts/ppt/examples/汇报类/`
- `skills/prompts/ppt/examples/演示类/`

建议把你自己的 layout 至少补进其中一个 examples，这样后面：

- 你自己能复用
- 模型能看到具体范例
- 维护时更容易判断字段有没有变形

### 第 10 步：最后做一轮质检

这一轮不要只看“能不能显示”，还要看：

- layout 是否真的适合这个页面意图
- 页面是不是比原来的表达更好
- 是否只是换了组件，但信息结构没有优化
- 是否会和你自己的风格规则冲突

如果这一步不做，最常见的问题是：

- 技术上新增成功了
- 但审美上并没有更好
- 提示词也没有稳定用它

## 一个新增类型的完整演练

如果你要新增的不是 layout，而是一整种 PPT 类型，可以按这个顺序做。

如果你只想先验证“新类型是不是能跑起来”，最小闭环是：

1. 新增类型提示词文件
2. 补最小 examples
3. 更新 `skills/SKILL.md`
4. 用一组真实输入跑一遍 `outline -> detail`
5. 检查生成结果是否真的区别于原有四类

### 第 1 步：先定义这个类型解决什么问题

例如你要加“研究报告类”，先不要急着写代码，先写清楚：

- 它服务什么任务
- 默认读者是谁
- 更重结论、证据，还是演示感
- 通常一套 deck 有哪些固定章节

### 第 2 步：新增提示词文件

新增：

```text
skills/prompts/ppt/05_研究报告类.md
```

内容至少包括：

- 适用任务
- 默认目标
- 推荐大纲结构
- 推荐 layout
- 额外约束

### 第 3 步：补一套最小 examples

新增一个 examples 目录，例如：

```text
skills/prompts/ppt/examples/研究报告类/
  outline.json
  deck.json
  slides/
```

最小建议是 3 到 5 页：

- `001_cover.json`
- `002_summary.json`
- `003_bar_chart.json`
- `004_comparison_table.json`
- `005_appendix.json`

### 第 4 步：更新 Skill 文档

同步更新：

- `skills/SKILL.md`
- `docs/concept.md`
- `docs/usage.md`

这样新类型才会在：

- Skill 入口说明
- 概念解释
- 使用文档

里都变成正式能力，而不是你自己知道、别人不知道的隐式能力。

### 第 5 步：验证它是否真的改变了生成结果

最关键的问题不是“文件加了没有”，而是：

- 类型判断后，大纲是否明显变化
- 页面 layout 是否明显切换到这类风格
- 图表比例是否真的提升
- 结论页和附录页是否更符合研究报告场景

只有这些变化真的出现，才能说明“新类型”已经不是一个空名字。

## Fork 后的维护建议

当你的 fork 开始越来越像自己的体系后，建议固定维护这几类资产：

- 一套稳定的 examples
- 一套稳定的 layout 文档
- 一套稳定的质检规则
- 一套稳定的真实项目验证样本

推荐至少保留一个真实项目目录做回归验证，例如当前工程里的：

```text
work/ppt/001_skill和harness/
```

每次你改完风格、layout 或类型后，都回到这个目录做一轮检查。这样最容易发现：

- 是提示词改坏了
- 还是组件改坏了
- 还是文档和实现已经不一致了

## Fork 后常见问题

如果你已经按文档做了 fork，但结果和预期不一致，优先按下面这些症状排查。

更通用的页面排查方式可结合：

- [troubleshooting.md](troubleshooting.md)

### 症状 1：新 layout 已经写了，但前端不显示

优先检查：

1. `slides/*.json` 里的 `layout_type` 是否写对
2. `ppt-viewer/src/layoutRegistry.ts` 是否已经注册
3. 组件文件路径和 import 名称是否一致
4. `deck.json` 的 `slide_files` 是否真的挂上了这页

最常见原因：

- JSON 里写的是 `metricwall`，registry 里注册的是 `metric_wall`
- 组件文件已经建了，但没有加入 `layoutComponentMap`
- slide 文件创建了，但 deck 没引用

### 症状 2：viewer 能看，但静态导出不一致

优先检查：

1. `ppt-viewer/src/lib/deckRenderer.ts`
2. 新 layout 是否只是 viewer 支持了，导出逻辑还没对齐
3. 新字段是否在静态渲染里根本没被读取

一个简单判断方式：

- 浏览器里正常
- 静态页面缺内容或退化成通用块

这通常不是提示词问题，而是渲染层没有完全对齐。

### 症状 3：提示词里已经加了 layout，但模型还是不用

优先检查：

1. `skills/prompts/ppt/layouts.md` 是否已加入这个 layout
2. `skills/prompts/ppt/layout_rules.md` 是否说明了适用场景
3. 对应类型提示词里是否真的鼓励使用它
4. examples 里是否有实际示例

最常见原因：

- 文档里写了，但类型提示词没写
- layout 有名字，但没有正例
- 规则太弱，模型仍然更倾向已有 layout

建议不要只写“可以使用 `metric_wall`”，而要写成：

- 指标总览页优先 `metric_wall`
- 不再使用普通 bullets 罗列指标
- 卡片数量建议 3 到 6 个

### 症状 4：examples 里生效了，但真实项目没变化

优先检查：

1. 你改的是 `skills/prompts/ppt/examples/...` 还是 `work/ppt/...`
2. 当前 viewer 读取的是哪个项目目录
3. `server.mjs` 返回的 deck 是否就是你刚改的那份

最常见原因：

- examples 改了，但你打开的是 `work/ppt/001_skill和harness/`
- 真实项目改了，但 deck 仍然引用旧 slide
- 改的是样例目录，不是当前正在预览的目录

一个简单原则：

- `examples/` 更偏“模板和参考”
- `work/ppt/` 才是“真实运行产物”

### 症状 5：风格改了，但生成内容还是旧味道

优先检查：

1. 你是不是只改了 `style.css`
2. 类型提示词和总提示词有没有一起改
3. 质检规则有没有同步改

最常见原因：

- 前端视觉变了，但 prompt 还在生产旧结构
- 页面密度规则没改，模型仍然塞很多 bullets
- 图页比例规则没改，结果还是偏文字

所以“风格 fork”至少要同时动这几层：

- `ppt-viewer/src/style.css`
- `skills/prompts/ppt/00_PPT生成.md`
- `skills/prompts/ppt/layout_rules.md`
- 对应类型提示词

### 症状 6：新类型加了，但看起来和旧类型没区别

优先检查：

1. 新类型提示词是不是只换了名字
2. 大纲结构是否真的变化
3. 常用 layout 是否真的变化
4. examples 是否已经体现这种差异

如果新类型没有同时改变这些东西：

- 默认章节结构
- 常用 layout 集合
- 文风
- 图表偏好
- 质检规则

那它通常只是“新建了一个文件”，而不是“新增了一种模式”。

## 推荐排查顺序

当 fork 后出现问题，建议按这个顺序查：

1. 先看 `slides/*.json` 字段和 `layout_type`
2. 再看 `deck.json` 是否真的引用了该页
3. 再看 `layoutRegistry.ts` 是否注册
4. 再看 `deckRenderer.ts` 是否对齐
5. 再看提示词和 examples 是否写到位
6. 最后再调整样式和视觉表现

这样能避免你一上来就改提示词，结果其实问题出在：

- deck 没引用
- registry 没注册
- 或静态渲染没支持

## 变更顺序建议

为了让 fork 更稳，推荐每次只改一层主变量：

### 场景 1：你只想改视觉

先改：

- `ppt-viewer/src/style.css`
- 相关 layout 组件

先不要改：

- layout 类型库
- 类型提示词结构

### 场景 2：你只想加一个 layout

先改：

- 组件
- registry
- 最小样例

再改：

- `layouts.md`
- `layout_rules.md`
- 类型提示词

### 场景 3：你想扩一种新的 PPT 类型

先改：

- 类型提示词文件
- examples

再改：

- Skill 文档
- concept / usage 文档
- 质检规则

### 场景 4：你想全面换风格又扩类型

不要一次全改。

推荐拆成三轮：

1. 先把视觉风格改稳定
2. 再把高频 layout 改稳定
3. 最后再扩新类型

这样最容易定位问题，也最不容易把系统一起改乱。
