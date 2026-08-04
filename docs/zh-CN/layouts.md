# Layouts

## 说明

下面的示例使用 SVG 方式展示常见 `layout_type` 的外观，风格尽量对齐 `ppt-viewer` 当前的标题、圆角卡片、蓝色强调色和留白节奏。

这些示例不是截图，而是文档专用 SVG，用于快速理解各类布局适合承载什么内容。

字段全集和更底层的类型库说明可对照：

- [skills/prompts/ppt/layouts.md](../skills/prompts/ppt/layouts.md)

## 选择建议

- 开场、章节封面：优先 `cover` / `section_divider`
- 结论和摘要页：优先 `title_bullets`
- 对比页：优先 `comparison_table`
- 阶段门禁页：优先 `phases`
- 按角色推进的工作流：优先 `swimlane_process`
- 需要真实图示表达的页面：优先 `svg_full`

## 常用 Layout

### `cover`

![cover](../assets/zh-CN/layout-cover.svg)

适用场景：

- 首页封面
- 章节封面
- 需要背景图承载情绪的开场页

关键字段：

- `title`
- `subtitle`
- `background`
- `date`
- `lecturer`

示例：

```json
{
  "layout_type": "cover",
  "title": "Skill 和 Harness",
  "subtitle": "从 Prompt Engineering 走向可执行系统",
  "date": "2026-06-17",
  "lecturer": "Stephen Wang",
  "background": {
    "src": "work/assets/001-cover-hero.svg",
    "overlay": "rgba(15,23,42,0.52)",
    "size": "cover",
    "position": "75% 50%"
  }
}
```

### `section_divider`

![section_divider](../assets/zh-CN/layout-section-divider.svg)

适用场景：

- 章节切换
- 阶段分段
- 节奏重置

关键字段：

- `title`
- `subtitle`
- `background`
- `chapter_label`

示例：

```json
{
  "layout_type": "section_divider",
  "title": "第二部分：Skill 的执行路径",
  "subtitle": "从触发到产出，先看流程再看实现",
  "chapter_label": "Chapter 02",
  "background": {
    "src": "work/assets/001-chapter-02-bg.svg",
    "overlay": "rgba(15,23,42,0.42)",
    "size": "cover",
    "position": "center"
  }
}
```

### `title_bullets`

![title_bullets](../assets/zh-CN/layout-title-bullets.svg)

适用场景：

- 开场说明
- agenda
- summary
- roadmap
- 执行摘要
- 一个总判断 + 多类能力卡片

关键字段：

- `title`
- `bullets`
- `subtitle`（可选）
- `foreground`
- `cards`（可选，适合 2-4 个并列结果卡片）

示例：

```json
{
  "layout_type": "title_bullets",
  "title": "执行摘要：一个底座 + 三类 AI + 两套保障",
  "subtitle": "核心判断：数字化决定数据可用性，AI 决定决策与自动化效率。",
  "bullets": [
    "一个底座：数据平台 + 集成平台 + 基础设施，统一数据、全域集成、安全合规。",
    "两套保障：组织制度保障与安全合规保障，覆盖治理、培训、考核、审计与权限。",
    "里程碑路径：M01-M03 样板闭环，M04-M06 跨厂复制，M07-M12+ 平台化规模化。"
  ],
  "cards": [
    { "title": "研发 AI", "text": "代码补全、测试生成、架构审查，研发效率提升 30%+。" },
    { "title": "业务 AI", "text": "排产优化、质量预测、设备预警，推动良率提升与停机减少。" },
    { "title": "办公 AI", "text": "文档生成、会议纪要、企业搜索，显著提升协同效率。" }
  ]
}
```

### `staff_list`

![staff_list](../assets/zh-CN/layout-staff-list.svg)

适用场景：

- 条目式目录页
- 方法论清单
- 能力拆解页
- 想做得比普通 bullet 更有记忆点的条目页

关键字段：

- `title`
- `items` 或 `bullets`
- `subtitle`（可选）
- `eyebrow`（可选）

示例：

```json
{
  "layout_type": "staff_list",
  "title": "项目推进的四个关键条目",
  "subtitle": "左侧装饰采用“金箍棒式轴条”，适合把多个要点排成规整清单。",
  "items": [
    { "tag": "章节 01", "title": "战略方向", "text": "先明确目标、边界和优先级，避免后续动作散掉。" },
    { "tag": "章节 02", "title": "能力建设", "text": "把数据、流程、平台和组织等支撑能力逐条拆开表达。" },
    { "tag": "章节 03", "title": "执行机制", "text": "条目内部建议采用“短标题 + 一句解释”的稳定结构。" },
    { "tag": "章节 04", "title": "落地保障", "text": "最后收束到治理、节奏、责任人和复盘闭环。" }
  ]
}
```

### `comparison_table`

![comparison_table](../assets/zh-CN/layout-comparison-table.svg)

适用场景：

- 概念对比
- 方案对比
- 前后代际差异

关键字段：

- `title`
- `table.headers`
- `table.rows`

示例：

```json
{
  "layout_type": "comparison_table",
  "title": "三代工程方式的差异",
  "table": {
    "headers": ["维度", "Prompt Engineering", "Harness Engineering"],
    "rows": [
      ["目标", "更会问", "更会做"],
      ["执行方式", "单轮生成", "生成-检查-回改循环"],
      ["产出稳定性", "依赖当次发挥", "依赖流程约束"]
    ]
  }
}
```

### `phases`

![phases](../assets/zh-CN/layout-phases.svg)

适用场景：

- 阶段门禁
- 质量闭环
- 分阶段推进

关键字段：

- `title`
- `narrow`（可选，5 阶段左右总览时可压缩标题区）
- `phases[].title`
- `phases[].text`
- `phases[].bullets`
- `phases[].gate`

示例：

```json
{
  "layout_type": "phases",
  "title": "制造业数字化转型与 AI 导入整体思路",
  "narrow": true,
  "phases": [
    {
      "title": "业务战略规划",
      "bullets": ["对齐战略目标", "参考行业最佳实践", "明确年度任务清单"],
      "gate": "先定方向"
    },
    {
      "title": "当前业务分析",
      "bullets": ["盘点业务现状", "核查数据与系统现状", "识别技术差距"],
      "gate": "先看清差距"
    }
  ]
}
```

### `swimlane_process`

![swimlane_process](../assets/zh-CN/layout-swimlane-process.svg)

适用场景：

- 多角色协作链路
- 按时间推进的工作流
- 用户、Skill、文件系统、前端预览之间的映射

关键字段：

- `title`
- `headers`（可选，用于给每一列命名）
- `lanes[].name`
- `lanes[].steps`

示例：

```json
{
  "layout_type": "swimlane_process",
  "title": "企业用车需求确认流程",
  "headers": ["申请", "分派", "执行", "完成", "变更", "取消 / 异常"],
  "lanes": [
    { "name": "用车人", "steps": ["申请用车", "", "", "", "变更用车", "取消用车"] },
    { "name": "派车员", "steps": ["", "分派车辆", "", "", "更换车辆 / 撤销分派", "冲突处理 / 紧急变更"] },
    { "name": "司机", "steps": ["", "", "出发", "到达", "更换司机", "司机拒绝 / 紧急停止"] }
  ]
}
```

### `swimlane_board`

![swimlane_board](../assets/zh-CN/layout-swimlane-board.svg)

适用场景：

- 多责任域并行推进
- 团队 / 模块 / 能力分层说明
- 每条泳道内部再拆关键动作

关键字段：

- `title`
- `lanes[].name`
- `lanes[].note`
- `lanes[].items`

示例：

```json
{
  "layout_type": "swimlane_board",
  "title": "三层协同泳道",
  "lanes": [
    {
      "name": "业务前台",
      "note": "客户需求、场景反馈、优先级输入",
      "items": [
        { "tag": "INPUT", "title": "需求归并", "text": "统一入口、合并重复问题" },
        { "tag": "ACTION", "title": "优先级判定", "text": "按影响面与紧急度排序" },
        { "tag": "OUTPUT", "title": "进入方案池", "text": "形成可执行的问题列表" }
      ]
    },
    {
      "name": "中台策略",
      "note": "规则设计、资源协调、方案落地",
      "items": [
        { "tag": "PLAN", "title": "策略建模", "text": "目标、规则、责任人拆解" },
        { "tag": "SYNC", "title": "跨团队协同", "text": "资源分派、节奏管理、里程碑" },
        { "tag": "RULE", "title": "执行标准", "text": "形成统一口径与检查点" }
      ]
    },
    {
      "name": "后台支撑",
      "note": "数据回收、系统支撑、闭环优化",
      "items": [
        { "tag": "DATA", "title": "指标监测", "text": "持续收集效果与异常信号" },
        { "tag": "SUPPORT", "title": "平台支撑", "text": "自动化、权限、数据底座" },
        { "tag": "LOOP", "title": "结果复盘", "text": "把经验沉淀为下一轮输入" }
      ]
    }
  ]
}
```

