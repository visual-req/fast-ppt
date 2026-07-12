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
    return Array.from({ length: 4 }).map(() => ({}));
  }
  return raw.slice(0, 4);
});

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toBullets(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v: unknown) => String(v ?? "")).filter(Boolean) : [];
}

const getIconSvg = getLayoutIconSvg;
</script>

<template>
  <div class="fourGridRoot">
    <div class="fourGridAxis fourGridAxisHorizontal"></div>
    <div class="fourGridAxis fourGridAxisVertical"></div>

    <div v-for="(it, i) in items" :key="i" class="fgCard">
      <div class="fgIndex">{{ String(i + 1).padStart(2, "0") }}</div>
      <div class="fgHeader">
        <div v-if="getIconSvg(it?.icon)" class="fgIcon" v-html="getIconSvg(it?.icon)"></div>
        <div class="fgTitle">{{ toText(it?.title) || `模块 ${Number(i) + 1}` }}</div>
      </div>
      <div v-if="toText(it?.text)" class="fgText">{{ toText(it?.text) }}</div>
      <ul v-if="toBullets(it?.bullets).length" class="fgBullets">
        <li v-for="(bullet, j) in toBullets(it?.bullets)" :key="j">{{ bullet }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.fourGridRoot {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  height: 100%;
  padding: 18px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, var(--fppt-secondary-soft, rgba(77, 160, 255, 0.14)), transparent 32%),
    linear-gradient(180deg, var(--fppt-surface-alt, #f7faff) 0%, var(--fppt-page-bg, #eef4fb) 100%);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 96%, transparent);
  overflow: hidden;
}

.fourGridAxis {
  position: absolute;
  background: linear-gradient(90deg, color-mix(in srgb, var(--fppt-secondary, #4da0ff) 18%, transparent) 0%, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 8%, transparent) 100%);
  border-radius: 999px;
}

.fourGridAxisHorizontal {
  left: 22%;
  right: 22%;
  top: calc(50% - 3px);
  height: 6px;
}

.fourGridAxisVertical {
  top: 20%;
  bottom: 20%;
  left: calc(50% - 3px);
  width: 6px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--fppt-secondary, #4da0ff) 18%, transparent) 0%, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 8%, transparent) 100%);
}

.fgCard {
  position: relative;
  z-index: 1;
  display: grid;
  align-content: start;
  gap: 10px;
  min-height: 164px;
  padding: 18px;
  border-radius: 24px;
  background: color-mix(in srgb, var(--fppt-surface, #ffffff) 95%, transparent);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 96%, transparent);
  box-shadow: 0 18px 34px rgba(20, 61, 122, 0.08);
}

.fgIndex {
  width: 44px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(90deg, var(--fppt-secondary, #4da0ff) 0%, var(--fppt-primary, #1d6fe8) 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.fgHeader {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fgIcon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, color-mix(in srgb, var(--fppt-secondary, #4da0ff) 18%, transparent) 0%, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 8%, transparent) 100%);
  color: var(--fppt-primary, #1d6fe8);
  flex-shrink: 0;
}

.fgIcon :deep(svg) {
  width: 18px;
  height: 18px;
}

.fgTitle {
  font-size: 15px;
  font-weight: 800;
  line-height: 1.35;
  color: var(--fppt-text, #143d7a);
}

.fgText {
  font-size: 13px;
  line-height: 1.6;
  color: var(--fppt-muted, #475569);
  font-weight: 600;
}

.fgBullets {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
}

.fgBullets li {
  position: relative;
  padding-left: 16px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--fppt-muted, #475569);
}

.fgBullets li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 7px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--fppt-secondary, #4da0ff) 0%, var(--fppt-primary, #1d6fe8) 100%);
}
</style>
