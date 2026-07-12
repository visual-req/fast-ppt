import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getStylePreset } from "./stylePresets.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;
const MARGIN_X = 0.7;
const TITLE_H = 0.6;

function cleanColor(value, fallback = "143D7A") {
  if (typeof value !== "string" || !value.trim()) return fallback;
  return value.replace(/^#/, "").trim().toUpperCase();
}

function toText(value) {
  return typeof value === "string" ? value : "";
}

function toNumber(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function toBool(value, fallback) {
  if (value === true || value === false) return value;
  return fallback;
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  return value;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function safeJoin(baseDir, requestPath) {
  let decoded = requestPath;
  try {
    decoded = decodeURIComponent(requestPath);
  } catch {}
  const normalized = path.posix.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(baseDir, normalized);
}

async function readAssetDataUri(src) {
  const raw = toText(src);
  if (!raw) return null;
  if (/^https?:\/\//.test(raw)) return null;
  const normalized = raw.startsWith("/") ? raw.slice(1) : raw;
  const fullPath = path.resolve(repoRoot, normalized);
  const ext = path.extname(fullPath).toLowerCase();
  const mime =
    ext === ".svg"
      ? "image/svg+xml"
      : ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".webp"
            ? "image/webp"
            : null;
  if (!mime) return null;
  const buf = await fs.readFile(fullPath);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function loadDeckObject(projectDir) {
  const deckPath = path.join(projectDir, "deck.json");
  if (!(await fileExists(deckPath))) {
    const outlinePath = path.join(projectDir, "outline.json");
    throw new Error(`deck.json 不存在，当前仅存在：${outlinePath}`);
  }
  const manifest = JSON.parse(await fs.readFile(deckPath, "utf8"));
  const deck = manifest && typeof manifest === "object" ? manifest.deck ?? {} : {};
  const slideFiles = Array.isArray(manifest?.slide_files) ? manifest.slide_files : [];
  const slides = [];
  for (const rel of slideFiles) {
    const full = safeJoin(projectDir, rel);
    slides.push(JSON.parse(await fs.readFile(full, "utf8")));
  }
  return { deck, slides };
}

function addPageBase(slide, pptx, preset) {
  slide.background = { color: cleanColor(preset.page_bg, "F4F7FB") };
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.35,
    y: 0.28,
    w: SLIDE_W - 0.7,
    h: SLIDE_H - 0.56,
    rectRadius: 0.18,
    fill: { color: cleanColor(preset.surface, "FFFFFF") },
    line: { color: cleanColor(preset.border, "D7E3F4"), width: 1 }
  });
}

function addTitle(slide, title, preset, pptx) {
  if (!title) return;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: MARGIN_X,
    y: 0.3,
    w: SLIDE_W - MARGIN_X * 2,
    h: 0.64,
    rectRadius: 0.14,
    fill: { color: cleanColor(preset.surface, "FFFFFF"), transparency: 3 },
    line: { color: cleanColor(preset.border, "D7E3F4"), width: 1 }
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: MARGIN_X + 0.14,
    y: 0.4,
    w: 0.08,
    h: 0.42,
    rectRadius: 0.04,
    fill: { color: cleanColor(preset.primary, "1D6FE8") },
    line: { color: cleanColor(preset.primary, "1D6FE8"), transparency: 100 }
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: SLIDE_W - 2.1,
    y: 0.12,
    w: 0.9,
    h: 0.9,
    fill: { color: cleanColor(preset.secondary, "4DA0FF"), transparency: 84 },
    line: { color: cleanColor(preset.secondary, "4DA0FF"), transparency: 100 }
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: SLIDE_W - 1.72,
    y: 0.34,
    w: 0.42,
    h: 0.42,
    fill: { color: cleanColor(preset.surface, "FFFFFF"), transparency: 100 },
    line: { color: cleanColor(preset.border, "D7E3F4"), width: 1 }
  });
  for (let i = 0; i < 5; i += 1) {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: SLIDE_W - 1.16 + i * 0.09,
      y: 0.46 + (i % 2) * 0.06,
      w: 0.03,
      h: 0.03,
      fill: { color: cleanColor(i % 2 === 0 ? preset.primary : preset.secondary, "1D6FE8") },
      line: { color: cleanColor(i % 2 === 0 ? preset.primary : preset.secondary, "1D6FE8"), transparency: 100 }
    });
  }
  slide.addText(title, {
    x: MARGIN_X + 0.32,
    y: 0.38,
    w: SLIDE_W - MARGIN_X * 2 - 1.28,
    h: TITLE_H,
    fontFace: "Aptos Display",
    fontSize: 24,
    bold: true,
    color: cleanColor(preset.text, "143D7A"),
    fit: "shrink"
  });
}

function addBulletText(slide, bullets, box, preset, fontSize = 14) {
  const lines = bullets.map((item) => `• ${item}`).join("\n");
  if (!lines) return;
  slide.addText(lines, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    fontFace: "Aptos",
    fontSize,
    breakLine: false,
    color: cleanColor(preset.text, "143D7A"),
    fit: "shrink"
  });
}

function addSoftCard(slide, pptx, box, preset, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    rectRadius: opts.radius ?? 0.18,
    fill: { color: cleanColor(opts.fill ?? preset.surface_alt, "F7FAFF") },
    line: { color: cleanColor(opts.line ?? preset.border, "D7E3F4"), width: 1 }
  });
}

function drawCoverDecoration(slide, pptx, preset) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: SLIDE_H,
    fill: { color: cleanColor(preset.cover_bg, "0F172A") },
    line: { color: cleanColor(preset.cover_bg, "0F172A"), transparency: 100 }
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 9.1,
    y: -0.2,
    w: 3.2,
    h: 3.2,
    fill: { color: cleanColor(preset.secondary, "4DA0FF"), transparency: 78 },
    line: { color: cleanColor(preset.secondary, "4DA0FF"), transparency: 100 }
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: -0.4,
    y: 5.4,
    w: 3.6,
    h: 3.6,
    fill: { color: cleanColor(preset.primary, "1D6FE8"), transparency: 84 },
    line: { color: cleanColor(preset.primary, "1D6FE8"), transparency: 100 }
  });
  for (let i = 0; i < 6; i += 1) {
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8 + i * 1.7,
      y: 0,
      w: 0,
      h: SLIDE_H,
      line: { color: "FFFFFF", transparency: 88, width: 0.8 }
    });
  }
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 9.15,
    y: 0.9,
    w: 2.1,
    h: 2.1,
    fill: { color: cleanColor(preset.cover_bg_alt, "123B7A"), transparency: 100 },
    line: { color: "FFFFFF", transparency: 84, width: 1.1 }
  });
}

function renderCoverSlide(slide, s, pptx, preset, bgData) {
  if (bgData) slide.addImage({ data: bgData, x: 0, y: 0, w: SLIDE_W, h: SLIDE_H });
  drawCoverDecoration(slide, pptx, preset);
  const title = toText(s.title);
  const subtitle = toText(s.subtitle);
  slide.addText("AI PRESENTATION DECK", {
    x: 1.0,
    y: 1.1,
    w: 3.2,
    h: 0.3,
    fontFace: "Aptos",
    fontSize: 11,
    bold: true,
    color: "FFFFFF",
    transparency: 8,
    charSpace: 1.5
  });
  slide.addText(title, {
    x: 1.0,
    y: 2.0,
    w: 9.1,
    h: 1.4,
    fontFace: "Aptos Display",
    fontSize: 28,
    bold: true,
    color: "FFFFFF",
    fit: "shrink"
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 1.0,
      y: 3.3,
      w: 8.8,
      h: 0.9,
      fontFace: "Aptos",
      fontSize: 16,
      color: "E2E8F0",
      fit: "shrink"
    });
  }
  const meta = [
    ["风格", toText(s.style_label ?? preset.name)],
    ["讲师", toText(s.lecturer ?? s.instructor ?? s.speaker)],
    ["日期", toText(s.date ?? s.when)]
  ].filter(([, value]) => value);
  meta.forEach(([label, value], index) => {
    const x = 1.0 + index * 2.25;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 6.25,
      w: 2.0,
      h: 0.62,
      rectRadius: 0.14,
      fill: { color: "FFFFFF", transparency: 88 },
      line: { color: "FFFFFF", transparency: 75, width: 1 }
    });
    slide.addText(label, { x: x + 0.12, y: 6.34, w: 1.7, h: 0.16, fontFace: "Aptos", fontSize: 9, bold: true, color: "E2E8F0" });
    slide.addText(value, { x: x + 0.12, y: 6.51, w: 1.7, h: 0.18, fontFace: "Aptos", fontSize: 11, bold: true, color: "FFFFFF", fit: "shrink" });
  });
}

