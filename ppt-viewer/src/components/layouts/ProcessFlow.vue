<script setup lang="ts">
import { computed } from "vue";
import { getLayoutIconSvg } from "../../lib/layoutIcons";

const props = defineProps<{ slide: any }>();

type FlowPanel = {
  title?: string;
  text?: string;
  note?: string;
  value?: string | number;
};

type FlowStep = {
  title?: string;
  subtitle?: string;
  text?: string;
  bullets?: string[];
  icon?: string;
  accent?: string;
  panels?: FlowPanel[];
};

const steps = computed<FlowStep[]>(() => {
  const raw = props.slide?.steps ?? props.slide?.stages;
  return Array.isArray(raw) ? raw.slice(0, 5) : [];
});

const footerCards = computed<FlowPanel[]>(() => {
  const raw = props.slide?.footer_cards ?? props.slide?.outputs ?? props.slide?.supports ?? props.slide?.metrics;
  return Array.isArray(raw) ? raw.slice(0, 6) : [];
});
const slide = computed(() => props.slide ?? {});

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toBullets(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item: unknown) => String(item ?? "")).filter(Boolean) : [];
}

function toPanels(value: unknown): FlowPanel[] {
  return Array.isArray(value) ? value.slice(0, 6) : [];
}

function stepAccent(step: FlowStep, index: number): string {
  if (typeof step?.accent === "string" && step.accent.trim()) return step.accent;
  const palette = ["#1d6fe8", "#0ea5e9", "#10b981", "#8b5cf6", "#ef4444"];
  return palette[index % palette.length];
}

function footerLabel(card: FlowPanel, index: number): string {
  return toText(card.title) || toText(card.text) || `模块 ${index + 1}`;
}

function footerMain(card: FlowPanel): string {
  if (typeof card.value === "string" || typeof card.value === "number") return String(card.value);
  if (toText(card.note)) return toText(card.note);
  return "";
}

const getIconSvg = getLayoutIconSvg;
</script>

<template>
  <div class="processFlowRoot">
    <div class="processFlowTrack">
      <template v-for="(step, index) in steps" :key="`${index}-${step.title}`">
        <div class="processFlowStep" :style="{ '--flow-accent': stepAccent(step, index) }">
          <div class="processFlowStepTag">{{ String(index + 1).padStart(2, "0") }}</div>
          <div class="processFlowStepCard">
            <div class="processFlowStepHeader">
              <div v-if="getIconSvg(step.icon)" class="processFlowStepIcon" v-html="getIconSvg(step.icon)"></div>
              <div class="processFlowStepTitleWrap">
                <div class="processFlowStepTitle">{{ toText(step.title) || `阶段 ${index + 1}` }}</div>
                <div v-if="toText(step.subtitle)" class="processFlowStepSubtitle">{{ step.subtitle }}</div>
              </div>
            </div>

            <div v-if="toText(step.text)" class="processFlowStepText">{{ step.text }}</div>

            <ul v-if="toBullets(step.bullets).length" class="processFlowBullets">
              <li v-for="(bullet, bulletIndex) in toBullets(step.bullets)" :key="bulletIndex">{{ bullet }}</li>
            </ul>

            <div v-if="toPanels(step.panels).length" class="processFlowPanels">
              <div v-for="(panel, panelIndex) in toPanels(step.panels)" :key="panelIndex" class="processFlowPanel">
                <div class="processFlowPanelTitle">{{ toText(panel.title) || `子项 ${panelIndex + 1}` }}</div>
                <div v-if="toText(panel.text)" class="processFlowPanelText">{{ panel.text }}</div>
                <div v-else-if="toText(panel.note)" class="processFlowPanelText">{{ panel.note }}</div>
                <div v-else-if="typeof panel.value === 'string' || typeof panel.value === 'number'" class="processFlowPanelText">
                  {{ panel.value }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="index < steps.length - 1" class="processFlowArrow" aria-hidden="true">
          <div class="processFlowArrowStem"></div>
          <div class="processFlowArrowHead"></div>
        </div>
      </template>
    </div>

    <div v-if="footerCards.length" class="processFlowFooterGrid" :style="{ gridTemplateColumns: `repeat(${Math.min(footerCards.length, 4)}, minmax(0, 1fr))` }">
      <div v-for="(card, index) in footerCards" :key="`${index}-${footerLabel(card, index)}`" class="processFlowFooterCard">
        <div class="processFlowFooterLabel">{{ footerLabel(card, index) }}</div>
        <div v-if="footerMain(card)" class="processFlowFooterValue">{{ footerMain(card) }}</div>
        <div v-if="toText(card.note) && footerMain(card) !== toText(card.note)" class="processFlowFooterNote">{{ card.note }}</div>
        <div v-else-if="toText(card.text) && footerMain(card) !== toText(card.text)" class="processFlowFooterNote">{{ card.text }}</div>
      </div>
    </div>

    <div v-if="toText(slide.summary)" class="processFlowSummary">
      {{ slide.summary }}
    </div>
  </div>
</template>

<style scoped>
.processFlowRoot {
  height: 100%;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto auto;
  gap: 14px;
}

.processFlowTrack {
  display: flex;
  gap: 14px;
  align-items: stretch;
}

.processFlowStep {
  position: relative;
  min-width: 0;
  flex: 1 1 0;
}

.processFlowStepTag {
  width: 44px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--flow-accent) 92%, white 8%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 12px 24px rgba(20, 61, 122, 0.10);
}

