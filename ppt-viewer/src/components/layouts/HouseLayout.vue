<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type HousePillar = {
  title?: string;
  text?: string;
  tag?: string;
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
    .slice(0, 3);
}

function asPillar(item: unknown, index: number): HousePillar {
  if (typeof item === "string") {
    return { title: item };
  }

  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return { title: `支柱 ${index + 1}` };
  }

  const record = item as Record<string, unknown>;
  return {
    title: toText(record.title) || toText(record.name) || `支柱 ${index + 1}`,
    text: toText(record.text),
    tag: toText(record.tag),
    bullets: toStrings(record.bullets)
  };
}

const roof = computed(() => {
  const raw =
    props.slide?.roof && typeof props.slide.roof === "object" && !Array.isArray(props.slide.roof)
      ? props.slide.roof
      : props.slide?.top && typeof props.slide.top === "object" && !Array.isArray(props.slide.top)
        ? props.slide.top
        : {};
  return {
    title: toText(raw.title) || "战略屋顶",
    text: toText(raw.text) || "统一目标、方法论与衡量口径"
  };
});

const pillars = computed<HousePillar[]>(() => {
  const raw = Array.isArray(props.slide?.pillars)
    ? props.slide.pillars
    : Array.isArray(props.slide?.columns)
      ? props.slide.columns
      : Array.isArray(props.slide?.blocks)
        ? props.slide.blocks
        : [];
  return raw.slice(0, 4).map((item: unknown, index: number) => asPillar(item, index));
});

const foundation = computed(() => {
  const raw =
    props.slide?.foundation && typeof props.slide.foundation === "object" && !Array.isArray(props.slide.foundation)
      ? props.slide.foundation
      : props.slide?.base && typeof props.slide.base === "object" && !Array.isArray(props.slide.base)
        ? props.slide.base
        : props.slide?.bottom && typeof props.slide.bottom === "object" && !Array.isArray(props.slide.bottom)
          ? props.slide.bottom
          : {};
  return {
    title: toText(raw.title) || "基础底座",
    text: toText(raw.text),
    items: toStrings(raw.items ?? raw.bullets)
  };
});

const palette = [
  ["#2563eb", "#1d4ed8", "rgba(37,99,235,.14)"],
  ["#3b82f6", "#2563eb", "rgba(59,130,246,.14)"],
  ["#60a5fa", "#3b82f6", "rgba(96,165,250,.16)"],
  ["#93c5fd", "#60a5fa", "rgba(147,197,253,.18)"]
] as const;

function pillarStyle(index: number) {
  const [from, to, soft] = palette[index % palette.length];
  return {
    "--pillar-from": from,
    "--pillar-to": to,
    "--pillar-soft": soft
  };
}
</script>

<template>
  <Card v-if="!pillars.length" title="无数据" />
  <div v-else class="houseRoot">
    <div class="houseShell">
      <div class="houseRoofWrap">
        <div class="houseRoof">
          <div class="houseRoofTitle">{{ roof.title }}</div>
        </div>
      </div>

      <div class="housePillars" :style="{ gridTemplateColumns: `repeat(${Math.max(pillars.length, 1)}, minmax(0, 1fr))` }">
        <div v-for="(pillar, index) in pillars" :key="index" class="housePillar" :style="pillarStyle(index)">
          <div class="housePillarCap"></div>
          <div class="housePillarBody">
            <div v-if="toText(pillar.tag)" class="housePillarTag">{{ pillar.tag }}</div>
            <div class="housePillarTitle">{{ toText(pillar.title) || `支柱 ${index + 1}` }}</div>
            <div v-if="toText(pillar.text)" class="housePillarText">{{ pillar.text }}</div>
            <ul v-else-if="pillar.bullets?.length" class="housePillarBullets">
              <li v-for="(bullet, bulletIndex) in pillar.bullets" :key="bulletIndex">{{ bullet }}</li>
            </ul>
          </div>
          <div class="housePillarFoot"></div>
        </div>
      </div>

      <div class="houseFoundation">
        <div class="houseFoundationAccent"></div>
        <div class="houseFoundationTitle">{{ foundation.title }}</div>
        <div v-if="foundation.text" class="houseFoundationText">{{ foundation.text }}</div>
        <div v-if="foundation.items.length" class="houseFoundationItems">
          <div v-for="(item, index) in foundation.items" :key="index" class="houseFoundationItem">{{ item }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.houseRoot {
  height: 100%;
  min-height: 0;
}

.houseShell {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: 104px minmax(0, 1fr) 108px;
  gap: 12px;
  overflow: hidden;
  padding: 4px 0;
}

.houseRoofWrap {
  position: relative;
  display: grid;
  justify-items: center;
  align-items: end;
  min-height: 0;
}

.houseRoof {
  position: relative;
  width: min(86%, 920px);
  height: 100%;
  min-height: 0;
  padding: 10px 16% 12px;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.02) 28%),
    linear-gradient(135deg, #60a5fa 0%, #2563eb 52%, #1d4ed8 100%);
  border: 1px solid rgba(191, 219, 254, 0.92);
  box-shadow: 0 18px 34px rgba(20, 61, 122, 0.16);
  color: #ffffff;
  display: grid;
  align-content: end;
  justify-items: center;
  gap: 4px;
  text-align: center;
  overflow: hidden;
}

