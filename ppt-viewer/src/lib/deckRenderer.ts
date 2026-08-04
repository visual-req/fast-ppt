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

function renderGauge(slide: Slide): string {
  const min = Number.isFinite(Number((slide as any).min)) ? Number((slide as any).min) : 0;
  const max = Number.isFinite(Number((slide as any).max)) && Number((slide as any).max) > min ? Number((slide as any).max) : 100;
  const rawValue = Number.isFinite(Number((slide as any).value)) ? Number((slide as any).value) : min;
  const value = Math.min(max, Math.max(min, rawValue));
  const ratio = (value - min) / Math.max(max - min, 1);
  const cx = 280;
  const cy = 246;
  const radius = 176;
  const pointerRadius = 142;
  const metricLabel = escapeHtml(toText((slide as any).label ?? "综合评分"));

  function polarToCartesian(centerX: number, centerY: number, r: number, angleDeg: number) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: centerX + r * Math.cos(angleRad), y: centerY + r * Math.sin(angleRad) };
  }

  function describeArc(centerX: number, centerY: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(centerX, centerY, r, endAngle);
    const end = polarToCartesian(centerX, centerY, r, startAngle);
    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? 0 : 1;
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  }

  const progressAngle = 180 - ratio * 180;
  const progressArc = describeArc(cx, cy, radius, 180, progressAngle);
  const fullArc = describeArc(cx, cy, radius, 180, 0);
  const pointer = polarToCartesian(cx, cy, pointerRadius, progressAngle);
  const valueLabel = Number.isInteger(value) ? String(value) : value.toFixed(1);

  return `<div style="display:grid;place-items:center;height:100%;min-height:0">
    <svg viewBox="0 0 560 320" width="560" height="320" aria-label="gauge-chart">
      <path d="${fullArc}" fill="none" stroke="#dbeafe" stroke-width="28" stroke-linecap="round"></path>
      <path d="${progressArc}" fill="none" stroke="#2563eb" stroke-width="28" stroke-linecap="round"></path>
      <line x1="${cx}" y1="${cy}" x2="${pointer.x.toFixed(2)}" y2="${pointer.y.toFixed(2)}" stroke="#0f172a" stroke-width="7" stroke-linecap="round"></line>
      <circle cx="${cx}" cy="${cy}" r="14" fill="#0f172a"></circle>
      <text x="${cx}" y="154" text-anchor="middle" fill="#0f172a" font-size="58" font-weight="700">${escapeHtml(valueLabel)}</text>
      <text x="${cx}" y="196" text-anchor="middle" fill="#64748b" font-size="22">${metricLabel}</text>
      <text x="${cx - radius}" y="286" text-anchor="middle" fill="#0f172a" font-size="18">${escapeHtml(String(min))}</text>
      <text x="${cx + radius}" y="286" text-anchor="middle" fill="#0f172a" font-size="18">${escapeHtml(String(max))}</text>
    </svg>
  </div>`;
}

function renderPyramid(slide: Slide): string {
  const rawLevels: unknown[] = Array.isArray((slide as any).levels)
    ? (slide as any).levels
    : Array.isArray((slide as any).blocks)
      ? (slide as any).blocks
      : Array.isArray((slide as any).bullets)
        ? (slide as any).bullets
        : [];

  if (!rawLevels.length) return "";

  const total = rawLevels.length;
  const topOffsetRatio = 0.136;
  const gapRatio = 0.047;
  const palette = [
    ["#2c7df2", "#195dca"],
    ["#3b8dff", "#216fe0"],
    ["#5a9eff", "#2f7be5"],
    ["#79b0ff", "#4189ef"],
    ["#9dc5ff", "#5f9af4"]
  ];

  const layers = rawLevels
    .slice(0, 5)
    .map((item: unknown, idx: number) => {
      const obj =
        typeof item === "string"
          ? { title: item }
          : item && typeof item === "object" && !Array.isArray(item)
            ? (item as Record<string, unknown>)
            : {};
      const title = escapeHtml(toText(obj.title ?? obj.label ?? `层级 ${idx + 1}`));
      const text = toText(obj.text);
      const bullets = Array.isArray(obj.bullets)
        ? obj.bullets.map((bullet) => toText(bullet)).filter(Boolean).slice(0, 2)
        : [];
      const layerRatio = Math.max((1 - topOffsetRatio - gapRatio * (total - 1)) / total, 0.08);
      const topRatio = topOffsetRatio + idx * (layerRatio + gapRatio);
      const bottomRatio = Math.min(topRatio + layerRatio, 1);
      const topWidth = topRatio * 100;
      const bottomWidth = bottomRatio * 100;
      const topInset = ((bottomWidth - topWidth) / 2 / bottomWidth) * 100;
      const contentInset = Math.max(7, Math.min(13, topInset + 2));
      const [from, to] = palette[idx % palette.length];
      const body = text
        ? `<div style="color:rgba(255,255,255,.92);font-size:14px;line-height:1.45">${escapeHtml(text)}</div>`
        : bullets.length
          ? `<div style="display:grid;gap:4px">${bullets.map((bullet) => `<div style="color:rgba(255,255,255,.92);font-size:14px;line-height:1.4">• ${escapeHtml(bullet)}</div>`).join("")}</div>`
          : "";

      return `<div style="width:${bottomWidth}%;height:100%;min-height:0">
        <div style="position:relative;height:100%;min-height:0;clip-path:polygon(${topInset}% 0,calc(100% - ${topInset}%) 0,100% 100%,0 100%);border:1px solid rgba(216,230,247,.74);background:linear-gradient(135deg,${from} 0%,${to} 100%);box-shadow:0 18px 28px rgba(26,73,145,.16);overflow:hidden">
          <div style="position:relative;z-index:1;height:100%;min-height:0;display:grid;align-content:center;justify-items:center;gap:8px;padding:14px ${contentInset}%;text-align:center;background:linear-gradient(180deg,rgba(255,255,255,.18) 0%,rgba(255,255,255,0) 44%)">
            <div style="min-width:52px;padding:4px 12px;border-radius:999px;background:rgba(255,255,255,.18);color:#fff;font-size:14px;font-weight:700;line-height:1.2;letter-spacing:.04em">${String(idx + 1).padStart(2, "0")}</div>
            <div style="color:#fff;font-size:24px;font-weight:700;line-height:1.15">${title}</div>
            ${body}
          </div>
        </div>
      </div>`;
    })
    .join("");

  return `<div style="height:100%;min-height:0;display:grid;grid-template-rows:repeat(${Math.min(total, 5)},minmax(0,1fr));gap:14px;justify-items:center;align-items:stretch;padding:6px 0">${layers}</div>`;
}

function renderDoubleLoop(slide: Slide): string {
  const rawSlide = slide as any;
  const leftTitle = escapeHtml(toText(rawSlide.left_title ?? rawSlide.loops?.left?.title ?? "策略循环"));
  const rightTitle = escapeHtml(toText(rawSlide.right_title ?? rawSlide.loops?.right?.title ?? "执行循环"));
  const leftPresets = [
    { title: "洞察输入", x: "22%", y: "28%", dx: "-126px", dy: "-26px" },
    { title: "需求澄清", x: "7%", y: "50%", dx: "22px", dy: "-22px" },
    { title: "方案建模", x: "22%", y: "72%", dx: "-128px", dy: "18px" },
    { title: "机制校准", x: "43%", y: "50%", dx: "-72px", dy: "-48px" }
  ];
  const rightPresets = [
    { title: "执行推进", x: "57%", y: "28%", dx: "24px", dy: "-26px" },
    { title: "数据回收", x: "78%", y: "50%", dx: "24px", dy: "-22px" },
    { title: "效果验证", x: "57%", y: "72%", dx: "24px", dy: "18px" },
    { title: "持续优化", x: "43%", y: "50%", dx: "26px", dy: "14px" }
  ];
  const leftRaw: unknown[] = Array.isArray(rawSlide.left_nodes)
    ? rawSlide.left_nodes
    : Array.isArray(rawSlide.loops?.left?.nodes)
      ? rawSlide.loops.left.nodes
      : [];
  const rightRaw: unknown[] = Array.isArray(rawSlide.right_nodes)
    ? rawSlide.right_nodes
    : Array.isArray(rawSlide.loops?.right?.nodes)
      ? rawSlide.loops.right.nodes
      : [];
  const renderNodes = (presets: typeof leftPresets, raw: unknown[]) =>
    presets
      .map((preset, idx) => {
        const item = raw[idx] as any;
        const title = escapeHtml(toText(typeof item === "string" ? item : item?.title ?? preset.title));
        return `<div style="position:absolute;left:${preset.x};top:${preset.y};transform:translate(-50%,-50%)">
          <div style="width:24px;height:24px;border-radius:999px;background:#fff;border:6px solid #1d6fe8;box-shadow:0 12px 22px rgba(20,61,122,.12)"></div>
          <div style="position:absolute;left:0;top:0;transform:translate(${preset.dx},${preset.dy});min-width:104px;padding:10px 16px;border-radius:16px;background:rgba(255,255,255,.96);border:1px solid rgba(215,227,244,.96);box-shadow:0 14px 28px rgba(20,61,122,.10);color:#143d7a;font-size:16px;font-weight:800;line-height:1.2;white-space:nowrap">${title}</div>
        </div>`;
      })
      .join("");
  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.16), transparent 34%), linear-gradient(180deg,#f7faff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <div style="position:absolute;top:7%;left:12%;min-width:132px;padding:10px 18px;border-radius:999px;background:#eff6ff;border:1px solid #bfdbfe;color:#1d6fe8;font-size:22px;font-weight:800;text-align:center">${leftTitle}</div>
    <div style="position:absolute;top:7%;right:12%;min-width:132px;padding:10px 18px;border-radius:999px;background:#eff6ff;border:1px solid #bfdbfe;color:#1d6fe8;font-size:22px;font-weight:800;text-align:center">${rightTitle}</div>
    <svg viewBox="0 0 1000 420" style="position:absolute;left:6%;right:6%;top:14%;bottom:8%;width:88%;height:78%" preserveAspectRatio="xMidYMid meet" aria-label="double-loop">
      <defs>
        <linearGradient id="doubleLoopDeckStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#1d6fe8"></stop>
          <stop offset="50%" stop-color="#4da0ff"></stop>
          <stop offset="100%" stop-color="#1d6fe8"></stop>
        </linearGradient>
      </defs>
      <path d="M120 210 C120 92 250 48 374 150 C445 210 555 210 626 150 C750 48 880 92 880 210 C880 328 750 372 626 270 C555 210 445 210 374 270 C250 372 120 328 120 210" fill="none" stroke="#d8e7fb" stroke-width="58" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M120 210 C120 92 250 48 374 150 C445 210 555 210 626 150 C750 48 880 92 880 210 C880 328 750 372 626 270 C555 210 445 210 374 270 C250 372 120 328 120 210" fill="none" stroke="url(#doubleLoopDeckStroke)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M120 210 C120 92 250 48 374 150 C445 210 555 210 626 150 C750 48 880 92 880 210 C880 328 750 372 626 270 C555 210 445 210 374 270 C250 372 120 328 120 210" fill="none" stroke="#93c5fd" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="12 14" opacity=".92"></path>
    </svg>
    ${renderNodes(leftPresets, leftRaw)}
    ${renderNodes(rightPresets, rightRaw)}
  </div>`;
}

function renderIceberg(slide: Slide): string {
  const rawSlide = slide as any;
  const readSection = (raw: unknown, fallbackTitle: string, fallbackTag: string) => {
    const record = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
    const bulletSource = record.items ?? record.bullets;
    const bullets = Array.isArray(bulletSource)
      ? bulletSource.map((item: unknown) => escapeHtml(toText(item))).filter(Boolean).slice(0, 5)
      : [];
    return {
      tag: escapeHtml(toText(record.tag) || fallbackTag),
      title: escapeHtml(toText(record.title) || fallbackTitle),
      text: escapeHtml(toText(record.text)),
      bullets
    };
  };

  const tip = readSection(rawSlide.tip ?? rawSlide.visible ?? rawSlide.above, "表层表现", "VISIBLE");
  const base = readSection(rawSlide.base ?? rawSlide.hidden ?? rawSlide.below, "深层驱动", "HIDDEN");
  const baseText =
    base.text ||
    (base.bullets.length
      ? ""
      : "把机制、能力、认知与环境因素放在水面以下，表达真正驱动结果的深层结构。");
  const chips = base.bullets.length
    ? `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;max-width:86%;margin-top:2px">${base.bullets
        .map(
          (item) =>
            `<div style="padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.22);color:#fff;font-size:12px;font-weight:700;line-height:1.3">${item}</div>`
        )
        .join("")}</div>`
    : "";

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at 76% 10%, rgba(255,255,255,.34), transparent 22%),linear-gradient(180deg,#f8fbff 0%,#edf5ff 39%,#dcecff 39%,#c7dcf8 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <div style="position:absolute;left:50%;top:38%;width:58%;aspect-ratio:1.2;transform:translate(-50%,-50%);border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.24) 0%, rgba(147,197,253,.08) 52%, transparent 76%)"></div>
    <div style="position:absolute;left:0;right:0;top:39%;height:16px;background:linear-gradient(180deg, rgba(255,255,255,.74) 0%, rgba(191,219,254,.18) 100%);border-top:2px solid rgba(255,255,255,.86);border-bottom:1px solid rgba(147,197,253,.42);box-shadow:0 6px 18px rgba(59,130,246,.12)"></div>
    <div style="position:absolute;right:5%;top:calc(39% - 16px);padding:0 10px;border-radius:999px;background:rgba(255,255,255,.78);color:#1d6fe8;font-size:11px;font-weight:800;letter-spacing:.08em;line-height:24px">WATERLINE</div>
    <div style="position:absolute;left:50%;top:9%;width:min(34%,320px);height:34%;transform:translateX(-50%);padding:12% 11% 10%;clip-path:polygon(50% 0,100% 100%,12% 100%,0 74%,18% 34%);background:linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(233,244,255,.98) 100%);border:1px solid rgba(191,219,254,.96);box-shadow:0 18px 32px rgba(20,61,122,.12);display:grid;justify-items:center;align-content:center;gap:8px;text-align:center;overflow:hidden">
      <div style="display:inline-flex;align-items:center;min-height:24px;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.1);color:#1d6fe8;font-size:11px;font-weight:800;letter-spacing:.08em">${tip.tag}</div>
      <div style="color:#143d7a;font-size:24px;font-weight:800;line-height:1.2">${tip.title}</div>
      ${tip.text ? `<div style="color:#475569;font-size:13px;line-height:1.55">${tip.text}</div>` : ""}
    </div>
    <div style="position:absolute;left:50%;bottom:7%;width:min(64%,620px);height:48%;transform:translateX(-50%);padding:9% 10% 12%;clip-path:polygon(18% 0,86% 0,100% 34%,92% 100%,18% 100%,0 42%);background:linear-gradient(180deg, rgba(255,255,255,.22) 0%, rgba(255,255,255,.06) 20%),linear-gradient(180deg,#78aeea 0%,#4f89d7 100%);border:1px solid rgba(167,198,238,.94);box-shadow:0 24px 40px rgba(20,61,122,.14);display:grid;justify-items:center;align-content:start;gap:10px;text-align:center;overflow:hidden">
      <div style="display:inline-flex;align-items:center;min-height:24px;padding:0 10px;border-radius:999px;background:rgba(255,255,255,.18);color:#fff;font-size:11px;font-weight:800;letter-spacing:.08em">${base.tag}</div>
      <div style="color:#fff;font-size:28px;font-weight:800;line-height:1.2">${base.title}</div>
      ${baseText ? `<div style="max-width:82%;color:rgba(255,255,255,.92);font-size:14px;line-height:1.6">${baseText}</div>` : ""}
      ${chips}
    </div>
  </div>`;
}

