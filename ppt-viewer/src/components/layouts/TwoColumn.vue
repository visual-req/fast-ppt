<script setup lang="ts">
import { computed } from "vue";
import ContentBlock from "./ContentBlock.vue";

const props = defineProps<{ slide: any }>();

const left = computed(() => props.slide?.left ?? (Array.isArray(props.slide?.columns) ? props.slide.columns?.[0] : null));
const right = computed(() => props.slide?.right ?? (Array.isArray(props.slide?.columns) ? props.slide.columns?.[1] : null));
</script>

<template>
  <div class="grid2" style="align-items: start">
    <ContentBlock :block="left" />
    <ContentBlock :block="right" />
  </div>
</template>

