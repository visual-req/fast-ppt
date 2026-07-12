<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

const before = computed(() => props.slide?.before ?? null);
const after = computed(() => props.slide?.after ?? null);

function toTitle(obj: any) {
  return typeof obj?.title === "string" ? obj.title : "";
}
function toText(obj: any) {
  return typeof obj?.text === "string" && obj.text.trim() ? obj.text : null;
}
function toBullets(obj: any): string[] {
  return Array.isArray(obj?.bullets) ? obj.bullets.map((v) => String(v ?? "")).filter(Boolean) : [];
}
function hasContent(obj: any) {
  return !!toText(obj) || toBullets(obj).length > 0;
}
</script>

<template>
  <div class="baRoot">
    <div class="baSideTag baSideTagBefore">
      <span>{{ toTitle(before) || "Before" }}</span>
    </div>
    <div class="baCard baBefore">
      <div class="baBanner baBeforeBanner">
        <svg class="baBannerIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        <span>现状 / 问题</span>
      </div>
      <div class="baContent">
        <p v-if="toText(before)" class="baText">{{ toText(before) }}</p>
        <ul v-if="toBullets(before).length" class="baBullets baBeforeBullets">
          <li v-for="(b, i) in toBullets(before)" :key="'bf-' + i">
            <span class="baBulletIcon baBeforeMark">✕</span>{{ b }}
          </li>
        </ul>
        <p v-if="!hasContent(before)" class="baEmpty">暂无数据</p>
      </div>
    </div>
    <div class="baArrow">
      <div class="baArrowDot"></div>
      <div class="baArrowLine" v-for="i in 3" :key="i">
        <div class="baArrowStem"></div>
        <div class="baArrowHead"></div>
      </div>
    </div>
    <div class="baCard baAfter">
      <div class="baBanner baAfterBanner">
        <svg class="baBannerIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span>目标 / 解法</span>
      </div>
      <div class="baContent">
        <p v-if="toText(after)" class="baText">{{ toText(after) }}</p>
        <ul v-if="toBullets(after).length" class="baBullets baAfterBullets">
          <li v-for="(b, i) in toBullets(after)" :key="'af-' + i">
            <span class="baBulletIcon baAfterMark">✓</span>{{ b }}
          </li>
        </ul>
        <p v-if="!hasContent(after)" class="baEmpty">暂无数据</p>
      </div>
    </div>
    <div class="baSideTag baSideTagAfter">
      <span>{{ toTitle(after) || "After" }}</span>
    </div>
  </div>
</template>

<style scoped>
.baRoot {
  display: grid;
  grid-template-columns: 76px 1fr 84px 1fr 76px;
  align-items: stretch;
  gap: 14px;
  height: 100%;
}

.baSideTag {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 28px;
  color: #ffffff;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.04em;
  box-shadow: 0 18px 34px rgba(20, 61, 122, 0.12);
}

.baSideTag span {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

.baSideTagBefore {
  background: linear-gradient(180deg, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 78%, #0f172a) 0%, var(--fppt-text, #123b7a) 100%);
}

.baSideTagAfter {
  background: linear-gradient(180deg, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 78%, #0f172a) 0%, var(--fppt-text, #123b7a) 100%);
}

.baCard {
  display: grid;
  gap: 0;
  padding: 24px 20px 28px;
  border-radius: 26px;
  height: 100%;
  min-height: 260px;
  box-shadow: 0 18px 36px rgba(20, 61, 122, 0.08);
}

.baContent {
  display: grid;
  gap: 16px;
  padding-top: 18px;
}

.baBefore {
  background: linear-gradient(180deg, var(--fppt-surface, #ffffff) 0%, var(--fppt-surface-alt, #f8fbff) 100%);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 96%, transparent);
}

.baAfter {
  background: linear-gradient(180deg, var(--fppt-surface, #ffffff) 0%, var(--fppt-surface-alt, #f8fbff) 100%);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 96%, transparent);
}

.baBanner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 17px;
  font-weight: 800;
}

.baBeforeBanner {
  background: linear-gradient(90deg, color-mix(in srgb, var(--fppt-secondary, #4da0ff) 14%, transparent) 0%, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 8%, transparent) 100%);
  color: var(--fppt-text, #143d7a);
}

.baAfterBanner {
  background: linear-gradient(90deg, color-mix(in srgb, var(--fppt-secondary, #4da0ff) 14%, transparent) 0%, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 8%, transparent) 100%);
  color: var(--fppt-text, #143d7a);
}

.baBannerIcon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.baText {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: var(--fppt-muted, #334155);
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
  color: var(--fppt-muted, #334155);
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
  background: color-mix(in srgb, var(--fppt-secondary, #dbeafe) 18%, white);
  color: var(--fppt-text, #143d7a);
}

.baAfterMark {
  background: color-mix(in srgb, var(--fppt-secondary, #dbeafe) 18%, white);
  color: var(--fppt-text, #143d7a);
}

.baArrow {
  display: grid;
  align-content: center;
  gap: 22px;
  padding-top: 24px;
}

.baArrowDot {
  width: 52px;
  height: 52px;
  margin: 0 auto;
  border-radius: 999px;
  background: var(--fppt-surface, #ffffff);
  border: 2px solid color-mix(in srgb, var(--fppt-secondary, #8fbaf4) 80%, transparent);
  box-shadow: 0 14px 28px rgba(20, 61, 122, 0.10);
}

.baArrowLine {
  display: flex;
  align-items: center;
  gap: 8px;
}

.baArrowStem {
  flex: 1;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--fppt-secondary, #8fbaf4) 38%, transparent) 0%, color-mix(in srgb, var(--fppt-secondary, #4da0ff) 78%, transparent) 100%);
}

.baArrowHead {
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 12px solid var(--fppt-secondary, #4da0ff);
}

.baEmpty {
  color: var(--fppt-muted, #94a3b8);
  font-size: 14px;
  font-style: italic;
  margin: 0;
}

@media (max-width: 1100px) {
  .baRoot {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto auto 1fr auto;
  }

  .baSideTag span {
    writing-mode: initial;
    transform: none;
  }

  .baSideTag {
    min-height: 56px;
  }

  .baArrow {
    grid-auto-flow: column;
    justify-content: center;
    padding-top: 0;
  }

  .baArrowDot {
    display: none;
  }

  .baArrowLine {
    width: 72px;
  }
}
</style>
