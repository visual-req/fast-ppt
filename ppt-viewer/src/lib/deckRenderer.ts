import type { Deck, JsonObject, JsonValue, Slide } from "./types";
import { escapeHtml, toText } from "./text";

function asArray(value: JsonValue | undefined): JsonValue[] | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value : undefined;
}

function asObject(value: JsonValue | undefined): JsonObject | undefined {
  if (!value || Array.isArray(value) || typeof value !== "object") return undefined;
  return value as JsonObject;
}

function renderBullets(items: JsonValue[] | undefined): string {
  if (!items || items.length === 0) return "";
  const li = items
    .map((x) => {
      const s = escapeHtml(toText(x));
      return `<li>${s}</li>`;
    })
    .join("");
  return `<ul class="bullets">${li}</ul>`;
}

function renderBlocks(blocks: JsonValue[] | undefined): string {
  if (!blocks || blocks.length === 0) return "";
  const cards = blocks
    .map((b) => {
      const obj = asObject(b);
      const heading = escapeHtml(toText(obj?.heading));
      const bullets = renderBullets(asArray(obj?.bullets));
      return `<div class="card"><div class="cardTitle">${heading || "内容"}</div>${bullets}</div>`;
    })
    .join("");
  return `<div class="grid2">${cards}</div>`;
}

function renderTable(slide: Slide): string {
  const tableObj = asObject(slide.table as JsonValue | undefined);
  const headers = asArray((tableObj?.headers ?? slide.headers) as JsonValue | undefined)?.map((h) => escapeHtml(toText(h)));
  const rows = asArray((tableObj?.rows ?? slide.rows) as JsonValue | undefined);
  if (!headers && !rows) return "";

  const thead = headers
    ? `<thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>`
    : "";
  const tbody =
    rows && rows.length
      ? `<tbody>${rows
          .map((r) => {
            const cells = Array.isArray(r) ? r : [];
            const tds = cells.map((c) => `<td>${escapeHtml(toText(c))}</td>`).join("");
            return `<tr>${tds}</tr>`;
          })
          .join("")}</tbody>`
      : "";

  return `<table class="table">${thead}${tbody}</table>`;
}

function renderKpiCards(cards: JsonValue[] | undefined): string {
  if (!cards || cards.length === 0) return "";
  const content = cards
    .map((c) => {
      const obj = asObject(c);
      const label = escapeHtml(toText(obj?.label ?? obj?.name ?? obj?.title));
      const value = escapeHtml(toText(obj?.value ?? obj?.number));
      const note = escapeHtml(toText(obj?.note ?? obj?.unit ?? obj?.desc));
      return `<div class="card"><div class="cardTitle">${label || "指标"}</div><div style="font-size:32px;font-weight:900">${value}</div><div style="color:rgba(15,23,42,.7);font-size:12px;margin-top:6px">${note}</div></div>`;
    })
    .join("");
  return `<div class="grid2">${content}</div>`;
}

function renderSwotOrMatrix(slide: Slide): string {
  const quadrants = asArray(slide.quadrants as JsonValue | undefined);
  if (!quadrants || quadrants.length === 0) {
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
      const obj = asObject(q);
      const title = escapeHtml(toText(obj?.title ?? obj?.name ?? `象限 ${idx + 1}`));
      const bullets = renderBullets(asArray(obj?.bullets));
      return `<div class="card"><div class="cardTitle">${title}</div>${bullets}</div>`;
    })
    .join("");
  return `<div class="grid2">${cards}</div>`;
}

