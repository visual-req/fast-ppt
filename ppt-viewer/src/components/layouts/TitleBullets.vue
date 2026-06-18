<script setup lang="ts">
import { computed } from "vue";
import Bullets from "./Bullets.vue";

const props = defineProps<{ slide: any }>();

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
    backgroundPosition: typeof background.value?.position === "string" ? background.value.position : "center"
  };
});
const overlayStyle = computed(() => ({
  background: typeof background.value?.overlay === "string" ? background.value.overlay : "rgba(15, 23, 42, 0.28)"
}));
const cards = computed(() => (Array.isArray(props.slide?.cards) ? props.slide.cards : []));
const foregroundMode = computed<"dark" | "light">(() => {
  const raw = props.slide?.foreground;
  if (raw === "dark" || raw === "light") return raw;
  return backgroundStyle.value ? "light" : "dark";
});
</script>

<template>
  <div style="position: relative; height: 100%; border-radius: 18px; overflow: hidden" :style="backgroundStyle">
    <div v-if="backgroundStyle" style="position: absolute; inset: 0" :style="overlayStyle"></div>
    <div
      style="position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 360px); gap: 18px; height: 100%; align-items: start"
    >
      <div style="display: grid; gap: 14px">
        <div
          v-if="slide?.subtitle"
          class="slideSubtitle"
          :style="{ color: foregroundMode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.78)', margin: 0 }"
        >
          {{ slide.subtitle }}
        </div>
        <div :style="{ color: foregroundMode === 'light' ? '#ffffff' : '#0f172a' }">
          <Bullets :items="slide?.bullets" />
        </div>
      </div>
      <div v-if="cards.length" style="display: grid; gap: 12px">
        <div
          v-for="(card, i) in cards"
          :key="i"
          style="padding: 14px 16px; border-radius: 16px; backdrop-filter: blur(6px)"
          :style="{
            background: backgroundStyle ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.04)',
            color: foregroundMode === 'light' ? '#ffffff' : '#0f172a'
          }"
        >
          <div style="font-size: 13px; font-weight: 800; margin-bottom: 6px; opacity: 0.85">{{ card?.title ?? card?.label ?? `结果 ${Number(i) + 1}` }}</div>
          <div style="font-size: 15px; line-height: 1.5">{{ card?.text ?? card?.value ?? "" }}</div>
        </div>
      </div>
      <div v-else></div>
    </div>
  </div>
</template>
