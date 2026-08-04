<script setup lang="ts">
import { computed } from "vue";

const { slide } = defineProps<{ slide: any }>();

type Bone = { category?: string; causes?: string[] };
type BoneLayout = Bone & { nodeX: number; nodeY: number; boxX: number; boxY: number };

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toBones(value: unknown): Bone[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item: unknown) => {
      const record = item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
      return {
        category: toText(record.category) || toText(record.title) || toText(record.name),
        causes: Array.isArray(record.causes)
          ? record.causes.map((cause: unknown) => toText(cause)).filter(Boolean)
          : []
      };
    })
    .slice(0, 6);
}

const presetPositions = [
  { nodeX: 26.7, nodeY: 47, boxX: 11.7, boxY: 21.5 },
  { nodeX: 51.7, nodeY: 47, boxX: 36.7, boxY: 21.5 },
  { nodeX: 76.7, nodeY: 47, boxX: 61.7, boxY: 21.5 },
  { nodeX: 43.3, nodeY: 47, boxX: 28.3, boxY: 59.4 },
  { nodeX: 66.7, nodeY: 47, boxX: 51.7, boxY: 59.4 },
  { nodeX: 90, nodeY: 47, boxX: 75, boxY: 59.4 }
] as const;

const bones = computed<BoneLayout[]>(() => {
  const source = toBones(slide?.bones);
  const list = source.length
    ? source
    : [
        { category: "人", causes: ["技能不足", "沟通不畅"] },
        { category: "流程", causes: ["步骤缺失", "缺少门禁"] },
        { category: "工具", causes: ["链路不通", "缺少自动化"] },
        { category: "数据", causes: ["口径不一", "质量不稳"] },
        { category: "环境", causes: ["不可复现", "依赖漂移"] },
        { category: "指标", causes: ["目标不清", "缺少验证"] }
      ];

  return list.map((bone, index) => ({
    ...bone,
    ...presetPositions[index]
  }));
});

const effectText = computed(() => toText(slide?.effect ?? slide?.problem ?? slide?.result) || "要解释的问题");
</script>

<template>
  <div class="fishboneRoot">
    <svg class="fishboneSvg" viewBox="0 0 1200 560" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <marker id="arrowHead" markerWidth="14" markerHeight="14" refX="12" refY="7" orient="auto">
          <path d="M0,0 L14,7 L0,14 z" fill="#2563eb"/>
        </marker>
      </defs>

      <rect x="0" y="0" width="1200" height="560" rx="18" fill="rgba(241,245,249,0.7)"/>
      <line x1="240" y1="280" x2="1040" y2="280" stroke="rgba(37,99,235,0.65)" stroke-width="8" marker-end="url(#arrowHead)"/>

      <line x1="320" y1="280" x2="260" y2="140" stroke="rgba(15,23,42,0.35)" stroke-width="6"/>
      <line x1="620" y1="280" x2="560" y2="140" stroke="rgba(15,23,42,0.35)" stroke-width="6"/>
      <line x1="920" y1="280" x2="860" y2="140" stroke="rgba(15,23,42,0.35)" stroke-width="6"/>

      <line x1="520" y1="280" x2="460" y2="420" stroke="rgba(15,23,42,0.35)" stroke-width="6"/>
      <line x1="800" y1="280" x2="740" y2="420" stroke="rgba(15,23,42,0.35)" stroke-width="6"/>
      <line x1="1080" y1="280" x2="1020" y2="420" stroke="rgba(15,23,42,0.35)" stroke-width="6"/>
    </svg>

    <div class="fishboneIntro">
      <div class="fishboneIntroTitle">鱼骨图</div>
      <div class="fishboneIntroText">原因 → 结果</div>
    </div>

    <div class="fishboneResult">
      <div class="fishboneResultTitle">结果 / 影响</div>
      <div class="fishboneResultText">{{ effectText }}</div>
    </div>

    <div
      v-for="(bone, index) in bones"
      :key="index"
      class="fishboneCard"
      :class="{ fishboneCardTop: index < 3, fishboneCardBottom: index >= 3 }"
      :style="{ left: `${bone.boxX}%`, top: `${bone.boxY}%` }"
    >
      <div class="fishboneCardTitle">{{ bone.category || `原因 ${index + 1}` }}</div>
      <div class="fishboneCardText">{{ (bone.causes || []).slice(0, 2).join(' / ') }}</div>
    </div>
  </div>
</template>

<style scoped>
.fishboneRoot {
  position: relative;
  width: 100%;
  height: 100%;
}

.fishboneSvg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.fishboneIntro,
.fishboneResult,
.fishboneCard {
  position: absolute;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.1);
  box-shadow: 0 14px 28px rgba(20, 61, 122, 0.08);
}

.fishboneIntro {
  left: 7.5%;
  top: 43.5%;
  width: 12.5%;
  padding: 16px 12px;
  border-radius: 16px;
  text-align: center;
}

.fishboneIntroTitle,
.fishboneResultTitle,
.fishboneCardTitle {
  color: #0f172a;
  font-size: 14px;
  font-weight: 900;
  line-height: 1.3;
}

.fishboneIntroText,
.fishboneResultText,
.fishboneCardText {
  margin-top: 8px;
  color: rgba(15, 23, 42, 0.72);
  font-size: 12px;
  line-height: 1.45;
}

.fishboneResult {
  left: 82.5%;
  top: 41.5%;
  width: 15%;
  padding: 18px 12px;
  border-radius: 18px;
  text-align: center;
}

.fishboneCard {
  width: 20%;
  padding: 16px 12px;
  border-radius: 16px;
  text-align: center;
  transform: translateX(-50%);
}

.fishboneCardTop {
  transform: translate(-50%, -50%);
}

.fishboneCardBottom {
  transform: translate(-50%, 0);
}

.fishboneCardTitle {
  color: #2563eb;
}
</style>