function renderSectionLikeSlide(slide, s, pptx, preset, kind) {
  drawCoverDecoration(slide, pptx, preset);
  slide.addShape(pptx.ShapeType.line, {
    x: 0.95,
    y: 2.5,
    w: 0,
    h: 1.15,
    line: { color: "FFFFFF", transparency: 48, width: 3 }
  });
  const title = toText(s.title);
  const subtitle = toText(s.subtitle);
  if (kind === "thank_you") {
    slide.addText(title || "感谢聆听", {
      x: 1.1,
      y: 2.4,
      w: 11.0,
      h: 1.0,
      fontFace: "Aptos Display",
      fontSize: 30,
      bold: true,
      align: "center",
      color: "FFFFFF"
    });
    if (subtitle) {
      slide.addText(subtitle, {
        x: 1.4,
        y: 3.35,
        w: 10.4,
        h: 0.6,
        fontFace: "Aptos",
        fontSize: 16,
        align: "center",
        color: "E2E8F0"
      });
    }
    return;
  }
  slide.addText(kind === "section_divider" ? `Chapter ${toText(s.chapter_no ?? "")}` : "", {
    x: 1.1,
    y: 1.8,
    w: 2.4,
    h: 0.24,
    fontFace: "Aptos",
    fontSize: 12,
    bold: true,
    color: "E2E8F0"
  });
  slide.addText(title, {
    x: 1.1,
    y: 2.4,
    w: 10.6,
    h: 0.95,
    fontFace: "Aptos Display",
    fontSize: 26,
    bold: true,
    color: "FFFFFF"
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 1.1,
      y: 3.25,
      w: 9.6,
      h: 0.7,
      fontFace: "Aptos",
      fontSize: 15,
      color: "E2E8F0"
    });
  }
}

function renderAgendaSlide(slide, s, pptx, preset) {
  drawCoverDecoration(slide, pptx, preset);
  const bullets = toArray(s.bullets).map(toText).filter(Boolean);
  const variant = toText(s.variant);
  const useBands = variant === "bands" || (!variant && bullets.length > 0 && bullets.length <= 4);
  if (useBands) {
    const subtitle = toText(s.subtitle);
    const bandColors = [
      ["2D67FF", "1A4CD2"],
      ["0A9FC8", "0E7AAC"],
      ["4A62D8", "3D4EAC"],
      ["1C7EDF", "125BB2"]
    ];
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.58,
      y: 0.56,
      w: 10.84,
      h: 0.34,
      rectRadius: 0.16,
      fill: { color: "FFFFFF", transparency: 84 },
      line: { color: "FFFFFF", transparency: 100 }
    });
    slide.addText("AGENDA", {
      x: 0.82,
      y: 0.62,
      w: 1.1,
      h: 0.18,
      fontFace: "Aptos",
      fontSize: 10,
      bold: true,
      color: "FFFFFF",
      charSpace: 1.6
    });
    if (subtitle) {
      slide.addText(subtitle, {
        x: 6.2,
        y: 0.62,
        w: 4.7,
        h: 0.2,
        fontFace: "Aptos",
        fontSize: 10,
        color: "E2E8F0",
        align: "right",
        fit: "shrink"
      });
    }
    const count = Math.max(1, Math.min(4, bullets.length));
    const x = 0.58;
    const y = 1.08;
    const h = 5.58;
    const gap = 0.02;
    const bandW = (10.84 - gap * (count - 1)) / count;
    bullets.slice(0, count).forEach((item, index) => {
      const [from, to] = bandColors[index % bandColors.length];
      const bx = x + index * (bandW + gap);
      slide.addShape(pptx.ShapeType.rect, {
        x: bx,
        y,
        w: bandW,
        h,
        fill: { color: from, transparency: 0, gradient: { angle: 90, stops: [{ pos: 0, color: from, transparency: 0 }, { pos: 100, color: to, transparency: 0 }] } },
        line: { color: "FFFFFF", transparency: 88, width: 0.8 }
      });
      slide.addShape(pptx.ShapeType.ellipse, {
        x: bx + 0.16,
        y: y + 0.18,
        w: 0.56,
        h: 0.56,
        fill: { color: "FFFFFF", transparency: 8 },
        line: { color: "FFFFFF", transparency: 100 }
      });
      slide.addText(String(index + 1).padStart(2, "0"), {
        x: bx + 0.22,
        y: y + 0.33,
        w: 0.44,
        h: 0.16,
        fontFace: "Aptos",
        fontSize: 16,
        bold: true,
        align: "center",
        color: cleanColor(preset.cover_bg, "0F172A")
      });
      slide.addText(item, {
        x: bx + 0.18,
        y: y + 1.2,
        w: bandW - 0.36,
        h: 3.9,
        fontFace: "Aptos Display",
        fontSize: 22,
        bold: true,
        color: "FFFFFF",
        valign: "mid",
        fit: "shrink"
      });
    });
    return;
  }
  slide.addText(toText(s.title) || "目录", {
    x: 1.0,
    y: 0.95,
    w: 2.0,
    h: 0.5,
    fontFace: "Aptos Display",
    fontSize: 28,
    bold: true,
    color: "FFFFFF"
  });
  bullets.slice(0, 8).forEach((item, index) => {
    const y = 1.8 + index * 0.62;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.0,
      y,
      w: 0.52,
      h: 0.34,
      rectRadius: 0.17,
      fill: { color: cleanColor(preset.secondary, "4DA0FF") },
      line: { color: cleanColor(preset.secondary, "4DA0FF"), transparency: 100 }
    });
    slide.addText(String(index + 1).padStart(2, "0"), {
      x: 1.04,
      y: y + 0.05,
      w: 0.44,
      h: 0.16,
      fontFace: "Aptos",
      fontSize: 10,
      bold: true,
      align: "center",
      color: "FFFFFF"
    });
    slide.addText(item, {
      x: 1.7,
      y: y + 0.03,
      w: 9.5,
      h: 0.24,
      fontFace: "Aptos",
      fontSize: 18,
      color: "FFFFFF",
      fit: "shrink"
    });
  });
}

