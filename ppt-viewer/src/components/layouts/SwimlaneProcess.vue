<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type Lane = { name: string; steps: Array<string | { text?: string }> };

const lanes = computed<Lane[]>(() => (Array.isArray(props.slide?.lanes) ? props.slide.lanes : []));
const maxSteps = computed(() => Math.max(0, ...lanes.value.map((l) => (Array.isArray(l.steps) ? l.steps.length : 0))));
const headers = computed<string[]>(() => {
  const raw = props.slide?.headers;
  return Array.isArray(raw) ? raw.map((x) => String(x ?? "")).slice(0, maxSteps.value) : [];
});
const boardStyle = computed(() => ({
  gridTemplateRows: `auto repeat(${Math.max(1, lanes.value.length)}, minmax(0, 1fr))`
}));

function stepText(step: any): string {
  if (typeof step === "string") return step;
  if (step && typeof step === "object" && typeof step.text === "string") return step.text;
  return "";
}
</script>

<template>
  <Card v-if="!lanes.length" title="无数据" />
  <div v-else class="swimlaneBoard" :style="boardStyle">
    <div class="swimlaneHeader">
      <div class="swimlaneCorner">角色 / 阶段</div>
      <div class="swimlaneHeaderSteps" :style="{ gridTemplateColumns: `repeat(${maxSteps}, minmax(0, 1fr))` }">
        <div v-for="i in maxSteps" :key="i" class="swimlaneHeaderCell">{{ headers[i - 1] || `步骤 ${i}` }}</div>
      </div>
    </div>

    <div v-for="(l, li) in lanes" :key="li" class="swimlaneRow">
      <div class="swimlaneLaneName">{{ l.name || `泳道 ${Number(li) + 1}` }}</div>
      <div class="swimlaneCells" :style="{ gridTemplateColumns: `repeat(${maxSteps}, minmax(0, 1fr))` }">
        <div v-for="i in maxSteps" :key="`c-${li}-${i}`" class="swimlaneCell" :class="{ swimlaneCellEmpty: !stepText(l.steps?.[i - 1]) }">
          <div v-if="stepText(l.steps?.[i - 1])" class="swimlaneCellArrow"></div>
          <div class="swimlaneCellText">{{ stepText(l.steps?.[i - 1]) || " " }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.swimlaneBoard {
  display: grid;
  gap: 10px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.swimlaneHeader,
.swimlaneRow {
  display: grid;
  grid-template-columns: 172px 1fr;
  gap: 10px;
  min-height: 0;
}

.swimlaneCorner,
.swimlaneLaneName {
  border-radius: 20px;
  display: grid;
  place-items: center;
  min-height: 0;
  padding: 12px 10px;
  text-align: center;
  line-height: 1.35;
}

.swimlaneCorner {
  background: linear-gradient(180deg, #f2f6fb 0%, #e9f0f8 100%);
  color: #143d7a;
  font-size: 13px;
  font-weight: 800;
}

.swimlaneLaneName {
  background: linear-gradient(135deg, #1f4f97 0%, #123b7a 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 16px 34px rgba(20, 61, 122, 0.14);
}

.swimlaneHeaderSteps,
.swimlaneCells {
  display: grid;
  gap: 10px;
  min-height: 0;
}

.swimlaneHeaderCell {
  min-height: 0;
  display: grid;
  place-items: center;
  padding: 0 10px;
  border-radius: 16px;
  background: linear-gradient(90deg, #4da0ff 0%, #1d6fe8 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 14px 28px rgba(29, 111, 232, 0.18);
}

.swimlaneCell {
  position: relative;
  min-height: 0;
  height: 100%;
  padding: 12px 12px 12px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 16px 30px rgba(20, 61, 122, 0.08);
  display: grid;
  align-items: center;
  overflow: hidden;
}

.swimlaneCellArrow {
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 14px;
  background: linear-gradient(180deg, #4da0ff 0%, #1d6fe8 100%);
  clip-path: polygon(0 0, 100% 0, 100% 50%, 0 100%);
}

.swimlaneCellText {
  font-size: 12px;
  line-height: 1.35;
  color: #334155;
  font-weight: 700;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.swimlaneCellEmpty {
  background: linear-gradient(180deg, rgba(248, 251, 255, 0.68) 0%, rgba(243, 248, 255, 0.78) 100%);
  border-style: dashed;
  box-shadow: none;
}

.swimlaneCellEmpty .swimlaneCellText {
  color: rgba(148, 163, 184, 0.72);
}

@media (max-width: 700px) {
  .swimlaneBoard {
    gap: 8px;
  }

  .swimlaneHeader,
  .swimlaneRow {
    grid-template-columns: 122px 1fr;
    gap: 8px;
  }

  .swimlaneCorner,
  .swimlaneLaneName {
    border-radius: 14px;
    padding: 8px 8px;
    font-size: 12px;
  }

  .swimlaneHeaderSteps,
  .swimlaneCells {
    gap: 8px;
  }

  .swimlaneHeaderCell {
    border-radius: 12px;
    font-size: 11px;
  }

  .swimlaneCell {
    padding: 10px 10px 10px 14px;
    border-radius: 14px;
  }

  .swimlaneCellArrow {
    top: 10px;
    bottom: 10px;
    width: 12px;
  }

  .swimlaneCellText {
    font-size: 11px;
    line-height: 1.28;
    line-clamp: 2;
    -webkit-line-clamp: 2;
  }
}
</style>
