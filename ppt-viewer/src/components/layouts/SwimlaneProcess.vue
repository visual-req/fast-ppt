<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type Lane = { name: string; steps: Array<string | { text?: string }> };

const lanes = computed<Lane[]>(() => (Array.isArray(props.slide?.lanes) ? props.slide.lanes : []));
const maxSteps = computed(() => Math.max(0, ...lanes.value.map((l) => (Array.isArray(l.steps) ? l.steps.length : 0))));

function stepText(step: any): string {
  if (typeof step === "string") return step;
  if (step && typeof step === "object" && typeof step.text === "string") return step.text;
  return "";
}
</script>

<template>
  <Card v-if="!lanes.length" title="无数据" />
  <div v-else class="swimlaneBoard">
    <div class="swimlaneHeader">
      <div class="swimlaneCorner">泳道</div>
      <div class="swimlaneHeaderSteps" :style="{ gridTemplateColumns: `repeat(${maxSteps}, minmax(0, 1fr))` }">
        <div v-for="i in maxSteps" :key="i" class="swimlaneHeaderCell">步骤 {{ i }}</div>
      </div>
    </div>

    <div v-for="(l, li) in lanes" :key="li" class="swimlaneRow">
      <div class="swimlaneLaneName">{{ l.name || `泳道 ${Number(li) + 1}` }}</div>
      <div class="swimlaneCells" :style="{ gridTemplateColumns: `repeat(${maxSteps}, minmax(0, 1fr))` }">
        <div v-for="i in maxSteps" :key="`c-${li}-${i}`" class="swimlaneCell">
          {{ stepText(l.steps?.[i - 1]) || " " }}
        </div>
      </div>
    </div>
  </div>
</template>
