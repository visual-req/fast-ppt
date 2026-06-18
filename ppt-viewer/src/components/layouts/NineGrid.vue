<script setup lang="ts">
import ContentBlock from "./ContentBlock.vue";
defineProps<{ slide: any }>();
function toItems(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return Array.from({ length: 9 }).map(() => ({}));
  return value.slice(0, 9);
}
</script>

<template>
  <div class="grid3x3">
    <ContentBlock v-for="(it, i) in toItems(slide?.items)" :key="i" :block="it" />
  </div>
</template>

