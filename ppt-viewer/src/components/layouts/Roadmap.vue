<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

type RoadmapItem = {
  title?: string;
  text?: string;
  subtitle?: string;
  period?: string;
  tag?: string;
};

type ActionItem = {
  title?: string;
  text?: string;
  note?: string;
};

const items = computed<RoadmapItem[]>(() => {
  const rawItems = props.slide?.items;
  if (Array.isArray(rawItems) && rawItems.length) return rawItems.slice(0, 6);

  const rawBullets = props.slide?.bullets;
  if (Array.isArray(rawBullets) && rawBullets.length) {
    return rawBullets.slice(0, 6).map((item: unknown) => ({ title: String(item ?? "") }));
  }

  const rows = props.slide?.table?.rows;
  if (Array.isArray(rows) && rows.length) {
    return rows.slice(0, 6).map((row: unknown) => {
      if (Array.isArray(row)) {
        return {
          title: String(row[0] ?? ""),
          text: String(row[1] ?? "")
        };
      }
      return { title: String(row ?? "") };
    });
  }

  return [];
});

const actions = computed<ActionItem[]>(() => {
  const raw = props.slide?.actions;
  return Array.isArray(raw) ? raw.slice(0, 4) : [];
});
const slide = computed(() => props.slide ?? {});

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

const positions = [
  { nodeX: 18, nodeY: 26, cardX: 10, cardY: 8 },
  { nodeX: 43, nodeY: 26, cardX: 35, cardY: 8 },
  { nodeX: 68, nodeY: 26, cardX: 60, cardY: 8 },
  { nodeX: 22, nodeY: 74, cardX: 12, cardY: 80 },
  { nodeX: 52, nodeY: 74, cardX: 42, cardY: 80 },
  { nodeX: 78, nodeY: 74, cardX: 68, cardY: 80 }
];
</script>

<template>
  <div class="roadmapRoot">
    <div class="roadmapTop">
      <svg class="roadmapTrack" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M12 26 H72 Q84 26 84 38 V42 Q84 50 74 50 H25 Q16 50 16 60 V64 Q16 74 26 74 H88"
        fill="none"
        stroke="url(#roadmapGrad)"
        stroke-width="5.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12 26 H72 Q84 26 84 38 V42 Q84 50 74 50 H25 Q16 50 16 60 V64 Q16 74 26 74 H88"
        fill="none"
        stroke="#8fbaf4"
        stroke-width="0.8"
        stroke-dasharray="1.6 1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <defs>
        <linearGradient id="roadmapGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#1f4f97" />
          <stop offset="100%" stop-color="#123b7a" />
        </linearGradient>
      </defs>
      </svg>

      <div
        v-for="(item, index) in items"
        :key="`${index}-${item.title}`"
        class="roadmapNode"
        :style="{ left: `${positions[index]?.nodeX ?? 10}%`, top: `${positions[index]?.nodeY ?? 20}%` }"
      >
        <div class="roadmapNodeCircle">{{ String(index + 1).padStart(2, '0') }}</div>
        <div
          class="roadmapCard"
          :style="{ left: `${positions[index]?.cardX ?? 10}%`, top: `${positions[index]?.cardY ?? 10}%` }"
        >
          <div v-if="toText(item?.period) || toText(item?.tag)" class="roadmapCardTag">
            {{ toText(item?.period) || toText(item?.tag) }}
          </div>
          <div class="roadmapCardTitle">{{ toText(item?.title) || `步骤 ${index + 1}` }}</div>
          <div v-if="toText(item?.text) || toText(item?.subtitle)" class="roadmapCardText">
            {{ toText(item?.text) || toText(item?.subtitle) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="actions.length" class="roadmapActions">
      <div v-for="(action, index) in actions" :key="`${index}-${action.title}`" class="roadmapActionCard">
        <div class="roadmapActionIndex">{{ String(index + 1).padStart(2, '0') }}</div>
        <div class="roadmapActionTitle">{{ toText(action.title) || `动作 ${index + 1}` }}</div>
        <div v-if="toText(action.text)" class="roadmapActionText">{{ action.text }}</div>
        <div v-if="toText(action.note)" class="roadmapActionNote">{{ action.note }}</div>
      </div>
    </div>

    <div v-if="toText(slide.goal) || toText(slide.summary)" class="roadmapGoal">
      {{ toText(slide.goal) || toText(slide.summary) }}
    </div>
  </div>
</template>

<style scoped>
.roadmapRoot {
  position: relative;
  height: 100%;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto auto;
  gap: 14px;
}

.roadmapTop {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(77, 160, 255, 0.16), transparent 36%),
    linear-gradient(180deg, #f7faff 0%, #eef4fb 100%);
  border: 1px solid rgba(215, 227, 244, 0.96);
}

.roadmapTrack {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.roadmapNode {
  position: absolute;
  transform: translate(-50%, -50%);
}

.roadmapNodeCircle {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #ffffff;
  border: 6px solid #1d6fe8;
  box-shadow: 0 16px 30px rgba(20, 61, 122, 0.12);
  color: #143d7a;
  font-size: 18px;
  font-weight: 800;
}

.roadmapCard {
  position: absolute;
  width: 220px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 14px 28px rgba(20, 61, 122, 0.10);
}

.roadmapCardTag {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(29, 111, 232, 0.08);
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 800;
}

.roadmapCardTitle {
  margin-top: 8px;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.4;
  color: #143d7a;
}

.roadmapCardText {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.55;
  color: #475569;
}

.roadmapActions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.roadmapActionCard {
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(215, 227, 244, 0.96);
  box-shadow: 0 12px 26px rgba(20, 61, 122, 0.08);
}

.roadmapActionIndex {
  width: 42px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(90deg, #4da0ff 0%, #1d6fe8 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.roadmapActionTitle {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.4;
  color: #143d7a;
}

.roadmapActionText {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: #475569;
}

.roadmapActionNote {
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.45;
  color: #64748b;
}

.roadmapGoal {
  padding: 12px 16px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.05);
  color: #334155;
  font-size: 12px;
  line-height: 1.55;
  text-align: center;
}

@media (max-width: 1100px) {
  .roadmapActions {
    grid-template-columns: 1fr;
  }
}
</style>