function renderColumns(slide: Slide): string {
  const left = asObject(slide.left as JsonValue | undefined);
  const right = asObject(slide.right as JsonValue | undefined);
  if (left || right) {
    const leftHtml = renderContentBlock(left, "左栏");
    const rightHtml = renderContentBlock(right, "右栏");
    return `<div style="display:grid;gap:14px;grid-template-columns:1fr 1fr">${leftHtml}${rightHtml}</div>`;
  }

  const columns = asArray(slide.columns as JsonValue | undefined);
  if (!columns || columns.length === 0) return "";
  const colHtml = columns
    .slice(0, 3)
    .map((c, idx) => renderContentBlock(asObject(c), `栏 ${idx + 1}`))
    .join("");
  const cols = Math.min(columns.length, 3);
  const gridStyle = cols === 2 ? "grid-template-columns:1fr 1fr" : "grid-template-columns:1fr 1fr 1fr";
  return `<div style="display:grid;gap:14px;${gridStyle}">${colHtml}</div>`;
}

function renderImageBlock(obj: JsonObject | undefined): string {
  const imageObj = asObject(obj?.image as JsonValue | undefined);
  const src = toText(imageObj?.src ?? imageObj?.url ?? obj?.image_path ?? obj?.image_url);
  if (!src) return "";
  const alt = escapeHtml(toText(imageObj?.alt ?? obj?.title ?? "image"));
  const caption = escapeHtml(toText(imageObj?.caption ?? obj?.caption));
  const title = escapeHtml(toText(obj?.title ?? ""));
  const titleHtml = title ? `<div class="cardTitle">${title}</div>` : "";
  const captionHtml = caption ? `<div style="font-size:13px;color:#475569;white-space:pre-wrap;margin-top:10px">${caption}</div>` : "";
  return `<div class="card">${titleHtml}<img src="${escapeHtml(src)}" alt="${alt}" style="width:100%;max-height:360px;object-fit:contain;border-radius:16px;background:#f8fafc" />${captionHtml}</div>`;
}

function renderContentBlock(obj: JsonObject | undefined, fallbackTitle: string): string {
  if (!obj) return `<div class="card"><div class="cardTitle">${escapeHtml(fallbackTitle)}</div></div>`;
  const image = renderImageBlock(obj);
  if (image) return image;
  const title = escapeHtml(toText(obj.title ?? obj.heading ?? fallbackTitle));
  const bullets = renderBullets(asArray(obj.bullets));
  const blocks = renderBlocks(asArray(obj.blocks));
  const tableObj = asObject(obj.table as JsonValue | undefined);
  const table = tableObj ? renderTable({ layout_type: "plan_table", table: tableObj } as Slide) : "";
  const text = obj.text ? `<div class="card"><div class="cardTitle">${title}</div><div style="white-space:pre-wrap">${escapeHtml(toText(obj.text))}</div></div>` : "";
  const content = bullets || blocks || table || text;
  if (content) {
    if (text) return text;
    return `<div class="card"><div class="cardTitle">${title}</div>${[bullets, blocks, table].filter(Boolean).join("")}</div>`;
  }
  return `<div class="card"><div class="cardTitle">${title}</div></div>`;
}

function renderSvgFull(slide: Slide): string {
  const svgObj = asObject(slide.svg as JsonValue | undefined);
  const src = toText(svgObj?.src ?? svgObj?.url ?? svgObj?.path ?? slide.image_path ?? slide.image_url);
  if (!src) return renderGeneric(slide);
  const alt = escapeHtml(toText(svgObj?.alt ?? slide.title ?? "svg"));
  const caption = escapeHtml(toText(svgObj?.caption ?? slide.caption));
  const captionHtml = caption ? `<div style="font-size:13px;color:#475569;white-space:pre-wrap;margin-top:10px">${caption}</div>` : "";
  return `<div style="display:grid;gap:12px;height:100%">
    <div style="display:flex;align-items:flex-start;justify-content:center;height:100%;min-height:420px;border-radius:20px;background:#f8fafc;padding:12px 16px 16px 16px">
      <img src="${escapeHtml(src)}" alt="${alt}" style="max-width:100%;max-height:100%;object-fit:contain" />
    </div>
    ${captionHtml}
  </div>`;
}

