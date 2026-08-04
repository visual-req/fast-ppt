<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type ExplainerItem = {
  title?: string;
  text?: string;
  tag?: string;
  bullets?: string[];
};

type RadialPreset = {
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
  return value
    .map((item) => toText(item))
    .filter(Boolean)
    .slice(0, 2);
}

function asItem(item: unknown, index: number): ExplainerItem {
  if (typeof item === "string") return { title: item };
  if (!item || typeof item !== "object" || Array.isArray(item)) return { title: `要点 ${index + 1}` };
  const record = item as Record<string, unknown>;
  return {
    title: toText(record.title) || toText(record.name) || `要点 ${index + 1}`,
    text: toText(record.text),
    tag: toText(record.tag),
    bullets: toStrings(record.bullets)
  };
}

const presetMap: Record<number, RadialPreset[]> = {
  3: [
    { cardX: 50, cardY: 14, dotX: 50, dotY: 29, align: "center" },
    { cardX: 80, cardY: 66, dotX: 68, dotY: 58, align: "left" },
    { cardX: 20, cardY: 66, dotX: 32, dotY: 58, align: "right" }
  ],
  4: [
    { cardX: 79, cardY: 22, dotX: 66, dotY: 34, align: "left" },
    { cardX: 79, cardY: 78, dotX: 66, dotY: 66, align: "left" },
    { cardX: 21, cardY: 78, dotX: 34, dotY: 66, align: "right" },
    { cardX: 21, cardY: 22, dotX: 34, dotY: 34, align: "right" }
  ],
  5: [
    { cardX: 50, cardY: 12, dotX: 50, dotY: 28, align: "center" },
    { cardX: 79, cardY: 31, dotX: 66, dotY: 37, align: "left" },
    { cardX: 79, cardY: 69, dotX: 66, dotY: 63, align: "left" },
    { cardX: 21, cardY: 69, dotX: 34, dotY: 63, align: "right" },
    { cardX: 21, cardY: 31, dotX: 34, dotY: 37, align: "right" }
  ],
  6: [
    { cardX: 28, cardY: 16, dotX: 38, dotY: 31, align: "right" },
    { cardX: 72, cardY: 16, dotX: 62, dotY: 31, align: "left" },
    { cardX: 84, cardY: 50, dotX: 69, dotY: 50, align: "left" },
    { cardX: 72, cardY: 84, dotX: 62, dotY: 69, align: "left" },
    { cardX: 28, cardY: 84, dotX: 38, dotY: 69, align: "right" },
    { cardX: 16, cardY: 50, dotX: 31, dotY: 50, align: "right" }
  ]
};

const center = computed(() => {
  const raw =
    props.slide?.center && typeof props.slide.center === "object" && !Array.isArray(props.slide.center)
      ? props.slide.center
      : {};
  return {
    tag: toText(raw.tag) || "CENTER",
    title: toText(raw.title) || toText(props.slide?.center_title) || "核心议题",
    text: toText(raw.text) || "围绕中心主题，向外展开关键模块、动作或解释。"
  };
});

const items = computed<ExplainerItem[]>(() => {
  const raw = Array.isArray(props.slide?.items)
    ? props.slide.items
    : Array.isArray(props.slide?.points)
      ? props.slide.points
      : Array.isArray(props.slide?.blocks)
        ? props.slide.blocks
        : Array.isArray(props.slide?.sectors)
          ? props.slide.sectors
          : [];
  return raw.slice(0, 6).map((item: unknown, index: number) => asItem(item, index));
});

const layoutItems = computed(() => {
  const source = items.value;
  const count = Math.min(Math.max(source.length, 0), 6);
  const presets = presetMap[count] ?? presetMap[4];
  return source.map((item, index) => ({
    ...item,
    preset: presets[index] ?? presets[presets.length - 1] ?? presetMap[4][0]
  }));
});

function itemText(item: ExplainerItem): string {
  return toText(item.text) || toStrings(item.bullets).join(" / ");
}

