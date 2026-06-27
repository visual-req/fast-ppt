# インストール

## 環境要件

- Node.js 18 以上
- npm
- Trae IDE（Skill は `skills/SKILL.md` により自動登録され、手動操作不要）
- macOS / Linux / Windows すべて対応

## Trae Skill 登録

本プロジェクトの Skill は `skills/SKILL.md` で定義されています。Trae IDE が自動的に検出・読み込みします。手動登録は不要です。

Skill ファイル構造：
- `skills/SKILL.md` — Skill エントリポイント（name, description, commands）
- `skills/prompts/ppt/` — 各タイプの PPT 生成プロンプト

## 依存関係のインストール

プロジェクトには 2 つの依存ツリーがあります：

```bash
# 1. ルート依存（pptxgenjs など）
npm install

# 2. ppt-viewer フロントエンド依存（Vue + Vite）
npm --prefix ppt-viewer install
```

ルートの `npm install` が pptxgenjs バージョンでエラーになる場合は以下を実行：
`npm install pptxgenjs@latest`

## フロントエンドのビルド

```bash
npm --prefix ppt-viewer run build
```

出力先は `ppt-viewer/dist/` で、`server.mjs` が静的ファイルとして配信します。

## プレビューサーバーの起動

デフォルトポート `9030`：

```bash
node server.mjs
```

アクセス：`http://localhost:9030/`

特定プロジェクトの表示：`http://localhost:9030/?project=3`（例：003_visual_spec）

## 推奨セットアップ手順

```bash
npm install                          # ルート依存
npm --prefix ppt-viewer install      # フロントエンド依存
npm --prefix ppt-viewer run build    # フロントエンドビルド
node server.mjs                      # サーバー起動
```

または簡易コマンド：

```bash
npm run dev   # = ビルド + 起動
npm start     # 直接起動（ビルド済みが前提）
```
