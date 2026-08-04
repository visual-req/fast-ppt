<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type StageItem = {
  title?: string;
  text?: string;
  tag?: string;
  bullets?: string[];
};

const heights = [38, 50, 64, 78, 90];

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toText(item)).filter(Boolean).slice(0, 2);
}

function asItem(item: unknown, index: number): StageItem {
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

const stages = computed<StageItem[]>(() => {
  const raw = Array.isArray(props.slide?.stages)
    ? props.slide.stages
    : Array.isArray(props.slide?.steps)
      ? props.slide.steps
      : Array.isArray(props.slide?.phases)
        ? props.slide.phases
        : Array.isArray(props.slide?.items)
          ? props.slide.items
          : [];
  return raw.slice(0, 5).map((item: unknown, index: number) => asItem(item, index));
});

function itemText(item: StageItem): string {
  return toText(item.text) || toStrings(item.bullets).join(" / ");
}
</script>

<template>
  <Card v-if="!stages.length" title="无数据" />
  <div v-else class="stageStaircaseRoot" :style="{ '--stage-count': stages.length }">
    <div class="stageStaircaseBase"></div>
    <div class="stageStaircaseGrid">
      <div
        v-for="(item, index) in stages"
        :key="index"
        class="stageStaircaseStep"
        :style="{ height: `${heights[index] ?? heights[heights.length - 1]}%` }"
      >
        <div class="stageStaircaseCap"></div>
        <div class="stageStaircaseCard">
          <div v-if="toText(item.tag)" class="stageStaircaseTag">{{ item.tag }}</div>
          <div class="stageStaircaseTitle">{{ toText(item.title) || `阶段 ${index + 1}` }}</div>
          <div v-if="itemText(item)" class="stageStaircaseText">{{ itemText(item) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stageStaircaseRoot {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.14), transparent 28%),
    linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 20px 36px rgba(20, 61, 122, 0.08);
}

.stageStaircaseBase {
  position: absolute;
  left: 6%;
  right: 6%;
  bottom: 8%;
  height: 16px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(77, 160, 255, 0.18) 0%, rgba(29, 111, 232, 0.24) 100%);
}

.stageStaircaseGrid {
  position: relative;
  z-index: 1;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(var(--stage-count), minmax(0, 1fr));
  gap: 16px;
  align-items: end;
  padding: 8% 6% 10%;
}

.stageStaircaseStep {
  min-width: 0;
  min-height: 120px;
  display: grid;
  grid-template-rows: 14px minmax(0, 1fr);
  gap: 0;
}

.stageStaircaseCap {
  border-radius: 18px 18px 0 0;
  background: linear-gradient(90deg, #4da0ff 0%, #1d6fe8 100%);
}

.stageStaircaseCard {
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 18px 18px 16px;
  border-radius: 0 0 22px 22px;
  background: linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
  border: 1px solid rgba(215, 227, 244, 0.92);
  box-shadow: 0 20px 34px rgba(20, 61, 122, 0.08);
}

.stageStaircaseTag {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  width: fit-content;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(29, 111, 232, 0.08);
  color: #1d6fe8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.stageStaircaseTitle {
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

.stageStaircaseText {
  color: #475569;
  font-size: 13px;
  line-height: 1.55;
  display: -webkit-box;
  line-clamp: 4;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