.processFlowStepCard {
  margin-top: 10px;
  display: grid;
  align-content: start;
  gap: 12px;
  min-height: 220px;
  padding: 18px;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 18px 34px rgba(20, 61, 122, 0.08);
  position: relative;
  overflow: hidden;
}

.processFlowStepCard::before {
  content: "";
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 6px;
  background: color-mix(in srgb, var(--flow-accent) 92%, white 8%);
}

.processFlowStepHeader {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.processFlowStepIcon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--flow-accent) 14%, white 86%);
  color: color-mix(in srgb, var(--flow-accent) 92%, #143d7a 8%);
  flex-shrink: 0;
}

.processFlowStepIcon :deep(svg) {
  width: 20px;
  height: 20px;
}

.processFlowStepTitleWrap {
  min-width: 0;
}

.processFlowStepTitle {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.4;
  color: #143d7a;
}

.processFlowStepSubtitle {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.45;
  color: #64748b;
}

.processFlowStepText {
  font-size: 13px;
  line-height: 1.6;
  color: #475569;
  font-weight: 600;
}

.processFlowBullets {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
}

.processFlowBullets li {
  position: relative;
  padding-left: 16px;
  font-size: 12px;
  line-height: 1.5;
  color: #475569;
}

.processFlowBullets li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 7px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--flow-accent) 92%, white 8%);
}

.processFlowPanels {
  display: grid;
  gap: 8px;
}

.processFlowPanel {
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(244, 248, 255, 0.92);
  border: 1px solid rgba(215, 227, 244, 0.96);
}

.processFlowPanelTitle {
  font-size: 12px;
  font-weight: 800;
  line-height: 1.4;
  color: #143d7a;
}

.processFlowPanelText {
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.45;
  color: #64748b;
}

.processFlowArrow {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.processFlowArrowStem {
  width: 44px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(143, 186, 244, 0.38) 0%, rgba(77, 160, 255, 0.78) 100%);
}

.processFlowArrowHead {
  width: 0;
  height: 0;
  margin-left: 8px;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 12px solid #4da0ff;
}

.processFlowFooterGrid {
  display: grid;
  gap: 12px;
}

.processFlowFooterCard {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 12px 26px rgba(20, 61, 122, 0.08);
}

.processFlowFooterLabel {
  font-size: 12px;
  font-weight: 800;
  color: #475569;
}

.processFlowFooterValue {
  margin-top: 6px;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.25;
  color: #143d7a;
}

.processFlowFooterNote {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.45;
  color: #64748b;
}

.processFlowSummary {
  padding: 12px 16px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.05);
  color: #334155;
  font-size: 12px;
  line-height: 1.55;
  text-align: center;
}

@media (max-width: 1100px) {
  .processFlowTrack,
  .processFlowFooterGrid {
    grid-template-columns: 1fr !important;
  }

  .processFlowTrack {
    flex-direction: column;
  }

  .processFlowArrow {
    min-height: auto;
    justify-content: flex-start;
    padding-left: 18px;
  }

  .processFlowArrowStem {
    width: 4px;
    height: 28px;
    background: linear-gradient(180deg, rgba(143, 186, 244, 0.38) 0%, rgba(77, 160, 255, 0.78) 100%);
  }

  .processFlowArrowHead {
    margin-left: 0;
    margin-top: 8px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 12px solid #4da0ff;
    border-bottom: 0;
  }
}
</style>