function renderTitleBulletsSlide(slide, s, pptx, preset) {
  addPageBase(slide, pptx, preset);
  addTitle(slide, toText(s.title), preset, pptx);
  const contentY = 1.15;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.82,
    y: contentY,
    w: 4.55,
    h: 5.55,
    rectRadius: 0.22,
    fill: { color: cleanColor(preset.cover_bg_alt, "123B7A") },
    line: { color: cleanColor(preset.cover_bg_alt, "123B7A"), transparency: 100 }
  });
  slide.addText(toText(s.subtitle) || "Summary", {
    x: 1.05,
    y: 1.45,
    w: 3.95,
    h: 0.3,
    fontFace: "Aptos",
    fontSize: 11,
    bold: true,
    color: "E2E8F0",
    charSpace: 1.2
  });
  addBulletText(slide, toArray(s.bullets).map(toText).filter(Boolean), { x: 1.05, y: 2.0, w: 3.9, h: 4.0 }, { ...preset, text: "FFFFFF" }, 14);
  const cards = toArray(s.cards).slice(0, 4);
  const cols = 2;
  const gap = 0.18;
  const cardW = (7.1 - gap) / cols;
  const cardH = cards.length > 2 ? 2.62 : 5.55;
  cards.forEach((item, index) => {
    const obj = asObject(item) ?? {};
    const cx = 5.55 + (index % cols) * (cardW + gap);
    const cy = contentY + Math.floor(index / cols) * (cardH + gap);
    addSoftCard(slide, pptx, { x: cx, y: cy, w: cardW, h: cardH }, preset);
    slide.addText(toText(obj.title ?? obj.label) || `结果 ${index + 1}`, {
      x: cx + 0.18,
      y: cy + 0.18,
      w: cardW - 0.36,
      h: 0.22,
      fontFace: "Aptos",
      fontSize: 12,
      bold: true,
      color: cleanColor(preset.primary, "1D6FE8")
    });
    slide.addText(toText(obj.text ?? obj.value), {
      x: cx + 0.18,
      y: cy + 0.52,
      w: cardW - 0.36,
      h: cardH - 0.7,
      fontFace: "Aptos",
      fontSize: 13,
      color: cleanColor(preset.text, "143D7A"),
      fit: "shrink"
    });
  });
}

function renderPhasesOrStepsSlide(slide, s, pptx, preset, mode) {
  addPageBase(slide, pptx, preset);
  addTitle(slide, toText(s.title), preset, pptx);
  const items = toArray(mode === "phases" ? s.phases : s.steps).slice(0, 6);
  const n = Math.max(1, items.length);
  const gap = 0.16;
  const cardW = (SLIDE_W - MARGIN_X * 2 - gap * (n - 1)) / n;
  slide.addShape(pptx.ShapeType.line, {
    x: 1.0,
    y: 1.85,
    w: SLIDE_W - 2.0,
    h: 0,
    line: { color: cleanColor(preset.border, "D7E3F4"), width: 2 }
  });
  items.forEach((item, index) => {
    const obj = asObject(item) ?? {};
    const x = MARGIN_X + index * (cardW + gap);
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + cardW / 2 - 0.18,
      y: 1.58,
      w: 0.36,
      h: 0.36,
      fill: { color: cleanColor(preset.surface, "FFFFFF") },
      line: { color: cleanColor(preset.primary, "1D6FE8"), width: 2 }
    });
    slide.addText(String(index + 1).padStart(2, "0"), {
      x: x + cardW / 2 - 0.12,
      y: 1.68,
      w: 0.24,
      h: 0.1,
      fontFace: "Aptos",
      fontSize: 8,
      bold: true,
      align: "center",
      color: cleanColor(preset.primary, "1D6FE8")
    });
    addSoftCard(slide, pptx, { x, y: 2.05, w: cardW, h: 3.65 }, preset);
    slide.addText(toText(obj.title) || `${mode === "phases" ? "阶段" : "步骤"} ${index + 1}`, {
      x: x + 0.14,
      y: 2.22,
      w: cardW - 0.28,
      h: 0.28,
      fontFace: "Aptos Display",
      fontSize: 14,
      bold: true,
      color: cleanColor(preset.text, "143D7A"),
      fit: "shrink"
    });
    if (toText(obj.text)) {
      slide.addText(toText(obj.text), {
        x: x + 0.14,
        y: 2.58,
        w: cardW - 0.28,
        h: 0.5,
        fontFace: "Aptos",
        fontSize: 11,
        color: cleanColor(preset.muted, "64748B"),
        fit: "shrink"
      });
    }
    addBulletText(slide, toArray(obj.bullets).map(toText).filter(Boolean), { x: x + 0.14, y: toText(obj.text) ? 3.1 : 2.6, w: cardW - 0.28, h: 2.1 }, preset, 11);
    if (toText(obj.gate)) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.14,
        y: 5.26,
        w: cardW - 0.28,
        h: 0.28,
        rectRadius: 0.14,
        fill: { color: cleanColor(preset.surface_alt, "F7FAFF") },
        line: { color: cleanColor(preset.border, "D7E3F4"), width: 1 }
      });
      slide.addText(toText(obj.gate), { x: x + 0.18, y: 5.34, w: cardW - 0.36, h: 0.12, fontFace: "Aptos", fontSize: 9, bold: true, color: cleanColor(preset.primary, "1D6FE8"), fit: "shrink" });
    }
  });
}

function renderArchitectureLayeredSlide(slide, s, pptx, preset) {
  addPageBase(slide, pptx, preset);
  addTitle(slide, toText(s.title), preset, pptx);
  const layers = toArray(s.layers).slice(0, 5);
  layers.forEach((layer, index) => {
    const obj = asObject(layer) ?? {};
    const y = 1.22 + index * 1.08;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.85,
      y,
      w: 2.55,
      h: 0.78,
      rectRadius: 0.18,
      fill: { color: cleanColor(preset.cover_bg_alt, "123B7A") },
      line: { color: cleanColor(preset.cover_bg_alt, "123B7A"), transparency: 100 }
    });
    slide.addText(toText(obj.title) || `层 ${index + 1}`, { x: 1.02, y: y + 0.22, w: 2.1, h: 0.2, fontFace: "Aptos", fontSize: 15, bold: true, color: "FFFFFF", fit: "shrink" });
    addSoftCard(slide, pptx, { x: 3.6, y, w: 8.85, h: 0.78 }, preset);
    const body = [toText(obj.text), ...toArray(obj.bullets).map(toText).filter(Boolean)].filter(Boolean).join("  ·  ");
    slide.addText(body, { x: 3.82, y: y + 0.18, w: 8.35, h: 0.34, fontFace: "Aptos", fontSize: 12, color: cleanColor(preset.text, "143D7A"), fit: "shrink" });
  });
}

function renderNineGridOrFourGridSlide(slide, s, pptx, preset, layoutType) {
  addPageBase(slide, pptx, preset);
  addTitle(slide, toText(s.title), preset, pptx);
  const raw = toArray(s.grid ?? s.items);
  if (layoutType === "four_grid") {
    const items = raw.slice(0, 4);
    items.forEach((item, index) => {
      const obj = asObject(item) ?? {};
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 0.86 + col * 6.0;
      const y = 1.28 + row * 2.45;
      addSoftCard(slide, pptx, { x, y, w: 5.55, h: 2.12 }, preset);
      slide.addText(toText(obj.title) || `模块 ${index + 1}`, { x: x + 0.18, y: y + 0.18, w: 5.0, h: 0.24, fontFace: "Aptos Display", fontSize: 16, bold: true, color: cleanColor(preset.text, "143D7A") });
      const body = [toText(obj.text), ...toArray(obj.bullets).map(toText).filter(Boolean)].filter(Boolean).join("\n");
      slide.addText(body, { x: x + 0.18, y: y + 0.52, w: 5.0, h: 1.3, fontFace: "Aptos", fontSize: 12, color: cleanColor(preset.muted, "64748B"), fit: "shrink" });
    });
    return;
  }
  const items = raw.slice(0, 9);
  const useHub = items.length > 0 && items.length < 9;
  const slots = useHub ? [0, 1, 2, 3, 5, 6, 7, 8] : [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const positioned = Array.from({ length: 9 }, () => null);
  items.forEach((item, index) => {
    const slot = slots[index];
    if (typeof slot === "number") positioned[slot] = item;
  });
  const gridPositions = [
    [0.86, 1.24], [4.45, 1.24], [8.04, 1.24],
    [0.86, 2.96], [4.45, 2.96], [8.04, 2.96],
    [0.86, 4.68], [4.45, 4.68], [8.04, 4.68]
  ];
  positioned.forEach((item, index) => {
    const [x, y] = gridPositions[index];
    if (!item && useHub && index === 4) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 3.33,
        h: 1.46,
        rectRadius: 0.22,
        fill: { color: cleanColor(preset.cover_bg_alt, "123B7A") },
        line: { color: cleanColor(preset.cover_bg_alt, "123B7A"), transparency: 100 }
      });
      slide.addText(toText(s.title) || "核心主题", { x: x + 0.18, y: y + 0.34, w: 2.95, h: 0.26, fontFace: "Aptos Display", fontSize: 16, bold: true, align: "center", color: "FFFFFF", fit: "shrink" });
      slide.addText(toText(s.subtitle) || "中心枢纽", { x: x + 0.18, y: y + 0.72, w: 2.95, h: 0.2, fontFace: "Aptos", fontSize: 11, align: "center", color: "E2E8F0", fit: "shrink" });
      return;
    }
    if (!item) return;
    const obj = asObject(item) ?? {};
    addSoftCard(slide, pptx, { x, y, w: 3.33, h: 1.46 }, preset);
    slide.addText(toText(obj.title) || `模块 ${index + 1}`, { x: x + 0.14, y: y + 0.18, w: 2.95, h: 0.2, fontFace: "Aptos Display", fontSize: 13, bold: true, color: cleanColor(preset.text, "143D7A"), fit: "shrink" });
    const body = [toText(obj.text), ...toArray(obj.bullets).map(toText).filter(Boolean)].filter(Boolean).slice(0, 3).join("\n");
    slide.addText(body, { x: x + 0.14, y: y + 0.48, w: 2.95, h: 0.72, fontFace: "Aptos", fontSize: 10.5, color: cleanColor(preset.muted, "64748B"), fit: "shrink" });
  });
}

