<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

type StepItem = {
  title?: string;
  bullets?: string[];
  text?: string;
  icon?: string;
};

const steps = computed<StepItem[]>(() => (Array.isArray(props.slide?.steps) ? props.slide.steps : []));

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toBullets(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item ?? "")).filter(Boolean) : [];
}

function getIconSvg(name: unknown) {
  const key = typeof name === "string" ? name : "";
  const svgByName: Record<string, string> = {
    target:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="4"></circle><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"></circle></svg>',
    flow:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h7"></path><path d="M13 7l2-2 2 2"></path><path d="M20 17h-7"></path><path d="M11 17l-2 2-2-2"></path><path d="M15 5v8a2 2 0 0 0 2 2h3"></path><path d="M9 19v-8a2 2 0 0 0-2-2H4"></path></svg>',
    fit:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h6v6H5z"></path><path d="M13 13h6v6h-6z"></path><path d="m11 11 2 2"></path><path d="m13 11-2 2"></path></svg>',
    rank:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17V9"></path><path d="M12 17V5"></path><path d="M17 17v-6"></path><path d="M4 19h16"></path></svg>',
    plan:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h9l3 3v13H6z"></path><path d="M15 4v4h4"></path><path d="M9 12h6"></path><path d="M9 16h4"></path></svg>'
  };
  return svgByName[key] ?? "";
}
</script>

<template>
  <div class="stepsLayout">
    <!-- Connected step indicators at top -->
    <div class="stepsIndicators">
      <div v-for="(item, index) in steps" :key="'ind-' + index" class="stepsIndItem">
        <div class="stepsIndMarker">
          <div class="stepsIndCircle">
            <span class="stepsIndNum">{{ index + 1 }}</span>
          </div>
          <div class="stepsIndTitle">{{ item?.title || "步骤 " + (index + 1) }}</div>
        </div>
        <!-- connector line between circles -->
        <div v-if="index < steps.length - 1" class="stepsIndLine"></div>
      </div>
    </div>

    <!-- Content cards below -->
    <div class="stepsCards">
      <div v-for="(item, index) in steps" :key="'card-' + index" class="stepsCard">
        <div v-if="getIconSvg(item?.icon)" class="stepsCardIcon" v-html="getIconSvg(item?.icon)"></div>
        <div v-if="item?.text" class="stepsCardText">{{ item.text }}</div>
        <ul v-if="toBullets(item?.bullets).length" class="stepsCardBullets">
          <li v-for="(bullet, bulletIndex) in toBullets(item?.bullets)" :key="bulletIndex">{{ bullet }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
