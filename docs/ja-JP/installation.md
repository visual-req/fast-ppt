# インストール

## 環境要件

- Skills CLI を使える AI ツール
- Node.js 18 以上（`npx skills` またはローカル開発用）
- npm
- macOS / Linux / Windows すべて対応

## Skill のインストール

推奨方法は Skills CLI でのインストールです：

```bash
npx skills add visual-req/fast-ppt@proposal-generator -g -y
```

または AI ツールに次のように伝えてください：

```text
fast-ppt の proposal-generator skill をインストールして
```

インストール後に使えるコマンド：

- `/fppt:outline`
- `/fppt:detail`
- `/fppt:viewer`

補足：
- `proposal-generator` はこのリポジトリ内の Skill 名です
- `visual-req/fast-ppt` は配布元のリポジトリです
- `-g` はグローバルインストール
- `-y` は確認を省略します

Skill ファイル構造：
- `skills/SKILL.md` — Skill エントリポイント（name, description, commands）
- `skills/prompts/ppt/` — 各タイプの PPT 生成プロンプト

## ローカル開発

このリポジトリを fork したりローカルでコード変更したりする場合だけ、以下の 2 つの依存ツリーを入れてください：

```bash
# 1. ルート依存（pptxgenjs など）
npm install

# 2. ppt-viewer フロントエンド依存（Vue + Vite）
npm --prefix ppt-viewer install
```

ルートの `npm install` が pptxgenjs バージョンでエラーになる場合は以下を実行：
`npm install pptxgenjs@latest`

## ローカルでフロントエンドをビルド

```bash
npm --prefix ppt-viewer run build
```

出力先は `ppt-viewer/dist/` で、`server.mjs` が静的ファイルとして配信します。

## ローカルでプレビューサーバーを起動

デフォルトポート `9030`：

```bash
node server.mjs
```

アクセス：`http://localhost:9030/`

特定プロジェクトの表示：`http://localhost:9030/?project=3`（例：003_visual_spec）

## 推奨ローカル開発手順

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