function renderSwimlaneProcess(slide: Slide): string {
  const lanes = asArray(slide.lanes as JsonValue | undefined);
  if (!lanes || lanes.length === 0) return renderGeneric(slide);
  const maxSteps = Math.max(
    0,
    ...lanes.map((lane) => {
      const obj = asObject(lane);
      const steps = asArray(obj?.steps as JsonValue | undefined);
      return steps?.length ?? 0;
    })
  );
  const header = `<div class="swimlaneHeader">
    <div class="swimlaneCorner">泳道</div>
    <div class="swimlaneHeaderSteps" style="grid-template-columns:repeat(${maxSteps}, minmax(0, 1fr))">
      ${Array.from({ length: maxSteps }, (_, i) => `<div class="swimlaneHeaderCell">步骤 ${i + 1}</div>`).join("")}
    </div>
  </div>`;
  const rows = lanes
    .map((lane, laneIndex) => {
      const obj = asObject(lane);
      const laneName = escapeHtml(toText(obj?.name ?? `泳道 ${laneIndex + 1}`));
      const steps = asArray(obj?.steps as JsonValue | undefined) ?? [];
      const cells = Array.from({ length: maxSteps }, (_, i) => {
        const step = steps[i];
        const text = escapeHtml(toText(asObject(step)?.text ?? step));
        return `<div class="swimlaneCell">${text || "&nbsp;"}</div>`;
      }).join("");
      return `<div class="swimlaneRow">
        <div class="swimlaneLaneName">${laneName}</div>
        <div class="swimlaneCells" style="grid-template-columns:repeat(${maxSteps}, minmax(0, 1fr))">${cells}</div>
      </div>`;
    })
    .join("");
  return `<div class="swimlaneBoard">${header}${rows}</div>`;
}

function renderPhases(slide: Slide): string {
  const phases = asArray(slide.phases as JsonValue | undefined);
  if (!phases || phases.length === 0) return renderGeneric(slide);
  const cards = phases
    .map((phase, index) => {
      const obj = asObject(phase);
      const title = escapeHtml(toText(obj?.title));
      const text = escapeHtml(toText(obj?.text));
      const bullets = renderBullets(asArray(obj?.bullets));
      const gate = escapeHtml(toText(obj?.gate));
      const gateHtml = gate ? `<div class="phaseGate">${gate}</div>` : "";
      return `<div class="phaseCardWrap">
        <div class="phaseCard">
          <div class="phaseBadge">阶段 ${index + 1}</div>
          ${title ? `<div class="phaseTitle">${title}</div>` : ""}
          ${text ? `<div class="phaseText">${text}</div>` : ""}
          ${bullets}
          ${gateHtml}
        </div>
        ${index < phases.length - 1 ? `<div class="phaseArrow"></div>` : ""}
      </div>`;
    })
    .join("");
  return `<div class="phasesFlow">${cards}</div>`;
}

function renderGeneric(slide: Slide): string {
  const bullets = renderBullets(asArray(slide.bullets as JsonValue | undefined));
  const blocks = renderBlocks(asArray(slide.blocks as JsonValue | undefined));
  const columns = renderColumns(slide);
  const table = renderTable(slide);
  const json = escapeHtml(JSON.stringify(slide, null, 2));

  const parts = [bullets, blocks, columns, table].filter(Boolean).join("");
  if (parts) return parts;
  return `<div class="card"><div class="cardTitle">原始结构</div><pre style="margin:0;white-space:pre-wrap;font-size:12px;line-height:1.45">${json}</pre></div>`;
}

