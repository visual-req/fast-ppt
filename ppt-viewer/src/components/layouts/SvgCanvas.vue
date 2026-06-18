<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ slide: any }>();

const asset = computed(() => {
  const raw = props.slide?.svg;
  if (typeof raw === "string") return { src: raw, alt: props.slide?.title ?? "svg", caption: props.slide?.caption ?? "" };
  if (raw && typeof raw === "object") {
    return {
      src: raw.src ?? raw.url ?? raw.path ?? "",
      alt: raw.alt ?? props.slide?.title ?? "svg",
      caption: raw.caption ?? props.slide?.caption ?? ""
    };
  }
  const src = props.slide?.image_path ?? props.slide?.image_url ?? "";
  return {
    src,
    alt: props.slide?.title ?? "svg",
    caption: props.slide?.caption ?? ""
  };
});
</script>

<template>
  <div class="svgCanvas">
    <div class="svgCanvasFrame">
      <img
        v-if="asset.src"
        :src="asset.src"
        :alt="asset.alt"
        class="svgCanvasImage"
      />
      <div v-else class="svgCanvasEmpty">SVG 占位</div>
    </div>
    <div v-if="asset.caption" class="svgCanvasCaption">
      {{ asset.caption }}
    </div>
  </div>
</template>