function renderHouse(slide: Slide): string {
  const rawSlide = slide as any;
  const rawRoof =
    rawSlide.roof && typeof rawSlide.roof === "object" && !Array.isArray(rawSlide.roof)
      ? rawSlide.roof
      : rawSlide.top && typeof rawSlide.top === "object" && !Array.isArray(rawSlide.top)
        ? rawSlide.top
        : {};
  const roofTag = escapeHtml(toText(rawRoof.tag) || "ROOF");
  const roofTitle = escapeHtml(toText(rawRoof.title) || "战略屋顶");
  const roofText = escapeHtml(toText(rawRoof.text) || "统一目标、方法论与衡量口径");

  const rawPillars: unknown[] = Array.isArray(rawSlide.pillars)
    ? rawSlide.pillars
    : Array.isArray(rawSlide.columns)
      ? rawSlide.columns
      : Array.isArray(rawSlide.blocks)
        ? rawSlide.blocks
        : [];
  if (!rawPillars.length) return "";

  const palette = [
    ["#2563eb", "#1d4ed8"],
    ["#3b82f6", "#2563eb"],
    ["#60a5fa", "#3b82f6"],
    ["#93c5fd", "#60a5fa"]
  ] as const;

  const pillars = rawPillars
    .slice(0, 4)
    .map((item: unknown, index: number) => {
      const record =
        typeof item === "string"
          ? { title: item }
          : item && typeof item === "object" && !Array.isArray(item)
            ? (item as Record<string, unknown>)
            : {};
      const tag = escapeHtml(toText(record.tag));
      const title = escapeHtml(toText(record.title ?? record.name ?? `支柱 ${index + 1}`));
      const text = escapeHtml(toText(record.text));
      const bullets = Array.isArray(record.bullets)
        ? record.bullets
            .map((bullet: unknown) => escapeHtml(toText(bullet)))
            .filter(Boolean)
            .slice(0, 3)
        : [];
      const [from, to] = palette[index % palette.length];
      const body = text
        ? `<div style="margin-top:10px;margin-left:8px;color:#475569;font-size:14px;line-height:1.5">${text}</div>`
        : bullets.length
          ? `<ul style="margin:10px 0 0 26px;padding:0;color:#475569;font-size:14px;line-height:1.45;display:grid;gap:6px">${bullets
              .map((bullet) => `<li>${bullet}</li>`)
              .join("")}</ul>`
          : "";
      return `<div style="min-width:0;min-height:0;display:grid;grid-template-rows:18px minmax(0,1fr) 18px;gap:6px">
        <div style="justify-self:center;width:calc(100% - 22px);border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(239,246,255,.98));border:1px solid rgba(191,219,254,.92);box-shadow:0 10px 18px rgba(20,61,122,.08)"></div>
        <div style="position:relative;min-height:0;padding:18px 16px 16px;border-radius:26px;background:linear-gradient(180deg,rgba(255,255,255,.96) 0%,rgba(248,251,255,.98) 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 18px 30px rgba(20,61,122,.08);overflow:hidden">
          <div style="position:absolute;left:0;top:0;bottom:0;width:10px;background:linear-gradient(180deg,${from} 0%,${to} 100%)"></div>
          ${tag ? `<div style="position:relative;margin-left:8px;color:${to};font-size:12px;font-weight:800;letter-spacing:.08em">${tag}</div>` : ""}
          <div style="position:relative;margin-top:${tag ? "10px" : "0"};margin-left:8px;color:#143d7a;font-size:22px;font-weight:800;line-height:1.2">${title}</div>
          ${body}
        </div>
        <div style="justify-self:center;width:calc(100% - 22px);border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(239,246,255,.98));border:1px solid rgba(191,219,254,.92);box-shadow:0 10px 18px rgba(20,61,122,.08)"></div>
      </div>`;
    })
    .join("");

  const rawFoundation =
    rawSlide.foundation && typeof rawSlide.foundation === "object" && !Array.isArray(rawSlide.foundation)
      ? rawSlide.foundation
      : rawSlide.base && typeof rawSlide.base === "object" && !Array.isArray(rawSlide.base)
        ? rawSlide.base
        : rawSlide.bottom && typeof rawSlide.bottom === "object" && !Array.isArray(rawSlide.bottom)
          ? rawSlide.bottom
          : {};
  const foundationTitle = escapeHtml(toText(rawFoundation.title) || "基础底座");
  const foundationText = escapeHtml(toText(rawFoundation.text));
  const foundationItems = Array.isArray(rawFoundation.items ?? rawFoundation.bullets)
    ? (rawFoundation.items ?? rawFoundation.bullets)
        .map((item: unknown) => escapeHtml(toText(item)))
        .filter(Boolean)
        .slice(0, 4)
    : [];

  return `<div style="height:100%;min-height:0;display:grid;grid-template-rows:168px minmax(0,1fr) 132px;gap:12px;overflow:hidden;padding:4px 0">
    <div style="position:relative;display:grid;justify-items:center;align-items:end;min-height:0">
      <div style="position:relative;width:min(72%,740px);height:100%;min-height:0;padding:20px 14% 18px;clip-path:polygon(50% 0,100% 100%,0 100%);background:linear-gradient(180deg,rgba(255,255,255,.24) 0%,rgba(255,255,255,.02) 28%),linear-gradient(135deg,#60a5fa 0%,#2563eb 52%,#1d4ed8 100%);border:1px solid rgba(191,219,254,.92);box-shadow:0 18px 34px rgba(20,61,122,.16);color:#fff;display:grid;align-content:end;justify-items:center;gap:6px;text-align:center;overflow:hidden">
        <div style="padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.18);font-size:12px;font-weight:800;letter-spacing:.08em">${roofTag}</div>
        <div style="font-size:26px;font-weight:800;line-height:1.12">${roofTitle}</div>
        <div style="max-width:440px;color:rgba(255,255,255,.9);font-size:14px;line-height:1.4">${roofText}</div>
        <div style="position:absolute;left:18%;right:18%;bottom:0;height:9px;border-radius:999px 999px 0 0;background:rgba(255,255,255,.22)"></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(${Math.max(Math.min(rawPillars.length, 4), 1)}, minmax(0,1fr));gap:14px;min-height:0;align-items:stretch">${pillars}</div>
    <div style="position:relative;min-height:0;padding:22px 28px 18px;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.14), transparent 26%),linear-gradient(180deg,#eff6ff 0%,#dbeafe 100%);border:1px solid rgba(191,219,254,.96);box-shadow:0 18px 32px rgba(20,61,122,.09);overflow:hidden">
      <div style="position:absolute;left:28px;right:28px;top:0;height:9px;border-radius:0 0 999px 999px;background:linear-gradient(90deg,#60a5fa 0%,#2563eb 45%,#1d4ed8 100%)"></div>
      <div style="color:#143d7a;font-size:24px;font-weight:800;line-height:1.2">${foundationTitle}</div>
      ${foundationText ? `<div style="margin-top:8px;color:#475569;font-size:14px;line-height:1.45">${foundationText}</div>` : ""}
      ${
        foundationItems.length
          ? `<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">${foundationItems
              .map(
                (item: string) =>
                  `<div style="padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.72);border:1px solid rgba(191,219,254,.9);color:#1d4ed8;font-size:13px;font-weight:700;line-height:1.2">${item}</div>`
              )
              .join("")}</div>`
          : ""
      }
    </div>
  </div>`;
}

function renderRadialExplainer(slide: Slide): string {
  const rawSlide = slide as any;
  const rawCenter =
    rawSlide.center && typeof rawSlide.center === "object" && !Array.isArray(rawSlide.center) ? rawSlide.center : {};
  const centerTag = escapeHtml(toText(rawCenter.tag) || "CENTER");
  const centerTitle = escapeHtml(toText(rawCenter.title) || toText(rawSlide.center_title) || "核心议题");
  const centerText = escapeHtml(toText(rawCenter.text) || "围绕中心主题，向外展开关键模块、动作或解释。");

  const rawItems: unknown[] = Array.isArray(rawSlide.items)
    ? rawSlide.items
    : Array.isArray(rawSlide.points)
      ? rawSlide.points
      : Array.isArray(rawSlide.blocks)
        ? rawSlide.blocks
        : Array.isArray(rawSlide.sectors)
          ? rawSlide.sectors
          : [];
  if (!rawItems.length) return "";

  const presetMap = {
    3: [
      { cardX: 50, cardY: 14, dotX: 50, dotY: 29, align: "center" },
      { cardX: 80, cardY: 66, dotX: 68, dotY: 58, align: "left" },
      { cardX: 20, cardY: 66, dotX: 32, dotY: 58, align: "right" }
    ],
    4: [
      { cardX: 50, cardY: 14, dotX: 50, dotY: 29, align: "center" },
      { cardX: 81, cardY: 50, dotX: 68, dotY: 50, align: "left" },
      { cardX: 50, cardY: 86, dotX: 50, dotY: 71, align: "center" },
      { cardX: 19, cardY: 50, dotX: 32, dotY: 50, align: "right" }
    ],
    5: [
      { cardX: 50, cardY: 12, dotX: 50, dotY: 28, align: "center" },
      { cardX: 79, cardY: 31, dotX: 66, dotY: 37, align: "left" },
      { cardX: 79, cardY: 69, dotX: 66, dotY: 63, align: "left" },
      { cardX: 21, cardY: 69, dotX: 34, dotY: 63, align: "right" },
      { cardX: 21, cardY: 31, dotX: 34, dotY: 37, align: "right" }
    ],
    6: [
      { cardX: 28, cardY: 16, dotX: 38, dotY: 31, align: "right" },
      { cardX: 72, cardY: 16, dotX: 62, dotY: 31, align: "left" },
      { cardX: 84, cardY: 50, dotX: 69, dotY: 50, align: "left" },
      { cardX: 72, cardY: 84, dotX: 62, dotY: 69, align: "left" },
      { cardX: 28, cardY: 84, dotX: 38, dotY: 69, align: "right" },
      { cardX: 16, cardY: 50, dotX: 31, dotY: 50, align: "right" }
    ]
  } as const;

  const source = rawItems.slice(0, 6);
  const presets = presetMap[Math.min(Math.max(source.length, 3), 6) as keyof typeof presetMap] ?? presetMap[4];
  const connector = (preset: (typeof presets)[number]) => {
    const cx = 50;
    const cy = 50;
    const mx = (cx + preset.dotX) / 2;
    const my = (cy + preset.dotY) / 2;
    return `M ${cx} ${cy} Q ${mx} ${my} ${preset.dotX} ${preset.dotY}`;
  };
  const lines = source
    .map((_, index) => {
      const preset = presets[index];
      return `<path d="${connector(preset)}" fill="none" stroke="url(#radialDeckStroke)" stroke-width="0.7" stroke-linecap="round" stroke-dasharray="1.8 1.5" opacity=".85"></path>
      <circle cx="${preset.dotX}" cy="${preset.dotY}" r="1.7" fill="#fff" stroke="#2563eb" stroke-width=".7"></circle>`;
    })
    .join("");
  const cards = source
    .map((item: unknown, index: number) => {
      const preset = presets[index];
      const record =
        typeof item === "string"
          ? { title: item }
          : item && typeof item === "object" && !Array.isArray(item)
            ? (item as Record<string, unknown>)
            : {};
      const tag = escapeHtml(toText(record.tag));
      const title = escapeHtml(toText(record.title ?? record.name ?? `要点 ${index + 1}`));
      const text = escapeHtml(
        toText(record.text) ||
          (Array.isArray(record.bullets)
            ? record.bullets
                .map((bullet: unknown) => toText(bullet))
                .filter(Boolean)
                .slice(0, 2)
                .join(" / ")
            : "")
      );
      const transform =
        preset.align === "left"
          ? "translate(0,-50%)"
          : preset.align === "right"
            ? "translate(-100%,-50%)"
            : "translate(-50%,-50%)";
      return `<div style="position:absolute;left:${preset.cardX}%;top:${preset.cardY}%;transform:${transform};width:26%;min-width:180px;max-width:250px;min-height:88px;padding:16px 18px;border-radius:22px;background:rgba(255,255,255,.97);border:1px solid rgba(215,227,244,.96);box-shadow:0 16px 28px rgba(20,61,122,.08);overflow:hidden;text-align:${preset.align === "center" ? "center" : "left"}">
        <div style="position:absolute;inset:0 auto 0 0;width:7px;background:linear-gradient(180deg,#60a5fa 0%,#2563eb 100%)"></div>
        ${tag ? `<div style="position:relative;margin-left:${preset.align === "center" ? "0" : "10px"};color:#2563eb;font-size:11px;font-weight:800;letter-spacing:.08em">${tag}</div>` : ""}
        <div style="position:relative;margin-top:8px;margin-left:${preset.align === "center" ? "0" : "10px"};color:#143d7a;font-size:20px;font-weight:800;line-height:1.2">${title}</div>
        ${text ? `<div style="position:relative;margin-top:8px;margin-left:${preset.align === "center" ? "0" : "10px"};color:#475569;font-size:13px;line-height:1.45">${text}</div>` : ""}
      </div>`;
    })
    .join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.14), transparent 30%),linear-gradient(180deg,#f8fbff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
      <defs>
        <linearGradient id="radialDeckStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#93c5fd"></stop>
          <stop offset="100%" stop-color="#2563eb"></stop>
        </linearGradient>
      </defs>
      ${lines}
    </svg>
    <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:48%;aspect-ratio:1;border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.22) 0%, rgba(147,197,253,.08) 52%, transparent 74%)"></div>
    <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:37%;aspect-ratio:1;border-radius:999px;border:2px dashed rgba(96,165,250,.5)"></div>
    <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:30%;aspect-ratio:1;min-width:220px;max-width:320px;padding:18px 22px;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.98) 0%,rgba(244,248,255,.98) 100%);border:1px solid rgba(191,219,254,.96);box-shadow:0 20px 34px rgba(20,61,122,.12);display:grid;align-content:center;justify-items:center;gap:8px;text-align:center">
      <div style="padding:4px 10px;border-radius:999px;background:rgba(37,99,235,.1);color:#2563eb;font-size:12px;font-weight:800;letter-spacing:.08em">${centerTag}</div>
      <div style="color:#143d7a;font-size:28px;font-weight:800;line-height:1.15">${centerTitle}</div>
      <div style="max-width:220px;color:#64748b;font-size:14px;line-height:1.45">${centerText}</div>
    </div>
    ${cards}
  </div>`;
}

function renderBrainExplainer(slide: Slide): string {
  const rawSlide = slide as any;
  const rawBrain =
    rawSlide.brain && typeof rawSlide.brain === "object" && !Array.isArray(rawSlide.brain)
      ? rawSlide.brain
      : rawSlide.center && typeof rawSlide.center === "object" && !Array.isArray(rawSlide.center)
        ? rawSlide.center
        : {};
  const brainTag = escapeHtml(toText(rawBrain.tag) || "BRAIN");
  const brainTitle = escapeHtml(toText(rawBrain.title) || "智能中枢");
  const brainText = escapeHtml(toText(rawBrain.text) || "以统一认知、规则和反馈闭环驱动周边模块协同运转。");

  const rawItems: unknown[] = Array.isArray(rawSlide.items)
    ? rawSlide.items
    : Array.isArray(rawSlide.points)
      ? rawSlide.points
      : Array.isArray(rawSlide.blocks)
        ? rawSlide.blocks
        : [];
  if (!rawItems.length) return "";

  const presetMap = {
    4: [
      { cardX: 50, cardY: 12, dotX: 50, dotY: 32, align: "center" },
      { cardX: 84, cardY: 40, dotX: 68, dotY: 44, align: "left" },
      { cardX: 84, cardY: 74, dotX: 66, dotY: 64, align: "left" },
      { cardX: 16, cardY: 57, dotX: 32, dotY: 54, align: "right" }
    ],
    5: [
      { cardX: 50, cardY: 12, dotX: 50, dotY: 32, align: "center" },
      { cardX: 82, cardY: 30, dotX: 66, dotY: 38, align: "left" },
      { cardX: 84, cardY: 70, dotX: 66, dotY: 62, align: "left" },
      { cardX: 18, cardY: 70, dotX: 34, dotY: 62, align: "right" },
      { cardX: 18, cardY: 30, dotX: 34, dotY: 38, align: "right" }
    ],
    6: [
      { cardX: 50, cardY: 10, dotX: 50, dotY: 31, align: "center" },
      { cardX: 80, cardY: 24, dotX: 64, dotY: 36, align: "left" },
      { cardX: 84, cardY: 50, dotX: 68, dotY: 50, align: "left" },
      { cardX: 80, cardY: 76, dotX: 64, dotY: 64, align: "left" },
      { cardX: 20, cardY: 76, dotX: 36, dotY: 64, align: "right" },
      { cardX: 20, cardY: 24, dotX: 36, dotY: 36, align: "right" }
    ]
  } as const;

  const source = rawItems.slice(0, 6);
  const presets = presetMap[Math.min(Math.max(source.length, 4), 6) as keyof typeof presetMap] ?? presetMap[5];
  const connector = (preset: (typeof presets)[number]) => {
    const cx = 50;
    const cy = 50;
    const mx = (cx + preset.dotX) / 2;
    const my = (cy + preset.dotY) / 2;
    return `M ${cx} ${cy} Q ${mx} ${my} ${preset.dotX} ${preset.dotY}`;
  };
  const lines = source
    .map((_, index) => {
      const preset = presets[index];
      return `<path d="${connector(preset)}" fill="none" stroke="url(#brainDeckStroke)" stroke-width="0.72" stroke-linecap="round" stroke-dasharray="1.9 1.5" opacity=".88"></path>
      <circle cx="${preset.dotX}" cy="${preset.dotY}" r="1.75" fill="#fff" stroke="#2563eb" stroke-width=".7"></circle>`;
    })
    .join("");
  const cards = source
    .map((item: unknown, index: number) => {
      const preset = presets[index];
      const record =
        typeof item === "string"
          ? { title: item }
          : item && typeof item === "object" && !Array.isArray(item)
            ? (item as Record<string, unknown>)
            : {};
      const tag = escapeHtml(toText(record.tag));
      const title = escapeHtml(toText(record.title ?? record.name ?? `模块 ${index + 1}`));
      const text = escapeHtml(
        toText(record.text) ||
          (Array.isArray(record.bullets)
            ? record.bullets
                .map((bullet: unknown) => toText(bullet))
                .filter(Boolean)
                .slice(0, 2)
                .join(" / ")
            : "")
      );
      const transform =
        preset.align === "left"
          ? "translate(0,-50%)"
          : preset.align === "right"
            ? "translate(-100%,-50%)"
            : "translate(-50%,-50%)";
      return `<div style="position:absolute;left:${preset.cardX}%;top:${preset.cardY}%;transform:${transform};width:25%;min-width:176px;max-width:244px;min-height:84px;padding:16px 18px;border-radius:22px;background:rgba(255,255,255,.97);border:1px solid rgba(215,227,244,.96);box-shadow:0 16px 28px rgba(20,61,122,.08);overflow:hidden;text-align:${preset.align === "center" ? "center" : "left"}">
        <div style="position:absolute;inset:0 auto 0 0;width:7px;background:linear-gradient(180deg,#60a5fa 0%,#2563eb 100%)"></div>
        ${tag ? `<div style="position:relative;margin-left:${preset.align === "center" ? "0" : "10px"};color:#2563eb;font-size:11px;font-weight:800;letter-spacing:.08em">${tag}</div>` : ""}
        <div style="position:relative;margin-top:8px;margin-left:${preset.align === "center" ? "0" : "10px"};color:#143d7a;font-size:20px;font-weight:800;line-height:1.2">${title}</div>
        ${text ? `<div style="position:relative;margin-top:8px;margin-left:${preset.align === "center" ? "0" : "10px"};color:#475569;font-size:13px;line-height:1.45">${text}</div>` : ""}
      </div>`;
    })
    .join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.14), transparent 28%),linear-gradient(180deg,#f8fbff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
      <defs>
        <linearGradient id="brainDeckStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#93c5fd"></stop>
          <stop offset="100%" stop-color="#2563eb"></stop>
        </linearGradient>
      </defs>
      ${lines}
    </svg>
    <div style="position:absolute;left:50%;top:54%;width:40%;aspect-ratio:1;transform:translate(-50%,-50%)">
      <div style="position:absolute;inset:12%;border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.24) 0%, rgba(147,197,253,.08) 56%, transparent 74%)"></div>
      <svg viewBox="0 0 420 320" style="position:absolute;inset:8% 10% 24%;width:80%;height:68%;filter:drop-shadow(0 12px 22px rgba(20,61,122,.1))" aria-hidden="true">
        <defs>
          <linearGradient id="brainDeckFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f8fbff"></stop>
            <stop offset="100%" stop-color="#eaf2ff"></stop>
          </linearGradient>
        </defs>
        <path d="M209 60 C176 30 124 34 97 68 C74 72 56 91 54 118 C37 134 34 166 50 188 C47 213 61 237 84 247 C96 271 122 286 148 283 C164 294 188 296 209 286" fill="url(#brainDeckFill)" stroke="#2563eb" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M211 60 C244 30 296 34 323 68 C346 72 364 91 366 118 C383 134 386 166 370 188 C373 213 359 237 336 247 C324 271 298 286 272 283 C256 294 232 296 211 286" fill="url(#brainDeckFill)" stroke="#2563eb" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M210 76 L210 272" fill="none" stroke="#93c5fd" stroke-width="4" stroke-linecap="round" stroke-dasharray="8 8"></path>
        <path d="M150 88 C122 98 112 124 122 146 C108 166 112 190 130 204" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"></path>
        <path d="M186 96 C162 108 154 130 164 150 C152 170 156 192 172 206" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"></path>
        <path d="M270 88 C298 98 308 124 298 146 C312 166 308 190 290 204" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"></path>
        <path d="M234 96 C258 108 266 130 256 150 C268 170 264 192 248 206" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"></path>
        <path d="M140 224 C160 238 182 244 206 246" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"></path>
        <path d="M280 224 C260 238 238 244 214 246" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"></path>
      </svg>
      <div style="position:absolute;left:50%;bottom:10%;width:62%;transform:translateX(-50%);padding:14px 16px;border-radius:22px;background:rgba(255,255,255,.94);border:1px solid rgba(191,219,254,.92);box-shadow:0 16px 28px rgba(20,61,122,.1);text-align:center">
        <div style="color:#2563eb;font-size:12px;font-weight:800;letter-spacing:.08em">${brainTag}</div>
        <div style="margin-top:6px;color:#143d7a;font-size:25px;font-weight:800;line-height:1.18">${brainTitle}</div>
        <div style="margin-top:6px;color:#64748b;font-size:13px;line-height:1.45">${brainText}</div>
      </div>
    </div>
    ${cards}
  </div>`;
}

