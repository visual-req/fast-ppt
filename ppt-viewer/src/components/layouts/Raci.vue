<script setup lang="ts">
import TableLayout from "./TableLayout.vue";
defineProps<{ slide: any }>();
</script>

<template>
  <TableLayout :slide="slide" />
</template>