### `metro_loop`

![metro_loop](../assets/zh-CN/layout-metro-loop.svg)

适用场景：

- 持续改进闭环
- AIOps / MLOps 运维闭环
- 地铁站点式阶段链路
- 一页同时展示闭环步骤和 2-4 个摘要指标

关键字段：

- `title`
- `center.title`
- `center.text`
- `stops[]`：`title` + `text`（可选） + `icon`（可选） + `line`（可选）
- `metrics[]`：`label` + `value` + `note`（可选）

示例：

```json
{
  "layout_type": "metro_loop",
  "title": "AI 模型运维可观测系统",
  "center": {
    "title": "AI 模型运维闭环",
    "text": "从部署、采集、检测、诊断到自动处置，形成主动发现、快速恢复、持续优化的一体化环线。"
  },
  "stops": [
    { "title": "模型部署上线", "text": "灰度发布 / 分批切流 / A/B 对照", "icon": "rollout", "line": "blue" },
    { "title": "全维度数据采集", "text": "输出分布 / 特征分布 / 日志 / 链路 / 资源", "icon": "database", "line": "cyan" },
    { "title": "智能异常检测", "text": "数据漂移 / 基线偏离 / 多指标关联", "icon": "search", "line": "orange" },
    { "title": "告警与根因诊断", "text": "分级告警 / 工单联动 / 影响面评估", "icon": "audit", "line": "red" },
    { "title": "自动处置闭环", "text": "自动回滚 / 降级切流 / 规则优化", "icon": "refresh", "line": "green" }
  ],
  "metrics": [
    { "label": "漂移检测响应", "value": "<1h", "note": "自动告警触发" },
    { "label": "灰度覆盖率", "value": "100%", "note": "全模型灰度发布" },
    { "label": "告警闭环率", "value": "98%", "note": "24h 内闭环" },
    { "label": "自动回滚时间", "value": "<5min", "note": "异常自动触发" }
  ]
}
```

### `double_loop`

![double_loop](../assets/zh-CN/layout-double-loop.svg)

适用场景：

- 双循环治理
- 策略与执行协同
- 前后台联动
- 规划、执行、复盘双引擎

关键字段：

- `title`
- `left_title`
- `right_title`
- `left_nodes[]`
- `right_nodes[]`

示例：

```json
{
  "layout_type": "double_loop",
  "title": "策略与执行双循环",
  "left_title": "策略循环",
  "right_title": "执行循环",
  "left_nodes": [
    { "title": "洞察输入" },
    { "title": "需求澄清" },
    { "title": "方案建模" },
    { "title": "机制校准" }
  ],
  "right_nodes": [
    { "title": "执行推进" },
    { "title": "数据回收" },
    { "title": "效果验证" },
    { "title": "持续优化" }
  ]
}
```

### `iceberg`

![iceberg](../assets/zh-CN/layout-iceberg.svg)

适用场景：

- 冰山模型
- 表层现象与深层根因拆解
- 显性结果与隐性结构说明
- 认知、组织、机制、能力的分层表达

关键字段：

- `title`
- `tip.title`
- `tip.text`
- `base.title`
- `base.text`
- `base.bullets[]`

示例：

```json
{
  "layout_type": "iceberg",
  "title": "AI 落地的冰山结构",
  "tip": {
    "tag": "VISIBLE",
    "title": "上线效果",
    "text": "用户看到的是模型上线、体验改善和短期结果。"
  },
  "base": {
    "tag": "HIDDEN",
    "title": "深层驱动",
    "text": "真正决定长期效果的，是水面以下的组织能力和机制建设。",
    "bullets": ["数据治理", "流程标准", "知识沉淀", "协同机制", "持续运营"]
  }
}
```

### `house`

![house](../assets/zh-CN/layout-house.svg)

适用场景：

- 战略屋 / 能力屋 / 治理屋
- 一个总目标，下挂 3-4 个能力支柱
- 底部需要明确平台、治理、机制等基础底座

关键字段：

- `title`
- `roof.title`
- `roof.text`
- `pillars[]`
- `foundation.title`
- `foundation.text`
- `foundation.items[]`

示例：

```json
{
  "layout_type": "house",
  "title": "AI 运营能力屋",
  "roof": {
    "title": "统一 AI 运营目标",
    "text": "围绕价值实现、交付标准与衡量口径形成统一屋顶"
  },
  "pillars": [
    {
      "tag": "PILLAR 01",
      "title": "业务场景",
      "text": "锁定高价值场景，明确优先级、收益与试点范围"
    },
    {
      "tag": "PILLAR 02",
      "title": "核心能力",
      "text": "沉淀模型、流程、规则和模板，形成可复制交付能力"
    },
    {
      "tag": "PILLAR 03",
      "title": "运营机制",
      "text": "建立监控、复盘、优化的持续运营闭环"
    }
  ],
  "foundation": {
    "title": "基础底座",
    "text": "用统一平台、治理和权限体系支撑上层能力稳定运行",
    "items": ["数据平台", "治理口径", "权限合规"]
  }
}
```

### `radial_explainer`

![radial_explainer](../assets/zh-CN/layout-radial-explainer.svg)

适用场景：

- 一个核心议题，向外解释 4-6 个关键模块
- 方法论展开、能力拆解、方案总览
- 中心概念固定，周围按主题逐条说明

关键字段：

- `title`
- `center.title`
- `center.text`
- `items[]`

示例：

```json
{
  "layout_type": "radial_explainer",
  "title": "智能运营框架总览",
  "center": {
    "title": "核心议题",
    "text": "围绕一个总目标，向外拆分关键模块与动作"
  },
  "items": [
    {
      "tag": "TOPIC 01",
      "title": "目标定义",
      "text": "明确总目标、边界和评价口径"
    },
    {
      "tag": "TOPIC 02",
      "title": "执行路径",
      "text": "把目标拆成关键动作与里程碑"
    },
    {
      "tag": "TOPIC 03",
      "title": "支撑能力",
      "text": "平台、工具、机制共同支撑落地"
    },
    {
      "tag": "TOPIC 04",
      "title": "数据回收",
      "text": "持续收集效果与异常信号闭环优化"
    },
    {
      "tag": "TOPIC 05",
      "title": "责任分工",
      "text": "明确角色边界与协同关系"
    }
  ]
}
```

### `brain_explainer`

![brain_explainer](../assets/zh-CN/layout-brain-explainer.svg)

适用场景：

- 智能中枢 / 洞察引擎 / 认知大脑
- 中间是统一判断核心，周围解释输入、规则、执行、反馈等模块
- 一页展示“像大脑一样协同运作”的能力结构

关键字段：

- `title`
- `brain.title`
- `brain.text`
- `items[]`

示例：

```json
{
  "layout_type": "brain_explainer",
  "title": "智能运营大脑",
  "brain": {
    "title": "智能中枢",
    "text": "统一认知、规则和反馈闭环，驱动周边模块协同运作"
  },
  "items": [
    {
      "tag": "TOPIC 01",
      "title": "洞察输入",
      "text": "把用户、业务与场景信号统一汇入"
    },
    {
      "tag": "TOPIC 02",
      "title": "规则判断",
      "text": "基于标准口径完成识别与决策"
    },
    {
      "tag": "TOPIC 03",
      "title": "执行驱动",
      "text": "把中枢判断转成下游动作和编排"
    },
    {
      "tag": "TOPIC 04",
      "title": "反馈学习",
      "text": "持续回收效果、异常与经验进行优化"
    },
    {
      "tag": "TOPIC 05",
      "title": "知识沉淀",
      "text": "把经验转化为模板、机制与知识资产"
    }
  ]
}
```

### `profile_intro`

![profile_intro](../assets/zh-CN/layout-profile-intro.svg)

适用场景：

- 个人介绍 / 团队核心成员介绍
- 顾问、讲师、嘉宾、项目负责人简介页
- 一半照片，一半用标签、摘要和分区卡片表达个人背景

关键字段：

- `title`
- `photo.src`
- `profile.name`
- `profile.role`
- `profile.summary`
- `profile.tags[]`
- `sections[]`

示例：

