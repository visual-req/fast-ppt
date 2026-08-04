<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

type SegmentItem = {
  tag?: string;
  title: string;
  text?: string;
  percent?: number;
};

type SegmentView = SegmentItem & {
  percent: number;
  cumulative: number;
  label: string;
};

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace("%", "").trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function normalizeItem(item: unknown, index: number): SegmentItem {
  if (typeof item === "string") {
    return {
      tag: `分段 ${String.fromCharCode(65 + index)}`,
      title: item.trim() || `分段 ${index + 1}`
    };
  }
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return {
      tag: `分段 ${String.fromCharCode(65 + index)}`,
      title: `分段 ${index + 1}`
    };
  }
  const record = item as Record<string, unknown>;
  const bullets = Array.isArray(record.bullets)
    ? record.bullets.map((entry) => toText(entry)).filter(Boolean).slice(0, 1).join("")
    : "";
  return {
    tag: toText(record.tag) || `分段 ${String.fromCharCode(65 + index)}`,
    title: toText(record.title) || toText(record.name) || `分段 ${index + 1}`,
    text: toText(record.text) || bullets,
    percent: toNumber(record.percent) ?? toNumber(record.value) ?? toNumber(record.ratio)
  };
}

const eyebrow = computed(() => toText(props.slide?.eyebrow) || "Staff Bar");
const subtitle = computed(
  () =>
    toText(props.slide?.subtitle) ||
    "整体是一根横向 bar，两端做成金箍棒端头装饰，中间分割位置严格按照百分比落位。"
);

const segments = computed<SegmentView[]>(() => {
  const raw = Array.isArray(props.slide?.items)
    ? props.slide.items
    : Array.isArray(props.slide?.segments)
      ? props.slide.segments
      : [];
  const defaults: SegmentItem[] = [
    { tag: "分段 A", title: "基础投入", percent: 18 },
    { tag: "分段 B", title: "能力建设", percent: 30 },
    { tag: "分段 C", title: "协同机制", percent: 20 },
    { tag: "分段 D", title: "运营优化", percent: 32 }
  ];
  const list = (raw.length ? raw.slice(0, 4) : defaults).map((item: unknown, index: number) => normalizeItem(item, index));
  const explicit = list.every((item: SegmentItem) => typeof item.percent === "number");
  const values: number[] = explicit
    ? list.map((item: SegmentItem) => Math.max(item.percent ?? 0, 0))
    : Array.from({ length: list.length }, () => 100 / Math.max(list.length, 1));
  const total = values.reduce((sum: number, current: number) => sum + current, 0) || 1;
  let cumulative = 0;
  return list.map((item: SegmentItem, index: number) => {
    const percent = Number(((values[index] / total) * 100).toFixed(1));
    cumulative += percent;
    return {
      ...item,
      percent,
      cumulative: Number(cumulative.toFixed(1)),
      label: `${Math.round(percent)}%`
    };
  });
});

function segmentStyle(percent: number) {
  return { flexBasis: `${percent}%` };
}
</script>

<template>
  <div class="staffListRoot">
    <div class="staffListGlow staffListGlowA"></div>
    <div class="staffListGlow staffListGlowB"></div>

    <div class="staffListHeader">
      <div class="staffListEyebrow">{{ eyebrow }}</div>
      <div class="staffListSubtitle">{{ subtitle }}</div>
    </div>

    <div class="staffBarMeta">
      <div
        v-for="(item, index) in segments"
        :key="`meta-${index}`"
        class="staffBarMetaItem"
        :style="segmentStyle(item.percent)"
      >
        <div class="staffBarMetaTag">{{ item.tag }}</div>
      </div>
    </div>

    <div class="staffBarTrack">
      <div class="staffBarEnd staffBarEndLeft" aria-hidden="true">
        <span class="cap"></span>
        <span class="ring"></span>
        <span class="body"></span>
        <span class="ring"></span>
        <span class="cap"></span>
      </div>

      <div class="staffBarSegments">
        <div
          v-for="(item, index) in segments"
          :key="index"
          class="staffBarSegment"
          :class="`staffBarSegment${index + 1}`"
          :style="segmentStyle(item.percent)"
        >
          <div class="staffBarPercent">{{ item.label }}</div>
          <div class="staffBarTitle">{{ item.title }}</div>
          <div v-if="item.text" class="staffBarText">{{ item.text }}</div>
        </div>
      </div>

      <div class="staffBarEnd staffBarEndRight" aria-hidden="true">
        <span class="cap"></span>
        <span class="ring"></span>
        <span class="body"></span>
        <span class="ring"></span>
        <span class="cap"></span>
      </div>
    </div>

    <div class="staffBarMarks">
      <div class="staffBarMark">0%</div>
      <div
        v-for="(item, index) in segments.slice(0, -1)"
        :key="`mark-${index}`"
        class="staffBarMark"
      >
        {{ Math.round(item.cumulative) }}%
      </div>
      <div class="staffBarMark">100%</div>
    </div>
  </div>
