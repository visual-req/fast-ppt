<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type PetalItem = {
  title?: string;
  text?: string;
  tag?: string;
  bullets?: string[];
};

type PetalPreset = {
  left: number;
  top: number;
  rotate: number;
  innerRotate: number;
};

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toText(item)).filter(Boolean).slice(0, 2);
}

function asItem(item: unknown, index: number): PetalItem {
  if (typeof item === "string") return { title: item };
  if (!item || typeof item !== "object" || Array.isArray(item)) return { title: `花瓣 ${index + 1}` };
  const record = item as Record<string, unknown>;
  return {
    title: toText(record.title) || toText(record.name) || `花瓣 ${index + 1}`,
    text: toText(record.text),
    tag: toText(record.tag),
    bullets: toStrings(record.bullets)
  };
}

const presets: PetalPreset[] = [
  { left: 50, top: 22, rotate: 0, innerRotate: 0 },
  { left: 78, top: 50, rotate: 90, innerRotate: -90 },
  { left: 50, top: 78, rotate: 180, innerRotate: -180 },
  { left: 22, top: 50, rotate: -90, innerRotate: 90 }
];

const coreTitle = computed(() => {
  const rawCore =
    props.slide?.core && typeof props.slide.core === "object" && !Array.isArray(props.slide.core)
      ? props.slide.core
      : {};
  return toText(rawCore.title) || toText(props.slide?.core_title) || toText(props.slide?.center_title) || "核心标题";
});

const items = computed<PetalItem[]>(() => {
  const raw = Array.isArray(props.slide?.items)
    ? props.slide.items
    : Array.isArray(props.slide?.points)
      ? props.slide.points
      : Array.isArray(props.slide?.blocks)
        ? props.slide.blocks
        : [];

  return Array.from({ length: 4 }, (_, index) => asItem(raw[index], index));
});

function itemText(item: PetalItem): string {
  return toText(item.text) || toStrings(item.bullets).join(" / ");
}

function petalStyle(preset: PetalPreset) {
  return {
    left: `${preset.left}%`,
    top: `${preset.top}%`,
    transform: `translate(-50%, -50%) rotate(${preset.rotate}deg)`
  };
}

function innerStyle(preset: PetalPreset) {
  return {
    transform: `rotate(${preset.innerRotate}deg)`
  };
}
</script>

<template>
  <Card v-if="!items.length" title="无数据" />
  <div v-else class="petalRoot">
    <div class="petalGlow petalGlowTop"></div>
    <div class="petalGlow petalGlowRight"></div>
    <div class="petalGlow petalGlowBottom"></div>
    <div class="petalGlow petalGlowLeft"></div>

    <div
      v-for="(item, index) in items"
      :key="index"
      class="petalShell"
      :style="petalStyle(presets[index])"
    >
      <div class="petalCard">
        <div class="petalInner" :style="innerStyle(presets[index])">
          <div v-if="toText(item.tag)" class="petalTag">{{ item.tag }}</div>
          <div class="petalTitle">{{ toText(item.title) || `花瓣 ${index + 1}` }}</div>
          <div v-if="itemText(item)" class="petalText">{{ itemText(item) }}</div>
        </div>
      </div>
    </div>

    <div class="petalCoreHalo"></div>
    <div class="petalCore">
      <div class="petalCoreTitle">{{ coreTitle }}</div>
    </div>
  </div>
</template>

<style scoped>
.petalRoot {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.12), transparent 28%),
    linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 20px 36px rgba(20, 61, 122, 0.08);
}

.petalGlow {
  position: absolute;
  width: 26%;
  aspect-ratio: 1;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(147, 197, 253, 0.24) 0%, rgba(147, 197, 253, 0.1) 52%, transparent 76%);
}

.petalGlowTop {
  left: 50%;
  top: 8%;
  transform: translateX(-50%);
}

.petalGlowRight {
  right: 8%;
  top: 50%;
  transform: translateY(-50%);
}

.petalGlowBottom {
  left: 50%;
  bottom: 8%;
  transform: translateX(-50%);
}

.petalGlowLeft {
  left: 8%;
  top: 50%;
  transform: translateY(-50%);
}

.petalShell {
  position: absolute;
  width: 31%;
  height: 34%;
}

.petalCard {
  width: 100%;
  height: 100%;
  border-radius: 48% 48% 42% 42% / 58% 58% 42% 42%;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 246, 255, 0.98) 100%);
  border: 1px solid rgba(191, 219, 254, 0.96);
  box-shadow: 0 20px 34px rgba(20, 61, 122, 0.1);
  display: grid;
  place-items: center;
  padding: 18px 20px 22px;
}

.petalInner {
  width: 72%;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 8px;
  text-align: center;
}

.petalTag {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(29, 111, 232, 0.08);
  color: #1d6fe8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.petalTitle {
  color: #143d7a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.28;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.petalText {
  color: #475569;
  font-size: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.petalCoreHalo,
.petalCore {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 999px;
}

.petalCoreHalo {
  width: 28%;
  aspect-ratio: 1;
  background: radial-gradient(circle, rgba(147, 197, 253, 0.3) 0%, rgba(147, 197, 253, 0.08) 56%, transparent 78%);
}

.petalCore {
  width: 20%;
  aspect-ratio: 1;
  min-width: 160px;
  max-width: 240px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, rgba(244, 248, 255, 0.98) 100%);
  border: 1px solid rgba(191, 219, 254, 0.96);
  box-shadow: 0 22px 36px rgba(20, 61, 122, 0.14);
  display: grid;
  place-items: center;
  padding: 20px;
  text-align: center;
}

.petalCoreTitle {
  color: #143d7a;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.28;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
