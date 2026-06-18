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
const rings = computed(() => [1, 2, 3, 4]);
const n = computed(() => Math.max(categories.value.length, values.value.length));

const points = computed(() => {
  const total = n.value;
  const cx = 200;
  const cy = 200;
  const r = 150;
  return Array.from({ length: total }).map((_, i) => {
    const v = values.value[i] ?? 0;
    const rr = (r * Math.max(0, v)) / maxValue.value;
    const a = -Math.PI / 2 + (i * Math.PI * 2) / total;
    return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`;
  });
});

const axisLabels = computed(() => {
  const total = n.value;
  const cx = 200, cy = 200, r = 182;
  return Array.from({ length: total }).map((_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / total;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    return { x, y, label: categories.value[i] || `维度 ${i + 1}`, value: values.value[i] ?? 0 };
  });
});

const ringLabels = computed(() => {
  const m = maxValue.value;
  return rings.value.map((ring) => {
    const v = (m * ring) / 4;
    return { ring, value: Number.isInteger(v) ? v : v.toFixed(1) };
  });
});
</script>

<template>
  <div class="chartWrap">
    <div class="chartBox">
      <svg v-if="points.length" viewBox="0 0 400 400" width="400" height="400">
        <!-- Axis lines from center to each vertex -->
        <line
          v-for="i in n"
          :key="'axis-' + i"
          :x1="200" y1="200"
          :x2="(200 + 165 * Math.cos(-Math.PI / 2 + ((i - 1) * Math.PI * 2) / n)).toFixed(2)"
          :y2="(200 + 165 * Math.sin(-Math.PI / 2 + ((i - 1) * Math.PI * 2) / n)).toFixed(2)"
          stroke="rgba(15,23,42,.10)"
          stroke-width="1"
        />
        <!-- Rings -->
        <polygon
          v-for="ring in rings"
          :key="'ring-' + ring"
          :points="
            Array.from({ length: n }).map((_, i) => {
              const rr = (150 * ring) / 4;
              const a = -Math.PI / 2 + (i * Math.PI * 2) / n;
              return `${(200 + rr * Math.cos(a)).toFixed(2)},${(200 + rr * Math.sin(a)).toFixed(2)}`;
            }).join(' ')
          "
          fill="none"
          stroke="rgba(15,23,42,.12)"
          stroke-width="1.5"
        />
        <!-- Ring labels -->
        <text
          v-for="rl in ringLabels"
          :key="'rlabel-' + rl.ring"
          :x="200"
          :y="200 - (150 * rl.ring) / 4 - 4"
          text-anchor="middle"
          font-size="10"
          fill="rgba(15,23,42,0.40)"
        >{{ rl.value }}</text>
        <!-- Data polygon -->
        <polygon :points="points.join(' ')" fill="rgba(37,99,235,.20)" stroke="#2563eb" stroke-width="2.5" />
        <!-- Data dots -->
        <circle
          v-for="(pt, i) in points"
          :key="'dot-' + i"
          :cx="pt.split(',')[0]"
          :cy="pt.split(',')[1]"
          r="4"
          fill="#2563eb"
        />
        <!-- Axis labels -->
        <text
          v-for="(al, i) in axisLabels"
          :key="'alabel-' + i"
          :x="al.x"
          :y="al.y"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="11"
          fill="#0f172a"
          font-weight="700"
        >{{ al.label }}</text>
      </svg>
      <Card v-else title="无数据" />
    </div>
    <div class="chartLegend">
      <div v-for="(c, i) in n" :key="i" class="legendRow">
        <div class="legendSwatch" style="background: #2563eb" />
        <div>{{ categories[i] || `维度 ${Number(i) + 1}` }}</div>
        <div>{{ values[i] ?? 0 }}</div>
      </div>
    </div>
  </div>
</template>

