<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

type StepItem = {
  title?: string;
  bullets?: string[];
  text?: string;
};

const steps = computed<StepItem[]>(() => (Array.isArray(props.slide?.steps) ? props.slide.steps : []));

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toBullets(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item ?? "")).filter(Boolean) : [];
}
</script>

<template>
  <div class="stepsFlow">
    <div v-for="(item, index) in steps" :key="index" class="stepCardWrap">
      <div class="stepCard">
        <div class="stepBadge">步骤 {{ index + 1 }}</div>
        <div v-if="item?.title" class="stepTitle">{{ item.title }}</div>
        <div v-if="item?.text" class="stepText">{{ item.text }}</div>
        <ul v-if="toBullets(item?.bullets).length" class="stepBullets">
          <li v-for="(bullet, bulletIndex) in toBullets(item?.bullets)" :key="bulletIndex">{{ bullet }}</li>
        </ul>
      </div>
      <div v-if="index < steps.length - 1" class="stepArrow" aria-hidden="true"></div>
    </div>
  </div>
</template>