</template>

<style scoped>
.staffListRoot {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.16), transparent 30%),
    radial-gradient(circle at left bottom, rgba(244, 199, 106, 0.12), transparent 28%),
    linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 20px 36px rgba(20, 61, 122, 0.08);
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  gap: 14px;
  padding: 18px 20px 20px;
}

.staffListGlow {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.staffListGlowA {
  width: 220px;
  height: 220px;
  top: -72px;
  right: -42px;
  background: radial-gradient(circle, rgba(147, 197, 253, 0.28) 0%, rgba(147, 197, 253, 0.06) 58%, transparent 74%);
}

.staffListGlowB {
  width: 180px;
  height: 180px;
  bottom: -54px;
  left: -36px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, rgba(245, 158, 11, 0.04) 58%, transparent 74%);
}

.staffListHeader,
.staffBarMeta,
.staffBarTrack,
.staffBarMarks {
  position: relative;
  z-index: 1;
}

.staffListHeader {
  display: grid;
  align-content: start;
  gap: 8px;
}

.staffListEyebrow {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(29, 111, 232, 0.12) 0%, rgba(77, 160, 255, 0.12) 100%);
  color: #1d6fe8;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.staffListSubtitle {
  max-width: 88%;
  color: #475569;
  font-size: 13px;
  line-height: 1.55;
}

.staffBarMeta,
.staffBarMarks {
  display: flex;
  align-items: stretch;
  padding: 0 98px;
}

.staffBarMetaItem,
.staffBarMark {
  min-width: 0;
}

.staffBarMetaItem {
  display: grid;
  justify-items: center;
}

.staffBarMetaTag {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(215, 227, 244, 0.96);
  color: #1d6fe8;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}

.staffBarTrack {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr) 92px;
  align-items: stretch;
  min-height: 0;
  height: 172px;
}

.staffBarSegments {
  display: flex;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-top: 1px solid rgba(191, 219, 254, 0.9);
  border-bottom: 1px solid rgba(191, 219, 254, 0.9);
  box-shadow: 0 16px 28px rgba(20, 61, 122, 0.08);
}

.staffBarSegment {
  min-width: 0;
  height: 100%;
  padding: 18px 12px 16px;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 8px;
  text-align: center;
}

.staffBarSegment + .staffBarSegment {
  border-left: 2px solid rgba(255, 255, 255, 0.32);
}

.staffBarSegment1 { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); }
.staffBarSegment2 { background: linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%); }
.staffBarSegment3 { background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%); }
.staffBarSegment4 { background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%); }

.staffBarPercent {
  color: #143d7a;
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}

.staffBarTitle {
  color: #143d7a;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
}

.staffBarText {
  color: #475569;
  font-size: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.staffBarEnd {
  display: grid;
  grid-template-columns: 18px 12px 32px 12px 18px;
  align-items: stretch;
  min-height: 0;
}

.staffBarEndRight {
  direction: rtl;
}

.staffBarEnd span {
  position: relative;
  height: 100%;
}

.staffBarEnd .cap,
.staffBarEnd .ring,
.staffBarEnd .body {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.24), 0 14px 22px rgba(146, 64, 14, 0.12);
}

.staffBarEnd .cap {
  background: linear-gradient(180deg, #fde68a 0%, #f59e0b 46%, #b45309 100%);
}

.staffBarEnd .ring {
  background: linear-gradient(180deg, #fef3c7 0%, #fbbf24 44%, #b45309 100%);
}

.staffBarEnd .body {
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.24) 0 8%, transparent 8% 92%, rgba(255, 255, 255, 0.16) 92% 100%),
    linear-gradient(180deg, #b91c1c 0%, #dc2626 16%, #991b1b 52%, #dc2626 84%, #b91c1c 100%);
}

.staffBarEnd .body::before,
.staffBarEnd .body::after {
  content: "";
  position: absolute;
  left: 4px;
  right: 4px;
  height: 2px;
  background: rgba(251, 191, 36, 0.58);
}

.staffBarEnd .body::before {
  top: 26%;
}

.staffBarEnd .body::after {
  bottom: 26%;
}

.staffBarMarks {
  justify-content: space-between;
  color: #64748b;
  font-size: 13px;
}
</style>
