<script setup lang="ts">
import { computed } from "vue";

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

function getIconSvg(name: unknown) {
  const key = typeof name === "string" ? name : "";
  const svgByName: Record<string, string> = {
    quality:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 5 3.4 8 7 10 3.6-2 7-5 7-10V6z"></path><path d="m9 12 2 2 4-4"></path></svg>',
    device:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="6" width="14" height="12" rx="2"></rect><path d="M9 18v2"></path><path d="M15 18v2"></path><path d="M9 10h6"></path><path d="M12 7v3"></path></svg>',
    production:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h18"></path><path d="M6 17V9l6-4 6 4v8"></path><path d="M9 13h6"></path></svg>',
    requirement:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h9l3 3v13H6z"></path><path d="M15 4v4h4"></path><path d="M9 12h6"></path><path d="M9 16h4"></path></svg>',
    design:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 20 6-6"></path><path d="m14 10 6-6"></path><path d="m13 5 6 6"></path><path d="M8 9 4 13l7 7 4-4"></path></svg>',
    development:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m8 8-4 4 4 4"></path><path d="m16 8 4 4-4 4"></path><path d="m14 4-4 16"></path></svg>',
    testing:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"></path><path d="M10 3v5l-4.8 7.6A3 3 0 0 0 7.7 20h8.6a3 3 0 0 0 2.5-4.4L14 8V3"></path><path d="M8.5 14h7"></path></svg>',
    operation:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="m4.9 4.9 2.8 2.8"></path><path d="m16.3 16.3 2.8 2.8"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="m4.9 19.1 2.8-2.8"></path><path d="m16.3 7.7 2.8-2.8"></path><circle cx="12" cy="12" r="3"></circle></svg>'
  };
  return svgByName[key] ?? "";
}
</script>

<template>
  <div :class="['phasesWrap', graphic ? 'phasesWithGraphic' : '', isNarrow ? 'phasesNarrow' : '']">
    <!-- Top: Phase cards -->
    <div class="phasesFlow" :class="{ phasesCompact: graphic, phasesNarrowFlow: isNarrow }">
      <div
        v-for="(item, index) in phases"
        :key="index"
        class="phaseCardWrap"
        :class="{ phaseCardWrapCompact: graphic, phaseCardWrapNarrow: isNarrow }"
      >
        <div class="phaseCard" :class="{ phaseCardCompact: graphic, phaseCardNarrow: isNarrow }">
          <div class="phaseHeader" :class="{ phaseHeaderCompact: graphic, phaseHeaderNarrow: isNarrow }">
            <span class="phaseHeaderNum">{{ index + 1 }}</span>
            <span v-if="getIconSvg(item?.icon)" class="phaseHeaderIcon" v-html="getIconSvg(item?.icon)"></span>
            <span class="phaseHeaderTitle" :class="{ phaseHeaderTitleNarrow: isNarrow }">{{ item?.title || "阶段 " + (index + 1) }}</span>
          </div>
          <div v-if="item?.text && !graphic" class="phaseText">{{ item.text }}</div>
          <ul v-if="toBullets(item?.bullets).length && !graphic" class="phaseBullets">
            <li v-for="(bullet, bulletIndex) in toBullets(item?.bullets)" :key="bulletIndex">{{ bullet }}</li>
          </ul>
          <div v-if="item?.gate && !graphic" class="phaseGate">{{ item.gate }}</div>
        </div>
      </div>
    </div>

    <!-- Bottom: Graphic -->
    <div v-if="graphic" class="phasesGraphicArea">
      <img v-if="graphic.src" :src="graphic.src" :alt="graphic.alt" class="phasesGraphicImg" />
      <div v-else class="phasesGraphicEmpty">图形占位</div>
      <div v-if="graphic.caption" class="phasesGraphicCaption">{{ graphic.caption }}</div>
    </div>
  </div>
</template>
