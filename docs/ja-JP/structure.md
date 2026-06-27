# 構造

![Project Structure](../assets/ja-JP/project-structure.svg)

## プロジェクトレイアウト

```
fast_ppt/
  README.md
  LICENSE
  docs/
  skills/
    SKILL.md
    prompts/
      ppt/
  ppt-viewer/
  work/
    input/
    ppt/
    assets/
  server.mjs
```

## ディレクトリの役割

### `docs/`
プロジェクトドキュメント。中国語・日本語・英語で提供。

### `skills/`
Skill エントリ定義とプロンプト。`SKILL.md`：Skill メタ情報と実行制約。`prompts/ppt/`：タイプ別 PPT 生成プロンプト。

### `ppt-viewer/`
Web PPT フロントエンドレンダリングプロジェクト。`deck.json + slides/*.json` を読み取り、`layout_type` を Vue レイアウトコンポーネントにマッピング。

### `work/input/`
プロジェクト別の生入力資料（`001_プロジェクト名/`）。

### `work/ppt/`
プロジェクト別の生成物：`outline.json`・`deck.json`・`slides/*.json`。

### `work/assets/`
ページから参照される SVG グラフィックアセット。

### `server.mjs`
ローカルプレビューサーバー。deck データを集約してブラウザに提供。
