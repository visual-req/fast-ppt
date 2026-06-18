<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps<{ slide: any }>();
const svgMarkup = ref("");
const imageSrc = ref("");

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

function resolveSrc(src: string) {
  if (!src) return "";
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  return src.startsWith("/") ? src : `/${src}`;
}

function withCacheBust(src: string) {
  if (!src || /^(data:|blob:)/.test(src)) return src;
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}v=${Date.now()}`;
}

async function loadAsset() {
  const rawSrc = resolveSrc(asset.value.src);
  const src = withCacheBust(rawSrc);
  svgMarkup.value = "";
  imageSrc.value = src;
  if (!src) return;
  if (!/\.svg($|\?)/i.test(src)) return;
  try {
    const res = await fetch(src, { cache: "no-store" });
    if (!res.ok) return;
    const text = await res.text();
    if (text.includes("<svg")) {
      svgMarkup.value = text;
    }
  } catch {
    svgMarkup.value = "";
  }
}

watch(asset, () => {
  void loadAsset();
}, { immediate: true, deep: true });

function handleWindowFocus() {
  void loadAsset();
}

function handleVisibilityChange() {
  if (document.visibilityState === "visible") {
    void loadAsset();
  }
}

onMounted(() => {
  window.addEventListener("focus", handleWindowFocus);
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

onBeforeUnmount(() => {
  window.removeEventListener("focus", handleWindowFocus);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<template>
  <div class="svgCanvas">
    <div class="svgCanvasFrame">
      <div
        v-if="svgMarkup"
        class="svgCanvasMarkup"
        v-html="svgMarkup"
      />
      <img
        v-else-if="imageSrc"
        :src="imageSrc"
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
