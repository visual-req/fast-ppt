<script setup lang="ts">
import ContentBlock from "./ContentBlock.vue";
defineProps<{ slide: any }>();
function toCols(value: unknown): any[] {
  if (!Array.isArray(value) || value.length === 0) return [{}, {}, {}];
  return value.slice(0, 3);
}
</script>

<template>
  <div class="threeColumnShell">
    <div class="grid3 threeColumnGrid" style="align-items: start">
      <div v-for="(c, i) in toCols(slide?.columns)" :key="i" class="threeColumnPane">
        <div class="threeColumnBadge">{{ String(i + 1).padStart(2, '0') }}</div>
        <ContentBlock :block="c" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.threeColumnShell {
  height: 100%;
  min-height: 0;
}

.threeColumnGrid {
  height: 100%;
}

.threeColumnPane {
  min-width: 0;
  min-height: 0;
  position: relative;
  padding-top: 14px;
}

.threeColumnBadge {
  position: absolute;
  top: 0;
  left: 18px;
  z-index: 2;
  min-width: 42px;
  height: 28px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--fppt-secondary, #4da0ff) 0%, var(--fppt-primary, #1d6fe8) 100%);
  color: white;
  font-size: 11px;
  font-weight: 800;
  box-shadow: 0 10px 18px rgba(20, 61, 122, 0.12);
}
</style>
