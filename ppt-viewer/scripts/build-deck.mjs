import fs from "node:fs/promises";
import path from "node:path";

const arrayKeys = new Set(["bullets", "blocks", "rows", "items", "quadrants", "cards", "columns", "headers", "meta"]);

function escapeHtml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function splitOnce(input, delimiter) {
  const idx = input.indexOf(delimiter);
  if (idx < 0) return [input];
  return [input.slice(0, idx), input.slice(idx + delimiter.length)];
}

function splitTopLevel(input, delimiterChar) {
  const out = [];
  let buf = "";
  let quote = null;
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      buf += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      buf += ch;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") depth = Math.max(0, depth - 1);
    if (ch === delimiterChar && depth === 0) {
      out.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function parseInlineObject(raw) {
  const inside = raw.trim().slice(1, -1).trim();
  if (!inside) return {};
  const parts = splitTopLevel(inside, ",");
  const out = {};
  for (const part of parts) {
    const [k, v] = splitOnce(part, ":");
    if (!k) continue;
    out[k.trim()] = parseScalar((v ?? "").trim());
  }
  return out;
}

function parseScalar(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return null;
  if (trimmed === "null") return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  const asNumber = Number(trimmed);
  if (!Number.isNaN(asNumber) && String(asNumber) === trimmed) return asNumber;
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return parseInlineObject(trimmed);
  return trimmed;
}

function createChildContainerForKey(key) {
  if (arrayKeys.has(key)) return [];
  return {};
}

function applyBullets(target, bulletLines) {
  const stack = [{ indent: -1, container: target }];

  for (const raw of bulletLines) {
    const match = raw.match(/^(\s*)-\s+(.*)$/);
    if (!match) continue;
    const indent = match[1]?.length ?? 0;
    const content = match[2] ?? "";
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].container;

    const maybeKv = splitOnce(content, ":");
    const hasColon = maybeKv.length === 2;

    if (!hasColon) {
      if (!Array.isArray(parent)) continue;
      parent.push(parseScalar(content));
      continue;
    }

    const key = (maybeKv[0] ?? "").trim();
    const valueRaw = (maybeKv[1] ?? "").trim();

    if (Array.isArray(parent)) {
      const obj = {};
      if (!valueRaw) {
        obj[key] = createChildContainerForKey(key);
        parent.push(obj);
        stack.push({ indent, container: obj[key] });
        continue;
      }
      obj[key] = parseScalar(valueRaw);
      parent.push(obj);
      stack.push({ indent, container: obj });
      continue;
    }

    if (!valueRaw) {
      const child = createChildContainerForKey(key);
      parent[key] = child;
      stack.push({ indent, container: child });
      continue;
    }

    parent[key] = parseScalar(valueRaw);
  }
}

function parseOutlineMarkdown(markdown) {
  const normalized = String(markdown).replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const slides = [];

  let currentSlide = null;
  let cursor = 0;

  const flush = () => {
    if (currentSlide) slides.push(currentSlide);
    currentSlide = null;
  };

  while (cursor < lines.length) {
    const line = lines[cursor] ?? "";
    const trimmed = line.trim();
    const isSlideHeading = /^##\s+Slide\b/i.test(trimmed);
    if (isSlideHeading) {
      flush();
      currentSlide = {};
      cursor++;
      continue;
    }
    if (!currentSlide) {
      cursor++;
      continue;
    }

    const bulletMatch = line.match(/^(\s*)-\s+(.*)$/);
    if (!bulletMatch) {
      cursor++;
      continue;
    }

    const baseIndent = bulletMatch[1]?.length ?? 0;
    const bulletLines = [];
    while (cursor < lines.length) {
      const l = lines[cursor] ?? "";
      if (!l.trim()) {
        cursor++;
        continue;
      }
      const m = l.match(/^(\s*)-\s+(.*)$/);
      if (!m) break;
      const indent = m[1]?.length ?? 0;
      if (indent < baseIndent) break;
      bulletLines.push(l);
      cursor++;
    }

    applyBullets(currentSlide, bulletLines);
  }
  flush();
  return { slides };
}

function asObject(value) {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  return value;
}

function renderBullets(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  const li = items.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  return `<ul class="bullets">${li}</ul>`;
}

function renderBlocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";
  const cards = blocks
    .map((b) => {
      const obj = asObject(b) ?? {};
      const heading = escapeHtml(obj.heading ?? "内容");
      const bullets = renderBullets(obj.bullets);
      return `<div class="card"><div class="cardTitle">${heading}</div>${bullets}</div>`;
    })
    .join("");
  return `<div class="grid2">${cards}</div>`;
}

