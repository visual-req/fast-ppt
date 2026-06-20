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
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 5 3.4 8 7 10 3.6-2 7-5 7-10V6z"></path><path d="m9 12 2 2 4-4"></path></svg>',
    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    refactor:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><polyline points="12 6 16 10 12 14"></polyline><line x1="8" y1="6" x2="8" y2="18.01"></line></svg>',
    flow:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    app:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    sparkle:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="12 3 12 21"></polyline><polyline points="3 12 21 12"></polyline></svg>'
  };
  return svgByName[key] ?? "";
}
</script>

<template>
  <div class="grid2">
    <div v-for="(it, i) in toItems(slide?.grid || slide?.items)" :key="i" class="card fgCard">
      <div class="fgHeader">
        <div v-if="getIconSvg(it?.icon)" class="fgIcon" v-html="getIconSvg(it?.icon)"></div>
        <div class="fgTitle">{{ toText(it?.title) || `模块 ${Number(i) + 1}` }}</div>
      </div>
      <div v-if="toText(it?.text)" class="fgText">{{ toText(it?.text) }}</div>
      <ul v-if="toBullets(it?.bullets).length" class="fgBullets">
        <li v-for="(bullet, j) in toBullets(it?.bullets)" :key="j">{{ bullet }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.fgCard {
  display: grid;
  gap: 10px;
  min-height: 150px;
  align-content: start;
}

.fgHeader {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fgIcon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  flex-shrink: 0;
}

.fgIcon :deep(svg) {
  width: 18px;
  height: 18px;
}

.fgTitle {
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
  color: #0f172a;
}

.fgText {
  font-size: 13px;
  line-height: 1.55;
  color: #475569;
}

.fgBullets {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: #475569;
}
</style>
