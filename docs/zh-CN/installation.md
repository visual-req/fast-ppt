# Installation

## 环境要求

- 支持 Skills CLI 的 AI 工具
- Node.js 18 及以上（用于 `npx skills` 或本地开发）
- npm
- macOS / Linux / Windows 均可

## 安装 Skill

推荐直接用 Skills CLI 安装：

```bash
npx skills add visual-req/fast-ppt@proposal-generator -g -y
```

也可以直接在 AI 工具里说：

```text
请帮我安装 fast_ppt 的 proposal-generator skill
```

安装完成后，即可在对话中使用：

- `/fppt:outline`
- `/fppt:detail`
- `/fppt:viewer`

说明：
- `proposal-generator` 是这个仓库里的 Skill 名称
- `visual-req/fast-ppt` 是仓库来源
- `-g` 表示全局安装
- `-y` 表示跳过确认

Skill 文件结构：
- `skills/SKILL.md` — Skill 入口，定义 name、description 和 commands
- `skills/prompts/ppt/` — 各类型 PPT 的生成提示词

## 本地开发仓库

如果你是要 fork / 修改这个仓库本身，而不是只安装 Skill，再安装下面两处依赖：

```bash
# 1. 根目录依赖（pptxgenjs 等）
npm install

# 2. ppt-viewer 前端依赖（Vue + Vite）
npm --prefix ppt-viewer install
```

如果根目录 `npm install` 报错，可能因 `pptxgenjs` 版本问题导致，可执行 `npm install pptxgenjs@latest` 修复。

## 本地构建前端

```bash
npm --prefix ppt-viewer run build
```

输出到 `ppt-viewer/dist/`，由 `server.mjs` 静态服务。

## 本地启动预览服务

默认端口 `9030`：

```bash
node server.mjs
```

成功后访问：`http://localhost:9030/`

查看特定项目：`http://localhost:9030/?project=3`（对应 003_visual_spec）

## 推荐的本地开发流程

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
