<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

const bullets = computed(() => (Array.isArray(props.slide?.bullets) ? props.slide.bullets.map((b: any) => String(b ?? "")) : []));
const subtitle = computed(() => (typeof props.slide?.subtitle === "string" ? props.slide.subtitle : ""));
const variant = computed(() => {
  const raw = props.slide?.variant;
  if (raw === "bands" || raw === "classic") return raw;
  return bullets.value.length > 0 && bullets.value.length <= 4 ? "bands" : "classic";
});
const background = computed(() => {
  const raw = props.slide?.background;
  return raw && typeof raw === "object" ? raw : null;
});
const backgroundStyle = computed(() => {
  const src = background.value?.src ?? background.value?.url ?? "";
  if (!src) return undefined;
  return {
    backgroundImage: `url(${src})`,
    backgroundSize: typeof background.value?.size === "string" ? background.value.size : "cover",
    backgroundPosition: typeof background.value?.position === "string" ? background.value.position : "center",
    backgroundRepeat: "no-repeat"
  };
});
const overlayStyle = computed(() => ({
  background: typeof background.value?.overlay === "string" ? background.value.overlay : "rgba(15, 23, 42, 0.22)"
}));
const bandColors = ["agendaBandA", "agendaBandB", "agendaBandC", "agendaBandD"];
</script>

<template>
  <div class="agendaWrap" :class="`agendaWrap-${variant}`">
    <div class="agendaBgImage" :style="backgroundStyle"></div>
    <div v-if="backgroundStyle" class="agendaBgOverlay" :style="overlayStyle"></div>

    <svg v-if="variant === 'classic'" class="agendaBgSvg" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="abg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e3a8a"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#abg1)"/>
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

    <svg v-else class="agendaHeroSvg" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="abh1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#091224"/>
          <stop offset="52%" stop-color="#173b7a"/>
          <stop offset="100%" stop-color="#0d7490"/>
        </linearGradient>
        <radialGradient id="abh2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.24)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#abh1)"/>
      <circle cx="1020" cy="110" r="260" fill="url(#abh2)"/>
      <circle cx="140" cy="610" r="210" fill="rgba(255,255,255,0.06)"/>
      <path d="M760 20C948 36 1102 112 1240 244V0H760V20Z" fill="rgba(255,255,255,0.08)"/>
      <path d="M-40 520C140 450 268 420 404 434C560 450 694 520 860 536C1006 550 1138 518 1260 454V700H-40V520Z" fill="rgba(255,255,255,0.06)"/>
      <g stroke="rgba(255,255,255,0.08)" stroke-width="1.5">
        <circle cx="1020" cy="110" r="180"/>
        <circle cx="1020" cy="110" r="120"/>
        <circle cx="220" cy="560" r="86"/>
      </g>
    </svg>

    <div v-if="variant === 'classic'" class="agendaContent">
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

    <div v-else class="agendaBandsShell">
      <div class="agendaBandsHead">
        <div class="agendaBandsBadge">Agenda</div>
        <div v-if="subtitle" class="agendaBandsSubtitle">{{ subtitle }}</div>
      </div>
      <div class="agendaBandsGrid" :style="{ gridTemplateColumns: `repeat(${Math.max(1, bullets.length)}, minmax(0, 1fr))` }">
        <div
          v-for="(b, i) in bullets"
          :key="i"
          class="agendaBand"
          :class="bandColors[i % bandColors.length]"
        >
          <div class="agendaBandTop">
            <div class="agendaBandNum">{{ String(Number(i) + 1).padStart(2, '0') }}</div>
          </div>
          <div class="agendaBandText">{{ b }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
