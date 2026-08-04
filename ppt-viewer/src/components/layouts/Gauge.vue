<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

const svgW = 560;
const svgH = 320;
const cx = 280;
const cy = 246;
const radius = 176;
const pointerRadius = 142;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function polarToCartesian(centerX: number, centerY: number, r: number, angleDeg: number) {
  const angleRad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: centerX + r * Math.cos(angleRad),
    y: centerY + r * Math.sin(angleRad)
  };
}

function describeArc(centerX: number, centerY: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(centerX, centerY, r, endAngle);
  const end = polarToCartesian(centerX, centerY, r, startAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

const minValue = computed(() => {
  const value = Number(props.slide?.min);
  return Number.isFinite(value) ? value : 0;
});

const maxValue = computed(() => {
  const value = Number(props.slide?.max);
  if (Number.isFinite(value) && value > minValue.value) return value;
  return 100;
});

const value = computed(() => {
  const raw = Number(props.slide?.value);
  if (!Number.isFinite(raw)) return minValue.value;
  return clamp(raw, minValue.value, maxValue.value);
});

const ratio = computed(() => {
  const span = Math.max(maxValue.value - minValue.value, 1);
  return clamp((value.value - minValue.value) / span, 0, 1);
});

const valueLabel = computed(() => {
  const raw = value.value;
  return Number.isInteger(raw) ? String(raw) : raw.toFixed(1);
});

const metricLabel = computed(() => {
  return typeof props.slide?.label === "string" && props.slide.label.trim() ? props.slide.label.trim() : "综合评分";
});

const fullArcPath = computed(() => describeArc(cx, cy, radius, 180, 0));
const progressArcPath = computed(() => describeArc(cx, cy, radius, 180, 180 - ratio.value * 180));

const pointer = computed(() => {
  const angle = 180 - ratio.value * 180;
  return polarToCartesian(cx, cy, pointerRadius, angle);
});
</script>

<template>
  <div class="chartWrap">
    <div class="chartBox">
      <svg v-if="Number.isFinite(value)" :viewBox="`0 0 ${svgW} ${svgH}`" :width="svgW" :height="svgH" aria-label="gauge-chart">
        <path :d="fullArcPath" fill="none" stroke="#dbeafe" stroke-width="28" stroke-linecap="round"/>
        <path :d="progressArcPath" fill="none" stroke="#2563eb" stroke-width="28" stroke-linecap="round"/>

        <line
          :x1="cx"
          :y1="cy"
          :x2="pointer.x"
          :y2="pointer.y"
          stroke="#0f172a"
          stroke-width="7"
          stroke-linecap="round"
        />
        <circle :cx="cx" :cy="cy" r="14" fill="#0f172a"/>

        <text :x="cx" y="154" text-anchor="middle" fill="#0f172a" font-size="58" font-weight="700">{{ valueLabel }}</text>
        <text :x="cx" y="196" text-anchor="middle" fill="#64748b" font-size="22">{{ metricLabel }}</text>
        <text :x="cx - radius" y="286" text-anchor="middle" fill="#0f172a" font-size="18">{{ minValue }}</text>
        <text :x="cx + radius" y="286" text-anchor="middle" fill="#0f172a" font-size="18">{{ maxValue }}</text>
      </svg>
      <Card v-else title="无数据" />
    </div>
  </div>
</template>