function renderProfileIntro(slide: Slide): string {
  const rawSlide = slide as any;
  const rawPhoto =
    rawSlide.photo && typeof rawSlide.photo === "object" && !Array.isArray(rawSlide.photo)
      ? rawSlide.photo
      : rawSlide.image && typeof rawSlide.image === "object" && !Array.isArray(rawSlide.image)
        ? rawSlide.image
        : {};
  const photoSrc = escapeHtml(toText(rawPhoto.src) || toText(rawPhoto.url));
  const photoAlt = escapeHtml(toText(rawPhoto.alt) || toText(rawSlide.title) || "profile photo");
  const photoCaption = escapeHtml(toText(rawPhoto.caption));

  const rawProfile =
    rawSlide.profile && typeof rawSlide.profile === "object" && !Array.isArray(rawSlide.profile) ? rawSlide.profile : {};
  const name = escapeHtml(toText(rawProfile.name) || "姓名 Name");
  const role = escapeHtml(toText(rawProfile.role) || "职位 / Role");
  const summary = escapeHtml(
    toText(rawProfile.summary) || "用一段简短的话概括个人背景、职责和核心价值。"
  );
  const organization = escapeHtml(toText(rawProfile.organization));
  const location = escapeHtml(toText(rawProfile.location));
  const tags = (Array.isArray(rawProfile.tags) && rawProfile.tags.length ? rawProfile.tags : rawSlide.tags ?? [])
    .filter((tag: unknown) => typeof tag === "string" && tag.trim())
    .slice(0, 6)
    .map((tag: string) => `<div style="padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.14);color:#fff;font-size:12px;font-weight:700">${escapeHtml(tag)}</div>`)
    .join("");
  const facts = [organization, location]
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (fact) =>
        `<div style="padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.16);color:rgba(255,255,255,.92);font-size:12px;font-weight:700">${fact}</div>`
    )
    .join("");

  const rawSections: unknown[] = Array.isArray(rawSlide.sections)
    ? rawSlide.sections
    : Array.isArray(rawSlide.blocks)
      ? rawSlide.blocks
      : [];
  const sections = rawSections
    .slice(0, 4)
    .map((section: unknown, index: number) => {
      const record =
        typeof section === "string"
          ? { title: `模块 ${index + 1}`, text: section }
          : section && typeof section === "object" && !Array.isArray(section)
            ? (section as Record<string, unknown>)
            : {};
      const label = escapeHtml(toText(record.label) || `PART ${String(index + 1).padStart(2, "0")}`);
      const title = escapeHtml(toText(record.title) || `模块 ${index + 1}`);
      const text = escapeHtml(toText(record.text));
      const items = Array.isArray(record.items)
        ? record.items
            .map((item: unknown) => toText(item))
            .filter(Boolean)
            .slice(0, 4)
            .map(
              (item: string) =>
                `<div style="padding:9px 12px;border-radius:14px;background:rgba(29,111,232,.06);color:#334155;font-size:12px;line-height:1.45">${escapeHtml(item)}</div>`
            )
            .join("")
        : "";
      return `<div style="min-width:0;padding:16px 16px 14px;border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.98) 0%,rgba(248,251,255,.98) 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 16px 28px rgba(20,61,122,.08)">
        <div style="display:inline-flex;min-height:24px;align-items:center;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d4ed8;font-size:11px;font-weight:800;letter-spacing:.08em">${label}</div>
        <div style="margin-top:10px;color:#143d7a;font-size:20px;font-weight:800;line-height:1.2">${title}</div>
        ${text ? `<div style="margin-top:8px;color:#475569;font-size:13px;line-height:1.55">${text}</div>` : ""}
        ${items ? `<div style="margin-top:12px;display:grid;gap:8px">${items}</div>` : ""}
      </div>`;
    })
    .join("");

  const placeholder = `<div style="position:absolute;inset:0;overflow:hidden">
    <div style="position:absolute;inset:8% 10% auto;height:56%;border-radius:999px;background:radial-gradient(circle, rgba(255,255,255,.72) 0%, rgba(255,255,255,.08) 68%, transparent 74%)"></div>
    <div style="position:absolute;left:50%;bottom:18%;width:54%;height:58%;transform:translateX(-50%)">
      <div style="width:32%;aspect-ratio:1;margin:0 auto;border-radius:999px;background:rgba(255,255,255,.78);box-shadow:0 12px 24px rgba(20,61,122,.08)"></div>
      <div style="width:88%;height:68%;margin:8% auto 0;border-radius:42% 42% 18% 18%;background:rgba(255,255,255,.78);box-shadow:0 12px 24px rgba(20,61,122,.08)"></div>
    </div>
    <div style="position:absolute;inset:auto -12% -16% auto;width:58%;height:34%;background-image:linear-gradient(rgba(255,255,255,.22) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.22) 1px, transparent 1px);background-size:28px 28px;transform:rotate(-12deg)"></div>
  </div>`;

  return `<div style="height:100%;min-height:0;display:grid;grid-template-columns:minmax(300px,.92fr) minmax(0,1.08fr);gap:18px">
    <div style="display:grid;grid-template-rows:minmax(0,1fr) auto;gap:12px;min-width:0;min-height:0">
      <div style="position:relative;min-height:0;border-radius:30px;overflow:hidden;background:radial-gradient(circle at top right, rgba(77,160,255,.24), transparent 30%),linear-gradient(180deg,#eef4fb 0%,#dfeaf7 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 22px 36px rgba(20,61,122,.1)">
        ${photoSrc ? `<img src="${photoSrc}" alt="${photoAlt}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />` : placeholder}
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.06) 0%, rgba(15,23,42,.42) 100%)"></div>
        <div style="position:absolute;left:22px;right:22px;bottom:22px;z-index:1;padding:18px 20px;border-radius:24px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(8px)">
          <div style="display:inline-flex;align-items:center;min-height:28px;padding:0 12px;border-radius:999px;background:rgba(255,255,255,.22);color:#fff;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">Profile</div>
          <div style="margin-top:10px;color:#fff;font-size:28px;font-weight:800;line-height:1.18">${name}</div>
          <div style="margin-top:6px;color:rgba(255,255,255,.88);font-size:15px;line-height:1.5">${role}</div>
        </div>
      </div>
      ${photoCaption ? `<div style="padding:0 4px;color:#64748b;font-size:12px;line-height:1.55">${photoCaption}</div>` : ""}
    </div>
    <div style="display:grid;grid-template-rows:auto minmax(0,1fr);gap:14px;min-width:0;min-height:0">
      <div style="padding:22px 24px;border-radius:28px;background:linear-gradient(135deg,#1f4f97 0%,#123b7a 100%);color:#fff;box-shadow:0 20px 34px rgba(18,59,122,.16)">
        <div style="font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.72)">Introduction</div>
        <div style="margin-top:10px;font-size:28px;font-weight:800;line-height:1.15">${name}</div>
        <div style="margin-top:6px;color:rgba(255,255,255,.84);font-size:15px;line-height:1.5">${role}</div>
        <div style="margin-top:10px;color:rgba(255,255,255,.88);font-size:14px;line-height:1.65">${summary}</div>
        ${facts ? `<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:14px">${facts}</div>` : ""}
        ${tags ? `<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:12px">${tags}</div>` : ""}
      </div>
      <div style="min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px">${sections}</div>
    </div>
  </div>`;
}

function renderChipExplainer(slide: Slide): string {
  const rawSlide = slide as any;
  const rawChip =
    rawSlide.chip && typeof rawSlide.chip === "object" && !Array.isArray(rawSlide.chip)
      ? rawSlide.chip
      : rawSlide.center && typeof rawSlide.center === "object" && !Array.isArray(rawSlide.center)
        ? rawSlide.center
        : {};
  const chipTag = escapeHtml(toText(rawChip.tag) || "CHIP");
  const chipTitle = escapeHtml(toText(rawChip.title) || "智能芯片");
  const chipText = escapeHtml(
    toText(rawChip.text) || "作为统一算力与规则中枢，向四个方向分发能力、接口与协同机制。"
  );

  const rawItems: unknown[] = Array.isArray(rawSlide.items)
    ? rawSlide.items
    : Array.isArray(rawSlide.points)
      ? rawSlide.points
      : Array.isArray(rawSlide.blocks)
        ? rawSlide.blocks
        : [];
  if (!rawItems.length) return "";

  const presets = [
    { cardX: 50, cardY: 14, dotX: 50, dotY: 32, align: "center" },
    { cardX: 83, cardY: 50, dotX: 67, dotY: 50, align: "left" },
    { cardX: 50, cardY: 86, dotX: 50, dotY: 68, align: "center" },
    { cardX: 17, cardY: 50, dotX: 33, dotY: 50, align: "right" }
  ] as const;
  const source = rawItems.slice(0, 4);
  const connector = (preset: (typeof presets)[number]) => {
    const cx = 50;
    const cy = 50;
    const mx = preset.align === "center" ? 50 : (cx + preset.dotX) / 2;
    const my = preset.align === "center" ? (cy + preset.dotY) / 2 : 50;
    return `M ${cx} ${cy} Q ${mx} ${my} ${preset.dotX} ${preset.dotY}`;
  };
  const lines = source
    .map((_, index) => {
      const preset = presets[index];
      return `<path d="${connector(preset)}" fill="none" stroke="url(#chipDeckStroke)" stroke-width="0.72" stroke-linecap="round" stroke-dasharray="1.9 1.5" opacity=".88"></path>
      <circle cx="${preset.dotX}" cy="${preset.dotY}" r="1.7" fill="#fff" stroke="#2563eb" stroke-width=".7"></circle>`;
    })
    .join("");
  const cards = source
    .map((item: unknown, index: number) => {
      const preset = presets[index];
      const record =
        typeof item === "string"
          ? { title: item }
          : item && typeof item === "object" && !Array.isArray(item)
            ? (item as Record<string, unknown>)
            : {};
      const tag = escapeHtml(toText(record.tag));
      const title = escapeHtml(toText(record.title ?? record.name ?? `模块 ${index + 1}`));
      const text = escapeHtml(
        toText(record.text) ||
          (Array.isArray(record.bullets)
            ? record.bullets
                .map((bullet: unknown) => toText(bullet))
                .filter(Boolean)
                .slice(0, 2)
                .join(" / ")
            : "")
      );
      const transform =
        preset.align === "left"
          ? "translate(0,-50%)"
          : preset.align === "right"
            ? "translate(-100%,-50%)"
            : "translate(-50%,-50%)";
      return `<div style="position:absolute;left:${preset.cardX}%;top:${preset.cardY}%;transform:${transform};width:25%;min-width:178px;max-width:248px;min-height:88px;padding:16px 18px;border-radius:22px;background:rgba(255,255,255,.97);border:1px solid rgba(215,227,244,.96);box-shadow:0 16px 28px rgba(20,61,122,.08);overflow:hidden;text-align:${preset.align === "center" ? "center" : "left"}">
        <div style="position:absolute;inset:0 auto 0 0;width:7px;background:linear-gradient(180deg,#60a5fa 0%,#2563eb 100%)"></div>
        ${tag ? `<div style="position:relative;margin-left:${preset.align === "center" ? "0" : "10px"};color:#2563eb;font-size:11px;font-weight:800;letter-spacing:.08em">${tag}</div>` : ""}
        <div style="position:relative;margin-top:8px;margin-left:${preset.align === "center" ? "0" : "10px"};color:#143d7a;font-size:20px;font-weight:800;line-height:1.2">${title}</div>
        ${text ? `<div style="position:relative;margin-top:8px;margin-left:${preset.align === "center" ? "0" : "10px"};color:#475569;font-size:13px;line-height:1.45">${text}</div>` : ""}
      </div>`;
    })
    .join("");

  const topPins = Array.from({ length: 6 }, () => `<span style="display:block;height:10px;border-radius:999px;background:linear-gradient(180deg,#60a5fa 0%,#2563eb 100%);box-shadow:0 6px 10px rgba(20,61,122,.12)"></span>`).join("");
  const sidePins = Array.from({ length: 6 }, () => `<span style="display:block;width:10px;border-radius:999px;background:linear-gradient(180deg,#60a5fa 0%,#2563eb 100%);box-shadow:0 6px 10px rgba(20,61,122,.12)"></span>`).join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.14), transparent 28%),linear-gradient(180deg,#f8fbff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
      <defs>
        <linearGradient id="chipDeckStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#93c5fd"></stop>
          <stop offset="100%" stop-color="#2563eb"></stop>
        </linearGradient>
      </defs>
      ${lines}
    </svg>
    <div style="position:absolute;left:50%;top:50%;width:40%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:36px;background:radial-gradient(circle, rgba(147,197,253,.22) 0%, rgba(147,197,253,.08) 54%, transparent 74%)"></div>
    <div style="position:absolute;left:50%;top:50%;width:30%;aspect-ratio:1;min-width:230px;max-width:330px;transform:translate(-50%,-50%)">
      <div style="position:absolute;left:24%;right:24%;top:2%;display:grid;grid-template-columns:repeat(6,1fr);gap:8px">${topPins}</div>
      <div style="position:absolute;left:24%;right:24%;bottom:2%;display:grid;grid-template-columns:repeat(6,1fr);gap:8px">${topPins}</div>
      <div style="position:absolute;top:24%;bottom:24%;right:2%;display:grid;grid-template-rows:repeat(6,1fr);gap:8px">${sidePins}</div>
      <div style="position:absolute;top:24%;bottom:24%;left:2%;display:grid;grid-template-rows:repeat(6,1fr);gap:8px">${sidePins}</div>
      <div style="position:absolute;inset:12%;border-radius:28px;background:linear-gradient(180deg,rgba(255,255,255,.98) 0%,rgba(244,248,255,.98) 100%);border:1px solid rgba(191,219,254,.96);box-shadow:0 22px 36px rgba(20,61,122,.12);display:grid;align-content:center;justify-items:center;gap:8px;padding:18px 20px;text-align:center;overflow:hidden">
        <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(191,219,254,.18) 1px, transparent 1px),linear-gradient(90deg, rgba(191,219,254,.18) 1px, transparent 1px);background-size:18px 18px"></div>
        <div style="position:relative;padding:4px 10px;border-radius:999px;background:rgba(37,99,235,.1);color:#2563eb;font-size:12px;font-weight:800;letter-spacing:.08em">${chipTag}</div>
        <div style="position:relative;color:#143d7a;font-size:28px;font-weight:800;line-height:1.15">${chipTitle}</div>
        <div style="position:relative;max-width:210px;color:#64748b;font-size:14px;line-height:1.45">${chipText}</div>
      </div>
    </div>
    ${cards}
  </div>`;
}

