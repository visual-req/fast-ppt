# Manual

## 启动前端界面

### 1. 安装依赖

在项目根目录执行：

```bash
npm install
npm --prefix ppt-viewer install
```

### 2. 启动预览服务

在项目根目录执行：

```bash
node server.mjs
```

默认端口固定为：

```text
http://localhost:9030/
```

### 3. 打开浏览器

访问：

```text
http://localhost:9030/
```

如果之前已经打开过页面但没看到最新结果，建议强刷：

- macOS: `Cmd + Shift + R`

## 前端界面操作

### 翻页

- 使用键盘左右方向键切换页面
- 或在页面中按 UI 控件进行翻页
- 点击“首页”可快速跳到第 1 页
- 在页号输入框输入页码后按回车可直接跳转

### 查看大纲

- 点击顶部的“查看大纲”按钮
- 在抽屉中的树形目录里选择对应章节
- 点击后会直接跳转到对应页面

### 导出 PPTX

- 点击顶部工具栏的“导出 PPTX”
- 会根据当前 `deck.json + slides/*.json` 生成并下载 `deck.pptx`

### 检查页面内容

重点观察：

- 标题是否正确
- layout 是否符合页面意图
- SVG 是否真实显示
- 是否有内容超出屏幕
- 是否存在仍然是表格感、bullets 感过强的问题

## 前端相关文件

- `server.mjs`: 提供本地预览服务与 `/api/deck`
- `ppt-viewer/src/App.vue`: 页面壳层与大纲抽屉
- `ppt-viewer/src/layoutRegistry.ts`: `layout_type` 到组件的映射
- `ppt-viewer/src/components/layouts/`: 各类页面布局组件
