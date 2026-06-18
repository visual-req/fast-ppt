<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type Datum = { label: string; value: number; color: string };

function palette(i: number) {
  const colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#0ea5e9", "#f97316"];
  return colors[i % colors.length]!;
}

const data = computed<Datum[]>(() => {
  const raw = Array.isArray(props.slide?.data) ? props.slide.data : [];
  return raw
    .map((x: any, i: number) => ({
      label: typeof x?.label === "string" ? x.label : "",
      value: Number.isFinite(Number(x?.value)) ? Number(x.value) : 0,
      color: typeof x?.color === "string" ? x.color : palette(i)
    }))
    .filter((d) => d.label || d.value);
});

const maxValue = computed(() => Math.max(...data.value.map((d) => d.value), 1));

const bars = computed(() => {
  const w = 520;
  const h = 260;
  const pad = 26;
  const barW = (w - pad * 2) / Math.max(1, data.value.length);
  return data.value.map((d: Datum, i: number) => {
    const x = pad + i * barW + barW * 0.18;
    const bw = barW * 0.64;
    const bh = ((h - pad * 2) * d.value) / maxValue.value;
    const y = h - pad - bh;
    return { d, x, y, bw, bh };
  });
});
</script>

<template>
  <div class="chartWrap">
    <div class="chartBox">
      <svg v-if="data.length" viewBox="0 0 520 260" width="520" height="260">
        <line x1="26" :y1="260 - 26" :x2="520 - 26" :y2="260 - 26" stroke="rgba(15,23,42,.25)" stroke-width="2" />
        <rect v-for="(b, i) in bars" :key="i" :x="b.x" :y="b.y" :width="b.bw" :height="Math.max(0, b.bh)" rx="6" :fill="b.d.color" opacity="0.9" />
      </svg>
      <Card v-else title="无数据" />
    </div>
    <div class="chartLegend">
      <div v-for="(d, i) in data" :key="i" class="legendRow">
        <div class="legendSwatch" :style="{ background: d.color }" />
        <div>{{ d.label || `项 ${Number(i) + 1}` }}</div>
        <div>{{ d.value }}</div>
      </div>
    </div>
  </div>
</template>
