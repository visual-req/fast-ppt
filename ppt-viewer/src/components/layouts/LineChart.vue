<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type Datum = { label: string; value: number };
type ChartPoint = Datum & {
  x: number;
  y: number;
  boxX: number;
  boxY: number;
  boxW: number;
  boxH: number;
  valueLabel: string;
  labelLines: string[];
  leaderY: number;
};

const svgW = 560;
const svgH = 300;
const leftPad = 64;
const rightPad = 24;
const topPad = 28;
const bottomPad = 64;
const plotW = svgW - leftPad - rightPad;
const plotH = svgH - topPad - bottomPad;

const data = computed<Datum[]>(() => {
  const raw = Array.isArray(props.slide?.data) ? props.slide.data : [];
  return raw
    .map((x: any) => ({
      label: typeof x?.label === "string" ? x.label : "",
      value: Number.isFinite(Number(x?.value)) ? Number(x.value) : 0
    }))
    .filter((d: Datum) => d.label || d.value);
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const points = computed<ChartPoint[]>(() => {
  const slotW = plotW / Math.max(1, data.value.length - 1);

  return data.value.map((d, index) => {
    const x = leftPad + (data.value.length > 1 ? index * slotW : plotW / 2);
    const y = topPad + plotH - (plotH * d.value) / niceMaxValue.value;
    const valueLabel = d.value.toLocaleString("zh-CN");
    const boxW = Math.max(46, valueLabel.length * 8 + 16);
    const boxH = 24;
    const boxX = clamp(x - boxW / 2, leftPad, svgW - rightPad - boxW);
    const preferredTopY = y - boxH - 18;
    const boxY = preferredTopY >= topPad ? preferredTopY : Math.min(topPad + plotH - boxH, y + 14);

    return {
      ...d,
      x,
      y,
      boxX,
      boxY,
      boxW,
      boxH,
      valueLabel,
      labelLines: splitLabel(d.label),
      leaderY: boxY < y ? boxY + boxH : boxY
    };
  });
});

const linePath = computed(() => points.value.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" "));
</script>

<template>
  <div class="chartWrap">
    <div class="chartBox">
      <svg v-if="data.length" viewBox="0 0 560 300" width="560" height="300" aria-label="line-chart">
        <g v-for="(tick, i) in ticks" :key="`tick-${i}`">
          <line
            x1="64"
            :y1="236 - ((208 * tick.value) / niceMaxValue)"
            x2="536"
            :y2="236 - ((208 * tick.value) / niceMaxValue)"
            stroke="rgba(15,23,42,.10)"
            stroke-width="1"
          />
          <text
            x="54"
            :y="240 - ((208 * tick.value) / niceMaxValue)"
            text-anchor="end"
            font-size="11"
            fill="rgba(15,23,42,.55)"
          >
            {{ tick.label }}
          </text>
        </g>

        <line x1="64" y1="28" x2="64" y2="236" stroke="rgba(15,23,42,.28)" stroke-width="2" />
        <line x1="64" y1="236" x2="536" y2="236" stroke="rgba(15,23,42,.28)" stroke-width="2" />
        <text x="24" y="32" font-size="11" fill="rgba(15,23,42,.55)">{{ slide.unit || "值" }}</text>

        <polyline
          :points="linePath"
          fill="none"
          stroke="#2563eb"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <g v-for="(point, i) in points" :key="i">
          <line
            :x1="point.x"
            :y1="point.y"
            :x2="point.x"
            :y2="point.leaderY"
            stroke="rgba(37,99,235,.34)"
            stroke-width="1.5"
            stroke-dasharray="3 3"
          />
          <rect
            :x="point.boxX"
            :y="point.boxY"
            :width="point.boxW"
            :height="point.boxH"
            rx="8"
            fill="#ffffff"
            stroke="rgba(37,99,235,.28)"
          />
          <text
            :x="point.boxX + point.boxW / 2"
            :y="point.boxY + 16"
            text-anchor="middle"
            font-size="11"
            font-weight="700"
            fill="rgba(15,23,42,.78)"
          >
            {{ point.valueLabel }}
          </text>
          <circle :cx="point.x" :cy="point.y" r="5" fill="#2563eb" stroke="#ffffff" stroke-width="2" />
          <text
            v-for="(line, li) in point.labelLines"
            :key="`${i}-${li}`"
            :x="point.x"
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
      <div v-for="(item, i) in data" :key="i" class="legendRow">
        <div class="legendSwatch" style="background: #2563eb" />
        <div>{{ item.label || `点 ${Number(i) + 1}` }}</div>
        <div>{{ item.value }}</div>
      </div>
    </div>
  </div>
</template>