```json
{
  "layout_type": "profile_intro",
  "title": "核心成员介绍",
  "photo": {
    "src": "work/assets/profile-zhangyuchen.png",
    "caption": "项目主负责人"
  },
  "profile": {
    "name": "张雨辰",
    "role": "战略咨询顾问 / AI 产品负责人",
    "summary": "专注于把业务洞察、数字化能力和组织协同落到可执行方案。",
    "organization": "某咨询团队",
    "location": "上海",
    "tags": ["业务洞察", "方案设计", "组织协同"]
  },
  "sections": [
    {
      "label": "PART 01",
      "title": "核心经历",
      "text": "8 年咨询与产品经验，覆盖金融、企业服务与 AI 应用场景。"
    },
    {
      "label": "PART 02",
      "title": "擅长领域",
      "items": ["战略拆解", "产品规划", "Prompt 设计", "知识工程"]
    },
    {
      "label": "PART 03",
      "title": "代表标签",
      "text": "结果导向、结构清晰、表达稳定、推进节奏感强。"
    },
    {
      "label": "PART 04",
      "title": "合作方式",
      "text": "擅长跨团队沟通，对齐目标、拆解任务并持续推进执行闭环。"
    }
  ]
}
```

### `chip_explainer`

![chip_explainer](../assets/zh-CN/layout-chip-explainer.svg)

适用场景：

- 平台能力页
- 技术方案页
- 用“芯片”隐喻中枢能力，再拆出四个解释模块

关键字段：

- `title`
- `chip.title`
- `chip.text`
- `items[]`

示例：

```json
{
  "layout_type": "chip_explainer",
  "title": "平台中枢能力",
  "chip": {
    "title": "智能芯片",
    "text": "作为统一算力与规则中枢，向四个方向分发能力、接口与协同机制。"
  },
  "items": [
    {
      "tag": "PART 01",
      "title": "算力核心",
      "text": "定义统一的处理与计算能力底座"
    },
    {
      "tag": "PART 02",
      "title": "接口总线",
      "text": "对外提供能力接口与标准接入方式"
    },
    {
      "tag": "PART 03",
      "title": "协同机制",
      "text": "驱动上下游模块形成稳定协作关系"
    },
    {
      "tag": "PART 04",
      "title": "规则编排",
      "text": "把策略口径写成可执行的规则单元"
    }
  ]
}
```

### `petal_explainer`

![petal_explainer](../assets/zh-CN/layout-petal-explainer.svg)

适用场景：

- 四个模块对称说明
- 能力花瓣图
- 核心主题 + 四个支撑点

关键字段：

- `title`
- `core_title`
- `items`

示例：

```json
{
  "layout_type": "petal_explainer",
  "title": "花瓣式能力结构",
  "core_title": "核心议题",
  "items": [
    { "title": "用户洞察", "text": "识别关键对象、需求与触点。" },
    { "title": "方案设计", "text": "拆解动作、节奏与责任分工。" },
    { "title": "执行落地", "text": "推进资源协同与任务闭环。" },
    { "title": "结果复盘", "text": "沉淀经验并优化下一轮动作。" }
  ]
}
```

### `fan_explainer`

![fan_explainer](../assets/zh-CN/layout-fan-explainer.svg)

适用场景：

- 核心主题向外展开四个解释模块
- 比花瓣式更有方向感的说明页
- 想表达“展开、铺开、分层解释”的结构页

关键字段：

- `title`
- `core_title` 或 `core`
- `items`

示例：

```json
{
  "layout_type": "fan_explainer",
  "title": "折扇式结构说明",
  "core_title": "核心主题",
  "items": [
    { "title": "用户洞察", "text": "先识别关键对象、需求与触点。" },
    { "title": "方案设计", "text": "拆解动作、节奏与责任分工。" },
    { "title": "执行落地", "text": "推进资源协同与任务闭环。" },
    { "title": "结果复盘", "text": "沉淀经验并优化下一轮动作。" }
  ]
}
```

### `screen_explainer`

![screen_explainer](../assets/zh-CN/layout-screen-explainer.svg)

适用场景：

- 中心界面讲解
- 核心屏幕 + 周边说明
- 产品能力解释页

关键字段：

- `title`
- `screen`
- `items`

示例：

```json
{
  "layout_type": "screen_explainer",
  "title": "核心界面解释布局",
  "screen": {
    "tag": "SCREEN",
    "title": "统一运营驾驶舱",
    "text": "把关键指标、主流程和当前状态放在中间大屏幕中。"
  },
  "items": [
    { "title": "任务入口", "text": "集中承载待办、提醒和优先动作。" },
    { "title": "数据透视", "text": "以浮窗方式解释关键指标与异常。"},
    { "title": "协同动作", "text": "说明跨角色协同和操作链路。" },
    { "title": "闭环反馈", "text": "解释结果回收、复盘与优化。"}
  ]
}
```

### `stage_chevrons`

![stage_chevrons](../assets/zh-CN/layout-stage-chevrons.svg)

适用场景：

- 横向阶段推进
- 箭头式阶段分段
- 从前到后的连续流程

关键字段：

- `title`
- `stages`

示例：

```json
{
  "layout_type": "stage_chevrons",
  "title": "横向阶段推进",
  "stages": [
    { "title": "准备", "text": "统一口径与目标。" },
    { "title": "启动", "text": "明确动作与责任。" },
    { "title": "扩展", "text": "复制打法并扩大范围。" },
    { "title": "沉淀", "text": "形成机制与复盘闭环。" }
  ]
}
```

### `stage_staircase`

![stage_staircase](../assets/zh-CN/layout-stage-staircase.svg)

适用场景：

- 台阶式阶段提升
- 成熟度逐级上升
- 从基础到高阶的过程展示

关键字段：

- `title`
- `stages`

示例：

```json
{
  "layout_type": "stage_staircase",
  "title": "台阶式阶段提升",
  "stages": [
    { "title": "基础规范", "text": "统一标准和底层规则。" },
    { "title": "流程成型", "text": "建立阶段动作和协同机制。" },
    { "title": "复制推广", "text": "把成熟方法推广到更多场景。" },
    { "title": "持续优化", "text": "形成改进闭环和长期能力。" }
  ]
}
```

### `stage_zigzag`

![stage_zigzag](../assets/zh-CN/layout-stage-zigzag.svg)

适用场景：

- 左右交错阶段链路
- 节奏感较强的阶段页
- 需要避免横向拥挤的多阶段说明

关键字段：

- `title`
- `stages`

示例：

```json
{
  "layout_type": "stage_zigzag",
  "title": "交错阶段链路",
  "stages": [
    { "title": "识别问题", "text": "明确问题边界与核心对象。" },
    { "title": "拆解方案", "text": "分层定义动作与资源。" },
    { "title": "试点验证", "text": "在小范围验证有效性。" },
    { "title": "规模复制", "text": "跨团队、跨场景推广。" }
  ]
}
```

### `development_route`

![development_route](../assets/zh-CN/layout-development-route.svg)

适用场景：

- 企业发展路线图
- 平台成长路径
- 战略推进路线
- 能力演进路径

关键字段：

- `title`
- `base_label`
- `stages[]`
- `destination`

示例：

```json
{
  "layout_type": "development_route",
  "title": "企业发展路线图",
  "base_label": "当前基础",
  "stages": [
    {
      "phase": "阶段 1",
      "title": "能力夯实",
      "text": "统一基础流程、组织职责和数据口径。"
    },
    {
      "phase": "阶段 2",
      "title": "体系成型",
      "text": "形成标准机制、关键流程和协同接口。"
    },
    {
      "phase": "阶段 3",
      "title": "规模复制",
      "text": "把成功模式复制到更多业务单元和区域。"
    },
    {
      "phase": "阶段 4",
      "title": "生态协同",
      "text": "打通内外部资源，构建更强的协作网络。"
    }
  ],
  "destination": {
    "title": "目标状态",
    "text": "形成清晰的发展路径、阶段目标与组织支撑能力。"
  }
}
```

### `cycle_explainer`

![cycle_explainer](../assets/zh-CN/layout-cycle-explainer.svg)

适用场景：

- 管理闭环
- 运营闭环
- 策略闭环
- 持续优化循环

关键字段：

- `title`
- `center`
- `items`

示例：

```json
{
  "layout_type": "cycle_explainer",
  "title": "经营闭环机制",
  "center": {
    "title": "核心闭环",
    "text": "把关键动作组织成持续迭代、持续优化的循环机制。"
  },
  "items": [
    { "tag": "01", "title": "洞察输入", "text": "持续收集问题、反馈与场景变化。" },
    { "tag": "02", "title": "策略制定", "text": "把洞察整理成清晰动作与优先级。" },
    { "tag": "03", "title": "执行推进", "text": "围绕目标推动资源与团队协同落地。" },
    { "tag": "04", "title": "效果验证", "text": "观察过程数据、结果反馈和偏差情况。" },
    { "tag": "05", "title": "复盘纠偏", "text": "总结问题，修正机制和下一轮方案。" },
    { "tag": "06", "title": "能力沉淀", "text": "把经验沉淀为模板、标准和工具能力。" }
  ]
}
```

### `svg_full`

![svg_full](../assets/zh-CN/layout-svg-full.svg)

