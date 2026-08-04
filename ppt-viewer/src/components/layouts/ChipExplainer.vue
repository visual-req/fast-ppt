<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type ChipItem = {
  title?: string;
  text?: string;
  tag?: string;
  bullets?: string[];
};

type ChipPreset = {
  cardX: number;
  cardY: number;
  dotX: number;
  dotY: number;
  align: "left" | "right" | "center";
};

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toText(item)).filter(Boolean).slice(0, 2);
}

function asItem(item: unknown, index: number): ChipItem {
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

const presetMap: ChipPreset[] = [
  { cardX: 50, cardY: 14, dotX: 50, dotY: 32, align: "center" },
  { cardX: 83, cardY: 50, dotX: 67, dotY: 50, align: "left" },
  { cardX: 50, cardY: 86, dotX: 50, dotY: 68, align: "center" },
  { cardX: 17, cardY: 50, dotX: 33, dotY: 50, align: "right" }
];

const chip = computed(() => {
  const raw =
    props.slide?.chip && typeof props.slide.chip === "object" && !Array.isArray(props.slide.chip)
      ? props.slide.chip
      : props.slide?.center && typeof props.slide.center === "object" && !Array.isArray(props.slide.center)
        ? props.slide.center
        : {};
  return {
    tag: toText(raw.tag) || "CHIP",
    title: toText(raw.title) || "智能芯片",
    text: toText(raw.text) || "作为统一算力与规则中枢，向四个方向分发能力、接口与协同机制。"
  };
});

const items = computed<ChipItem[]>(() => {
  const raw = Array.isArray(props.slide?.items)
    ? props.slide.items
    : Array.isArray(props.slide?.points)
      ? props.slide.points
      : Array.isArray(props.slide?.blocks)
        ? props.slide.blocks
        : [];
  return raw.slice(0, 4).map((item: unknown, index: number) => asItem(item, index));
});

const layoutItems = computed(() => {
  const source = items.value;
  return source.map((item, index) => ({
    ...item,
    preset: presetMap[index] ?? presetMap[presetMap.length - 1]
  }));
});

function itemText(item: ChipItem): string {
  return toText(item.text) || toStrings(item.bullets).join(" / ");
}

function cardStyle(preset: ChipPreset) {
  const transform =
    preset.align === "left"
      ? "translate(0, -50%)"
      : preset.align === "right"
        ? "translate(-100%, -50%)"
        : "translate(-50%, -50%)";
  return {
    left: `${preset.cardX}%`,
    top: `${preset.cardY}%`,
    transform
  };
}

function connectorPath(preset: ChipPreset): string {
  const cx = 50;
  const cy = 50;
  const mx = preset.align === "center" ? 50 : (cx + preset.dotX) / 2;
  const my = preset.align === "center" ? (cy + preset.dotY) / 2 : 50;
  return `M ${cx} ${cy} Q ${mx} ${my} ${preset.dotX} ${preset.dotY}`;
}
</script>

<template>
  <Card v-if="!layoutItems.length" title="无数据" />
  <div v-else class="chipRoot">
    <svg class="chipConnectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="chipStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#93c5fd" />
          <stop offset="100%" stop-color="#2563eb" />
        </linearGradient>
      </defs>
      <path
        v-for="(item, index) in layoutItems"
        :key="`line-${index}`"
        :d="connectorPath(item.preset)"
        class="chipConnectorPath"
      />
      <circle
        v-for="(item, index) in layoutItems"
        :key="`dot-${index}`"
        :cx="item.preset.dotX"
        :cy="item.preset.dotY"
        r="1.7"
        class="chipConnectorDot"
      />
    </svg>

    <div class="chipHalo"></div>

    <div class="chipCenter">
      <div class="chipPins chipPinsTop">
        <span v-for="index in 8" :key="`top-${index}`"></span>
      </div>
      <div class="chipPins chipPinsRight">
        <span v-for="index in 8" :key="`right-${index}`"></span>
      </div>
      <div class="chipPins chipPinsBottom">
        <span v-for="index in 8" :key="`bottom-${index}`"></span>
      </div>
      <div class="chipPins chipPinsLeft">
        <span v-for="index in 8" :key="`left-${index}`"></span>
      </div>

      <div class="chipFrame">
        <div class="chipGrid"></div>
        <div class="chipTag">{{ chip.tag }}</div>
        <div class="chipTitle">{{ chip.title }}</div>
        <div class="chipText">{{ chip.text }}</div>
      </div>
    </div>

    <div
      v-for="(item, index) in layoutItems"
      :key="index"
      class="chipCard"
      :class="`chipCard--${item.preset.align}`"
      :style="cardStyle(item.preset)"
    >
      <div v-if="toText(item.tag)" class="chipCardTag">{{ item.tag }}</div>
      <div class="chipCardTitle">{{ toText(item.title) || `模块 ${index + 1}` }}</div>
      <div v-if="itemText(item)" class="chipCardText">{{ itemText(item) }}</div>
    </div>
  </div>
</template>

<style scoped>
.chipRoot {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(29, 155, 240, 0.24), transparent 28%),
    radial-gradient(circle at left bottom, rgba(96, 165, 250, 0.18), transparent 30%),
    linear-gradient(180deg, #071423 0%, #0a1e3b 52%, #0d2748 100%);
  border: 1px solid rgba(148, 197, 255, 0.18);
  box-shadow: 0 24px 40px rgba(2, 8, 23, 0.38);
}

.chipConnectors {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.chipConnectorPath {
  fill: none;
  stroke: rgba(74, 222, 255, 0.92);
  stroke-width: 0.72;
  stroke-linecap: round;
  stroke-dasharray: 1.9 1.5;
  opacity: 0.88;
}

.chipConnectorDot {
  fill: #eef8ff;
  stroke: #3b82f6;
  stroke-width: 0.7;
  filter: drop-shadow(0 3px 5px rgba(20, 61, 122, 0.12));
}

.chipHalo {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 40%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 36px;
  background: radial-gradient(circle, rgba(29, 155, 240, 0.28) 0%, rgba(29, 155, 240, 0.08) 54%, transparent 74%);
}

.chipCenter {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 30%;
  aspect-ratio: 1;
  min-width: 230px;
  max-width: 330px;
  transform: translate(-50%, -50%);
}

.chipFrame {
  position: absolute;
  inset: 12%;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(14, 36, 67, 0.98) 0%, rgba(13, 39, 72, 0.98) 100%);
  border: 1px solid rgba(125, 211, 252, 0.3);
  box-shadow: 0 22px 36px rgba(2, 8, 23, 0.34);
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 8px;
  padding: 18px 20px;
  text-align: center;
  overflow: hidden;
}

.chipGrid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(125, 211, 252, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(125, 211, 252, 0.12) 1px, transparent 1px);
  background-size: 18px 18px;
}

