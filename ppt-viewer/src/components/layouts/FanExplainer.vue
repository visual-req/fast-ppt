<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type FanItem = {
  title?: string;
  text?: string;
  tag?: string;
  bullets?: string[];
};

type FanPreset = {
  cardX: number;
  cardY: number;
};

const presets: FanPreset[] = [
  { cardX: 8, cardY: 14 },
  { cardX: 70, cardY: 14 },
  { cardX: 8, cardY: 64 },
  { cardX: 70, cardY: 64 }
];

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toText(item)).filter(Boolean).slice(0, 2);
}

function asItem(item: unknown, index: number): FanItem {
  if (typeof item === "string") return { title: item };
  if (!item || typeof item !== "object" || Array.isArray(item)) return { title: `模块 ${index + 1}` };
  const record = item as Record<string, unknown>;
  return {
    title: toText(record.title) || toText(record.name) || `模块 ${index + 1}`,
    text: toText(record.text),
    tag: toText(record.tag),
    bullets: toStrings(record.bullets)
  };
}

const core = computed(() => {
  const rawCore =
    props.slide?.core && typeof props.slide.core === "object" && !Array.isArray(props.slide.core)
      ? props.slide.core
      : props.slide?.center && typeof props.slide.center === "object" && !Array.isArray(props.slide.center)
        ? props.slide.center
        : {};
  return {
    title: toText(rawCore.title) || toText(props.slide?.core_title) || toText(props.slide?.center_title) || "核心主题",
    tag: toText(rawCore.tag) || "FAN",
    text: toText(rawCore.text) || "以电风扇主体为中心，向四个方向展开关键解释模块。"
  };
});

const items = computed<FanItem[]>(() => {
  const raw = Array.isArray(props.slide?.items)
    ? props.slide.items
    : Array.isArray(props.slide?.points)
      ? props.slide.points
      : Array.isArray(props.slide?.blocks)
        ? props.slide.blocks
        : [];
  return Array.from({ length: 4 }, (_, index) => asItem(raw[index], index));
});

function itemText(item: FanItem): string {
  return toText(item.text) || toStrings(item.bullets).join(" / ");
}

function cardStyle(preset: FanPreset) {
  return {
    left: `${preset.cardX}%`,
    top: `${preset.cardY}%`
  };
}
</script>

<template>
  <Card v-if="!items.length" title="无数据" />
  <div v-else class="fanRoot">
    <div class="fanGlow fanGlowLeft"></div>
    <div class="fanGlow fanGlowRight"></div>

    <svg class="fanConnectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M50 42 C40 34 30 26 22 21" />
      <path d="M50 42 C60 34 70 26 78 21" />
      <path d="M50 53 C40 60 30 70 22 77" />
      <path d="M50 53 C60 60 70 70 78 77" />
    </svg>

    <div
      v-for="(item, index) in items"
      :key="index"
      class="fanCard"
      :style="cardStyle(presets[index] ?? presets[0])"
    >
      <div v-if="toText(item.tag)" class="fanCardTag">{{ item.tag }}</div>
      <div class="fanCardTitle">{{ toText(item.title) || `模块 ${index + 1}` }}</div>
      <div v-if="itemText(item)" class="fanCardText">{{ itemText(item) }}</div>
    </div>

    <div class="fanHeadHalo"></div>
    <div class="fanHead">
      <div class="fanCage fanCageOuter"></div>
      <div class="fanCage fanCageMid"></div>
      <div class="fanCage fanCageInner"></div>
      <div class="fanBlade fanBladeA"></div>
      <div class="fanBlade fanBladeB"></div>
      <div class="fanBlade fanBladeC"></div>
      <div class="fanBlade fanBladeD"></div>
      <div class="fanHub"></div>
      <div class="fanCoreBadge">{{ core.tag }}</div>
      <div class="fanCoreTitle">{{ core.title }}</div>
      <div class="fanCoreText">{{ core.text }}</div>
    </div>

    <div class="fanStand"></div>
    <div class="fanBase"></div>
  </div>
