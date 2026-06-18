<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

type KpiItem = { label?: string; value?: string | number; unit?: string; note?: string; trend?: string };

const cards = computed<KpiItem[]>(() => {
  const raw = props.slide?.cards;
  return Array.isArray(raw) ? raw.slice(0, 6) : [];
});

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}
</script>

<template>
  <div class="kpiGrid">
    <div v-for="(c, i) in cards" :key="i" class="kpiCard">
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