.houseRoof::after {
  content: "";
  position: absolute;
  left: 12%;
  right: 12%;
  bottom: 0;
  height: 8px;
  border-radius: 999px 999px 0 0;
  background: rgba(255, 255, 255, 0.22);
}

.houseRoofTitle {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.12;
}

.houseRoofText {
  max-width: 440px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.4;
}

.housePillars {
  display: grid;
  gap: 14px;
  min-height: 0;
  align-items: stretch;
}

.housePillar {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: 18px minmax(0, 1fr) 18px;
  gap: 6px;
}

.housePillarCap,
.housePillarFoot {
  justify-self: center;
  width: calc(100% - 22px);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(239, 246, 255, 0.98)),
    var(--pillar-soft);
  border: 1px solid rgba(191, 219, 254, 0.92);
  box-shadow: 0 10px 18px rgba(20, 61, 122, 0.08);
}

.housePillarBody {
  position: relative;
  min-height: 0;
  padding: 22px 16px 18px;
  border-radius: 26px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 251, 255, 0.98) 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 18px 30px rgba(20, 61, 122, 0.08);
  overflow: hidden;
}

.housePillarBody::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 10px;
  background: linear-gradient(180deg, var(--pillar-from) 0%, var(--pillar-to) 100%);
}

.housePillarTag {
  position: relative;
  margin-left: 8px;
  color: var(--pillar-to);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.housePillarTitle {
  position: relative;
  margin-top: 10px;
  margin-left: 8px;
  color: #143d7a;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
}

.housePillarText {
  position: relative;
  margin-top: 10px;
  margin-left: 8px;
  color: #475569;
  font-size: 14px;
  line-height: 1.5;
}

.housePillarBullets {
  position: relative;
  margin: 10px 0 0 26px;
  padding: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.45;
  display: grid;
  gap: 6px;
}

.houseFoundation {
  position: relative;
  min-height: 0;
  padding: 18px 24px 14px;
  border-radius: 0;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.14), transparent 26%),
    linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid rgba(191, 219, 254, 0.96);
  box-shadow: 0 18px 32px rgba(20, 61, 122, 0.09);
  overflow: hidden;
}

.houseFoundationAccent {
  position: absolute;
  left: 28px;
  right: 28px;
  top: 0;
  height: 9px;
  background: linear-gradient(90deg, #60a5fa 0%, #2563eb 45%, #1d4ed8 100%);
}

.houseFoundationTitle {
  color: #143d7a;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}

.houseFoundationText {
  margin-top: 8px;
  color: #475569;
  font-size: 14px;
  line-height: 1.45;
}

.houseFoundationItems {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.houseFoundationItem {
  padding: 7px 12px;
  border-radius: 0;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(191, 219, 254, 0.9);
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
}

@media (max-width: 1180px) {
  .houseShell {
    grid-template-rows: 92px minmax(0, 1fr) 102px;
  }

  .houseRoof {
    width: 90%;
    padding-inline: 14%;
  }

  .houseRoofTitle {
    font-size: 22px;
  }

  .houseRoofText,
  .housePillarText,
  .housePillarBullets,
  .houseFoundationText {
    font-size: 12px;
  }

  .housePillarTitle,
  .houseFoundationTitle {
    font-size: 18px;
  }
}
</style>
