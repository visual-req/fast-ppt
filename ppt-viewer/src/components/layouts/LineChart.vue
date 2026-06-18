<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type Point = { label: string; value: number };

const points = computed<Point[]>(() => {
  const raw = Array.isArray(props.slide?.data) ? props.slide.data : [];
  return raw
    .map((x: any) => ({
      label: typeof x?.label === "string" ? x.label : "",
      value: Number.isFinite(Number(x?.value)) ? Number(x.value) : 0
    }))
    .filter((p) => p.label || p.value);
});

const polyPoints = computed(() => {
  const w = 520;
  const h = 260;
  const pad = 30;
  const ys = points.value.map((p) => p.value);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 1);
  const span = maxY - minY || 1;
  const stepX = points.value.length > 1 ? (w - pad * 2) / (points.value.length - 1) : 0;
  return points.value.map((p, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((p.value - minY) / span) * (h - pad * 2);
    return { x, y, p };
  });
});
</script>

<template>
  <div class="chartWrap">
    <div class="chartBox">
      <svg v-if="points.length" viewBox="0 0 520 260" width="520" height="260">
        <line x1="30" :y1="260 - 30" :x2="520 - 30" :y2="260 - 30" stroke="rgba(15,23,42,.25)" stroke-width="2" />
        <polyline
          :points="polyPoints.map((x) => `${x.x.toFixed(2)},${x.y.toFixed(2)}`).join(' ')"
          fill="none"
          stroke="#2563eb"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle v-for="(x, i) in polyPoints" :key="i" :cx="x.x" :cy="x.y" r="4.5" fill="#2563eb" />
      </svg>
      <Card v-else title="无数据" />
    </div>
    <div class="chartLegend">
      <div v-for="(p, i) in points" :key="i" class="legendRow">
        <div class="legendSwatch" style="background: #2563eb" />
        <div>{{ p.label || `点 ${Number(i) + 1}` }}</div>
        <div>{{ p.value }}</div>
      </div>
    </div>
  </div>
</template>

