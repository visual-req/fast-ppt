# フォークガイド

このシステムをカスタマイズする場合、以下のレイヤーから着手できます：

- ビジュアルスタイル
- レイアウトコンポーネント
- アウトライン構造
- PPT タイプ
- QA ルール

## 目標別クイックスタート

### ビジュアルスタイルの変更
編集対象：`ppt-viewer/src/style.css`・`ppt-viewer/src/components/layouts/*.vue`

### 新レイアウトの追加
1. `ppt-viewer/src/components/layouts/` に Vue コンポーネントを作成
2. `ppt-viewer/src/layoutRegistry.ts` に登録
3. `docs/layouts.md` と `skills/prompts/ppt/layouts.md` を更新
4. プロジェクトにサンプルスライドを追加

### 新 PPT タイプの追加
1. プロンプトファイル作成：`skills/prompts/ppt/05_新タイプ.md`
2. サンプル作成：`skills/prompts/ppt/examples/新タイプ/`
3. `skills/SKILL.md` を更新
4. 実入力で検証

### QA ルールの調整
編集対象：`skills/prompts/ppt/00_PPT生成.md`・`skills/prompts/ppt/layout_rules.md`

## 推奨フォーク順序

1. スタイル（最も早く目に見える成果）
2. よく使うレイアウト 1〜2 個追加
3. 好みのアウトライン構造を固定
4. 最後に新タイプ拡張（最も影響範囲が広い）

## 検証

フォーク後は実際の deck で検証：
1. `outline.json` 生成
2. `deck.json + slides/*.json` 生成
3. ブラウザでプレビュー
4. 発見事項をプロンプト・コンポーネント・ドキュメントに反映

詳細な手順とトラブルシューティングは[完全な中国語フォークガイド](../zh-CN/fork.md)を参照してください。