适用场景：

- 结构图
- 关系图
- 工作原理图
- 三层结构图
- 需要真实图形表达的概念页

关键字段：

- `title`
- `svg.src`
- `svg.alt`
- `svg.caption`
- `show_title`

示例：

```json
{
  "layout_type": "svg_full",
  "title": "从 Prompt Engineering 到 Harness Engineering",
  "show_title": true,
  "svg": {
    "src": "work/assets/001-evolution-compare.svg",
    "alt": "三代工程演进关系图",
    "caption": "用真实 SVG 承载结构和关系，而不是继续堆 bullet。"
  }
}
```

使用约束：

- SVG 内不重复写页标题
- 画面尽量填满 16:9
- 优先用卡片、箭头、分层、关系线表达
- 不要把 `svg_full` 当成“换个容器继续放大段文字”
- 如果当前 viewer 里没有完全匹配的新 layout，允许直接用 `svg_full` + `work/assets/*.svg` 落地；待复用稳定后，再沉淀成独立 layout

### `two_column`

![two_column](../assets/zh-CN/layout-two-column.svg)

适用场景：

- 左文右图
- 左结论右说明
- 左原则右示意

关键字段：

- `title`
- `left`
- `right`

示例：

```json
{
  "layout_type": "two_column",
  "title": "Skill 的基本职责",
  "left": {
    "title": "左侧结论",
    "bullets": ["先定义输入", "再定义输出", "最后定义执行约束"]
  },
  "right": {
    "title": "右侧图示",
    "image": {
      "src": "work/assets/001-skill-template.svg",
      "caption": "Skill 模板示意"
    }
  }
}
```

### `symmetric_split`

![symmetric_split](../assets/zh-CN/layout-symmetric-split.svg)

适用场景：

- 左右双侧对称说明
- 两个对象并列展开
- 两类能力 / 两条路径镜像展示

关键字段：

- `title`
- `center_label`（可选）
- `left`
- `right`

示例：

```json
{
  "layout_type": "symmetric_split",
  "title": "能力体系左右对称布局",
  "center_label": "VS",
  "left": {
    "tag": "供给侧",
    "title": "平台能力",
    "bullets": ["统一底座", "服务编排", "指标看板"]
  },
  "right": {
    "tag": "需求侧",
    "title": "业务价值",
    "bullets": ["场景落地", "流程提效", "结果复盘"]
  }
}
```

### `three_column`

![three_column](../assets/zh-CN/layout-three-column.svg)

适用场景：

- 三段式拆解
- 三个并列观点
- 三类对象对照

关键字段：

- `title`
- `columns`

示例：

```json
{
  "layout_type": "three_column",
  "title": "Harness 的三个核心层",
  "columns": [
    { "title": "输入层", "bullets": ["接收需求", "读取上下文"] },
    { "title": "执行层", "bullets": ["生成结果", "调用工具"] },
    { "title": "验证层", "bullets": ["检查质量", "回改输出"] }
  ]
}
```

### `problem_statement`

![problem_statement](../assets/zh-CN/layout-problem-statement.svg)

适用场景：

- 问题定义
- 方案前置说明
- 先界定问题，再进入解法

关键字段：

- `title`
- `blocks`

示例：

```json
{
  "layout_type": "problem_statement",
  "title": "为什么不能只靠一次生成",
  "blocks": [
    { "title": "现象", "text": "同一请求多次生成结果差异大。" },
    { "title": "影响", "text": "页面风格和结构不稳定。" },
    { "title": "根因", "text": "缺少固定流程与质量门。" }
  ]
}
```

### `before_after`

![before_after](../assets/zh-CN/layout-before-after.svg)

适用场景：

- 改造前后对照
- 单轮方式与闭环方式对照
- 旧方案与新方案对照

关键字段：

- `title`
- `before`：`title` + `text`（段落，可选） + `bullets`（列表，可选），二者可共存也可只填其一
- `after`：`title` + `text`（段落，可选） + `bullets`（列表，可选），同上

bullets 模式示例：

```json
{
  "layout_type": "before_after",
  "title": "Prompt 到 Harness 的变化",
  "before": { "title": "Before", "bullets": ["单轮问答", "靠模型临场发挥"] },
  "after": { "title": "After", "bullets": ["流程化执行", "带质检和回改"] }
}
```

text 模式示例：

```json
{
  "layout_type": "before_after",
  "title": "生成方式对比",
  "before": { "title": "传统做法", "text": "单次生成，缺少回改机制。每次修改需从零开始，没有质量保障环节，交付质量不稳定。" },
  "after": { "title": "Visual-Spec", "text": "生成-检查-回改循环。图形真实落盘可预览验证，每一步都有质检节点，交付质量稳定可控。" }
}
```

### `kpi_cards`

![kpi_cards](../assets/zh-CN/layout-kpi-cards.svg)

适用场景：

- 核心指标总览
- 一页展示多个关键数值
- 开场或总结的指标摘要

关键字段：

- `title`
- `cards`

示例：

```json
{
  "layout_type": "kpi_cards",
  "title": "本轮交付指标",
  "cards": [
    { "label": "页数", "value": "24", "note": "含结构图 9 页" },
    { "label": "图页占比", "value": "42%", "note": "优先 SVG" },
    { "label": "返工轮次", "value": "2", "note": "detail 阶段回改" }
  ]
}
```

### `steps`

![steps](../assets/zh-CN/layout-steps.svg)

适用场景：

- 顺序步骤
- 执行流程
- 线性推进链路

关键字段：

- `title`
- `steps[].title`
- `steps[].icon`
- `steps[].text`
- `steps[].bullets`

示例：

```json
{
  "layout_type": "steps",
  "title": "数据贯通：全链路集成与追溯",
  "steps": [
    {
      "title": "统一编码体系",
      "icon": "plan",
      "text": "先统一主键和口径，打通跨系统映射。",
      "bullets": ["统一物料、设备、工位、组织编码", "贯穿 ERP → MES → WMS 全链条"]
    },
    {
      "title": "NTP 时间同步",
      "icon": "fit",
      "text": "保证多系统事件顺序可严格还原。",
      "bullets": ["全系统毫秒级时钟对齐", "支撑追溯、审计与异常回放"]
    },
    {
      "title": "全链路追溯",
      "icon": "flow",
      "text": "同时支持正向和反向追溯，覆盖完整工艺路线。",
      "bullets": ["正向：原料 → 半成品 → 成品", "反向：成品 → 原料批次"]
    }
  ]
}
```

### `four_grid`

![four_grid](../assets/zh-CN/layout-four-grid.svg)

适用场景：

- 四象限解释
- 四部分拆解
- 输入/输出/约束/验证

关键字段：

- `title`
- `items`

示例：

```json
{
  "layout_type": "four_grid",
  "title": "Skill 的四个关注点",
  "items": [
    { "title": "输入", "bullets": ["读取原始需求"] },
    { "title": "结构", "bullets": ["规划章节顺序"] },
    { "title": "表达", "bullets": ["匹配合适 layout"] },
    { "title": "验证", "bullets": ["检查超屏和缺图"] }
  ]
}
```

### `matrix_2x2`

![matrix_2x2](../assets/zh-CN/layout-matrix-2x2.svg)

适用场景：

- 二维判断
- 价值/投入分类
- 优先级划分

关键字段：

- `title`
- `quadrants`

示例：

```json
{
  "layout_type": "matrix_2x2",
  "title": "任务优先级矩阵",
  "quadrants": [
    { "title": "高价值低投入", "bullets": ["优先推进"] },
    { "title": "高价值高投入", "bullets": ["纳入计划"] },
    { "title": "低价值低投入", "bullets": ["按需处理"] },
    { "title": "低价值高投入", "bullets": ["避免投入"] }
  ]
}
```

### `quadrant_axes`

![quadrant_axes](../assets/zh-CN/layout-quadrant-axes.svg)

适用场景：

- 四象限分类，同时需要明确横纵轴含义
- 影响/投入、收益/风险等二维坐标解释
- 需要让观众“一眼看懂坐标轴”的四象限页

关键字段：

- `title`
- `x_label`
- `y_label`
- `quadrants`

示例：

```json
{
  "layout_type": "quadrant_axes",
  "title": "价值-投入象限",
  "x_label": "投入",
  "y_label": "价值",
  "quadrants": [
    { "title": "低投入 / 高价值", "bullets": ["优先推进"] },
    { "title": "高投入 / 高价值", "bullets": ["纳入计划"] },
    { "title": "低投入 / 低价值", "bullets": ["按需处理"] },
    { "title": "高投入 / 低价值", "bullets": ["避免投入"] }
  ]
}
```

### `architecture_layered`

![architecture_layered](../assets/zh-CN/layout-architecture-layered.svg)

适用场景：

