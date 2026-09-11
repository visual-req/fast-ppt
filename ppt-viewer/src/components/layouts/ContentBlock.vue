<script setup lang="ts">
import { computed } from "vue";
import Bullets from "./Bullets.vue";
import Card from "./Card.vue";
import TableLayout from "./TableLayout.vue";
import GenericLayout from "./GenericLayout.vue";
import PieChart from "./PieChart.vue";
import BarChart from "./BarChart.vue";
import LineChart from "./LineChart.vue";
import RadarChart from "./RadarChart.vue";
import GanttChart from "./GanttChart.vue";
import MindMap from "./MindMap.vue";

const props = defineProps<{ block?: any }>();

const kind = computed(() => {
  const b = props.block;
  if (!b || typeof b !== "object") return "empty";
  if (b.image || b.image_path || b.image_url) return "image";
  if (b.table) return "table";
  if (b.chart) return "chart";
  if (Array.isArray(b.flow)) return "flow";
  if (Array.isArray(b.blocks)) return "blocks";
  if (Array.isArray(b.bullets)) return "bullets";
  if (typeof b.text === "string") return "text";
  return "generic";
});

const flowSteps = computed(() => {
  const raw = props.block?.flow;
  return Array.isArray(raw) ? raw.slice(0, 6) : [];
});

const FLOW_PALETTE = ["#1d6fe8", "#0ea5e9", "#10b981", "#8b5cf6", "#ef4444", "#f59e0b"];

function flowAccent(index: number): string {
  const step = flowSteps.value[index];
  const own = typeof step?.accent === "string" && step.accent.trim() ? step.accent.trim() : "";
  return own || FLOW_PALETTE[index % FLOW_PALETTE.length];
}

function flowText(step: any): string {
  if (typeof step?.text === "string") return step.text;
  if (typeof step?.note === "string") return step.note;
  if (typeof step?.subtitle === "string") return step.subtitle;
  return "";
}

const imageBlock = computed(() => {
  const b = props.block;
  if (!b || typeof b !== "object") return null;
  if (typeof b.image === "string") return { src: b.image, alt: b.title ?? "image", caption: b.caption ?? "" };
  if (b.image && typeof b.image === "object") {
    return {
      src: b.image.src ?? b.image.url ?? "",
      alt: b.image.alt ?? b.title ?? "image",
      caption: b.image.caption ?? b.caption ?? ""
    };
  }
  const src = b.image_path ?? b.image_url;
  if (!src) return null;
  return { src, alt: b.title ?? "image", caption: b.caption ?? "" };
});

const chartSlide = computed(() => {
  const b = props.block;
  const c = b?.chart;
  if (!c || typeof c !== "object") return null;
  const layout_type = typeof c.layout_type === "string" ? c.layout_type : typeof c.type === "string" ? c.type : "title_bullets";
  return { ...c, layout_type };
});

const chartType = computed(() => (chartSlide.value && typeof chartSlide.value.layout_type === "string" ? chartSlide.value.layout_type : ""));
</script>

