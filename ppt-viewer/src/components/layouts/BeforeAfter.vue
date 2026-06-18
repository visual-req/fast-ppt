<script setup lang="ts">
import { computed } from "vue";
import ContentBlock from "./ContentBlock.vue";

const props = defineProps<{ slide: any }>();

const before = computed(() => props.slide?.before ?? null);
const after = computed(() => props.slide?.after ?? null);
</script>

<template>
  <div class="grid2" style="align-items: start">
    <ContentBlock :block="before" />
    <ContentBlock :block="after" />
  </div>
</template>