function renderDevelopmentRoute(slide: Slide): string {
  const rawSlide = slide as any;
  const rawStages: unknown[] = Array.isArray(rawSlide.stages)
    ? rawSlide.stages
    : Array.isArray(rawSlide.items)
      ? rawSlide.items
      : Array.isArray(rawSlide.blocks)
        ? rawSlide.blocks
        : [];
  if (!rawStages.length) return "";

  const positions = [
    { nodeX: 18, nodeY: 74, cardX: 8, cardY: 78 },
    { nodeX: 36, nodeY: 59, cardX: 24, cardY: 34 },
    { nodeX: 55, nodeY: 47, cardX: 44, cardY: 56 },
    { nodeX: 73, nodeY: 31, cardX: 62, cardY: 8 },
    { nodeX: 86, nodeY: 18, cardX: 70, cardY: 54 }
  ] as const;

  const rawDestination =
    rawSlide.destination && typeof rawSlide.destination === "object" && !Array.isArray(rawSlide.destination)
      ? rawSlide.destination
      : rawSlide.goal && typeof rawSlide.goal === "object" && !Array.isArray(rawSlide.goal)
        ? rawSlide.goal
        : {};
  const destinationTitle = escapeHtml(toText(rawDestination.title) || "目标状态");
  const destinationText = escapeHtml(
    toText(rawDestination.text) || toText(rawSlide.summary) || "形成清晰的发展路径、阶段目标与组织支撑能力。"
  );
  const baseLabel = escapeHtml(toText(rawSlide.base_label) || "当前基础");

  const stageCards = rawStages
    .slice(0, 5)
    .map((item: unknown, index: number) => {
      const preset = positions[index] ?? positions[0];
      const record =
        typeof item === "string"
          ? { title: item, phase: `阶段 ${index + 1}` }
          : item && typeof item === "object" && !Array.isArray(item)
            ? (item as Record<string, unknown>)
            : {};
      const phase = escapeHtml(toText(record.phase) || `阶段 ${index + 1}`);
      const title = escapeHtml(toText(record.title ?? record.name ?? `阶段 ${index + 1}`));
      const text = escapeHtml(toText(record.text));
      return `<div style="position:absolute;left:${preset.nodeX}%;top:${preset.nodeY}%;transform:translate(-50%,-50%)">
        <div style="width:60px;height:60px;display:grid;place-items:center;border-radius:999px;background:linear-gradient(180deg,#fff 0%,#edf4ff 100%);border:6px solid #1d6fe8;box-shadow:0 16px 30px rgba(20,61,122,.12)">
          <div style="width:34px;height:34px;display:grid;place-items:center;border-radius:999px;background:rgba(29,111,232,.08);color:#143d7a;font-size:16px;font-weight:800">${index + 1}</div>
        </div>
        <div style="position:absolute;left:${preset.cardX}%;top:${preset.cardY}%;width:214px;padding:14px 16px;border-radius:20px;background:rgba(255,255,255,.96);border:1px solid rgba(215,227,244,.96);box-shadow:0 14px 28px rgba(20,61,122,.1)">
          <div style="display:inline-flex;align-items:center;min-height:24px;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d4ed8;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">${phase}</div>
          <div style="margin-top:8px;color:#143d7a;font-size:18px;font-weight:800;line-height:1.35">${title}</div>
          ${text ? `<div style="margin-top:6px;color:#475569;font-size:13px;line-height:1.55">${text}</div>` : ""}
        </div>
      </div>`;
    })
    .join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.16), transparent 34%),linear-gradient(180deg,#f7faff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96)">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
      <defs>
        <linearGradient id="developmentRouteStroke" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stop-color="#8fbaf4"></stop>
          <stop offset="100%" stop-color="#1d6fe8"></stop>
        </linearGradient>
      </defs>
      <path d="M10 80 C20 74 24 68 30 63 C38 56 44 52 49 49 C56 43 62 37 68 33 C74 28 81 22 90 14" fill="none" stroke="url(#developmentRouteStroke)" stroke-width="6" stroke-linecap="round"></path>
      <path d="M10 80 C20 74 24 68 30 63 C38 56 44 52 49 49 C56 43 62 37 68 33 C74 28 81 22 90 14" fill="none" stroke="#bfdbfe" stroke-width="1.1" stroke-dasharray="1.6 1.9" stroke-linecap="round"></path>
    </svg>
    <div style="position:absolute;left:8%;bottom:10%;width:140px;padding:14px 16px;border-radius:22px;background:rgba(255,255,255,.96);border:1px solid rgba(215,227,244,.96);box-shadow:0 14px 28px rgba(20,61,122,.08)">
      <div style="display:inline-flex;align-items:center;min-height:24px;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d4ed8;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">START</div>
      <div style="margin-top:8px;color:#143d7a;font-size:18px;font-weight:800;line-height:1.3">${baseLabel}</div>
    </div>
    ${stageCards}
    <div style="position:absolute;right:5%;top:8%;width:250px;padding:18px 18px 16px;border-radius:24px;background:linear-gradient(135deg,#1f4f97 0%,#123b7a 100%);color:#fff;box-shadow:0 18px 34px rgba(18,59,122,.16)">
      <div style="width:54px;height:54px;display:grid;place-items:center;border-radius:999px;background:rgba(255,255,255,.12)">
        <span style="width:24px;height:24px;border-radius:999px 999px 2px 999px;background:#fff;transform:rotate(45deg)"></span>
      </div>
      <div style="display:inline-flex;align-items:center;min-height:24px;padding:0 10px;border-radius:999px;background:rgba(255,255,255,.14);color:#fff;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-top:12px">Destination</div>
      <div style="margin-top:8px;color:#fff;font-size:18px;font-weight:800;line-height:1.35">${destinationTitle}</div>
      <div style="margin-top:6px;color:rgba(255,255,255,.84);font-size:13px;line-height:1.55">${destinationText}</div>
    </div>
  </div>`;
}

function renderCycleExplainer(slide: Slide): string {
  const rawSlide = slide as any;
  const rawCenter =
    rawSlide.center && typeof rawSlide.center === "object" && !Array.isArray(rawSlide.center)
      ? rawSlide.center
      : {};
  const centerTag = escapeHtml(toText(rawCenter.tag) || "CYCLE");
  const centerTitle = escapeHtml(toText(rawCenter.title) || "核心闭环");
  const centerText = escapeHtml(
    toText(rawCenter.text) || "把关键动作组织成持续迭代、持续优化的循环机制。"
  );

  const rawItems: unknown[] = Array.isArray(rawSlide.items)
    ? rawSlide.items
    : Array.isArray(rawSlide.steps)
      ? rawSlide.steps
      : Array.isArray(rawSlide.blocks)
        ? rawSlide.blocks
        : [];
  if (!rawItems.length) return "";

  const source = rawItems.slice(0, 6);
  const count = Math.max(source.length, 1);
  const nodes = source
    .map((item: unknown, index: number) => {
      const angle = (-90 + (360 / count) * index) * (Math.PI / 180);
      const x = 50 + 34 * Math.cos(angle);
      const y = 50 + 34 * Math.sin(angle);
      const cardX = 50 + 51 * Math.cos(angle);
      const cardY = 50 + 51 * Math.sin(angle);
      const isLeft = x < 46;
      const isRight = x > 54;
      const isTop = y < 44;
      let transform = "translate(-50%,-50%)";
      if (isLeft) transform = "translate(-100%,-50%)";
      if (isRight) transform = "translate(0,-50%)";
      if (!isLeft && !isRight && isTop) transform = "translate(-50%,-100%)";
      if (!isLeft && !isRight && !isTop) transform = "translate(-50%,0)";

      const record =
        typeof item === "string"
          ? { title: item, tag: `0${index + 1}`.slice(-2) }
          : item && typeof item === "object" && !Array.isArray(item)
            ? (item as Record<string, unknown>)
            : {};
      const tag = escapeHtml(toText(record.tag) || `0${index + 1}`.slice(-2));
      const title = escapeHtml(toText(record.title ?? record.name ?? `环节 ${index + 1}`));
      const text = escapeHtml(toText(record.text));
      const mx = (50 + x) / 2;
      const my = (50 + y) / 2;
      return {
        x,
        y,
        cardX,
        cardY,
        transform,
        tag,
        title,
        text,
        path: `M 50 50 Q ${mx} ${my} ${x} ${y}`
      };
    });

  const lines = nodes
    .map(
      (node) =>
        `<path d="${node.path}" fill="none" stroke="#bfdbfe" stroke-width="0.8" stroke-dasharray="1.6 1.8" stroke-linecap="round"></path>`
    )
    .join("");
  const dots = nodes
    .map(
      (node) =>
        `<div style="position:absolute;left:${node.x}%;top:${node.y}%;transform:translate(-50%,-50%)"><div style="width:52px;height:52px;display:grid;place-items:center;border-radius:999px;background:#fff;border:6px solid #1d6fe8;box-shadow:0 14px 28px rgba(20,61,122,.12);color:#143d7a;font-size:14px;font-weight:800">${node.tag}</div></div>`
    )
    .join("");
  const cards = nodes
    .map(
      (node) =>
        `<div style="position:absolute;left:${node.cardX}%;top:${node.cardY}%;transform:${node.transform};width:180px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,.96);border:1px solid rgba(215,227,244,.96);box-shadow:0 14px 28px rgba(20,61,122,.1)">
          <div style="color:#143d7a;font-size:15px;font-weight:800;line-height:1.35">${node.title}</div>
          ${node.text ? `<div style="margin-top:6px;color:#475569;font-size:12px;line-height:1.5">${node.text}</div>` : ""}
        </div>`
    )
    .join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.16), transparent 34%),linear-gradient(180deg,#f7faff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
      <defs>
        <linearGradient id="cycleDeckStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1f4f97"></stop>
          <stop offset="100%" stop-color="#1d6fe8"></stop>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="29" fill="none" stroke="#dbeafe" stroke-width="10"></circle>
      <circle cx="50" cy="50" r="29" fill="none" stroke="url(#cycleDeckStroke)" stroke-width="4.8" stroke-dasharray="12 8"></circle>
      ${lines}
    </svg>
    <div style="position:absolute;left:50%;top:50%;width:min(34%,280px);min-width:220px;transform:translate(-50%,-50%);padding:18px 20px;border-radius:24px;background:rgba(255,255,255,.94);border:1px solid rgba(215,227,244,.96);box-shadow:0 18px 36px rgba(20,61,122,.1);text-align:center">
      <div style="display:inline-flex;align-items:center;min-height:24px;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d4ed8;font-size:11px;font-weight:800;letter-spacing:.08em">${centerTag}</div>
      <div style="margin-top:10px;color:#143d7a;font-size:24px;font-weight:800;line-height:1.3">${centerTitle}</div>
      <div style="margin-top:8px;color:#475569;font-size:13px;line-height:1.55">${centerText}</div>
    </div>
    ${dots}
    ${cards}
  </div>`;
}

