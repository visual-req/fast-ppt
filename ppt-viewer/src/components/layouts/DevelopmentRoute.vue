<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps<{ slide: any }>();

type RouteStage = {
  phase?: string;
  title?: string;
  text?: string;
  tag?: string;
};

const positions = [
  { nodeX: 18, nodeY: 74, cardX: 8, cardY: 78, align: "left" as const },
  { nodeX: 36, nodeY: 59, cardX: 24, cardY: 34, align: "left" as const },
  { nodeX: 55, nodeY: 47, cardX: 44, cardY: 56, align: "left" as const },
  { nodeX: 73, nodeY: 31, cardX: 62, cardY: 8, align: "left" as const },
  { nodeX: 86, nodeY: 18, cardX: 70, cardY: 54, align: "left" as const }
];

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

const stages = computed<RouteStage[]>(() => {
  const raw = Array.isArray(props.slide?.stages)
    ? props.slide.stages
    : Array.isArray(props.slide?.items)
      ? props.slide.items
      : Array.isArray(props.slide?.blocks)
        ? props.slide.blocks
        : [];
  return raw.slice(0, 5).map((item: unknown, index: number) => {
    if (typeof item === "string") return { title: item, phase: `阶段 ${index + 1}` };
    if (!item || typeof item !== "object" || Array.isArray(item)) return { title: `阶段 ${index + 1}` };
    const record = item as Record<string, unknown>;
    return {
      phase: toText(record.phase) || `阶段 ${index + 1}`,
      title: toText(record.title) || toText(record.name) || `阶段 ${index + 1}`,
      text: toText(record.text),
      tag: toText(record.tag)
    };
  });
});

const destination = computed(() => {
  const raw =
    props.slide?.destination && typeof props.slide.destination === "object" && !Array.isArray(props.slide.destination)
      ? props.slide.destination
      : props.slide?.goal && typeof props.slide.goal === "object" && !Array.isArray(props.slide.goal)
        ? props.slide.goal
        : {};
  return {
    title: toText(raw.title) || "目标状态",
    text: toText(raw.text) || toText(props.slide?.summary) || "形成清晰的发展路径、阶段目标与组织支撑能力。"
  };
});

const baseLabel = computed(() => toText(props.slide?.base_label) || "当前基础");
</script>

<template>
  <Card v-if="!stages.length" title="无数据" />
  <div v-else class="developmentRouteRoot">
    <svg class="developmentRouteMountains" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M6 96 C14 88 20 82 28 74 C36 66 42 56 48 46 C54 36 60 28 66 30 C72 32 76 42 81 46 C86 50 90 48 94 44 L94 100 L6 100 Z" class="mountainBack" />
      <path d="M10 100 C18 92 24 86 32 78 C40 70 46 60 52 50 C58 40 64 32 70 34 C76 36 80 46 85 52 C89 56 92 58 96 58 L96 100 Z" class="mountainMid" />
      <path d="M14 100 C22 94 28 88 36 80 C44 72 50 62 56 52 C62 42 68 34 74 38 C80 42 84 52 88 58 C92 64 95 68 98 70 L98 100 Z" class="mountainFront" />
      <path d="M14 100 C22 94 28 88 36 80 C44 72 50 62 56 52 C62 42 68 34 74 38 C80 42 84 52 88 58 C92 64 95 68 98 70" class="mountainRidge1" />
      <path d="M10 100 C18 92 24 86 32 78 C40 70 46 60 52 50 C58 40 64 32 70 34 C76 36 80 46 85 52 C89 56 92 58 96 58" class="mountainRidge2" />
    </svg>

    <svg class="developmentRouteTrack" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="developmentRouteStroke" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stop-color="#8fbaf4" />
          <stop offset="100%" stop-color="#1d6fe8" />
        </linearGradient>
      </defs>
      <path
        d="M10 80 C16 76 22 72 28 66 C34 60 40 54 46 46 C52 38 58 32 64 34 C70 36 74 46 79 48 C84 50 88 46 92 40"
        fill="none"
        stroke="url(#developmentRouteStroke)"
        stroke-width="6"
        stroke-linecap="round"
      />
      <path
        d="M10 80 C16 76 22 72 28 66 C34 60 40 54 46 46 C52 38 58 32 64 34 C70 36 74 46 79 48 C84 50 88 46 92 40"
        fill="none"
        stroke="#bfdbfe"
        stroke-width="1.1"
        stroke-dasharray="1.6 1.9"
        stroke-linecap="round"
      />
    </svg>

    <div class="developmentRouteBase">
      <div class="developmentRouteBaseTag">START</div>
      <div class="developmentRouteBaseTitle">{{ baseLabel }}</div>
    </div>

    <div
      v-for="(stage, index) in stages"
      :key="index"
      class="developmentRouteNode"
      :style="{ left: `${positions[index]?.nodeX ?? 18}%`, top: `${positions[index]?.nodeY ?? 74}%` }"
    >
      <div class="developmentRouteNodeCircle">
        <div class="developmentRouteNodeInner">{{ index + 1 }}</div>
      </div>
      <div
        class="developmentRouteCard"
        :style="{ left: `${positions[index]?.cardX ?? 8}%`, top: `${positions[index]?.cardY ?? 78}%` }"
      >
        <div v-if="stage.phase || stage.tag" class="developmentRouteCardTag">{{ stage.phase || stage.tag }}</div>
        <div class="developmentRouteCardTitle">{{ stage.title || `阶段 ${index + 1}` }}</div>
        <div v-if="stage.text" class="developmentRouteCardText">{{ stage.text }}</div>
      </div>
    </div>

    <div class="developmentRouteGoal">
      <div class="developmentRouteGoalIcon">
        <span></span>
      </div>
      <div class="developmentRouteGoalLabel">Destination</div>
      <div class="developmentRouteGoalTitle">{{ destination.title }}</div>
      <div class="developmentRouteGoalText">{{ destination.text }}</div>
    </div>
  </div>
