<script setup lang="ts">
defineProps<{ slide: any }>();

function toItems(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return Array.from({ length: 4 }).map(() => ({}));
  return value.slice(0, 4);
}

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toBullets(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v ?? "")).filter(Boolean) : [];
}

function getIconSvg(name: unknown) {
  const key = typeof name === "string" ? name : "";
  const svgByName: Record<string, string> = {
    target:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="4"></circle><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"></circle></svg>',
    grid:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="1.5"></rect><rect x="13" y="4" width="7" height="7" rx="1.5"></rect><rect x="4" y="13" width="7" height="7" rx="1.5"></rect><rect x="13" y="13" width="7" height="7" rx="1.5"></rect></svg>',
    chart:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"></path><path d="M7 16V9"></path><path d="M12 16V5"></path><path d="M17 16v-3"></path></svg>',
    shield:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 5 3.4 8 7 10 3.6-2 7-5 7-10V6z"></path><path d="m9 12 2 2 4-4"></path></svg>'
  };
  return svgByName[key] ?? "";
}
</script>

<template>
  <div class="grid2">
    <div v-for="(it, i) in toItems(slide?.grid || slide?.items)" :key="i" class="card nineGridCard">
      <div class="nineGridHeader">
        <div v-if="getIconSvg(it?.icon)" class="nineGridIcon" v-html="getIconSvg(it?.icon)"></div>
        <div class="nineGridTitle">{{ toText(it?.title) || `模块 ${Number(i) + 1}` }}</div>
      </div>
      <div v-if="toText(it?.text)" class="nineGridText">{{ toText(it?.text) }}</div>
      <ul v-if="toBullets(it?.bullets).length" class="nineGridBullets">
        <li v-for="(bullet, j) in toBullets(it?.bullets)" :key="j">{{ bullet }}</li>
      </ul>
    </div>
  </div>
</template>