function renderTable(slide) {
  const tableObj = asObject(slide.table) ?? null;
  const headers = (tableObj?.headers ?? slide.headers) || null;
  const rows = (tableObj?.rows ?? slide.rows) || null;
  if (!Array.isArray(headers) && !Array.isArray(rows)) return "";

  const thead = Array.isArray(headers)
    ? `<thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>`
    : "";
  const tbody = Array.isArray(rows)
    ? `<tbody>${rows
        .map((r) => {
          const cells = Array.isArray(r) ? r : [];
          return `<tr>${cells.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`;
        })
        .join("")}</tbody>`
    : "";
  return `<table class="table">${thead}${tbody}</table>`;
}

function renderSwotOrMatrix(slide) {
  const quadrants = slide.quadrants;
  if (!Array.isArray(quadrants) || quadrants.length === 0) {
    return `<div class="grid2">
      <div class="card"><div class="cardTitle">象限 1</div></div>
      <div class="card"><div class="cardTitle">象限 2</div></div>
      <div class="card"><div class="cardTitle">象限 3</div></div>
      <div class="card"><div class="cardTitle">象限 4</div></div>
    </div>`;
  }
  const cards = quadrants
    .slice(0, 4)
    .map((q, idx) => {
      const obj = asObject(q) ?? {};
      const title = escapeHtml(obj.title ?? obj.name ?? `象限 ${idx + 1}`);
      const bullets = renderBullets(obj.bullets);
      return `<div class="card"><div class="cardTitle">${title}</div>${bullets}</div>`;
    })
    .join("");
  return `<div class="grid2">${cards}</div>`;
}

function renderItemsGrid(items, columns) {
  const arr = Array.isArray(items) ? items : [];
  const cls = columns === 3 ? "grid3" : columns === 9 ? "grid3x3" : "grid2";
  const count = columns === 9 ? 9 : columns === 4 ? 4 : arr.length;
  const safe = arr.length ? arr.slice(0, count) : Array.from({ length: count }).map(() => ({}));
  const cards = safe
    .map((it, idx) => {
      const obj = asObject(it) ?? {};
      const title = escapeHtml(obj.title ?? obj.heading ?? `项 ${idx + 1}`);
      const bullets = renderBullets(obj.bullets);
      const table = obj.table ? renderTable({ table: obj.table }) : "";
      return `<div class="card"><div class="cardTitle">${title}</div>${bullets || table || ""}</div>`;
    })
    .join("");
  return `<div class="${cls}">${cards}</div>`;
}

function renderTopBottom(slide) {
  const top = asObject(slide.top) ?? {};
  const bottom = asObject(slide.bottom) ?? {};
  const topTitle = escapeHtml(top.title ?? "上半部分");
  const bottomTitle = escapeHtml(bottom.title ?? "下半部分");
  const topBody = renderBullets(top.bullets) || (top.table ? renderTable({ table: top.table }) : "");
  const bottomBody = renderBullets(bottom.bullets) || (bottom.table ? renderTable({ table: bottom.table }) : "");
  return `<div style="display:grid;grid-template-rows:1fr 1fr;gap:14px;height:100%">
    <div class="card"><div class="cardTitle">${topTitle}</div>${topBody || ""}</div>
    <div class="card"><div class="cardTitle">${bottomTitle}</div>${bottomBody || ""}</div>
  </div>`;
}

function renderChartPlaceholder(slide) {
  const type = escapeHtml(slide.layout_type ?? "chart");
  const json = escapeHtml(JSON.stringify(slide, null, 2));
  return `<div class="card"><div class="cardTitle">${type}</div><pre style="margin:0;white-space:pre-wrap;font-size:12px;line-height:1.45">${json}</pre></div>`;
}

function renderPyramid(slide) {
  const levels = Array.isArray(slide.levels) ? slide.levels : [];
  if (!levels.length) return renderBullets(slide.bullets) || renderBlocks(slide.blocks) || "";
  const cards = levels
    .map((lv, idx) => {
      const obj = asObject(lv) ?? {};
      const title = escapeHtml(obj.title ?? `层级 ${idx + 1}`);
      const body = renderBullets(obj.bullets) || "";
      return `<div class="card"><div class="cardTitle">${title}</div>${body}</div>`;
    })
    .join("");
  return `<div style="display:grid;gap:12px">${cards}</div>`;
}

function renderBeforeAfter(slide) {
  const before = asObject(slide.before) ?? {};
  const after = asObject(slide.after) ?? {};
  const beforeTitle = escapeHtml(before.title ?? "Before");
  const afterTitle = escapeHtml(after.title ?? "After");
  const beforeBody = renderBullets(before.bullets) || (before.table ? renderTable({ table: before.table }) : "") || "";
  const afterBody = renderBullets(after.bullets) || (after.table ? renderTable({ table: after.table }) : "") || "";
  return `<div class="grid2">
    <div class="card"><div class="cardTitle">${beforeTitle}</div>${beforeBody}</div>
    <div class="card"><div class="cardTitle">${afterTitle}</div>${afterBody}</div>
  </div>`;
}

function renderSlideBody(slide) {
  const layout = String(slide.layout_type ?? "title_bullets");
  if (layout === "cover") {
    const subtitle = slide.subtitle ? `<div class="slideSubtitle">${escapeHtml(slide.subtitle)}</div>` : "";
    const metaObj = asObject(slide.meta);
    const meta =
      metaObj && Object.keys(metaObj).length
        ? `<div style="display:grid;gap:4px;color:rgba(15,23,42,.65);font-size:13px">
            ${Object.entries(metaObj)
              .map(([k, v]) => `<div><strong>${escapeHtml(k)}</strong> ${escapeHtml(v)}</div>`)
              .join("")}
          </div>`
        : "";
    return `<div style="display:grid;gap:10px">
      <div>
        <h2 class="slideTitle">${escapeHtml(slide.title ?? "")}</h2>
        ${subtitle}
      </div>
      <div style="align-self:end">${meta}</div>
    </div>`;
  }
  if (layout === "problem_statement") {
    return renderBlocks(slide.blocks) || renderBullets(slide.bullets) || "";
  }
  if (layout === "matrix_2x2" || layout === "swot") {
    return renderSwotOrMatrix(slide);
  }
  if (layout === "pyramid") {
    return renderPyramid(slide);
  }
  if (layout === "before_after") {
    return renderBeforeAfter(slide);
  }
  if (
    layout === "pie_chart" ||
    layout === "donut_chart" ||
    layout === "bar_chart" ||
    layout === "line_chart" ||
    layout === "radar_chart" ||
    layout === "gantt_chart" ||
    layout === "mind_map"
  ) {
    return renderChartPlaceholder(slide);
  }
  if (
    layout === "logic_tree" ||
    layout === "icicle_tree" ||
    layout === "architecture_layered" ||
    layout === "dependency_graph" ||
    layout === "journey_map" ||
    layout === "swimlane_process" ||
    layout === "impact_effort"
  ) {
    return renderChartPlaceholder(slide);
  }
  if (layout === "top_bottom") {
    return renderTopBottom(slide);
  }
  if (layout === "steps") {
    return renderItemsGrid(slide.steps, 3);
  }
  if (layout === "phases") {
    return renderItemsGrid(slide.phases, 3);
  }
  if (layout === "four_grid") {
    return renderItemsGrid(slide.items, 4);
  }
  if (layout === "nine_grid") {
    return renderItemsGrid(slide.items, 9);
  }
  if (layout === "two_column") {
    const left = slide.left ?? (Array.isArray(slide.columns) ? slide.columns[0] : null);
    const right = slide.right ?? (Array.isArray(slide.columns) ? slide.columns[1] : null);
    return `<div class="grid2">${renderItemsGrid([left], 0).replace('<div class=\"grid2\">', '').replace('</div>', '')}${renderItemsGrid([right], 0).replace('<div class=\"grid2\">', '').replace('</div>', '')}</div>`;
  }
  if (layout === "three_column") {
    const cols = Array.isArray(slide.columns) ? slide.columns.slice(0, 3) : [{}, {}, {}];
    return `<div class="grid3">${cols.map((c, i) => `<div class="card"><div class="cardTitle">${escapeHtml(c?.title ?? `栏 ${i + 1}`)}</div>${renderBullets(c?.bullets) || (c?.table ? renderTable({ table: c.table }) : "")}</div>`).join("")}</div>`;
  }
  if (layout.endsWith("_table") || layout === "comparison_table" || layout === "plan_table") {
    return renderTable(slide);
  }
  if (layout === "raci") {
    return renderTable(slide);
  }
  return renderBullets(slide.bullets) || renderTable(slide) || renderBlocks(slide.blocks) || "";
}

function inlineCss() {
  return `
    html, body { height: 100%; margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif; background: #0b1020; }
    .deckViewport { height: 100%; overflow: auto; scroll-snap-type: y mandatory; }
    .deck { padding: 24px 24px 48px 24px; display: grid; gap: 18px; justify-items: center; }
    .slide { width: min(1200px, calc(100vw - 48px)); aspect-ratio: 16 / 9; background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 80px rgba(0,0,0,.55); scroll-snap-align: start; position: relative; }
    .slideInner { height: 100%; padding: 42px 52px; display: grid; grid-template-rows: auto 1fr; gap: 18px; }
    .slideTitle { font-size: 28px; font-weight: 800; margin: 0; color: #0f172a; }
    .slideSubtitle { font-size: 16px; font-weight: 600; margin: 8px 0 0 0; color: rgba(15,23,42,.75); }
    .bullets { margin: 0; padding-left: 18px; display: grid; gap: 8px; font-size: 16px; line-height: 1.45; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
    .grid3x3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .card { border: 1px solid rgba(15,23,42,.1); border-radius: 14px; padding: 14px 14px; background: rgba(248,250,252,.9); }
    .cardTitle { font-size: 13px; font-weight: 800; margin: 0 0 8px 0; color: rgba(15,23,42,.8); letter-spacing: .2px; }
    .table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .table th, .table td { border: 1px solid rgba(15,23,42,.12); padding: 8px 10px; vertical-align: top; }
    .table th { background: rgba(15,23,42,.06); text-align: left; font-weight: 800; }
    .layout-cover .slideInner { grid-template-rows: 1fr auto; }
    .layout-cover .slideTitle { font-size: 46px; line-height: 1.1; }
    .footerMark { position: absolute; right: 18px; bottom: 14px; font-size: 11px; color: rgba(15,23,42,.45); }
  `.trim();
}

function renderDeckHtmlDocument(deck) {
  const slides = deck.slides
    .map((slide, idx) => {
      const layout = String(slide.layout_type ?? "title_bullets");
      const title = escapeHtml(slide.title ?? "");
      const body = renderSlideBody(slide);
      const titleEl = layout === "cover" ? "" : `<h2 class="slideTitle">${title}</h2>`;
      return `<section class="slide layout-${escapeHtml(layout)}">
        <div class="slideInner">
          <div>${titleEl}</div>
          <div>${body}</div>
        </div>
        <div class="footerMark">${idx + 1}/${deck.slides.length}</div>
      </section>`;
    })
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Deck</title>
    <style>${inlineCss()}</style>
  </head>
  <body>
    <div class="deckViewport">
      <div class="deck">${slides}</div>
    </div>
  </body>
</html>`;
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function safeJoin(baseDir, requestPath) {
  const resolved = path.resolve(baseDir, requestPath);
  const relative = path.relative(baseDir, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Invalid slide path: ${requestPath}`);
  }
  return resolved;
}

