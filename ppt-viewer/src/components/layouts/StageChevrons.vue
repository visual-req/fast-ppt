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
  <div v-else class="stageChevronsRoot" :style="{ '--stage-count': stages.length }">
    <div v-for="(item, index) in stages" :key="index" class="stageChevronColumn">
      <div class="stageChevron" :class="`stageChevron-${index + 1}`">
        <div class="stageChevronInner">
          <div class="stageChevronTitle">{{ toText(item.title) || `阶段 ${index + 1}` }}</div>
        </div>
      </div>
      <div class="stageChevronBox">
        <div v-if="toText(item.tag)" class="stageChevronTag">{{ item.tag }}</div>
        <div class="stageChevronBoxTitle">{{ toText(item.title) || `阶段 ${index + 1}` }}</div>
        <div v-if="itemText(item)" class="stageChevronText">{{ itemText(item) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stageChevronsRoot {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(var(--stage-count), minmax(0, 1fr));
  grid-template-rows: 122px minmax(0, 1fr);
  column-gap: 0;
  row-gap: 16px;
  align-items: stretch;
}

.stageChevronColumn {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: 122px minmax(0, 1fr);
}

.stageChevron {
  position: relative;
  min-width: 0;
  margin-right: -18px;
  clip-path: polygon(0 0, calc(100% - 26px) 0, 100% 50%, calc(100% - 26px) 100%, 0 100%, 26px 50%);
  box-shadow: 0 16px 26px rgba(20, 61, 122, 0.08);
  display: grid;
  place-items: center;
  padding: 20px 34px 20px 42px;
  z-index: 2;
}

.stageChevron:first-child {
  clip-path: polygon(0 0, calc(100% - 26px) 0, 100% 50%, calc(100% - 26px) 100%, 0 100%);
  padding-left: 26px;
}

.stageChevron:last-child {
  margin-right: 0;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 26px 50%);
}

.stageChevron-1 { background: linear-gradient(135deg, #eef6ff 0%, #dbeafe 100%); }
.stageChevron-2 { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); }
.stageChevron-3 { background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%); }
.stageChevron-4 { background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%); }
.stageChevron-5 { background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%); }

.stageChevronTitle {
  color: #143d7a;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.28;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stageChevronBox {
  min-width: 0;
  min-height: 0;
  margin-right: 14px;
  padding: 18px 18px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 16px 28px rgba(20, 61, 122, 0.08);
  overflow: hidden;
}

.stageChevronColumn:last-child .stageChevronBox {
  margin-right: 0;
}

.stageChevronTag {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  width: fit-content;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(29, 111, 232, 0.08);
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.stageChevronBoxTitle {
  margin-top: 10px;
  color: #143d7a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.35;
}

.stageChevronText {
  margin-top: 8px;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
