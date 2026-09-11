// 截图版导出：用 headless Chrome 打开 viewer，逐页渲染成 16:9 高清图，再铺满每一页组装 PPTX。
// 与 lib/pptxExport.mjs 的原生形状导出互补：原生版文字可编辑，截图版视觉与网页 100% 一致。
import fs from "node:fs/promises";
import path from "node:path";
import { withBrowserPage } from "./chromeCdp.mjs";
import { loadDeckObject } from "./pptxExport.mjs";

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;
const DEFAULT_VIEWER_BASE_URL = "http://localhost:9030/";
const DEFAULT_VIEWPORT = { width: 1600, height: 900 };
const DEFAULT_DEVICE_SCALE_FACTOR = 3;

const SLIDE_SELECTOR = "section.slide";
const PAGE_INPUT_SELECTOR = ".toolbar input[type=number]";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBaseUrl(value) {
  const raw = toText(value) || DEFAULT_VIEWER_BASE_URL;
  return raw.endsWith("/") ? raw : `${raw}/`;
}

function buildViewerUrl(baseUrl, { project, style }) {
  const url = new URL(baseUrl);
  if (project) url.searchParams.set("project", project);
  if (style) url.searchParams.set("style", style);
  return url.toString();
}

async function assertViewerReachable(baseUrl, project) {
  const probe = new URL("api/deck", baseUrl);
  if (project) probe.searchParams.set("project", project);
  try {
    const res = await fetch(probe, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  } catch (error) {
    throw new Error(
      `无法访问 viewer：${probe.toString()}（${error instanceof Error ? error.message : String(error)}）\n` +
        `请先启动 viewer（npm run viewer，默认 ${DEFAULT_VIEWER_BASE_URL}），或用 viewerBaseUrl 指定地址。`
    );
  }
}

async function waitForSlideIndex(page, expected, timeoutMs = 8000) {
  const start = Date.now();
  for (;;) {
    const current = await page.evaluate(
      `(() => { const el = document.querySelector(${JSON.stringify(PAGE_INPUT_SELECTOR)}); return el ? Number(el.value) : 0; })()`
    );
    if (current === expected) return true;
    if (Date.now() - start > timeoutMs) return false;
    await sleep(120);
  }
}

async function waitForImagesSettled(page, timeoutMs) {
  const start = Date.now();
  for (;;) {
    const pending = await page.evaluate(
      `(() => [...document.querySelectorAll(${JSON.stringify(SLIDE_SELECTOR)} + ' img')].filter((img) => !img.complete || !img.naturalWidth).length)()`
    );
    if (pending === 0) return true;
    if (Date.now() - start > timeoutMs) return false;
    await sleep(200);
  }
}

async function readSlideRect(page) {
  return await page.evaluate(
    `(() => { const el = document.querySelector(${JSON.stringify(SLIDE_SELECTOR)}); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })()`
  );
}

// 逐页截图，返回每页 PNG Buffer（顺序与 deck 的 slide_files 一致）。
export async function captureDeckShots(projectDir, options = {}) {
  const { deck, slides } = await loadDeckObject(projectDir);
  if (!slides.length) throw new Error(`deck 没有页面，无法导出：${projectDir}`);

  const project = path.basename(projectDir);
  const style = toText(options.style) || toText(deck?.style);
  const viewerBaseUrl = normalizeBaseUrl(options.viewerBaseUrl);
  const deviceScaleFactor = Number(options.deviceScaleFactor) > 0 ? Number(options.deviceScaleFactor) : DEFAULT_DEVICE_SCALE_FACTOR;
  const viewport = { ...DEFAULT_VIEWPORT, ...(options.viewport ?? {}) };
  const settleMs = Number(options.settleMs) >= 0 ? Number(options.settleMs) : 400;
  const imageTimeoutMs = Number(options.imageTimeoutMs) > 0 ? Number(options.imageTimeoutMs) : 8000;
  const onProgress = typeof options.onProgress === "function" ? options.onProgress : () => {};

  await assertViewerReachable(viewerBaseUrl, project);
  const viewerUrl = buildViewerUrl(viewerBaseUrl, { project, style });

  return await withBrowserPage({ chromePath: options.chromePath, viewport, deviceScaleFactor }, async (page) => {
    await page.goto(viewerUrl);
    if (!(await page.waitForSelector(SLIDE_SELECTOR, { timeoutMs: 15000 }))) {
      const status = await page.evaluate(
        `(() => { const el = document.querySelector('.status'); return el ? el.innerText : ''; })()`
      );
      throw new Error(`viewer 未渲染出幻灯片：${viewerUrl}${status ? `（页面状态：${status}）` : ""}`);
    }

    const shots = [];
    for (let i = 0; i < slides.length; i += 1) {
      const pageNo = i + 1;
      if (i > 0) {
        await page.evaluate(
          `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); true`
        );
        await waitForSlideIndex(page, pageNo);
      }
      await waitForImagesSettled(page, imageTimeoutMs);
      await sleep(settleMs);

      const rect = await readSlideRect(page);
      if (!rect || !rect.width || !rect.height) throw new Error(`第 ${pageNo} 页未渲染出 ${SLIDE_SELECTOR}`);
      const png = await page.screenshot(rect);
      shots.push(png);
      onProgress({ index: pageNo, total: slides.length, bytes: png.length, width: rect.width, height: rect.height, deviceScaleFactor });
    }

    return { shots, deck, slides, viewerUrl, deviceScaleFactor, viewport };
  });
}

export async function buildPptxFromShots(shots, { title = "" } = {}) {
  const mod = await import("pptxgenjs");
  const PptxGenJS = mod?.default ?? mod;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "fast_ppt";
  pptx.company = "visual-req";
  pptx.title = title;
  pptx.subject = title;

  for (const shot of shots) {
    const slide = pptx.addSlide();
    slide.addImage({
      data: `image/png;base64,${shot.toString("base64")}`,
      x: 0,
      y: 0,
      w: SLIDE_W,
      h: SLIDE_H
    });
  }

  const out = await pptx.write("nodebuffer");
  return Buffer.from(out);
}

export async function exportDeckToPptxShots(projectDir, options = {}) {
  const captured = await captureDeckShots(projectDir, options);
  if (toText(options.shotsDir)) {
    const shotsDir = path.resolve(options.shotsDir);
    await fs.mkdir(shotsDir, { recursive: true });
    for (let i = 0; i < captured.shots.length; i += 1) {
      const file = path.join(shotsDir, `slide-${String(i + 1).padStart(3, "0")}.png`);
      await fs.writeFile(file, captured.shots[i]);
    }
  }
  return await buildPptxFromShots(captured.shots, { title: toText(captured.deck?.title) });
}
