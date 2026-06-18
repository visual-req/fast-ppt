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
  background: typeof background.value?.overlay === "string" ? background.value.overlay : "rgba(15, 23, 42, 0.48)"
}));
</script>

<template>
  <div style="position: relative; height: 100%; border-radius: 18px; overflow: hidden" :style="backgroundStyle">
    <div v-if="backgroundStyle" style="position: absolute; inset: 0" :style="overlayStyle"></div>
    <div
      style="position: relative; z-index: 1; display: grid; place-content: center; gap: 16px; text-align: center; height: 100%; padding: 24px"
    >
      <div
        v-if="slide?.chapter_label"
        style="justify-self: center; padding: 8px 16px; border-radius: 999px; font-size: 14px; font-weight: 800; letter-spacing: 0.4px"
        :style="{ background: backgroundStyle ? 'rgba(255,255,255,0.16)' : 'rgba(37,99,235,0.12)', color: backgroundStyle ? '#ffffff' : '#1d4ed8' }"
      >
        {{ slide.chapter_label }}
      </div>
      <div style="display: grid; gap: 10px; max-width: 860px">
        <h2 class="slideTitle" :style="{ color: backgroundStyle ? '#ffffff' : '#0f172a', fontSize: '48px', lineHeight: '1.08' }">
          {{ slide?.title ?? "" }}
        </h2>
        <div
          v-if="slide?.subtitle"
          class="slideSubtitle"
          :style="{ color: backgroundStyle ? 'rgba(255,255,255,0.88)' : 'rgba(15,23,42,0.75)', fontSize: '18px' }"
        >
          {{ slide.subtitle }}
        </div>
      </div>
      <div
        v-if="slide?.goal"
        style="justify-self: center; max-width: 720px; padding: 12px 16px; border-radius: 16px; font-size: 16px; line-height: 1.5"
        :style="{ background: backgroundStyle ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.04)', color: backgroundStyle ? 'rgba(255,255,255,0.92)' : '#334155' }"
      >
        {{ slide.goal }}
      </div>
      <div>
        <Bullets :items="slide?.bullets" />
      </div>
    </div>
  </div>
</template>
