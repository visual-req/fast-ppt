<script setup lang="ts">
import { computed } from "vue";

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
    .filter((t: Task) => t.name);
});

const minMax = computed(() => {
  if (!tasks.value.length) return { min: 0, max: 1 };
  const min = Math.min(...tasks.value.map((t) => t.start));
  const max = Math.max(...tasks.value.map((t) => (t.end || t.start)));
  return { min, max: max === min ? min + 1 : max };
});

function formatMonth(ts: number) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

const axisTicks = computed(() => {
  if (!tasks.value.length) return [];
  const min = minMax.value.min;
  const max = minMax.value.max;
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return [];
  const start = new Date(min);
  const end = new Date(max);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

  const ticks: Array<{ label: string; left: string }> = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= last) {
    const current = cursor.getTime();
    const left = ((current - min) / (max - min)) * 100;
    ticks.push({
      label: formatMonth(current),
      left: `${Math.max(0, Math.min(100, left)).toFixed(2)}%`
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return ticks;
});
</script>

<template>
  <div v-if="!tasks.length" style="padding: 24px; color: #94a3b8; font-size: 14px;">无数据</div>
  <div v-else class="ganttChartInner">
    <div class="ganttChartGrid">
      <div v-if="axisTicks.length" style="display: grid; grid-template-columns: 180px 1fr; gap: 12px; align-items: end; margin-bottom: 8px">
        <div></div>
        <div style="position: relative; height: 28px; border-bottom: 1px solid rgba(15, 23, 42, 0.08)">
          <div
            v-for="(tick, i) in axisTicks"
            :key="i"
            :style="{ position: 'absolute', left: tick.left, top: '0', transform: 'translateX(-50%)', fontSize: '11px', color: 'rgba(15, 23, 42, 0.55)', whiteSpace: 'nowrap' }"
          >
            {{ tick.label }}
          </div>
        </div>
      </div>
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
  </div>
</template>
