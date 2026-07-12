<script setup lang="ts">
import { computed } from "vue";
import { getLayoutIconSvg } from "../../lib/layoutIcons";

const props = defineProps<{ slide: any }>();

type GridItem = {
  title?: string;
  text?: string;
  bullets?: string[];
  icon?: string;
};

const items = computed<GridItem[]>(() => {
  const raw = props.slide?.grid || props.slide?.items;
  if (!Array.isArray(raw) || raw.length === 0) {
    return Array.from({ length: 9 }).map(() => ({}));
  }
  return raw.slice(0, 9);
});
const hasCenterHub = computed(() => items.value.length > 0 && items.value.length < 9);
const displayItems = computed<Array<GridItem | null>>(() => {
  if (!hasCenterHub.value) return items.value;

  const result: Array<GridItem | null> = Array.from({ length: 9 }, () => null);
  const slots = [0, 1, 2, 3, 5, 6, 7, 8];
  items.value.forEach((item, index) => {
    const target = slots[index];
    if (typeof target === "number") result[target] = item;
  });
  return result;
});

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toBullets(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v: unknown) => String(v ?? "")).filter(Boolean) : [];
}

function cellTag(item: GridItem, index: number): string {
  if (item.icon && getLayoutIconSvg(item.icon)) return "能力模块";
  return `象限 ${String(index + 1).padStart(2, "0")}`;
}

const getIconSvg = getLayoutIconSvg;
</script>

<template>
  <div class="nineGridRoot">
    <div v-if="hasCenterHub" class="nineGridBackdrop"></div>
    <div v-if="hasCenterHub" class="nineGridCenterHub">
      <div class="nineGridCenterLabel">{{ slide?.title || "平台能力全景" }}</div>
      <div v-if="slide?.subtitle" class="nineGridCenterText">{{ slide.subtitle }}</div>
    </div>

    <div
      v-for="(it, i) in displayItems"
      :key="i"
      class="nineGridCard"
      :class="`nineGridCard${i + 1}`"
    >
      <template v-if="it">
      <div class="nineGridCardGlow"></div>
      <div class="nineGridCardInner">
        <div class="nineGridTag">{{ cellTag(it, i) }}</div>
        <div class="nineGridHeader">
          <div v-if="getIconSvg(it?.icon)" class="nineGridIcon" v-html="getIconSvg(it?.icon)"></div>
          <div class="nineGridTitle">{{ toText(it?.title) || `模块 ${Number(i) + 1}` }}</div>
        </div>
        <div v-if="toText(it?.text)" class="nineGridText">{{ toText(it?.text) }}</div>
        <ul v-if="toBullets(it?.bullets).length" class="nineGridBullets">
          <li v-for="(bullet, j) in toBullets(it?.bullets)" :key="j">{{ bullet }}</li>
        </ul>
      </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.nineGridRoot {
  position: relative;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: 14px;
  height: 100%;
  min-height: 0;
  padding: 12px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, var(--fppt-secondary-soft, rgba(77, 160, 255, 0.16)), transparent 32%),
    linear-gradient(180deg, var(--fppt-surface-alt, #f7faff) 0%, var(--fppt-page-bg, #eef4fb) 100%);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 96%, transparent);
  overflow: hidden;
}

.nineGridBackdrop {
  position: absolute;
  inset: 18% 20%;
  border-radius: 36px;
  border: 1px dashed color-mix(in srgb, var(--fppt-secondary, #4da0ff) 28%, transparent);
  background: color-mix(in srgb, var(--fppt-surface, #ffffff) 24%, transparent);
}

.nineGridCenterHub {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(34%, 260px);
  min-height: 116px;
  padding: 18px 20px;
  border-radius: 26px;
  display: grid;
  place-items: center;
  text-align: center;
  background: linear-gradient(135deg, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 78%, #0f172a) 0%, var(--fppt-text, #123b7a) 100%);
  color: #ffffff;
  box-shadow: 0 22px 42px rgba(18, 59, 122, 0.18);
  z-index: 1;
}

.nineGridCenterLabel {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.35;
}

.nineGridCenterText {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.82);
}

.nineGridCard {
  position: relative;
  min-width: 0;
  min-height: 0;
}

.nineGridCardInner {
  position: relative;
  z-index: 1;
  height: 100%;
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 8px;
  padding: 14px 14px 12px;
  border-radius: 22px;
  background: color-mix(in srgb, var(--fppt-surface, #ffffff) 94%, transparent);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 96%, transparent);
  box-shadow: 0 16px 34px rgba(20, 61, 122, 0.08);
}

.nineGridCardGlow {
  position: absolute;
  inset: 16px 18px auto auto;
  width: 54px;
  height: 54px;
  border-radius: 999px;
  background: radial-gradient(circle, var(--fppt-secondary-soft, rgba(77, 160, 255, 0.18)), transparent 72%);
}

.nineGridTag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  width: fit-content;
  padding: 0 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--fppt-primary, #1d6fe8) 8%, transparent);
  color: var(--fppt-primary, #1d4ed8);
  font-size: 11px;
  font-weight: 800;
}

.nineGridHeader {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nineGridIcon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, color-mix(in srgb, var(--fppt-secondary, #4da0ff) 18%, transparent) 0%, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 8%, transparent) 100%);
  color: var(--fppt-primary, #1d6fe8);
  flex-shrink: 0;
}

.nineGridIcon :deep(svg) {
  width: 18px;
  height: 18px;
}

.nineGridTitle {
  font-size: 13px;
  font-weight: 800;
  line-height: 1.35;
  color: var(--fppt-text, #143d7a);
}

.nineGridText {
  font-size: 11px;
  line-height: 1.45;
  color: var(--fppt-muted, #475569);
  font-weight: 600;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.nineGridBullets {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 4px;
}

.nineGridBullets li {
  position: relative;
  padding-left: 16px;
  font-size: 11px;
  line-height: 1.4;
  color: var(--fppt-muted, #475569);
}

.nineGridBullets li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 7px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--fppt-secondary, #4da0ff) 0%, var(--fppt-primary, #1d6fe8) 100%);
}

.nineGridCard5:empty {
  visibility: hidden;
}

@media (max-width: 520px) {
  .nineGridRoot {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: none;
    height: auto;
  }

  .nineGridBackdrop,
  .nineGridCenterHub,
  .nineGridCard5:empty {
    display: none;
  }
}

@media (max-width: 700px) {
  .nineGridRoot {
    gap: 8px;
    padding: 8px;
  }

  .nineGridCenterHub {
    min-height: 88px;
    padding: 12px 14px;
    border-radius: 20px;
  }

  .nineGridCenterLabel {
    font-size: 16px;
  }

  .nineGridCenterText {
    font-size: 10px;
    line-height: 1.35;
  }

  .nineGridCardInner {
    gap: 6px;
    padding: 10px 10px 9px;
    border-radius: 16px;
  }

  .nineGridTag {
    min-height: 20px;
    padding: 0 8px;
    font-size: 10px;
  }

  .nineGridHeader {
    gap: 8px;
  }

  .nineGridIcon {
    width: 28px;
    height: 28px;
    border-radius: 10px;
  }

  .nineGridIcon :deep(svg) {
    width: 14px;
    height: 14px;
  }

  .nineGridTitle {
    font-size: 12px;
  }

  .nineGridText {
    font-size: 10px;
    line-height: 1.35;
    line-clamp: 2;
    -webkit-line-clamp: 2;
  }

  .nineGridBullets {
    gap: 3px;
  }

  .nineGridBullets li {
    font-size: 10px;
    line-height: 1.3;
  }
}
</style>