function renderSwimlaneBoard(slide: Slide): string {
  const rawSlide = slide as any;
  const rawLanes: unknown[] = Array.isArray(rawSlide.lanes) ? rawSlide.lanes.slice(0, 4) : [];
  if (!rawLanes.length) return "";

  const lanes = rawLanes
    .map((lane: unknown, laneIndex: number) => {
      const record = lane && typeof lane === "object" && !Array.isArray(lane) ? (lane as Record<string, unknown>) : {};
      const name = escapeHtml(toText(record.name ?? `泳道 ${laneIndex + 1}`));
      const note = escapeHtml(toText(record.note));
      const items: unknown[] = Array.isArray(record.items) ? record.items.slice(0, 4) : [];
      const cards = items
        .map((item: unknown, itemIndex: number) => {
          const cell =
            typeof item === "string"
              ? { title: item }
              : item && typeof item === "object" && !Array.isArray(item)
                ? (item as Record<string, unknown>)
                : {};
          const tag = escapeHtml(toText(cell.tag));
          const title = escapeHtml(toText(cell.title ?? `动作 ${itemIndex + 1}`));
          const text = escapeHtml(toText(cell.text));
          return `<div style="align-self:center;min-width:0;min-height:88px;padding:16px 18px;border-radius:22px;background:rgba(255,255,255,.96);border:1px solid rgba(215,227,244,.96);box-shadow:0 18px 30px rgba(20,61,122,.08)">
            ${tag ? `<div style="color:#1d6fe8;font-size:13px;font-weight:800;letter-spacing:.04em">${tag}</div>` : ""}
            <div style="margin-top:${tag ? "8px" : "0"};color:#143d7a;font-size:18px;font-weight:800;line-height:1.25">${title}</div>
            ${text ? `<div style="margin-top:6px;color:#475569;font-size:14px;line-height:1.45">${text}</div>` : ""}
          </div>`;
        })
        .join("");
      return `<div style="display:grid;grid-template-columns:228px minmax(0,1fr);gap:16px;min-height:0">
        <div style="position:relative;min-height:0;padding:18px 20px 18px 30px;border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.98) 0%,rgba(248,251,255,.98) 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 18px 34px rgba(20,61,122,.08)">
          <div style="position:absolute;left:0;top:18px;bottom:18px;width:14px;border-radius:999px;background:linear-gradient(180deg,#4da0ff 0%,#1d6fe8 100%)"></div>
          <div style="display:inline-grid;place-items:center;min-width:56px;padding:5px 12px;border-radius:999px;background:linear-gradient(135deg,#4da0ff 0%,#1d6fe8 100%);color:#fff;font-size:14px;font-weight:800">${String(laneIndex + 1).padStart(2, "0")}</div>
          <div style="margin-top:14px;color:#143d7a;font-size:22px;font-weight:800;line-height:1.2">${name}</div>
          ${note ? `<div style="margin-top:8px;color:#64748b;font-size:14px;line-height:1.5">${note}</div>` : ""}
        </div>
        <div style="position:relative;min-width:0;min-height:0;overflow:hidden;padding:18px 0;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.12), transparent 28%),linear-gradient(180deg,#f8fbff 0%,#f3f8ff 100%);border:1px solid rgba(215,227,244,.96)">
          <div style="position:absolute;left:28px;right:28px;top:50%;height:8px;border-radius:999px;background:rgba(188,212,245,.88);transform:translateY(-50%)"></div>
          <div style="position:relative;z-index:1;display:grid;gap:14px;min-height:100%;padding:0 28px;grid-template-columns:repeat(${Math.max(items.length, 1)}, minmax(0,1fr))">${cards}</div>
        </div>
      </div>`;
    })
    .join("");

  return `<div style="height:100%;min-height:0;display:grid;grid-template-rows:repeat(${Math.max(rawLanes.length, 1)},minmax(0,1fr));gap:14px">${lanes}</div>`;
}

function renderKanbanBoard(slide: Slide): string {
  const rawSlide = slide as any;
  const rawColumns: unknown[] = Array.isArray(rawSlide.columns) ? rawSlide.columns.slice(0, 4) : [];
  if (!rawColumns.length) return "";

  const iconGlyph = (icon: unknown, index: number): string => {
    const key = typeof icon === "string" ? icon : "";
    const map: Record<string, string> = {
      todo: "○",
      doing: "◐",
      review: "◇",
      done: "✓"
    };
    return map[key] ?? ["○", "◐", "◇", "✓"][index % 4];
  };

  const progressText = (value: unknown): string => {
    if (typeof value === "number") return `${value}%`;
    if (typeof value === "string") return value;
    return "";
  };

  const columns = rawColumns
    .map((column: unknown, columnIndex: number) => {
      const record =
        column && typeof column === "object" && !Array.isArray(column) ? (column as Record<string, unknown>) : {};
      const title = escapeHtml(toText(record.title ?? `列 ${columnIndex + 1}`));
      const icon = escapeHtml(iconGlyph(record.icon, columnIndex));
      const cardsRaw: unknown[] = Array.isArray(record.cards) ? record.cards.slice(0, 4) : [];
      const cards = cardsRaw
        .map((card: unknown, cardIndex: number) => {
          const item =
            card && typeof card === "object" && !Array.isArray(card) ? (card as Record<string, unknown>) : {};
          const owner = escapeHtml(toText(item.owner) || "负责人待补充");
          const task = escapeHtml(toText(item.task ?? item.title ?? `任务 ${cardIndex + 1}`));
          const progress = escapeHtml(progressText(item.progress));
          const due = escapeHtml(toText(item.due));
          const note = escapeHtml(toText(item.note));
          return `<div style="display:grid;gap:8px;padding:14px 14px 12px;border-radius:18px;background:rgba(255,255,255,.98);border:1px solid rgba(215,227,244,.88);box-shadow:0 14px 24px rgba(20,61,122,.07)">
            <div style="display:flex;align-items:center;gap:8px;min-width:0">
              <div style="width:10px;height:10px;flex:none;border-radius:999px;background:#4da0ff;box-shadow:0 0 0 4px rgba(77,160,255,.2)"></div>
              <div style="min-width:0;color:#64748b;font-size:12px;font-weight:700;line-height:1.35">${owner}</div>
            </div>
            <div style="color:#0f172a;font-size:14px;font-weight:700;line-height:1.5">${task}</div>
            <div style="display:grid;gap:6px;font-size:12px;line-height:1.45;font-weight:700">
              ${progress ? `<div style="color:#1d6fe8">进度：${progress}</div>` : ""}
              ${due ? `<div style="color:#64748b">截止：${due}</div>` : ""}
            </div>
            ${note ? `<div style="color:#64748b;font-size:12px;line-height:1.5">${note}</div>` : ""}
          </div>`;
        })
        .join("");

      return `<div style="min-width:0;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr);gap:10px;padding:10px;border-radius:26px;background:linear-gradient(180deg,rgba(255,255,255,.96) 0%,rgba(244,248,255,.98) 100%);border:1px solid rgba(215,227,244,.8)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-radius:18px;background:linear-gradient(180deg,rgba(44,122,229,.92) 0%,rgba(20,61,122,.92) 100%);color:#fff;box-shadow:0 18px 30px rgba(20,61,122,.12)">
          <div style="font-size:18px;font-weight:800;line-height:1.25">${title}</div>
          <div style="display:grid;place-items:center;width:34px;height:34px;flex:none;border-radius:999px;background:rgba(255,255,255,.16);font-size:16px;font-weight:800">${icon}</div>
        </div>
        <div style="min-height:0;display:grid;gap:10px;align-content:start;overflow:hidden">${cards}</div>
      </div>`;
    })
    .join("");

  return `<div style="height:100%;min-height:0;display:grid;gap:16px;grid-template-columns:repeat(${Math.max(rawColumns.length, 1)},minmax(0,1fr))">${columns}</div>`;
}

function renderMonthCalendar(slide: Slide): string {
  const rawSlide = slide as any;
  const monthTitle = escapeHtml(toText(rawSlide.month) || "2026 / 08");
  const subtitle = escapeHtml(toText(rawSlide.subtitle));
  const weekdaysSource = Array.isArray(rawSlide.weekdays) && rawSlide.weekdays.length >= 7 ? rawSlide.weekdays.slice(0, 7) : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekdays = weekdaysSource
    .map(
      (item: unknown) =>
        `<div style="display:flex;align-items:center;justify-content:center;min-height:38px;border-radius:16px;background:rgba(29,111,232,.08);color:#1d6fe8;font-size:13px;font-weight:800;letter-spacing:.04em">${escapeHtml(toText(item))}</div>`
    )
    .join("");

  const toneStyle = (tone: unknown): string => {
    const key = toText(tone).toLowerCase();
    if (["green", "success"].includes(key)) return "background:rgba(22,163,74,.12);color:#15803d";
    if (["amber", "orange", "warning", "yellow"].includes(key)) return "background:rgba(245,158,11,.14);color:#b45309";
    if (["red", "danger", "alert"].includes(key)) return "background:rgba(239,68,68,.12);color:#b91c1c";
    return "background:rgba(29,111,232,.12);color:#1d4ed8";
  };

  const legendSource: unknown[] = Array.isArray(rawSlide.legend) && rawSlide.legend.length
    ? rawSlide.legend.slice(0, 4)
    : [
        { label: "关键会议", tone: "blue" },
        { label: "里程碑", tone: "amber" },
        { label: "已完成", tone: "green" },
        { label: "风险提醒", tone: "red" }
      ];
  const legend = legendSource
    .map((item: unknown) => {
      const record = item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
      return `<div style="display:inline-flex;align-items:center;gap:8px;color:#64748b;font-size:12px;font-weight:700">
        <span style="width:10px;height:10px;border-radius:999px;${toneStyle(record.tone)}"></span>
        <span>${escapeHtml(toText(record.label) || "事项")}</span>
      </div>`;
    })
    .join("");

  const rawDays: unknown[] = Array.isArray(rawSlide.days) && rawSlide.days.length ? rawSlide.days.slice(0, 35) : Array.from({ length: 35 }, (_, index) => ({
    day: index + 1,
    today: index === 11,
    events:
      index === 2
        ? [{ label: "经营周会", tone: "blue" }]
        : index === 10
          ? [{ label: "里程碑评审", tone: "amber" }, { label: "资料归档", tone: "green" }]
          : index === 18
            ? [{ label: "投产窗口", tone: "red" }]
            : index === 24
              ? [{ label: "复盘会议", tone: "green" }]
              : []
  }));

  const days = rawDays
    .map((item: unknown, index: number) => {
      const record = item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
      const rawDay = record.day ?? record.date ?? index + 1;
      const day = escapeHtml(typeof rawDay === "string" || typeof rawDay === "number" ? String(rawDay) : String(index + 1));
      const muted = Boolean(record.muted);
      const today = Boolean(record.today);
      const eventsSource: unknown[] = Array.isArray(record.events) ? record.events.slice(0, 2) : [];
      const events = eventsSource
        .map((event: unknown, eventIndex: number) => {
          const detail =
            event && typeof event === "object" && !Array.isArray(event) ? (event as Record<string, unknown>) : { label: event };
          return `<div style="min-width:0;padding:7px 8px;border-radius:12px;font-size:11px;font-weight:700;line-height:1.35;word-break:break-word;${toneStyle(detail.tone)}">${escapeHtml(
            toText(detail.label) || `事项 ${eventIndex + 1}`
          )}</div>`;
        })
        .join("");
      const moreCount = Array.isArray(record.events) && record.events.length > 2 ? record.events.length - 2 : 0;
      return `<div style="min-width:0;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr);gap:10px;padding:12px;border-radius:20px;overflow:hidden;background:${muted ? "rgba(244,247,251,.88)" : "rgba(255,255,255,.98)"};border:1px solid ${today ? "rgba(29,111,232,.52)" : "rgba(215,227,244,.92)"};box-shadow:${today ? "0 16px 26px rgba(29,111,232,.12)" : "0 12px 22px rgba(20,61,122,.06)"};opacity:${muted ? ".72" : "1"}">
        <div style="color:#143d7a;font-size:16px;font-weight:800;line-height:1">${day}</div>
        <div style="min-height:0;display:grid;align-content:start;gap:6px;overflow:hidden">
          ${events}
          ${moreCount ? `<div style="color:#64748b;font-size:11px;font-weight:700">+${moreCount}</div>` : ""}
        </div>
      </div>`;
    })
    .join("");

  return `<div style="height:100%;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr);gap:16px">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:18px 22px;border-radius:26px;background:radial-gradient(circle at top right, rgba(77,160,255,.18), transparent 32%),linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(244,248,255,.98) 100%);border:1px solid rgba(215,227,244,.88);box-shadow:0 18px 30px rgba(20,61,122,.08)">
      <div>
        <div style="display:inline-flex;align-items:center;min-height:26px;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d6fe8;font-size:12px;font-weight:800;letter-spacing:.08em">Monthly View</div>
        <div style="margin-top:10px;color:#143d7a;font-size:28px;font-weight:800;line-height:1.2">${monthTitle}</div>
        ${subtitle ? `<div style="margin-top:8px;max-width:460px;color:#64748b;font-size:13px;line-height:1.5">${subtitle}</div>` : ""}
      </div>
      <div style="display:flex;flex-wrap:wrap;justify-content:flex-end;gap:10px 14px;padding-top:4px">${legend}</div>
    </div>
    <div style="min-height:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:10px">
      ${weekdays}
      ${days}
    </div>
  </div>`;
}

