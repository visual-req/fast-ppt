<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

const categories = computed(() => (Array.isArray(props.slide?.categories) ? props.slide.categories.map((x: any) => String(x ?? "")) : []));
const values = computed(() => (Array.isArray(props.slide?.values) ? props.slide.values.map((x: any) => (Number.isFinite(Number(x)) ? Number(x) : 0)) : []));
const maxValue = computed(() => {
  const m = Number(props.slide?.max);
  if (Number.isFinite(m) && m > 0) return m;
  return Math.max(...values.value, 1);
});

const points = computed(() => {
  const n = Math.max(categories.value.length, values.value.length);
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const r = 120;
  return Array.from({ length: n }).map((_, i) => {
    const v = values.value[i] ?? 0;
    const rr = (r * Math.max(0, v)) / maxValue.value;
    const a = -Math.PI / 2 + (i * Math.PI * 2) / n;
    return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`;
  });
});
</script>

<template>
  <div class="chartWrap">
    <div class="chartBox">
      <svg v-if="points.length" viewBox="0 0 320 320" width="320" height="320">
        <polygon
          v-for="ring in [1, 2, 3, 4]"
          :key="ring"
          :points="
            Array.from({ length: Math.max(categories.length, values.length) }).map((_, i) => {
              const n = Math.max(categories.length, values.length);
              const rr = (120 * ring) / 4;
              const a = -Math.PI / 2 + (i * Math.PI * 2) / n;
              return `${(160 + rr * Math.cos(a)).toFixed(2)},${(160 + rr * Math.sin(a)).toFixed(2)}`;
            }).join(' ')
          "
          fill="none"
          stroke="rgba(15,23,42,.12)"
          stroke-width="1.5"
        />
        <polygon :points="points.join(' ')" fill="rgba(37,99,235,.22)" stroke="#2563eb" stroke-width="2.5" />
      </svg>
      <Card v-else title="无数据" />
    </div>
    <div class="chartLegend">
      <div v-for="(c, i) in Math.max(categories.length, values.length)" :key="i" class="legendRow">
        <div class="legendSwatch" style="background: #2563eb" />
        <div>{{ categories[i] || `维度 ${Number(i) + 1}` }}</div>
        <div>{{ values[i] ?? 0 }}</div>
      </div>
    </div>
  </div>
</template>

