<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

const table = computed(() => (props.slide?.table && typeof props.slide.table === "object" ? props.slide.table : props.slide));
const headers = computed(() => (Array.isArray(table.value?.headers) ? table.value.headers.map((x: any) => String(x ?? "")) : []));
const rows = computed(() => (Array.isArray(table.value?.rows) ? table.value.rows : []));
</script>

<template>
  <table class="table">
    <thead v-if="headers.length">
      <tr>
        <th v-for="(h, i) in headers" :key="i">{{ h }}</th>
      </tr>
    </thead>
    <tbody v-if="rows.length">
      <tr v-for="(r, i) in rows" :key="i">
        <td v-for="(c, j) in (Array.isArray(r) ? r : [])" :key="j">{{ c }}</td>
      </tr>
    </tbody>
  </table>
</template>

