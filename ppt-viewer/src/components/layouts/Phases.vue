<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

type PhaseItem = {
  title?: string;
  bullets?: string[];
  text?: string;
  gate?: string;
};

const phases = computed<PhaseItem[]>(() => (Array.isArray(props.slide?.phases) ? props.slide.phases : []));

function toBullets(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item ?? "")).filter(Boolean) : [];
}
</script>

<template>
  <div class="phasesFlow">
    <div v-for="(item, index) in phases" :key="index" class="phaseCardWrap">
      <div class="phaseCard">
        <div class="phaseBadge">阶段 {{ index + 1 }}</div>
        <div v-if="item?.title" class="phaseTitle">{{ item.title }}</div>
        <div v-if="item?.text" class="phaseText">{{ item.text }}</div>
        <ul v-if="toBullets(item?.bullets).length" class="phaseBullets">
          <li v-for="(bullet, bulletIndex) in toBullets(item?.bullets)" :key="bulletIndex">{{ bullet }}</li>
        </ul>
        <div v-if="item?.gate" class="phaseGate">{{ item.gate }}</div>
      </div>
      <div v-if="index < phases.length - 1" class="phaseArrow" aria-hidden="true"></div>
    </div>
  </div>
</template>
