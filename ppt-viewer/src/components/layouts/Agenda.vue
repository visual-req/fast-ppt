<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

type AgendaItem = {
  title: string;
  text?: string;
};

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readItem(item: unknown, index: number): AgendaItem {
  if (typeof item === "string") return { title: item };
  if (!item || typeof item !== "object" || Array.isArray(item)) return { title: `议题 ${index + 1}` };
  const record = item as Record<string, unknown>;
  return {
    title: toText(record.title) || toText(record.name) || `议题 ${index + 1}`,
    text: toText(record.text) || toText(record.desc) || toText(record.description)
  };
}

const items = computed<AgendaItem[]>(() => {
  const raw = Array.isArray(props.slide?.items)
    ? props.slide.items
    : Array.isArray(props.slide?.bullets)
      ? props.slide.bullets
      : [];

  const list = raw.slice(0, 4).map((item: unknown, index: number) => readItem(item, index));
  return list.length
    ? list
    : [
        { title: "为什么先看 outline", text: "先定结构，再定页面表达" },
        { title: "layout 如何选择", text: "按信息密度、关系结构和决策重点匹配版式" },
        { title: "SVG 和图表如何配合", text: "结构图负责表达逻辑，图表负责承载数据证据" },
        { title: "如何完成真实交付", text: "从 layout 到静态构建、文档资产与可交付产物" }
      ];
});

const subtitle = computed(() => toText(props.slide?.subtitle) || "4 Topics / 1 Flow");
</script>

<template>
  <div class="agendaRoot">
    <div class="agendaBubble agendaBubbleA"></div>
    <div class="agendaBubble agendaBubbleB"></div>
    <div class="agendaBubble agendaBubbleC"></div>
    <div class="agendaBubble agendaBubbleD"></div>

    <div class="agendaHeroGlow"></div>
    <div class="agendaHeroOrbit agendaHeroOrbitOuter"></div>
    <div class="agendaHeroOrbit agendaHeroOrbitInner"></div>

    <div class="agendaHeroCard">
      <div class="agendaHeroBadge">Agenda</div>
      <div class="agendaHeroBars">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="agendaHeroIcon">
        <span></span>
      </div>
      <div class="agendaHeroSubtitle">{{ subtitle }}</div>
    </div>

    <div class="agendaList">
      <div v-for="(item, index) in items" :key="index" class="agendaRow" :class="{ agendaRowPrimary: index === 0 }">
        <div class="agendaRowConnector"></div>
        <div class="agendaRowIndex">{{ index + 1 }}</div>
        <div class="agendaRowContent">
          <div class="agendaRowTitle">{{ item.title }}</div>
          <div v-if="item.text" class="agendaRowText">{{ item.text }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.agendaRoot {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: 28px 34px 28px 280px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 251, 255, 0.98) 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 20px 36px rgba(20, 61, 122, 0.08);
}

.agendaBubble,
.agendaHeroGlow,
.agendaHeroOrbit {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.agendaHeroGlow {
  left: -36px;
  top: 50%;
  width: 312px;
  height: 312px;
  transform: translateY(-50%);
  background: radial-gradient(circle, rgba(37, 99, 235, 0.14) 0%, rgba(77, 160, 255, 0.05) 68%, transparent 72%);
}

.agendaHeroOrbitOuter {
  left: 10px;
  top: 50%;
  width: 236px;
  height: 236px;
  transform: translateY(-50%);
  border: 2px solid rgba(37, 99, 235, 0.12);
}

.agendaHeroOrbitInner {
  left: 52px;
  top: 50%;
  width: 156px;
  height: 156px;
  transform: translateY(-50%);
  border: 2px solid rgba(37, 99, 235, 0.1);
}

.agendaBubbleA {
  left: 38px;
  top: 16%;
  width: 40px;
  height: 40px;
  background: rgba(37, 99, 235, 0.08);
}

.agendaBubbleB {
  left: 94px;
  top: 10%;
  width: 18px;
  height: 18px;
  background: rgba(37, 99, 235, 0.12);
}

.agendaBubbleC {
  right: 48px;
  top: 12%;
  width: 28px;
  height: 28px;
  background: rgba(147, 197, 253, 0.14);
}

.agendaBubbleD {
  right: 86px;
  bottom: 10%;
  width: 18px;
  height: 18px;
  background: rgba(37, 99, 235, 0.1);
}

.agendaHeroCard {
  position: absolute;
  left: 62px;
  top: 50%;
  width: 184px;
  transform: translateY(-50%);
  padding: 22px 20px 20px;
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 18px 34px rgba(20, 61, 122, 0.08);
}

.agendaHeroBadge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d6fe8;
  font-size: 14px;
  font-weight: 800;
}

.agendaHeroBars {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.agendaHeroBars span {
  display: block;
  height: 14px;
  border-radius: 999px;
  background: #dbeafe;
}

.agendaHeroBars span:nth-child(2) {
  width: 70%;
  background: #93c5fd;
}

.agendaHeroBars span:nth-child(3) {
  width: 78%;
  background: #60a5fa;
}

.agendaHeroBars span:nth-child(4) {
  width: 88%;
  background: #2563eb;
}

.agendaHeroIcon {
  width: 68px;
  height: 68px;
  margin: 18px 0 14px auto;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.agendaHeroIcon span {
  width: 34px;
  height: 28px;
  border-left: 5px solid #2563eb;
  border-bottom: 5px solid #2563eb;
  transform: skewX(-18deg) rotate(-8deg);
  border-radius: 2px;
}

.agendaHeroSubtitle {
  display: grid;
  place-items: center;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  background: #eff6ff;
  border: 1px solid rgba(215, 227, 244, 0.96);
  color: #1d6fe8;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.agendaList {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: repeat(4, minmax(0, 1fr));
  gap: 16px;
  height: 100%;
}

.agendaRow {
  position: relative;
  min-height: 0;
  display: grid;
  grid-template-columns: 52px 52px minmax(0, 1fr);
  align-items: center;
  column-gap: 14px;
  padding: 22px 24px 22px 0;
  border-radius: 26px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
}

.agendaRowPrimary {
  background: #eff6ff;
}

.agendaRowConnector {
  justify-self: center;
  width: 44px;
  height: 0;
  border-top: 4px dashed #93c5fd;
}

.agendaRowIndex {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #93c5fd;
  color: #ffffff;
  font-size: 22px;
  font-weight: 800;
}

.agendaRowPrimary .agendaRowIndex {
  background: #2563eb;
}

.agendaRowContent {
  min-width: 0;
}

.agendaRowTitle {
  color: #0f172a;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.25;
}

.agendaRowText {
  margin-top: 8px;
  color: #475569;
  font-size: 16px;
  line-height: 1.5;
}

@media (max-width: 1180px) {
  .agendaRoot {
    padding-left: 232px;
  }

  .agendaHeroGlow {
    width: 260px;
    height: 260px;
  }

  .agendaHeroCard {
    left: 48px;
    width: 160px;
  }

  .agendaRowTitle {
    font-size: 20px;
  }

  .agendaRowText {
    font-size: 14px;
  }
}
</style>
