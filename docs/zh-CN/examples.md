# 案例工程

项目当前提供四个正式可预览的 PPT 案例工程，可作为学习参考和二次开发起点。

## 案例总览

| 项目 | 类型 | 页数 | 主题 |
|------|------|------|------|
| 001_无人机黑飞防御技术方案 | 方案类 | 36 页 | 面向安防/机场/大型活动场景的低空安全防御方案 |
| 001_skill和harness | 课件类 | 59 页 | Skill 与 Harness 工程培训课程 |
| 002_制造业数字化转型 | 方案类 | 44 页 | 制造业数字化转型与 AI 导入 |
| 003_visual_spec | 演示类 | 34 页 | Visual-Spec 需求规格化产品演示 |

## 示例工程位置

这四个示例工程主要分成两部分：

- 输入材料目录：`work/input/`
- 生成结果目录：`work/ppt/`

对应位置如下：

| 示例 | 输入材料位置 | 生成结果位置 |
|------|--------------|--------------|
| `001_无人机黑飞防御技术方案` | 当前未附带输入目录 | `work/ppt/001_无人机黑飞防御技术方案/` |
| `001_skill和harness` | `work/input/001_skill和harness/` | `work/ppt/001_skill和harness/` |
| `002_制造业数字化转型` | `work/input/002_制造业数字化转型/` | `work/ppt/002_制造业数字化转型/` |
| `003_visual_spec` | `work/input/003_visual_spec/` | `work/ppt/003_visual_spec/` |

如果你想直接研究示例页面结构，重点看：

- `work/ppt/示例项目/outline.json`
- `work/ppt/示例项目/deck.json`
- `work/ppt/示例项目/slides/*.json`
- `work/assets/编号/`

## 如何打开示例预览

先启动本地服务：

```bash
node server.mjs
```

然后在浏览器访问对应示例。

推荐写法是使用完整目录名：

```text
http://localhost:9030/?project=001_skill和harness
http://localhost:9030/?project=002_制造业数字化转型
http://localhost:9030/?project=003_visual_spec
http://localhost:9030/?project=001_无人机黑飞防御技术方案
```

也可以只写编号：

```text
http://localhost:9030/?project=001
http://localhost:9030/?project=002
http://localhost:9030/?project=003
```

但更推荐使用完整目录名。因为当前仓库里可能同时存在多个相同编号前缀的项目，例如多个 `001_*` 目录；这时完整目录名更准确，不会打开错项目。

---

## 001_无人机黑飞防御技术方案（方案类，36 页）

**主题**：面向安防/机场/大型活动安保决策方的低空安全防御整体建设方案，覆盖黑飞威胁、防御体系、探测识别、处置反制、平台管控与实施路径。

**目录**：
- `work/ppt/001_无人机黑飞防御技术方案/outline.json`
- `work/ppt/001_无人机黑飞防御技术方案/deck.json`
- `work/ppt/001_无人机黑飞防御技术方案/slides/001_cover.json` … `036_thank_you.json`
- `work/assets/001/`（包含该方案引用的 SVG 资产，如 `016-multi-sensor-fusion.svg`）

**章节结构**：
1. 开场：方案目标与决策路径
2. 黑飞威胁与防御需求
3. 总体防御方案
4. 探测识别分系统
5. 处置反制分系统
6. 指挥管控平台
7. 实施路径
8. 成本收益分析
9. 风险与保障
10. 收口与行动建议

**布局覆盖**：cover / agenda / section_divider / title_bullets / kpi_cards / problem_statement / architecture_layered / comparison_table / phases / four_grid / three_column / svg_full / two_column / steps / nine_grid / swimlane_process / roadmap / plan_table / milestones / cost_benefit / risk_register / summary / thank_you

**说明**：
- 当前仓库中该案例提供的是完整输出工程，可直接预览与研究结构
- 对应 `work/input/` 原始材料目录暂未一并放入仓库

**预览地址**：
- `http://localhost:9030/?project=001_无人机黑飞防御技术方案`

---

## 001_skill和harness（课件类，59 页）

**主题**：从提示词工程到上下文工程再到 Harness 工程的发展历程培训。

