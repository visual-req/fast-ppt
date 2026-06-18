<script setup lang="ts">
defineOptions({ name: "MindNode" });
defineProps<{ node: any }>();
</script>

<template>
  <li>
    <div style="font-weight: 800">{{ node?.text ?? "" }}</div>
    <ul v-if="Array.isArray(node?.children) && node.children.length">
      <MindNode v-for="(c, i) in node.children" :key="i" :node="c" />
    </ul>
  </li>
</template>

