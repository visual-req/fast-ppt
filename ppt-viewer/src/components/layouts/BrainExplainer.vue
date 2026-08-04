<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type BrainItem = {
  title?: string;
  text?: string;
  tag?: string;
  bullets?: string[];
};

type BrainPreset = {
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

function asItem(item: unknown, index: number): BrainItem {
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

const presetMap: Record<number, BrainPreset[]> = {
  4: [
    { cardX: 50, cardY: 12, dotX: 50, dotY: 32, align: "center" },
    { cardX: 84, cardY: 40, dotX: 68, dotY: 44, align: "left" },
    { cardX: 84, cardY: 74, dotX: 66, dotY: 64, align: "left" },
    { cardX: 16, cardY: 57, dotX: 32, dotY: 54, align: "right" }
  ],
  5: [
    { cardX: 50, cardY: 12, dotX: 50, dotY: 32, align: "center" },
    { cardX: 82, cardY: 30, dotX: 66, dotY: 38, align: "left" },
    { cardX: 84, cardY: 70, dotX: 66, dotY: 62, align: "left" },
    { cardX: 18, cardY: 70, dotX: 34, dotY: 62, align: "right" },
    { cardX: 18, cardY: 30, dotX: 34, dotY: 38, align: "right" }
  ],
  6: [
    { cardX: 50, cardY: 10, dotX: 50, dotY: 31, align: "center" },
    { cardX: 80, cardY: 24, dotX: 64, dotY: 36, align: "left" },
    { cardX: 84, cardY: 50, dotX: 68, dotY: 50, align: "left" },
    { cardX: 80, cardY: 76, dotX: 64, dotY: 64, align: "left" },
    { cardX: 20, cardY: 76, dotX: 36, dotY: 64, align: "right" },
    { cardX: 20, cardY: 24, dotX: 36, dotY: 36, align: "right" }
  ]
};

const brain = computed(() => {
  const raw =
    props.slide?.brain && typeof props.slide.brain === "object" && !Array.isArray(props.slide.brain)
      ? props.slide.brain
      : props.slide?.center && typeof props.slide.center === "object" && !Array.isArray(props.slide.center)
        ? props.slide.center
        : {};
  return {
    tag: toText(raw.tag) || "BRAIN",
    title: toText(raw.title) || "智能中枢",
    text: toText(raw.text) || "以统一认知、规则和反馈闭环驱动周边模块协同运转。"
  };
});

const items = computed<BrainItem[]>(() => {
  const raw = Array.isArray(props.slide?.items)
    ? props.slide.items
    : Array.isArray(props.slide?.points)
      ? props.slide.points
      : Array.isArray(props.slide?.blocks)
        ? props.slide.blocks
        : [];
  return raw.slice(0, 6).map((item: unknown, index: number) => asItem(item, index));
});

const layoutItems = computed(() => {
  const source = items.value;
  const count = Math.min(Math.max(source.length, 0), 6);
  const presets = presetMap[count] ?? presetMap[5];
  return source.map((item, index) => ({
    ...item,
    preset: presets[index] ?? presets[presets.length - 1] ?? presetMap[5][0]
  }));
});

function itemText(item: BrainItem): string {
  return toText(item.text) || toStrings(item.bullets).join(" / ");
}

function cardStyle(preset: BrainPreset) {
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

function connectorPath(preset: BrainPreset): string {
  const cx = 50;
  const cy = 50;
  const mx = (cx + preset.dotX) / 2;
  const my = (cy + preset.dotY) / 2;
  return `M ${cx} ${cy} Q ${mx} ${my} ${preset.dotX} ${preset.dotY}`;
}
</script>

<template>
  <Card v-if="!layoutItems.length" title="无数据" />
  <div v-else class="brainRoot">
    <svg class="brainConnectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="brainStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#93c5fd" />
          <stop offset="100%" stop-color="#2563eb" />
        </linearGradient>
      </defs>
      <path
        v-for="(item, index) in layoutItems"
        :key="`line-${index}`"
        :d="connectorPath(item.preset)"
        class="brainConnectorPath"
      />
      <circle
        v-for="(item, index) in layoutItems"
        :key="`dot-${index}`"
        :cx="item.preset.dotX"
        :cy="item.preset.dotY"
        r="1.75"
        class="brainConnectorDot"
      />
    </svg>

    <div class="brainCenter">
      <div class="brainHalo"></div>
      <svg class="brainVisual" viewBox="0 0 420 320" aria-hidden="true">
        <defs>
          <linearGradient id="brainFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f8fbff" />
            <stop offset="100%" stop-color="#eaf2ff" />
          </linearGradient>
        </defs>
        <path
          d="M209 60 C176 30 124 34 97 68 C74 72 56 91 54 118 C37 134 34 166 50 188 C47 213 61 237 84 247 C96 271 122 286 148 283 C164 294 188 296 209 286"
          fill="url(#brainFill)"
          stroke="#2563eb"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M211 60 C244 30 296 34 323 68 C346 72 364 91 366 118 C383 134 386 166 370 188 C373 213 359 237 336 247 C324 271 298 286 272 283 C256 294 232 296 211 286"
          fill="url(#brainFill)"
          stroke="#2563eb"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path d="M210 76 L210 272" fill="none" stroke="#93c5fd" stroke-width="4" stroke-linecap="round" stroke-dasharray="8 8" />
        <path d="M150 88 C122 98 112 124 122 146 C108 166 112 190 130 204" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
        <path d="M186 96 C162 108 154 130 164 150 C152 170 156 192 172 206" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
        <path d="M270 88 C298 98 308 124 298 146 C312 166 308 190 290 204" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
        <path d="M234 96 C258 108 266 130 256 150 C268 170 264 192 248 206" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
        <path d="M140 224 C160 238 182 244 206 246" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
        <path d="M280 224 C260 238 238 244 214 246" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
      </svg>
      <div class="brainLabel">
        <div class="brainTag">{{ brain.tag }}</div>
        <div class="brainTitle">{{ brain.title }}</div>
        <div class="brainText">{{ brain.text }}</div>
      </div>
    </div>

    <div
      v-for="(item, index) in layoutItems"
      :key="index"
      class="brainCard"
      :class="`brainCard--${item.preset.align}`"
      :style="cardStyle(item.preset)"
    >
      <div v-if="toText(item.tag)" class="brainCardTag">{{ item.tag }}</div>
      <div class="brainCardTitle">{{ toText(item.title) || `模块 ${index + 1}` }}</div>
      <div v-if="itemText(item)" class="brainCardText">{{ itemText(item) }}</div>
    </div>
  </div>
</template>

<style scoped>
.brainRoot {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.14), transparent 28%),
    linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 20px 36px rgba(20, 61, 122, 0.08);
}

.brainConnectors {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.brainConnectorPath {
  fill: none;
  stroke: url(#brainStroke);
  stroke-width: 0.72;
  stroke-linecap: round;
  stroke-dasharray: 1.9 1.5;
  opacity: 0.88;
}

.brainConnectorDot {
  fill: #ffffff;
  stroke: #2563eb;
  stroke-width: 0.7;
  filter: drop-shadow(0 3px 5px rgba(20, 61, 122, 0.12));
}

.brainCenter {
  position: absolute;
  left: 50%;
  top: 54%;
  width: 40%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
}

.brainHalo {
  position: absolute;
  inset: 12%;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(147, 197, 253, 0.24) 0%, rgba(147, 197, 253, 0.08) 56%, transparent 74%);
}

.brainVisual {
  position: absolute;
  inset: 8% 10% 24%;
  width: 80%;
  height: 68%;
  filter: drop-shadow(0 12px 22px rgba(20, 61, 122, 0.1));
}

.brainLabel {
  position: absolute;
  left: 50%;
  bottom: 10%;
  width: 62%;
  transform: translateX(-50%);
  padding: 14px 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(191, 219, 254, 0.92);
  box-shadow: 0 16px 28px rgba(20, 61, 122, 0.1);
  text-align: center;
}

.brainTag {
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.brainTitle {
  margin-top: 6px;
  color: #143d7a;
  font-size: 25px;
  font-weight: 800;
  line-height: 1.18;
}

.brainText {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

.brainCard {
  position: absolute;
  width: 25%;
  min-width: 176px;
  max-width: 244px;
  min-height: 84px;
  padding: 16px 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 16px 28px rgba(20, 61, 122, 0.08);
  overflow: hidden;
}

.brainCard::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 7px;
  background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
}

.brainCard--center {
  text-align: center;
}

.brainCardTag {
  margin-left: 10px;
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.brainCardTitle {
  margin-top: 8px;
  margin-left: 10px;
  color: #143d7a;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.brainCard--center .brainCardTag,
.brainCard--center .brainCardTitle,
.brainCard--center .brainCardText {
  margin-left: 0;
}

.brainCardText {
  margin-top: 8px;
  margin-left: 10px;
  color: #475569;
  font-size: 13px;
  line-height: 1.45;
}

@media (max-width: 1180px) {
  .brainCenter {
    width: 42%;
  }

  .brainLabel {
    width: 68%;
  }

  .brainTitle {
    font-size: 22px;
  }

  .brainText,
  .brainCardText {
    font-size: 12px;
  }

  .brainCard {
    min-width: 156px;
    padding: 14px 16px;
  }

  .brainCardTitle {
    font-size: 17px;
  }
}
</style>
