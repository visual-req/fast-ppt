<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

const nodes = computed(() => (Array.isArray(props.slide?.nodes) ? props.slide.nodes : []));
const links = computed(() => (Array.isArray(props.slide?.links) ? props.slide.links : []));
</script>

<template>
  <div class="grid2" style="align-items: start">
    <Card title="节点">
      <ul class="bullets">
        <li v-for="(n, i) in nodes" :key="i">{{ n?.label || n?.id || `节点 ${Number(i) + 1}` }}</li>
      </ul>
    </Card>
    <Card title="依赖关系">
      <ul class="bullets">
        <li v-for="(l, i) in links" :key="i">
          {{ l?.from }} → {{ l?.to }}<span v-if="l?.label">（{{ l.label }}）</span>
        </li>
      </ul>
    </Card>
  </div>
</template>

