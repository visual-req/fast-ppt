<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

const before = computed(() => props.slide?.before ?? null);
const after = computed(() => props.slide?.after ?? null);

function toTitle(obj: any) {
  return typeof obj?.title === "string" ? obj.title : "";
}
function toBullets(obj: any): string[] {
  return Array.isArray(obj?.bullets) ? obj.bullets.map((v) => String(v ?? "")).filter(Boolean) : [];
}
</script>

<template>
  <div class="baRoot">
    <!-- Before 侧 -->
    <div class="baCard baBefore">
      <div class="baBanner baBeforeBanner">
        <svg class="baBannerIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        <span>{{ toTitle(before) || "Before" }}</span>
      </div>
      <ul class="baBullets baBeforeBullets">
        <li v-for="(b, i) in toBullets(before)" :key="'bf-' + i">
          <span class="baBulletIcon baBeforeMark">✕</span>{{ b }}
        </li>
        <li v-if="!toBullets(before).length" class="baEmpty">暂无数据</li>
      </ul>
    </div>

    <!-- 中间箭头 -->
    <div class="baArrow">
      <svg viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="baGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ef4444"/>
            <stop offset="100%" stop-color="#10b981"/>
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="19" stroke="url(#baGrad)" stroke-width="2" fill="white"/>
        <path d="M16 18l4 4 4-4" stroke="url(#baGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <!-- After 侧 -->
    <div class="baCard baAfter">
      <div class="baBanner baAfterBanner">
        <svg class="baBannerIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span>{{ toTitle(after) || "After" }}</span>
      </div>
      <ul class="baBullets baAfterBullets">
        <li v-for="(b, i) in toBullets(after)" :key="'af-' + i">
          <span class="baBulletIcon baAfterMark">✓</span>{{ b }}
        </li>
        <li v-if="!toBullets(after).length" class="baEmpty">暂无数据</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.baRoot {
  display: grid;
  grid-template-columns: 1fr 60px 1fr;
  align-items: center;
  gap: 0;
  height: 100%;
  padding: 8px 12px;
}

.baCard {
  display: grid;
  gap: 16px;
  align-content: start;
  padding: 24px 20px 28px;
  border-radius: 20px;
  height: 100%;
  min-height: 260px;
}

.baBefore {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%);
  border: 1.5px solid #fca5a5;
}

.baAfter {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%);
  border: 1.5px solid #6ee7b7;
}

.baBanner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 800;
}

.baBeforeBanner {
  background: rgba(239, 68, 68, 0.15);
  color: #b91c1c;
}

.baAfterBanner {
  background: rgba(16, 185, 129, 0.15);
  color: #065f46;
}

.baBannerIcon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.baBullets {
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
  list-style: none;
}

.baBullets li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 15px;
  line-height: 1.5;
  color: #334155;
}

.baBulletIcon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
}

.baBeforeMark {
  background: #fecaca;
  color: #b91c1c;
}

.baAfterMark {
  background: #a7f3d0;
  color: #065f46;
}

.baArrow {
  display: grid;
  place-items: center;
}

.baArrow svg {
  width: 48px;
  height: 48px;
}

.baEmpty {
  color: #94a3b8;
  font-size: 14px;
  font-style: italic;
}

@media (max-width: 900px) {
  .baRoot {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto 1fr;
  }
  .baArrow {
    transform: rotate(90deg);
  }
}
</style>
