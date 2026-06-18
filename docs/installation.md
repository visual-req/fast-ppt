# Installation

## 环境要求

- Node.js 18 及以上
- npm
- npx
- macOS / Linux / Windows 均可

## 安装依赖

在项目根目录执行：

```bash
npm --prefix ppt-viewer install
```

如果已经存在 `node_modules`，可直接跳过。

## 使用 npx 安装依赖

如果你希望显式通过 `npx` 走 npm 命令，也可以执行：

```bash
npx npm --prefix ppt-viewer install
```

两种方式效果相同，都会把依赖安装到 `ppt-viewer/node_modules`。

## 预览服务

当前项目使用根目录的 `server.mjs` 提供 deck 预览接口，默认端口固定为 `9030`。

启动方式：

```bash
node server.mjs
```

也可以使用：

```bash
npx node server.mjs
```

启动成功后，可通过以下地址访问：

```text
http://localhost:9030/
```

## 构建前端

如需单独构建前端 viewer：

```bash
npm --prefix ppt-viewer run build
```

或使用：

```bash
npx npm --prefix ppt-viewer run build
```

## 推荐顺序

```bash
npm --prefix ppt-viewer install
node server.mjs
```

如果你统一使用 `npx`，则可替换为：

```bash
npx npm --prefix ppt-viewer install
npx node server.mjs
```
