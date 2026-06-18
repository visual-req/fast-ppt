<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type Datum = { label: string; value: number; color: string };

function palette(i: number) {
  const colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#0ea5e9", "#f97316"];
  return colors[i % colors.length]!;
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const largeArc = end - start > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

const donut = computed(() => props.slide?.layout_type === "donut_chart");
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
const total = computed(() => data.value.reduce((s: number, d: Datum) => s + Math.max(0, d.value), 0));
const arcs = computed(() => {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = 110;
  const t = total.value || 1;
  let angle = -Math.PI / 2;
  return data.value.map((d: Datum) => {
    const frac = Math.max(0, d.value) / t;
    const next = angle + frac * Math.PI * 2;
    const path = arcPath(cx, cy, r, angle, next);
    angle = next;
    return { d, path };
  });
});
</script>

<template>
  <div class="chartWrap">
    <div class="chartBox">
      <svg v-if="data.length" viewBox="0 0 280 280" width="280" height="280">
        <path v-for="(a, i) in arcs" :key="i" :d="a.path" :fill="a.d.color" opacity="0.95" />
        <circle v-if="donut" cx="140" cy="140" r="62" fill="#ffffff" />
      </svg>
      <Card v-else title="无数据" />
    </div>
    <div>
      <div class="chartLegend">
        <div v-for="(d, i) in data" :key="i" class="legendRow">
          <div class="legendSwatch" :style="{ background: d.color }" />
          <div>{{ d.label || `项 ${Number(i) + 1}` }}</div>
          <div>{{ d.value }}</div>
        </div>
      </div>
      <div style="margin-top: 10px; font-size: 12px; color: rgba(15, 23, 42, 0.65)">合计：{{ total }}</div>
    </div>
  </div>
</template>
