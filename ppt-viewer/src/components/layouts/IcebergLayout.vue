<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type IcebergSection = {
  tag?: string;
  title?: string;
  text?: string;
  bullets?: string[];
};

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => toText(item))
    .filter(Boolean)
    .slice(0, 6);
}

function readSection(raw: unknown, fallbackTitle: string, fallbackTag: string): IcebergSection {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { tag: fallbackTag, title: fallbackTitle, text: "" };
  }

  const record = raw as Record<string, unknown>;
  return {
    tag: toText(record.tag) || fallbackTag,
    title: toText(record.title) || fallbackTitle,
    text: toText(record.text),
    bullets: toStrings(record.items ?? record.bullets)
  };
}

const tip = computed(() =>
  readSection(props.slide?.tip ?? props.slide?.visible ?? props.slide?.above, "表层表现", "VISIBLE")
);

const base = computed(() =>
  readSection(props.slide?.base ?? props.slide?.hidden ?? props.slide?.below, "深层驱动", "HIDDEN")
);

const hasData = computed(() => Boolean(toText(tip.value.title) || toText(base.value.title)));

const baseSummary = computed(() => {
  if (base.value.text) return base.value.text;
  if (base.value.bullets?.length) return "";
  return "真正决定长期成败的，是水面以下的组织、机制、能力与认知结构。";
});
</script>

