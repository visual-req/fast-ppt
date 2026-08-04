<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type CycleItem = {
  title?: string;
  text?: string;
  tag?: string;
};

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

const center = computed(() => {
  const raw =
    props.slide?.center && typeof props.slide.center === "object" && !Array.isArray(props.slide.center)
      ? props.slide.center
      : {};
  return {
    tag: toText(raw.tag) || "CYCLE",
    title: toText(raw.title) || "核心闭环",
    text: toText(raw.text) || "把关键动作组织成持续迭代、持续优化的循环机制。"
  };
});

const items = computed<CycleItem[]>(() => {
  const raw = Array.isArray(props.slide?.items)
    ? props.slide.items
    : Array.isArray(props.slide?.steps)
      ? props.slide.steps
      : Array.isArray(props.slide?.blocks)
        ? props.slide.blocks
        : [];
  return raw.slice(0, 6).map((item: unknown, index: number) => {
    if (typeof item === "string") return { title: item, tag: `0${index + 1}`.slice(-2) };
    if (!item || typeof item !== "object" || Array.isArray(item)) return { title: `环节 ${index + 1}` };
    const record = item as Record<string, unknown>;
    return {
      title: toText(record.title) || toText(record.name) || `环节 ${index + 1}`,
      text: toText(record.text),
      tag: toText(record.tag) || `0${index + 1}`.slice(-2)
    };
  });
});

const layoutItems = computed(() => {
  const radius = 34;
  const centerX = 50;
  const centerY = 50;
  const list = items.value;
  const count = Math.max(list.length, 1);

  return list.map((item, index) => {
    const angle = (-90 + (360 / count) * index) * (Math.PI / 180);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const cardDistance = 17;
    const cardX = centerX + (radius + cardDistance) * Math.cos(angle);
    const cardY = centerY + (radius + cardDistance) * Math.sin(angle);
    const isLeft = x < centerX - 4;
    const isRight = x > centerX + 4;
    const isTop = y < centerY - 6;
    let transform = "translate(-50%, -50%)";
    if (isLeft) transform = "translate(-100%, -50%)";
    if (isRight) transform = "translate(0, -50%)";
    if (!isLeft && !isRight && isTop) transform = "translate(-50%, -100%)";
    if (!isLeft && !isRight && !isTop) transform = "translate(-50%, 0)";

    return {
      ...item,
      index,
      x,
      y,
      cardX,
      cardY,
      transform
    };
  });
});

function connectorPath(x: number, y: number): string {
  const cx = 50;
  const cy = 50;
  const mx = (cx + x) / 2;
  const my = (cy + y) / 2;
  return `M ${cx} ${cy} Q ${mx} ${my} ${x} ${y}`;
}
</script>

<template>
  <Card v-if="!layoutItems.length" title="无数据" />
  <div v-else class="cycleRoot">
    <svg class="cycleTrack" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="cycleStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1f4f97" />
          <stop offset="100%" stop-color="#1d6fe8" />
        </linearGradient>
        <marker id="cycleArrow" markerWidth="4" markerHeight="4" refX="2.2" refY="2" orient="auto" markerUnits="strokeWidth">
          <path d="M0.2 0.4 L3.4 2 L0.2 3.6 L1.1 2 Z" fill="#2a68d8" />
        </marker>
      </defs>

      <circle cx="50" cy="50" r="29" fill="none" stroke="#dbeafe" stroke-width="10" />
      <circle cx="50" cy="50" r="29" fill="none" stroke="url(#cycleStroke)" stroke-width="4.8" />
      <path d="M63.5 24.3 A29 29 0 0 1 75.7 36.5" fill="none" stroke="#2a68d8" stroke-width="2.2" stroke-linecap="round" marker-end="url(#cycleArrow)" />
      <path d="M76.6 54.1 A29 29 0 0 1 62.6 74.8" fill="none" stroke="#2a68d8" stroke-width="2.2" stroke-linecap="round" marker-end="url(#cycleArrow)" />
      <path d="M37.7 76 A29 29 0 0 1 23.8 48.8" fill="none" stroke="#2a68d8" stroke-width="2.2" stroke-linecap="round" marker-end="url(#cycleArrow)" />

      <path
        v-for="item in layoutItems"
        :key="`line-${item.index}`"
        :d="connectorPath(item.x, item.y)"
        fill="none"
        stroke="rgba(96, 165, 250, 0.72)"
        stroke-width="0.8"
        stroke-linecap="round"
      />
    </svg>

    <div class="cycleCenter">
      <div class="cycleCenterTag">{{ center.tag }}</div>
      <div class="cycleCenterTitle">{{ center.title }}</div>
      <div class="cycleCenterText">{{ center.text }}</div>
    </div>

    <div
      v-for="item in layoutItems"
      :key="item.index"
      class="cycleNode"
      :style="{ left: `${item.x}%`, top: `${item.y}%` }"
    >
      <div class="cycleNodeDot">{{ item.tag || String(item.index + 1).padStart(2, '0') }}</div>
    </div>

    <div
      v-for="item in layoutItems"
      :key="`card-${item.index}`"
      class="cycleCard"
      :style="{ left: `${item.cardX}%`, top: `${item.cardY}%`, transform: item.transform }"
    >
      <div class="cycleCardTitle">{{ item.title || `环节 ${item.index + 1}` }}</div>
      <div v-if="item.text" class="cycleCardText">{{ item.text }}</div>
    </div>
  </div>
</template>

<style scoped>
.cycleRoot {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.16), transparent 34%),
    linear-gradient(180deg, #f7faff 0%, #eef4fb 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 20px 36px rgba(20, 61, 122, 0.08);
}

.cycleTrack {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.cycleCenter {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(34%, 280px);
  min-width: 220px;
  transform: translate(-50%, -50%);
  padding: 18px 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 18px 36px rgba(20, 61, 122, 0.1);
  text-align: center;
}

.cycleCenterTag {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(29, 111, 232, 0.08);
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.cycleCenterTitle {
  margin-top: 10px;
  color: #143d7a;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.3;
}

.cycleCenterText {
  margin-top: 8px;
  color: #475569;
  font-size: 13px;
  line-height: 1.55;
}

.cycleNode {
  position: absolute;
  transform: translate(-50%, -50%);
}

.cycleNodeDot {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #ffffff;
  border: 6px solid #1d6fe8;
  box-shadow: 0 14px 28px rgba(20, 61, 122, 0.12);
  color: #143d7a;
  font-size: 14px;
  font-weight: 800;
}

.cycleCard {
  position: absolute;
  width: 180px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 14px 28px rgba(20, 61, 122, 0.1);
}

.cycleCardTitle {
  color: #143d7a;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.35;
}

.cycleCardText {
  margin-top: 6px;
  color: #475569;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 1180px) {
  .cycleCenterTitle {
    font-size: 20px;
  }

  .cycleCard {
    width: 162px;
    padding: 12px 14px;
  }

  .cycleCardTitle {
    font-size: 14px;
  }
}
</style>