- 分层架构
- 系统组成
- 能力栈说明
- 底座 -> 平台 -> 场景应用

关键字段：

- `title`
- `layers[].title`
- `layers[].icon`
- `layers[].text`
- `layers[].bullets`

示例：

```json
{
  "layout_type": "architecture_layered",
  "title": "AI 建设内容分层",
  "layers": [
    {
      "title": "数字化底座的数据汇总",
      "icon": "database",
      "text": "统一汇聚系统数据、业务事件、设备时序和文档知识。",
      "bullets": ["主数据 / 事件数据 / 时序数据 / 知识库", "先把 AI 可用的数据基础打稳"]
    },
    {
      "title": "AI 基础设施",
      "icon": "workflow",
      "text": "提供模型服务、知识库、算力与统一安全控制。",
      "bullets": ["模型编排", "推理网关", "权限 / 审计 / 集成"]
    },
    {
      "title": "三类 AI 分析系统",
      "icon": "scale",
      "text": "最终支撑业务 AI、研发 AI、办公 AI 三类应用。",
      "bullets": ["质量预测 / 排产优化", "编码辅助 / 测试生成", "文档生成 / 企业搜索"]
    }
  ]
}
```

### `dependency_graph`

![dependency_graph](../assets/zh-CN/layout-dependency-graph.svg)

适用场景：

- 角色依赖
- 模块依赖
- 从任务到交付的关系网络

关键字段：

- `title`
- `nodes`
- `links`

示例：

```json
{
  "layout_type": "dependency_graph",
  "title": "产物关系图",
  "nodes": [
    { "id": "input", "label": "input" },
    { "id": "outline", "label": "outline.json" },
    { "id": "slides", "label": "slides/*.json" },
    { "id": "viewer", "label": "ppt-viewer" }
  ],
  "links": [
    { "source": "input", "target": "outline" },
    { "source": "outline", "target": "slides" },
    { "source": "slides", "target": "viewer" }
  ]
}
```

### `fishbone`

![fishbone](../assets/zh-CN/layout-fishbone.svg)

适用场景：

- 根因分析
- 复盘页：为什么没做好 / 为什么丢图 / 为什么超屏
- 需要从多个维度同时拆解原因时

关键字段：

- `title`
- `effect`
- `bones`

示例：

```json
{
  "layout_type": "fishbone",
  "title": "为什么“左右箭头丢失”",
  "effect": "流程图箭头在页面里没显示",
  "bones": [
    { "category": "素材", "causes": ["箭头使用 marker 未定义", "fill/opacity 被覆盖"] },
    { "category": "渲染", "causes": ["SVG 缩放后线太细", "样式被全局覆盖"] },
    { "category": "规范", "causes": ["缺少 SVG 自检", "缺少回归样例"] },
    { "category": "流程", "causes": ["只改了图没预览", "没走整套门禁"] }
  ]
}
```

### `bar_chart`

![bar_chart](../assets/zh-CN/layout-bar-chart.svg)

适用场景：

- 分类数据对比
- 指标排名
- 数量级展示

关键字段：

- `title`
- `data` 或 `series`

示例：

```json
{
  "layout_type": "bar_chart",
  "title": "不同页面类型数量",
  "unit": "页",
  "data": [
    { "label": "文字页", "value": 6 },
    { "label": "图形页", "value": 10 },
    { "label": "图表页", "value": 4 }
  ]
}
```

### `line_chart`

![line_chart](../assets/zh-CN/layout-line-chart.svg)

适用场景：

- 趋势变化
- 时间序列
- 指标曲线

关键字段：

- `title`
- `data` 或 `series`

示例：

```json
{
  "layout_type": "line_chart",
  "title": "生成质量迭代趋势",
  "unit": "分",
  "data": [
    { "label": "第 1 轮", "value": 68 },
    { "label": "第 2 轮", "value": 79 },
    { "label": "第 3 轮", "value": 88 }
  ]
}
```

## 补充 Layout

### `agenda`

![agenda](../assets/zh-CN/layout-agenda.svg)

适用场景：

- 目录页
- 章节预告
- 开场时说明整套内容节奏

关键字段：

- `title`
- `bullets`

示例：

```json
{
  "layout_type": "summary",
  "title": "本节总结",
  "bullets": ["先定结构，再定内容", "优先图形化表达", "每轮都做质检和预览"]
}
```

### `summary`

![summary](../assets/zh-CN/layout-summary.svg)

适用场景：

- 结尾总结
- 阶段回顾
- 一页归纳核心结论

关键字段：

- `title`
- `bullets`

### `thank_you`

![thank_you](../assets/zh-CN/layout-thank-you.svg)

适用场景：

- 收尾页
- 致谢页
- 结束后的联系方式或行动引导

关键字段：

- `title`
- `subtitle`

示例：

```json
{
  "layout_type": "thank_you",
  "title": "感谢观看",
  "subtitle": "欢迎继续 fork 和扩展这套系统"
}
```

### `appendix`

![appendix](../assets/zh-CN/layout-appendix.svg)

适用场景：

- 补充材料
- 备份页
- 延伸说明和参考链接

关键字段：

- `title`
- `bullets`

示例：

```json
{
  "layout_type": "appendix",
  "title": "附录",
  "bullets": ["术语解释", "补充截图", "参考链接"]
}
```

### `quote`

![quote](../assets/zh-CN/layout-quote.svg)

适用场景：

- 强调一句关键原则
- 插入观点页
- 引用原话或方法论判断

关键字段：

- `title`
- `quote`
- `by`
- `notes`

示例：

```json
{
  "layout_type": "quote",
  "title": "关键判断",
  "quote": "先把流程变成可执行系统，再把回答变成稳定交付。",
  "by": "Stephen Wang",
  "notes": "适合作为阶段总结页。"
}
```

### `triple_metrics`

![triple_metrics](../assets/zh-CN/layout-triple-metrics.svg)

适用场景：

- 三个核心数据展示
- 三大指标并列对比
- 三圆式数据概览

关键字段：

- `title`
- `metrics`

示例：

```json
{
  "layout_type": "triple_metrics",
  "title": "三大核心指标",
  "metrics": [
    { "label": "覆盖率", "value": 92, "unit": "%", "note": "核心场景已覆盖主要流程。" },
    { "label": "自动化率", "value": 68, "unit": "%", "note": "高频任务已进入自动处理。" },
    { "label": "响应时效", "value": 4.2, "unit": "h", "note": "关键事项平均响应时间。" }
  ]
}
```

### `swot`

![swot](../assets/zh-CN/layout-swot.svg)

适用场景：

- 优势劣势分析
- 内外部条件分析
- 战略判断的四象限表达

关键字段：

- `title`
- `quadrants`

示例：

```json
{
  "layout_type": "swot",
  "title": "Skill 工程化 SWOT",
  "quadrants": [
    { "title": "Strength", "bullets": ["可复用", "可验证"] },
    { "title": "Weakness", "bullets": ["前期搭建成本高"] },
    { "title": "Opportunity", "bullets": ["可扩展更多类型"] },
    { "title": "Threat", "bullets": ["规范不一致会退化"] }
  ]
}
```

### `pyramid`

![pyramid](../assets/zh-CN/layout-pyramid.svg)

适用场景：

- 每层一个梯形承载一个核心内容
- 从基础到高阶的能力栈
- 金字塔式结论归纳

关键字段：

- `title`
- `levels` 或 `blocks`
- `levels[].title`
- `levels[].text?`
- `levels[].bullets?`

示例：

```json
{
  "layout_type": "pyramid",
  "title": "能力金字塔",
  "levels": [
    { "title": "基础资源", "text": "数据、工具和知识资产共同构成底座。" },
    { "title": "执行流程", "text": "把目标拆成阶段动作、责任人与交付物。" },
    { "title": "质量闭环", "text": "通过检查、反馈和复盘提升稳定性。" },
    { "title": "稳定交付", "text": "最终沉淀成可以持续复用的业务价值。" }
  ]
}
```

### `logic_tree`

![logic_tree](../assets/zh-CN/layout-logic-tree.svg)

适用场景：

- 问题拆解
- 原因分析
- 方案树和逻辑分支

关键字段：

- `title`
- `root`

示例：

```json
{
  "layout_type": "logic_tree",
  "title": "页面质量问题拆解",
  "root": {
    "text": "为什么页面不好看",
    "children": [
      { "text": "layout 选择不对" },
      { "text": "图形表达不足" },
      { "text": "文字过密" }
    ]
  }
}
```

### `icicle_tree`

![icicle_tree](../assets/zh-CN/layout-icicle-tree.svg)

适用场景：

- 分层展开的树状结构
- 自上而下的分类体系
- 需要强调从整体到局部的结构页

关键字段：

- `title`
- `root`

示例：

