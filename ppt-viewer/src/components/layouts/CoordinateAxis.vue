<script setup lang="ts">
const props = defineProps<{ slide: any }>();

type Point = {
  x: number;
  y: number;
  label?: string;
  note?: string;
  size?: number;
  color?: string;
};

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toNumber(value: unknown, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toPoints(value: unknown): Point[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((p) => ({
      x: toNumber((p as any)?.x, NaN),
      y: toNumber((p as any)?.y, NaN),
      label: toText((p as any)?.label ?? (p as any)?.name),
      note: toText((p as any)?.note),
      size: toNumber((p as any)?.size, 10),
      color: toText((p as any)?.color)
    }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
}

function minMax(vals: number[]) {
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return { min: 0, max: min === max ? min + 1 : 1 };
  return { min, max };
}

function scale(v: number, min: number, max: number, outMin: number, outMax: number) {
  if (max === min) return (outMin + outMax) / 2;
  return outMin + ((v - min) / (max - min)) * (outMax - outMin);
}

const xLabel = () => toText(props.slide?.x_label ?? props.slide?.xAxis ?? props.slide?.x_axis) || "X 轴";
const yLabel = () => toText(props.slide?.y_label ?? props.slide?.yAxis ?? props.slide?.y_axis) || "Y 轴";
</script>

<template>
  <div style="position: relative; width: 100%; height: 100%">
    <svg width="100%" height="100%" viewBox="0 0 1200 640" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(15,23,42,0.06)"/>
          <stop offset="100%" stop-color="rgba(15,23,42,0.03)"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1200" height="640" fill="url(#gridFade)" rx="18"/>

      <g stroke="rgba(15,23,42,0.10)" stroke-width="2">
        <line x1="140" y1="540" x2="1080" y2="540"/>
        <line x1="140" y1="120" x2="140" y2="540"/>
      </g>

      <g stroke="rgba(15,23,42,0.08)" stroke-width="1">
        <line v-for="i in 5" :key="'h'+i" x1="140" :y1="540 - i * 84" x2="1080" :y2="540 - i * 84"/>
        <line v-for="i in 5" :key="'v'+i" :x1="140 + i * 156" y1="120" :x2="140 + i * 156" y2="540"/>
      </g>

      <g>
        <template v-if="toPoints(slide?.points ?? slide?.items ?? slide?.data).length">
          <template
            v-for="(p, idx) in toPoints(slide?.points ?? slide?.items ?? slide?.data)"
            :key="idx"
          >
            <circle
              :cx="
                scale(
                  p.x,
                  minMax(toPoints(slide?.points ?? slide?.items ?? slide?.data).map((x) => x.x)).min,
                  minMax(toPoints(slide?.points ?? slide?.items ?? slide?.data).map((x) => x.x)).max,
                  160,
                  1060
                )
              "
              :cy="
                scale(
                  p.y,
                  minMax(toPoints(slide?.points ?? slide?.items ?? slide?.data).map((x) => x.y)).min,
                  minMax(toPoints(slide?.points ?? slide?.items ?? slide?.data).map((x) => x.y)).max,
                  520,
                  140
                )
              "
              :r="Math.max(6, Math.min(18, p.size || 10))"
              :fill="p.color || '#2563eb'"
              opacity="0.85"
            />
            <text
              :x="
                scale(
                  p.x,
                  minMax(toPoints(slide?.points ?? slide?.items ?? slide?.data).map((x) => x.x)).min,
                  minMax(toPoints(slide?.points ?? slide?.items ?? slide?.data).map((x) => x.x)).max,
                  160,
                  1060
                ) + 14
              "
              :y="
                scale(
                  p.y,
                  minMax(toPoints(slide?.points ?? slide?.items ?? slide?.data).map((x) => x.y)).min,
                  minMax(toPoints(slide?.points ?? slide?.items ?? slide?.data).map((x) => x.y)).max,
                  520,
                  140
                ) + 6
              "
              font-size="18"
              font-weight="800"
              fill="rgba(15,23,42,0.82)"
            >
              {{ p.label || `点 ${idx + 1}` }}
            </text>
          </template>
        </template>
        <template v-else>
          <text x="600" y="340" text-anchor="middle" font-size="18" font-weight="800" fill="rgba(15,23,42,0.45)">
            在 slide.points 里提供点数据（x/y/label）
          </text>
        </template>
      </g>
    </svg>

    <div
      style="
        position: absolute;
        left: 50%;
        bottom: 18px;
        transform: translateX(-50%);
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 800;
        color: rgba(15, 23, 42, 0.72);
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid rgba(15, 23, 42, 0.10);
        border-radius: 999px;
      "
    >
      {{ xLabel() }}
    </div>

    <div
      style="
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%) rotate(-90deg);
        transform-origin: left top;
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 800;
        color: rgba(15, 23, 42, 0.72);
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid rgba(15, 23, 42, 0.10);
        border-radius: 999px;
      "
    >
      {{ yLabel() }}
    </div>
  </div>
</template>

