<script setup lang="ts">
import Bullets from "./Bullets.vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

function toLevels(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}
</script>

<template>
  <div style="display: grid; gap: 12px; height: 100%">
    <Card v-if="toLevels(slide?.levels).length" v-for="(lv, i) in toLevels(slide.levels)" :key="i" :title="lv?.title || `层级 ${Number(i) + 1}`">
      <Bullets :items="lv?.bullets" />
    </Card>
    <Bullets v-else :items="slide?.bullets" />
  </div>
</template>

