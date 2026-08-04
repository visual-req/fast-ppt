<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

type SectorCard = {
  title: string;
  text: string;
  badge: string;
  accentFrom: string;
  accentTo: string;
  labelX: number;
  labelY: number;
};

const presets: SectorCard[] = [
  {
    title: "用户洞察",
    text: "先把用户分层、场景差异和关键反馈看清，避免所有动作都建立在“平均用户”的想象上。",
    badge: "01",
    accentFrom: "#2275eb",
    accentTo: "#165bc3",
    labelX: 278,
    labelY: 244
  },
  {
    title: "方案设计",
    text: "把问题拆成阶段动作、责任人和评价口径，让“要做什么、先做什么、为什么这么做”全部落到纸面上。",
    badge: "02",
    accentFrom: "#1a65d8",
    accentTo: "#174fae",
    labelX: 358,
    labelY: 366
  },
  {
    title: "执行落地",
    text: "围绕时间表、资源配置和协作链路推进实施，把抽象策略变成团队真正会执行的动作序列。",
    badge: "03",
    accentFrom: "#2284ff",
    accentTo: "#1964d3",
      labelX: 438,
    labelY: 522
  },
  {
    title: "结果复盘",
    text: "把结果、经验和问题回收进同一个闭环，形成下一轮可复用的模板、规则和优化方向。",
    badge: "04",
    accentFrom: "#2d93ff",
    accentTo: "#1b6fe4",
      labelX: 364,
      labelY: 632
  }
];

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toBullets(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item ?? "").trim()).filter((item) => item.length > 0).slice(0, 2)
    : [];
}

const centerTitle = computed(() => toText(props.slide?.center_title) || toText(props.slide?.center?.title) || "核心议题");

const sectors = computed((): SectorCard[] => {
  const raw = Array.isArray(props.slide?.sectors)
    ? props.slide.sectors
    : Array.isArray(props.slide?.items)
      ? props.slide.items
      : Array.isArray(props.slide?.blocks)
        ? props.slide.blocks
        : [];

  return presets.map((preset, index) => {
    const item = raw[index];
    if (typeof item === "string") {
      return { ...preset, title: item };
    }

    if (item && typeof item === "object" && !Array.isArray(item)) {
      const record = item as Record<string, unknown>;
      const title = toText(record.title) || toText(record.name) || preset.title;
      const text = toText(record.text) || toBullets(record.bullets).join(" / ") || preset.text;
      return { ...preset, title, text };
    }

    return preset;
  });
});
</script>

