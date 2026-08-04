<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

type LoopNode = {
  title?: string;
};

const leftPresets = [
  { title: "洞察输入", x: 22, y: 28, labelDx: -126, labelDy: -26 },
  { title: "需求澄清", x: 7, y: 50, labelDx: 22, labelDy: -22 },
  { title: "方案建模", x: 22, y: 72, labelDx: -128, labelDy: 18 },
  { title: "机制校准", x: 43, y: 50, labelDx: -72, labelDy: -48 }
] as const;

const rightPresets = [
  { title: "执行推进", x: 57, y: 28, labelDx: 24, labelDy: -26 },
  { title: "数据回收", x: 78, y: 50, labelDx: 24, labelDy: -22 },
  { title: "效果验证", x: 57, y: 72, labelDx: 24, labelDy: 18 },
  { title: "持续优化", x: 43, y: 50, labelDx: 26, labelDy: 14 }
] as const;

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readNodes(value: unknown): LoopNode[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return { title: item };
      if (item && typeof item === "object" && !Array.isArray(item)) return item as LoopNode;
      return {};
    })
    .slice(0, 4);
}

const leftTitle = computed(() => toText(props.slide?.left_title) || toText(props.slide?.loops?.left?.title) || "策略循环");
const rightTitle = computed(() => toText(props.slide?.right_title) || toText(props.slide?.loops?.right?.title) || "执行循环");

const leftNodes = computed(() => {
  const raw = readNodes(props.slide?.left_nodes ?? props.slide?.loops?.left?.nodes);
  return leftPresets.map((preset, index) => ({
    ...preset,
    title: toText(raw[index]?.title) || preset.title
  }));
});

const rightNodes = computed(() => {
  const raw = readNodes(props.slide?.right_nodes ?? props.slide?.loops?.right?.nodes);
  return rightPresets.map((preset, index) => ({
    ...preset,
    title: toText(raw[index]?.title) || preset.title
  }));
});
</script>

<template>
  <div class="doubleLoopRoot">
    <div class="doubleLoopShell">
      <div class="doubleLoopTitle doubleLoopTitleLeft">{{ leftTitle }}</div>
      <div class="doubleLoopTitle doubleLoopTitleRight">{{ rightTitle }}</div>

      <svg class="doubleLoopTrack" viewBox="0 0 1000 420" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id="doubleLoopStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#1d6fe8"/>
            <stop offset="50%" stop-color="#4da0ff"/>
            <stop offset="100%" stop-color="#1d6fe8"/>
          </linearGradient>
        </defs>

        <path
          d="M120 210 C120 92 250 48 374 150 C445 210 555 210 626 150 C750 48 880 92 880 210 C880 328 750 372 626 270 C555 210 445 210 374 270 C250 372 120 328 120 210"
          fill="none"
          stroke="#d8e7fb"
          stroke-width="58"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M120 210 C120 92 250 48 374 150 C445 210 555 210 626 150 C750 48 880 92 880 210 C880 328 750 372 626 270 C555 210 445 210 374 270 C250 372 120 328 120 210"
          fill="none"
          stroke="url(#doubleLoopStroke)"
          stroke-width="24"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M120 210 C120 92 250 48 374 150 C445 210 555 210 626 150 C750 48 880 92 880 210 C880 328 750 372 626 270 C555 210 445 210 374 270 C250 372 120 328 120 210"
          fill="none"
          stroke="#93c5fd"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="12 14"
          opacity="0.92"
        />
      </svg>

      <div
        v-for="(node, index) in leftNodes"
        :key="`left-${index}`"
        class="doubleLoopNode"
        :style="{ left: `${node.x}%`, top: `${node.y}%` }"
      >
        <div class="doubleLoopDot"></div>
        <div class="doubleLoopLabel" :style="{ '--label-dx': `${node.labelDx}px`, '--label-dy': `${node.labelDy}px` }">{{ node.title }}</div>
      </div>

      <div
        v-for="(node, index) in rightNodes"
        :key="`right-${index}`"
        class="doubleLoopNode"
        :style="{ left: `${node.x}%`, top: `${node.y}%` }"
      >
        <div class="doubleLoopDot"></div>
        <div class="doubleLoopLabel" :style="{ '--label-dx': `${node.labelDx}px`, '--label-dy': `${node.labelDy}px` }">{{ node.title }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.doubleLoopRoot {
  height: 100%;
  min-height: 0;
}

.doubleLoopShell {
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

.doubleLoopTrack {
  position: absolute;
  left: 6%;
  right: 6%;
  top: 14%;
  bottom: 8%;
  width: 88%;
  height: 78%;
}

.doubleLoopTitle {
  position: absolute;
  top: 7%;
  min-width: 132px;
  padding: 10px 18px;
  border-radius: 999px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d6fe8;
  font-size: 22px;
  font-weight: 800;
  text-align: center;
}

.doubleLoopTitleLeft {
  left: 12%;
}

.doubleLoopTitleRight {
  right: 12%;
}

.doubleLoopNode {
  position: absolute;
  transform: translate(-50%, -50%);
}

.doubleLoopDot {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #ffffff;
  border: 6px solid #1d6fe8;
  box-shadow: 0 12px 22px rgba(20, 61, 122, 0.12);
}

.doubleLoopLabel {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(var(--label-dx), var(--label-dy));
  min-width: 104px;
  padding: 10px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 14px 28px rgba(20, 61, 122, 0.10);
  color: #143d7a;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
}

@media (max-width: 1180px) {
  .doubleLoopTitle {
    font-size: 18px;
  }

  .doubleLoopLabel {
    min-width: 92px;
    padding: 8px 12px;
    font-size: 14px;
  }
}
</style>
