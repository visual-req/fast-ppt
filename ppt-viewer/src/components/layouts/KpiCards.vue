<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

 type KpiItem = { label?: string; value?: string | number; unit?: string; note?: string; trend?: string; icon?: string };

const cards = computed<KpiItem[]>(() => {
  const raw = props.slide?.cards;
  return Array.isArray(raw) ? raw.slice(0, 6) : [];
});

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
</script>

<template>
  <div class="kpiGrid">
    <div v-for="(c, i) in cards" :key="i" class="kpiCard">
      <div v-if="getIconSvg(c?.icon)" class="kpiIcon" v-html="getIconSvg(c?.icon)"></div>
      <div class="kpiLabel">{{ toText(c?.label) || `指标 ${Number(i) + 1}` }}</div>
      <div class="kpiValueRow">
        <span class="kpiValue">{{ c?.value ?? "-" }}</span>
        <span v-if="c?.unit" class="kpiUnit">{{ c.unit }}</span>
      </div>
      <div v-if="c?.trend" class="kpiTrend">{{ c.trend }}</div>
      <div v-if="c?.note" class="kpiNote">{{ c.note }}</div>
    </div>
  </div>
</template>
