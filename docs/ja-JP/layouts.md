# レイアウト

全レイアウトタイプの SVG プレビューと JSON 例は[中国語版](../zh-CN/layouts.md)を参照してください。

`ppt-viewer` で利用可能なレイアウト一覧：

## 基本・ナビゲーション
- `cover`・`agenda`・`section_divider`・`summary`・`thank_you`・`appendix`

## テキスト・構造
- `title_bullets`・`staff_list`・`two_column`・`symmetric_split`・`three_column`・`quote`・`problem_statement`・`before_after`・`triple_metrics`

## グラフィック
- `kpi_cards`・`swot`・`matrix_2x2`・`pyramid`・`logic_tree`・`icicle_tree`・`architecture_layered`・`dependency_graph`・`process_flow`・`timeline`・`roadmap`・`milestones`・`org_roles`・`risk_register`・`target_map`・`sector_explainer`・`double_loop`・`house`・`radial_explainer`・`brain_explainer`・`profile_intro`・`chip_explainer`・`petal_explainer`・`fan_explainer`・`screen_explainer`・`stage_chevrons`・`stage_staircase`・`stage_zigzag`・`development_route`・`cycle_explainer`・`upward_arrows`・`iceberg`・`fishbone`・`kanban_board`・`month_calendar`

## データチャート
- `pie_chart`・`donut_chart`・`bar_chart`・`line_chart`・`area_chart`・`waterfall_chart`・`funnel_chart`・`heatmap`・`treemap`・`sankey`・`gauge`・`radar_chart`・`impact_effort`・`gantt_chart`

## 専門特化
- `mind_map`・`top_bottom`・`nine_grid`・`journey_map`・`plan_table`・`cost_benefit`・`raci`・`case_study`・`evidence_gallery`・`phases`・`swimlane_process`・`swimlane_board`・`metro_loop`・`svg_full`・`comparison_table`・`steps`・`four_grid`・`matrix_2x2`・`quadrant_axes`・`coordinate_axis`・`scatter_plot`・`bubble_chart`

## 最近追加された使い方
- `title_bullets` は `subtitle` と `cards` を使ったエグゼクティブサマリー表現にも対応
- `steps` は `icon + text + bullets` を持つ線形ステップ表現に対応
- `phases` は 5 段階前後の概要向けに `narrow: true` を利用可能
- `swimlane_process` は列ごとの段階名を `headers` で指定可能
- `swimlane_board` は泳道ごとに責任領域を分け、各泳道内で横並びカードを展開する説明ページに対応
- `architecture_layered` は `icon + text + bullets` を持つ分層構造ページに対応
- `nine_grid` は `icon + text + bullets` を持つシステム全景 / 境界整理ページに対応
- `process_flow` は構造化された `steps + footer_cards + summary` を持てるようになり、入力→処理→出力や成果カード付きのフロー表現に対応
- `roadmap` は `items.period`、下部 `actions`、締めの `goal` 要約に対応
- `metro_loop` は中央カード + 環状ステップ + 下部指標の表現に対応
- `agenda` は左側の主円を露出・拡大し、背景に気泡装飾を入れたアジェンダページに対応
- `double_loop` は ∞ 形の双循環トラック上に左右ノード名を配置する構成に対応
- `house` は低く広い屋根、左右の外柱、より高い中央屋身、安定感のある底座を持つページに対応
- `radial_explainer` は中央の大円を中心に、45 度回転した 4 テーマ構成で説明を展開するページに対応
- `brain_explainer` は中央の大脳ビジュアルと周辺説明カードで知能中枢や洞察エンジンを表現するページに対応
- `profile_intro` は片側に人物写真、もう片側にタグ・要約・分区カードを配置する人物紹介ページに対応
- `chip_explainer` は濃色テック背景の中央チップと、より細かく密なピンから 4 つの説明カードへ展開する中枢能力ページに対応
- `petal_explainer` は中央の花蕊タイトルの周りに 4 枚の花びらを対称配置する説明ページに対応
- `fan_explainer` は中央の電風扇モチーフから 4 つの説明モジュールへ展開する説明ページに対応
- `screen_explainer` は中央の大きな画面と、その周囲に浮かぶ説明ウィンドウを持つ解説ページに対応
- `stage_chevrons` は上部の薄い chevron と、その下の大きな内容矩形で段階を表すページに対応
- `stage_staircase` は階段状に高くなる段階ページに対応
- `stage_zigzag` は上下交互に配置される段階チェーンに対応
- `development_route` は多峰の山並みを背景に、山の稜線に沿って上昇する発展ルート表現に対応
- `cycle_explainer` は円周上に均等配置した説明ノード、実線コネクタ、方向矢印を持つ閉环ページに対応
- `upward_arrows` は左から右へ段階的に高くなる 4 本の幅広い上向き矢印の中に説明を配置するページに対応
- `iceberg` は水面上下に折面と量感を持たせた、より自然な氷山シルエットの分層ページに対応
- `fishbone` は上下の枝を横方向いっぱいに広げた、均等配置の魚骨図ページに対応
- `funnel_chart` は段階値 + 右側の解説カードを組み合わせた漏斗表現に対応
- `comparison_table` は各列を等幅で並べ、縦線とテキスト配置を同期させた比較表ページに対応
- `target_map` は開始点から目標到達までのマイルストーン表現に対応
- `sector_explainer` は左側の半円扇区にラベルを縦方向へ均等配置し、右側に解説カードを並べる構成に対応
- `kanban_board` は To Do / In Progress / Review / Done のような実行看板に対応
- `month_calendar` は曜日ヘッダー付きの月間カレンダー、日別セル、イベントタグを持つ計画ページに対応
- `symmetric_split` は中央軸を挟んだ左右対称の説明ページに対応
- `triple_metrics` は中央に 3 つの大きな円で主要指標を見せるデータページに対応
- `staff_list` は両端を赤金の金箍棒装飾で仕上げた、比率分割バー表現のページに対応
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
