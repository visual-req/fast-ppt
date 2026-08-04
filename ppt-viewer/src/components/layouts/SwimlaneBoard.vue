<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type LaneItem = {
  title?: string;
  text?: string;
  tag?: string;
};

type Lane = {
  name?: string;
  note?: string;
  items?: LaneItem[];
};

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toItems(value: unknown): LaneItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return { title: item };
      if (item && typeof item === "object" && !Array.isArray(item)) return item as LaneItem;
      return {};
    })
    .filter((item) => toText(item.title) || toText(item.text) || toText(item.tag))
    .slice(0, 4);
}

const lanes = computed<Lane[]>(() => {
  const raw = props.slide?.lanes;
  return Array.isArray(raw) ? raw.slice(0, 4) : [];
});

function laneItems(lane: Lane): LaneItem[] {
  return toItems(lane?.items);
}
</script>

<template>
  <Card v-if="!lanes.length" title="无数据" />
  <div v-else class="swimlaneBoardRoot" :style="{ gridTemplateRows: `repeat(${Math.max(lanes.length, 1)}, minmax(0, 1fr))` }">
    <div v-for="(lane, index) in lanes" :key="index" class="swimlaneBoardLane">
      <div class="swimlaneBoardLabel">
        <div class="swimlaneBoardIndex">{{ String(index + 1).padStart(2, "0") }}</div>
        <div class="swimlaneBoardName">{{ toText(lane.name) || `泳道 ${index + 1}` }}</div>
        <div v-if="toText(lane.note)" class="swimlaneBoardNote">{{ lane.note }}</div>
      </div>

      <div class="swimlaneBoardTrack">
        <div class="swimlaneBoardLine"></div>
        <div class="swimlaneBoardItems" :style="{ gridTemplateColumns: `repeat(${Math.max(laneItems(lane).length, 1)}, minmax(0, 1fr))` }">
          <div v-for="(item, itemIndex) in laneItems(lane)" :key="`${index}-${itemIndex}`" class="swimlaneBoardItem">
            <div v-if="toText(item.tag)" class="swimlaneBoardTag">{{ item.tag }}</div>
            <div class="swimlaneBoardItemTitle">{{ toText(item.title) || `动作 ${itemIndex + 1}` }}</div>
            <div v-if="toText(item.text)" class="swimlaneBoardItemText">{{ item.text }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.swimlaneBoardRoot {
  height: 100%;
  min-height: 0;
  display: grid;
  gap: 14px;
}

.swimlaneBoardLane {
  display: grid;
  grid-template-columns: 228px minmax(0, 1fr);
  gap: 16px;
  min-height: 0;
}

.swimlaneBoardLabel {
  position: relative;
  min-height: 0;
  padding: 18px 20px 18px 30px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 255, 0.98) 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 18px 34px rgba(20, 61, 122, 0.08);
}

.swimlaneBoardLabel::before {
  content: "";
  position: absolute;
  left: 0;
  top: 18px;
  bottom: 18px;
  width: 14px;
  border-radius: 999px;
  background: linear-gradient(180deg, #4da0ff 0%, #1d6fe8 100%);
}

.swimlaneBoardIndex {
  display: inline-grid;
  place-items: center;
  min-width: 56px;
  padding: 5px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #4da0ff 0%, #1d6fe8 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
}

.swimlaneBoardName {
  margin-top: 14px;
  color: #143d7a;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
}

.swimlaneBoardNote {
  margin-top: 8px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

.swimlaneBoardTrack {
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  padding: 18px 0;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.12), transparent 28%),
    linear-gradient(180deg, #f8fbff 0%, #f3f8ff 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
}

.swimlaneBoardLine {
  position: absolute;
  left: 28px;
  right: 28px;
  top: 50%;
  height: 8px;
  border-radius: 999px;
  background: rgba(188, 212, 245, 0.88);
  transform: translateY(-50%);
}

.swimlaneBoardItems {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 14px;
  min-height: 100%;
  padding: 0 28px;
}

.swimlaneBoardItem {
  align-self: center;
  min-width: 0;
  min-height: 88px;
  padding: 16px 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 18px 30px rgba(20, 61, 122, 0.08);
}

.swimlaneBoardTag {
  color: #1d6fe8;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.swimlaneBoardItemTitle {
  margin-top: 8px;
  color: #143d7a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
}

.swimlaneBoardItemText {
  margin-top: 6px;
  color: #475569;
  font-size: 14px;
  line-height: 1.45;
}

@media (max-width: 1180px) {
  .swimlaneBoardLane {
    grid-template-columns: 192px minmax(0, 1fr);
    gap: 12px;
  }

  .swimlaneBoardLabel {
    padding: 16px 16px 16px 26px;
  }

  .swimlaneBoardName {
    font-size: 18px;
  }

  .swimlaneBoardNote,
  .swimlaneBoardItemText {
    font-size: 12px;
  }

  .swimlaneBoardItemTitle {
    font-size: 16px;
  }
}
</style>
