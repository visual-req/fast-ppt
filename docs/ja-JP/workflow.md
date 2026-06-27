# Workflow

![Outline Detail Workflow](../assets/ja-JP/outline-detail-flow.svg)

## 2 フェーズモデル

この Skill は 2 フェーズの生成プロセスを強制します：

1. `outline`
2. `detail`

これは実装の詳細ではなく、品質管理メカニズムです。

## フェーズ 1：Outline

**入力**：ユーザー要件・プロジェクト資料・タイププロンプト・メインプロンプト

**出力**：`outline.json`

**目標**：PPT タイプ・章構成・ページ順序・ページ意図・レイアウト選択の確定

## フェーズ 2：Detail

**入力**：確定済み `outline.json`

**出力**：`deck.json`・`slides/*.json`・`work/assets/*.svg`

**目標**：ページ構造をレンダリング可能な JSON に変換・図表ページの SVG アセット生成・フロントエンドプレビュー可能な状態への完成

## QA ループ

### Skill 自己 QA

2 フェーズプロセス遵守・タイプ確定後の生成開始・ページ意図の先判断・図表ページの SVG 実体化・各ラウンドの pass/fail/retry アクション出力

### アウトライン QA

正しいタイプ・完全な章チェーン・図表ページ計画・明確なページ意図

### 詳細ページ QA

完全なフィールド・一貫した slide_files・アセット実在確認・正しいレイアウト選択

## ページ表現ルール

- 比較ページ：`comparison_table` またはコントラストカード
- フェーズページ：`phases` / `steps`
- 時系列ワークフロー：`swimlane_process`
- 3 層構造：`svg_full`
- `svg_full`：SVG 内にページタイトルを重複させない
