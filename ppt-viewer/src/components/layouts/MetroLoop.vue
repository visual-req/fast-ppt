<script setup lang="ts">
import { computed } from "vue";
import { getLayoutIconSvg } from "../../lib/layoutIcons";

const props = defineProps<{ slide: any }>();

type StopItem = {
  title?: string;
  text?: string;
  icon?: string;
  line?: string;
  color?: string;
};

type MetricItem = {
  label?: string;
  value?: string | number;
  note?: string;
};

const center = computed(() => {
  const raw = props.slide?.center;
  return raw && typeof raw === "object" ? raw : {};
});

const stops = computed<StopItem[]>(() => {
  const raw = props.slide?.stops;
  return Array.isArray(raw) ? raw.slice(0, 8) : [];
});

const metrics = computed<MetricItem[]>(() => {
  const raw = props.slide?.metrics;
  return Array.isArray(raw) ? raw.slice(0, 4) : [];
});

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function lineColor(stop: StopItem, index: number): string {
  if (typeof stop.color === "string" && stop.color.trim()) return stop.color;
  const palette: Record<string, string> = {
    blue: "#2563eb",
    green: "#10b981",
    orange: "#f97316",
    red: "#ef4444",
    purple: "#8b5cf6",
    cyan: "#06b6d4"
  };
  const fallback = ["#2563eb", "#10b981", "#f97316", "#8b5cf6", "#ef4444", "#06b6d4"];
  const key = typeof stop.line === "string" ? stop.line : "";
  return palette[key] ?? fallback[index % fallback.length];
}

const positionedStops = computed(() => {
  const list = stops.value;
  const presets = [
    { x: 18, y: 25, cardLeft: -104, cardTop: -98 },
    { x: 42, y: 25, cardLeft: -96, cardTop: -98 },
    { x: 77, y: 42, cardLeft: 20, cardTop: -28 },
    { x: 20, y: 75, cardLeft: -108, cardTop: 28 },
    { x: 63, y: 75, cardLeft: -80, cardTop: 28 },
    { x: 86, y: 75, cardLeft: 18, cardTop: 28 }
  ];

  return list.map((stop, index) => {
    const preset = presets[index] ?? presets[presets.length - 1];
    return {
      ...stop,
      index,
      x: preset.x,
      y: preset.y,
      color: lineColor(stop, index),
      cardStyle: {
        left: `${preset.cardLeft}px`,
        top: `${preset.cardTop}px`
      }
    };
  });
});
</script>

<template>
  <div class="metroLoopRoot">
    <div class="metroLoopCanvas">
      <svg class="metroLoopTrack" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="metroTrackGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#1f4f97" />
            <stop offset="100%" stop-color="#123b7a" />
          </linearGradient>
        </defs>
        <path
          d="M14 25 H76 Q87 25 87 35 V40 Q87 49 78 49 H28 Q18 49 18 60 V64 Q18 75 28 75 H86"
          fill="none"
          stroke="url(#metroTrackGrad)"
          stroke-width="5.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M14 25 H76 Q87 25 87 35 V40 Q87 49 78 49 H28 Q18 49 18 60 V64 Q18 75 28 75 H86"
          fill="none"
          stroke="#8fbaf4"
          stroke-width="0.8"
          stroke-dasharray="1.6 1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <div class="metroCenterCard">
        <div class="metroCenterTitle">{{ toText(center.title) || toText(slide?.title) || "地铁环线图" }}</div>
        <div v-if="toText(center.text)" class="metroCenterText">{{ center.text }}</div>
      </div>

      <div
        v-for="stop in positionedStops"
        :key="`${stop.index}-${stop.title}`"
        class="metroStop"
        :style="{ left: `${stop.x}%`, top: `${stop.y}%`, '--metro-color': stop.color }"
      >
        <div class="metroStopDot">
          <div v-if="getLayoutIconSvg(stop.icon)" class="metroStopIcon" v-html="getLayoutIconSvg(stop.icon)"></div>
          <div v-else class="metroStopIndex">{{ stop.index + 1 }}</div>
        </div>
        <div class="metroStopCard" :style="stop.cardStyle">
          <div class="metroStopTitle">{{ toText(stop.title) || `站点 ${stop.index + 1}` }}</div>
          <div v-if="toText(stop.text)" class="metroStopText">{{ stop.text }}</div>
        </div>
      </div>
    </div>

    <div v-if="metrics.length" class="metroMetricGrid">
      <div v-for="(metric, index) in metrics" :key="`${metric.label}-${index}`" class="metroMetricCard">
        <div class="metroMetricLabel">{{ toText(metric.label) || `指标 ${index + 1}` }}</div>
        <div class="metroMetricValue">{{ metric.value ?? "-" }}</div>
        <div v-if="toText(metric.note)" class="metroMetricNote">{{ metric.note }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.metroLoopRoot {
  height: 100%;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 14px;
}

.metroLoopCanvas {
  position: relative;
  min-height: 0;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.16), transparent 34%),
    linear-gradient(180deg, #f7faff 0%, #eef4fb 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
}

.metroLoopTrack {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.metroCenterCard {
  position: absolute;
  left: 50%;
  top: 45%;
  transform: translate(-50%, -50%);
  width: min(54%, 460px);
  padding: 20px 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 18px 36px rgba(20, 61, 122, 0.10);
  text-align: center;
}

.metroCenterTitle {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.35;
  color: #143d7a;
}

.metroCenterText {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
}

.metroStop {
  position: absolute;
  transform: translate(-50%, -50%);
}

.metroStopDot {
  width: 54px;
  height: 54px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #ffffff;
  border: 6px solid var(--metro-color);
  color: var(--metro-color);
  box-shadow: 0 16px 30px rgba(20, 61, 122, 0.12);
}

.metroStopIcon :deep(svg) {
  width: 20px;
  height: 20px;
}

.metroStopIndex {
  font-size: 16px;
  font-weight: 800;
}

.metroStopCard {
  position: absolute;
  width: 192px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 14px 28px rgba(20, 61, 122, 0.10);
}

.metroStopTitle {
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
  color: #143d7a;
}

.metroStopText {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: #475569;
}

.metroMetricGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.metroMetricCard {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 12px 26px rgba(20, 61, 122, 0.08);
}

.metroMetricLabel {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.metroMetricValue {
  margin-top: 6px;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  color: #0f172a;
}

.metroMetricNote {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.45;
  color: #64748b;
}
</style>