async function resolveProjectDir(repoRoot) {
  const workDir = path.resolve(repoRoot, "work");
  const workPptDir = path.resolve(workDir, "ppt");
  const deckPathEnv = process.env.DECK_PATH ?? process.env.OUTLINE_PATH;
  if (deckPathEnv) return path.dirname(path.resolve(repoRoot, deckPathEnv));

  const deckProjectEnv = process.env.DECK_PROJECT ?? process.env.OUTLINE_PROJECT;
  if (deckProjectEnv) return path.resolve(workPptDir, deckProjectEnv);

  try {
    const entries = await fs.readdir(workPptDir, { withFileTypes: true });
    const candidates = entries
      .filter((entry) => entry.isDirectory() && /^\d{3}_.+/.test(entry.name))
      .map((entry) => entry.name);

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
  return workPptDir;
}

async function loadDeckData(repoRoot, projectDir) {
  const explicitInput = process.env.INPUT;
  if (explicitInput) {
    const inputPath = path.resolve(repoRoot, explicitInput);
    const raw = await fs.readFile(inputPath, "utf8");
    if (inputPath.toLowerCase().endsWith(".md")) return parseOutlineMarkdown(raw);
    return JSON.parse(raw);
  }

  const deckPath = path.join(projectDir, "deck.json");
  if (await fileExists(deckPath)) {
    const manifest = JSON.parse(await fs.readFile(deckPath, "utf8"));
    const deckMeta = manifest && typeof manifest === "object" ? manifest.deck ?? {} : {};
    const slideFiles = Array.isArray(manifest?.slide_files) ? manifest.slide_files : [];
    const slides = [];
    for (const rel of slideFiles) {
      const slidePath = safeJoin(projectDir, rel);
      slides.push(JSON.parse(await fs.readFile(slidePath, "utf8")));
    }
    return { deck: deckMeta, slides };
  }

  const outlinePath = path.join(projectDir, "outline.json");
  if (await fileExists(outlinePath)) {
    return JSON.parse(await fs.readFile(outlinePath, "utf8"));
  }

  throw new Error(`No deck.json or outline.json found in ${projectDir}`);
}

async function main() {
  const repoRoot = path.resolve(import.meta.dirname, "..", "..");
  const projectDir = await resolveProjectDir(repoRoot);
  const outputPath = process.env.OUTPUT ? path.resolve(repoRoot, process.env.OUTPUT) : path.join(projectDir, "preview.html");
  const deck = await loadDeckData(repoRoot, projectDir);
  const html = renderDeckHtmlDocument(deck);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, "utf8");
  process.stdout.write(`Wrote ${path.relative(repoRoot, outputPath)}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err?.stack ?? err}\n`);
  process.exit(1);
});
