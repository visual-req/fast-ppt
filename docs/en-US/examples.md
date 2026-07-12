# Example Projects

The project ships with three complete PPT example projects covering three of the four PPT types — use them as learning references and starting points.

## Overview

| Project | Type | Pages | Topic |
|---------|------|-------|-------|
| 001_skill_and_harness | Courseware | 59 | Skill & Harness Engineering Training |
| 002_manufacturing_digital | Proposal | 44 | Manufacturing Digital Transformation & AI |
| 003_visual_spec | Demo | 34 | Visual-Spec Product Showcase |

---

## 001_skill_and_harness (Courseware, 59 pages)

**Topic**: Training course on the evolution from prompt engineering to context engineering to harness engineering.

**Directory**:
- `work/input/001_skill和harness/设计思路.md`
- `work/ppt/001_skill和harness/outline.json`
- `work/ppt/001_skill和harness/deck.json`
- `work/ppt/001_skill和harness/slides/001_cover.json` … `059_thank_you.json`
- `work/assets/001/` (37 SVG assets)

**Chapter Structure**:
1. Opening: Course objectives & agenda
2. History: Prompt engineering → Context engineering → Harness engineering
3. Skill deep-dive: composition, triggers, exercises
4. Harness deep-dive: composition, evaluators
5. Supplementary materials & exercises

**Layouts Used**: cover / agenda / section_divider / mind_map / logic_tree / svg_full / impact_effort / before_after / dependency_graph / two_column / comparison_table / pyramid / four_grid / steps / architecture_layered / icicle_tree / swimlane_process / thank_you

---

## 002_manufacturing_digital (Proposal, 44 pages)

**Topic**: Manufacturing digital transformation & AI adoption proposal for group/factory management.

**Directory**:
- `work/input/002_制造业数字化转型/工厂导入AI方案说明PPT大纲.md`
- `work/ppt/002_制造业数字化转型/outline.json`
- `work/ppt/002_制造业数字化转型/deck.json`
- `work/ppt/002_制造业数字化转型/slides/001_cover.json` … `044_thank_you.json`
- `work/assets/002/` (16 SVG assets)

**Chapter Structure**:
1. Digital foundation & architecture overview
2. Production AI (quality inspection, predictive maintenance)
3. R&D AI acceleration (code gen, test automation)
4. Business/office AI adoption
5. Infrastructure & talent
6. Management & governance
7. Roadmap & action items

**Layouts Used**: cover / agenda / section_divider / phases / architecture_layered / radar_chart / case_study / steps / title_bullets / nine_grid / org_roles / plan_table / summary / thank_you / svg_full

---

## 003_visual_spec (Demo, 34 pages)

**Topic**: Visual-Spec product demo showing how scattered requirement docs become structured, verifiable, interactive specs.

**Directory**:
- `work/input/003_visual_spec/需求说明.md`
- `work/ppt/003_visual_spec/outline.json`
- `work/ppt/003_visual_spec/deck.json`
- `work/ppt/003_visual_spec/slides/001.json` … `034.json`
- `work/assets/003/` (22 SVGs + 2 PNGs)

**Chapter Structure**:
1. Pain points (12 requirement pain points, grid overview → individual detail)
2. Solution principles (two-column + IP registration)
3. Complete workflow overview
4. Command walkthrough (new → detail → verify → qc → impl → append-test → plan → accept → upgrade)
5. Value showcase (before/after, target users, typical scenarios)
6. Call to action

**Layouts Used**: cover / section_divider / nine_grid / four_grid / svg_full / two_column / before_after / journey_map / summary / thank_you

---

## How to Preview

Start the server and access projects:

```bash
node server.mjs
# http://localhost:9030/?project=1   → 001_skill_and_harness
# http://localhost:9030/?project=2   → 002_manufacturing_digital
# http://localhost:9030/?project=3   → 003_visual_spec
```

## How to Reuse

1. Copy a project directory to a new number, e.g. `work/ppt/004_new_project/`
2. Write your requirements in `work/input/004_new_project/`
3. Run `/fppt:outline` to generate the outline, confirm, then run `/fppt:detail`
4. Build & preview: `npm --prefix ppt-viewer run build && node server.mjs`

## Multilingual Support

The system supports Chinese (zh-CN), Japanese (ja-JP), and English (en-US). When generating a PPT, the `deck.json` `language` field auto-adapts to the user's input language. All titles, bullets, and SVG text are unified to the selected language.

The three example projects are in Chinese. For other language versions, the AI will generate content in the corresponding language during the `/fppt:outline` phase.