function renderProcessFlowSlide(slide, s, pptx, preset) {
  addPageBase(slide, pptx, preset);
  addTitle(slide, toText(s.title), preset, pptx);
  const steps = toArray(s.steps ?? s.stages).slice(0, 4);
  const gap = 0.18;
  const cardW = (SLIDE_W - MARGIN_X * 2 - gap * (steps.length - 1)) / Math.max(1, steps.length);
  steps.forEach((step, index) => {
    const obj = asObject(step) ?? {};
    const x = 0.86 + index * (cardW + gap);
    addSoftCard(slide, pptx, { x, y: 1.25, w: cardW, h: 3.18 }, preset);
    slide.addShape(pptx.ShapeType.rect, { x, y: 1.25, w: cardW, h: 0.07, fill: { color: cleanColor(preset.primary, "1D6FE8") }, line: { color: cleanColor(preset.primary, "1D6FE8"), transparency: 100 } });
    slide.addText(String(index + 1).padStart(2, "0"), { x: x + 0.14, y: 1.42, w: 0.32, h: 0.16, fontFace: "Aptos", fontSize: 10, bold: true, color: cleanColor(preset.primary, "1D6FE8") });
    slide.addText(toText(obj.title) || `阶段 ${index + 1}`, { x: x + 0.14, y: 1.68, w: cardW - 0.28, h: 0.22, fontFace: "Aptos Display", fontSize: 14, bold: true, color: cleanColor(preset.text, "143D7A"), fit: "shrink" });
    if (toText(obj.subtitle)) {
      slide.addText(toText(obj.subtitle), { x: x + 0.14, y: 2.0, w: cardW - 0.28, h: 0.32, fontFace: "Aptos", fontSize: 10.5, color: cleanColor(preset.muted, "64748B"), fit: "shrink" });
    }
    const panels = toArray(obj.panels);
    if (panels.length) {
      panels.slice(0, 4).forEach((panel, panelIndex) => {
        const py = 2.44 + panelIndex * 0.46;
        const pobj = asObject(panel) ?? {};
        slide.addShape(pptx.ShapeType.roundRect, {
          x: x + 0.14,
          y: py,
          w: cardW - 0.28,
          h: 0.34,
          rectRadius: 0.1,
          fill: { color: cleanColor(preset.surface_alt, "F7FAFF") },
          line: { color: cleanColor(preset.border, "D7E3F4"), width: 1 }
        });
        slide.addText(`${toText(pobj.title)} ${toText(pobj.text ?? pobj.note ?? pobj.value)}`.trim(), { x: x + 0.18, y: py + 0.1, w: cardW - 0.36, h: 0.12, fontFace: "Aptos", fontSize: 9.5, color: cleanColor(preset.text, "143D7A"), fit: "shrink" });
      });
    } else {
      addBulletText(slide, toArray(obj.bullets).map(toText).filter(Boolean), { x: x + 0.14, y: 2.38, w: cardW - 0.28, h: 1.65 }, preset, 10.5);
    }
    if (index < steps.length - 1) {
      slide.addShape(pptx.ShapeType.line, {
        x: x + cardW + 0.02,
        y: 2.8,
        w: 0.1,
        h: 0,
        line: { color: cleanColor(preset.secondary, "4DA0FF"), width: 2.5, beginArrowType: "none", endArrowType: "triangle" }
      });
    }
  });
  const footerCards = toArray(s.footer_cards ?? s.outputs ?? s.supports ?? s.metrics).slice(0, 4);
  footerCards.forEach((card, index) => {
    const obj = asObject(card) ?? {};
    const x = 0.86 + index * 3.15;
    addSoftCard(slide, pptx, { x, y: 5.0, w: 2.9, h: 0.95 }, preset);
    slide.addText(toText(obj.title) || `模块 ${index + 1}`, { x: x + 0.14, y: 5.15, w: 2.5, h: 0.14, fontFace: "Aptos", fontSize: 10.5, bold: true, color: cleanColor(preset.muted, "64748B") });
    slide.addText(toText(obj.value ?? obj.note ?? obj.text), { x: x + 0.14, y: 5.4, w: 2.5, h: 0.28, fontFace: "Aptos Display", fontSize: 16, bold: true, color: cleanColor(preset.text, "143D7A"), fit: "shrink" });
  });
  if (toText(s.summary)) {
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.86, y: 6.18, w: 11.6, h: 0.45, rectRadius: 0.12, fill: { color: cleanColor(preset.surface_alt, "F7FAFF") }, line: { color: cleanColor(preset.border, "D7E3F4"), width: 1 } });
    slide.addText(toText(s.summary), { x: 1.02, y: 6.34, w: 11.2, h: 0.12, fontFace: "Aptos", fontSize: 10.5, color: cleanColor(preset.muted, "64748B"), fit: "shrink" });
  }
}

