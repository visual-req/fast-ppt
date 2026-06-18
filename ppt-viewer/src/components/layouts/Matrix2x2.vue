<script setup lang="ts">
import Bullets from "./Bullets.vue";
import Card from "./Card.vue";

defineProps<{ slide: any }>();

function toQuadrants(value: unknown): any[] {
  return Array.isArray(value) ? value.slice(0, 4) : [];
}

function placeholders() {
  return Array.from({ length: 4 }).map((_, i) => ({ title: `象限 ${i + 1}`, bullets: [] }));
}
</script>

<template>
  <div class="grid2">
    <Card
      v-for="(q, i) in (toQuadrants(slide?.quadrants).length ? toQuadrants(slide?.quadrants) : placeholders())"
      :key="i"
      :title="q?.title || q?.name || `象限 ${Number(i) + 1}`"
    >
      <Bullets :items="q?.bullets" />
    </Card>
  </div>
</template>

