<script setup lang="ts">
import { computed } from "vue";
import ContentBlock from "./ContentBlock.vue";

const props = defineProps<{ slide: any }>();

const left = computed(() => props.slide?.left ?? (Array.isArray(props.slide?.columns) ? props.slide.columns?.[0] : null));
const right = computed(() => props.slide?.right ?? (Array.isArray(props.slide?.columns) ? props.slide.columns?.[1] : null));

function sideLabel(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}
</script>

<template>
  <div class="symmetricSplitRoot">
    <div class="symmetricSplitBackdrop">
      <div class="symmetricSplitGlow symmetricSplitGlowLeft"></div>
      <div class="symmetricSplitGlow symmetricSplitGlowRight"></div>
      <div class="symmetricSplitAxis"></div>
      <div class="symmetricSplitAxisBadge">{{ sideLabel(slide?.center_label, "VS") }}</div>
    </div>

    <div class="symmetricSplitGrid">
      <section class="symmetricSplitPanel symmetricSplitPanelLeft">
        <div class="symmetricSplitHeader">
          <div class="symmetricSplitTag">{{ sideLabel(left?.tag, "LEFT") }}</div>
          <div class="symmetricSplitTitle">{{ sideLabel(left?.title, "左侧内容") }}</div>
        </div>
        <div class="symmetricSplitBody">
          <ContentBlock :block="left" />
        </div>
      </section>

      <section class="symmetricSplitPanel symmetricSplitPanelRight">
        <div class="symmetricSplitHeader symmetricSplitHeaderRight">
          <div class="symmetricSplitTag">{{ sideLabel(right?.tag, "RIGHT") }}</div>
          <div class="symmetricSplitTitle">{{ sideLabel(right?.title, "右侧内容") }}</div>
        </div>
        <div class="symmetricSplitBody">
          <ContentBlock :block="right" />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.symmetricSplitRoot {
  position: relative;
  height: 100%;
  min-height: 0;
}

.symmetricSplitBackdrop {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.symmetricSplitGlow {
  position: absolute;
  top: 10%;
  width: 34%;
  height: 80%;
  border-radius: 36px;
  background: radial-gradient(circle at center, rgba(77, 160, 255, 0.16), transparent 68%);
}

.symmetricSplitGlowLeft {
  left: 6%;
}

.symmetricSplitGlowRight {
  right: 6%;
}

.symmetricSplitAxis {
  position: absolute;
  top: 6%;
  bottom: 6%;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, transparent 0%, rgba(77, 160, 255, 0.32) 12%, rgba(29, 111, 232, 0.36) 50%, rgba(77, 160, 255, 0.32) 88%, transparent 100%);
}

.symmetricSplitAxisBadge {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border-radius: 999px;
  background: linear-gradient(135deg, #4da0ff 0%, #1d6fe8 100%);
  color: white;
  font-size: 18px;
  font-weight: 800;
  box-shadow: 0 18px 30px rgba(20, 61, 122, 0.16);
}

.symmetricSplitGrid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 32px;
  height: 100%;
  min-height: 0;
  align-items: stretch;
}

.symmetricSplitPanel {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 16px;
  padding: 20px;
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(246, 250, 255, 0.98) 100%);
  border: 1px solid rgba(215, 227, 244, 0.92);
  box-shadow: 0 22px 38px rgba(20, 61, 122, 0.08);
  overflow: hidden;
}

.symmetricSplitHeader {
  display: grid;
  gap: 10px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(215, 227, 244, 0.92);
}

.symmetricSplitHeaderRight {
  text-align: right;
}

.symmetricSplitTag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  width: fit-content;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(29, 111, 232, 0.08);
  color: #1d6fe8;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.symmetricSplitHeaderRight .symmetricSplitTag {
  margin-left: auto;
}

.symmetricSplitTitle {
  color: #143d7a;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.25;
}

.symmetricSplitBody {
  min-height: 0;
}
</style>
