<script setup lang="ts">
import ContentBlock from "./ContentBlock.vue";
defineProps<{ slide: any }>();
</script>

<template>
  <div style="display: grid; grid-template-rows: 1fr 1fr; gap: 14px; height: 100%">
    <ContentBlock :block="slide?.top" />
    <ContentBlock :block="slide?.bottom" />
  </div>
</template>

