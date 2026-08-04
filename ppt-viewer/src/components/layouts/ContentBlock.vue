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
  if (Array.isArray(b.blocks)) return "blocks";
  if (Array.isArray(b.bullets)) return "bullets";
  if (typeof b.text === "string") return "text";
  return "generic";
});

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
