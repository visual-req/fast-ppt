<script setup lang="ts">
defineProps<{ items?: unknown }>();

function toArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((x) => String(x ?? "")).filter((x) => x.trim().length > 0);
}
</script>

<template>
  <ul v-if="toArray(items).length" class="bullets">
    <li v-for="(b, i) in toArray(items)" :key="i">{{ b }}</li>
  </ul>
</template>

