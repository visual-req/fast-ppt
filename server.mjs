import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = Number(process.env.PORT ?? "9030");
const distDir = path.resolve(__dirname, "ppt-viewer", "dist");
const workDir = path.resolve(__dirname, "work");
const workPptDir = path.resolve(workDir, "ppt");

const mimeByExt = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".json", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".map", "application/json; charset=utf-8"]
]);

function send(res, statusCode, contentType, body) {
  res.statusCode = statusCode;
  res.setHeader("content-type", contentType);
  res.setHeader("cache-control", "no-store");
  res.end(body);
}

function safeJoin(baseDir, requestPath) {
  const normalized = path.posix.normalize(requestPath).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(baseDir, normalized);
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function resolveProjectDir() {
  const deckPathEnv = process.env.DECK_PATH ?? process.env.OUTLINE_PATH;
  if (deckPathEnv) return path.dirname(path.resolve(deckPathEnv));

  const deckProjectEnv = process.env.DECK_PROJECT ?? process.env.OUTLINE_PROJECT;
  if (deckProjectEnv) {
    return path.resolve(workPptDir, deckProjectEnv);
  }

  try {
    const entries = await fs.readdir(workPptDir, { withFileTypes: true });
    const candidates = entries
      .filter((e) => e.isDirectory() && /^\d{3}_.+/.test(e.name))
      .map((e) => e.name);

    const available = [];
    for (const dirName of candidates) {
      const deckPath = path.join(workPptDir, dirName, "deck.json");
      const outlinePath = path.join(workPptDir, dirName, "outline.json");
      if ((await fileExists(deckPath)) || (await fileExists(outlinePath))) available.push(dirName);
    }

    available.sort((a, b) => {
      const an = Number(a.slice(0, 3));
      const bn = Number(b.slice(0, 3));
      if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return bn - an;
      return b.localeCompare(a);
    });

    if (available.length) return path.join(workPptDir, available[0]);
  } catch {}

  const legacyDir = path.resolve(workDir, "05.交付物", "ppt");
  if (await fileExists(path.join(legacyDir, "outline.json"))) return legacyDir;
  return path.resolve(workPptDir);
}

async function loadDeck(projectDir) {
  const deckPath = path.join(projectDir, "deck.json");
  if (await fileExists(deckPath)) {
    const manifest = JSON.parse(await fs.readFile(deckPath, "utf8"));
    const deck = manifest && typeof manifest === "object" ? manifest.deck ?? {} : {};
    const slideFiles = Array.isArray(manifest?.slide_files) ? manifest.slide_files : [];
    const slides = [];
    for (const rel of slideFiles) {
      const full = safeJoin(projectDir, rel);
      const parsed = JSON.parse(await fs.readFile(full, "utf8"));
      slides.push(parsed);
    }
    return JSON.stringify({ deck, slides });
  }

  const outlinePath = path.join(projectDir, "outline.json");
  return await fs.readFile(outlinePath, "utf8");
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
    const parsed = JSON.parse(await fs.readFile(full, "utf8"));
    slides.push(parsed);
  }
  return { deck, slides };
}

