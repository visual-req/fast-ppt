<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

const background = computed(() => {
  const raw = props.slide?.background;
  return raw && typeof raw === "object" ? raw : null;
});
const backgroundStyle = computed(() => {
  const src = background.value?.src ?? background.value?.url ?? "";
  if (!src) return undefined;
  return {
    backgroundImage: `url(${src})`,
    backgroundSize: typeof background.value?.size === "string" ? background.value.size : "cover",
    backgroundPosition: typeof background.value?.position === "string" ? background.value.position : "center"
  };
});
const overlayStyle = computed(() => ({
  background: typeof background.value?.overlay === "string" ? background.value.overlay : "rgba(15, 23, 42, 0.28)"
}));
const cards = computed(() => (Array.isArray(props.slide?.cards) ? props.slide.cards : []));
const bullets = computed(() =>
  Array.isArray(props.slide?.bullets) ? props.slide.bullets.map((item: unknown) => String(item ?? "")).filter(Boolean) : []
);
const foregroundMode = computed<"dark" | "light">(() => {
  const raw = props.slide?.foreground;
  if (raw === "dark" || raw === "light") return raw;
  return backgroundStyle.value ? "light" : "dark";
});

function cardLabel(card: any, index: number): string {
  if (typeof card?.title === "string" && card.title) return card.title;
  if (typeof card?.label === "string" && card.label) return card.label;
  return `结果 ${index + 1}`;
}
</script>

<template>
  <div class="tbRoot" :style="backgroundStyle">
    <div v-if="backgroundStyle" class="tbOverlay" :style="overlayStyle"></div>
    <div class="tbInner">
      <div class="tbSummary" :class="{ tbSummaryLight: foregroundMode === 'light' }">
        <div class="tbSummaryRail">
          <span class="tbSummaryRailLabel">Summary</span>
        </div>
        <div class="tbSummaryBody">
          <div
            v-if="slide?.subtitle"
            class="tbSubtitle"
            :style="{ color: foregroundMode === 'light' ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.86)' }"
          >
            {{ slide.subtitle }}
          </div>
          <ul class="tbBullets">
            <li v-for="(item, index) in bullets" :key="index" class="tbBulletItem">
              <span class="tbBulletIndex">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="tbBulletText">{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div v-if="cards.length" class="tbCards">
        <div v-for="(card, i) in cards" :key="i" class="tbCard" :class="{ tbCardLight: foregroundMode === 'light' }">
          <div class="tbCardTopline"></div>
          <div class="tbCardLabel">{{ cardLabel(card, i) }}</div>
          <div class="tbCardValue">{{ card?.text ?? card?.value ?? "" }}</div>
          <div v-if="card?.note" class="tbCardNote">{{ card.note }}</div>
        </div>
      </div>
      <div v-else class="tbCards tbCardsEmpty">
        <div class="tbCard tbPlaceholder">
          <div class="tbCardTopline"></div>
          <div class="tbCardLabel">图形候选</div>
          <div class="tbCardValue">可在这里放结果卡、指标卡或右侧结论区。</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tbRoot {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, var(--fppt-secondary-soft, rgba(77, 160, 255, 0.18)), transparent 34%),
    linear-gradient(180deg, var(--fppt-page-bg, #f6f9fd) 0%, var(--fppt-surface-alt, #eef4fb) 100%);
}

.tbOverlay {
  position: absolute;
  inset: 0;
}

.tbInner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 360px);
  gap: 22px;
  height: 100%;
  min-height: 0;
  align-items: stretch;
}

.tbSummary {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
  border-radius: 28px;
  overflow: hidden;
  background: linear-gradient(135deg, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 78%, #0f172a) 0%, var(--fppt-text, #123b7a) 100%);
  color: #ffffff;
  box-shadow: 0 20px 48px rgba(18, 59, 122, 0.18);
}

.tbSummaryLight {
  backdrop-filter: blur(2px);
}

.tbSummaryRail {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
}

.tbSummaryRailLabel {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  letter-spacing: 4px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}

.tbSummaryBody {
  display: grid;
  min-height: 0;
  align-content: start;
  gap: 14px;
  padding: 22px 24px;
}

.tbSubtitle {
  font-size: 15px;
  line-height: 1.7;
}

.tbBullets {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
  min-height: 0;
  overflow: hidden;
}

.tbBulletItem {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.tbBulletIndex {
  display: grid;
  place-items: center;
  min-height: 36px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 13px;
  font-weight: 800;
}

.tbBulletText {
  font-size: 14px;
  line-height: 1.5;
  color: #f8fbff;
}

.tbCards {
  display: grid;
  gap: 10px;
  min-height: 0;
  align-content: stretch;
}

.tbCard {
  position: relative;
  display: grid;
  min-height: 0;
  align-content: start;
  gap: 8px;
  padding: 16px 16px 14px;
  border-radius: 22px;
  background: color-mix(in srgb, var(--fppt-surface, #ffffff) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 90%, transparent);
  box-shadow: 0 16px 36px rgba(20, 61, 122, 0.10);
}

.tbCardLight {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(8px);
  color: #ffffff;
}

.tbCardTopline {
  width: 64px;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--fppt-secondary, #4da0ff) 0%, var(--fppt-primary, #1d6fe8) 100%);
}

.tbCardLabel {
  font-size: 13px;
  font-weight: 800;
  color: color-mix(in srgb, var(--fppt-text, #143d7a) 78%, white);
}

.tbCardLight .tbCardLabel {
  color: rgba(255, 255, 255, 0.76);
}

.tbCardValue {
  font-size: 14px;
  line-height: 1.45;
  color: var(--fppt-text, #0f172a);
  font-weight: 700;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tbCardLight .tbCardValue,
.tbCardLight .tbCardNote {
  color: #ffffff;
}

.tbCardNote {
  font-size: 12px;
  line-height: 1.45;
  color: var(--fppt-muted, #64748b);
}

.tbCardsEmpty {
  align-content: start;
}

.tbPlaceholder {
  min-height: 160px;
}
</style>
