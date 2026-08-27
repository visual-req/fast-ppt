<h3 align="center">fast_ppt</h3>
<p align="center">Outline → Detail → Preview：資料を Web PPT に変換するエンジニアリング Skill システム</p>
<p align="center">
  <a href="README.md">中文</a> · <a href="README.en-US.md">English</a> · <a href="README.ja-JP.md">日本語</a>
  <br/>
  <a href="docs/ja-JP/getting-started.md">はじめに</a> · <a href="docs/ja-JP/manual.md">マニュアル</a> · <a href="docs/ja-JP/examples.md">事例</a> · <a href="docs/ja-JP/concept.md">設計理念</a>
</p>
<hr />

License: MIT ([LICENSE](LICENSE))

## 概要

静的な PPT を一度に吐き出すのではなく：**outline.json → 構造確認 → deck.json + slides/*.json → ブラウザプレビュー**。

## 機能

- フロントエンドで直接読み取り可能な PPT JSON の生成
- 教材型 / 提案型 / 報告型 / デモ型 の 4 タイプ対応
- 3 言語対応（zh-CN / ja-JP / en-US）
- 50 以上の構造化レイアウト
- 図表現優先：SVG（構造図）+ ECharts（データチャート）
- ワンクリック PPTX エクスポート
- フォークして独自体系に拡張可能

## クイックスタート

まず Skill をインストールします：

```bash
npx skills add visual-req/fast-ppt@proposal-generator -g -y
```

または AI ツールに `GitHub リポジトリ https://github.com/visual-req/fast-ppt の proposal-generator skill をインストールして` と伝えてください。

インストール後に使うコマンド：

- `/fppt:outline`
- `/fppt:detail`
- `/fppt:viewer`

このリポジトリを fork してローカルでコードを変更する場合は、[インストール](docs/ja-JP/installation.md) の「ローカル開発」セクションを参照してください。

## ワークフロー

![outline-detail-flow](docs/assets/ja-JP/outline-detail-flow.svg)

1. 入力準備 → `work/input/001_プロジェクト/`
2. `/fppt:outline` → `outline.json` 生成
3. 構造確認（章 / ページ順 / 図比率 / レイアウト）
4. `/fppt:detail` → `deck.json` + `slides/*.json` + SVG アセット生成
5. `node server.mjs` → `http://localhost:9030/` でプレビュー

## コマンド

| コマンド | 目的 | 成果物 |
|----------|------|--------|
| `/fppt:outline` | アウトライン生成 | `outline.json` |
| `/fppt:detail` | 詳細ページ + SVG 生成 | `deck.json` + `slides/*.json` + `work/assets/*.svg` |

## プロジェクト構成

![project-structure](docs/assets/ja-JP/project-structure.svg)

## ドキュメント

入門：
- [はじめに](docs/ja-JP/getting-started.md)
- [インストール](docs/ja-JP/installation.md)
- [マニュアル](docs/ja-JP/manual.md)
- [事例](docs/ja-JP/examples.md)

理解：
- [設計理念](docs/ja-JP/concept.md)
- [ワークフロー](docs/ja-JP/workflow.md)
- [構造](docs/ja-JP/structure.md)

詳細：
- [レイアウト](docs/ja-JP/layouts.md)
- [使い方](docs/ja-JP/usage.md)
- [トラブルシューティング](docs/ja-JP/troubleshooting.md)

カスタマイズ：
- [フォークガイド](docs/ja-JP/fork.md)

全索引：[docs/index.md](docs/index.md)

## FAQ

- 対応言語は？
  PPT 生成：zh-CN / ja-JP / en-US。ドキュメントと README はそれぞれ 3 言語の独立ファイルで提供しています。
- 出力先は？
  `work/ppt/001_プロジェクト/`（outline.json + deck.json + slides/）、アセットは `work/assets/`。
- プレビュー方法は？
  `node server.mjs` → `http://localhost:9030/` を開く。
