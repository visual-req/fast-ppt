<script setup lang="ts">
const props = defineProps<{ slide: any }>();

function toArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function toBullets(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v ?? "")).filter(Boolean) : [];
}

function getIconSvg(name: unknown) {
  const key = typeof name === "string" ? name : "";
  const svgByName: Record<string, string> = {
    database:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="7" ry="3"></ellipse><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5"></path><path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"></path></svg>',
    pilot:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"></path><path d="m5 10 7-7 7 7"></path><path d="m5 14 7 7 7-7"></path></svg>',
    workflow:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="7" height="5" rx="1.5"></rect><rect x="14" y="5" width="7" height="5" rx="1.5"></rect><rect x="8.5" y="14" width="7" height="5" rx="1.5"></rect><path d="M10 7.5h4"></path><path d="M17.5 10v2.5c0 .8-.7 1.5-1.5 1.5H12"></path><path d="M6.5 10v2.5c0 .8.7 1.5 1.5 1.5H12"></path></svg>',
    governance:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 5 3.4 8 7 10 3.6-2 7-5 7-10V6z"></path><path d="M9 12h6"></path><path d="M12 9v6"></path></svg>',
    scale:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"></path><path d="M7 16V8"></path><path d="M12 16V5"></path><path d="M17 16v-4"></path></svg>',
    refresh:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"></path><path d="M21 3v6h-6"></path></svg>'
  };
  return svgByName[key] ?? "";
}
</script>

<template>
  <div class="archLayers">
    <div v-for="(l, i) in toArray(props.slide?.layers)" :key="i" class="archLayerRow">
      <div class="archLayerLabel">
        <div v-if="getIconSvg(l?.icon)" class="archLayerIcon" v-html="getIconSvg(l?.icon)"></div>
        <div class="archLayerLabelText">{{ l?.title || "层 " + (Number(i) + 1) }}</div>
      </div>
      <ul v-if="toBullets(l?.bullets).length" class="archLayerBullets">
        <li v-for="(b, j) in toBullets(l?.bullets)" :key="j">{{ b }}</li>
      </ul>
    </div>
  </div>
</template>
