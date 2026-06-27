# Troubleshooting

## 页面不正确时怎么改

### 症状 1: layout 不对

例如：

- 对比页却显示成步骤图
- 工作流页却像表格
- 三层结构页仍然是 bullets

修改方式：

1. 打开对应页面的 `slides/*.json`
2. 检查 `layout_type`
3. 按页面意图改成正确 layout

常见对应关系：

- 对比页: `comparison_table`
- 阶段页: `phases`
- 工作流页: `swimlane_process`
- 结构图/关系图/三层图: `svg_full`

### 症状 2: 标题不对或标题没显示

修改方式：

1. 检查页面 JSON 里的 `title`
2. 如果是 `svg_full` 页面，检查是否设置了 `show_title: true`
3. 不要把页面标题写进 SVG 内再重复显示

### 症状 3: SVG 图不对

例如：

- 图还是英文
- 图没有更新
- 图太小或位置不对

修改方式：

1. 打开 `work/assets/*.svg`
2. 直接修改 SVG 文字、结构或尺寸
3. 确认页面 JSON 的 `svg.src` 指向的是正确文件
4. 浏览器强刷缓存

### 症状 4: 内容超出屏幕

修改方式：

1. 优先减少 bullets 密度
2. 如果本质上是结构图，改成 `svg_full`
3. 如果是阶段链路，改成 `phases`
4. 如果是流程，改成 `swimlane_process`

## 内容不正确时怎么改

### 症状 1: 页面表达不够准确

修改方式：

1. 找到对应 `slides/*.json`
2. 直接修改字段内容
3. 如果问题具有普遍性，再回写到：

- `skills/prompts/ppt/00_PPT生成.md`
- `skills/prompts/ppt/layout_rules.md`

### 症状 2: 图太少或仍然偏文字

修改方式：

1. 判断页面是否本来就应该图形化
2. 如果应该图形化，新增或替换成 `work/assets/*.svg`
3. 把页面改成 `svg_full`

### 症状 3: 前端已经改了，但浏览器看不到变化

修改方式：

1. 确认服务是否在 `9030` 端口启动
2. 打开 `http://localhost:9030/api/deck` 检查接口返回
3. 浏览器强刷缓存
4. 如有必要，重启 `node server.mjs`

## 推荐排查顺序

1. 先看页面 JSON 是否正确
2. 再看引用的 SVG 是否正确
3. 再看前端 layout 组件是否符合预期
4. 最后再回写提示词，避免同类问题重复生成
