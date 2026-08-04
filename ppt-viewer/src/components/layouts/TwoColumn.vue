<script setup lang="ts">
import { computed } from "vue";
import ContentBlock from "./ContentBlock.vue";

const props = defineProps<{ slide: any }>();

const left = computed(() => props.slide?.left ?? (Array.isArray(props.slide?.columns) ? props.slide.columns?.[0] : null));
const right = computed(() => props.slide?.right ?? (Array.isArray(props.slide?.columns) ? props.slide.columns?.[1] : null));
</script>

<template>
  <div class="twoColumnShell">
    <div class="twoColumnBackdrop"></div>
    <div class="grid2 twoColumnGrid" style="align-items: start">
      <div class="twoColumnPane twoColumnPaneLeft">
        <ContentBlock :block="left" />
      </div>
      <div class="twoColumnPane twoColumnPaneRight">
        <ContentBlock :block="right" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.twoColumnShell {
  position: relative;
  height: 100%;
  min-height: 0;
}

.twoColumnBackdrop {
  position: absolute;
  inset: 8% 50% 8% 50%;
  width: 2px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, transparent 0%, rgba(77, 160, 255, 0.28) 12%, rgba(29, 111, 232, 0.32) 50%, rgba(77, 160, 255, 0.28) 88%, transparent 100%);
}

.twoColumnGrid {
  position: relative;
  z-index: 1;
}

.twoColumnPane {
  min-width: 0;
  min-height: 0;
  padding: 10px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.52) 0%, rgba(248, 251, 255, 0.4) 100%);
  border: 1px solid rgba(215, 227, 244, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.twoColumnPaneLeft {
  backdrop-filter: blur(2px);
}

.twoColumnPaneRight {
  backdrop-filter: blur(2px);
}
</style>