```json
{
  "layout_type": "icicle_tree",
  "title": "文档结构树",
  "root": {
    "text": "docs",
    "children": [
      { "text": "manual" },
      { "text": "concept" },
      { "text": "layouts" },
      { "text": "fork" }
    ]
  }
}
```

### `process_flow`

![process_flow](../assets/zh-CN/layout-process-flow.svg)

适用场景：

- 线性流程说明
- 系统处理链路
- 先后顺序明确的动作页

关键字段：

- `title`
- `steps`
- `footer_cards`（可选）
- `summary`（可选）
- `steps[].title`
- `steps[].subtitle`
- `steps[].text`
- `steps[].bullets`
- `steps[].icon`
- `steps[].panels`（可选，步骤内子卡片）

示例：

```json
{
  "layout_type": "process_flow",
  "title": "从输入到预览的处理流",
  "steps": [
    {
      "title": "读取输入",
      "subtitle": "读取用户要求与约束",
      "bullets": ["识别语言", "识别类型", "识别资料来源"]
    },
    {
      "title": "生成 outline",
      "subtitle": "先形成章节骨架",
      "bullets": ["提取主线", "控制页数", "分配章节意图"]
    },
    {
      "title": "展开 detail",
      "subtitle": "为每页补结构化字段",
      "bullets": ["选择 layout", "补标题与卡片", "补表格/图表数据"]
    },
    {
      "title": "前端渲染",
      "subtitle": "viewer 直接预览",
      "bullets": ["组件渲染", "缺项兜底", "导出前检查"]
    }
  ],
  "footer_cards": [
    { "title": "输入", "text": "用户要求 + 资料" },
    { "title": "输出", "text": "outline / slides / deck" }
  ],
  "summary": "适合线性流程说明、输入输出链路、阶段步骤 + 输出成果页。"
}
```

### `timeline`

![timeline](../assets/zh-CN/layout-timeline.svg)

适用场景：

- 时间线
- 阶段推进
- 按季度或月份组织的计划说明

关键字段：

- `title`
- `bullets` 或 `table`

示例：

```json
{
  "layout_type": "timeline",
  "title": "一周落地计划",
  "bullets": ["Day 1 结构设计", "Day 2 layout 扩展", "Day 3 真实 deck 验证", "Day 4 文档收口"]
}
```

### `roadmap`

![roadmap](../assets/zh-CN/layout-roadmap.svg)

适用场景：

- 产品路线图
- 项目推进路线
- 长周期分阶段规划

关键字段：

- `title`
- `items`
- `actions`（可选）
- `goal`（可选）
- `items[].title`
- `items[].period`
- `items[].text`

示例：

```json
{
  "layout_type": "roadmap",
  "title": "后续路线图",
  "items": [
    { "title": "阶段一：完善文档", "period": "M01-M02", "text": "统一说明、示例和安装路径" },
    { "title": "阶段二：增加更多组件", "period": "M03-M04", "text": "补齐关键结构化 layout" },
    { "title": "阶段三：扩展新类型", "period": "M05-M06", "text": "把高复用案例沉淀成通用组件" }
  ],
  "actions": [
    { "title": "先补 viewer", "text": "优先支持文档里已声明的 layout" },
    { "title": "再补案例", "text": "用真实案例反推字段稳定性" }
  ],
  "goal": "目标：优先形成可复用的 layout 库，而不是只服务单个案例。"
}
```

### `milestones`

![milestones](../assets/zh-CN/layout-milestones.svg)

适用场景：

- 里程碑说明
- 关键交付节点
- 需要突出阶段性完成标记的页面

关键字段：

- `title`
- `table`

示例：

```json
{
  "layout_type": "milestones",
  "title": "关键里程碑",
  "table": {
    "headers": ["节点", "目标"],
    "rows": [["M1", "文档补齐"], ["M2", "组件稳定"], ["M3", "真实项目验证"]]
  }
}
```

### `org_roles`

![org_roles](../assets/zh-CN/layout-org-roles.svg)

适用场景：

- 组织分工
- 角色职责
- 人员与交付物映射

关键字段：

- `title`
- `table` 或 `bullets`

示例：

```json
{
  "layout_type": "org_roles",
  "title": "角色分工",
  "table": {
    "headers": ["角色", "职责", "产物"],
    "rows": [["用户", "提出需求", "input"], ["Skill", "生成结构", "outline/deck"], ["Viewer", "渲染预览", "页面展示"]]
  }
}
```

### `risk_register`

![risk_register](../assets/zh-CN/layout-risk-register.svg)

适用场景：

- 风险管理
- 风险台账
- 风险等级和应对策略整理

关键字段：

- `title`
- `table`

示例：

```json
{
  "layout_type": "risk_register",
  "title": "主要风险",
  "table": {
    "headers": ["风险", "等级", "应对"],
    "rows": [["图页过少", "高", "提高 svg_full 比例"], ["内容超屏", "中", "压缩文本并换 layout"]]
  }
}
```

### `pie_chart`

![pie_chart](../assets/zh-CN/layout-pie-chart.svg)

适用场景：

- 占比分析
- 类别构成
- 单组比例关系说明

关键字段：

- `title`
- `data`
- `unit`

示例：

```json
{
  "layout_type": "pie_chart",
  "title": "页面类型占比",
  "unit": "%",
  "data": [
    { "label": "结构图", "value": 45 },
    { "label": "文字页", "value": 30 },
    { "label": "图表页", "value": 25 }
  ]
}
```

### `donut_chart`

![donut_chart](../assets/zh-CN/layout-donut-chart.svg)

适用场景：

- 构成占比
- 完成率或达成率
- 需要在图中心放核心指标

关键字段：

- `title`
- `data`
- `unit`

示例：

```json
{
  "layout_type": "donut_chart",
  "title": "交付达成率",
  "unit": "%",
  "data": [
    { "label": "完成", "value": 78 },
    { "label": "未完成", "value": 22 }
  ]
}
```

### `area_chart`

![area_chart](../assets/zh-CN/layout-area-chart.svg)

适用场景：

- 趋势面积变化
- 累积量走势
- 需要强调增长区间时

关键字段：

- `title`
- `data` 或 `series`

示例：

```json
{
  "layout_type": "area_chart",
  "title": "生成质量提升趋势",
  "unit": "分",
  "data": [
    { "label": "周一", "value": 60 },
    { "label": "周二", "value": 71 },
    { "label": "周三", "value": 84 }
  ]
}
```

### `coordinate_axis`

![coordinate_axis](../assets/zh-CN/layout-coordinate-axis.svg)

适用场景：

- 用坐标轴表达概念位置（不一定是严格数据图）
- 两个维度同时解释时（例如：投入/收益、风险/回报）
- 为后续的散点图/气泡图做“坐标框架页”

关键字段：

- `title`
- `x_label`
- `y_label`
- `points`

示例：

```json
{
  "layout_type": "coordinate_axis",
  "title": "能力位置图",
  "x_label": "投入",
  "y_label": "收益",
  "points": [
    { "label": "A", "x": 2, "y": 7, "size": 12, "color": "#2563eb" },
    { "label": "B", "x": 5, "y": 9, "size": 18, "color": "#7c3aed" },
    { "label": "C", "x": 8, "y": 4, "size": 14, "color": "#16a34a" }
  ]
}
```

### `scatter_plot`

![scatter_plot](../assets/zh-CN/layout-scatter-plot.svg)

适用场景：

- 两个连续变量关系分析
- 分布特征说明
- 相关性和离群点观察

关键字段：

- `title`
- `data` 或 `series`
- `x_label`
- `y_label`

示例：

```json
{
  "layout_type": "scatter_plot",
  "title": "投入与质量关系",
  "x_label": "投入时间",
  "y_label": "质量得分",
  "data": [
    { "x": 1, "y": 60 }, { "x": 2, "y": 68 }, { "x": 3, "y": 79 }, { "x": 4, "y": 87 }
  ]
}
```

### `bubble_chart`

![bubble_chart](../assets/zh-CN/layout-bubble-chart.svg)

适用场景：

- 三维指标比较
- 横轴、纵轴、规模同时表达
- 多对象综合判断

关键字段：

- `title`
- `data` 或 `series`
- `x_label`
- `y_label`

示例：

```json
{
  "layout_type": "bubble_chart",
  "title": "任务价值比较",
  "x_label": "投入",
  "y_label": "收益",
  "data": [
    { "label": "A", "x": 2, "y": 7, "size": 18 },
    { "label": "B", "x": 5, "y": 9, "size": 30 }
  ]
}
```

### `waterfall_chart`

![waterfall_chart](../assets/zh-CN/layout-waterfall-chart.svg)

适用场景：

- 展示增减变化对最终结果的影响
- 拆解利润、成本、预算变化
- 表达从基线到结果的累计过程

