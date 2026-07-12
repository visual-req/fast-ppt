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

type BlockItem = {
  title?: string;
  text?: string;
  bullets?: string[];
};

const blocks = computed<BlockItem[]>(() => {
  const raw = props.slide?.blocks;
  return Array.isArray(raw) ? raw.slice(0, 4) : [];
});

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toBullets(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v: unknown) => String(v ?? "")).filter(Boolean) : [];
}
</script>

<template>
  <div v-if="mode === 'full_image' && imageSrc" class="caseFullImage" :style="{ backgroundImage: `url(${imageSrc})` }">
    <div class="caseOverlay"></div>
    <div class="caseFullHeader">
      <div class="caseModeTag">Case Study</div>
      <div v-if="slide?.title" class="caseFullTitle">{{ slide.title }}</div>
    </div>
    <div class="caseFullGrid">
      <div v-for="(block, index) in blocks" :key="index" class="caseFullCard">
        <div class="caseBlockIndex">{{ String(index + 1).padStart(2, '0') }}</div>
        <div class="caseBlockTitle">{{ toText(block.title) || `模块 ${index + 1}` }}</div>
        <div v-if="toText(block.text)" class="caseBlockText">{{ block.text }}</div>
        <ul v-if="toBullets(block.bullets).length" class="caseBullets">
          <li v-for="(bullet, bulletIndex) in toBullets(block.bullets)" :key="bulletIndex">{{ bullet }}</li>
        </ul>
      </div>
    </div>
    <div v-if="imageCaption" class="caseFullCaption">{{ imageCaption }}</div>
  </div>

  <div v-else class="caseRoot">
    <div class="caseMediaPanel">
      <div class="caseModeTag">Case Study</div>
      <div class="caseMediaShell">
        <img v-if="imageSrc" :src="imageSrc" :alt="imageCaption || slide?.title || 'case image'" class="caseImage" />
        <div v-else class="caseImagePlaceholder">
          <div class="caseImagePlaceholderFrame"></div>
          <div class="caseImagePlaceholderWave"></div>
          <div class="caseImagePlaceholderText">案例截图 / 场景示意</div>
        </div>
      </div>
      <div v-if="imageCaption" class="caseCaption">{{ imageCaption }}</div>
    </div>

    <div class="caseContentPanel">
      <div class="caseSummaryCard">
        <div class="caseSummaryLabel">Summary</div>
        <div class="caseSummaryTitle">{{ slide?.title || "案例拆解" }}</div>
        <div class="caseSummaryText">从场景痛点、系统方案、成效指标到试点价值，形成可复用的案例表达结构。</div>
      </div>

      <div class="caseBlocks">
        <div v-for="(block, index) in blocks" :key="index" class="caseBlockCard">
          <div class="caseBlockIndex">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="caseBlockTitle">{{ toText(block.title) || `模块 ${index + 1}` }}</div>
          <div v-if="toText(block.text)" class="caseBlockText">{{ block.text }}</div>
          <ul v-if="toBullets(block.bullets).length" class="caseBullets">
            <li v-for="(bullet, bulletIndex) in toBullets(block.bullets)" :key="bulletIndex">{{ bullet }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.caseRoot {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(320px, 0.88fr) minmax(0, 1.12fr);
  gap: 18px;
}

.caseMediaPanel,
.caseContentPanel {
  min-width: 0;
}

.caseMediaPanel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 12px;
  padding: 18px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.18), transparent 34%),
    linear-gradient(180deg, #f7faff 0%, #eef4fb 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
}

.caseModeTag {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(29, 111, 232, 0.08);
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.caseMediaShell {
  min-height: 0;
  border-radius: 24px;
  overflow: hidden;
  background: #dbeafe;
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
  display: grid;
  place-items: center;
}

.caseImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.caseImagePlaceholder {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.24), transparent 34%),
    linear-gradient(180deg, #f8fbff 0%, #edf4fb 100%);
}

.caseImagePlaceholderFrame {
  position: absolute;
  left: 12%;
  right: 12%;
  top: 18%;
  bottom: 22%;
  border-radius: 22px;
  border: 2px solid rgba(29, 111, 232, 0.18);
  background: rgba(255, 255, 255, 0.72);
}

.caseImagePlaceholderWave {
  position: absolute;
  left: 18%;
  right: 18%;
  bottom: 30%;
  height: 20%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(77, 160, 255, 0.18) 0%, rgba(29, 111, 232, 0.08) 100%);
}

.caseImagePlaceholderText {
  position: absolute;
  left: 50%;
  bottom: 16%;
  transform: translateX(-50%);
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
}

.caseCaption {
  font-size: 12px;
  line-height: 1.55;
  color: #64748b;
}

.caseContentPanel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 14px;
}

.caseSummaryCard {
  padding: 20px 22px;
  border-radius: 26px;
  background: linear-gradient(135deg, #1f4f97 0%, #123b7a 100%);
  color: #ffffff;
  box-shadow: 0 18px 34px rgba(18, 59, 122, 0.16);
}

.caseSummaryLabel {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}

.caseSummaryTitle {
  margin-top: 10px;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.35;
}

.caseSummaryText {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.84);
}

.caseBlocks {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.caseBlockCard,
.caseFullCard {
  padding: 16px 16px 14px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 16px 30px rgba(20, 61, 122, 0.08);
}

.caseBlockIndex {
  width: 42px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(90deg, #4da0ff 0%, #1d6fe8 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.caseBlockTitle {
  margin-top: 10px;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 800;
  color: #143d7a;
}

.caseBlockText {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.58;
  color: #475569;
}

.caseBullets {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
}

.caseBullets li {
  position: relative;
  padding-left: 16px;
  font-size: 12px;
  line-height: 1.5;
  color: #475569;
}

.caseBullets li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 7px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: linear-gradient(135deg, #4da0ff 0%, #1d6fe8 100%);
}

.caseFullImage {
  position: relative;
  height: 100%;
  overflow: hidden;
  border-radius: 28px;
  background-size: cover;
  background-position: center;
}

.caseOverlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.58) 0%, rgba(18, 59, 122, 0.42) 100%);
}

.caseFullHeader,
.caseFullGrid,
.caseFullCaption {
  position: relative;
  z-index: 1;
}

.caseFullHeader {
  display: grid;
  gap: 10px;
  padding: 22px 24px 0;
}

.caseFullTitle {
  font-size: 26px;
  line-height: 1.35;
  font-weight: 800;
  color: #ffffff;
}

.caseFullGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 18px 24px 0;
}

.caseFullCard {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
}

.caseFullCaption {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 20px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  line-height: 1.55;
  backdrop-filter: blur(8px);
}

@media (max-width: 1100px) {
  .caseRoot,
  .caseBlocks,
  .caseFullGrid {
    grid-template-columns: 1fr;
  }
}
</style>