</template>

<style scoped>
.fanRoot {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.12), transparent 28%),
    radial-gradient(circle at left bottom, rgba(147, 197, 253, 0.12), transparent 26%),
    linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 20px 36px rgba(20, 61, 122, 0.08);
}

.fanGlow {
  position: absolute;
  width: 28%;
  aspect-ratio: 1;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(147, 197, 253, 0.24) 0%, rgba(147, 197, 253, 0.08) 56%, transparent 76%);
}

.fanGlowLeft {
  left: 7%;
  top: 20%;
}

.fanGlowRight {
  right: 7%;
  top: 20%;
}

.fanConnectors {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.fanConnectors path {
  fill: none;
  stroke: rgba(148, 163, 184, 0.44);
  stroke-width: 0.9;
  stroke-linecap: round;
}

.fanCard {
  position: absolute;
  width: 22%;
  min-width: 170px;
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 16px 28px rgba(20, 61, 122, 0.1);
}

.fanCardTag,
.fanCoreBadge {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(29, 111, 232, 0.08);
  color: #1d6fe8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.fanCardTitle,
.fanCoreTitle {
  margin-top: 8px;
  color: #143d7a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
}

.fanCardText,
.fanCoreText {
  margin-top: 6px;
  color: #475569;
  font-size: 13px;
  line-height: 1.55;
}

.fanHeadHalo {
  position: absolute;
  left: 50%;
  top: 42%;
  width: 34%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: radial-gradient(circle, rgba(147, 197, 253, 0.28) 0%, rgba(147, 197, 253, 0.08) 56%, transparent 76%);
}

.fanHead {
  position: absolute;
  left: 50%;
  top: 46%;
  width: min(34%, 320px);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.92) 0%, rgba(238, 244, 255, 0.98) 100%);
  border: 10px solid #cfe0f6;
  box-shadow: 0 24px 34px rgba(20, 61, 122, 0.12);
}

.fanCage {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.34);
}

.fanCageOuter { width: 84%; height: 84%; }
.fanCageMid { width: 62%; height: 62%; }
.fanCageInner { width: 40%; height: 40%; }

.fanBlade {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16%;
  height: 34%;
  transform-origin: center bottom;
  border-radius: 999px 999px 48% 48%;
  background: linear-gradient(180deg, rgba(29, 111, 232, 0.22) 0%, rgba(29, 111, 232, 0.58) 100%);
  opacity: 0.8;
}

.fanBladeA { transform: translate(-50%, -86%) rotate(0deg); }
.fanBladeB { transform: translate(-14%, -50%) rotate(90deg); }
.fanBladeC { transform: translate(-50%, -14%) rotate(180deg); }
.fanBladeD { transform: translate(-86%, -50%) rotate(270deg); }

.fanHub {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 20%;
  height: 20%;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: linear-gradient(180deg, #1d6fe8 0%, #143d7a 100%);
  box-shadow: 0 10px 18px rgba(20, 61, 122, 0.18);
}

.fanCoreBadge,
.fanCoreTitle,
.fanCoreText {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.fanCoreBadge { top: 15%; }
.fanCoreTitle { bottom: 22%; }

.fanCoreText {
  bottom: 12%;
  width: 72%;
}

.fanStand {
  position: absolute;
  left: 50%;
  bottom: 12%;
  width: 18px;
  height: 16%;
  transform: translateX(-50%);
  border-radius: 999px;
  background: linear-gradient(180deg, #1d6fe8 0%, #143d7a 100%);
  box-shadow: 0 12px 20px rgba(20, 61, 122, 0.16);
}

.fanBase {
  position: absolute;
  left: 50%;
  bottom: 6%;
  width: 22%;
  max-width: 220px;
  height: 28px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: linear-gradient(180deg, #dbeafe 0%, #bfd6f7 100%);
  border: 1px solid rgba(191, 219, 254, 0.96);
  box-shadow: 0 10px 20px rgba(20, 61, 122, 0.1);
}
</style>