function toText(value) {
  return typeof value === "string" ? value : "";
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

async function readAssetDataUri(src) {
  const raw = toText(src);
  if (!raw) return null;
  if (/^https?:\/\//.test(raw)) return null;
  const normalized = raw.startsWith("/") ? raw.slice(1) : raw;
  const fullPath = path.resolve(__dirname, normalized);
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
  const b64 = buf.toString("base64");
  return `data:${mime};base64,${b64}`;
}

async function exportDeckToPptx(projectDir) {
  const { deck, slides } = await loadDeckObject(projectDir);
  const mod = await import("pptxgenjs");
  const PptxGenJS = mod?.default ?? mod;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "fast_ppt";
  pptx.company = "visual-req";
  pptx.subject = toText(deck?.title ?? "Deck");
  pptx.title = toText(deck?.title ?? "Deck");

  const SLIDE_W = 13.333;
  const SLIDE_H = 7.5;
  const MARGIN_X = 0.7;
  const TITLE_H = 0.6;

  for (let i = 0; i < slides.length; i += 1) {
    const s = slides[i] ?? {};
    const layoutType = toText(s.layout_type) || "title_bullets";
    const slide = pptx.addSlide();

    const bg = asObject(s.background);
    const bgSrc = bg?.src ?? bg?.url;
    const bgData = await readAssetDataUri(bgSrc);
    if (bgData) {
      slide.addImage({ data: bgData, x: 0, y: 0, w: SLIDE_W, h: SLIDE_H });
    }

    const showTitle = layoutType === "svg_full" ? toBool(s.show_title, true) : layoutType !== "cover" && layoutType !== "section_divider" && layoutType !== "thank_you";
    const title = toText(s.title);
    if (showTitle && title) {
      slide.addText(title, {
        x: MARGIN_X,
        y: 0.35,
        w: SLIDE_W - MARGIN_X * 2,
        h: TITLE_H,
        fontFace: "Aptos Display",
        fontSize: 24,
        bold: true,
        color: "0F172A"
      });
    }

    if (layoutType === "svg_full") {
      const svgObj = asObject(s.svg);
      const svgSrc = svgObj?.src ?? svgObj?.url ?? s.image_path ?? s.image_url;
      const svgData = await readAssetDataUri(svgSrc);
      const y = showTitle && title ? 1.1 : 0.55;
      const h = SLIDE_H - y - 0.5;
      if (svgData) {
        slide.addImage({ data: svgData, x: 0.65, y, w: SLIDE_W - 1.3, h });
      } else {
        slide.addText(`SVG 资源不可用：${toText(svgSrc)}`, {
          x: 0.9,
          y,
          w: SLIDE_W - 1.8,
          h: 1.0,
          fontFace: "Aptos",
          fontSize: 14,
          color: "475569"
        });
      }
      continue;
    }

    if (layoutType === "cover" || layoutType === "section_divider" || layoutType === "thank_you") {
      const subtitle = toText(s.subtitle);
      const y = layoutType === "cover" ? 2.2 : 2.4;
      if (title) {
        slide.addText(title, {
          x: 1.0,
          y,
          w: SLIDE_W - 2.0,
          h: 1.1,
          fontFace: "Aptos Display",
          fontSize: layoutType === "cover" ? 42 : 36,
          bold: true,
          color: bgData ? "FFFFFF" : "0F172A"
        });
      }
      if (subtitle) {
        slide.addText(subtitle, {
          x: 1.0,
          y: y + 1.0,
          w: SLIDE_W - 2.0,
          h: 0.8,
          fontFace: "Aptos",
          fontSize: 18,
          color: bgData ? "E2E8F0" : "475569"
        });
      }
      continue;
    }

    const bullets = toArray(s.bullets).map((x) => toText(x)).filter(Boolean);
    const cards = toArray(s.cards);
    const contentY = showTitle && title ? 1.1 : 0.6;

    if (layoutType === "two_column" || layoutType === "three_column") {
      const columns = toArray(s.columns);
      const left = asObject(s.left);
      const right = asObject(s.right);
      const cols = [];
      if (left || right) {
        cols.push(left ?? {});
        cols.push(right ?? {});
      } else if (columns.length) {
        cols.push(...columns.slice(0, layoutType === "two_column" ? 2 : 3));
      }
      const n = Math.max(2, Math.min(layoutType === "two_column" ? 2 : 3, cols.length || (layoutType === "two_column" ? 2 : 3)));
      const gap = 0.35;
      const colW = (SLIDE_W - MARGIN_X * 2 - gap * (n - 1)) / n;
      for (let c = 0; c < n; c += 1) {
        const obj = asObject(cols[c]) ?? {};
        const ct = toText(obj.title ?? obj.heading ?? `栏 ${c + 1}`);
        const cb = toArray(obj.bullets).map((x) => toText(x)).filter(Boolean);
        const cx = MARGIN_X + c * (colW + gap);
        slide.addText(ct || `栏 ${c + 1}`, { x: cx, y: contentY, w: colW, h: 0.35, fontFace: "Aptos Display", fontSize: 16, bold: true, color: "0F172A" });
        slide.addText(cb.length ? `• ${cb.join("\n• ")}` : "", { x: cx, y: contentY + 0.45, w: colW, h: SLIDE_H - contentY - 0.8, fontFace: "Aptos", fontSize: 14, color: "334155" });
      }
      continue;
    }

    if (layoutType.endsWith("_table") || layoutType === "comparison_table" || layoutType === "plan_table" || layoutType === "risk_register" || layoutType === "milestones" || layoutType === "cost_benefit" || layoutType === "raci") {
      const tableObj = asObject(s.table) ?? {};
      const headers = toArray(tableObj.headers ?? s.headers).map((x) => toText(x)).filter(Boolean);
      const rows = toArray(tableObj.rows ?? s.rows).map((r) => (Array.isArray(r) ? r.map((c) => toText(c)) : []));
      const tableRows = [];
      if (headers.length) tableRows.push(headers);
      tableRows.push(...rows);
      if (tableRows.length) {
        const cols = Math.max(1, tableRows[0]?.length ?? 1);
        const colW = Array.from({ length: cols }, () => (SLIDE_W - MARGIN_X * 2) / cols);
        slide.addTable(tableRows, {
          x: MARGIN_X,
          y: contentY,
          w: SLIDE_W - MARGIN_X * 2,
          colW,
          fontFace: "Aptos",
          fontSize: 12,
          border: { type: "solid", color: "CBD5E1", pt: 1 }
        });
      }
      continue;
    }

    if (layoutType === "kpi_cards" && cards.length) {
      const n = Math.min(6, cards.length);
      const cols = n <= 3 ? n : 3;
      const rows = Math.ceil(n / cols);
      const gap = 0.25;
      const cardW = (SLIDE_W - MARGIN_X * 2 - gap * (cols - 1)) / cols;
      const cardH = (SLIDE_H - contentY - 0.7 - gap * (rows - 1)) / rows;
      for (let idx = 0; idx < n; idx += 1) {
        const obj = asObject(cards[idx]) ?? {};
        const label = toText(obj.label ?? obj.name ?? obj.title) || `指标 ${idx + 1}`;
        const value = toText(obj.value ?? obj.number ?? "");
        const note = toText(obj.note ?? obj.unit ?? obj.desc ?? "");
        const cx = MARGIN_X + (idx % cols) * (cardW + gap);
        const cy = contentY + Math.floor(idx / cols) * (cardH + gap);
        slide.addShape(pptx.ShapeType.roundRect, { x: cx, y: cy, w: cardW, h: cardH, fill: { color: "F8FAFC" }, line: { color: "DBEAFE", width: 1 } });
        slide.addText(label, { x: cx + 0.2, y: cy + 0.15, w: cardW - 0.4, h: 0.25, fontFace: "Aptos", fontSize: 12, bold: true, color: "2563EB" });
        slide.addText(value, { x: cx + 0.2, y: cy + 0.45, w: cardW - 0.4, h: 0.5, fontFace: "Aptos Display", fontSize: 28, bold: true, color: "0F172A" });
        slide.addText(note, { x: cx + 0.2, y: cy + 1.0, w: cardW - 0.4, h: 0.35, fontFace: "Aptos", fontSize: 12, color: "475569" });
      }
      continue;
    }

    const rightTitle = cards.length ? toText(asObject(cards[0])?.title ?? "") : "";
    const mainW = cards.length ? SLIDE_W - MARGIN_X * 2 - 3.2 : SLIDE_W - MARGIN_X * 2;
    slide.addText(bullets.length ? `• ${bullets.join("\n• ")}` : "", {
      x: MARGIN_X,
      y: contentY,
      w: mainW,
      h: SLIDE_H - contentY - 0.7,
      fontFace: "Aptos",
      fontSize: 16,
      color: "0F172A"
    });

    if (cards.length) {
      const cx = MARGIN_X + mainW + 0.35;
      const cw = 2.85;
      const cn = Math.min(4, cards.length);
      const cardH = (SLIDE_H - contentY - 0.7 - 0.2 * (cn - 1)) / cn;
      for (let idx = 0; idx < cn; idx += 1) {
        const obj = asObject(cards[idx]) ?? {};
        const t = toText(obj.title ?? obj.label) || (idx === 0 && rightTitle ? rightTitle : `结果 ${idx + 1}`);
        const v = toText(obj.text ?? obj.value ?? "");
        const cy = contentY + idx * (cardH + 0.2);
        slide.addShape(pptx.ShapeType.roundRect, { x: cx, y: cy, w: cw, h: cardH, fill: { color: "EFF6FF" }, line: { color: "BFDBFE", width: 1 } });
        slide.addText(t, { x: cx + 0.18, y: cy + 0.15, w: cw - 0.36, h: 0.25, fontFace: "Aptos", fontSize: 12, bold: true, color: "1D4ED8" });
        slide.addText(v, { x: cx + 0.18, y: cy + 0.45, w: cw - 0.36, h: cardH - 0.6, fontFace: "Aptos", fontSize: 12, color: "0F172A" });
      }
    }
  }

  return await pptx.write("nodebuffer");
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    if (url.pathname === "/health") {
      send(res, 200, "application/json; charset=utf-8", JSON.stringify({ ok: true }));
      return;
    }

    if (url.pathname === "/api/deck" || url.pathname === "/api/outline") {
      try {
        const projectDir = await resolveProjectDir();
        const content = await loadDeck(projectDir);
        send(res, 200, "application/json; charset=utf-8", content);
      } catch (e) {
        send(res, 404, "text/plain; charset=utf-8", `PPT JSON 产物不存在\n${String(e?.stack ?? e)}`);
      }
      return;
    }

    if (url.pathname === "/api/export/pptx") {
      try {
        const projectDir = await resolveProjectDir();
        const buf = await exportDeckToPptx(projectDir);
        res.statusCode = 200;
        res.setHeader("content-type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
        res.setHeader("content-disposition", `attachment; filename="deck.pptx"`);
        res.setHeader("cache-control", "no-store");
        res.end(buf);
      } catch (e) {
        send(res, 500, "text/plain; charset=utf-8", `导出失败\n${String(e?.stack ?? e)}`);
      }
      return;
    }

    if (url.pathname.startsWith("/work/")) {
      const workPath = safeJoin(__dirname, url.pathname);
      const ext = path.extname(workPath).toLowerCase();
      const mime = mimeByExt.get(ext) ?? "application/octet-stream";
      try {
        const buf = await fs.readFile(workPath);
        res.statusCode = 200;
        res.setHeader("content-type", mime);
        res.setHeader("cache-control", "no-store");
        res.end(buf);
      } catch (e) {
        send(res, 404, "text/plain; charset=utf-8", `资源不存在：${workPath}\n${String(e?.stack ?? e)}`);
      }
      return;
    }

    const reqPath = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = safeJoin(distDir, reqPath);
    const ext = path.extname(filePath).toLowerCase();
    const mime = mimeByExt.get(ext) ?? "application/octet-stream";

    try {
      const buf = await fs.readFile(filePath);
      res.statusCode = 200;
      res.setHeader("content-type", mime);
      res.setHeader("cache-control", "no-store");
      res.end(buf);
      return;
    } catch {
      const indexHtml = await fs.readFile(path.join(distDir, "index.html"), "utf8");
      send(res, 200, "text/html; charset=utf-8", indexHtml);
      return;
    }
  } catch (e) {
    send(res, 500, "text/plain; charset=utf-8", String(e?.stack ?? e));
  }
});

server.listen(port, "0.0.0.0", () => {
  process.stdout.write(`PPT Viewer running at http://0.0.0.0:${port}\n`);
});
