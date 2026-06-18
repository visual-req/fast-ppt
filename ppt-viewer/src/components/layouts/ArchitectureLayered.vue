<script setup lang="ts">
import Bullets from "./Bullets.vue";
import Card from "./Card.vue";

defineProps<{ slide: any }>();

function toArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}
</script>

<template>
  <div style="display: grid; gap: 12px; height: 100%">
    <Card v-for="(l, i) in toArray(slide?.layers)" :key="i" :title="l?.title || `层 ${Number(i) + 1}`">
      <Bullets :items="l?.bullets" />
    </Card>
  </div>
</template>

