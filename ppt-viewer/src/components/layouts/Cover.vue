<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

const title = computed(() => (typeof props.slide?.title === "string" ? props.slide.title : ""));
const subtitle = computed(() => (typeof props.slide?.subtitle === "string" ? props.slide.subtitle : ""));
const dateText = computed(() => {
  const raw = props.slide?.date ?? props.slide?.when;
  return typeof raw === "string" ? raw : "";
});
const lecturerText = computed(() => {
  const raw = props.slide?.lecturer ?? props.slide?.instructor ?? props.slide?.speaker;
  return typeof raw === "string" ? raw : "";
});
const background = computed(() => {
  const raw = props.slide?.background;
  return raw && typeof raw === "object" ? raw : null;
});
const backgroundStyle = computed(() => {
  const src = background.value?.src ?? background.value?.url ?? "";
  if (!src) return undefined;
  const size = typeof background.value?.size === "string" ? background.value.size : "cover";
  const position = typeof background.value?.position === "string" ? background.value.position : "center";
  return {
    backgroundImage: `url(${src})`,
    backgroundSize: size,
    backgroundPosition: position,
    backgroundRepeat: "no-repeat"
  };
});
const overlayStyle = computed(() => {
  const overlay = typeof background.value?.overlay === "string" ? background.value.overlay : "rgba(15, 23, 42, 0.58)";
  return { background: overlay };
});
</script>

<template>
  <div
    style="position: relative; height: 100%; border-radius: 18px; overflow: hidden"
    :style="backgroundStyle"
  >
    <div
      v-if="backgroundStyle"
      style="position: absolute; inset: 0"
      :style="overlayStyle"
    ></div>
    <div
      style="position: relative; z-index: 1; height: 100%; padding: 7% 8%"
    >
      <div style="display: grid; gap: 12px; max-width: 980px; align-content: start">
        <h2 class="slideTitle" :style="{ color: '#ffffff', fontSize: '58px', lineHeight: '1.05' }">{{ title }}</h2>
        <div v-if="subtitle" class="slideSubtitle" :style="{ color: 'rgba(255,255,255,0.88)', fontSize: '20px' }">
          {{ subtitle }}
        </div>
      </div>

      <div
        v-if="dateText || lecturerText"
        style="position:absolute; left: 8%; bottom: 7%; display: grid; gap: 6px; padding: 12px 14px; border-radius: 14px; font-size: 13px; backdrop-filter: blur(8px)"
        :style="{ background: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.18)' }"
      >
        <div v-if="lecturerText" style="display:flex;gap:8px;align-items:baseline">
          <div style="font-weight:800;opacity:0.9;min-width:44px">讲师</div>
          <div style="font-weight:700">{{ lecturerText }}</div>
        </div>
        <div v-if="dateText" style="display:flex;gap:8px;align-items:baseline">
          <div style="font-weight:800;opacity:0.9;min-width:44px">日期</div>
          <div style="font-weight:700">{{ dateText }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
