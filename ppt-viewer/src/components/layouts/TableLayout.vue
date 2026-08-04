<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}

const table = computed(() => (props.slide?.table && typeof props.slide.table === "object" ? props.slide.table : props.slide));

const headers = computed<string[]>(() => {
  const raw = Array.isArray(table.value?.headers) ? table.value.headers : [];
  const list = raw.map((item: unknown) => toText(item)).filter(Boolean);
  return list.length ? list : ["维度", "方案 A", "方案 B"];
});

const rows = computed<string[][]>(() => {
  const raw = Array.isArray(table.value?.rows) ? table.value.rows : [];
  const list = raw
    .filter((row: unknown) => Array.isArray(row))
    .map((row: unknown) => (row as unknown[]).map((cell: unknown) => toText(cell)));

  return list.length
    ? list
    : [
        ["目标", "更会问", "更会做"],
        ["执行方式", "单轮生成", "生成-检查-回改循环"],
        ["产出稳定性", "依赖当次发挥", "依赖流程约束"]
      ];
});

const columnCount = computed(() => {
  const maxRowColumns = rows.value.reduce((max, row) => Math.max(max, row.length), 0);
  return Math.max(headers.value.length, maxRowColumns, 2);
});

function cellText(row: string[], index: number): string {
  return row[index] ?? "";
}
</script>

<template>
  <div class="tableShell">
    <div class="tableGlow"></div>

    <div class="comparisonGrid" :style="{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }">
      <div v-for="(header, index) in headers" :key="`header-${index}`" class="comparisonCell comparisonHeader">
        {{ header }}
      </div>

      <template v-for="(row, rowIndex) in rows" :key="`row-${rowIndex}`">
        <div
          v-for="cellIndex in columnCount"
          :key="`row-${rowIndex}-cell-${cellIndex}`"
          class="comparisonCell"
          :class="{ comparisonCellLabel: cellIndex === 1 }"
        >
          {{ cellText(row, cellIndex - 1) }}
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tableShell {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: 20px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  border: 1px solid rgba(226, 232, 240, 0.96);
  box-shadow: 0 20px 36px rgba(20, 61, 122, 0.08);
}

.tableGlow {
  position: absolute;
  top: 10px;
  right: 22px;
  width: 132px;
  height: 84px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(77, 160, 255, 0.18), transparent 72%);
  pointer-events: none;
}

.comparisonGrid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-auto-rows: minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
}

.comparisonCell {
  min-width: 0;
  min-height: 0;
  display: grid;
  align-content: center;
  padding: 18px 20px;
  border-right: 1px solid #cbd5e1;
  border-bottom: 1px solid #cbd5e1;
  color: #334155;
  font-size: 18px;
  line-height: 1.45;
  word-break: break-word;
}

.comparisonHeader {
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 20px;
  font-weight: 800;
}

.comparisonCellLabel {
  font-weight: 700;
}

.comparisonGrid > :nth-child(3n) {
  border-right: none;
}

.comparisonGrid > :nth-last-child(-n + 3) {
  border-bottom: none;
}

@media (max-width: 1180px) {
  .comparisonCell {
    padding: 14px 16px;
    font-size: 16px;
  }

  .comparisonHeader {
    font-size: 18px;
  }
}
</style>
