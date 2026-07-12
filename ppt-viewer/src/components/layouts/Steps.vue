<script setup lang="ts">
import { computed } from "vue";
import { getLayoutIconSvg } from "../../lib/layoutIcons";

const props = defineProps<{ slide: any }>();

type StepItem = {
  title?: string;
  bullets?: string[];
  text?: string;
  icon?: string;
};

const steps = computed<StepItem[]>(() => (Array.isArray(props.slide?.steps) ? props.slide.steps : []));

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toBullets(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item ?? "")).filter(Boolean) : [];
}

const getIconSvg = getLayoutIconSvg;

</script>

<template>
  <div class="stepsLayout">
    <div class="stepsTrack">
      <div class="stepsRibbon"></div>
      <div class="stepsCurve"></div>
      <div v-for="(item, index) in steps" :key="'step-' + index" class="stepsTier" :style="{ '--step-index': index }">
        <div class="stepsTierLabel">
          <span class="stepsTierNum">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="stepsTierName">{{ item?.title || "步骤 " + (index + 1) }}</span>
        </div>
        <div class="stepsTierBody">
          <div v-if="getIconSvg(item?.icon)" class="stepsTierIcon" v-html="getIconSvg(item?.icon)"></div>
          <div class="stepsTierContent">
            <div v-if="toText(item?.text)" class="stepsTierText">{{ item.text }}</div>
            <ul v-if="toBullets(item?.bullets).length" class="stepsTierBullets">
              <li v-for="(bullet, bulletIndex) in toBullets(item?.bullets)" :key="bulletIndex">{{ bullet }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stepsLayout {
  height: 100%;
}

.stepsTrack {
  position: relative;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  align-items: end;
}

.stepsRibbon {
  position: absolute;
  left: 5%;
  right: 5%;
  top: 18%;
  height: 16px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--fppt-secondary, #4da0ff) 0%, var(--fppt-primary, #1d6fe8) 100%);
  opacity: 0.16;
}

.stepsCurve {
  position: absolute;
  left: 7%;
  right: 7%;
  top: 14%;
  bottom: 10%;
  border-left: 4px solid color-mix(in srgb, var(--fppt-primary, #1d6fe8) 10%, transparent);
  border-bottom: 4px solid color-mix(in srgb, var(--fppt-primary, #1d6fe8) 10%, transparent);
  border-radius: 0 0 36px 36px;
  pointer-events: none;
}

.stepsTier {
  position: relative;
  display: grid;
  align-content: start;
  gap: 10px;
  min-height: calc(280px + var(--step-index) * -24px + 48px);
  padding-top: calc(var(--step-index) * 24px);
}

.stepsTierLabel {
  position: relative;
  min-height: 74px;
  padding: 14px 20px 14px 18px;
  border-radius: 18px 18px 18px 8px;
  background: linear-gradient(90deg, var(--fppt-secondary, #4da0ff) 0%, var(--fppt-primary, #1d6fe8) 100%);
  color: #ffffff;
  box-shadow: 0 18px 34px rgba(29, 111, 232, 0.18);
}

.stepsTierLabel::after {
  content: "";
  position: absolute;
  right: -18px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 18px solid transparent;
  border-bottom: 18px solid transparent;
  border-left: 18px solid var(--fppt-primary, #1d6fe8);
}

.stepsTierNum {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 28px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 12px;
  font-weight: 800;
}

.stepsTierName {
  display: block;
  margin-top: 8px;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.35;
}

.stepsTierBody {
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 18px;
  border-radius: 0 22px 22px 22px;
  background: linear-gradient(180deg, var(--fppt-surface, #ffffff) 0%, var(--fppt-surface-alt, #f8fbff) 100%);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 96%, transparent);
  box-shadow: 0 18px 36px rgba(20, 61, 122, 0.08);
}

.stepsTierIcon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: color-mix(in srgb, var(--fppt-secondary, #4da0ff) 12%, white);
  color: var(--fppt-primary, #1d6fe8);
}

.stepsTierIcon :deep(svg) {
  width: 20px;
  height: 20px;
}

.stepsTierContent {
  display: grid;
  gap: 10px;
}

.stepsTierText {
  font-size: 14px;
  line-height: 1.6;
  color: var(--fppt-muted, #334155);
  font-weight: 600;
}

.stepsTierBullets {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.stepsTierBullets li {
  position: relative;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--fppt-muted, #4b5563);
}

.stepsTierBullets li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--fppt-secondary, #4da0ff) 0%, var(--fppt-primary, #1d6fe8) 100%);
}
@media (max-width: 960px) {
  .stepsTrack {
    grid-template-columns: 1fr;
  }

  .stepsRibbon,
  .stepsCurve,
  .stepsTierLabel::after {
    display: none;
  }

  .stepsTier {
    min-height: auto;
    padding-top: 0;
  }
}
</style>
