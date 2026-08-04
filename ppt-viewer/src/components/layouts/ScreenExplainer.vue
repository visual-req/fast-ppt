<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type WindowItem = {
  title?: string;
  text?: string;
  tag?: string;
  bullets?: string[];
};

type FloatPreset = {
  left: number;
  top: number;
  rotate: number;
};

const presets: FloatPreset[] = [
  { left: 15, top: 20, rotate: -7 },
  { left: 85, top: 22, rotate: 6 },
  { left: 14, top: 76, rotate: 5 },
  { left: 86, top: 74, rotate: -6 }
];

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toText(item)).filter(Boolean).slice(0, 2);
}

function asItem(item: unknown, index: number): WindowItem {
  if (typeof item === "string") return { title: item };
  if (!item || typeof item !== "object" || Array.isArray(item)) return { title: `浮窗 ${index + 1}` };
  const record = item as Record<string, unknown>;
  return {
    title: toText(record.title) || toText(record.name) || `浮窗 ${index + 1}`,
    text: toText(record.text),
    tag: toText(record.tag),
    bullets: toStrings(record.bullets)
  };
}

const screen = computed(() => {
  const raw =
    props.slide?.screen && typeof props.slide.screen === "object" && !Array.isArray(props.slide.screen)
      ? props.slide.screen
      : props.slide?.center && typeof props.slide.center === "object" && !Array.isArray(props.slide.center)
        ? props.slide.center
        : {};
  const image =
    raw.image && typeof raw.image === "object" && !Array.isArray(raw.image)
      ? raw.image
      : props.slide?.image && typeof props.slide.image === "object" && !Array.isArray(props.slide.image)
        ? props.slide.image
        : {};
  return {
    tag: toText(raw.tag) || "SCREEN",
    title: toText(raw.title) || toText(props.slide?.center_title) || "核心屏幕",
    text: toText(raw.text) || "把核心界面、关键结论或主流程放在中心屏幕中，周围通过浮窗解释补充信息。",
    imageSrc: toText(image.src) || toText(image.url),
    imageAlt: toText(image.alt) || "screen image"
  };
});

const items = computed<WindowItem[]>(() => {
  const raw = Array.isArray(props.slide?.items)
    ? props.slide.items
    : Array.isArray(props.slide?.windows)
      ? props.slide.windows
      : Array.isArray(props.slide?.blocks)
        ? props.slide.blocks
        : [];
  return Array.from({ length: 4 }, (_, index) => asItem(raw[index], index));
});

function itemText(item: WindowItem): string {
  return toText(item.text) || toStrings(item.bullets).join(" / ");
}

function floatStyle(preset: FloatPreset) {
  return {
    left: `${preset.left}%`,
    top: `${preset.top}%`,
    transform: `translate(-50%, -50%) rotate(${preset.rotate}deg)`
  };
}
</script>

<template>
  <Card v-if="!items.length && !screen.title" title="无数据" />
  <div v-else class="screenExplainerRoot">
    <div class="screenExplainerGlow screenExplainerGlowA"></div>
    <div class="screenExplainerGlow screenExplainerGlowB"></div>

    <div class="screenExplainerCenter">
      <div class="screenExplainerFrame">
        <div class="screenExplainerChrome">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="screenExplainerViewport">
          <img
            v-if="screen.imageSrc"
            :src="screen.imageSrc"
            :alt="screen.imageAlt"
            class="screenExplainerImage"
          />
          <div v-else class="screenExplainerPlaceholder">
            <div class="screenExplainerPlaceholderGrid"></div>
            <div class="screenExplainerBadge">{{ screen.tag }}</div>
            <div class="screenExplainerTitle">{{ screen.title }}</div>
            <div class="screenExplainerText">{{ screen.text }}</div>
          </div>
        </div>
      </div>
      <div class="screenExplainerStand"></div>
    </div>

    <div
      v-for="(item, index) in items"
      :key="index"
      class="screenExplainerWindow"
      :style="floatStyle(presets[index])"
    >
      <div class="screenExplainerWindowBar">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="screenExplainerWindowBody">
        <div v-if="toText(item.tag)" class="screenExplainerWindowTag">{{ item.tag }}</div>
        <div class="screenExplainerWindowTitle">{{ toText(item.title) || `浮窗 ${index + 1}` }}</div>
        <div v-if="itemText(item)" class="screenExplainerWindowText">{{ itemText(item) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.screenExplainerRoot {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.14), transparent 30%),
    linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 20px 36px rgba(20, 61, 122, 0.08);
}

.screenExplainerGlow {
  position: absolute;
  width: 28%;
  aspect-ratio: 1;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(147, 197, 253, 0.22) 0%, rgba(147, 197, 253, 0.08) 54%, transparent 76%);
}

.screenExplainerGlowA {
  right: 4%;
  top: 4%;
}

.screenExplainerGlowB {
  left: 6%;
  bottom: 2%;
}

.screenExplainerCenter {
  position: absolute;
  left: 50%;
  top: 54%;
  width: 44%;
  max-width: 560px;
  min-width: 420px;
  transform: translate(-50%, -50%);
}

.screenExplainerFrame {
  border-radius: 28px;
  background: linear-gradient(180deg, #163b76 0%, #0f274f 100%);
  padding: 12px 12px 16px;
  box-shadow: 0 28px 42px rgba(15, 39, 79, 0.22);
}

.screenExplainerChrome {
  display: flex;
  gap: 8px;
  padding: 0 4px 10px;
}

.screenExplainerChrome span,
.screenExplainerWindowBar span {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.28);
}

.screenExplainerViewport {
  min-height: 280px;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(180deg, #f8fbff 0%, #edf4ff 100%);
  border: 1px solid rgba(191, 219, 254, 0.9);
}

.screenExplainerImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.screenExplainerPlaceholder {
  position: relative;
  min-height: 280px;
  height: 100%;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 10px;
  padding: 24px 30px;
  text-align: center;
  overflow: hidden;
}

.screenExplainerPlaceholderGrid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(191, 219, 254, 0.22) 1px, transparent 1px),
    linear-gradient(90deg, rgba(191, 219, 254, 0.22) 1px, transparent 1px);
  background-size: 22px 22px;
}

.screenExplainerBadge,
.screenExplainerTitle,
.screenExplainerText {
  position: relative;
  z-index: 1;
}

.screenExplainerBadge,
.screenExplainerWindowTag {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(29, 111, 232, 0.08);
  color: #1d6fe8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.screenExplainerTitle {
  color: #143d7a;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.25;
}

.screenExplainerText {
  max-width: 82%;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
}

.screenExplainerStand {
  width: 132px;
  height: 18px;
  margin: 14px auto 0;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(29, 111, 232, 0.24) 0%, rgba(29, 111, 232, 0.08) 100%);
}

.screenExplainerWindow {
  position: absolute;
  width: 24%;
  min-width: 220px;
  max-width: 280px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.48);
  box-shadow: 0 22px 34px rgba(20, 61, 122, 0.12);
  backdrop-filter: blur(14px);
}

.screenExplainerWindowBar {
  display: flex;
  gap: 8px;
  padding: 14px 16px 0;
}

.screenExplainerWindowBody {
  display: grid;
  gap: 8px;
  padding: 12px 16px 16px;
}

.screenExplainerWindowTitle {
  color: #143d7a;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.screenExplainerWindowText {
  color: #475569;
  font-size: 12px;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}
</style>
