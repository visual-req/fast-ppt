<script setup lang="ts">
import { computed } from "vue";
import { getStylePreset } from "../../lib/stylePresets";

const props = defineProps<{ slide: any; ctx?: any }>();

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
const styleName = computed(() => {
  const raw = props.ctx?.deck?.style;
  return typeof raw === "string" ? raw : "consulting";
});
const preset = computed(() => getStylePreset(styleName.value));
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
  const overlay = typeof background.value?.overlay === "string" ? background.value.overlay : preset.value.cover_overlay;
  return { background: overlay };
});
const rootStyle = computed(() => ({
  "--cover-bg": backgroundStyle.value ? "transparent" : `linear-gradient(135deg, ${preset.value.cover_bg} 0%, ${preset.value.cover_bg_alt} 100%)`,
  "--cover-glow": preset.value.cover_glow,
  "--cover-line": preset.value.cover_line,
  "--cover-primary": preset.value.primary,
  "--cover-secondary": preset.value.secondary
}));
</script>

<template>
  <div class="coverRoot" :style="rootStyle">
    <div class="coverBackground" :style="backgroundStyle"></div>
    <div class="coverOverlay" :style="backgroundStyle ? overlayStyle : undefined"></div>

    <div class="coverDeco coverDecoTop"></div>
    <div class="coverDeco coverDecoBottom"></div>
    <div class="coverOrbit coverOrbitLarge"></div>
    <div class="coverOrbit coverOrbitSmall"></div>
    <div class="coverGrid"></div>

    <div class="coverBody">
      <div class="coverMain">
        <div class="coverBadge">AI Presentation Deck</div>
        <h2 class="coverTitle">{{ title || "未命名方案" }}</h2>
        <div v-if="subtitle" class="coverSubtitle">{{ subtitle }}</div>
      </div>

      <div class="coverMetaStrip">
        <div class="coverMetaCard">
          <div class="coverMetaLabel">风格</div>
          <div class="coverMetaValue">{{ preset.name }}</div>
        </div>
        <div v-if="lecturerText" class="coverMetaCard">
          <div class="coverMetaLabel">讲师</div>
          <div class="coverMetaValue">{{ lecturerText }}</div>
        </div>
        <div v-if="dateText" class="coverMetaCard">
          <div class="coverMetaLabel">日期</div>
          <div class="coverMetaValue">{{ dateText }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coverRoot {
  position: relative;
  height: 100%;
  border-radius: 22px;
  overflow: hidden;
  background: var(--cover-bg);
}

.coverBackground,
.coverOverlay,
.coverGrid,
.coverDeco,
.coverOrbit {
  position: absolute;
  inset: 0;
}

.coverBackground {
  z-index: 0;
}

.coverOverlay {
  z-index: 1;
  background: var(--cover-bg);
}

.coverGrid {
  z-index: 2;
  background-image:
    linear-gradient(var(--cover-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--cover-line) 1px, transparent 1px);
  background-size: 120px 120px;
  mask-image: linear-gradient(135deg, rgba(0, 0, 0, 0.28), transparent 70%);
}

.coverDeco {
  z-index: 2;
  border-radius: 999px;
  filter: blur(6px);
}

.coverDecoTop {
  inset: -12% auto auto 62%;
  width: 340px;
  height: 340px;
  background: radial-gradient(circle, var(--cover-glow), transparent 70%);
}

.coverDecoBottom {
  inset: auto auto -16% -6%;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, color-mix(in srgb, var(--cover-secondary) 28%, transparent), transparent 72%);
}

.coverOrbit {
  z-index: 2;
  border-radius: 999px;
  border: 1px solid var(--cover-line);
}

.coverOrbitLarge {
  inset: 10% 10% auto auto;
  width: 360px;
  height: 360px;
}

.coverOrbitSmall {
  inset: auto auto 12% 6%;
  width: 220px;
  height: 220px;
}

.coverBody {
  position: relative;
  z-index: 3;
  height: 100%;
  padding: 7% 8%;
  display: grid;
  grid-template-rows: 1fr auto;
}

.coverMain {
  display: grid;
  gap: 14px;
  max-width: 980px;
  align-content: center;
}

.coverBadge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  backdrop-filter: blur(10px);
}

.coverTitle {
  margin: 0;
  color: #ffffff;
  font-size: 58px;
  line-height: 1.05;
  font-weight: 900;
  max-width: 980px;
}

.coverSubtitle {
  color: rgba(255, 255, 255, 0.82);
  font-size: 20px;
  font-weight: 500;
  line-height: 1.55;
  max-width: 860px;
}

.coverMetaStrip {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.coverMetaCard {
  min-width: 180px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(10px);
}

.coverMetaLabel {
  font-size: 12px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.7);
}

.coverMetaValue {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 700;
}
</style>
