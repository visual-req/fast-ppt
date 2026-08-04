<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

type FunnelStage = {
  title?: string;
  value?: string | number;
  text?: string;
  bullets?: string[];
  note?: string;
};

const stages = computed<FunnelStage[]>(() => {
  const raw = props.slide?.stages;
  return Array.isArray(raw) ? raw.slice(0, 5) : [];
});

const stageWidths = computed(() => {
  const total = Math.max(stages.value.length, 1);
  return Array.from({ length: total }, (_, index) => {
    const start = 100 - (index * 46) / Math.max(total, 1);
    return Math.max(34, start);
  });
});

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toBullets(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item ?? "")).filter(Boolean).slice(0, 3) : [];
}

function stageValue(stage: FunnelStage) {
  if (typeof stage?.value === "number") return stage.value.toLocaleString("zh-CN");
  if (typeof stage?.value === "string") return stage.value;
  return "";
}
</script>

<template>
  <div class="funnelRoot">
    <div class="funnelGraphic">
      <div class="funnelGlow"></div>
      <div
        v-for="(stage, index) in stages"
        :key="index"
        class="funnelLayer"
        :style="{ width: `${stageWidths[index]}%`, zIndex: String(10 - index) }"
      >
        <div class="funnelCap"></div>
        <div class="funnelBody">
          <div class="funnelLayerTitle">{{ toText(stage?.title) || `阶段 ${index + 1}` }}</div>
          <div v-if="stageValue(stage)" class="funnelLayerValue">{{ stageValue(stage) }}</div>
        </div>
      </div>
      <div class="funnelStem"></div>
    </div>

    <div class="funnelDetails">
      <div v-for="(stage, index) in stages" :key="`detail-${index}`" class="funnelDetailCard">
        <div class="funnelDetailIndex">{{ String(index + 1).padStart(2, "0") }}</div>
        <div class="funnelDetailBody">
          <div class="funnelDetailHeader">
            <div class="funnelDetailTitle">{{ toText(stage?.title) || `阶段 ${index + 1}` }}</div>
            <div v-if="stageValue(stage)" class="funnelDetailValue">{{ stageValue(stage) }}</div>
          </div>
          <div v-if="toText(stage?.text)" class="funnelDetailText">{{ stage.text }}</div>
          <ul v-if="toBullets(stage?.bullets).length" class="funnelDetailBullets">
            <li v-for="(bullet, bulletIndex) in toBullets(stage?.bullets)" :key="bulletIndex">{{ bullet }}</li>
          </ul>
          <div v-if="toText(stage?.note)" class="funnelDetailNote">{{ stage.note }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.funnelRoot {
  display: grid;
  grid-template-columns: minmax(320px, 0.92fr) minmax(0, 1.08fr);
  gap: 26px;
  height: 100%;
  min-height: 0;
}

.funnelGraphic {
  position: relative;
  display: grid;
  justify-items: center;
  align-content: start;
  min-height: 0;
  padding-top: 8px;
}

.funnelGlow {
  position: absolute;
  top: 12px;
  left: 50%;
  width: 78%;
  height: 74%;
  transform: translateX(-50%);
  border-radius: 999px;
  background: radial-gradient(circle, var(--fppt-secondary-soft, rgba(77, 160, 255, 0.24)) 0%, transparent 68%);
  pointer-events: none;
}

.funnelLayer {
  position: relative;
  min-height: 88px;
  margin-bottom: 14px;
  filter: drop-shadow(0 16px 24px rgba(20, 61, 122, 0.10));
}

.funnelCap {
  height: 22px;
  border-radius: 999px / 70%;
  background: linear-gradient(90deg, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 92%, white) 0%, var(--fppt-secondary, #4da0ff) 100%);
}

.funnelBody {
  margin-top: -7px;
  padding: 28px 24px 22px;
  text-align: center;
  color: var(--fppt-text, #143d7a);
  background: linear-gradient(180deg, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 24%, white) 0%, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 10%, white) 100%);
  clip-path: polygon(7% 0, 93% 0, 83% 100%, 17% 100%);
}

.funnelLayerTitle {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
}

.funnelLayerValue {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--fppt-primary, #1d6fe8);
}

.funnelStem {
  width: 18%;
  min-width: 74px;
  height: 86px;
  margin-top: -2px;
  border-radius: 0 0 24px 24px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 92%, white) 0%, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 72%, black) 100%);
  box-shadow: 0 18px 30px rgba(20, 61, 122, 0.12);
}

.funnelDetails {
  display: grid;
  gap: 12px;
  min-height: 0;
  align-content: start;
}

.funnelDetailCard {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr);
  gap: 14px;
  padding: 16px 18px;
  border-radius: 24px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--fppt-surface, #ffffff) 98%, transparent) 0%, color-mix(in srgb, var(--fppt-surface-alt, #f7faff) 98%, transparent) 100%);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 92%, transparent);
  box-shadow: 0 16px 36px rgba(20, 61, 122, 0.08);
}

.funnelDetailIndex {
  display: grid;
  place-items: center;
  height: 52px;
  border-radius: 18px;
  background: linear-gradient(180deg, var(--fppt-primary, #1d6fe8) 0%, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 80%, #0f172a) 100%);
  color: white;
  font-size: 15px;
  font-weight: 800;
}

.funnelDetailBody {
  min-width: 0;
  display: grid;
  gap: 8px;
}

.funnelDetailHeader {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.funnelDetailTitle {
  font-size: 16px;
  font-weight: 800;
  color: var(--fppt-text, #143d7a);
}

.funnelDetailValue {
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--fppt-primary-soft, rgba(29, 111, 232, 0.12));
  color: var(--fppt-primary, #1d6fe8);
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.funnelDetailText,
.funnelDetailNote {
  font-size: 13px;
  line-height: 1.55;
  color: var(--fppt-muted, #64748b);
}

.funnelDetailBullets {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--fppt-text, #0f172a);
}

@media (max-width: 820px) {
  .funnelRoot {
    grid-template-columns: 1fr;
  }

  .funnelGraphic {
    padding-bottom: 8px;
  }
}
</style>
