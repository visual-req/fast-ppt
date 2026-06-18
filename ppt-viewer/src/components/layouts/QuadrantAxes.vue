<script setup lang="ts">
import Bullets from "./Bullets.vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toQuadrants(value: unknown): any[] {
  return Array.isArray(value) ? value.slice(0, 4) : [];
}

function placeholders() {
  return Array.from({ length: 4 }).map((_, i) => ({ title: `象限 ${i + 1}`, bullets: [] }));
}

const xLabel = () => toText(props.slide?.x_label ?? props.slide?.xAxis ?? props.slide?.x_axis) || "X 轴";
const yLabel = () => toText(props.slide?.y_label ?? props.slide?.yAxis ?? props.slide?.y_axis) || "Y 轴";
</script>

<template>
  <div style="position: relative; height: 100%">
    <div class="grid2" style="height: 100%">
      <Card
        v-for="(q, i) in (toQuadrants(slide?.quadrants).length ? toQuadrants(slide?.quadrants) : placeholders())"
        :key="i"
        :title="q?.title || q?.name || `象限 ${Number(i) + 1}`"
      >
        <Bullets :items="q?.bullets" />
      </Card>
    </div>
    <div
      style="
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 2px;
        transform: translateX(-1px);
        background: rgba(15, 23, 42, 0.08);
        border-radius: 999px;
        pointer-events: none;
      "
    ></div>
    <div
      style="
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 2px;
        transform: translateY(-1px);
        background: rgba(15, 23, 42, 0.08);
        border-radius: 999px;
        pointer-events: none;
      "
    ></div>
    <div
      style="
        position: absolute;
        left: 50%;
        bottom: -2px;
        transform: translateX(-50%);
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 800;
        color: rgba(15, 23, 42, 0.72);
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 999px;
        pointer-events: none;
      "
    >
      {{ xLabel() }}
    </div>
    <div
      style="
        position: absolute;
        left: -2px;
        top: 50%;
        transform: translateY(-50%) rotate(-90deg);
        transform-origin: left top;
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 800;
        color: rgba(15, 23, 42, 0.72);
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 999px;
        pointer-events: none;
      "
    >
      {{ yLabel() }}
    </div>
  </div>
</template>
