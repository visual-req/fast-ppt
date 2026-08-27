# 操作手册

这份手册只讲两件事：

- 怎么操作网页版 PPT
- 怎么导出 PPTX

安装、依赖和本地启动方式请看 [安装说明](installation.md) 或 [快速开始](getting-started.md)。

## 使用前提

开始操作前，请先确认：

- 本地预览服务已经启动
- 浏览器已经打开 `http://localhost:9030/`
- 当前项目目录里已经有可预览的 `deck.json + slides/*.json`

如果当前只有 `outline.json`，可以先预览结构，但导出 PPTX 时会失败。

## 打开网页版 PPT

默认打开：

```text
http://localhost:9030/
```

如果要指定项目，可以直接在 URL 上加 `project` 参数：

```text
http://localhost:9030/?project=001
http://localhost:9030/?project=001_项目名
```

说明：

- `project=001` 会自动匹配 `work/ppt/001_*`
- `project=001_项目名` 会直接打开对应目录
- 页面右上角状态栏会显示当前项目名，方便确认没有看错项目

## 工具栏怎么用

顶部工具栏是日常操作入口，建议按这个顺序使用：

### 1. 重新加载

- 点击“重新加载”可重新读取当前项目的 `deck.json + slides/*.json`
- 改完 JSON、SVG 或样式后，先点一次这个按钮
- 如果浏览器还没刷新到最新结果，再强刷页面

### 2. 翻页与跳转

- “首页”：跳到第 1 页
- “上一页 / 下一页”：逐页翻动
- 页码输入框 + “跳转”：直接跳到指定页

键盘快捷键：

- `ArrowLeft` / `PageUp`：上一页
- `ArrowRight` / `PageDown` / `Space`：下一页
- `Home`：第一页
- `End`：最后一页

### 3. 查看大纲

- 点击“查看大纲”打开章节抽屉
- 大纲会按 `section_divider` 自动分章节
- 点击章节或页面条目后，会直接跳到对应页
- 按 `Esc` 或点击遮罩可关闭大纲

适合场景：

- 快速检查章节顺序
- 快速跳到问题页
- 检查章节页是否正确生效

### 4. 切换主题风格

工具栏下拉框可以切换当前 viewer 的主题风格。

当前内置风格包括：

- `consulting`
- `demo`
- `executive`
- `training`
- `aurora`
- `graphite`

说明：

- 切换后只影响当前预览和导出效果
- 当前风格会同步到 URL 的 `style` 参数里
- 如果 `deck.deck.style` 有默认值，但你在界面上切了别的风格，界面选择优先

示例：

```text
http://localhost:9030/?project=001&style=executive
```

## 预览时重点看什么

不要只看“好不好看”，还要重点检查：

- 标题、页序、章节是否正确
- `layout_type` 是否符合这一页的表达意图
- SVG、图片、图标是否真实加载
- 是否有内容超出屏幕
- 是否有页面仍然像表格堆砌或 bullet 堆砌
- 主题切换后颜色、边框、强调色是否仍然协调

如果页面显示不对，优先回查：

- `ppt-viewer/src/layoutRegistry.ts`
- `ppt-viewer/src/components/layouts/*.vue`
- 当前项目下的 `deck.json`
- 当前页对应的 `slides/*.json`

## 导出 PPTX

### 导出方式

- 点击顶部工具栏的“导出 PPTX”
- 系统会按当前项目、当前风格生成下载文件

导出接口实际对应：

```text
/api/export/pptx
```

如果当前 URL 带了项目和风格参数，导出会自动沿用，例如：

```text
http://localhost:9030/?project=001&style=executive
```

会按 `001` 项目和 `executive` 风格导出。

### 导出文件名

- 未指定风格时：`deck.pptx`
- 指定风格时：`deck-风格名.pptx`

例如：

- `deck.pptx`
- `deck-executive.pptx`

### 导出前建议检查

导出前建议至少确认一次：

- 当前看的就是目标项目
- 当前主题风格是你想导出的风格
- 章节顺序和页码没问题
- 图片、SVG、图表都能在 viewer 里正常显示
- 没有超屏或被裁切的内容

### 导出失败时先查什么

常见原因：

- 当前项目还没有 `deck.json`
- `slides/*.json` 缺失或 JSON 不合法
- 某一页引用的图片 / SVG 路径不存在
- viewer 能看，但导出链路还没支持该 layout

优先检查这些文件：

- `lib/pptxExport.mjs`
- `ppt-viewer/src/lib/*`
- `work/ppt/当前项目/deck.json`
- `work/ppt/当前项目/slides/*.json`

## 常见操作路径

### 路径 1：检查一页有没有问题

1. 打开目标项目
2. 用页码或大纲跳到目标页
3. 检查标题、布局、SVG、超屏情况
4. 改完后点“重新加载”
5. 确认无误后再导出 PPTX

### 路径 2：同一份内容切不同风格

1. 打开同一个项目
2. 依次切换主题下拉框
3. 分别检查封面、章节页、图表页和总结页
4. 选定风格后点击“导出 PPTX”

### 路径 3：快速确认章节结构

1. 点击“查看大纲”
2. 看章节页是否都被识别出来
3. 逐个点击章节，确认跳转是否正确
4. 如果章节结构不对，优先检查 `section_divider`

## 相关文件

- `server.mjs`：本地预览服务与 PPTX 导出接口
- `ppt-viewer/src/App.vue`：工具栏、翻页、大纲、主题切换、导出按钮
- `ppt-viewer/src/layoutRegistry.ts`：`layout_type` 到组件的映射
- `ppt-viewer/src/components/layouts/`：各类页面布局组件
- `lib/pptxExport.mjs`：PPTX 导出主逻辑
