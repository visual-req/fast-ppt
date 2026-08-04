<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

type Milestone = {
  title?: string;
  text?: string;
  bullets?: string[];
  label?: string;
};

const startLabel = computed(() => (typeof props.slide?.start_label === "string" ? props.slide.start_label : "Start"));
const goal = computed(() => {
  const raw = props.slide?.goal;
  return raw && typeof raw === "object" ? raw : {};
});
const milestones = computed<Milestone[]>(() => {
  const raw = props.slide?.milestones;
  return Array.isArray(raw) ? raw.slice(0, 4) : [];
});

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toBullets(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item ?? "")).filter(Boolean).slice(0, 3) : [];
}
</script>

<template>
  <div class="targetRoot">
    <div class="targetTrack">
      <div class="targetStart">
        <div class="targetStartLabel">{{ startLabel }}</div>
      </div>
      <div class="targetRail"></div>
      <div
        v-for="(item, index) in milestones"
        :key="index"
        class="targetMilestone"
        :class="index % 2 === 0 ? 'targetMilestoneTop' : 'targetMilestoneBottom'"
        :style="{ left: `${18 + index * 20}%` }"
      >
        <div class="targetPin"></div>
        <div class="targetMilestoneCard">
          <div class="targetMilestoneLabel">{{ toText(item?.label) || `M${index + 1}` }}</div>
          <div class="targetMilestoneTitle">{{ toText(item?.title) || `里程碑 ${index + 1}` }}</div>
          <div v-if="toText(item?.text)" class="targetMilestoneText">{{ item.text }}</div>
          <ul v-if="toBullets(item?.bullets).length" class="targetMilestoneBullets">
            <li v-for="(bullet, bulletIndex) in toBullets(item?.bullets)" :key="bulletIndex">{{ bullet }}</li>
          </ul>
        </div>
      </div>
      <div class="targetGoal">
        <div class="targetGoalOuter">
          <div class="targetGoalMid">
            <div class="targetGoalInner"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="targetSummary">
      <div class="targetSummaryCard">
        <div class="targetSummaryEyebrow">Goal</div>
        <div class="targetSummaryTitle">{{ toText(goal?.title) || "目标达成" }}</div>
        <div v-if="toText(goal?.subtitle)" class="targetSummarySubtitle">{{ goal.subtitle }}</div>
        <div v-if="toText(goal?.text)" class="targetSummaryText">{{ goal.text }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.targetRoot {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 24px;
  height: 100%;
  min-height: 0;
}

.targetTrack {
  position: relative;
  min-height: 0;
  padding: 40px 18px 24px;
}

.targetRail {
  position: absolute;
  left: 88px;
  right: 196px;
  top: 50%;
  height: 6px;
  transform: translateY(-50%);
  border-radius: 999px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 58%, white) 0%, var(--fppt-secondary, #4da0ff) 100%);
  box-shadow: 0 0 0 8px color-mix(in srgb, var(--fppt-primary, #1d6fe8) 8%, transparent);
}

.targetStart {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.targetStartLabel {
  min-width: 78px;
  padding: 14px 18px;
  border-radius: 0 999px 999px 0;
  background: linear-gradient(135deg, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 92%, white) 0%, var(--fppt-secondary, #4da0ff) 100%);
  color: white;
  font-size: 14px;
  font-weight: 800;
  text-align: center;
  box-shadow: 0 16px 30px rgba(20, 61, 122, 0.12);
}

.targetMilestone {
  position: absolute;
  width: 20%;
  min-width: 190px;
  max-width: 230px;
}

.targetMilestoneTop {
  top: 16px;
  transform: translateX(-50%);
}

.targetMilestoneBottom {
  bottom: 8px;
  transform: translateX(-50%);
}

.targetMilestoneTop .targetPin {
  bottom: -24px;
}

.targetMilestoneBottom .targetPin {
  top: -24px;
}

.targetPin {
  position: absolute;
  left: 50%;
  width: 4px;
  height: 26px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: color-mix(in srgb, var(--fppt-primary, #1d6fe8) 78%, white);
}

.targetMilestoneCard {
  padding: 16px 16px 14px;
  border-radius: 22px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--fppt-surface, #ffffff) 98%, transparent) 0%, color-mix(in srgb, var(--fppt-surface-alt, #f7faff) 98%, transparent) 100%);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 92%, transparent);
  box-shadow: 0 18px 36px rgba(20, 61, 122, 0.08);
}

.targetMilestoneLabel {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--fppt-primary-soft, rgba(29, 111, 232, 0.12));
  color: var(--fppt-primary, #1d6fe8);
  font-size: 11px;
  font-weight: 800;
}

.targetMilestoneTitle {
  margin-top: 10px;
  font-size: 15px;
  font-weight: 800;
  color: var(--fppt-text, #143d7a);
  line-height: 1.35;
}

.targetMilestoneText {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--fppt-muted, #64748b);
}

.targetMilestoneBullets {
  margin: 8px 0 0;
  padding-left: 18px;
  display: grid;
  gap: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--fppt-text, #0f172a);
}

.targetGoal {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
}

.targetGoalOuter,
.targetGoalMid,
.targetGoalInner {
  display: grid;
  place-items: center;
  border-radius: 999px;
}

.targetGoalOuter {
  width: 168px;
  height: 168px;
  background: color-mix(in srgb, var(--fppt-primary, #1d6fe8) 92%, white);
}

.targetGoalMid {
  width: 112px;
  height: 112px;
  background: white;
}

.targetGoalInner {
  width: 48px;
  height: 48px;
  background: var(--fppt-secondary, #4da0ff);
  box-shadow: 0 0 0 10px color-mix(in srgb, var(--fppt-secondary, #4da0ff) 18%, transparent);
}

.targetSummary {
  display: flex;
  justify-content: center;
}

.targetSummaryCard {
  width: min(100%, 520px);
  padding: 18px 22px;
  border-radius: 24px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--fppt-text, #123b7a) 92%, white) 0%, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 86%, #0f172a) 100%);
  color: white;
  text-align: center;
  box-shadow: 0 22px 38px rgba(20, 61, 122, 0.14);
}

.targetSummaryEyebrow {
  font-size: 12px;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}

.targetSummaryTitle {
  margin-top: 8px;
  font-size: 22px;
  font-weight: 900;
}

.targetSummarySubtitle,
.targetSummaryText {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.88);
}

@media (max-width: 900px) {
  .targetTrack {
    padding-left: 0;
    padding-right: 0;
  }

  .targetRail {
    left: 72px;
    right: 132px;
  }

  .targetMilestone {
    min-width: 160px;
  }

  .targetGoalOuter {
    width: 122px;
    height: 122px;
  }

  .targetGoalMid {
    width: 84px;
    height: 84px;
  }
}
</style>
