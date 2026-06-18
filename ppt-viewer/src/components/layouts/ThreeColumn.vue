<script setup lang="ts">
import ContentBlock from "./ContentBlock.vue";
defineProps<{ slide: any }>();
function toCols(value: unknown): any[] {
  if (!Array.isArray(value) || value.length === 0) return [{}, {}, {}];
  return value.slice(0, 3);
}
</script>

<template>
  <div class="grid3" style="align-items: start">
    <ContentBlock v-for="(c, i) in toCols(slide?.columns)" :key="i" :block="c" />
  </div>
</template>
