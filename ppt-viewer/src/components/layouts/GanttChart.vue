<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type Task = { name: string; start: number; end: number; owner?: string };

function parseTime(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return 0;
  const asNumber = Number(s);
  if (Number.isFinite(asNumber)) return asNumber;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : 0;
}

const tasks = computed<Task[]>(() => {
  const raw = Array.isArray(props.slide?.tasks) ? props.slide.tasks : [];
  return raw
    .map((x: any) => ({
      name: typeof x?.name === "string" ? x.name : "",
      owner: typeof x?.owner === "string" ? x.owner : undefined,
      start: parseTime(x?.start),
      end: parseTime(x?.end)
    }))
    .filter((t) => t.name);
});

const minMax = computed(() => {
  if (!tasks.value.length) return { min: 0, max: 1 };
  const min = Math.min(...tasks.value.map((t) => t.start));
  const max = Math.max(...tasks.value.map((t) => (t.end || t.start)));
  return { min, max: max === min ? min + 1 : max };
});
</script>

<template>
  <Card v-if="!tasks.length" title="无数据" />
  <Card v-else title="甘特图">
    <div style="display: grid; gap: 10px">
      <div v-for="(t, i) in tasks" :key="i" style="display: grid; grid-template-columns: 180px 1fr; gap: 12px; align-items: center">
        <div style="font-size: 13px; font-weight: 800; color: rgba(15, 23, 42, 0.85)">
          {{ t.owner ? `${t.name}（${t.owner}）` : t.name }}
        </div>
        <div style="position: relative; height: 16px; border-radius: 10px; background: rgba(15, 23, 42, 0.08); overflow: hidden">
          <div
            :style="{
              position: 'absolute',
              left: `${(((t.start - minMax.min) / (minMax.max - minMax.min)) * 100).toFixed(2)}%`,
              width: `${Math.max(0.5, (((Math.max(t.end || t.start, t.start) - t.start) / (minMax.max - minMax.min)) * 100)).toFixed(2)}%`,
              top: '0',
              bottom: '0',
              borderRadius: '10px',
              background: 'rgba(37,99,235,.85)'
            }"
          />
        </div>
      </div>
    </div>
  </Card>
</template>