<template>
  <div class="sectorExplainerRoot">
    <div class="sectorVisualShell">
      <svg class="sectorVisual" viewBox="-120 120 760 760" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id="sectorBand1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1a65d8"/>
            <stop offset="100%" stop-color="#174fae"/>
          </linearGradient>
          <linearGradient id="sectorBand2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2275eb"/>
            <stop offset="100%" stop-color="#165bc3"/>
          </linearGradient>
          <linearGradient id="sectorBand3" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2284ff"/>
            <stop offset="100%" stop-color="#1964d3"/>
          </linearGradient>
          <linearGradient id="sectorBand4" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2d93ff"/>
            <stop offset="100%" stop-color="#1b6fe4"/>
          </linearGradient>
          <filter id="sectorRingShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#1e3a5f" flood-opacity="0.12"/>
          </filter>
          <filter id="sectorSoftShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#1e3a5f" flood-opacity="0.10"/>
          </filter>
        </defs>

        <g transform="rotate(90 210 520)">
          <circle cx="210" cy="520" r="344" fill="#eaf1fa" opacity="0.82"/>
          <path d="M-90 520 A300 300 0 0 1 510 520 L372 520 A162 162 0 0 0 48 520 Z" fill="#dfe9f6" opacity="0.82" filter="url(#sectorRingShadow)"/>
          <path d="M-68 520 A278 278 0 0 1 488 520 L390 520 A180 180 0 0 0 30 520 Z" fill="#eef4fb" opacity="0.96"/>

          <path d="M-90 520 A300 300 0 0 1 -12.9 319.3 L89.6 411.6 A162 162 0 0 0 48 520 Z" fill="url(#sectorBand1)"/>
          <path d="M1.6 304.2 A300 300 0 0 1 199.5 220.2 L204.3 358.1 A162 162 0 0 0 97.5 403.5 Z" fill="url(#sectorBand2)"/>
          <path d="M220.5 220.2 A300 300 0 0 1 418.4 304.2 L322.5 403.5 A162 162 0 0 0 215.7 358.1 Z" fill="url(#sectorBand3)"/>
          <path d="M432.9 319.3 A300 300 0 0 1 510 520 L372 520 A162 162 0 0 0 330.4 411.6 Z" fill="url(#sectorBand4)"/>
        </g>

        <circle cx="210" cy="520" r="150" fill="#ffffff" filter="url(#sectorSoftShadow)"/>
        <circle cx="210" cy="520" r="118" fill="#f7fbff" stroke="#d7e3f4" stroke-width="2"/>
        <text x="210" y="532" class="sectorCenterTitle" text-anchor="middle">{{ centerTitle }}</text>

        <text v-for="(sector, index) in sectors" :key="index" :x="sector.labelX" :y="sector.labelY" class="sectorLabel" text-anchor="middle">
          {{ sector.title }}
        </text>
      </svg>
    </div>

    <div class="sectorCards">
      <div v-for="(sector, index) in sectors" :key="`card-${index}`" class="sectorCard" :style="{ '--accent-from': sector.accentFrom, '--accent-to': sector.accentTo }">
        <div class="sectorCardRail"></div>
        <div class="sectorCardBadge">{{ sector.badge }}</div>
        <div class="sectorCardTitle">{{ sector.title }}</div>
        <div class="sectorCardText">{{ sector.text }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sectorExplainerRoot {
  display: grid;
  grid-template-columns: minmax(320px, 0.88fr) minmax(0, 1.22fr);
  gap: 20px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.sectorVisualShell {
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.sectorVisual {
  width: 128%;
  height: 100%;
  transform: translateX(-20%);
}

.sectorCenterTitle {
  fill: #143d7a;
  font-size: 34px;
  font-family: Arial, sans-serif;
  font-weight: 700;
}

.sectorLabel {
  fill: #ffffff;
  font-size: 20px;
  font-family: Arial, sans-serif;
  font-weight: 700;
}

.sectorCards {
  display: grid;
  grid-template-rows: repeat(4, minmax(0, 1fr));
  gap: 14px;
  min-width: 0;
  min-height: 0;
}

.sectorCard {
  position: relative;
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-columns: 14px 66px minmax(112px, auto) minmax(0, 1fr);
  align-items: start;
  column-gap: 14px;
  padding: 22px 22px 18px 0;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 255, 0.98) 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 18px 34px rgba(20, 61, 122, 0.08);
}

.sectorCardRail {
  align-self: stretch;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--accent-from) 0%, var(--accent-to) 100%);
}

.sectorCardBadge {
  display: grid;
  place-items: center;
  min-height: 34px;
  margin-top: 2px;
  padding: 0 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent-from) 0%, var(--accent-to) 100%);
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
}

.sectorCardTitle {
  margin-top: 2px;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--fppt-text, #143d7a);
}

.sectorCardText {
  margin-top: 4px;
  font-size: 16px;
  line-height: 1.55;
  color: var(--fppt-muted, #475569);
}

@media (max-width: 1180px) {
  .sectorExplainerRoot {
    grid-template-columns: minmax(280px, 0.82fr) minmax(0, 1.18fr);
    gap: 16px;
  }

  .sectorLabel {
    font-size: 18px;
  }

  .sectorCard {
    grid-template-columns: 12px 58px minmax(96px, auto) minmax(0, 1fr);
    column-gap: 12px;
    padding-right: 18px;
  }

  .sectorCardTitle {
    font-size: 21px;
  }

  .sectorCardText {
    font-size: 15px;
  }
}
</style>