function renderSymmetricSplit(slide: Slide): string {
  const rawSlide = slide as any;
  const left = asObject(rawSlide.left) ?? asObject(Array.isArray(rawSlide.columns) ? rawSlide.columns[0] : undefined) ?? {};
  const right = asObject(rawSlide.right) ?? asObject(Array.isArray(rawSlide.columns) ? rawSlide.columns[1] : undefined) ?? {};
  const centerLabel = escapeHtml(toText(rawSlide.center_label) || "VS");
  const leftTag = escapeHtml(toText(left.tag ?? "LEFT"));
  const rightTag = escapeHtml(toText(right.tag ?? "RIGHT"));
  const leftTitle = escapeHtml(toText(left.title ?? "左侧内容"));
  const rightTitle = escapeHtml(toText(right.title ?? "右侧内容"));
  const leftBody = renderContentBlock(left, "左侧内容");
  const rightBody = renderContentBlock(right, "右侧内容");

  return `<div style="position:relative;height:100%;min-height:0">
    <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none">
      <div style="position:absolute;top:10%;left:6%;width:34%;height:80%;border-radius:36px;background:radial-gradient(circle at center, rgba(77,160,255,.16), transparent 68%)"></div>
      <div style="position:absolute;top:10%;right:6%;width:34%;height:80%;border-radius:36px;background:radial-gradient(circle at center, rgba(77,160,255,.16), transparent 68%)"></div>
      <div style="position:absolute;top:6%;bottom:6%;left:50%;width:2px;transform:translateX(-50%);background:linear-gradient(180deg, transparent 0%, rgba(77,160,255,.32) 12%, rgba(29,111,232,.36) 50%, rgba(77,160,255,.32) 88%, transparent 100%)"></div>
      <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:62px;height:62px;border-radius:999px;background:linear-gradient(135deg,#4da0ff 0%,#1d6fe8 100%);color:#fff;font-size:18px;font-weight:800;box-shadow:0 18px 30px rgba(20,61,122,.16)">${centerLabel}</div>
    </div>
    <div style="position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:32px;height:100%;min-height:0;align-items:stretch">
      <section style="min-width:0;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr);gap:16px;padding:20px;border-radius:30px;background:linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(246,250,255,.98) 100%);border:1px solid rgba(215,227,244,.92);box-shadow:0 22px 38px rgba(20,61,122,.08);overflow:hidden">
        <div style="display:grid;gap:10px;padding-bottom:14px;border-bottom:1px solid rgba(215,227,244,.92)">
          <div style="display:inline-flex;align-items:center;justify-content:center;min-height:24px;width:fit-content;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d6fe8;font-size:12px;font-weight:800;letter-spacing:.08em">${leftTag}</div>
          <div style="color:#143d7a;font-size:22px;font-weight:800;line-height:1.25">${leftTitle}</div>
        </div>
        <div style="min-height:0">${leftBody}</div>
      </section>
      <section style="min-width:0;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr);gap:16px;padding:20px;border-radius:30px;background:linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(246,250,255,.98) 100%);border:1px solid rgba(215,227,244,.92);box-shadow:0 22px 38px rgba(20,61,122,.08);overflow:hidden">
        <div style="display:grid;gap:10px;padding-bottom:14px;border-bottom:1px solid rgba(215,227,244,.92);text-align:right">
          <div style="display:inline-flex;align-items:center;justify-content:center;min-height:24px;width:fit-content;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d6fe8;font-size:12px;font-weight:800;letter-spacing:.08em;margin-left:auto">${rightTag}</div>
          <div style="color:#143d7a;font-size:22px;font-weight:800;line-height:1.25">${rightTitle}</div>
        </div>
        <div style="min-height:0">${rightBody}</div>
      </section>
    </div>
  </div>`;
}

function renderPetalExplainer(slide: Slide): string {
  const rawSlide = slide as any;
  const rawItems: unknown[] = Array.isArray(rawSlide.items)
    ? rawSlide.items
    : Array.isArray(rawSlide.points)
      ? rawSlide.points
      : Array.isArray(rawSlide.blocks)
        ? rawSlide.blocks
        : [];

  const coreRecord =
    rawSlide.core && typeof rawSlide.core === "object" && !Array.isArray(rawSlide.core)
      ? (rawSlide.core as Record<string, unknown>)
      : {};
  const coreTitle = escapeHtml(toText(coreRecord.title) || toText(rawSlide.core_title) || toText(rawSlide.center_title) || "核心标题");
  const presets = [
    { left: 50, top: 22, rotate: 0, innerRotate: 0 },
    { left: 78, top: 50, rotate: 90, innerRotate: -90 },
    { left: 50, top: 78, rotate: 180, innerRotate: -180 },
    { left: 22, top: 50, rotate: -90, innerRotate: 90 }
  ];

  const petals = Array.from({ length: 4 }, (_, index) => {
    const item = rawItems[index];
    const record =
      item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
    const title = escapeHtml(toText(record.title) || toText(record.name) || `花瓣 ${index + 1}`);
    const tag = escapeHtml(toText(record.tag));
    const bullets = Array.isArray(record.bullets)
      ? record.bullets
          .map((entry: unknown) => toText(entry))
          .filter(Boolean)
          .slice(0, 2)
          .join(" / ")
      : "";
    const text = escapeHtml(toText(record.text) || bullets);
    const preset = presets[index];
    return `<div style="position:absolute;width:31%;height:34%;left:${preset.left}%;top:${preset.top}%;transform:translate(-50%,-50%) rotate(${preset.rotate}deg)">
      <div style="width:100%;height:100%;border-radius:48% 48% 42% 42% / 58% 58% 42% 42%;background:linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(241,246,255,.98) 100%);border:1px solid rgba(191,219,254,.96);box-shadow:0 20px 34px rgba(20,61,122,.1);display:grid;place-items:center;padding:18px 20px 22px">
        <div style="width:72%;display:grid;justify-items:center;align-content:center;gap:8px;text-align:center;transform:rotate(${preset.innerRotate}deg)">
          ${tag ? `<div style="display:inline-flex;align-items:center;min-height:22px;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d6fe8;font-size:11px;font-weight:800;letter-spacing:.08em">${tag}</div>` : ""}
          <div style="color:#143d7a;font-size:18px;font-weight:800;line-height:1.28">${title}</div>
          ${text ? `<div style="color:#475569;font-size:12px;line-height:1.5;word-break:break-word">${text}</div>` : ""}
        </div>
      </div>
    </div>`;
  }).join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.12), transparent 28%),linear-gradient(180deg,#f8fbff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <div style="position:absolute;left:50%;top:8%;width:26%;aspect-ratio:1;transform:translateX(-50%);border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.24) 0%, rgba(147,197,253,.1) 52%, transparent 76%)"></div>
    <div style="position:absolute;right:8%;top:50%;width:26%;aspect-ratio:1;transform:translateY(-50%);border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.24) 0%, rgba(147,197,253,.1) 52%, transparent 76%)"></div>
    <div style="position:absolute;left:50%;bottom:8%;width:26%;aspect-ratio:1;transform:translateX(-50%);border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.24) 0%, rgba(147,197,253,.1) 52%, transparent 76%)"></div>
    <div style="position:absolute;left:8%;top:50%;width:26%;aspect-ratio:1;transform:translateY(-50%);border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.24) 0%, rgba(147,197,253,.1) 52%, transparent 76%)"></div>
    ${petals}
    <div style="position:absolute;left:50%;top:50%;width:28%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.3) 0%, rgba(147,197,253,.08) 56%, transparent 78%)"></div>
    <div style="position:absolute;left:50%;top:50%;width:20%;min-width:160px;max-width:240px;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:999px;background:linear-gradient(180deg, rgba(255,255,255,.99) 0%, rgba(244,248,255,.98) 100%);border:1px solid rgba(191,219,254,.96);box-shadow:0 22px 36px rgba(20,61,122,.14);display:grid;place-items:center;padding:20px;text-align:center">
      <div style="color:#143d7a;font-size:24px;font-weight:800;line-height:1.28">${coreTitle}</div>
    </div>
  </div>`;
}

function renderFanExplainer(slide: Slide): string {
  const rawSlide = slide as any;
  const rawItems: unknown[] = Array.isArray(rawSlide.items)
    ? rawSlide.items
    : Array.isArray(rawSlide.points)
      ? rawSlide.points
      : Array.isArray(rawSlide.blocks)
        ? rawSlide.blocks
        : [];

  const coreRecord =
    rawSlide.core && typeof rawSlide.core === "object" && !Array.isArray(rawSlide.core)
      ? (rawSlide.core as Record<string, unknown>)
      : rawSlide.center && typeof rawSlide.center === "object" && !Array.isArray(rawSlide.center)
        ? (rawSlide.center as Record<string, unknown>)
        : {};
  const core = {
    title: escapeHtml(toText(coreRecord.title) || toText(rawSlide.core_title) || toText(rawSlide.center_title) || "核心主题"),
    tag: escapeHtml(toText(coreRecord.tag) || "FAN"),
    text: escapeHtml(toText(coreRecord.text) || "从一个核心主题向外展开四个关键解释模块。")
  };
  const presets = [
    { angle: -34, zIndex: 1 },
    { angle: -12, zIndex: 3 },
    { angle: 12, zIndex: 4 },
    { angle: 34, zIndex: 2 }
  ];

  const blades = Array.from({ length: 4 }, (_, index) => {
    const item = rawItems[index];
    const record =
      item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
    const title = escapeHtml(toText(record.title) || toText(record.name) || `扇面 ${index + 1}`);
    const tag = escapeHtml(toText(record.tag));
    const bullets = Array.isArray(record.bullets)
      ? record.bullets
          .map((entry: unknown) => toText(entry))
          .filter(Boolean)
          .slice(0, 2)
          .join(" / ")
      : "";
    const text = escapeHtml(toText(record.text) || bullets);
    const preset = presets[index];
    return `<div style="position:absolute;left:50%;bottom:22%;width:31%;height:56%;transform-origin:50% calc(100% + 26px);transform:translateX(-50%) rotate(${preset.angle}deg);z-index:${preset.zIndex};border-radius:56% 56% 16% 16% / 22% 22% 82% 82%;background:linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(241,246,255,.98) 100%);border:1px solid rgba(191,219,254,.96);box-shadow:0 22px 34px rgba(20,61,122,.1);overflow:hidden">
      <div style="position:absolute;left:28%;bottom:0;width:2px;height:92%;border-radius:999px;transform:rotate(6deg);transform-origin:bottom center;background:linear-gradient(180deg, rgba(191,219,254,.08) 0%, rgba(29,111,232,.22) 100%)"></div>
      <div style="position:absolute;right:28%;bottom:0;width:2px;height:92%;border-radius:999px;transform:rotate(-6deg);transform-origin:bottom center;background:linear-gradient(180deg, rgba(191,219,254,.08) 0%, rgba(29,111,232,.22) 100%)"></div>
      <div style="position:absolute;left:50%;bottom:-12%;width:10px;height:26%;transform:translateX(-50%);border-radius:999px;background:linear-gradient(180deg, rgba(77,160,255,.28) 0%, rgba(29,111,232,.42) 100%)"></div>
      <div style="width:100%;height:100%;padding:16% 16% 20%;display:grid;justify-items:center;align-content:start;gap:8px;text-align:center;transform:rotate(${-preset.angle}deg)">
        ${tag ? `<div style="display:inline-flex;align-items:center;min-height:22px;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d6fe8;font-size:11px;font-weight:800;letter-spacing:.08em">${tag}</div>` : ""}
        <div style="color:#143d7a;font-size:17px;font-weight:800;line-height:1.3">${title}</div>
        ${text ? `<div style="color:#475569;font-size:12px;line-height:1.5;word-break:break-word">${text}</div>` : ""}
      </div>
    </div>`;
  }).join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.12), transparent 28%),radial-gradient(circle at left bottom, rgba(147,197,253,.12), transparent 26%),linear-gradient(180deg,#f8fbff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <div style="position:absolute;left:7%;top:20%;width:28%;aspect-ratio:1;border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.24) 0%, rgba(147,197,253,.08) 56%, transparent 76%)"></div>
    <div style="position:absolute;right:7%;top:20%;width:28%;aspect-ratio:1;border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.24) 0%, rgba(147,197,253,.08) 56%, transparent 76%)"></div>
    ${blades}
    <div style="position:absolute;left:50%;bottom:12%;width:22%;aspect-ratio:1;transform:translateX(-50%);border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.3) 0%, rgba(147,197,253,.08) 56%, transparent 78%)"></div>
    <div style="position:absolute;left:50%;bottom:13.5%;width:24%;min-width:220px;max-width:290px;transform:translateX(-50%);padding:16px 18px 18px;border-radius:28px;background:linear-gradient(180deg, rgba(255,255,255,.99) 0%, rgba(244,248,255,.98) 100%);border:1px solid rgba(191,219,254,.96);box-shadow:0 20px 34px rgba(20,61,122,.12);display:grid;justify-items:center;gap:8px;text-align:center;z-index:6">
      <div style="display:inline-flex;align-items:center;min-height:22px;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d6fe8;font-size:11px;font-weight:800;letter-spacing:.08em">${core.tag}</div>
      <div style="color:#143d7a;font-size:22px;font-weight:800;line-height:1.28">${core.title}</div>
      <div style="color:#64748b;font-size:12px;line-height:1.5">${core.text}</div>
    </div>
    <div style="position:absolute;left:50%;bottom:-2%;width:36px;height:24%;transform:translateX(-50%);border-radius:999px;background:linear-gradient(180deg,#1d6fe8 0%,#143d7a 100%);box-shadow:0 14px 24px rgba(20,61,122,.18)"></div>
  </div>`;
}

