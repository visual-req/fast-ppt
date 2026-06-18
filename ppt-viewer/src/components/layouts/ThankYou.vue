<script setup lang="ts">
defineProps<{ slide: any }>();
</script>

<template>
  <div class="thankYouWrap">
    <svg class="thankYouBgSvg" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="tybg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="50%" stop-color="#1e3a8a"/>
          <stop offset="100%" stop-color="#2563eb"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#tybg1)"/>
      <!-- Decorative circles -->
      <circle cx="600" cy="337" r="180" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1.5"/>
      <circle cx="600" cy="337" r="260" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>
      <circle cx="600" cy="337" r="340" fill="none" stroke="rgba(255,255,255,0.015)" stroke-width="1"/>
      <circle cx="200" cy="120" r="100" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="1"/>
      <circle cx="1000" cy="550" r="120" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>
    </svg>
    <div class="thankYouContent">
      <div class="thankYouLabel">THANK YOU</div>
      <h1 class="thankYouTitle">{{ slide?.title || "感谢聆听" }}</h1>
      <p v-if="slide?.subtitle" class="thankYouSubtitle">{{ slide.subtitle }}</p>
      <div v-if="slide?.lecturer" class="thankYouLecturer">{{ slide.lecturer }}</div>
      <div v-if="slide?.contact" class="thankYouContact">{{ slide.contact }}</div>
    </div>
  </div>
</template>
