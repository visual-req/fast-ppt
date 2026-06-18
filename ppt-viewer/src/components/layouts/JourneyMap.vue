<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type Stage = { name: string; touchpoints?: string[]; painpoints?: string[]; opportunities?: string[] };

const stages = computed<Stage[]>(() => (Array.isArray(props.slide?.stages) ? props.slide.stages : []));

function toLines(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((x) => String(x ?? "")).filter((x) => x.trim().length > 0);
}
</script>

<template>
  <Card v-if="!stages.length" title="无数据" />
  <table v-else class="table">
    <thead>
      <tr>
        <th style="width: 140px">维度</th>
        <th v-for="(s, i) in stages" :key="i">{{ s.name || `阶段 ${Number(i) + 1}` }}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>触点</strong></td>
        <td v-for="(s, i) in stages" :key="`t-${i}`">
          <ul class="bullets">
            <li v-for="(x, j) in toLines(s.touchpoints)" :key="j">{{ x }}</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td><strong>痛点</strong></td>
        <td v-for="(s, i) in stages" :key="`p-${i}`">
          <ul class="bullets">
            <li v-for="(x, j) in toLines(s.painpoints)" :key="j">{{ x }}</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td><strong>机会点</strong></td>
        <td v-for="(s, i) in stages" :key="`o-${i}`">
          <ul class="bullets">
            <li v-for="(x, j) in toLines(s.opportunities)" :key="j">{{ x }}</li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</template>