function renderUpwardArrows(slide: Slide): string {
  const rawSlide = slide as any;
  const rawItems: unknown[] = Array.isArray(rawSlide.items)
    ? rawSlide.items
    : Array.isArray(rawSlide.steps)
      ? rawSlide.steps
      : Array.isArray(rawSlide.stages)
        ? rawSlide.stages
        : Array.isArray(rawSlide.blocks)
          ? rawSlide.blocks
          : [];
  const heights = [48, 58, 70, 82];

  const arrows = Array.from({ length: 4 }, (_, index) => {
    const item = rawItems[index];
    const record =
      item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
    const title = escapeHtml(toText(record.title) || toText(record.name) || `阶段 ${index + 1}`);
    const tag = escapeHtml(toText(record.tag) || toText(record.phase));
    const bullets = Array.isArray(record.bullets)
      ? record.bullets
          .map((entry: unknown) => toText(entry))
          .filter(Boolean)
          .slice(0, 2)
          .join(" / ")
      : "";
    const text = escapeHtml(toText(record.text) || bullets);
    return `<div style="min-width:0;height:100%;display:grid;align-items:end">
      <div style="min-width:0;height:${heights[index] ?? heights[heights.length - 1]}%;clip-path:polygon(0 100%, 0 18%, 50% 0, 100% 18%, 100% 100%);background:linear-gradient(180deg,#4da0ff 0%,#1d6fe8 100%);box-shadow:0 22px 36px rgba(29,111,232,.18);display:grid;place-items:center;padding:16% 12% 12%">
        <div style="width:100%;max-width:180px;display:grid;justify-items:center;align-content:center;gap:8px;text-align:center">
          ${tag ? `<div style="display:inline-flex;align-items:center;min-height:22px;padding:0 10px;border-radius:999px;background:rgba(255,255,255,.18);color:#fff;font-size:11px;font-weight:800;letter-spacing:.08em">${tag}</div>` : ""}
          <div style="color:#fff;font-size:18px;font-weight:800;line-height:1.3">${title}</div>
          ${text ? `<div style="color:rgba(255,255,255,.92);font-size:12px;line-height:1.5;word-break:break-word">${text}</div>` : ""}
        </div>
      </div>
    </div>`;
  }).join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.14), transparent 30%),linear-gradient(180deg,#f8fbff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <div style="position:absolute;left:8%;right:8%;bottom:9%;height:12px;border-radius:999px;background:linear-gradient(90deg, rgba(77,160,255,.22) 0%, rgba(29,111,232,.28) 100%)"></div>
    <div style="position:relative;z-index:1;height:100%;min-height:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;align-items:end;padding:10% 7% 12%">${arrows}</div>
  </div>`;
}

function renderScreenExplainer(slide: Slide): string {
  const rawSlide = slide as any;
  const screenRecord =
    rawSlide.screen && typeof rawSlide.screen === "object" && !Array.isArray(rawSlide.screen)
      ? (rawSlide.screen as Record<string, unknown>)
      : rawSlide.center && typeof rawSlide.center === "object" && !Array.isArray(rawSlide.center)
        ? (rawSlide.center as Record<string, unknown>)
        : {};
  const imageRecord =
    screenRecord.image && typeof screenRecord.image === "object" && !Array.isArray(screenRecord.image)
      ? (screenRecord.image as Record<string, unknown>)
      : rawSlide.image && typeof rawSlide.image === "object" && !Array.isArray(rawSlide.image)
        ? (rawSlide.image as Record<string, unknown>)
        : {};
  const screen = {
    tag: escapeHtml(toText(screenRecord.tag) || "SCREEN"),
    title: escapeHtml(toText(screenRecord.title) || toText(rawSlide.center_title) || "核心屏幕"),
    text: escapeHtml(
      toText(screenRecord.text) || "把核心界面、关键结论或主流程放在中心屏幕中，周围通过浮窗解释补充信息。"
    ),
    imageSrc: escapeHtml(toText(imageRecord.src) || toText(imageRecord.url)),
    imageAlt: escapeHtml(toText(imageRecord.alt) || "screen image")
  };
  const presets = [
    { left: 15, top: 20, rotate: -7 },
    { left: 85, top: 22, rotate: 6 },
    { left: 14, top: 76, rotate: 5 },
    { left: 86, top: 74, rotate: -6 }
  ];
  const rawItems: unknown[] = Array.isArray(rawSlide.items)
    ? rawSlide.items
    : Array.isArray(rawSlide.windows)
      ? rawSlide.windows
      : Array.isArray(rawSlide.blocks)
        ? rawSlide.blocks
        : [];
  const windows = Array.from({ length: 4 }, (_, index) => {
    const item = rawItems[index];
    const record =
      item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
    const tag = escapeHtml(toText(record.tag));
    const title = escapeHtml(toText(record.title) || toText(record.name) || `浮窗 ${index + 1}`);
    const bullets = Array.isArray(record.bullets)
      ? record.bullets
          .map((entry: unknown) => toText(entry))
          .filter(Boolean)
          .slice(0, 2)
          .join(" / ")
      : "";
    const text = escapeHtml(toText(record.text) || bullets);
    const preset = presets[index];
    return `<div style="position:absolute;width:24%;min-width:220px;max-width:280px;left:${preset.left}%;top:${preset.top}%;transform:translate(-50%,-50%) rotate(${preset.rotate}deg);border-radius:22px;background:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.48);box-shadow:0 22px 34px rgba(20,61,122,.12);backdrop-filter:blur(14px)">
      <div style="display:flex;gap:8px;padding:14px 16px 0"><span style="width:10px;height:10px;border-radius:999px;background:rgba(255,255,255,.28)"></span><span style="width:10px;height:10px;border-radius:999px;background:rgba(255,255,255,.28)"></span><span style="width:10px;height:10px;border-radius:999px;background:rgba(255,255,255,.28)"></span></div>
      <div style="display:grid;gap:8px;padding:12px 16px 16px">
        ${tag ? `<div style="display:inline-flex;align-items:center;min-height:24px;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d6fe8;font-size:11px;font-weight:800;letter-spacing:.08em">${tag}</div>` : ""}
        <div style="color:#143d7a;font-size:17px;font-weight:800;line-height:1.3">${title}</div>
        ${text ? `<div style="color:#475569;font-size:12px;line-height:1.55;word-break:break-word">${text}</div>` : ""}
      </div>
    </div>`;
  }).join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.14), transparent 30%),linear-gradient(180deg,#f8fbff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <div style="position:absolute;right:4%;top:4%;width:28%;aspect-ratio:1;border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.22) 0%, rgba(147,197,253,.08) 54%, transparent 76%)"></div>
    <div style="position:absolute;left:6%;bottom:2%;width:28%;aspect-ratio:1;border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.22) 0%, rgba(147,197,253,.08) 54%, transparent 76%)"></div>
    <div style="position:absolute;left:50%;top:54%;width:44%;max-width:560px;min-width:420px;transform:translate(-50%,-50%)">
      <div style="border-radius:28px;background:linear-gradient(180deg,#163b76 0%,#0f274f 100%);padding:12px 12px 16px;box-shadow:0 28px 42px rgba(15,39,79,.22)">
        <div style="display:flex;gap:8px;padding:0 4px 10px"><span style="width:10px;height:10px;border-radius:999px;background:rgba(255,255,255,.28)"></span><span style="width:10px;height:10px;border-radius:999px;background:rgba(255,255,255,.28)"></span><span style="width:10px;height:10px;border-radius:999px;background:rgba(255,255,255,.28)"></span></div>
        <div style="min-height:280px;border-radius:18px;overflow:hidden;background:linear-gradient(180deg,#f8fbff 0%,#edf4ff 100%);border:1px solid rgba(191,219,254,.9)">
          ${
            screen.imageSrc
              ? `<img src="${screen.imageSrc}" alt="${screen.imageAlt}" style="width:100%;height:100%;object-fit:cover" />`
              : `<div style="position:relative;min-height:280px;height:100%;display:grid;align-content:center;justify-items:center;gap:10px;padding:24px 30px;text-align:center;overflow:hidden">
                  <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(191,219,254,.22) 1px, transparent 1px),linear-gradient(90deg, rgba(191,219,254,.22) 1px, transparent 1px);background-size:22px 22px"></div>
                  <div style="position:relative;z-index:1;display:inline-flex;align-items:center;min-height:24px;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d6fe8;font-size:11px;font-weight:800;letter-spacing:.08em">${screen.tag}</div>
                  <div style="position:relative;z-index:1;color:#143d7a;font-size:28px;font-weight:800;line-height:1.25">${screen.title}</div>
                  <div style="position:relative;z-index:1;max-width:82%;color:#475569;font-size:14px;line-height:1.6">${screen.text}</div>
                </div>`
          }
        </div>
      </div>
      <div style="width:132px;height:18px;margin:14px auto 0;border-radius:999px;background:linear-gradient(180deg, rgba(29,111,232,.24) 0%, rgba(29,111,232,.08) 100%)"></div>
    </div>
    ${windows}
  </div>`;
}

function renderStageChevrons(slide: Slide): string {
  const rawSlide = slide as any;
  const colors = [
    "linear-gradient(135deg, #eef6ff 0%, #dbeafe 100%)",
    "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    "linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)",
    "linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)",
    "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)"
  ];
  const rawStages: unknown[] = Array.isArray(rawSlide.stages)
    ? rawSlide.stages
    : Array.isArray(rawSlide.steps)
      ? rawSlide.steps
      : Array.isArray(rawSlide.phases)
        ? rawSlide.phases
        : Array.isArray(rawSlide.items)
          ? rawSlide.items
          : [];
  const count = Math.max(rawStages.slice(0, 5).length, 1);
  const items = rawStages.slice(0, 5).map((item, index) => {
    const record = item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
    const tag = escapeHtml(toText(record.tag) || toText(record.phase));
    const title = escapeHtml(toText(record.title) || toText(record.name) || `阶段 ${index + 1}`);
    const bullets = Array.isArray(record.bullets)
      ? record.bullets.map((entry: unknown) => toText(entry)).filter(Boolean).slice(0, 2).join(" / ")
      : "";
    const text = escapeHtml(toText(record.text) || bullets);
    const isFirst = index === 0;
    const isLast = index === Math.min(rawStages.length, 5) - 1;
    const clip = isFirst
      ? "polygon(0 0, calc(100% - 28px) 0, 100% 50%, calc(100% - 28px) 100%, 0 100%)"
      : isLast
        ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 28px 50%)"
        : "polygon(0 0, calc(100% - 28px) 0, 100% 50%, calc(100% - 28px) 100%, 0 100%, 28px 50%)";
    const padding = isFirst ? "28px 42px 28px 34px" : "28px 42px 28px 52px";
    const marginRight = isLast ? "0" : "-18px";
    return `<div style="position:relative;min-width:0;min-height:0;margin-right:${marginRight};clip-path:${clip};box-shadow:0 20px 34px rgba(20,61,122,.08);display:grid;place-items:center;padding:${padding};background:${colors[index] ?? colors[colors.length - 1]}">
      <div style="display:grid;gap:10px;text-align:left">
        ${tag ? `<div style="display:inline-flex;align-items:center;min-height:24px;width:fit-content;padding:0 10px;border-radius:999px;background:rgba(255,255,255,.5);color:#1d4ed8;font-size:11px;font-weight:800;letter-spacing:.08em">${tag}</div>` : ""}
        <div style="color:#143d7a;font-size:22px;font-weight:800;line-height:1.28">${title}</div>
        ${text ? `<div style="color:#334155;font-size:14px;line-height:1.6">${text}</div>` : ""}
      </div>
    </div>`;
  }).join("");

  return `<div style="height:100%;min-height:0;display:grid;grid-template-columns:repeat(${count}, minmax(0,1fr));gap:0;align-items:stretch">${items}</div>`;
}

function renderStageStaircase(slide: Slide): string {
  const rawSlide = slide as any;
  const heights = [38, 50, 64, 78, 90];
  const rawStages: unknown[] = Array.isArray(rawSlide.stages)
    ? rawSlide.stages
    : Array.isArray(rawSlide.steps)
      ? rawSlide.steps
      : Array.isArray(rawSlide.phases)
        ? rawSlide.phases
        : Array.isArray(rawSlide.items)
          ? rawSlide.items
          : [];
  const items = rawStages.slice(0, 5).map((item, index) => {
    const record = item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
    const tag = escapeHtml(toText(record.tag) || toText(record.phase));
    const title = escapeHtml(toText(record.title) || toText(record.name) || `阶段 ${index + 1}`);
    const bullets = Array.isArray(record.bullets)
      ? record.bullets.map((entry: unknown) => toText(entry)).filter(Boolean).slice(0, 2).join(" / ")
      : "";
    const text = escapeHtml(toText(record.text) || bullets);
    return `<div style="min-width:0;min-height:120px;height:${heights[index] ?? heights[heights.length - 1]}%;display:grid;grid-template-rows:14px minmax(0,1fr);gap:0">
      <div style="border-radius:18px 18px 0 0;background:linear-gradient(90deg,#4da0ff 0%,#1d6fe8 100%)"></div>
      <div style="min-height:0;display:grid;align-content:start;gap:10px;padding:18px 18px 16px;border-radius:0 0 22px 22px;background:linear-gradient(180deg,#fff 0%,#f4f8ff 100%);border:1px solid rgba(215,227,244,.92);box-shadow:0 20px 34px rgba(20,61,122,.08)">
        ${tag ? `<div style="display:inline-flex;align-items:center;min-height:24px;width:fit-content;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d6fe8;font-size:11px;font-weight:800;letter-spacing:.08em">${tag}</div>` : ""}
        <div style="color:#143d7a;font-size:18px;font-weight:800;line-height:1.3">${title}</div>
        ${text ? `<div style="color:#475569;font-size:13px;line-height:1.55">${text}</div>` : ""}
      </div>
    </div>`;
  }).join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.14), transparent 28%),linear-gradient(180deg,#f8fbff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <div style="position:absolute;left:6%;right:6%;bottom:8%;height:16px;border-radius:999px;background:linear-gradient(90deg, rgba(77,160,255,.18) 0%, rgba(29,111,232,.24) 100%)"></div>
    <div style="position:relative;z-index:1;height:100%;min-height:0;display:grid;grid-template-columns:repeat(${Math.max(rawStages.slice(0,5).length, 1)}, minmax(0,1fr));gap:16px;align-items:end;padding:8% 6% 10%">${items}</div>
  </div>`;
}

function renderStageZigzag(slide: Slide): string {
  const rawSlide = slide as any;
  const rawStages: unknown[] = Array.isArray(rawSlide.stages)
    ? rawSlide.stages
    : Array.isArray(rawSlide.steps)
      ? rawSlide.steps
      : Array.isArray(rawSlide.phases)
        ? rawSlide.phases
        : Array.isArray(rawSlide.items)
          ? rawSlide.items
          : [];
  const items = rawStages.slice(0, 6).map((item, index) => {
    const record = item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
    const tag = escapeHtml(toText(record.tag) || toText(record.phase));
    const title = escapeHtml(toText(record.title) || toText(record.name) || `阶段 ${index + 1}`);
    const bullets = Array.isArray(record.bullets)
      ? record.bullets.map((entry: unknown) => toText(entry)).filter(Boolean).slice(0, 2).join(" / ")
      : "";
    const text = escapeHtml(toText(record.text) || bullets);
    const isTop = index % 2 === 0;
    const rows = isTop ? "minmax(0,1fr) 42px 52px auto" : "auto 52px 42px minmax(0,1fr)";
    const cardRow = isTop ? "4" : "1";
    const stemRow = isTop ? "3" : "2";
    const dotRow = isTop ? "2" : "3";
    return `<div style="min-width:0;display:grid;justify-items:center;grid-template-rows:${rows}">
      <div style="grid-row:${dotRow};width:42px;height:42px;border-radius:999px;display:grid;place-items:center;background:linear-gradient(135deg,#4da0ff 0%,#1d6fe8 100%);color:#fff;font-size:12px;font-weight:800;box-shadow:0 14px 24px rgba(29,111,232,.18)">${String(index + 1).padStart(2, "0")}</div>
      <div style="grid-row:${stemRow};width:4px;height:52px;border-radius:999px;background:linear-gradient(180deg, rgba(96,165,250,.2) 0%, rgba(29,111,232,.55) 100%)"></div>
      <div style="grid-row:${cardRow};min-width:0;width:100%;display:grid;align-content:start;gap:8px;padding:16px 16px 14px;border-radius:20px;background:linear-gradient(180deg,#fff 0%,#f4f8ff 100%);border:1px solid rgba(215,227,244,.92);box-shadow:0 18px 32px rgba(20,61,122,.08)">
        ${tag ? `<div style="display:inline-flex;align-items:center;min-height:22px;width:fit-content;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d6fe8;font-size:11px;font-weight:800;letter-spacing:.08em">${tag}</div>` : ""}
        <div style="color:#143d7a;font-size:16px;font-weight:800;line-height:1.3">${title}</div>
        ${text ? `<div style="color:#475569;font-size:12px;line-height:1.55">${text}</div>` : ""}
      </div>
    </div>`;
  }).join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.14), transparent 30%),linear-gradient(180deg,#f8fbff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <div style="position:absolute;left:8%;right:8%;top:50%;height:8px;transform:translateY(-50%);border-radius:999px;background:linear-gradient(90deg, rgba(77,160,255,.16) 0%, rgba(29,111,232,.24) 100%)"></div>
    <div style="position:relative;z-index:1;height:100%;min-height:0;display:grid;grid-template-columns:repeat(${Math.max(rawStages.slice(0,6).length, 1)}, minmax(0,1fr));gap:12px;padding:6% 5%">${items}</div>
  </div>`;
}

