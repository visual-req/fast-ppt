# Workflow

![Outline Detail Workflow](../assets/ja-JP/outline-detail-flow.svg)

## なぜ一括生成にしないのか

`fast_ppt` の本質は、「モデルに 60 ページを一度に出させること」ではありません。確認と修正がしやすいように、作業を 2 つの層へ分けることです。

1. `outline`
2. `detail`

この分離が必要な理由は明確です。

- 構造の問題は構造層で直すべき
- ページの問題はページ層で直すべき
- 図版の問題は SVG や layout で直すべき

この分離がないと、deck 全体が何となくおかしいのに、どこを直すべきか見えなくなります。

## 標準ワークフロー

基本の流れは次の通りです。

1. 入力資料を準備する
2. `/fppt:outline` を実行する
3. `outline.json` を確認する
4. `/fppt:detail` を実行する
5. `deck.json + slides/*.json` を viewer で確認する
6. 構造・ページ・資産のどこを直すか切り分けて回改する

イメージとしては：

- `outline` が骨格を作る
- `detail` がページを作る
- viewer が成立確認をする

## フェーズ 1：Outline

### 入力

- ユーザー要件
- プロジェクト資料
- タイプ別プロンプト
- メインプロンプト

### 出力

- `outline.json`

### このフェーズで確定すべきこと

- PPT タイプ
- 章構成
- ページ順
- ページ意図
- 各ページの想定 `layout_type`

### ここでまだやり過ぎないこと

- 各ページの全文を先に書き切らない
- すべての図版を先に作ろうとしない
- 構造未確定のまま final deck 生成へ進まない

## フェーズ 2：Detail

### 入力

- 確定済み `outline.json`

### 出力

- `deck.json`
- `slides/*.json`
- `work/assets/*.svg`

### このフェーズの役割

- ページ構造をレンダリング可能な JSON に落とす
- 図版ページの実 SVG 資産を生成する
- フロントエンドで読める完成度までページを埋める

### このフェーズに持ち込むべきでないこと

- 章ロジックの再設計
- 構造ミスをページ単位で無理やり埋めること

各ページは直せても deck 全体がしっくり来ないなら、`outline` に戻るべきです。

## どの層へ戻るべきか

ここを混同すると作業が重くなります。

### ケース 1：章順が悪い

修正先：

- `outline.json`

`slides/*.json` だけで無理に順序を直さない方がよいです。

### ケース 2：ページの layout が合っていない

まず見る場所：

- `outline.json` のページ意図 / layout 選択

必要なら：

- `slides/*.json`

### ケース 3：内容は合っているが図として弱い

修正先：

- `slides/*.json`
- `work/assets/*.svg`
- 該当 viewer layout component

### ケース 4：viewer は良いが export がずれる

修正先：

- viewer layout
- `deckRenderer.ts`
- `pptxExport.mjs`

これは内容問題ではなく、描画整合性の問題です。

## QA ループ

QA では、ページの見た目だけでなく、ワークフロー自体が安定しているかも確認します。

### 1. Skill 自己 QA

確認ポイント：

- `outline -> detail` を守っているか
- タイプ確定前に detail へ進んでいないか
- ページ意図を先に見て layout を選んでいるか
- 図版ページが実 SVG / 構造化 layout になっているか
- 各ラウンドで pass / fail / revise が明確か

### 2. Outline QA

確認ポイント：

- タイプが正しいか
- 章の流れが成立しているか
- 図版ページ比率が妥当か
- ページ意図が明確か
- 重複ページや飛びページがないか

### 3. Detail QA

確認ポイント：

- フィールドが揃っているか
- `slide_files` と実ファイルが一致しているか
- 資産ファイルが存在するか
- 内容が deck 範囲を超えていないか
- 比較 / フェーズ / 泳道ページで適切な layout を使っているか
- `svg_full` が本当に図として成立しているか

## ページ表現ルール

- 比較ページ：`comparison_table` または対比カード
- フェーズページ：`phases` / `steps`
- 時系列ワークフロー：`swimlane_process`
- 3 層構造：`svg_full`
- 目標到達ページ：`target_map`
- 実行状態ページ：`kanban_board`
- 漏斗型収束ページ：`funnel_chart`
- `svg_full`：SVG 内でページタイトルを重複させない

## よくある誤った流れ

典型的な失敗パターンは：

1. outline を確認しない
2. すぐ detail を生成する
3. 多くのページがずれていることに後で気付く
4. 各ページにパッチを当て続ける
5. 全体としては整わない

より良い流れは：

1. まず `outline.json` を整える
2. そのあと detail を生成する
3. viewer で確認する
4. 構造層 / ページ層 / 資産層に分けて直す

## 続けて読むなら

- [Getting Started](getting-started.md)：最初の 1 周を通す
- [Structure](structure.md)：各ディレクトリの役割
- [Manual](manual.md)：日常運用の進め方
