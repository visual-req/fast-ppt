<script setup lang="ts">
import ContentBlock from "./ContentBlock.vue";
defineProps<{ slide: any }>();
</script>

<template>
  <div class="topBottomShell">
    <div class="topBottomPane topBottomPaneTop">
      <div class="topBottomLabel">01</div>
      <ContentBlock :block="slide?.top" />
    </div>
    <div class="topBottomConnector"></div>
    <div class="topBottomPane topBottomPaneBottom">
      <div class="topBottomLabel">02</div>
      <ContentBlock :block="slide?.bottom" />
    </div>
  </div>
</template>

<style scoped>
.topBottomShell {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 10px;
  height: 100%;
  min-height: 0;
}

.topBottomPane {
  min-height: 0;
  position: relative;
  padding-top: 20px;
}

.topBottomLabel {
  position: absolute;
  top: 0;
  left: 22px;
  z-index: 2;
  min-width: 56px;
  height: 28px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--fppt-secondary, #4da0ff) 0%, var(--fppt-primary, #1d6fe8) 100%);
  color: white;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.topBottomConnector {
  width: 2px;
  height: 26px;
  justify-self: center;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(77, 160, 255, 0.16) 0%, rgba(29, 111, 232, 0.45) 100%);
}
</style>
