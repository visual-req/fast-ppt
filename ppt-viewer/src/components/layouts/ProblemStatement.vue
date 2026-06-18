<script setup lang="ts">
import Bullets from "./Bullets.vue";
import Card from "./Card.vue";

defineProps<{ slide: any }>();

function toBlocks(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}
</script>

<template>
  <div class="grid2">
    <Card v-for="(b, i) in toBlocks(slide?.blocks)" :key="i" :title="b?.heading || b?.title || `块 ${Number(i) + 1}`">
      <Bullets :items="b?.bullets" />
    </Card>
  </div>
</template>

