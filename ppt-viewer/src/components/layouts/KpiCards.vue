<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

 type KpiItem = { label?: string; value?: string | number; unit?: string; note?: string; trend?: string; icon?: string };

const cards = computed<KpiItem[]>(() => {
  const raw = props.slide?.cards;
  return Array.isArray(raw) ? raw.slice(0, 6) : [];
});

const accentPalette = [
  ["var(--fppt-primary, #1d6fe8)", "var(--fppt-secondary, #4da0ff)"],
  ["#0f8fb6", "#3dc6dd"],
  ["#425fd6", "#7f97ff"],
  ["#0f766e", "#38b2ac"],
  ["#5b52d6", "#8e7bff"],
  ["#0f6ad8", "#69b0ff"]
];

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getIconSvg(name: unknown) {
  const key = typeof name === "string" ? name : "";
  const svgByName: Record<string, string> = {
    drift:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18c3-6 6-6 9-3s5 3 7-1"></path><path d="M4 6c3 6 6 6 9 3s5-3 7 1"></path></svg>',
    rollout:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="6" height="12" rx="1.5"></rect><rect x="14" y="4" width="6" height="16" rx="1.5"></rect></svg>',
    compute:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="7" width="14" height="10" rx="2"></rect><path d="M9 4v3"></path><path d="M15 4v3"></path><path d="M9 17v3"></path><path d="M15 17v3"></path></svg>',
    adoption:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20v-7"></path><path d="M12 20V9"></path><path d="M17 20V4"></path></svg>',
    loop:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"></path><path d="M21 3v6h-6"></path></svg>',
    rollback:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"></path><path d="M20 20v-5a6 6 0 0 0-6-6H4"></path></svg>'
  };
  return svgByName[key] ?? "";
}

function accentStyle(index: number) {
  const [from, to] = accentPalette[index % accentPalette.length];
  return {
    "--kpi-accent-from": from,
    "--kpi-accent-to": to
  };
}
</script>

<template>
  <div class="kpiGrid">
    <div v-for="(c, i) in cards" :key="i" class="kpiCard" :style="accentStyle(i)">
      <div class="kpiCardTop">
        <div v-if="getIconSvg(c?.icon)" class="kpiIcon" v-html="getIconSvg(c?.icon)"></div>
        <div class="kpiChip">{{ String(i + 1).padStart(2, '0') }}</div>
      </div>
      <div class="kpiLabel">{{ toText(c?.label) || `指标 ${Number(i) + 1}` }}</div>
      <div class="kpiValueRow">
        <span class="kpiValue">{{ c?.value ?? "-" }}</span>
        <span v-if="c?.unit" class="kpiUnit">{{ c.unit }}</span>
      </div>
      <div v-if="c?.trend" class="kpiTrend">{{ c.trend }}</div>
      <div v-if="c?.note" class="kpiNote">{{ c.note }}</div>
      <div class="kpiAccentBar"></div>
    </div>
  </div>
</template>

<style scoped>
.kpiCard {
  position: relative;
  overflow: hidden;
  padding: 20px 20px 18px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--kpi-accent-to) 18%, transparent), transparent 36%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 250, 255, 0.98) 100%);
  border: 1px solid color-mix(in srgb, var(--kpi-accent-from) 12%, rgba(215, 227, 244, 0.96));
  box-shadow: 0 20px 32px rgba(20, 61, 122, 0.09);
}

.kpiCardTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.kpiIcon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--kpi-accent-from) 12%, white);
  color: var(--kpi-accent-from);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.kpiIcon svg {
  width: 20px;
  height: 20px;
}

.kpiChip {
  min-width: 38px;
  height: 26px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--kpi-accent-from) 0%, var(--kpi-accent-to) 100%);
  color: white;
  font-size: 11px;
  font-weight: 800;
}

.kpiLabel {
  margin-top: 14px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.58);
}

.kpiValueRow {
  margin-top: 2px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.kpiValue {
  font-size: 42px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
}

.kpiUnit {
  font-size: 15px;
  color: rgba(15, 23, 42, 0.46);
  font-weight: 700;
}

.kpiTrend {
  margin-top: 8px;
  display: inline-flex;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--kpi-accent-from) 10%, white);
  color: var(--kpi-accent-from);
  font-size: 12px;
  font-weight: 800;
}

.kpiNote {
  margin-top: 8px;
  font-size: 13px;
  color: rgba(15, 23, 42, 0.56);
  line-height: 1.5;
}

.kpiAccentBar {
  margin-top: 14px;
  width: 76px;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--kpi-accent-from) 0%, var(--kpi-accent-to) 100%);
}
</style>
