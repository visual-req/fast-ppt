<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

const mode = computed(() => {
  const raw = props.slide?.mode;
  return typeof raw === "string" && (raw === "left_right" || raw === "full_image") ? raw : "left_right";
});

const image = computed(() => {
  const raw = props.slide?.image;
  return raw && typeof raw === "object" ? raw : null;
});
const imageSrc = computed(() => image.value?.src ?? image.value?.url ?? "");
const imageCaption = computed(() => image.value?.caption ?? "");

const blocks = computed(() => {
  const raw = props.slide?.blocks;
  return Array.isArray(raw) ? raw.slice(0, 6) : [];
});

function toText(value: unknown) {
  if (typeof value === "string") return value;
  return "";
}
function toBullets(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v ?? "")).filter(Boolean) : [];
}
</script>

<template>
  <!-- full_image mode: 背景大图 + 网格卡片叠加 -->
  <div v-if="mode === 'full_image' && imageSrc" class="caseFullImage" :style="{ backgroundImage: `url(${imageSrc})` }">
    <div class="caseOverlay"></div>
    <div class="caseFullGrid">
      <div v-for="(b, i) in blocks" :key="i" class="caseFullCard">
        <div class="caseFullCardTitle">{{ toText(b?.title) || `要点 ${i + 1}` }}</div>
        <div v-if="toText(b?.text)" class="caseFullCardText">{{ toText(b.text) }}</div>
        <ul v-if="toBullets(b?.bullets).length" class="caseFullBullets">
          <li v-for="(bullet, j) in toBullets(b?.bullets)" :key="j">{{ bullet }}</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- full_image no image fallback -->
  <div v-else-if="mode === 'full_image'" class="caseGrid">
    <div v-for="(b, i) in blocks" :key="i" class="caseBlock">
      <div class="caseBlockTitle">{{ toText(b?.title) || `要点 ${i + 1}` }}</div>
      <div v-if="toText(b?.text)" class="caseBlockText">{{ toText(b.text) }}</div>
      <ul v-if="toBullets(b?.bullets).length" class="caseBullets">
        <li v-for="(bullet, j) in toBullets(b?.bullets)" :key="j">{{ bullet }}</li>
      </ul>
    </div>
  </div>

  <!-- left_right mode: 左图右文 -->
  <div v-else class="caseLeftRight">
    <div class="caseImageCol">
      <div v-if="imageSrc" class="caseImageBox">
        <img :src="imageSrc" :alt="imageCaption" class="caseImage" />
        <div v-if="imageCaption" class="caseImageCap">{{ imageCaption }}</div>
      </div>
      <div v-else class="caseImagePlaceholder">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="12" width="48" height="40" rx="6" stroke="rgba(15,23,42,0.25)" stroke-width="2"/>
          <path d="M8 40l12-10 8 6 16-12 12 10" stroke="rgba(15,23,42,0.25)" stroke-width="2"/>
          <circle cx="24" cy="24" r="4" stroke="rgba(15,23,42,0.25)" stroke-width="2"/>
        </svg>
        <div class="caseImagePlaceholderText">案例截图或示意图</div>
      </div>
    </div>
    <div class="caseTextCol">
      <div v-for="(b, i) in blocks" :key="i" class="caseBlock">
        <div class="caseBlockTitle">{{ toText(b?.title) || `要点 ${i + 1}` }}</div>
        <div v-if="toText(b?.text)" class="caseBlockText">{{ toText(b.text) }}</div>
        <ul v-if="toBullets(b?.bullets).length" class="caseBullets">
          <li v-for="(bullet, j) in toBullets(b?.bullets)" :key="j">{{ bullet }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
