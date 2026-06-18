<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type Item = { name: string; impact: number; effort: number; note?: string; quadrant?: string };

const items = computed<Item[]>(() => {
  const raw = Array.isArray(props.slide?.items) ? props.slide.items : [];
  return raw
    .map((x: any): Item => ({
      name: typeof x?.name === "string" ? x.name : "",
      impact: Number.isFinite(Number(x?.impact)) ? Number(x.impact) : 0,
      effort: Number.isFinite(Number(x?.effort)) ? Number(x.effort) : 0,
      note: typeof x?.note === "string" ? x.note : undefined,
      quadrant: typeof x?.quadrant === "string" ? x.quadrant : undefined
    }))
    .filter((x: Item) => x.name);
});

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

const thresholds = computed(() => {
  const impacts = items.value.map((x) => x.impact);
  const efforts = items.value.map((x) => x.effort);
  return { impact: median(impacts), effort: median(efforts) };
});

function bucket(item: Item): "qw" | "big" | "fill" | "avoid" {
  if (item.quadrant === "quick_wins") return "qw";
  if (item.quadrant === "strategic") return "big";
  if (item.quadrant === "fill_ins") return "fill";
  if (item.quadrant === "deprioritize") return "avoid";
  const highImpact = item.impact >= thresholds.value.impact;
  const lowEffort = item.effort <= thresholds.value.effort;
  if (highImpact && lowEffort) return "qw";
  if (highImpact && !lowEffort) return "big";
  if (!highImpact && lowEffort) return "fill";
  return "avoid";
}

const groups = computed(() => {
  const g = { qw: [] as Item[], big: [] as Item[], fill: [] as Item[], avoid: [] as Item[] };
  for (const it of items.value) g[bucket(it)].push(it);
  return g;
});
</script>

<template>
  <div class="grid2">
    <Card title="高影响 / 低投入（Quick Wins）">
      <ul class="bullets">
        <li v-for="(x, i) in groups.qw" :key="i">{{ x.name }}</li>
      </ul>
    </Card>
    <Card title="高影响 / 高投入（Strategic）">
      <ul class="bullets">
        <li v-for="(x, i) in groups.big" :key="i">{{ x.name }}</li>
      </ul>
    </Card>
    <Card title="低影响 / 低投入（Fill-ins）">
      <ul class="bullets">
        <li v-for="(x, i) in groups.fill" :key="i">{{ x.name }}</li>
      </ul>
    </Card>
    <Card title="低影响 / 高投入（Deprioritize）">
      <ul class="bullets">
        <li v-for="(x, i) in groups.avoid" :key="i">{{ x.name }}</li>
      </ul>
    </Card>
  </div>
</template>