function renderSlideBody(slide: Slide): string {
  const layout = String(slide.layout_type ?? "title_bullets");
  if (layout === "cover") {
    const subtitle = slide.subtitle ? `<div class="slideSubtitle">${escapeHtml(toText(slide.subtitle))}</div>` : "";
    const metaObj = asObject(slide.meta as JsonValue | undefined);
    const meta =
      metaObj && Object.keys(metaObj).length
        ? `<div style="display:grid;gap:4px;color:rgba(15,23,42,.65);font-size:13px">
            ${Object.entries(metaObj)
              .map(([k, v]) => `<div><strong>${escapeHtml(k)}</strong> ${escapeHtml(toText(v))}</div>`)
              .join("")}
          </div>`
        : "";
    return `<div style="display:grid;gap:10px">
      <div>
        <h2 class="slideTitle">${escapeHtml(toText(slide.title ?? ""))}</h2>
        ${subtitle}
      </div>
      <div style="align-self:end">${meta}</div>
    </div>`;
  }

  if (layout === "agenda" || layout === "title_bullets" || layout === "summary") {
    return `${renderBullets(asArray(slide.bullets as JsonValue | undefined)) || renderGeneric(slide)}`;
  }

  if (layout === "section_divider" || layout === "thank_you" || layout === "appendix") {
    const subtitle = slide.subtitle ? `<div class="slideSubtitle">${escapeHtml(toText(slide.subtitle))}</div>` : "";
    const bullets = renderBullets(asArray(slide.bullets as JsonValue | undefined));
    return `<div style="display:grid;place-content:center;gap:10px;text-align:center">
      <div>
        <h2 class="slideTitle">${escapeHtml(toText(slide.title ?? ""))}</h2>
        ${subtitle}
      </div>
      ${bullets}
    </div>`;
  }

  if (layout === "problem_statement") {
    return renderBlocks(asArray(slide.blocks as JsonValue | undefined)) || renderGeneric(slide);
  }

  if (layout === "two_column" || layout === "three_column") {
    return renderColumns(slide) || renderGeneric(slide);
  }

  if (layout === "kpi_cards") {
    return renderKpiCards(asArray(slide.cards as JsonValue | undefined)) || renderGeneric(slide);
  }

  if (layout === "svg_full") {
    return renderSvgFull(slide);
  }

  if (layout === "swimlane_process") {
    return renderSwimlaneProcess(slide);
  }

  if (layout === "phases") {
    return renderPhases(slide);
  }

  if (layout === "swot" || layout === "matrix_2x2") {
    return renderSwotOrMatrix(slide);
  }

  if (
    layout === "comparison_table" ||
    layout === "plan_table" ||
    layout === "risk_register" ||
    layout === "milestones" ||
    layout === "cost_benefit"
  ) {
    return renderTable(slide) || renderGeneric(slide);
  }

  return renderGeneric(slide);
}

export function renderDeckHtmlDocument(deck: Deck, options?: { title?: string }): string {
  const title = options?.title ?? "Deck";
  const slides = deck.slides
    .map((slide, idx) => {
      return renderSlideHtml(slide, { index: idx, total: deck.slides.length });
    })
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      ${getDeckDocumentCss()}
    </style>
  </head>
  <body>
    <div class="deckViewport">
      <div class="deck">${slides}</div>
    </div>
    <script>
      (function() {
        var viewport = document.querySelector('.deckViewport');
        var slides = Array.from(document.querySelectorAll('.slide'));
        var idx = 0;
        function scrollToIndex(i) {
          idx = Math.max(0, Math.min(slides.length - 1, i));
          slides[idx].scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
        window.addEventListener('keydown', function(e) {
          if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); scrollToIndex(idx + 1); }
          if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); scrollToIndex(idx - 1); }
          if (e.key === 'Home') { e.preventDefault(); scrollToIndex(0); }
          if (e.key === 'End') { e.preventDefault(); scrollToIndex(slides.length - 1); }
        });
        viewport && viewport.addEventListener('scroll', function() {
          var top = viewport.scrollTop;
          var best = 0;
          var bestDist = Infinity;
          for (var i = 0; i < slides.length; i++) {
            var d = Math.abs(slides[i].offsetTop - top);
            if (d < bestDist) { bestDist = d; best = i; }
          }
          idx = best;
        });
      })();
    </script>
  </body>
