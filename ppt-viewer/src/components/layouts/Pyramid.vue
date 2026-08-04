<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

type PyramidLevel = {
  title: string;
  text?: string;
  bullets: string[];
};

function toStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? "").trim())
    .filter((item) => item.length > 0)
    .slice(0, 2);
}

function asLevel(item: unknown, index: number): PyramidLevel {
  if (typeof item === "string") {
    return {
      title: item,
      bullets: []
    };
  }

  if (!item || typeof item !== "object") {
    return {
      title: `层级 ${index + 1}`,
      bullets: []
    };
  }

  const raw = item as Record<string, unknown>;
  const title = String(raw.title ?? raw.label ?? `层级 ${index + 1}`).trim() || `层级 ${index + 1}`;
  const text = typeof raw.text === "string" && raw.text.trim() ? raw.text.trim() : undefined;
  const bullets = toStrings(raw.bullets);

  return { title, text, bullets };
}

const levels = computed((): PyramidLevel[] => {
  const rawLevels: unknown[] = Array.isArray(props.slide?.levels)
    ? props.slide.levels
    : Array.isArray(props.slide?.blocks)
      ? props.slide.blocks
      : Array.isArray(props.slide?.bullets)
        ? props.slide.bullets
        : [];

  return rawLevels.slice(0, 5).map((item: unknown, index: number) => asLevel(item, index));
});

const palette = [
  ["#2c7df2", "#195dca"],
  ["#3b8dff", "#216fe0"],
  ["#5a9eff", "#2f7be5"],
  ["#79b0ff", "#4189ef"],
  ["#9dc5ff", "#5f9af4"]
];

function layerStyle(index: number) {
  const total = Math.max(levels.value.length, 1);
  const topOffsetRatio = 0.136;
  const gapRatio = 0.047;
  const layerRatio = Math.max((1 - topOffsetRatio - gapRatio * (total - 1)) / total, 0.08);
  const topRatio = topOffsetRatio + index * (layerRatio + gapRatio);
  const bottomRatio = Math.min(topRatio + layerRatio, 1);
  const topWidth = topRatio * 100;
  const bottomWidth = bottomRatio * 100;
  const topInset = ((bottomWidth - topWidth) / 2 / bottomWidth) * 100;
  const contentInset = Math.max(7, Math.min(13, topInset + 2));
  const [from, to] = palette[index % palette.length];
  return {
    width: `${bottomWidth}%`,
    "--layer-from": from,
    "--layer-to": to,
    "--layer-top-inset": `${topInset}%`,
    "--layer-inset": `${contentInset}%`
  };
}
</script>

<template>
  <div v-if="levels.length" class="pyramidRoot" :style="{ '--rows': String(levels.length) }">
    <div v-for="(level, index) in levels" :key="index" class="pyramidLayerWrap" :style="layerStyle(index)">
      <div class="pyramidLayer">
        <div class="pyramidLayerInner">
          <div class="pyramidBadge">{{ String(index + 1).padStart(2, "0") }}</div>
          <div class="pyramidTitle">{{ level.title }}</div>
          <div v-if="level.text" class="pyramidText">{{ level.text }}</div>
          <ul v-else-if="level.bullets.length" class="pyramidBullets">
            <li v-for="(bullet, bulletIndex) in level.bullets" :key="bulletIndex">{{ bullet }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pyramidRoot {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: repeat(var(--rows), minmax(0, 1fr));
  gap: 14px;
  justify-items: center;
  align-items: stretch;
  padding: 6px 0;
}

.pyramidLayerWrap {
  height: 100%;
  min-height: 0;
}

.pyramidLayer {
  position: relative;
  height: 100%;
  min-height: 0;
  clip-path: polygon(var(--layer-top-inset) 0, calc(100% - var(--layer-top-inset)) 0, 100% 100%, 0 100%);
  border: 1px solid rgba(216, 230, 247, 0.74);
  background: linear-gradient(135deg, var(--layer-from) 0%, var(--layer-to) 100%);
  box-shadow: 0 18px 28px rgba(26, 73, 145, 0.16);
  overflow: hidden;
}

.pyramidLayer::after {
  content: "";
  position: absolute;
  inset: 1px;
  clip-path: polygon(var(--layer-top-inset) 0, calc(100% - var(--layer-top-inset)) 0, 100% 100%, 0 100%);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 44%),
    radial-gradient(circle at top center, rgba(255, 255, 255, 0.18), transparent 54%);
  pointer-events: none;
}

.pyramidLayerInner {
  position: relative;
  z-index: 1;
  height: 100%;
  min-height: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 8px;
  padding: 14px var(--layer-inset);
  text-align: center;
}

.pyramidBadge {
  min-width: 52px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.04em;
}

.pyramidTitle {
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.15;
}

.pyramidText {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.45;
}

.pyramidBullets {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 4px;
}

.pyramidBullets li {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.4;
}

.pyramidBullets li::before {
  content: "• ";
}
</style>
