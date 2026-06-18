<script setup lang="ts">
defineProps<{ slide: any }>();
</script>

<template>
  <div class="sectionDividerWrap">
    <div class="sectionDividerBg">
      <svg class="sectionDividerSvg" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sdg1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="60%" stop-color="#1e3a8a" />
            <stop offset="100%" stop-color="#2563eb" />
          </linearGradient>
          <linearGradient id="sdg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(255,255,255,0.08)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.0)" />
          </linearGradient>
        </defs>
        <rect width="1200" height="675" fill="url(#sdg1)" />
        <!-- Decorative grid -->
        <g stroke="rgba(255,255,255,0.04)" stroke-width="1">
          <line x1="0" y1="200" x2="1200" y2="200" />
          <line x1="0" y1="400" x2="1200" y2="400" />
          <line x1="300" y1="0" x2="300" y2="675" />
          <line x1="600" y1="0" x2="600" y2="675" />
          <line x1="900" y1="0" x2="900" y2="675" />
        </g>
        <!-- Decorative circles -->
        <circle cx="1000" cy="150" r="180" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="2" />
        <circle cx="1000" cy="150" r="120" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1.5" />
        <circle cx="200" cy="550" r="140" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
        <!-- Accent bar -->
        <rect x="80" y="280" width="6" height="115" rx="3" fill="rgba(255,255,255,0.45)" />
      </svg>
    </div>
    <div class="sectionDividerContent">
      <div class="sectionDividerLabel">Chapter {{ slide?.chapter_no ?? "" }}</div>
      <h1 class="sectionDividerTitle">{{ slide?.title || "章节标题" }}</h1>
      <p v-if="slide?.subtitle" class="sectionDividerSubtitle">{{ slide.subtitle }}</p>
    </div>
  </div>
</template>