function renderSwimlaneProcessSlide(slide, s, pptx, preset) {
  addPageBase(slide, pptx, preset);
  addTitle(slide, toText(s.title), preset, pptx);
  const lanes = toArray(s.lanes).slice(0, 5);
  const maxSteps = Math.max(...lanes.map((lane) => toArray(asObject(lane)?.steps).length), toArray(s.headers).length, 1);
  const laneW = 1.65;
  const gap = 0.1;
  const stepW = (SLIDE_W - MARGIN_X * 2 - laneW - gap * maxSteps) / maxSteps;
  slide.addShape(pptx.ShapeType.roundRect, { x: 0.86, y: 1.2, w: laneW, h: 0.52, rectRadius: 0.12, fill: { color: cleanColor(preset.surface_alt, "F7FAFF") }, line: { color: cleanColor(preset.border, "D7E3F4"), width: 1 } });
  slide.addText("泳道", { x: 1.15, y: 1.38, w: 0.9, h: 0.12, fontFace: "Aptos", fontSize: 11, bold: true, color: cleanColor(preset.primary, "1D6FE8") });
  for (let i = 0; i < maxSteps; i += 1) {
    const x = 0.86 + laneW + gap + i * (stepW + gap);
    slide.addShape(pptx.ShapeType.roundRect, { x, y: 1.2, w: stepW, h: 0.52, rectRadius: 0.12, fill: { color: cleanColor(preset.surface_alt, "F7FAFF") }, line: { color: cleanColor(preset.border, "D7E3F4"), width: 1 } });
    slide.addText(toText(toArray(s.headers)[i]) || `步骤 ${i + 1}`, { x: x + 0.05, y: 1.38, w: stepW - 0.1, h: 0.12, fontFace: "Aptos", fontSize: 10.5, bold: true, align: "center", color: cleanColor(preset.primary, "1D6FE8"), fit: "shrink" });
  }
  lanes.forEach((lane, row) => {
    const obj = asObject(lane) ?? {};
    const y = 1.9 + row * 0.92;
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.86, y, w: laneW, h: 0.72, rectRadius: 0.14, fill: { color: cleanColor(preset.surface_alt, "F7FAFF") }, line: { color: cleanColor(preset.border, "D7E3F4"), width: 1 } });
    slide.addText(toText(obj.name) || `角色 ${row + 1}`, { x: 1.02, y: y + 0.28, w: 1.3, h: 0.12, fontFace: "Aptos", fontSize: 12, bold: true, color: cleanColor(preset.text, "143D7A"), fit: "shrink" });
    const steps = toArray(obj.steps);
    for (let i = 0; i < maxSteps; i += 1) {
      const x = 0.86 + laneW + gap + i * (stepW + gap);
      addSoftCard(slide, pptx, { x, y, w: stepW, h: 0.72 }, preset);
      const value = steps[i];
      const text = typeof value === "string" ? value : toText(asObject(value)?.text);
      slide.addText(text || "—", { x: x + 0.08, y: y + 0.22, w: stepW - 0.16, h: 0.24, fontFace: "Aptos", fontSize: 10.5, color: cleanColor(text ? preset.text : preset.muted, text ? "143D7A" : "94A3B8"), align: "center", fit: "shrink" });
    }
  });
}

function renderCaseStudySlide(slide, s, pptx, preset) {
  addPageBase(slide, pptx, preset);
  addTitle(slide, toText(s.title), preset, pptx);
  addSoftCard(slide, pptx, { x: 0.86, y: 1.18, w: 4.0, h: 5.7 }, preset);
  const imageObj = asObject(s.image);
  const blocks = toArray(s.blocks).slice(0, 4);
  if (imageObj?.src || imageObj?.url) {
    const box = { x: 1.1, y: 1.78, w: 3.52, h: 3.35 };
    slide.addText("CASE STUDY", { x: 1.12, y: 1.42, w: 1.2, h: 0.14, fontFace: "Aptos", fontSize: 10, bold: true, color: cleanColor(preset.primary, "1D6FE8") });
    addSoftCard(slide, pptx, box, preset, { fill: preset.page_bg });
  } else {
    slide.addText("CASE STUDY", { x: 1.12, y: 1.42, w: 1.2, h: 0.14, fontFace: "Aptos", fontSize: 10, bold: true, color: cleanColor(preset.primary, "1D6FE8") });
    slide.addShape(pptx.ShapeType.roundRect, { x: 1.12, y: 1.74, w: 3.48, h: 3.35, rectRadius: 0.2, fill: { color: cleanColor(preset.page_bg, "F4F7FB") }, line: { color: cleanColor(preset.border, "D7E3F4"), width: 1 } });
    slide.addText("案例截图 / 场景示意", { x: 1.52, y: 3.25, w: 2.7, h: 0.2, fontFace: "Aptos", fontSize: 13, bold: true, align: "center", color: cleanColor(preset.muted, "64748B") });
  }
  if (toText(imageObj?.caption)) {
    slide.addText(toText(imageObj.caption), { x: 1.1, y: 5.34, w: 3.5, h: 1.0, fontFace: "Aptos", fontSize: 10.5, color: cleanColor(preset.muted, "64748B"), fit: "shrink" });
  }
  slide.addShape(pptx.ShapeType.roundRect, { x: 5.08, y: 1.18, w: 7.35, h: 1.18, rectRadius: 0.18, fill: { color: cleanColor(preset.cover_bg_alt, "123B7A") }, line: { color: cleanColor(preset.cover_bg_alt, "123B7A"), transparency: 100 } });
  slide.addText("Summary", { x: 5.32, y: 1.45, w: 1.2, h: 0.16, fontFace: "Aptos", fontSize: 11, bold: true, color: "E2E8F0" });
  slide.addText(toText(s.title) || "案例拆解", { x: 5.32, y: 1.72, w: 6.5, h: 0.22, fontFace: "Aptos Display", fontSize: 17, bold: true, color: "FFFFFF", fit: "shrink" });
  const positions = [[5.08, 2.56], [8.86, 2.56], [5.08, 4.72], [8.86, 4.72]];
  blocks.forEach((block, index) => {
    const obj = asObject(block) ?? {};
    const [x, y] = positions[index];
    addSoftCard(slide, pptx, { x, y, w: 3.56, h: 1.86 }, preset);
    slide.addText(String(index + 1).padStart(2, "0"), { x: x + 0.18, y: y + 0.15, w: 0.28, h: 0.12, fontFace: "Aptos", fontSize: 10, bold: true, color: cleanColor(preset.primary, "1D6FE8") });
    slide.addText(toText(obj.title) || `模块 ${index + 1}`, { x: x + 0.18, y: y + 0.42, w: 3.0, h: 0.16, fontFace: "Aptos Display", fontSize: 13, bold: true, color: cleanColor(preset.text, "143D7A") });
    const body = [toText(obj.text), ...toArray(obj.bullets).map(toText).filter(Boolean)].filter(Boolean).join("\n");
    slide.addText(body, { x: x + 0.18, y: y + 0.72, w: 3.0, h: 0.88, fontFace: "Aptos", fontSize: 10.5, color: cleanColor(preset.muted, "64748B"), fit: "shrink" });
  });
}

function renderBeforeAfterSlide(slide, s, pptx, preset) {
  addPageBase(slide, pptx, preset);
  addTitle(slide, toText(s.title), preset, pptx);
  const before = asObject(s.before) ?? {};
  const after = asObject(s.after) ?? {};
  slide.addShape(pptx.ShapeType.roundRect, { x: 0.96, y: 1.58, w: 4.9, h: 4.4, rectRadius: 0.24, fill: { color: "FFF7F7" }, line: { color: "FECACA", width: 1 } });
  slide.addShape(pptx.ShapeType.roundRect, { x: 7.48, y: 1.58, w: 4.9, h: 4.4, rectRadius: 0.24, fill: { color: "F0FDF4" }, line: { color: "BBF7D0", width: 1 } });
  slide.addText(toText(before.title) || "Before", { x: 1.2, y: 1.92, w: 4.2, h: 0.24, fontFace: "Aptos Display", fontSize: 17, bold: true, color: "B91C1C" });
  slide.addText(toText(after.title) || "After", { x: 7.72, y: 1.92, w: 4.2, h: 0.24, fontFace: "Aptos Display", fontSize: 17, bold: true, color: "166534" });
  const beforeBody = [toText(before.text), ...toArray(before.bullets).map(toText).filter(Boolean)].filter(Boolean).join("\n");
  const afterBody = [toText(after.text), ...toArray(after.bullets).map(toText).filter(Boolean)].filter(Boolean).join("\n");
  slide.addText(beforeBody, { x: 1.2, y: 2.42, w: 4.0, h: 3.1, fontFace: "Aptos", fontSize: 13, color: "7F1D1D", fit: "shrink" });
  slide.addText(afterBody, { x: 7.72, y: 2.42, w: 4.0, h: 3.1, fontFace: "Aptos", fontSize: 13, color: "14532D", fit: "shrink" });
  slide.addShape(pptx.ShapeType.chevron, { x: 5.92, y: 3.12, w: 1.1, h: 0.62, fill: { color: cleanColor(preset.primary, "1D6FE8") }, line: { color: cleanColor(preset.primary, "1D6FE8"), transparency: 100 } });
}

