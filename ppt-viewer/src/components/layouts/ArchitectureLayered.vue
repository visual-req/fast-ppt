<script setup lang="ts">
import { computed } from "vue";
import { getLayoutIconSvg } from "../../lib/layoutIcons";

const props = defineProps<{ slide: any }>();

type LayerItem = {
  title?: string;
  text?: string;
  bullets?: string[];
  icon?: string;
};

const layers = computed<LayerItem[]>(() => {
  const raw = props.slide?.layers;
  return Array.isArray(raw) ? raw : [];
});

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toBullets(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v: unknown) => String(v ?? "")).filter(Boolean) : [];
}

const getIconSvg = getLayoutIconSvg;
</script>

<template>
  <div class="archRoot">
    <div class="archSpine"></div>
    <div v-for="(layer, index) in layers" :key="index" class="archLayerRow" :style="{ '--layer-order': index }">
      <div class="archLayerLabel">
        <div class="archLayerOrder">{{ String(index + 1).padStart(2, "0") }}</div>
        <div v-if="getIconSvg(layer?.icon)" class="archLayerIcon" v-html="getIconSvg(layer?.icon)"></div>
        <div class="archLayerTitle">{{ layer?.title || `层 ${index + 1}` }}</div>
      </div>

      <div class="archLayerPanel">
        <div v-if="toText(layer?.text)" class="archLayerText">{{ toText(layer?.text) }}</div>
        <ul v-if="toBullets(layer?.bullets).length" class="archLayerBullets">
          <li v-for="(bullet, bulletIndex) in toBullets(layer?.bullets)" :key="bulletIndex">{{ bullet }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.archRoot {
  position: relative;
  display: grid;
  gap: 16px;
  height: 100%;
  padding: 12px 8px 12px 18px;
}

.archSpine {
  position: absolute;
  left: 34px;
  top: 18px;
  bottom: 18px;
  width: 6px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--fppt-secondary, #4da0ff) 0%, var(--fppt-primary, #1d6fe8) 100%);
  opacity: 0.2;
}

.archLayerRow {
  position: relative;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 16px;
  min-height: 0;
}

.archLayerLabel {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 52px 42px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 24px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 78%, #0f172a) 0%, var(--fppt-text, #123b7a) 100%);
  color: #ffffff;
  box-shadow: 0 18px 34px rgba(18, 59, 122, 0.16);
}

.archLayerLabel::after {
  content: "";
  position: absolute;
  right: -18px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 18px solid transparent;
  border-bottom: 18px solid transparent;
  border-left: 18px solid var(--fppt-text, #123b7a);
}

.archLayerOrder {
  width: 52px;
  height: 30px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.14);
  font-size: 12px;
  font-weight: 800;
}

.archLayerIcon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.14);
}

.archLayerIcon :deep(svg) {
  width: 20px;
  height: 20px;
}

.archLayerTitle {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.35;
}

.archLayerPanel {
  position: relative;
  display: grid;
  align-content: start;
  gap: 10px;
  min-width: 0;
  padding: 18px 20px;
  border-radius: 24px;
  background: linear-gradient(180deg, var(--fppt-surface, #ffffff) 0%, var(--fppt-surface-alt, #f8fbff) 100%);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 96%, transparent);
  box-shadow: 0 18px 34px rgba(20, 61, 122, 0.08);
}

.archLayerPanel::before {
  content: "";
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--fppt-secondary, #4da0ff) 72%, transparent) 0%, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 28%, transparent) 100%);
}

.archLayerText {
  font-size: 13px;
  line-height: 1.6;
  color: var(--fppt-muted, #475569);
  font-weight: 600;
}

.archLayerBullets {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
}

.archLayerBullets li {
  position: relative;
  padding-left: 16px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--fppt-muted, #475569);
}

.archLayerBullets li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 7px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--fppt-secondary, #4da0ff) 0%, var(--fppt-primary, #1d6fe8) 100%);
}

@media (max-width: 960px) {
  .archLayerRow {
    grid-template-columns: 1fr;
  }

  .archLayerLabel::after,
  .archLayerPanel::before,
  .archSpine {
    display: none;
  }
}
</style>
