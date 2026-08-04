<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

type BoardCard = {
  owner?: string;
  task?: string;
  progress?: string | number;
  due?: string;
  note?: string;
};

type BoardColumn = {
  title?: string;
  icon?: string;
  cards?: BoardCard[];
};

const columns = computed<BoardColumn[]>(() => {
  const raw = props.slide?.columns;
  return Array.isArray(raw) ? raw.slice(0, 4) : [];
});

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toCards(value: unknown): BoardCard[] {
  return Array.isArray(value) ? value.slice(0, 4) : [];
}

function progressText(value: unknown) {
  if (typeof value === "number") return `${value}%`;
  if (typeof value === "string") return value;
  return "";
}

function iconGlyph(icon: unknown, index: number) {
  const key = typeof icon === "string" ? icon : "";
  const map: Record<string, string> = {
    todo: "○",
    doing: "◐",
    review: "◇",
    done: "✓"
  };
  return map[key] ?? ["○", "◐", "◇", "✓"][index % 4];
}
</script>

<template>
  <div class="kanbanRoot" :style="{ gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(0, 1fr))` }">
    <div v-for="(column, index) in columns" :key="index" class="kanbanColumn">
      <div class="kanbanHeader">
        <div class="kanbanHeaderTitle">{{ toText(column?.title) || `列 ${index + 1}` }}</div>
        <div class="kanbanHeaderIcon">{{ iconGlyph(column?.icon, index) }}</div>
      </div>
      <div class="kanbanCards">
        <div v-for="(card, cardIndex) in toCards(column?.cards)" :key="cardIndex" class="kanbanCard">
          <div class="kanbanOwnerRow">
            <div class="kanbanOwnerBadge"></div>
            <div class="kanbanOwnerText">{{ toText(card?.owner) || "负责人待补充" }}</div>
          </div>
          <div class="kanbanTask">{{ toText(card?.task) || "任务描述待补充" }}</div>
          <div class="kanbanMeta">
            <div v-if="progressText(card?.progress)" class="kanbanProgress">进度：{{ progressText(card?.progress) }}</div>
            <div v-if="toText(card?.due)" class="kanbanDue">截止：{{ card.due }}</div>
          </div>
          <div v-if="toText(card?.note)" class="kanbanNote">{{ card.note }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanbanRoot {
  display: grid;
  gap: 16px;
  height: 100%;
  min-height: 0;
}

.kanbanColumn {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 10px;
  padding: 10px;
  border-radius: 26px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--fppt-page-bg, #f4f7fb) 92%, white) 0%, color-mix(in srgb, var(--fppt-surface-alt, #eef4fb) 96%, white) 100%);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 80%, transparent);
}

.kanbanHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 90%, white) 0%, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 78%, #0f172a) 100%);
  color: white;
  box-shadow: 0 18px 30px rgba(20, 61, 122, 0.12);
}

.kanbanHeaderTitle {
  font-size: 18px;
  font-weight: 800;
}

.kanbanHeaderIcon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 16px;
  font-weight: 800;
}

.kanbanCards {
  min-height: 0;
  display: grid;
  gap: 10px;
  align-content: start;
  overflow: hidden;
}

.kanbanCard {
  display: grid;
  gap: 8px;
  padding: 14px 14px 12px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--fppt-surface, #ffffff) 98%, transparent);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 88%, transparent);
  box-shadow: 0 14px 24px rgba(20, 61, 122, 0.07);
}

.kanbanOwnerRow {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kanbanOwnerBadge {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--fppt-secondary, #4da0ff);
  box-shadow: 0 0 0 4px var(--fppt-secondary-soft, rgba(77, 160, 255, 0.2));
}

.kanbanOwnerText {
  font-size: 12px;
  font-weight: 700;
  color: var(--fppt-muted, #64748b);
}

.kanbanTask {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--fppt-text, #0f172a);
}

.kanbanMeta {
  display: grid;
  gap: 6px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--fppt-primary, #1d6fe8);
  font-weight: 700;
}

.kanbanDue,
.kanbanNote {
  color: var(--fppt-muted, #64748b);
}

.kanbanNote {
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .kanbanRoot {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
</style>