关键字段：

- `title`
- `data` 或 `series`
- `unit`

示例：

```json
{
  "layout_type": "waterfall_chart",
  "title": "预算变化拆解",
  "unit": "万元",
  "data": [
    { "label": "基线", "value": 100 },
    { "label": "新增投入", "value": 30 },
    { "label": "效率节省", "value": -15 },
    { "label": "结果", "value": 115 }
  ]
}
```

### `funnel_chart`

![funnel_chart](../assets/zh-CN/layout-funnel-chart.svg)

适用场景：

- 用户转化漏斗
- 运营分层沉淀
- 从触达到留存的阶段收束页

关键字段：

- `title`
- `stages[].title`
- `stages[].value`
- `stages[].text`
- `stages[].bullets`

示例：

```json
{
  "layout_type": "funnel_chart",
  "title": "项目复盘：成果与经验沉淀",
  "stages": [
    {
      "title": "用户触达与吸引",
      "value": "12.8 万",
      "text": "聚焦曝光增长与首轮转化。",
      "bullets": ["曝光显著提升", "新增用户数扩大"]
    },
    {
      "title": "用户转化与留存",
      "value": "3.4 万",
      "text": "围绕转化率和留存率做优化。",
      "bullets": ["转化率有效提高", "用户留存率稳定"]
    },
    {
      "title": "用户深度运营与口碑传播",
      "value": "8,600",
      "text": "沉淀复购和口碑扩散。",
      "bullets": ["复购率显著提升", "口碑传播效果增强"]
    }
  ]
}
```

### `heatmap`

![heatmap](../assets/zh-CN/layout-heatmap.svg)

适用场景：

- 强弱分布对比
- 多维矩阵热度分析
- 时间、区域、类别交叉观察

关键字段：

- `title`
- `data` 或 `series`
- `x_labels`
- `y_labels`

示例：

```json
{
  "layout_type": "heatmap",
  "title": "模块热度矩阵",
  "x_labels": ["周一", "周二", "周三"],
  "y_labels": ["模块 A", "模块 B", "模块 C"],
  "data": [
    [2, 3, 5],
    [1, 4, 5],
    [3, 4, 2]
  ]
}
```

### `treemap`

![treemap](../assets/zh-CN/layout-treemap.svg)

适用场景：

- 分层占比展示
- 模块规模对比
- 用面积表达权重和构成

关键字段：

- `title`
- `data` 或 `root`

示例：

```json
{
  "layout_type": "treemap",
  "title": "模块工作量构成",
  "data": [
    { "label": "viewer", "value": 38 },
    { "label": "skill", "value": 27 },
    { "label": "docs", "value": 21 },
    { "label": "assets", "value": 14 }
  ]
}
```

### `sankey`

![sankey](../assets/zh-CN/layout-sankey.svg)

适用场景：

- 流向关系说明
- 从输入到输出的量化流转
- 资源、用户、数据流分析

关键字段：

- `title`
- `nodes`
- `links`

示例：

```json
{
  "layout_type": "sankey",
  "title": "需求到产物的流转",
  "nodes": [
    { "id": "req", "label": "需求" },
    { "id": "outline", "label": "outline" },
    { "id": "detail", "label": "detail" },
    { "id": "viewer", "label": "viewer" }
  ],
  "links": [
    { "source": "req", "target": "outline", "value": 10 },
    { "source": "outline", "target": "detail", "value": 8 },
    { "source": "detail", "target": "viewer", "value": 8 }
  ]
}
```

### `gauge`

![gauge](../assets/zh-CN/layout-gauge.svg)

适用场景：

- 综合评分
- 达成率或健康度
- 单一核心指标的仪表盘展示

关键字段：

- `title`
- `value`
- `min`
- `max`

示例：

```json
{
  "layout_type": "gauge",
  "title": "当前质量评分",
  "value": 78,
  "min": 0,
  "max": 100
}
```

### `radar_chart`

![radar_chart](../assets/zh-CN/layout-radar-chart.svg)

适用场景：

- 多维能力对比
- 多指标评估
- 同一对象的维度画像

关键字段：

- `title`
- `categories`
- `values` 或 `series`
- `max`

示例：

```json
{
  "layout_type": "radar_chart",
  "title": "能力画像",
  "categories": ["质量", "速度", "稳定性", "表达力", "复用性"],
  "values": [82, 76, 88, 79, 84],
  "max": 100
}
```

### `impact_effort`

![impact_effort](../assets/zh-CN/layout-impact-effort.svg)

适用场景：

- 优先级排序
- 价值投入判断
- 筛选先做什么和后做什么

关键字段：

- `title`
- `items`

示例：

```json
{
  "layout_type": "impact_effort",
  "title": "任务优先级分布",
  "items": [
    { "name": "补文档", "impact": 9, "effort": 3, "size": 20 },
    { "name": "重做组件", "impact": 8, "effort": 8, "size": 28 }
  ]
}
```

### `gantt_chart`

![gantt_chart](../assets/zh-CN/layout-gantt-chart.svg)

适用场景：

- 项目排期
- 任务时间安排
- 跨阶段的甘特图计划页

关键字段：

- `title`
- `tasks`

示例：

```json
{
  "layout_type": "gantt_chart",
  "title": "实施排期",
  "tasks": [
    { "name": "补 layouts", "start": "2026-06-17", "end": "2026-06-18", "owner": "Agent" },
    { "name": "校验文档", "start": "2026-06-18", "end": "2026-06-19", "owner": "Agent" }
  ]
}
```

### `mind_map`

![mind_map](../assets/zh-CN/layout-mind-map.svg)

适用场景：

- 思路发散
- 概念整理
- 从中心主题向外展开的说明页

关键字段：

- `title`
- `root`

示例：

```json
{
  "layout_type": "mind_map",
  "title": "Skill 扩展脑图",
  "root": {
    "text": "Fork",
    "children": [
      { "text": "风格" },
      { "text": "layout" },
      { "text": "类型" },
      { "text": "质检" }
    ]
  }
}
```

### `top_bottom`

![top_bottom](../assets/zh-CN/layout-top-bottom.svg)

适用场景：

- 上下分区说明
- 上结论下解释
- 总览和细节分层呈现

关键字段：

- `title`
- `top`
- `bottom`

示例：

```json
{
  "layout_type": "top_bottom",
  "title": "上结论下解释",
  "top": { "title": "结论", "text": "先做 outline 再做 detail 才能稳定控制结构。" },
  "bottom": { "blocks": [{ "title": "原因", "text": "先锁定章节，再锁定页面表达。" }] }
}
```

### `nine_grid`

![nine_grid](../assets/zh-CN/layout-nine-grid.svg)

适用场景：

- 九宫格能力说明
- 多模块一页总览
- 固定数量的卡片式拆解

关键字段：

- `title`
- `items[].title`
- `items[].icon`
- `items[].text`
- `items[].bullets`

示例：

```json
{
  "layout_type": "nine_grid",
  "title": "流程系统建设：系统边界与协同",
  "items": [
    { "title": "ERP 企业资源计划", "icon": "chart", "bullets": ["财务", "采购", "销售", "库存"] },
    { "title": "PLM 产品生命周期", "icon": "document", "bullets": ["BOM", "工艺", "变更管理"] },
    { "title": "MES 制造执行", "icon": "flow", "bullets": ["排产", "报工", "追溯"] },
    { "title": "WMS 仓储管理", "icon": "check", "bullets": ["入库", "出库", "盘点"] },
    { "title": "SCM 供应链管理", "icon": "portal", "bullets": ["计划协同", "采购协同", "供应商协同"] },
    { "title": "QMS 质量管理", "icon": "qa", "bullets": ["检验", "SPC", "不合格品"] },
    { "title": "CMMS 设备维护", "icon": "refactor", "bullets": ["点检", "保养", "维修"] },
    { "title": "SCADA / EMS", "icon": "dashboard", "bullets": ["实时监控", "数采", "能效"] },
    { "title": "TMS 物流管理", "icon": "scale", "bullets": ["运输计划", "配送跟踪", "签收回传"] }
  ]
}
```

### `journey_map`

![journey_map](../assets/zh-CN/layout-journey-map.svg)

适用场景：

- 用户旅程
- 使用路径分析
- 不同阶段的触点、痛点和机会梳理

关键字段：

- `title`
- `stages`

示例：

```json
{
  "layout_type": "journey_map",
  "title": "用户使用旅程",
  "stages": [
    { "name": "接触", "touchpoints": ["README"], "painpoints": ["不清楚入口"], "opportunities": ["增加 getting-started"] },
    { "name": "使用", "touchpoints": ["outline/detail"], "painpoints": ["layout 难选"], "opportunities": ["补 layouts 文档"] }
  ]
}
```

### `plan_table`

