# マニュアル

このマニュアルで扱うのは次の 2 点だけです。

- Web 版 PPT の操作方法
- PPTX ファイルのエクスポート方法

インストール、依存関係、ローカル起動方法は [インストール](installation.md) または [はじめに](getting-started.md) を参照してください。

## 利用前提

操作を始める前に、以下を確認してください。

- ローカルのプレビューサービスが起動済みである
- ブラウザで `http://localhost:9030/` を開いている
- 対象プロジェクトに `deck.json + slides/*.json` がある

`outline.json` しかない場合は構造プレビューはできますが、PPTX エクスポートは失敗します。

## Web 版 PPT を開く

基本 URL：

```text
http://localhost:9030/
```

特定プロジェクトを開く場合は `project` パラメータを付けます。

```text
http://localhost:9030/?project=001
http://localhost:9030/?project=001_プロジェクト名
```

補足：

- `project=001` は `work/ppt/001_*` を自動で探します
- `project=001_プロジェクト名` はそのディレクトリを直接開きます
- 右上のステータス欄に現在のプロジェクト名が表示されます

## ツールバー操作

日常的な操作はほぼ上部ツールバーで行います。

### 1. 再読み込み

- `再読み込み` を押すと現在の `deck.json + slides/*.json` を読み直します
- JSON、SVG、スタイルを変更した直後に使います
- 反映されない場合はブラウザのハードリロードも行ってください

### 2. ページ移動

- `Home`：1 ページ目へ移動
- `前へ / 次へ`：1 ページずつ移動
- ページ番号入力 + `移動`：指定ページへジャンプ

キーボードショートカット：

- `ArrowLeft` / `PageUp`：前ページ
- `ArrowRight` / `PageDown` / `Space`：次ページ
- `Home`：先頭ページ
- `End`：最終ページ

### 3. アウトライン

- `アウトライン` を押すと章ドロワーが開きます
- 章は `section_divider` をもとに自動構成されます
- 章またはページをクリックするとその位置へジャンプします
- `Esc` またはマスククリックで閉じられます

向いている用途：

- 章順の確認
- 問題ページへの素早い移動
- 章区切りが正しく認識されているかの確認

### 4. テーマ切り替え

ツールバーのプルダウンで viewer のテーマを切り替えられます。

内蔵プリセット：

- `consulting`
- `demo`
- `executive`
- `training`
- `aurora`
- `graphite`

補足：

- 選択したテーマはプレビューとエクスポートの両方に反映されます
- 選択結果は URL の `style` パラメータに同期されます
- `deck.deck.style` に初期値があっても、UI で別テーマを選ぶと UI 側が優先されます

例：

```text
http://localhost:9030/?project=001&style=executive
```

## viewer で確認すべきこと

「見た目が良いか」だけではなく、次も確認してください。

- タイトル、ページ順、章構成が正しいか
- `layout_type` がページ意図に合っているか
- SVG、画像、アイコンが実際に表示されているか
- 画面外にはみ出す要素がないか
- 表っぽさや箇条書き感が強すぎないか
- テーマ切替後も色や強調表現が破綻していないか

表示がおかしいときは、まず次を確認します。

- `ppt-viewer/src/layoutRegistry.ts`
- `ppt-viewer/src/components/layouts/*.vue`
- 対象プロジェクトの `deck.json`
- 対象ページの `slides/*.json`

## PPTX エクスポート

### エクスポート方法

- 上部ツールバーの `PPTX エクスポート` をクリックします
- 現在のプロジェクトと現在のテーマでエクスポートされます

実際のエンドポイントは以下です。

```text
/api/export/pptx
```

URL に project / style が入っている場合は自動的に引き継がれます。

```text
http://localhost:9030/?project=001&style=executive
```

この場合、`001` プロジェクトを `executive` テーマでエクスポートします。

### 出力ファイル名

- style 指定なし：`deck.pptx`
- style 指定あり：`deck-スタイル名.pptx`

例：

- `deck.pptx`
- `deck-executive.pptx`

### エクスポート前の確認

少なくとも次は確認してから出力してください。

- 対象プロジェクトが正しい
- 選択テーマが意図通り
- 章順とページ順が正しい
- 画像、SVG、チャートが viewer で正常表示されている
- はみ出しや切れがない

### エクスポート失敗時の確認先

よくある原因：

- 現在のプロジェクトに `deck.json` がない
- `slides/*.json` が不足している、または JSON が壊れている
- 画像 / SVG の参照先が存在しない
- viewer は対応しているが export 側が未対応の layout がある

優先的に確認するファイル：

- `lib/pptxExport.mjs`
- `ppt-viewer/src/lib/*`
- `work/ppt/対象プロジェクト/deck.json`
- `work/ppt/対象プロジェクト/slides/*.json`

## よく使う操作パス

### パス 1：問題ページを 1 枚確認する

1. 対象プロジェクトを開く
2. ページ番号またはアウトラインで対象ページへ移動
3. タイトル、layout、SVG、はみ出しを確認
4. 修正後に `再読み込み`
5. 問題がなければ PPTX をエクスポート

### パス 2：同じ内容を複数テーマで見比べる

1. 同じプロジェクトを開く
2. プルダウンでテーマを切り替える
3. 表紙、章ページ、図表ページ、まとめページを確認
4. 最終テーマを決めて PPTX をエクスポート

### パス 3：章構造を確認する

1. `アウトライン` を開く
2. 章ページが正しく認識されているかを見る
3. 各章を順にクリックして遷移先を確認
4. 構造が崩れていれば `section_divider` を先に確認する

## 関連ファイル

- `server.mjs`：ローカルプレビューサーバーと PPTX export API
- `ppt-viewer/src/App.vue`：ツールバー、ページ移動、アウトライン、テーマ切替、export ボタン
- `ppt-viewer/src/layoutRegistry.ts`：`layout_type` とコンポーネントの対応
- `ppt-viewer/src/components/layouts/`：各ページレイアウトコンポーネント
- `lib/pptxExport.mjs`：PPTX export の主処理
