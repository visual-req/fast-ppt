<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { pickLayout } from "./layoutRegistry";

type Slide = {
  layout_type?: string;
  title?: string;
  subtitle?: string;
  [key: string]: unknown;
};

type Deck = {
  deck?: { aspect_ratio?: string; style?: string; language?: string };
  slides: Slide[];
};

type OutlineNode = {
  id: string;
  index: number;
  label: string;
  meta?: string;
  children: OutlineNode[];
};

const deck = ref<Deck>({ slides: [] });
const status = ref("未加载");
const slideIndex = ref(0);
const jumpValue = ref(1);
const isOutlineOpen = ref(false);
const isExporting = ref(false);

const total = computed(() => deck.value.slides.length);
const currentSlide = computed(() => deck.value.slides[slideIndex.value] ?? null);
const layoutType = computed(() => (currentSlide.value && typeof currentSlide.value.layout_type === "string" ? currentSlide.value.layout_type : "title_bullets"));
const LayoutComponent = computed(() => pickLayout(layoutType.value));
const outlineTree = computed(() => buildOutlineTree(deck.value.slides));
const hasOutline = computed(() => outlineTree.value.length > 0);

function clampIndex(i: number) {
  const t = total.value;
  if (t <= 0) return 0;
  return Math.max(0, Math.min(t - 1, i));
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getSlideLabel(slide: Slide | null | undefined, index: number) {
  const title = toText(slide?.title);
  const subtitle = toText(slide?.subtitle);
  if (title) return title;
  if (subtitle) return subtitle;
  return `第 ${index + 1} 页`;
}

function buildOutlineTree(slides: Slide[]) {
  const nodes: OutlineNode[] = [];
  let currentSection: OutlineNode | null = null;
  let introSection: OutlineNode | null = null;

  slides.forEach((slide, index) => {
    const layoutType = toText(slide.layout_type) || "title_bullets";
    const subtitle = toText(slide.subtitle);

    if (layoutType === "section_divider") {
      currentSection = {
        id: `section-${index}`,
        index,
        label: getSlideLabel(slide, index),
        meta: subtitle || undefined,
        children: []
      };
      nodes.push(currentSection);
      return;
    }

    const childNode: OutlineNode = {
      id: `slide-${index}`,
      index,
      label: getSlideLabel(slide, index),
      meta: undefined,
      children: []
    };

    if (currentSection) {
      currentSection.children.push(childNode);
      return;
    }

    if (!introSection) {
      introSection = {
        id: "section-intro",
        index,
        label: "开始部分",
        meta: undefined,
        children: []
      };
      nodes.push(introSection);
    }

    introSection.children.push(childNode);
  });

  return nodes;
}

function goToSlide(index: number) {
  slideIndex.value = clampIndex(index);
  jumpValue.value = slideIndex.value + 1;
  renderStatus();
}

function toggleOutline() {
  if (!hasOutline.value) return;
  isOutlineOpen.value = !isOutlineOpen.value;
}

function closeOutline() {
  isOutlineOpen.value = false;
}

function selectOutline(node: OutlineNode) {
  goToSlide(node.index);
  closeOutline();
}

function isNodeActive(node: OutlineNode) {
  if (node.index === slideIndex.value) return true;
  return node.children.some((child) => child.index === slideIndex.value);
}

function renderStatus() {
  if (!currentSlide.value) {
    status.value = total.value ? "无可用页面" : "未加载";
    return;
  }
  const title = typeof currentSlide.value.title === "string" ? currentSlide.value.title.trim() : "";
  status.value = `${slideIndex.value + 1}/${total.value}${title ? " " + title : ""}`;
}

async function reload() {
  status.value = "加载中...";
  try {
    const res = await fetch("/api/deck", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load deck: ${res.status} ${res.statusText}`);
    const text = await res.text();
    const parsed = JSON.parse(text) as Deck;
    deck.value = parsed && Array.isArray(parsed.slides) ? parsed : { slides: [] };
    closeOutline();
    goToSlide(0);
  } catch (e) {
    deck.value = { slides: [] };
    closeOutline();
    slideIndex.value = 0;
    jumpValue.value = 1;
    status.value = `加载失败：${e instanceof Error ? e.message : String(e)}`;
  }
}

function prev() {
  goToSlide(slideIndex.value - 1);
}

function next() {
  goToSlide(slideIndex.value + 1);
}

function go() {
  goToSlide(Number(jumpValue.value) - 1);
}

async function exportPptx() {
  if (isExporting.value) return;
  isExporting.value = true;
  try {
    const res = await fetch("/api/export/pptx", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to export pptx: ${res.status} ${res.statusText}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deck.pptx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  } catch (e) {
    status.value = `导出失败：${e instanceof Error ? e.message : String(e)}`;
  } finally {
    isExporting.value = false;
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && isOutlineOpen.value) {
    e.preventDefault();
    closeOutline();
    return;
  }
  if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    prev();
  }
  if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
    e.preventDefault();
    next();
  }
  if (e.key === "Home") {
    e.preventDefault();
    goToSlide(0);
  }
  if (e.key === "End") {
    e.preventDefault();
    goToSlide(Number.MAX_SAFE_INTEGER);
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  void reload();
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div class="viewer">
    <div class="toolbar">
      <div class="group">
        <button class="button" type="button" :disabled="!hasOutline" @click="toggleOutline">
          {{ isOutlineOpen ? "收起大纲" : "查看大纲" }}
        </button>
        <button class="button" type="button" @click="reload">重新加载</button>
        <button class="button" type="button" :disabled="total <= 0 || slideIndex <= 0" @click="goToSlide(0)">首页</button>
        <button class="button" type="button" :disabled="total <= 0 || slideIndex <= 0" @click="prev">上一页</button>
        <button class="button" type="button" :disabled="total <= 0 || slideIndex >= total - 1" @click="next">下一页</button>
        <input v-model.number="jumpValue" type="number" min="1" step="1" :max="Math.max(1, total)" @keydown.enter.prevent="go" />
        <button class="button" type="button" :disabled="total <= 0" @click="go">跳转</button>
        <button class="button" type="button" :disabled="total <= 0 || isExporting" @click="exportPptx">
          {{ isExporting ? "导出中..." : "导出 PPTX" }}
        </button>
      </div>
      <div class="spacer"></div>
      <div class="group">
        <div class="status">{{ status }}</div>
      </div>
    </div>

    <div class="viewport">
      <div v-if="isOutlineOpen" class="drawerMask" @click="closeOutline"></div>
      <aside class="outlineDrawer" :class="{ open: isOutlineOpen }" aria-label="大纲导航">
        <div class="outlineDrawerHeader">
          <div>
            <div class="outlineDrawerTitle">章节目录</div>
            <div class="outlineDrawerSubtitle">选择章节或页面后跳转</div>
          </div>
          <button class="button outlineCloseButton" type="button" @click="closeOutline">关闭</button>
        </div>
        <div class="outlineDrawerBody">
          <div v-if="hasOutline" class="tree outlineTree">
            <ul class="outlineRoot">
              <li v-for="node in outlineTree" :key="node.id">
                <button class="treeButton treeSectionButton" :class="{ active: isNodeActive(node) }" type="button" @click="selectOutline(node)">
                  <span class="treePageTag">P{{ node.index + 1 }}</span>
                  <span class="treeText">
                    <span class="treeLabel">{{ node.label }}</span>
                    <span v-if="node.meta" class="treeMeta">{{ node.meta }}</span>
                  </span>
                </button>
                <ul v-if="node.children.length">
                  <li v-for="child in node.children" :key="child.id">
                    <button class="treeButton treeSlideButton" :class="{ active: isNodeActive(child) }" type="button" @click="selectOutline(child)">
                      <span class="treePageTag">P{{ child.index + 1 }}</span>
                      <span class="treeText">
                        <span class="treeLabel">{{ child.label }}</span>
                      </span>
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          <div v-else class="card">
            <div class="cardTitle">暂无大纲</div>
            <div>当前 deck 还没有可导航的章节结构。</div>
          </div>
        </div>
      </aside>
      <div class="slideHost">
        <section v-if="currentSlide" class="slide" :class="`layout-${layoutType}`">
          <div class="slideInner">
            <div
              v-if="
                !['cover', 'section_divider', 'thank_you'].includes(layoutType) &&
                (layoutType !== 'svg_full' || (currentSlide as any)?.show_title !== false)
              "
            >
              <h2 class="slideTitle">{{ currentSlide.title ?? "" }}</h2>
            </div>
            <div>
              <component :is="LayoutComponent" :slide="currentSlide" :ctx="{ index: slideIndex, total }" />
            </div>
          </div>
          <div class="footerMark">{{ slideIndex + 1 }}/{{ total }}</div>
        </section>
        <div v-else class="card">
          <div class="cardTitle">无内容</div>
        </div>
      </div>
    </div>
  </div>
</template>
