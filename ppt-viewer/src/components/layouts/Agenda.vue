<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

const bullets = computed(() => (Array.isArray(props.slide?.bullets) ? props.slide.bullets.map((b: any) => String(b ?? "")) : []));
</script>

<template>
  <div class="agendaWrap">
    <svg class="agendaBgSvg" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="abg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e3a8a"/>
        </linearGradient>
        <linearGradient id="abg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(255,255,255,0.05)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0.0)"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#abg1)"/>
      <!-- Grid -->
      <g stroke="rgba(255,255,255,0.03)" stroke-width="1">
        <line x1="200" y1="0" x2="200" y2="675"/>
        <line x1="400" y1="0" x2="400" y2="675"/>
        <line x1="600" y1="0" x2="600" y2="675"/>
        <line x1="800" y1="0" x2="800" y2="675"/>
        <line x1="1000" y1="0" x2="1000" y2="675"/>
      </g>
      <circle cx="1100" cy="100" r="220" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="1.5"/>
      <circle cx="1100" cy="100" r="140" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
      <circle cx="100" cy="580" r="160" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="1"/>
    </svg>
    <div class="agendaContent">
      <div class="agendaSidebar">
        <span class="agendaSideTitle">目</span>
        <span class="agendaSideTitle">录</span>
      </div>
      <div class="agendaItems">
        <div v-for="(b, i) in bullets" :key="i" class="agendaItem">
          <div class="agendaNum">{{ String(Number(i) + 1).padStart(2, "0") }}</div>
          <div class="agendaText">{{ b }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
