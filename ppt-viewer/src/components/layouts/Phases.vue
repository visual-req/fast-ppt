<script setup lang="ts">
import { computed } from "vue";
import { getLayoutIconSvg } from "../../lib/layoutIcons";

const props = defineProps<{ slide: any }>();

type PhaseItem = {
  title?: string;
  bullets?: string[];
  text?: string;
  gate?: string;
  icon?: string;
};

const phases = computed<PhaseItem[]>(() => (Array.isArray(props.slide?.phases) ? props.slide.phases : []));
const isNarrow = computed(() => Boolean(props.slide?.narrow));

const graphic = computed(() => {
  const svg = props.slide?.svg;
  if (typeof svg === "string") return { src: svg, alt: props.slide?.title ?? "graphic", caption: props.slide?.caption ?? "" };
  if (svg && typeof svg === "object") {
    return { src: svg.src ?? svg.url ?? svg.path ?? "", alt: svg.alt ?? props.slide?.title ?? "graphic", caption: svg.caption ?? props.slide?.caption ?? "" };
  }
  const img = props.slide?.image_path ?? props.slide?.image_url ?? props.slide?.image ?? "";
  if (img) return { src: img, alt: props.slide?.title ?? "graphic", caption: props.slide?.caption ?? "" };
  return null;
});

function toBullets(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item ?? "")).filter(Boolean) : [];
}

const getIconSvg = getLayoutIconSvg;

</script>