.chipTag,
.chipTitle,
.chipText {
  position: relative;
  z-index: 1;
}

.chipTag {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(147, 197, 253, 0.16);
  color: #8fdcff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.chipTitle {
  color: #eef6ff;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.15;
}

.chipText {
  max-width: 210px;
  color: #bfd4ef;
  font-size: 14px;
  line-height: 1.45;
}

.chipPins {
  position: absolute;
  display: grid;
  gap: 8px;
}

.chipPins span {
  display: block;
  border-radius: 999px;
  background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
  box-shadow: 0 6px 10px rgba(2, 8, 23, 0.24);
}

.chipPinsTop,
.chipPinsBottom {
  left: 24%;
  right: 24%;
  grid-template-columns: repeat(8, 1fr);
}

.chipPinsTop {
  top: 2%;
}

.chipPinsBottom {
  bottom: 2%;
}

.chipPinsTop span,
.chipPinsBottom span {
  height: 9px;
}

.chipPinsRight,
.chipPinsLeft {
  top: 24%;
  bottom: 24%;
  grid-template-rows: repeat(8, 1fr);
}

.chipPinsRight {
  right: 2%;
}

.chipPinsLeft {
  left: 2%;
}

.chipPinsRight span,
.chipPinsLeft span {
  width: 9px;
}

.chipCard {
  position: absolute;
  width: 25%;
  min-width: 178px;
  max-width: 248px;
  min-height: 88px;
  padding: 16px 18px;
  border-radius: 22px;
  background: rgba(10, 30, 58, 0.9);
  border: 1px solid rgba(96, 165, 250, 0.28);
  box-shadow: 0 16px 28px rgba(2, 8, 23, 0.28);
  overflow: hidden;
}

.chipCard::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 7px;
  background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
}

.chipCard--center {
  text-align: center;
}

.chipCardTag {
  margin-left: 10px;
  color: #86c8ff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.chipCardTitle {
  margin-top: 8px;
  margin-left: 10px;
  color: #eef6ff;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.chipCard--center .chipCardTag,
.chipCard--center .chipCardTitle,
.chipCard--center .chipCardText {
  margin-left: 0;
}

.chipCardText {
  margin-top: 8px;
  margin-left: 10px;
  color: rgba(214, 228, 247, 0.84);
  font-size: 13px;
  line-height: 1.45;
}

@media (max-width: 1180px) {
  .chipTitle {
    font-size: 24px;
  }

  .chipText,
  .chipCardText {
    font-size: 12px;
  }

  .chipCard {
    min-width: 158px;
    padding: 14px 16px;
  }

  .chipCardTitle {
    font-size: 17px;
  }
}
</style>