<template>
  <Card v-if="kind === 'empty'" title="内容" />

  <TableLayout v-else-if="kind === 'table'" :slide="{ layout_type: 'plan_table', table: block.table, title: block.title }" :ctx="{ index: 0, total: 1 }" />

  <PieChart v-else-if="kind === 'chart' && chartSlide && (chartType === 'pie_chart' || chartType === 'donut_chart')" :slide="chartSlide" :ctx="{ index: 0, total: 1 }" />
  <BarChart v-else-if="kind === 'chart' && chartSlide && chartType === 'bar_chart'" :slide="chartSlide" :ctx="{ index: 0, total: 1 }" />
  <LineChart v-else-if="kind === 'chart' && chartSlide && chartType === 'line_chart'" :slide="chartSlide" :ctx="{ index: 0, total: 1 }" />
  <RadarChart v-else-if="kind === 'chart' && chartSlide && chartType === 'radar_chart'" :slide="chartSlide" :ctx="{ index: 0, total: 1 }" />
  <GanttChart v-else-if="kind === 'chart' && chartSlide && chartType === 'gantt_chart'" :slide="chartSlide" :ctx="{ index: 0, total: 1 }" />
  <MindMap v-else-if="kind === 'chart' && chartSlide && chartType === 'mind_map'" :slide="chartSlide" :ctx="{ index: 0, total: 1 }" />
  <GenericLayout v-else-if="kind === 'chart'" :slide="chartSlide" :ctx="{ index: 0, total: 1 }" />

  <div v-else-if="kind === 'flow'" class="cbFlowTrack">
    <template v-for="(s, i) in flowSteps" :key="i">
      <div class="cbFlowStep" :style="{ '--flow-accent': flowAccent(i) }">
        <div class="cbFlowTag">{{ String(Number(i) + 1).padStart(2, "0") }}</div>
        <div class="cbFlowCard">
          <div class="cbFlowTitle">{{ s?.title || `步骤 ${Number(i) + 1}` }}</div>
          <div v-if="flowText(s)" class="cbFlowText">{{ flowText(s) }}</div>
        </div>
      </div>
      <div v-if="i < flowSteps.length - 1" class="cbFlowArrow" aria-hidden="true">
        <div class="cbFlowArrowStem"></div>
        <div class="cbFlowArrowHead"></div>
      </div>
    </template>
  </div>

  <div v-else-if="kind === 'blocks'" class="grid2 cbBlocks">
    <Card v-for="(x, i) in block.blocks" :key="i" :title="x?.heading || x?.title || `块 ${Number(i) + 1}`">
      <Bullets :items="x?.bullets" />
    </Card>
  </div>

  <div v-else-if="kind === 'bullets'" class="cbBulletShell">
    <Bullets :items="block.bullets" />
  </div>

  <Card v-else-if="kind === 'image' && imageBlock" :title="block.title">
    <div class="cbImageWrap">
      <img
        :src="imageBlock.src"
        :alt="imageBlock.alt"
        class="cbImage"
      />
      <div v-if="imageBlock.caption" class="cbCaption">
        {{ imageBlock.caption }}
      </div>
    </div>
  </Card>

  <Card v-else-if="kind === 'text'" :title="block.title">
    <div class="cbText">{{ block.text }}</div>
  </Card>

  <GenericLayout v-else :slide="block" :ctx="{ index: 0, total: 1 }" />
</template>

<style scoped>
.cbFlowTrack {
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: stretch;
  gap: 10px;
}

.cbFlowStep {
  flex: 1 1 0;
  min-width: 0;
  display: grid;
  align-content: start;
}

.cbFlowTag {
  width: 38px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--flow-accent) 92%, white 8%);
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3px;
  box-shadow: 0 10px 20px rgba(20, 61, 122, 0.12);
}

.cbFlowCard {
  margin-top: 8px;
  height: 100%;
  padding: 12px 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 14px 28px rgba(20, 61, 122, 0.08);
  position: relative;
  overflow: hidden;
}

.cbFlowCard::before {
  content: "";
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 5px;
  background: color-mix(in srgb, var(--flow-accent) 92%, white 8%);
}

.cbFlowTitle {
  font-size: 15px;
  font-weight: 800;
  line-height: 1.35;
  color: #143d7a;
  word-break: break-all;
}

.cbFlowText {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: #475569;
}

.cbFlowArrow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.cbFlowArrowStem {
  width: 22px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(143, 186, 244, 0.38) 0%, rgba(77, 160, 255, 0.78) 100%);
}

.cbFlowArrowHead {
  width: 0;
  height: 0;
  margin-left: 5px;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 10px solid #4da0ff;
}

.cbBlocks {
  align-items: stretch;
}

.cbBulletShell {
  height: 100%;
  min-height: 0;
  padding: 18px 18px 16px;
  border-radius: 22px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.14), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 255, 0.98) 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 18px 34px rgba(20, 61, 122, 0.08);
}

.cbImageWrap {
  display: grid;
  gap: 12px;
}

.cbImage {
  width: 100%;
  max-height: 360px;
  object-fit: contain;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.98) 100%);
  border: 1px solid rgba(215, 227, 244, 0.8);
  padding: 10px;
}

.cbCaption {
  font-size: 13px;
  color: #475569;
  white-space: pre-wrap;
  line-height: 1.55;
}

.cbText {
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.65;
  color: #334155;
}
</style>
