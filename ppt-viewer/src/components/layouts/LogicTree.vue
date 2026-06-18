<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";
import MindNode from "./MindNode.vue";

const props = defineProps<{ slide: any }>();

type Node = { text: string; children?: Node[] };

function toNode(v: any): Node | null {
  if (!v || typeof v !== "object") return null;
  const text = typeof v.text === "string" ? v.text : "";
  const children = Array.isArray(v.children) ? (v.children.map(toNode).filter(Boolean) as Node[]) : undefined;
  if (!text && !children?.length) return null;
  return { text, children };
}

const root = computed(() => toNode(props.slide?.root));
</script>

<template>
  <Card v-if="!root" title="无数据" />
  <div v-else class="tree">
    <div style="font-size: 16px; font-weight: 900">{{ root.text }}</div>
    <ul v-if="root.children?.length">
      <MindNode v-for="(c, i) in root.children" :key="i" :node="c" />
    </ul>
  </div>
</template>