function cardStyle(preset: RadialPreset) {
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

function connectorPath(preset: RadialPreset): string {
  const cx = 50;
  const cy = 50;
  const mx = (cx + preset.dotX) / 2;
  const my = (cy + preset.dotY) / 2;
  return `M ${cx} ${cy} Q ${mx} ${my} ${preset.dotX} ${preset.dotY}`;
}
</script>

<template>
  <Card v-if="!layoutItems.length" title="无数据" />
  <div v-else class="radialRoot">
    <svg class="radialConnectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="radialStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#93c5fd" />
          <stop offset="100%" stop-color="#2563eb" />
        </linearGradient>
      </defs>
      <path
        v-for="(item, index) in layoutItems"
        :key="`line-${index}`"
        :d="connectorPath(item.preset)"
        class="radialConnectorPath"
      />
      <circle
        v-for="(item, index) in layoutItems"
        :key="`dot-${index}`"
        :cx="item.preset.dotX"
        :cy="item.preset.dotY"
        r="1.7"
        class="radialConnectorDot"
      />
    </svg>

    <div class="radialCenterHalo"></div>
    <div class="radialCenterOrbit"></div>

    <div class="radialCenter">
      <div class="radialCenterTag">{{ center.tag }}</div>
      <div class="radialCenterTitle">{{ center.title }}</div>
      <div class="radialCenterText">{{ center.text }}</div>
    </div>

    <div
      v-for="(item, index) in layoutItems"
      :key="index"
      class="radialCard"
      :class="`radialCard--${item.preset.align}`"
      :style="cardStyle(item.preset)"
    >
      <div v-if="toText(item.tag)" class="radialCardTag">{{ item.tag }}</div>
      <div class="radialCardTitle">{{ toText(item.title) || `要点 ${index + 1}` }}</div>
      <div v-if="itemText(item)" class="radialCardText">{{ itemText(item) }}</div>
    </div>
  </div>
</template>

<style scoped>
.radialRoot {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.14), transparent 30%),
    linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 20px 36px rgba(20, 61, 122, 0.08);
}

.radialConnectors {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.radialConnectorPath {
  fill: none;
  stroke: url(#radialStroke);
  stroke-width: 0.7;
  stroke-linecap: round;
  stroke-dasharray: 1.8 1.5;
  opacity: 0.85;
}

.radialConnectorDot {
  fill: #ffffff;
  stroke: #2563eb;
  stroke-width: 0.7;
  filter: drop-shadow(0 3px 5px rgba(20, 61, 122, 0.12));
}

.radialCenterHalo,
.radialCenterOrbit,
.radialCenter {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 999px;
}

.radialCenterHalo {
  width: 48%;
  aspect-ratio: 1;
  background: radial-gradient(circle, rgba(147, 197, 253, 0.22) 0%, rgba(147, 197, 253, 0.08) 52%, transparent 74%);
}

.radialCenterOrbit {
  width: 37%;
  aspect-ratio: 1;
  border: 2px dashed rgba(96, 165, 250, 0.5);
}

.radialCenter {
  width: 30%;
  aspect-ratio: 1;
  min-width: 220px;
  max-width: 320px;
  padding: 18px 22px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 255, 0.98) 100%);
  border: 1px solid rgba(191, 219, 254, 0.96);
  box-shadow: 0 20px 34px rgba(20, 61, 122, 0.12);
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 8px;
  text-align: center;
}

.radialCenterTag {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.radialCenterTitle {
  color: #143d7a;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.15;
}

.radialCenterText {
  max-width: 220px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.45;
}

.radialCard {
  position: absolute;
  width: 26%;
  min-width: 180px;
  max-width: 250px;
  min-height: 88px;
  padding: 16px 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 16px 28px rgba(20, 61, 122, 0.08);
  overflow: hidden;
}

.radialCard::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 7px;
  background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
}

.radialCard--center {
  text-align: center;
}

.radialCardTag {
  margin-left: 10px;
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.radialCardTitle {
  margin-top: 8px;
  margin-left: 10px;
  color: #143d7a;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.radialCard--center .radialCardTag,
.radialCard--center .radialCardTitle,
.radialCard--center .radialCardText {
  margin-left: 0;
}

.radialCardText {
  margin-top: 8px;
  margin-left: 10px;
  color: #475569;
  font-size: 13px;
  line-height: 1.45;
}

@media (max-width: 1180px) {
  .radialCenter {
    min-width: 190px;
    padding: 16px 18px;
  }

  .radialCenterTitle {
    font-size: 24px;
  }

  .radialCenterText,
  .radialCardText {
    font-size: 12px;
  }

  .radialCard {
    min-width: 156px;
    padding: 14px 16px;
  }

  .radialCardTitle {
    font-size: 17px;
  }
}
</style>
