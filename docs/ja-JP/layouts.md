# レイアウト

全レイアウトタイプの SVG プレビューと JSON 例は[中国語版](../zh-CN/layouts.md)を参照してください。

`ppt-viewer` で利用可能なレイアウト一覧：

## 基本・ナビゲーション
- `cover`・`agenda`・`section_divider`・`summary`・`thank_you`・`appendix`

## テキスト・構造
- `title_bullets`・`two_column`・`three_column`・`quote`・`problem_statement`・`before_after`

## グラフィック
- `kpi_cards`・`swot`・`matrix_2x2`・`pyramid`・`logic_tree`・`icicle_tree`・`architecture_layered`・`dependency_graph`・`process_flow`・`timeline`・`roadmap`・`milestones`・`org_roles`・`risk_register`

## データチャート
- `pie_chart`・`donut_chart`・`bar_chart`・`line_chart`・`area_chart`・`waterfall_chart`・`funnel_chart`・`heatmap`・`treemap`・`sankey`・`gauge`・`radar_chart`・`impact_effort`・`gantt_chart`

## 専門特化
- `mind_map`・`top_bottom`・`nine_grid`・`journey_map`・`plan_table`・`cost_benefit`・`raci`・`case_study`・`evidence_gallery`・`phases`・`swimlane_process`・`metro_loop`・`svg_full`・`comparison_table`・`steps`・`four_grid`・`matrix_2x2`・`quadrant_axes`・`coordinate_axis`・`scatter_plot`・`bubble_chart`

## 最近追加された使い方
- `title_bullets` は `subtitle` と `cards` を使ったエグゼクティブサマリー表現にも対応
- `steps` は `icon + text + bullets` を持つ線形ステップ表現に対応
- `phases` は 5 段階前後の概要向けに `narrow: true` を利用可能
- `swimlane_process` は列ごとの段階名を `headers` で指定可能
- `architecture_layered` は `icon + text + bullets` を持つ分層構造ページに対応
- `nine_grid` は `icon + text + bullets` を持つシステム全景 / 境界整理ページに対応
- `process_flow` は構造化された `steps + footer_cards + summary` を持てるようになり、入力→処理→出力や成果カード付きのフロー表現に対応
- `roadmap` は `items.period`、下部 `actions`、締めの `goal` 要約に対応
- `metro_loop` は中央カード + 環状ステップ + 下部指標の表現に対応
- 新規または実験的なレイアウトは、最初から viewer component 化しなくてもよく、`svg_full` と `work/assets/*.svg` で先に落とし込める

## 選択原則
- ページ意図がレイアウト選択より先
- 比較ページにステップ図を使わない
- フェーズページを単純な表に戻さない
- ワークフローページはシーケンスとスイムレーンの意味を保持
- 3 層図は `svg_full` を使用、bullets で書かない
- データ比較 → `bar_chart`、トレンド → `line_chart`/`area_chart`
- 構成比 → `pie_chart`/`donut_chart`、多指標 → `radar_chart`
- プロジェクト計画 → `gantt_chart`、成果物リスト → `plan_table`
