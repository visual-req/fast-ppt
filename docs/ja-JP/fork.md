# フォークガイド

## フォークとダウンロードの違い

よく見落とされがちですが、非常に重要な違いです。

**ダウンロード（git clone / Download ZIP）**：

- コードのコピーを取得し、ローカルで実行
- コードの変更は可能ですが、元プロジェクトとの関連はありません
- 元プロジェクトが更新された場合、手動で再ダウンロードまたはマージが必要
- 適しているケース：そのまま使いたい、変更しない、一時的な利用

**フォーク（GitHub Fork）**：

- GitHub アカウント上に、元リポジトリと関連付けられたコピーを作成
- 自由に変更を加えながら、元プロジェクトとの同期機能を維持
- 元プロジェクト更新時は `git pull upstream` でマージ可能
- 有用な変更を行った場合、Pull Request で元プロジェクトに還元可能
- 適しているケース：継続利用、継続的なカスタマイズ、長期メンテナンス

一言で：

> ダウンロード = コピーを取って使う。それで終わり。
> フォーク = コピーを取って自分のものに変え、元プロジェクトの更新にも追随できる。

**GitHub でのフォーク手順**：

1. 元プロジェクトページを開く（例：`https://github.com/visual-req/fast-ppt`）
2. 右上の **Fork** ボタンをクリック
3. 個人アカウントまたは組織にフォーク
4. フォークしたリポジトリをローカルに clone：`git clone https://github.com/あなたのアカウント/fast-ppt.git`
5. 元プロジェクトを upstream として追加：`git remote add upstream https://github.com/visual-req/fast-ppt.git`
6. 後日同期する場合：`git fetch upstream && git merge upstream/main`

**本ガイドにおける「フォーク」の意味**：

本ガイドの「フォーク」は GitHub の機能操作以上の意味を持ちます。**このシステムを独自のスタイルと生成体系にカスタマイズすること**を指します。フォーク後、以下が可能です：

- ビジュアルスタイルやレイアウトコンポーネントの変更
- PPT タイプの追加や調整
- アウトライン構造や QA ルールの変更
- 独自のプロンプト体系と examples の構築

コードを変更せずに PPT を生成したいだけの場合は、[getting-started.md](getting-started.md) と [installation.md](installation.md) を参照してください。

---

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