**目录**：
- `work/input/001_skill和harness/设计思路.md`
- `work/ppt/001_skill和harness/outline.json`
- `work/ppt/001_skill和harness/deck.json`
- `work/ppt/001_skill和harness/slides/001_cover.json` … `059_thank_you.json`
- `work/assets/001/`（37 个 SVG 素材）

**章节结构**：
1. 开场：课程目标与议程
2. 历史脉络：提示词工程 → 上下文工程 → Harness 工程
3. Skill 深入：构成、触发方式、课堂练习
4. Harness 深入：构成、evaluator 重点讲解
5. 补充材料与课堂练习

**布局覆盖**：cover / agenda / section_divider / mind_map / logic_tree / svg_full / impact_effort / before_after / dependency_graph / two_column / comparison_table / pyramid / four_grid / steps / architecture_layered / icicle_tree / swimlane_process / thank_you

**预览地址**：
- `http://localhost:9030/?project=001_skill和harness`

---

## 002_制造业数字化转型（方案类，44 页）

**主题**：面向集团/工厂管理层的制造业数字化转型与 AI 导入方案，覆盖数字化底座、生产/研发/业务 AI、基础设施与组织治理。

**目录**：
- `work/input/002_制造业数字化转型/工厂导入AI方案说明PPT大纲.md`
- `work/ppt/002_制造业数字化转型/outline.json`
- `work/ppt/002_制造业数字化转型/deck.json`
- `work/ppt/002_制造业数字化转型/slides/001_cover.json` … `044_thank_you.json`
- `work/assets/002/`（16 个 SVG 素材）

**章节结构**：
1. 数字化底座与架构总览
2. 生产 AI 样板（质量检测、预测维护）
3. 研发 AI 提效（代码生成、测试自动化）
4. 业务/办公 AI 渗透
5. 基础设施与人才
6. 管理制度与治理
7. 路线图与行动项

**布局覆盖**：cover / agenda / section_divider / phases / architecture_layered / radar_chart / case_study / steps / title_bullets / nine_grid / org_roles / plan_table / summary / thank_you / svg_full

**预览地址**：
- `http://localhost:9030/?project=002_制造业数字化转型`

---

## 003_visual_spec（演示类，34 页）

**主题**：Visual-Spec 产品演示，展示如何将散乱的需求文档变成结构化、可验证、可交互的完整规约。

**目录**：
- `work/input/003_visual_spec/需求说明.md`
- `work/ppt/003_visual_spec/outline.json`
- `work/ppt/003_visual_spec/deck.json`
- `work/ppt/003_visual_spec/slides/001.json` … `034.json`
- `work/assets/003/`（22 个 SVG + 2 个 PNG）

**章节结构**：
1. 痛点引入（12 个需求痛点，九宫格+四宫格总览 → 逐个详解）
2. 解决方案原理（左右分栏 + IP 注册）
3. 完整工作流展示
4. 逐命令详解（new → detail → 验证 → verify → qc → impl → append-test → plan → accept → upgrade）
5. 价值展示（效果对比、目标用户、典型场景）
6. 行动引导

**布局覆盖**：cover / section_divider / nine_grid / four_grid / svg_full / two_column / before_after / journey_map / summary / thank_you

**设计亮点**：
- 同类页面集中放置（痛点汇总 + 详解不拆分）
- SVG 统一 960x540 画布、三列等宽
- PNG 格式支持（IP 注册流程图、场景验证图）
- deck.json 与 outline.json 严格同步、文件 001~034 连续编号

**预览地址**：
- `http://localhost:9030/?project=003_visual_spec`

## 如何复用

1. 复制对应项目目录到新编号，如 `work/ppt/004_新项目/`
2. 在 `work/input/004_新项目/` 下编写需求说明
3. 执行 `/fppt:outline` 生成大纲，确认后执行 `/fppt:detail` 生成页面
4. 构建并预览：`npm --prefix ppt-viewer run build && node server.mjs`

## 多语言支持

系统支持中（zh-CN）、日（ja-JP）、英（en-US）三种语言。生成 PPT 时，`deck.json` 的 `language` 字段会自动适配用户输入语言，所有标题、要点、SVG 文案均统一到选定语言。

当前这四个案例工程均为中文版本，如需其他语言版本，在 `/fppt:outline` 阶段 AI 会自动根据用户输入语言生成对应语言的内容。
