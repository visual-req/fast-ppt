# 事例プロジェクト

本プロジェクトには 3 つの完全な PPT 事例が同梱されており、4 つの PPT タイプのうち 3 つをカバーしています。学習リファレンスや二次開発の出発点としてご利用ください。

## 概要

| プロジェクト | タイプ | ページ数 | テーマ |
|--------------|--------|----------|--------|
| 001_skill_and_harness | 教材型 | 59 | Skill & Harness エンジニアリング研修 |
| 002_manufacturing_digital | 提案型 | 44 | 製造業 DX と AI 導入 |
| 003_visual_spec | デモ型 | 34 | Visual-Spec 製品デモンストレーション |

---

## 001_skill_and_harness（教材型、59 ページ）

**テーマ**：プロンプトエンジニアリングからコンテキストエンジニアリング、Harness エンジニアリングへの進化を学ぶ研修コース。

**ディレクトリ**：
- `work/input/001_skill和harness/設計思路.md`
- `work/ppt/001_skill和harness/outline.json`
- `work/ppt/001_skill和harness/deck.json`
- `work/ppt/001_skill和harness/slides/001_cover.json` … `059_thank_you.json`
- `work/assets/001/`（37 SVG 素材）

**章構成**：
1. オープニング：コース目標とアジェンダ
2. 歴史：プロンプトエンジニアリング → コンテキストエンジニアリング → Harness エンジニアリング
3. Skill 詳細：構成、トリガー方式、演習
4. Harness 詳細：構成、evaluator 解説
5. 補足資料と演習

**使用レイアウト**：cover / agenda / section_divider / mind_map / logic_tree / svg_full / impact_effort / before_after / dependency_graph / two_column / comparison_table / pyramid / four_grid / steps / architecture_layered / icicle_tree / swimlane_process / thank_you

---

## 002_manufacturing_digital（提案型、44 ページ）

**テーマ**：グループ・工場経営層向けの製造業 DX と AI 導入提案。デジタル基盤、生産・研究開発・業務 AI、インフラ・組織ガバナンスまでを網羅。

**ディレクトリ**：
- `work/input/002_制造业数字化转型/工厂导入AI方案说明PPT大纲.md`
- `work/ppt/002_制造业数字化转型/outline.json`
- `work/ppt/002_制造业数字化转型/deck.json`
- `work/ppt/002_制造业数字化转型/slides/001_cover.json` … `044_thank_you.json`
- `work/assets/002/`（16 SVG 素材）

**章構成**：
1. デジタル基盤とアーキテクチャ概要
2. 生産 AI（品質検査、予知保全）
3. 研究開発 AI 加速（コード生成、テスト自動化）
4. 業務/オフィス AI 浸透
5. インフラと人材
6. 管理制度とガバナンス
7. ロードマップとアクションアイテム

**使用レイアウト**：cover / agenda / section_divider / phases / architecture_layered / radar_chart / case_study / steps / title_bullets / nine_grid / org_roles / plan_table / summary / thank_you / svg_full

---

## 003_visual_spec（デモ型、34 ページ）

**テーマ**：散在する要件ドキュメントを構造化・検証可能・インタラクティブな完全な仕様に変換する Visual-Spec 製品デモ。

**ディレクトリ**：
- `work/input/003_visual_spec/需求说明.md`
- `work/ppt/003_visual_spec/outline.json`
- `work/ppt/003_visual_spec/deck.json`
- `work/ppt/003_visual_spec/slides/001.json` … `034.json`
- `work/assets/003/`（22 SVG + 2 PNG）

**章構成**：
1. 課題提起（12 の要件課題、グリッド概要 → 個別詳細）
2. ソリューション原理（左右分割 + IP 登録）
3. ワークフロー全体像
4. コマンド詳細（new → detail → verify → qc → impl → append-test → plan → accept → upgrade）
5. 価値訴求（ビフォーアフター、対象ユーザー、代表シナリオ）
6. アクション誘導

**使用レイアウト**：cover / section_divider / nine_grid / four_grid / svg_full / two_column / before_after / journey_map / summary / thank_you

---

## プレビュー方法

サーバー起動後にプロジェクトへアクセス：

```bash
node server.mjs
# http://localhost:9030/?project=1   → 001_skill_and_harness
# http://localhost:9030/?project=2   → 002_manufacturing_digital
# http://localhost:9030/?project=3   → 003_visual_spec
```

## 再利用方法

1. プロジェクトディレクトリを新番号にコピー（例：`work/ppt/004_新プロジェクト/`）
2. `work/input/004_新プロジェクト/` に要件説明を配置
3. `/fppt:outline` でアウトライン生成 → 確認後 `/fppt:detail` を実行
4. ビルド＆プレビュー：`npm --prefix ppt-viewer run build && node server.mjs`

## 多言語対応

システムは中国語（zh-CN）、日本語（ja-JP）、英語（en-US）の 3 言語に対応しています。PPT 生成時、`deck.json` の `language` フィールドがユーザーの入力言語に自動適応され、すべてのタイトル・箇条書き・SVG テキストが選択言語に統一されます。

3 つの事例プロジェクトは中国語版です。他言語版が必要な場合、`/fppt:outline` フェーズで AI が入力言語に応じたコンテンツを自動生成します。