function renderRoadmapSlide(slide, s, pptx, preset) {
  addPageBase(slide, pptx, preset);
  addTitle(slide, toText(s.title), preset, pptx);
  const items = toArray(s.items).slice(0, 5);
  const n = Math.max(1, items.length);
  const gap = 0.15;
  const cardW = (SLIDE_W - MARGIN_X * 2 - gap * (n - 1)) / n;
  slide.addShape(pptx.ShapeType.line, { x: 1.1, y: 2.0, w: 10.9, h: 0, line: { color: cleanColor(preset.border, "D7E3F4"), width: 2 } });
  items.forEach((item, index) => {
    const obj = asObject(item) ?? {};
    const x = 0.86 + index * (cardW + gap);
    slide.addShape(pptx.ShapeType.ellipse, { x: x + cardW / 2 - 0.2, y: 1.78, w: 0.4, h: 0.4, fill: { color: cleanColor(preset.surface, "FFFFFF") }, line: { color: cleanColor(preset.primary, "1D6FE8"), width: 2 } });
    addSoftCard(slide, pptx, { x, y: 2.26, w: cardW, h: 2.02 }, preset);
    if (toText(obj.period)) {
      slide.addShape(pptx.ShapeType.roundRect, { x: x + 0.14, y: 2.42, w: cardW - 0.28, h: 0.24, rectRadius: 0.12, fill: { color: cleanColor(preset.surface_alt, "F7FAFF") }, line: { color: cleanColor(preset.border, "D7E3F4"), width: 1 } });
      slide.addText(toText(obj.period), { x: x + 0.18, y: 2.49, w: cardW - 0.36, h: 0.1, fontFace: "Aptos", fontSize: 9.5, bold: true, align: "center", color: cleanColor(preset.primary, "1D6FE8") });
    }
    slide.addText(toText(obj.title) || `阶段 ${index + 1}`, { x: x + 0.14, y: 2.82, w: cardW - 0.28, h: 0.18, fontFace: "Aptos Display", fontSize: 13, bold: true, color: cleanColor(preset.text, "143D7A") });
    slide.addText(toText(obj.text ?? obj.subtitle), { x: x + 0.14, y: 3.1, w: cardW - 0.28, h: 0.82, fontFace: "Aptos", fontSize: 10.5, color: cleanColor(preset.muted, "64748B"), fit: "shrink" });
  });
  const actions = toArray(s.actions).slice(0, 3);
  actions.forEach((action, index) => {
    const obj = asObject(action) ?? {};
    const x = 0.86 + index * 4.1;
    addSoftCard(slide, pptx, { x, y: 4.7, w: 3.82, h: 1.16 }, preset);
    slide.addText(toText(obj.title) || `动作 ${index + 1}`, { x: x + 0.14, y: 4.88, w: 3.2, h: 0.16, fontFace: "Aptos Display", fontSize: 13, bold: true, color: cleanColor(preset.text, "143D7A") });
    slide.addText([toText(obj.text), toText(obj.note)].filter(Boolean).join("\n"), { x: x + 0.14, y: 5.14, w: 3.2, h: 0.52, fontFace: "Aptos", fontSize: 10.5, color: cleanColor(preset.muted, "64748B"), fit: "shrink" });
  });
  if (toText(s.goal ?? s.summary)) {
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.86, y: 6.16, w: 11.55, h: 0.42, rectRadius: 0.12, fill: { color: cleanColor(preset.surface_alt, "F7FAFF") }, line: { color: cleanColor(preset.border, "D7E3F4"), width: 1 } });
    slide.addText(toText(s.goal ?? s.summary), { x: 1.0, y: 6.31, w: 11.2, h: 0.12, fontFace: "Aptos", fontSize: 10.5, color: cleanColor(preset.muted, "64748B"), fit: "shrink" });
  }
}

function renderJourneyMapSlide(slide, s, pptx, preset) {
  addPageBase(slide, pptx, preset);
  addTitle(slide, toText(s.title), preset, pptx);
  const stages = toArray(s.stages).slice(0, 8);
  const n = Math.max(1, stages.length);
  const gap = 0.14;
  const cardW = (SLIDE_W - MARGIN_X * 2 - gap * (n - 1)) / n;
  slide.addShape(pptx.ShapeType.line, { x: 1.0, y: 3.4, w: 11.2, h: 0, line: { color: cleanColor(preset.border, "D7E3F4"), width: 2 } });
  stages.forEach((stage, index) => {
    const obj = asObject(stage) ?? {};
    const x = 0.86 + index * (cardW + gap);
    slide.addShape(pptx.ShapeType.ellipse, { x: x + cardW / 2 - 0.17, y: 3.22, w: 0.34, h: 0.34, fill: { color: cleanColor(preset.primary, "1D6FE8") }, line: { color: cleanColor(preset.primary, "1D6FE8"), transparency: 100 } });
    addSoftCard(slide, pptx, { x, y: 1.7 + (index % 2 ? 1.05 : 0), w: cardW, h: 1.35 }, preset);
    slide.addText(toText(obj.label) || `阶段 ${index + 1}`, { x: x + 0.12, y: 1.9 + (index % 2 ? 1.05 : 0), w: cardW - 0.24, h: 0.14, fontFace: "Aptos Display", fontSize: 11.5, bold: true, color: cleanColor(preset.text, "143D7A"), fit: "shrink" });
    slide.addText(toText(obj.description), { x: x + 0.12, y: 2.15 + (index % 2 ? 1.05 : 0), w: cardW - 0.24, h: 0.5, fontFace: "Aptos", fontSize: 9.5, color: cleanColor(preset.muted, "64748B"), fit: "shrink" });
  });
}

function renderBarChartSlide(slide, s, pptx, preset) {
  addPageBase(slide, pptx, preset);
  addTitle(slide, toText(s.title), preset, pptx);
  const data = toArray(s.data).slice(0, 8).map((item) => asObject(item) ?? {});
  const rawMax = Math.max(...data.map((d) => toNumber(d.value, 0)), 1);
  const exponent = Math.floor(Math.log10(Math.max(rawMax, 1)));
  const base = 10 ** exponent;
  const normalized = rawMax / base;
  const niceMax = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * base;
  const chartX = 1.15;
  const chartY = 1.45;
  const chartW = 10.5;
  const chartH = 4.65;
  const leftAxisW = 0.7;
  const bottomAxisH = 0.7;
  const plotX = chartX + leftAxisW;
  const plotY = chartY;
  const plotW = chartW - leftAxisW;
  const plotH = chartH - bottomAxisH;
  const tickCount = 4;
  for (let i = 0; i <= tickCount; i += 1) {
    const value = (niceMax / tickCount) * i;
    const y = plotY + plotH - (plotH * value) / niceMax;
    slide.addShape(pptx.ShapeType.line, {
      x: plotX,
      y,
      w: plotW,
      h: 0,
      line: { color: cleanColor(preset.border, "D7E3F4"), transparency: i === 0 ? 0 : 20, width: 1 }
    });
    slide.addText(Math.round(value).toLocaleString("zh-CN"), {
      x: chartX,
      y: y - 0.08,
      w: leftAxisW - 0.08,
      h: 0.16,
      fontFace: "Aptos",
      fontSize: 9,
      align: "right",
      color: cleanColor(preset.muted, "64748B")
    });
  }
  slide.addShape(pptx.ShapeType.line, { x: plotX, y: plotY, w: 0, h: plotH, line: { color: cleanColor(preset.border, "D7E3F4"), width: 1.4 } });
  slide.addShape(pptx.ShapeType.line, { x: plotX, y: plotY + plotH, w: plotW, h: 0, line: { color: cleanColor(preset.border, "D7E3F4"), width: 1.4 } });
  slide.addText(toText(s.unit) || "值", {
    x: chartX,
    y: chartY - 0.04,
    w: 0.4,
    h: 0.12,
    fontFace: "Aptos",
    fontSize: 9,
    color: cleanColor(preset.muted, "64748B")
  });
  const slotW = plotW / Math.max(1, data.length);
  data.forEach((item, index) => {
    const value = toNumber(item.value, 0);
    const x = plotX + index * slotW + slotW * 0.18;
    const bw = slotW * 0.64;
    const h = plotH * (value / niceMax);
    const y = plotY + plotH - h;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: bw,
      h,
      rectRadius: 0.08,
      fill: { color: cleanColor(toText(item.color) || preset.primary, "1D6FE8") },
      line: { color: cleanColor(toText(item.color) || preset.primary, "1D6FE8"), transparency: 100 }
    });
    slide.addText(String(value), {
      x: x - 0.1,
      y: Math.max(plotY - 0.02, y - 0.22),
      w: bw + 0.2,
      h: 0.14,
      fontFace: "Aptos",
      fontSize: 9.5,
      bold: true,
      align: "center",
      color: cleanColor(preset.text, "143D7A")
    });
    slide.addText(toText(item.label), {
      x: x - 0.18,
      y: plotY + plotH + 0.12,
      w: bw + 0.36,
      h: 0.34,
      fontFace: "Aptos",
      fontSize: 9.5,
      align: "center",
      color: cleanColor(preset.muted, "64748B"),
      fit: "shrink",
      breakLine: false,
      margin: 0.02
    });
  });
}