<template>
  <Card v-if="!hasData" title="无数据" />
  <div v-else class="icebergRoot">
    <svg class="icebergScene" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="icebergWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#edf5ff" />
          <stop offset="38%" stop-color="#e6f1ff" />
          <stop offset="39%" stop-color="#d9ebff" />
          <stop offset="100%" stop-color="#c6dcf8" />
        </linearGradient>
        <linearGradient id="icebergTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#eaf4ff" />
        </linearGradient>
        <linearGradient id="icebergBottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#79b0ea" />
          <stop offset="100%" stop-color="#4d89d7" />
        </linearGradient>
      </defs>

      <rect width="100" height="100" rx="4" fill="url(#icebergWater)" />
      <ellipse cx="50" cy="32" rx="23" ry="10" fill="rgba(147, 197, 253, 0.24)" />
      <ellipse cx="50" cy="42" rx="22" ry="2.6" fill="none" stroke="rgba(102, 153, 220, 0.28)" stroke-width="0.28" />
      <ellipse cx="50" cy="42" rx="19" ry="2" fill="none" stroke="rgba(102, 153, 220, 0.18)" stroke-width="0.2" />

      <rect x="0" y="42" width="100" height="2.1" fill="rgba(255,255,255,0.72)" />
      <line x1="0" y1="42" x2="100" y2="42" stroke="rgba(255,255,255,0.88)" stroke-width="0.28" />
      <line x1="0" y1="44.1" x2="100" y2="44.1" stroke="rgba(147,197,253,0.42)" stroke-width="0.22" />

      <path d="M49 13 L53 15.8 L57 21 L61 24 L64 29.6 L65 40 L58.5 40 L55 38.2 L52.2 40 L43.8 40 L40.6 37.5 L38.6 33 L40.4 25.5 L44 19 L48 15.2 Z" fill="url(#icebergTop)" stroke="#bfdbfe" stroke-width="0.24" />
      <path d="M53 15.8 L57 21 L61 24 L64 29.6 L62 34.4 L58.4 31.4 L54.4 24.8 Z" fill="rgba(177,210,247,0.28)" />
      <path d="M44 19 L40.4 25.5 L38.6 33 L40.6 37.5 L44.8 35.8 L46.6 28.6 Z" fill="rgba(255,255,255,0.34)" />
      <path d="M49 13 L52 18.6 L53.8 27.8 L53 40" fill="none" stroke="rgba(255,255,255,0.48)" stroke-width="0.34" />
      <path d="M60.4 24.8 L62.2 29.4 L63.2 39.8" fill="none" stroke="rgba(255,255,255,0.24)" stroke-width="0.3" />

      <path d="M42.2 44 L57.8 44 L64.6 50 L68.6 60.4 L67 73.6 L63.2 84 L57.6 88.4 L53 88.4 L50 96 L47 88.4 L41 88.4 L36.8 83.6 L33.6 73.6 L32 60.6 L35.4 50.4 Z" fill="url(#icebergBottom)" stroke="#a7c6ee" stroke-width="0.24" />
      <path d="M57.8 44 L64.6 50 L68.6 60.4 L67 73.6 L63.2 84 L57.6 88.4 L54.4 78 L55.8 60.4 L54.8 50.2 Z" fill="rgba(255,255,255,0.12)" />
      <path d="M42.2 44 L35.4 50.4 L32 60.6 L33.6 73.6 L36.8 83.6 L41 88.4 L45.6 78.8 L44 62.8 L45.2 52.4 Z" fill="rgba(61,119,196,0.18)" />
      <path d="M42.2 44 L38.2 55.4 L36.2 72.4" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="0.3" />
      <path d="M57.8 44 L61.8 55.2 L63.8 72.8" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.3" />
      <path d="M50 96 L48.8 82.4 L49.4 65.4" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.3" />
    </svg>

    <div class="icebergWaterlineText">WATERLINE</div>

    <div class="icebergTipContent">
      <div class="icebergTag">{{ tip.tag }}</div>
      <div class="icebergTipTitle">{{ tip.title }}</div>
      <div v-if="tip.text" class="icebergTipText">{{ tip.text }}</div>
    </div>

    <div class="icebergBaseContent">
      <div class="icebergTag icebergTag--base">{{ base.tag }}</div>
      <div class="icebergBaseTitle">{{ base.title }}</div>
      <div v-if="baseSummary" class="icebergBaseText">{{ baseSummary }}</div>
      <div v-if="base.bullets?.length" class="icebergBaseItems">
        <div v-for="(item, index) in base.bullets" :key="index" class="icebergBaseItem">{{ item }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icebergRoot {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at 78% 10%, rgba(255, 255, 255, 0.34), transparent 22%),
    linear-gradient(180deg, #f8fbff 0%, #edf5ff 39%, #dcecff 39%, #c7dcf8 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 20px 36px rgba(20, 61, 122, 0.08);
}

.icebergScene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.icebergWaterlineText {
  position: absolute;
  right: 9%;
  top: 35.6%;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(191, 219, 254, 0.96);
  color: #1d6fe8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 24px;
}

.icebergTipContent,
.icebergBaseContent {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: grid;
  justify-items: center;
  text-align: center;
}

.icebergTipContent {
  top: 12%;
  width: min(28%, 280px);
  gap: 8px;
}

.icebergBaseContent {
  top: 47%;
  width: min(44%, 520px);
  gap: 10px;
}

.icebergTag {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(29, 111, 232, 0.1);
  color: #1d6fe8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.icebergTag--base {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.icebergTipTitle {
  color: #143d7a;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}

.icebergTipText {
  color: #475569;
  font-size: 13px;
  line-height: 1.55;
}

.icebergBaseTitle {
  color: #ffffff;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
}

.icebergBaseText {
  max-width: 86%;
  color: rgba(255, 255, 255, 0.92);
  font-size: 14px;
  line-height: 1.6;
}

.icebergBaseItems {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 90%;
  margin-top: 2px;
}

.icebergBaseItem {
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.3;
}

@media (max-width: 1180px) {
  .icebergTipContent {
    width: min(30%, 250px);
  }

  .icebergBaseContent {
    width: min(50%, 480px);
  }

  .icebergTipTitle {
    font-size: 20px;
  }

  .icebergBaseTitle {
    font-size: 24px;
  }

  .icebergBaseText {
    font-size: 13px;
  }
}
</style>