</html>`;
}

export function renderSlideHtml(slide: Slide, context: { index: number; total: number }): string {
  const layout = String(slide.layout_type ?? "title_bullets");
  const slideTitle = escapeHtml(toText(slide.title ?? ""));
  const body = renderSlideBody(slide);
  const showTitle = (slide as any)?.show_title !== false;
  const headerTitle =
    layout === "cover" || layout === "section_divider" || layout === "thank_you" || (layout === "svg_full" && !showTitle)
      ? ""
      : `<div class="slideTitleBar">
          <div class="slideTitleBarGlow"></div>
          <div class="slideTitleBarAccent"></div>
          <div class="slideTitleBarOrbit slideTitleBarOrbitLarge"></div>
          <div class="slideTitleBarOrbit slideTitleBarOrbitSmall"></div>
          <div class="slideTitleBarDots"></div>
          <h2 class="slideTitle">${slideTitle}</h2>
        </div>`;

  return `<section class="slide layout-${escapeHtml(layout)}" data-slide-index="${context.index}">
    <div class="slideInner">
      <div>${headerTitle}</div>
      <div>${body}</div>
    </div>
    <div class="footerMark">${context.index + 1}/${context.total}</div>
  </section>`;
}

export function getDeckCss(): string {
  return `
    .slideInner { height: 100%; padding: 42px 52px; display: grid; grid-template-rows: auto 1fr; gap: 18px; }
    .slideTitleBar { position:relative; overflow:hidden; min-height:72px; display:flex; align-items:center; padding:0 26px 0 30px; border-radius:22px; background:linear-gradient(180deg, rgba(255,255,255,.96) 0%, rgba(247,250,255,.98) 100%); border:1px solid rgba(215,227,244,.96); box-shadow:0 14px 30px rgba(20,61,122,.08); }
    .slideTitleBarGlow, .slideTitleBarAccent, .slideTitleBarOrbit, .slideTitleBarDots { position:absolute; pointer-events:none; }
    .slideTitleBarGlow { inset:auto auto -26px -18px; width:180px; height:120px; border-radius:999px; background:radial-gradient(circle, rgba(77,160,255,.18), transparent 72%); }
    .slideTitleBarAccent { inset:14px auto 14px 14px; width:7px; border-radius:999px; background:linear-gradient(180deg, #4da0ff 0%, #1d6fe8 100%); box-shadow:0 0 0 4px rgba(77,160,255,.12); }
    .slideTitleBarOrbit { border-radius:999px; border:1px solid rgba(215,227,244,.78); }
    .slideTitleBarOrbitLarge { top:-22px; right:26px; width:116px; height:116px; }
    .slideTitleBarOrbitSmall { top:10px; right:86px; width:54px; height:54px; }
    .slideTitleBarDots { top:18px; right:24px; width:86px; height:30px; opacity:.68; background-image:radial-gradient(circle, rgba(29,111,232,.42) 0 1.8px, transparent 2px), radial-gradient(circle, rgba(77,160,255,.48) 0 1.4px, transparent 1.8px); background-size:16px 16px, 20px 20px; background-position:0 0, 8px 6px; }
    .slideTitle { position:relative; z-index:1; padding-right:120px; font-size:28px; font-weight:800; margin:0; line-height:1.2; color:#0f172a; }
    .slideSubtitle { font-size: 16px; font-weight: 600; margin: 8px 0 0 0; color: rgba(15,23,42,.75); }
    .bullets { margin: 0; padding-left: 18px; display: grid; gap: 8px; font-size: 16px; line-height: 1.45; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .card { border: 1px solid rgba(15,23,42,.1); border-radius: 14px; padding: 14px 14px; background: rgba(248,250,252,.9); }
    .cardTitle { font-size: 13px; font-weight: 800; margin: 0 0 8px 0; color: rgba(15,23,42,.8); letter-spacing: .2px; }
    .table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .table th, .table td { border: 1px solid rgba(15,23,42,.12); padding: 8px 10px; vertical-align: top; }
    .table th { background: rgba(15,23,42,.06); text-align: left; font-weight: 800; }
    .layout-cover .slideInner { grid-template-rows: 1fr auto; }
    .layout-cover .slideTitle { font-size: 46px; line-height: 1.1; }
    .layout-section_divider .slideTitle { font-size: 40px; }
    .layout-thank_you .slideTitle { font-size: 44px; }
    .layout-svg_full .slideInner { padding-top: 34px; }
    .swimlaneBoard { display:grid; gap:12px; height:100%; }
    .swimlaneHeader, .swimlaneRow { display:grid; grid-template-columns:160px 1fr; gap:12px; align-items:stretch; }
    .swimlaneCorner, .swimlaneLaneName { display:grid; place-items:center; border-radius:18px; padding:14px 12px; font-weight:800; line-height:1.35; }
    .swimlaneCorner { background:rgba(15,23,42,.06); color:#0f172a; }
    .swimlaneLaneName { background:linear-gradient(180deg,#eff6ff 0%,#dbeafe 100%); color:#1d4ed8; border:1px solid rgba(37,99,235,.16); }
    .swimlaneHeaderSteps, .swimlaneCells { display:grid; gap:12px; }
    .swimlaneHeaderCell { display:grid; place-items:center; min-height:52px; border-radius:16px; background:rgba(37,99,235,.08); color:#1d4ed8; font-size:13px; font-weight:800; }
    .swimlaneCell { min-height:94px; display:flex; align-items:center; padding:14px 16px; border-radius:18px; background:linear-gradient(180deg,#ffffff 0%,#f8fafc 100%); border:1px solid rgba(15,23,42,.08); box-shadow:0 8px 20px rgba(15,23,42,.06); color:#334155; font-size:15px; font-weight:600; line-height:1.5; }
    .phasesFlow { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(240px,1fr); gap:14px; align-items:stretch; height:100%; }
    .phaseCardWrap { display:grid; grid-template-columns:1fr 28px; gap:10px; align-items:center; min-width:0; }
    .phaseCard { display:grid; gap:12px; height:100%; min-height:240px; padding:18px 18px 16px 18px; border-radius:20px; background:linear-gradient(180deg,#ffffff 0%,#f8fafc 100%); border:1px solid rgba(15,23,42,.08); box-shadow:0 10px 24px rgba(15,23,42,.08); }
    .phaseBadge { justify-self:start; padding:6px 12px; border-radius:999px; background:#0f172a; color:#ffffff; font-size:12px; font-weight:800; }
    .phaseTitle { font-size:18px; font-weight:800; line-height:1.35; color:#0f172a; }
    .phaseText { font-size:15px; line-height:1.6; color:#334155; white-space:pre-wrap; }
    .phaseBullets { margin:0; padding-left:18px; display:grid; gap:8px; font-size:15px; line-height:1.55; color:#334155; }
    .phaseGate { margin-top:auto; padding:10px 12px; border-radius:14px; background:rgba(37,99,235,.08); color:#1d4ed8; font-size:13px; font-weight:800; line-height:1.45; }
    .phaseArrow { position:relative; width:28px; height:8px; border-radius:999px; background:rgba(15,23,42,.2); }
    .phaseArrow::after { content:""; position:absolute; right:-2px; top:50%; transform:translateY(-50%); border-top:8px solid transparent; border-bottom:8px solid transparent; border-left:12px solid rgba(15,23,42,.45); }
    .footerMark { position: absolute; right: 18px; bottom: 14px; font-size: 11px; color: rgba(15,23,42,.45); }
  `.trim();
}

function getDeckDocumentCss(): string {
  return `
    html, body { height: 100%; margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif; background: #0b1020; }
    .deckViewport { height: 100%; overflow: auto; scroll-snap-type: y mandatory; }
    .deck { padding: 24px 24px 48px 24px; display: grid; gap: 18px; justify-items: center; }
    .slide { width: min(1200px, calc(100vw - 48px)); aspect-ratio: 16 / 9; background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 80px rgba(0,0,0,.55); scroll-snap-align: start; position: relative; }
    ${getDeckCss()}
  `.trim();
}
