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
  return raw.slice(0, 6).map((item: unknown, index: number) => asItem(item, index));
});

function itemText(item: StageItem): string {
  return toText(item.text) || toStrings(item.bullets).join(" / ");
}

function isTop(index: number): boolean {
  return index % 2 === 0;
}
</script>

<template>
  <Card v-if="!stages.length" title="无数据" />
  <div v-else class="stageZigzagRoot" :style="{ '--stage-count': stages.length }">
    <div class="stageZigzagLine"></div>
    <div class="stageZigzagGrid">
      <div
        v-for="(item, index) in stages"
        :key="index"
        class="stageZigzagNode"
        :class="{ stageZigzagNodeTop: isTop(index), stageZigzagNodeBottom: !isTop(index) }"
      >
        <div class="stageZigzagDot">{{ String(index + 1).padStart(2, "0") }}</div>
        <div class="stageZigzagStem"></div>
        <div class="stageZigzagCard">
          <div v-if="toText(item.tag)" class="stageZigzagTag">{{ item.tag }}</div>
          <div class="stageZigzagTitle">{{ toText(item.title) || `阶段 ${index + 1}` }}</div>
          <div v-if="itemText(item)" class="stageZigzagText">{{ itemText(item) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stageZigzagRoot {
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

.stageZigzagLine {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 50%;
  height: 8px;
  transform: translateY(-50%);
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(77, 160, 255, 0.16) 0%, rgba(29, 111, 232, 0.24) 100%);
}

.stageZigzagGrid {
  position: relative;
  z-index: 1;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(var(--stage-count), minmax(0, 1fr));
  gap: 12px;
  padding: 6% 5%;
}

.stageZigzagNode {
  min-width: 0;
  display: grid;
  justify-items: center;
}

.stageZigzagNodeTop {
  grid-template-rows: minmax(0, 1fr) 42px 52px auto;
}

.stageZigzagNodeBottom {
  grid-template-rows: auto 52px 42px minmax(0, 1fr);
}

.stageZigzagDot {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #4da0ff 0%, #1d6fe8 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 14px 24px rgba(29, 111, 232, 0.18);
}

.stageZigzagStem {
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(96, 165, 250, 0.2) 0%, rgba(29, 111, 232, 0.55) 100%);
}

.stageZigzagNodeTop .stageZigzagStem {
  align-self: end;
  height: 52px;
}

.stageZigzagNodeBottom .stageZigzagStem {
  align-self: start;
  height: 52px;
}

.stageZigzagCard {
  min-width: 0;
  width: 100%;
  display: grid;
  align-content: start;
  gap: 8px;
  padding: 16px 16px 14px;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
  border: 1px solid rgba(215, 227, 244, 0.92);
  box-shadow: 0 18px 32px rgba(20, 61, 122, 0.08);
}

.stageZigzagTag {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  width: fit-content;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(29, 111, 232, 0.08);
  color: #1d6fe8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.stageZigzagTitle {
  color: #143d7a;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.3;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stageZigzagText {
  color: #475569;
  font-size: 12px;
  line-height: 1.55;
  display: -webkit-box;
  line-clamp: 4;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
