<script setup lang="ts">
defineProps<{ slide: any }>();

function toItems(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return Array.from({ length: 9 }).map(() => ({}));
  return value.slice(0, 9);
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
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6"></circle><path d="m20 20-4.2-4.2"></path></svg>',
    draft:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V20h.5L18 6.5 15.5 4 4 15.5z"></path><path d="M13.5 6l2.5 2.5"></path><path d="M8 20h12"></path></svg>',
    code:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m8 8-4 4 4 4"></path><path d="m16 8 4 4-4 4"></path><path d="m14 4-4 16"></path></svg>',
    spark:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"></path><path d="m19 3 .7 1.8L21.5 5.5l-1.8.7L19 8l-.7-1.8-1.8-.7 1.8-.7z"></path></svg>',
    test:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"></path><path d="M10 3v5l-4.8 7.6A3 3 0 0 0 7.7 20h8.6a3 3 0 0 0 2.5-4.4L14 8V3"></path><path d="M8.5 14h7"></path></svg>',
    review:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18"></path><path d="M7 5v14"></path><path d="M11 10h8"></path><path d="M11 14h6"></path><path d="M11 18h5"></path></svg>',
    refactor:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"></path><path d="m7 17 10-10"></path><path d="M7 12H3"></path><path d="M21 12h-4"></path></svg>',
    shield:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 5 3.4 8 7 10 3.6-2 7-5 7-10V6z"></path><path d="m9 12 2 2 4-4"></path></svg>',
    dashboard:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"></path><path d="M6 16V9"></path><path d="M12 16V5"></path><path d="M18 16v-3"></path></svg>',
    document:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h9l4 4v13H6z"></path><path d="M15 4v4h4"></path><path d="M8 13h8"></path><path d="M8 17h6"></path></svg>',
    meeting:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18"></path><path d="M7 15h10"></path><path d="M7 3v7"></path><path d="M17 3v7"></path><path d="M8 15v6"></path><path d="M16 15v6"></path></svg>',
    assistant:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path><path d="M12 12v3"></path></svg>',
    knowledge:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16v14H4z"></path><path d="M4 6V4h16v2"></path><path d="M8 11h4"></path><path d="M8 15h8"></path></svg>',
    lock:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="12" width="14" height="9" rx="2"></rect><path d="M8 12V8a4 4 0 0 1 8 0v4"></path><circle cx="12" cy="16" r="1"></circle></svg>',
    audit:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="m9 15 2 2 4-4"></path></svg>',
    portal:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"></rect><path d="M8 21h8"></path><path d="M12 17v4"></path></svg>',
    safety:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7z"></path><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>',
    qa:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M9.5 9.5c.5-1 1.5-1.5 2.5-1.5s2 .5 2.5 1.5c.4.8.3 1.7-.3 2.3l-2.2 2.2v1"></path><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none"></circle></svg>',
    flow:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h7"></path><path d="M13 7l2-2 2 2"></path><path d="M20 17h-7"></path><path d="M11 17l-2 2-2-2"></path><path d="M15 5v8a2 2 0 0 0 2 2h3"></path><path d="M9 19v-8a2 2 0 0 0-2-2H4"></path></svg>',
    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="m9 12 2 2 4-4"></path></svg>',
    chart:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17V7"></path><path d="M9 17v-4"></path><path d="M15 17V9"></path><path d="M21 17V5"></path></svg>',
    scale:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"></path><path d="M7 16V8"></path><path d="M12 16V5"></path><path d="M17 16v-4"></path></svg>'
  };
  return svgByName[key] ?? "";
}
</script>

<template>
  <div class="grid3x3">
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

<style scoped>
.nineGridCard {
  display: grid;
  gap: 10px;
  min-height: 150px;
  align-content: start;
}

.nineGridHeader {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nineGridIcon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  flex-shrink: 0;
}

.nineGridIcon :deep(svg) {
  width: 18px;
  height: 18px;
}

.nineGridTitle {
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
  color: #0f172a;
}

.nineGridText {
  font-size: 13px;
  line-height: 1.55;
  color: #475569;
}

.nineGridBullets {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: #475569;
}
</style>