<template>
  <div :class="['phasesWrap', graphic ? 'phasesWithGraphic' : '', isNarrow ? 'phasesNarrow' : '']">
    <div class="phaseRail">
      <div class="phaseRailLine"></div>
      <div class="phaseNodeRow" :class="{ phaseNodeRowNarrow: isNarrow }">
        <div v-for="(item, index) in phases" :key="'node-' + index" class="phaseNodeWrap">
          <div class="phaseNode">
            <span class="phaseNodeNum">{{ String(index + 1).padStart(2, '0') }}</span>
            <span v-if="getIconSvg(item?.icon)" class="phaseNodeIcon" v-html="getIconSvg(item?.icon)"></span>
          </div>
          <div class="phaseNodeStem"></div>
        </div>
      </div>
    </div>

    <div class="phaseCardGrid" :class="{ phaseCardGridCompact: graphic, phaseCardGridNarrow: isNarrow }">
      <div v-for="(item, index) in phases" :key="index" class="phaseInfoCard">
        <div class="phaseInfoHead">
          <div class="phaseInfoHeadBar"></div>
          <div class="phaseInfoTitle">{{ item?.title || "阶段 " + (index + 1) }}</div>
        </div>
        <div v-if="item?.text && !graphic" class="phaseInfoText">{{ item.text }}</div>
        <ul v-if="toBullets(item?.bullets).length && !graphic" class="phaseInfoBullets">
          <li v-for="(bullet, bulletIndex) in toBullets(item?.bullets)" :key="bulletIndex">{{ bullet }}</li>
        </ul>
        <div v-if="item?.gate && !graphic" class="phaseInfoGate">{{ item.gate }}</div>
        <div v-if="graphic" class="phaseGraphicBadge">Phase {{ String(index + 1).padStart(2, '0') }}</div>
      </div>
    </div>

    <div v-if="graphic" class="phasesGraphicArea">
      <div class="phasesGraphicShell">
        <img v-if="graphic.src" :src="graphic.src" :alt="graphic.alt" class="phasesGraphicImg" />
        <div v-else class="phasesGraphicEmpty">图形占位</div>
        <div v-if="graphic.caption" class="phasesGraphicCaption">{{ graphic.caption }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.phasesWrap {
  height: 100%;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 14px;
}

.phaseRail {
  position: relative;
  padding: 6px 10px 0;
}

.phaseRailLine {
  position: absolute;
  left: 10%;
  right: 10%;
  top: 28px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 16%, transparent) 0%, color-mix(in srgb, var(--fppt-primary, #1d6fe8) 6%, transparent) 100%);
}

.phaseNodeRow {
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
}

.phaseNodeRowNarrow {
  grid-auto-columns: minmax(140px, 1fr);
}

.phaseNodeWrap {
  display: grid;
  justify-items: center;
}

.phaseNode {
  position: relative;
  z-index: 1;
  width: 62px;
  height: 62px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--fppt-surface, #ffffff);
  border: 6px solid var(--fppt-primary, #1d6fe8);
  box-shadow: 0 16px 30px rgba(20, 61, 122, 0.12);
}

.phaseNodeNum {
  font-size: 18px;
  font-weight: 800;
  color: var(--fppt-text, #143d7a);
}

.phaseNodeIcon {
  position: absolute;
  inset: auto auto -8px auto;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--fppt-secondary, #4da0ff) 14%, white);
  color: var(--fppt-primary, #1d6fe8);
}

.phaseNodeIcon :deep(svg) {
  width: 12px;
  height: 12px;
}

.phaseNodeStem {
  width: 6px;
  height: 32px;
  border-radius: 999px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--fppt-border, #bfd3ee) 90%, white) 0%, color-mix(in srgb, var(--fppt-border, #bfd3ee) 20%, transparent) 100%);
}

.phaseCardGrid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(180px, 1fr);
  gap: 14px;
  min-height: 0;
}

.phaseCardGridNarrow {
  grid-auto-columns: minmax(148px, 1fr);
}

.phaseCardGridCompact {
  align-items: start;
}

.phaseInfoCard {
  min-width: 0;
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 16px 18px 18px;
  border-radius: 22px;
  background: linear-gradient(180deg, var(--fppt-surface, #ffffff) 0%, var(--fppt-surface-alt, #f8fbff) 100%);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 96%, transparent);
  box-shadow: 0 18px 34px rgba(20, 61, 122, 0.08);
}

.phaseInfoHead {
  display: grid;
  gap: 10px;
}

.phaseInfoHeadBar {
  width: 68px;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--fppt-secondary, #4da0ff) 0%, var(--fppt-primary, #1d6fe8) 100%);
}

.phaseInfoTitle {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.4;
  color: var(--fppt-text, #143d7a);
}

.phaseInfoText {
  font-size: 14px;
  line-height: 1.6;
  color: var(--fppt-muted, #475569);
  font-weight: 600;
}

.phaseInfoBullets {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.phaseInfoBullets li {
  position: relative;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--fppt-muted, #475569);
}

.phaseInfoBullets li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--fppt-secondary, #4da0ff) 0%, var(--fppt-primary, #1d6fe8) 100%);
}

.phaseInfoGate {
  margin-top: auto;
  padding: 10px 12px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--fppt-primary, #1d6fe8) 10%, transparent);
  color: var(--fppt-primary, #1d4ed8);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.45;
}

.phaseGraphicBadge {
  margin-top: auto;
  font-size: 12px;
  font-weight: 800;
  color: var(--fppt-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.phasesGraphicArea {
  min-height: 0;
  display: grid;
}

.phasesGraphicShell {
  min-height: 0;
  display: grid;
  align-items: center;
  justify-items: center;
  gap: 8px;
  padding: 18px;
  border-radius: 24px;
  background: linear-gradient(180deg, var(--fppt-surface-alt, #f8fbff) 0%, color-mix(in srgb, var(--fppt-surface-alt, #f8fbff) 88%, white) 100%);
  border: 1px solid color-mix(in srgb, var(--fppt-border, #d7e3f4) 96%, transparent);
}

.phasesGraphicImg {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.phasesGraphicEmpty {
  width: 100%;
  min-height: 140px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  border: 1.5px dashed color-mix(in srgb, var(--fppt-border, #94a3b8) 60%, transparent);
  color: var(--fppt-muted, #94a3b8);
  font-size: 14px;
}

.phasesGraphicCaption {
  font-size: 12px;
  line-height: 1.5;
  color: var(--fppt-muted, #64748b);
  text-align: center;
}
</style>
