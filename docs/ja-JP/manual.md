# マニュアル

## フロントエンドの起動

### 1. 依存関係のインストール

プロジェクトルートで実行：

```bash
npm install
npm --prefix ppt-viewer install
```

### 2. プレビューサーバーの起動

プロジェクトルートで実行：

```bash
node server.mjs
```

デフォルト：

```text
http://localhost:9030/
```

### 3. ブラウザで開く

次にアクセス：

```text
http://localhost:9030/
```

最新結果が表示されない場合は強制リフレッシュ：

- macOS: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

## フロントエンド操作

### ナビゲーション

- キーボードの左右矢印キーでページ切替
- UI コントロールでナビゲーション
- 「Home」をクリックで 1 ページ目にジャンプ
- ページ番号を入力して Enter で直接ジャンプ

### アウトライン表示

- 上部の「アウトライン」ボタンをクリック
- ドロワー内のツリーでセクションを選択
- クリックで該当ページにジャンプ

### PPTX エクスポート

- 上部ツールバーの「PPTX エクスポート」をクリック
- 現在の `deck.json + slides/*.json` から `deck.pptx` を生成・ダウンロード

### ページレビュー

確認ポイント：

- タイトルは正しいか
- レイアウトはページの意図に合っているか
- SVG は正しく表示されているか
- コンテンツが画面からはみ出していないか
- 表形式や箇条書きが多すぎないか

## フロントエンド関連ファイル

- `server.mjs`: ローカルプレビューサーバー & `/api/deck`
- `ppt-viewer/src/App.vue`: ページシェル & アウトラインドロワー
- `ppt-viewer/src/layoutRegistry.ts`: `layout_type` からコンポーネントへのマッピング
- `ppt-viewer/src/components/layouts/`: 各ページレイアウトコンポーネント
