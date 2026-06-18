<script setup lang="ts">
import Bullets from "./Bullets.vue";
import Card from "./Card.vue";
import TableLayout from "./TableLayout.vue";
import ProblemStatement from "./ProblemStatement.vue";

const props = defineProps<{ slide: any }>();

const hasBullets = Array.isArray(props.slide?.bullets) && props.slide.bullets.length;
const hasTable = props.slide?.table || props.slide?.headers || props.slide?.rows;
const hasBlocks = Array.isArray(props.slide?.blocks) && props.slide.blocks.length;
</script>

<template>
  <Bullets v-if="hasBullets" :items="slide?.bullets" />
  <ProblemStatement v-else-if="hasBlocks" :slide="{ blocks: slide.blocks }" />
  <TableLayout v-else-if="hasTable" :slide="slide" />
  <Card v-else title="原始结构">
    <pre style="margin: 0; white-space: pre-wrap; font-size: 12px; line-height: 1.45">{{ JSON.stringify(slide, null, 2) }}</pre>
  </Card>
</template>

