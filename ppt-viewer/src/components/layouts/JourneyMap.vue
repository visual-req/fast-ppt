<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type Stage = { name?: string; label?: string; description?: string; touchpoints?: string[]; painpoints?: string[]; opportunities?: string[] };

const stages = computed<Stage[]>(() => (Array.isArray(props.slide?.stages) ? props.slide.stages : []));

function stageName(s: Stage) {
  return s.name || s.label || "";
}
function hasDetailed(ss: Stage[]) {
  return ss.some((s) => (Array.isArray(s.touchpoints) && s.touchpoints.length > 0) || (Array.isArray(s.painpoints) && s.painpoints.length > 0) || (Array.isArray(s.opportunities) && s.opportunities.length > 0));
}

function toLines(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((x) => String(x ?? "")).filter((x) => x.trim().length > 0);
}
</script>

<template>
  <Card v-if="!stages.length" title="无数据" />
  <table v-else-if="hasDetailed(stages)" class="table">
    <thead>
      <tr>
        <th style="width: 140px">维度</th>
        <th v-for="(s, i) in stages" :key="i">{{ stageName(s) || `阶段 ${Number(i) + 1}` }}</th>
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
  <div v-else class="jmSimple">
    <div v-for="(s, i) in stages" :key="i" class="jmSimpleCard">
      <div class="jmSimpleLabel">{{ stageName(s) || `阶段 ${Number(i) + 1}` }}</div>
      <div v-if="s.description" class="jmSimpleDesc">{{ s.description }}</div>
    </div>
  </div>
</template>

<style scoped>
.jmSimple {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.jmSimpleCard {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 18px;
}
.jmSimpleLabel {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 6px;
}
.jmSimpleDesc {
  font-size: 13px;
  line-height: 1.5;
  color: #475569;
}
</style>