</template>

<style scoped>
.developmentRouteRoot {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.16), transparent 34%),
    linear-gradient(180deg, #f7faff 0%, #eef4fb 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
}

.developmentRouteMountains,
.developmentRouteTrack {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.mountainBack {
  fill: #dce7f5;
}

.mountainMid {
  fill: rgba(198, 214, 234, 0.86);
}

.mountainFront {
  fill: #b5cde9;
}

.mountainRidge1 {
  fill: none;
  stroke: rgba(255, 255, 255, 0.36);
  stroke-width: 0.9;
  stroke-linecap: round;
}

.mountainRidge2 {
  fill: none;
  stroke: rgba(255, 255, 255, 0.24);
  stroke-width: 0.6;
  stroke-linecap: round;
}

.developmentRouteBase {
  position: absolute;
  left: 8%;
  bottom: 10%;
  width: 140px;
  padding: 14px 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 14px 28px rgba(20, 61, 122, 0.08);
}

.developmentRouteBaseTag,
.developmentRouteCardTag,
.developmentRouteGoalLabel {
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
  text-transform: uppercase;
}

.developmentRouteBaseTitle {
  margin-top: 8px;
  color: #143d7a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
}

.developmentRouteNode {
  position: absolute;
  transform: translate(-50%, -50%);
}

.developmentRouteNodeCircle {
  width: 60px;
  height: 60px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffffff 0%, #edf4ff 100%);
  border: 6px solid #1d6fe8;
  box-shadow: 0 16px 30px rgba(20, 61, 122, 0.12);
}

.developmentRouteNodeInner {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(29, 111, 232, 0.08);
  color: #143d7a;
  font-size: 16px;
  font-weight: 800;
}

.developmentRouteCard {
  position: absolute;
  width: 214px;
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 14px 28px rgba(20, 61, 122, 0.1);
}

.developmentRouteCardTitle,
.developmentRouteGoalTitle {
  margin-top: 8px;
  color: #143d7a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.35;
}

.developmentRouteCardText,
.developmentRouteGoalText {
  margin-top: 6px;
  color: #475569;
  font-size: 13px;
  line-height: 1.55;
}

.developmentRouteGoal {
  position: absolute;
  right: 5%;
  top: 8%;
  width: 250px;
  padding: 18px 18px 16px;
  border-radius: 24px;
  background: linear-gradient(135deg, #1f4f97 0%, #123b7a 100%);
  color: #ffffff;
  box-shadow: 0 18px 34px rgba(18, 59, 122, 0.16);
}

.developmentRouteGoalIcon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.developmentRouteGoalIcon span {
  width: 24px;
  height: 24px;
  border-radius: 999px 999px 2px 999px;
  background: #ffffff;
  transform: rotate(45deg);
}

.developmentRouteGoalLabel {
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
}

.developmentRouteGoalText {
  color: rgba(255, 255, 255, 0.84);
}

@media (max-width: 1180px) {
  .developmentRouteCard {
    width: 184px;
  }

  .developmentRouteCardTitle,
  .developmentRouteGoalTitle {
    font-size: 16px;
  }

  .developmentRouteCardText,
  .developmentRouteGoalText {
    font-size: 12px;
  }

  .developmentRouteGoal {
    width: 220px;
  }
}
</style>