function renderTripleMetrics(slide: Slide): string {
  const rawSlide = slide as any;
  const rawMetrics: unknown[] = Array.isArray(rawSlide.metrics)
    ? rawSlide.metrics
    : Array.isArray(rawSlide.cards)
      ? rawSlide.cards
      : Array.isArray(rawSlide.items)
        ? rawSlide.items
        : [];
  const positions = [
    { left: 22, size: 24, valueSize: 42 },
    { left: 50, size: 30, valueSize: 54 },
    { left: 78, size: 24, valueSize: 42 }
  ];

  const circles = Array.from({ length: 3 }, (_, index) => {
    const item = rawMetrics[index];
    const record =
      item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
    const label = escapeHtml(toText(record.label) || toText(record.title) || `指标 ${index + 1}`);
    const tag = escapeHtml(toText(record.tag));
    const value =
      typeof record.value === "number" || typeof record.value === "string"
        ? escapeHtml(String(record.value))
        : "-";
    const unit = escapeHtml(toText(record.unit));
    const note = escapeHtml(toText(record.note) || toText(record.text));
    const pos = positions[index];
    return `<div style="position:absolute;left:${pos.left}%;top:50%;width:${pos.size}%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:999px;background:linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(244,248,255,.98) 100%);border:1px solid rgba(191,219,254,.96);box-shadow:0 24px 38px rgba(20,61,122,.12);display:grid;place-items:center;text-align:center">
      <div style="width:74%;display:grid;justify-items:center;align-content:center;gap:10px">
        ${tag ? `<div style="display:inline-flex;align-items:center;min-height:24px;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d6fe8;font-size:11px;font-weight:800;letter-spacing:.08em">${tag}</div>` : ""}
        <div style="color:#143d7a;font-size:18px;font-weight:800;line-height:1.3">${label}</div>
        <div style="display:flex;align-items:baseline;justify-content:center;gap:8px">
          <span style="color:#0f172a;font-size:${pos.valueSize}px;font-weight:900;line-height:1">${value}</span>
          ${unit ? `<span style="color:rgba(15,23,42,.48);font-size:15px;font-weight:700">${unit}</span>` : ""}
        </div>
        ${note ? `<div style="color:#475569;font-size:12px;line-height:1.55">${note}</div>` : ""}
      </div>
    </div>`;
  }).join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.14), transparent 30%),linear-gradient(180deg,#f8fbff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <div style="position:absolute;left:8%;top:24%;width:24%;aspect-ratio:1;border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.24) 0%, rgba(147,197,253,.08) 56%, transparent 76%)"></div>
    <div style="position:absolute;left:50%;top:18%;width:30%;aspect-ratio:1;transform:translateX(-50%);border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.24) 0%, rgba(147,197,253,.08) 56%, transparent 76%)"></div>
    <div style="position:absolute;right:8%;top:24%;width:24%;aspect-ratio:1;border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.24) 0%, rgba(147,197,253,.08) 56%, transparent 76%)"></div>
    <div style="position:absolute;left:14%;right:14%;top:50%;height:10px;transform:translateY(-50%);border-radius:999px;background:linear-gradient(90deg, rgba(77,160,255,.18) 0%, rgba(29,111,232,.24) 100%)"></div>
    ${circles}
  </div>`;
}

function renderStaffList(slide: Slide): string {
  const rawSlide = slide as any;
  const rawItems: unknown[] = Array.isArray(rawSlide.items)
    ? rawSlide.items
    : Array.isArray(rawSlide.bullets)
      ? rawSlide.bullets
      : [];
  const eyebrow = escapeHtml(toText(rawSlide.eyebrow) || "Staff List");
  const subtitle = escapeHtml(toText(rawSlide.subtitle));
  const fallbackTitles = ["战略方向", "能力建设", "执行机制", "落地保障", "结果复盘"];
  const fallbackTexts = ["先明确主线判断。", "再铺开关键能力。", "同步拆到责任动作。", "最后补齐治理与复盘。", "形成下一轮迭代输入。"];
  const items = (rawItems.length ? rawItems : Array.from({ length: 4 }, (_, index) => ({
    tag: `章节 ${String(index + 1).padStart(2, "0")}`,
    title: fallbackTitles[index] ?? `条目 ${index + 1}`,
    text: fallbackTexts[index] ?? ""
  })))
    .slice(0, 5)
    .map((item, index) => {
      const record = item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
      const title = escapeHtml(
        typeof item === "string" ? item : toText(record.title) || toText(record.name) || `条目 ${index + 1}`
      );
      const tag = escapeHtml(toText(record.tag) || toText(record.label) || `重点 ${String(index + 1).padStart(2, "0")}`);
      const bullets = Array.isArray(record.bullets)
        ? record.bullets.map((entry: unknown) => toText(entry)).filter(Boolean).slice(0, 2).join(" / ")
        : "";
      const text = escapeHtml(toText(record.text) || toText(record.note) || bullets);
      return `<div style="min-width:0;min-height:0;display:grid;grid-template-columns:36px minmax(0,1fr);gap:14px;align-items:stretch">
        <div style="min-height:0;height:100%;display:grid;grid-template-rows:16px 9px minmax(0,1fr) 9px 16px">
          <div style="border-radius:999px;background:linear-gradient(180deg,#fde68a 0%,#f59e0b 48%,#b45309 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.34),0 8px 18px rgba(146,64,14,.12)"></div>
          <div style="margin:0 2px;border-radius:999px;background:linear-gradient(180deg,#fef3c7 0%,#fbbf24 44%,#b45309 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.34),0 8px 18px rgba(146,64,14,.12)"></div>
          <div style="margin:0 6px;border-radius:999px;background:linear-gradient(90deg, rgba(255,255,255,.26) 0 10%, transparent 10% 100%),linear-gradient(180deg,#b91c1c 0%,#dc2626 16%,#991b1b 52%,#dc2626 84%,#b91c1c 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.24),0 8px 18px rgba(146,64,14,.12)"></div>
          <div style="margin:0 2px;border-radius:999px;background:linear-gradient(180deg,#fef3c7 0%,#fbbf24 44%,#b45309 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.34),0 8px 18px rgba(146,64,14,.12)"></div>
          <div style="border-radius:999px;background:linear-gradient(180deg,#fde68a 0%,#f59e0b 48%,#b45309 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.34),0 8px 18px rgba(146,64,14,.12)"></div>
        </div>
        <div style="min-width:0;min-height:0;display:grid;grid-template-columns:56px minmax(0,1fr);gap:14px;align-items:center;padding:14px 16px;border-radius:22px;background:linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(244,248,255,.98) 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 16px 28px rgba(20,61,122,.08);overflow:hidden">
          <div style="display:grid;place-items:center;min-height:54px;border-radius:18px;background:linear-gradient(180deg, rgba(30,64,175,.08) 0%, rgba(29,111,232,.16) 100%);color:#143d7a;font-size:18px;font-weight:900">${String(index + 1).padStart(2, "0")}</div>
          <div style="min-width:0;display:grid;align-content:center;gap:6px">
            ${tag ? `<div style="display:inline-flex;align-items:center;width:fit-content;min-height:22px;padding:0 10px;border-radius:999px;background:rgba(180,83,9,.10);color:#b45309;font-size:11px;font-weight:800;letter-spacing:.04em">${tag}</div>` : ""}
            <div style="color:#143d7a;font-size:16px;font-weight:800;line-height:1.35">${title}</div>
            ${text ? `<div style="color:#475569;font-size:12px;line-height:1.55">${text}</div>` : ""}
          </div>
        </div>
      </div>`;
    })
    .join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.16), transparent 30%),radial-gradient(circle at left bottom, rgba(244,199,106,.14), transparent 28%),linear-gradient(180deg,#f8fbff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08);display:grid;grid-template-rows:auto minmax(0,1fr);gap:16px;padding:18px 20px 20px">
    <div style="position:absolute;width:220px;height:220px;top:-72px;right:-42px;border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.28) 0%, rgba(147,197,253,.06) 58%, transparent 74%)"></div>
    <div style="position:absolute;width:180px;height:180px;bottom:-54px;left:-36px;border-radius:999px;background:radial-gradient(circle, rgba(245,158,11,.18) 0%, rgba(245,158,11,.04) 58%, transparent 74%)"></div>
    <div style="position:relative;z-index:1;display:grid;gap:8px">
      <div style="display:inline-flex;align-items:center;width:fit-content;min-height:28px;padding:0 12px;border-radius:999px;background:linear-gradient(135deg, rgba(29,111,232,.12) 0%, rgba(77,160,255,.12) 100%);color:#1d6fe8;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">${eyebrow}</div>
      ${subtitle ? `<div style="max-width:82%;color:#475569;font-size:13px;line-height:1.55">${subtitle}</div>` : ""}
    </div>
    <div style="position:relative;z-index:1;min-height:0;display:grid;grid-template-rows:repeat(${Math.max((rawItems.length ? rawItems : [1, 2, 3, 4]).slice(0, 5).length, 1)}, minmax(0,1fr));gap:12px">${items}</div>
  </div>`;
}

function renderSectorExplainer(slide: Slide): string {
  const presets = [
    {
      title: "用户洞察",
      text: "先把用户分层、场景差异和关键反馈看清，避免所有动作都建立在“平均用户”的想象上。",
      badge: "01",
      from: "#2275eb",
      to: "#165bc3"
    },
    {
      title: "方案设计",
      text: "把问题拆成阶段动作、责任人和评价口径，让“要做什么、先做什么、为什么这么做”全部落到纸面上。",
      badge: "02",
      from: "#1a65d8",
      to: "#174fae"
    },
    {
      title: "执行落地",
      text: "围绕时间表、资源配置和协作链路推进实施，把抽象策略变成团队真正会执行的动作序列。",
      badge: "03",
      from: "#2284ff",
      to: "#1964d3"
    },
    {
      title: "结果复盘",
      text: "把结果、经验和问题回收进同一个闭环，形成下一轮可复用的模板、规则和优化方向。",
      badge: "04",
      from: "#2d93ff",
      to: "#1b6fe4"
    }
  ];
  const raw = Array.isArray(slide.sectors)
    ? slide.sectors
    : Array.isArray(slide.items)
      ? slide.items
      : Array.isArray(slide.blocks)
        ? slide.blocks
        : [];
  const sectors = presets.map((preset, index) => {
    const item = raw[index];
    if (typeof item === "string") return { ...preset, title: escapeHtml(item) };
    const record = asObject(item) ?? {};
    const title = escapeHtml(toText(record.title ?? record.name ?? preset.title));
    const text = toText(record.text)
      ? escapeHtml(toText(record.text))
      : Array.isArray(record.bullets)
        ? escapeHtml(record.bullets.map((bullet) => toText(bullet)).filter(Boolean).slice(0, 2).join(" / "))
        : preset.text;
    return { ...preset, title, text };
  });
  const centerTitle = escapeHtml(toText((slide as any).center_title ?? (slide as any).center?.title ?? "核心议题"));
  const chips = [
    { x: "40%", y: "14%" },
    { x: "66%", y: "34%" },
    { x: "78%", y: "60%" },
    { x: "42%", y: "84%" }
  ];
  const left = sectors
    .map(
      (sector, index) => `<div style="position:absolute;left:${chips[index].x};top:${chips[index].y};transform:translate(-50%,-50%);padding:8px 14px;border-radius:999px;background:linear-gradient(135deg,${sector.from} 0%,${sector.to} 100%);color:#fff;font-size:18px;font-weight:800;line-height:1.1;box-shadow:0 14px 28px rgba(20,61,122,.12)">${sector.title}</div>`
    )
    .join("");
  const right = sectors
    .map(
      (sector) => `<div style="display:grid;grid-template-columns:14px 66px 120px 1fr;column-gap:14px;padding:22px 22px 18px 0;border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.98) 0%,rgba(248,251,255,.98) 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 18px 34px rgba(20,61,122,.08)">
        <div style="border-radius:999px;background:linear-gradient(180deg,${sector.from} 0%,${sector.to} 100%)"></div>
        <div style="display:grid;place-items:center;min-height:34px;margin-top:2px;padding:0 12px;border-radius:999px;background:linear-gradient(135deg,${sector.from} 0%,${sector.to} 100%);color:#fff;font-size:18px;font-weight:700">${sector.badge}</div>
        <div style="margin-top:2px;font-size:24px;font-weight:800;line-height:1.2;color:#143d7a">${sector.title}</div>
        <div style="margin-top:4px;font-size:16px;line-height:1.55;color:#475569">${sector.text}</div>
      </div>`
    )
    .join("");
  return `<div style="display:grid;grid-template-columns:minmax(300px,.88fr) minmax(0,1.22fr);gap:20px;height:100%;min-height:0;overflow:hidden">
    <div style="position:relative;overflow:hidden">
      <div style="position:absolute;left:-18%;top:0;bottom:0;width:118%;border-radius:50%;background:radial-gradient(circle at center, rgba(234,241,250,.92) 0 40%, rgba(234,241,250,.78) 41%, rgba(223,233,246,.8) 70%, transparent 71%)"></div>
      <div style="position:absolute;left:4%;top:22%;width:66%;height:56%;border-radius:999px;background:#fff;box-shadow:0 10px 12px rgba(30,58,95,.1)"></div>
      <div style="position:absolute;left:11%;top:30%;width:48%;height:40%;border-radius:999px;background:#f7fbff;border:2px solid #d7e3f4;display:grid;place-items:center;color:#143d7a;font-size:34px;font-weight:700">${centerTitle}</div>
      ${left}
    </div>
    <div style="display:grid;grid-template-rows:repeat(4,minmax(0,1fr));gap:14px;min-height:0">${right}</div>
  </div>`;
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

  if (layout === "gauge") {
    return renderGauge(slide);
  }

  if (layout === "pyramid") {
    return renderPyramid(slide);
  }

  if (layout === "double_loop") {
    return renderDoubleLoop(slide);
  }

  if (layout === "iceberg") {
    return renderIceberg(slide);
  }

  if (layout === "house") {
    return renderHouse(slide);
  }

  if (layout === "radial_explainer") {
    return renderRadialExplainer(slide);
  }

  if (layout === "brain_explainer") {
    return renderBrainExplainer(slide);
  }

  if (layout === "profile_intro") {
    return renderProfileIntro(slide);
  }

  if (layout === "chip_explainer") {
    return renderChipExplainer(slide);
  }

  if (layout === "development_route") {
    return renderDevelopmentRoute(slide);
  }

  if (layout === "cycle_explainer") {
    return renderCycleExplainer(slide);
  }

  if (layout === "swimlane_board") {
    return renderSwimlaneBoard(slide);
  }

  if (layout === "kanban_board") {
    return renderKanbanBoard(slide);
  }

  if (layout === "month_calendar") {
    return renderMonthCalendar(slide);
  }

  if (layout === "symmetric_split") {
    return renderSymmetricSplit(slide);
  }

  if (layout === "petal_explainer") {
    return renderPetalExplainer(slide);
  }

  if (layout === "fan_explainer") {
    return renderFanExplainer(slide);
  }

  if (layout === "upward_arrows") {
    return renderUpwardArrows(slide);
  }

  if (layout === "screen_explainer") {
    return renderScreenExplainer(slide);
  }

  if (layout === "stage_chevrons") {
    return renderStageChevrons(slide);
  }

  if (layout === "stage_staircase") {
    return renderStageStaircase(slide);
  }

  if (layout === "stage_zigzag") {
    return renderStageZigzag(slide);
  }

  if (layout === "triple_metrics") {
    return renderTripleMetrics(slide);
  }

  if (layout === "staff_list") {
    return renderStaffList(slide);
  }

  if (layout === "sector_explainer") {
    return renderSectorExplainer(slide);
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
