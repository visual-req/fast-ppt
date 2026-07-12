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
const niceMaxValue = computed(() => {
  const raw = maxValue.value;
  const exponent = Math.floor(Math.log10(Math.max(raw, 1)));
  const base = 10 ** exponent;
  const normalized = raw / base;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * base;
});
const ticks = computed(() => {
  const total = 4;
  return Array.from({ length: total + 1 }, (_, i) => {
    const value = (niceMaxValue.value / total) * i;
    return {
      value,
      label: Math.round(value).toLocaleString("zh-CN")
    };
  });
});

function splitLabel(label: string): string[] {
  const trimmed = label.trim();
  if (!trimmed) return [];
  if (trimmed.length <= 4) return [trimmed];
  if (trimmed.length <= 8) return [trimmed.slice(0, 4), trimmed.slice(4)];
  return [trimmed.slice(0, 4), trimmed.slice(4, 8)];
}

const bars = computed(() => {
  const w = 560;
  const h = 300;
  const leftPad = 64;
  const rightPad = 24;
  const topPad = 20;
  const bottomPad = 64;
  const chartW = w - leftPad - rightPad;
  const chartH = h - topPad - bottomPad;
  const slotW = chartW / Math.max(1, data.value.length);
  return data.value.map((d: Datum, i: number) => {
    const x = leftPad + i * slotW + slotW * 0.18;
    const bw = slotW * 0.64;
    const bh = (chartH * d.value) / niceMaxValue.value;
    const y = topPad + chartH - bh;
    return { d, x, y, bw, bh, cx: x + bw / 2, lines: splitLabel(d.label) };
  });
});
</script>

<template>
  <div class="chartWrap">
    <div class="chartBox">
      <svg v-if="data.length" viewBox="0 0 560 300" width="560" height="300" aria-label="bar-chart">
        <g v-for="(tick, i) in ticks" :key="`tick-${i}`">
          <line
            x1="64"
            :y1="236 - ((216 * tick.value) / niceMaxValue)"
            x2="536"
            :y2="236 - ((216 * tick.value) / niceMaxValue)"
            stroke="rgba(15,23,42,.10)"
            stroke-width="1"
          />
          <text
            x="54"
            :y="240 - ((216 * tick.value) / niceMaxValue)"
            text-anchor="end"
            font-size="11"
            fill="rgba(15,23,42,.55)"
          >
            {{ tick.label }}
          </text>
        </g>

        <line x1="64" y1="20" x2="64" y2="236" stroke="rgba(15,23,42,.28)" stroke-width="2" />
        <line x1="64" y1="236" x2="536" y2="236" stroke="rgba(15,23,42,.28)" stroke-width="2" />

        <text x="24" y="24" font-size="11" fill="rgba(15,23,42,.55)">{{ slide.unit || "值" }}</text>

        <g v-for="(b, i) in bars" :key="i">
          <rect :x="b.x" :y="b.y" :width="b.bw" :height="Math.max(0, b.bh)" rx="8" :fill="b.d.color" opacity="0.92" />
          <text
            :x="b.cx"
            :y="Math.max(18, b.y - 8)"
            text-anchor="middle"
            font-size="11"
            font-weight="700"
            fill="rgba(15,23,42,.78)"
          >
            {{ b.d.value }}
          </text>
          <text
            v-for="(line, li) in b.lines"
            :key="`${i}-${li}`"
            :x="b.cx"
            :y="258 + li * 14"
            text-anchor="middle"
            font-size="11"
            font-weight="600"
            fill="rgba(15,23,42,.72)"
          >
            {{ line }}
          </text>
        </g>
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
