# Installation

## 环境要求

- Node.js 18 及以上
- npm
- Trae IDE（Skill 自动通过 `skills/SKILL.md` 注册，无需额外操作）
- macOS / Linux / Windows 均可

## Trae Skill 注册

本项目的 Skill 通过 `skills/SKILL.md` 定义，Trae IDE 会自动检测并加载。无需手动注册。

Skill 文件结构：
- `skills/SKILL.md` — Skill 入口，定义 name、description 和 commands
- `skills/prompts/ppt/` — 各类型 PPT 的生成提示词

## 安装依赖

项目有两处依赖需要安装：

```bash
# 1. 根目录依赖（pptxgenjs 等）
npm install

# 2. ppt-viewer 前端依赖（Vue + Vite）
npm --prefix ppt-viewer install
```

如果根目录 `npm install` 报错，可能因 `pptxgenjs` 版本问题导致，
可执行 `npm install pptxgenjs@latest` 修复。

## 构建前端

```bash
npm --prefix ppt-viewer run build
```

输出到 `ppt-viewer/dist/`，由 `server.mjs` 静态服务。

## 启动预览服务

默认端口 `9030`：

```bash
node server.mjs
```

成功后访问：`http://localhost:9030/`

查看特定项目：`http://localhost:9030/?project=3`（对应 003_visual_spec）

## 推荐完整安装流程

```bash
npm install                          # 根依赖
npm --prefix ppt-viewer install      # 前端依赖
npm --prefix ppt-viewer run build    # 构建前端
node server.mjs                      # 启动服务
```

或使用快捷命令：

```bash
npm run dev   # = build + start
npm start     # 直接启动（需已 build 完成）
