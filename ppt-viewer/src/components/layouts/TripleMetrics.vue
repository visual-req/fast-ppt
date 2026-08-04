<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type MetricItem = {
  label?: string;
  value?: string | number;
  unit?: string;
  note?: string;
  tag?: string;
};

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asMetric(item: unknown, index: number): MetricItem {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return { label: `指标 ${index + 1}`, value: "-" };
  }
  const record = item as Record<string, unknown>;
  return {
    label: toText(record.label) || toText(record.title) || `指标 ${index + 1}`,
    value: typeof record.value === "number" || typeof record.value === "string" ? record.value : "-",
    unit: toText(record.unit),
    note: toText(record.note) || toText(record.text),
    tag: toText(record.tag)
  };
}

const metrics = computed<MetricItem[]>(() => {
  const raw = Array.isArray(props.slide?.metrics)
    ? props.slide.metrics
    : Array.isArray(props.slide?.cards)
      ? props.slide.cards
      : Array.isArray(props.slide?.items)
        ? props.slide.items
        : [];
  return Array.from({ length: 3 }, (_, index) => asMetric(raw[index], index));
});

function metricClass(index: number): string {
  return index === 1 ? "tripleMetricCircleCenter" : index === 0 ? "tripleMetricCircleLeft" : "tripleMetricCircleRight";
}
</script>

<template>
  <Card v-if="!metrics.length" title="无数据" />
  <div v-else class="tripleMetricsRoot">
    <div class="tripleMetricsGlow tripleMetricsGlowLeft"></div>
    <div class="tripleMetricsGlow tripleMetricsGlowCenter"></div>
    <div class="tripleMetricsGlow tripleMetricsGlowRight"></div>

    <div class="tripleMetricsTrack"></div>

    <div
      v-for="(item, index) in metrics"
      :key="index"
      class="tripleMetricCircle"
      :class="metricClass(index)"
    >
      <div class="tripleMetricInner">
        <div v-if="toText(item.tag)" class="tripleMetricTag">{{ item.tag }}</div>
        <div class="tripleMetricLabel">{{ item.label || `指标 ${index + 1}` }}</div>
        <div class="tripleMetricValueRow">
          <span class="tripleMetricValue">{{ item.value ?? "-" }}</span>
          <span v-if="toText(item.unit)" class="tripleMetricUnit">{{ item.unit }}</span>
        </div>
        <div v-if="toText(item.note)" class="tripleMetricNote">{{ item.note }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tripleMetricsRoot {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.14), transparent 30%),
    linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 20px 36px rgba(20, 61, 122, 0.08);
}

.tripleMetricsGlow {
  position: absolute;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(147, 197, 253, 0.24) 0%, rgba(147, 197, 253, 0.08) 56%, transparent 76%);
}

.tripleMetricsGlowLeft,
.tripleMetricsGlowRight {
  width: 24%;
  aspect-ratio: 1;
  top: 24%;
}

.tripleMetricsGlowLeft {
  left: 8%;
}

.tripleMetricsGlowRight {
  right: 8%;
}

.tripleMetricsGlowCenter {
  width: 30%;
  aspect-ratio: 1;
  left: 50%;
  top: 18%;
  transform: translateX(-50%);
}

.tripleMetricsTrack {
  position: absolute;
  left: 14%;
  right: 14%;
  top: 50%;
  height: 10px;
  transform: translateY(-50%);
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(77, 160, 255, 0.18) 0%, rgba(29, 111, 232, 0.24) 100%);
}

.tripleMetricCircle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 248, 255, 0.98) 100%);
  border: 1px solid rgba(191, 219, 254, 0.96);
  box-shadow: 0 24px 38px rgba(20, 61, 122, 0.12);
  display: grid;
  place-items: center;
  text-align: center;
}

.tripleMetricCircleLeft {
  left: 22%;
  width: 24%;
  aspect-ratio: 1;
}

.tripleMetricCircleCenter {
  left: 50%;
  width: 30%;
  aspect-ratio: 1;
}

.tripleMetricCircleRight {
  left: 78%;
  width: 24%;
  aspect-ratio: 1;
}

.tripleMetricInner {
  width: 74%;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 10px;
}

.tripleMetricTag {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(29, 111, 232, 0.08);
  color: #1d6fe8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.tripleMetricLabel {
  color: #143d7a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tripleMetricValueRow {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
}

.tripleMetricValue {
  color: #0f172a;
  font-size: 42px;
  font-weight: 900;
  line-height: 1;
}

.tripleMetricCircleCenter .tripleMetricValue {
  font-size: 54px;
}

.tripleMetricUnit {
  color: rgba(15, 23, 42, 0.48);
  font-size: 15px;
  font-weight: 700;
}

.tripleMetricNote {
  color: #475569;
  font-size: 12px;
  line-height: 1.55;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
