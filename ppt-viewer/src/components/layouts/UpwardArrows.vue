<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type ArrowItem = {
  title?: string;
  text?: string;
  tag?: string;
  bullets?: string[];
};

const heights = [48, 58, 70, 82];

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toText(item)).filter(Boolean).slice(0, 2);
}

function asItem(item: unknown, index: number): ArrowItem {
  if (typeof item === "string") return { title: item };
  if (!item || typeof item !== "object" || Array.isArray(item)) return { title: `阶段 ${index + 1}` };
  const record = item as Record<string, unknown>;
  return {
    title: toText(record.title) || toText(record.name) || `阶段 ${index + 1}`,
    text: toText(record.text),
    tag: toText(record.tag) || toText(record.phase),
    bullets: toStrings(record.bullets)
  };
}

const items = computed<ArrowItem[]>(() => {
  const raw = Array.isArray(props.slide?.items)
    ? props.slide.items
    : Array.isArray(props.slide?.steps)
      ? props.slide.steps
      : Array.isArray(props.slide?.stages)
        ? props.slide.stages
        : Array.isArray(props.slide?.blocks)
          ? props.slide.blocks
          : [];

  return Array.from({ length: 4 }, (_, index) => asItem(raw[index], index));
});

function itemText(item: ArrowItem): string {
  return toText(item.text) || toStrings(item.bullets).join(" / ");
}

function arrowHeight(index: number): string {
  return `${heights[index] ?? heights[heights.length - 1]}%`;
}
</script>

<template>
  <Card v-if="!items.length" title="无数据" />
  <div v-else class="upwardArrowsRoot">
    <div class="upwardArrowsBaseLine"></div>
    <div class="upwardArrowsGrid">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="upwardArrowWrap"
      >
        <div class="upwardArrow" :style="{ height: arrowHeight(index) }">
          <div class="upwardArrowInner">
            <div v-if="toText(item.tag)" class="upwardArrowTag">{{ item.tag }}</div>
            <div class="upwardArrowTitle">{{ toText(item.title) || `阶段 ${index + 1}` }}</div>
            <div v-if="itemText(item)" class="upwardArrowText">{{ itemText(item) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upwardArrowsRoot {
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

.upwardArrowsBaseLine {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: 9%;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(77, 160, 255, 0.22) 0%, rgba(29, 111, 232, 0.28) 100%);
}

.upwardArrowsGrid {
  position: relative;
  z-index: 1;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  align-items: end;
  padding: 10% 7% 12%;
}

.upwardArrowWrap {
  min-width: 0;
  height: 100%;
  display: grid;
  align-items: end;
}

.upwardArrow {
  min-width: 0;
  clip-path: polygon(0 100%, 0 18%, 24% 18%, 24% 8%, 50% 0, 76% 8%, 76% 18%, 100% 18%, 100% 100%);
  background: linear-gradient(180deg, #4da0ff 0%, #1d6fe8 100%);
  box-shadow: 0 22px 36px rgba(29, 111, 232, 0.18);
  display: grid;
  place-items: center;
  padding: 12% 9% 12%;
}

.upwardArrowInner {
  width: 100%;
  max-width: 220px;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 8px;
  text-align: center;
}

.upwardArrowTag {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.upwardArrowTitle {
  color: #ffffff;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.upwardArrowText {
  color: rgba(255, 255, 255, 0.92);
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}
</style>