function renderLineChartSlide(slide, s, pptx, preset, pptxLib) {
  addPageBase(slide, pptxLib, preset);
  addTitle(slide, toText(s.title), preset, pptx);
  const data = toArray(s.data).slice(0, 8).map((item) => asObject(item) ?? {});
  if (!data.length) return;
  const rawMax = Math.max(...data.map((d) => toNumber(d.value, 0)), 1);
  const exponent = Math.floor(Math.log10(Math.max(rawMax, 1)));
  const base = 10 ** exponent;
  const normalized = rawMax / base;
  const niceMax = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * base;

  const chartX = 1.0;
  const chartY = 1.3;
  const chartW = 11.2;
  const chartH = 5.1;
  const axisLeftW = 0.55;
  const plotX = chartX + axisLeftW;
  const plotY = chartY + 0.28;
  const plotW = chartW - axisLeftW - 0.35;
  const plotH = chartH - 1.28;
  const baselineY = plotY + plotH;

  const tickCount = 4;
  for (let i = 0; i <= tickCount; i += 1) {
    const value = (niceMax / tickCount) * i;
    const y = baselineY - (plotH * value) / niceMax;
    slide.addShape(pptx.ShapeType.line, {
      x: plotX,
      y,
      w: plotW,
      h: 0,
      line: { color: cleanColor(preset.border, "D7E3F4"), transparency: i === 0 ? 0 : 20, width: 1 }
    });
    slide.addText(Math.round(value).toLocaleString("zh-CN"), {
      x: chartX,
      y: y - 0.08,
      w: axisLeftW - 0.08,
      h: 0.16,
      fontFace: "Aptos",
      fontSize: 9,
      align: "right",
      color: cleanColor(preset.muted, "64748B")
    });
  }

  slide.addShape(pptx.ShapeType.line, {
    x: plotX,
    y: plotY,
    w: 0,
    h: plotH,
    line: { color: cleanColor(preset.text, "143D7A"), transparency: 68, width: 1.2 }
  });
  slide.addText(toText(s.unit) || "值", {
    x: chartX,
    y: chartY + 0.02,
    w: axisLeftW,
    h: 0.16,
    fontFace: "Aptos",
    fontSize: 9,
    color: cleanColor(preset.muted, "64748B")
  });

  const points = data.map((item, index) => {
    const value = toNumber(item.value, 0);
    const x = data.length > 1 ? plotX + index * (plotW / (data.length - 1)) : plotX + plotW / 2;
    const y = baselineY - (plotH * value) / niceMax;
    const valueLabel = value.toLocaleString("zh-CN");
    const boxW = Math.max(0.52, valueLabel.length * 0.085 + 0.18);
    const boxH = 0.26;
    const boxX = Math.min(plotX + plotW - boxW, Math.max(plotX, x - boxW / 2));
    const preferredTopY = y - boxH - 0.22;
    const boxY = preferredTopY >= plotY ? preferredTopY : Math.min(baselineY - boxH - 0.02, y + 0.16);
    return {
      x,
      y,
      label: toText(item.label),
      value,
      valueLabel,
      boxX,
      boxY,
      boxW,
      boxH,
      leaderY: boxY < y ? boxY + boxH : boxY
    };
  });

  for (let i = 0; i < points.length - 1; i += 1) {
    slide.addShape(pptxLib.ShapeType.line, {
      x: points[i].x,
      y: points[i].y,
      w: points[i + 1].x - points[i].x,
      h: points[i + 1].y - points[i].y,
      line: { color: cleanColor(preset.primary, "1D6FE8"), width: 2.4 }
    });
  }

  points.forEach((point) => {
    slide.addShape(pptx.ShapeType.line, {
      x: point.x,
      y: Math.min(point.y, point.leaderY),
      w: 0,
      h: Math.abs(point.leaderY - point.y),
      line: { color: cleanColor(preset.primary, "1D6FE8"), transparency: 62, width: 1, dash: "dash" }
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: point.boxX,
      y: point.boxY,
      w: point.boxW,
      h: point.boxH,
      rectRadius: 0.08,
      fill: { color: cleanColor(preset.surface, "FFFFFF") },
      line: { color: cleanColor(preset.primary, "1D6FE8"), transparency: 70, width: 1 }
    });
    slide.addText(point.valueLabel, {
      x: point.boxX + 0.02,
      y: point.boxY + 0.04,
      w: point.boxW - 0.04,
      h: point.boxH - 0.08,
      fontFace: "Aptos",
      fontSize: 9,
      bold: true,
      align: "center",
      color: cleanColor(preset.text, "143D7A")
    });
    slide.addShape(pptxLib.ShapeType.ellipse, {
      x: point.x - 0.08,
      y: point.y - 0.08,
      w: 0.16,
      h: 0.16,
      fill: { color: cleanColor(preset.primary, "1D6FE8") },
      line: { color: cleanColor(preset.surface, "FFFFFF"), width: 1 }
    });
    slide.addText(point.label, {
      x: point.x - 0.34,
      y: baselineY + 0.14,
      w: 0.68,
      h: 0.28,
      fontFace: "Aptos",
      fontSize: 9,
      bold: true,
      align: "center",
      color: cleanColor(preset.muted, "64748B"),
      fit: "shrink",
      breakLine: false,
      margin: 0.02
    });
  });
}

function renderRadarChartSlide(slide, s, pptx, preset) {
  addPageBase(slide, pptx, preset);
  addTitle(slide, toText(s.title), preset, pptx);
  const categories = toArray(s.categories).map(toText).filter(Boolean);
  const values = toArray(s.values).map((item) => toNumber(item, 0));
  const max = Math.max(toNumber(s.max, 0), 1);
  categories.slice(0, 6).forEach((label, index) => {
    const value = values[index] ?? 0;
    const y = 1.55 + index * 0.72;
    slide.addText(label, { x: 1.0, y: y + 0.12, w: 2.3, h: 0.14, fontFace: "Aptos", fontSize: 12, bold: true, color: cleanColor(preset.text, "143D7A"), fit: "shrink" });
    slide.addShape(pptx.ShapeType.roundRect, { x: 3.45, y, w: 6.8, h: 0.28, rectRadius: 0.14, fill: { color: cleanColor(preset.surface_alt, "F7FAFF") }, line: { color: cleanColor(preset.border, "D7E3F4"), width: 1 } });
    slide.addShape(pptx.ShapeType.roundRect, { x: 3.45, y, w: 6.8 * (value / max), h: 0.28, rectRadius: 0.14, fill: { color: cleanColor(preset.primary, "1D6FE8") }, line: { color: cleanColor(preset.primary, "1D6FE8"), transparency: 100 } });
    slide.addText(`${value}/${max}`, { x: 10.45, y: y + 0.08, w: 0.8, h: 0.12, fontFace: "Aptos", fontSize: 10, bold: true, color: cleanColor(preset.text, "143D7A") });
  });
}