![plan_table](../assets/zh-CN/layout-plan-table.svg)

适用场景：

- 实施计划
- 分工与时间安排
- 标准计划表页面

关键字段：

- `title`
- `table`

示例：

```json
{
  "layout_type": "plan_table",
  "title": "执行计划",
  "table": {
    "headers": ["阶段", "动作", "负责人", "时间"],
    "rows": [["文档", "补说明", "Agent", "Day 1"], ["验证", "预览检查", "Agent", "Day 2"]]
  }
}
```

### `cost_benefit`

![cost_benefit](../assets/zh-CN/layout-cost-benefit.svg)

适用场景：

- 成本收益对照
- 投入产出分析
- 决策前权衡说明

关键字段：

- `title`
- `table`

示例：

```json
{
  "layout_type": "cost_benefit",
  "title": "成本收益分析",
  "table": {
    "headers": ["类型", "内容"],
    "rows": [["成本", "增加规则维护工作"], ["收益", "交付质量更稳定"]]
  }
}
```

### `raci`

![raci](../assets/zh-CN/layout-raci.svg)

适用场景：

- 责任分配矩阵
- 跨角色协作说明
- 明确 R / A / C / I 的治理页

关键字段：

- `title`
- `table`

示例：

```json
{
  "layout_type": "raci",
  "title": "RACI 分工",
  "table": {
    "headers": ["任务", "产品", "研发", "设计", "运营"],
    "rows": [["定义结构", "A", "R", "C", "I"], ["调整视觉", "C", "R", "A", "I"]]
  }
}
```

### `target_map`

适用场景：

- 年度目标路径
- 从当前基础到目标状态的推进图
- 路线打靶图 / 目标拆解图

关键字段：

- `title`
- `start_label`
- `milestones`
- `goal`

示例：

```json
{
  "layout_type": "target_map",
  "title": "2026 年能力跃迁路径",
  "start_label": "2026",
  "milestones": [
    {
      "label": "M1",
      "title": "技能精进",
      "text": "补齐方法、知识与工具链底座。"
    },
    {
      "label": "M2",
      "title": "管理优化",
      "bullets": ["流程收敛", "时间管理", "资源协同"]
    },
    {
      "label": "M3",
      "title": "团队协作",
      "text": "建立反馈与复盘闭环。"
    },
    {
      "label": "M4",
      "title": "业务成果",
      "bullets": ["产能提升", "绩效改善", "方案沉淀"]
    }
  ],
  "goal": {
    "title": "晋升路径",
    "subtitle": "从执行者走向能稳定打胜仗的负责人",
    "text": "把阶段能力沉淀为可复用的方法与项目成果。"
  }
}
```

### `sector_explainer`

![sector_explainer](../assets/zh-CN/layout-sector-explainer.svg)

适用场景：

- 左侧扇区总览 + 右侧逐条展开
- 模块说明页
- 能力拆解 / 工作亮点 / 方法论分块解释

关键字段：

- `title`
- `center_title`
- `sectors[].title`
- `sectors[].text`
- `sectors[].bullets`

示例：

```json
{
  "layout_type": "sector_explainer",
  "title": "方法论拆解",
  "center_title": "核心议题",
  "sectors": [
    { "title": "用户洞察", "text": "先把用户分层、场景差异和关键反馈看清。" },
    { "title": "方案设计", "text": "把问题拆成阶段动作、责任人和评价口径。" },
    { "title": "执行落地", "text": "围绕时间表、资源配置和协作链路推进实施。" },
    { "title": "结果复盘", "text": "把结果、经验和问题回收进同一个闭环。" }
  ]
}
```

### `upward_arrows`

![upward_arrows](../assets/zh-CN/layout-upward-arrows.svg)

适用场景：

- 能力逐级提升
- 四阶段成熟度提升
- 从基础到拔高的路径说明

关键字段：

- `title`
- `items`

示例：

```json
{
  "layout_type": "upward_arrows",
  "title": "能力提升路径",
  "items": [
    { "title": "基础规范", "text": "统一口径、流程与职责边界。" },
    { "title": "机制成型", "text": "形成标准动作与协同机制。" },
    { "title": "复制推广", "text": "把成熟做法复制到更多场景。" },
    { "title": "持续领先", "text": "建立优化闭环与长期竞争力。" }
  ]
}
```

### `kanban_board`

适用场景：

- 周会执行看板
- 任务推进状态页
- 项目管理 / 运营排期同步

关键字段：

- `title`
- `columns[].title`
- `columns[].cards[].owner`
- `columns[].cards[].task`
- `columns[].cards[].progress`
- `columns[].cards[].due`

示例：

```json
{
  "layout_type": "kanban_board",
  "title": "项目推进看板",
  "columns": [
    {
      "title": "To Do",
      "icon": "todo",
      "cards": [
        { "owner": "产品：陈莉", "task": "确认下周版本功能边界", "due": "07-30" }
      ]
    },
    {
      "title": "In Progress",
      "icon": "doing",
      "cards": [
        { "owner": "研发：李雷", "task": "接入导出链路与预览校验", "progress": "75%" }
      ]
    },
    {
      "title": "Review",
      "icon": "review",
      "cards": [
        { "owner": "设计：陈心茹", "task": "回看目录页与封面的一致性", "note": "补最终修订意见" }
      ]
    },
    {
      "title": "Done",
      "icon": "done",
      "cards": [
        { "owner": "运营：赵志", "task": "完成项目复盘材料整理", "due": "07-28" }
      ]
    }
  ]
}
```

### `month_calendar`

![month_calendar](../assets/zh-CN/layout-month-calendar.svg)

适用场景：

- 月度项目排期
- 运营节奏表
- 会议与里程碑日历

关键字段：

- `title`
- `month`
- `weekdays`
- `days[].day`
- `days[].events`
- `legend`

示例：

```json
{
  "layout_type": "month_calendar",
  "title": "8 月工作月历",
  "month": "2026 / 08",
  "subtitle": "展示月度会议、投产节点、评审安排与复盘节奏",
  "weekdays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "legend": [
    { "label": "关键会议", "tone": "blue" },
    { "label": "里程碑", "tone": "amber" },
    { "label": "已完成", "tone": "green" },
    { "label": "风险提醒", "tone": "red" }
  ],
  "days": [
    { "day": 28, "muted": true },
    { "day": 29, "muted": true },
    { "day": 30, "muted": true },
    { "day": 31, "muted": true },
    { "day": 1 },
    { "day": 2 },
    { "day": 3, "events": [{ "label": "经营周会", "tone": "blue" }] },
    { "day": 10, "events": [{ "label": "里程碑评审", "tone": "amber" }, { "label": "资料归档", "tone": "green" }] },
    { "day": 12, "today": true, "events": [{ "label": "客户沟通会", "tone": "blue" }] },
    { "day": 18, "events": [{ "label": "投产窗口", "tone": "red" }] },
    { "day": 24, "events": [{ "label": "复盘会议", "tone": "green" }] }
  ]
}
```

### `case_study`

![case_study](../assets/zh-CN/layout-case-study.svg)

适用场景：

- 案例拆解
- 实践经验复盘
- 背景、做法、成效、启示的固定结构页

关键字段：

- `title`
- `blocks`

示例：

```json
{
  "layout_type": "case_study",
  "title": "真实项目案例",
  "blocks": [
    { "title": "背景", "text": "需要把 skill 工程化成网页 PPT 系统。" },
    { "title": "做法", "text": "补 layout、补 SVG、补文档。" },
    { "title": "成效", "text": "生成结果更稳定，文档更完整。" },
    { "title": "启示", "text": "先统一规则，再扩展类型。" }
  ]
}
```

### `evidence_gallery`

![evidence_gallery](../assets/zh-CN/layout-evidence-gallery.svg)

适用场景：

- 证据墙
- 多截图或多素材展示
- 补充案例凭证和界面片段

关键字段：

- `title`
- `bullets`

示例：

```json
{
  "layout_type": "evidence_gallery",
  "title": "证据墙",
  "bullets": ["viewer 截图", "SVG 资产预览", "layout 文档示例", "真实 deck 页面片段"]
}
```

## 选型原则

- 页面意图先于 layout 选择
- 对比页不要误用步骤图
- 阶段页不要退回普通表格
- 工作流页优先保留时序和泳道语义
- 三层结构图优先 `svg_full`，且内容不要写成 bullets
- 数据对比优先 `bar_chart`，趋势优先 `line_chart/area_chart`
- 构成占比优先 `pie_chart/donut_chart`，多维评分优先 `radar_chart`
- 项目计划优先 `gantt_chart`，只想交付清单优先 `plan_table`
- 坐标定位优先 `coordinate_axis/scatter_plot/bubble_chart`，四象限解释优先 `quadrant_axes/impact_effort/matrix_2x2`