function renderTableSlide(slide, s, pptx, preset) {
  addTitle(slide, toText(s.title), preset, pptx);
  const tableObj = asObject(s.table) ?? {};
  const headers = toArray(tableObj.headers ?? s.headers).map(toText).filter(Boolean);
  const rows = toArray(tableObj.rows ?? s.rows).map((row) => (Array.isArray(row) ? row.map(toText) : []));
  const tableRows = [];
  if (headers.length) tableRows.push(headers);
  tableRows.push(...rows);
  if (!tableRows.length) return;
  const cols = Math.max(1, tableRows[0].length);
  const colW = Array.from({ length: cols }, () => (SLIDE_W - MARGIN_X * 2) / cols);
  slide.addTable(tableRows, {
    x: MARGIN_X,
    y: 1.18,
    w: SLIDE_W - MARGIN_X * 2,
    colW,
    fontFace: "Aptos",
    fontSize: 11,
    border: { type: "solid", color: cleanColor(preset.border, "D7E3F4"), pt: 1 },
    fill: cleanColor(preset.surface, "FFFFFF"),
    color: cleanColor(preset.text, "143D7A")
  });
}

async function exportDeckToPptx(projectDir, options = {}) {
  const { deck, slides } = await loadDeckObject(projectDir);
  const mod = await import("pptxgenjs");
  const PptxGenJS = mod?.default ?? mod;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "fast_ppt";
  pptx.company = "visual-req";
  pptx.subject = toText(deck?.title ?? "Deck");
  pptx.title = toText(deck?.title ?? "Deck");
  const effectiveStyle = toText(options?.style) || toText(deck?.style) || "consulting";
  const preset = getStylePreset(effectiveStyle);

  for (let i = 0; i < slides.length; i += 1) {
    const s = slides[i] ?? {};
    const layoutType = toText(s.layout_type) || "title_bullets";
    const slide = pptx.addSlide();
    const bg = asObject(s.background);
    const bgData = await readAssetDataUri(bg?.src ?? bg?.url);
    const imageObj = asObject(s.image);
    const imageData = await readAssetDataUri(imageObj?.src ?? imageObj?.url);

    if (!["cover", "section_divider", "thank_you", "agenda"].includes(layoutType)) addPageBase(slide, pptx, preset);

    if (layoutType === "svg_full") {
      const svgObj = asObject(s.svg);
      const svgData = await readAssetDataUri(svgObj?.src ?? svgObj?.url ?? s.image_path ?? s.image_url);
      const showTitle = toBool(s.show_title, true);
      if (showTitle) addTitle(slide, toText(s.title), preset, pptx);
      const y = showTitle ? 1.12 : 0.58;
      const h = SLIDE_H - y - 0.46;
      if (svgData) {
        slide.addImage({ data: svgData, x: 0.65, y, w: SLIDE_W - 1.3, h });
      } else {
        slide.addText(`SVG 资源不可用：${toText(svgObj?.src ?? s.image_path ?? s.image_url)}`, { x: 0.9, y, w: SLIDE_W - 1.8, h: 0.4, fontFace: "Aptos", fontSize: 14, color: cleanColor(preset.muted, "64748B") });
      }
      continue;
    }

    if (layoutType === "cover") {
      renderCoverSlide(slide, { ...s, style_label: preset.name }, pptx, preset, bgData);
      continue;
    }
    if (layoutType === "section_divider" || layoutType === "thank_you") {
      renderSectionLikeSlide(slide, s, pptx, preset, layoutType);
      continue;
    }
    if (layoutType === "agenda") {
      renderAgendaSlide(slide, s, pptx, preset);
      continue;
    }
    if (layoutType === "title_bullets" || layoutType === "summary") {
      renderTitleBulletsSlide(slide, s, pptx, preset);
      continue;
    }
    if (layoutType === "phases") {
      renderPhasesOrStepsSlide(slide, s, pptx, preset, "phases");
      continue;
    }
    if (layoutType === "steps") {
      renderPhasesOrStepsSlide(slide, s, pptx, preset, "steps");
      continue;
    }
    if (layoutType === "architecture_layered") {
      renderArchitectureLayeredSlide(slide, s, pptx, preset);
      continue;
    }
    if (layoutType === "nine_grid" || layoutType === "four_grid") {
      renderNineGridOrFourGridSlide(slide, s, pptx, preset, layoutType);
      continue;
    }
    if (layoutType === "process_flow") {
      renderProcessFlowSlide(slide, s, pptx, preset);
      continue;
    }
    if (layoutType === "swimlane_process") {
      renderSwimlaneProcessSlide(slide, s, pptx, preset);
      continue;
    }
    if (layoutType === "case_study") {
      renderCaseStudySlide(slide, s, pptx, preset);
      if (imageData) {
        slide.addImage({ data: imageData, x: 1.12, y: 1.74, w: 3.48, h: 3.35 });
      }
      continue;
    }
    if (layoutType === "before_after") {
      renderBeforeAfterSlide(slide, s, pptx, preset);
      continue;
    }
    if (layoutType === "roadmap" || layoutType === "timeline") {
      renderRoadmapSlide(slide, s, pptx, preset);
      continue;
    }
    if (layoutType === "journey_map") {
      renderJourneyMapSlide(slide, s, pptx, preset);
      continue;
    }
    if (layoutType === "bar_chart") {
      renderBarChartSlide(slide, s, pptx, preset);
      continue;
    }
    if (layoutType === "line_chart") {
      renderLineChartSlide(slide, s, pptx, preset, pptx);
      continue;
    }
    if (layoutType === "radar_chart") {
      renderRadarChartSlide(slide, s, pptx, preset);
      continue;
    }
    if (asObject(s.table) || toArray(s.headers).length || toArray(s.rows).length || layoutType.endsWith("_table") || ["comparison_table", "plan_table", "risk_register", "milestones", "cost_benefit", "raci", "org_roles"].includes(layoutType)) {
      renderTableSlide(slide, s, pptx, preset);
      continue;
    }

    // Generic fallback.
    addTitle(slide, toText(s.title), preset, pptx);
    const bullets = toArray(s.bullets).map(toText).filter(Boolean);
    const cards = toArray(s.cards).slice(0, 4);
    addBulletText(slide, bullets, { x: MARGIN_X, y: 1.18, w: cards.length ? 8.2 : 11.7, h: 5.7 }, preset, 14);
    cards.forEach((card, index) => {
      const obj = asObject(card) ?? {};
      const x = 9.25;
      const y = 1.18 + index * 1.34;
      addSoftCard(slide, pptx, { x, y, w: 3.3, h: 1.16 }, preset);
      slide.addText(toText(obj.title ?? obj.label) || `结果 ${index + 1}`, { x: x + 0.16, y: y + 0.16, w: 2.9, h: 0.16, fontFace: "Aptos", fontSize: 11, bold: true, color: cleanColor(preset.primary, "1D6FE8") });
      slide.addText(toText(obj.text ?? obj.value), { x: x + 0.16, y: y + 0.46, w: 2.9, h: 0.48, fontFace: "Aptos", fontSize: 10.5, color: cleanColor(preset.text, "143D7A"), fit: "shrink" });
    });
  }

  return await pptx.write("nodebuffer");
}

export { exportDeckToPptx, loadDeckObject };
