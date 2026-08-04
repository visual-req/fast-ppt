import fs from "node:fs/promises";
import path from "node:path";

const arrayKeys = new Set(["bullets", "blocks", "rows", "items", "quadrants", "cards", "columns", "headers", "meta", "days", "weekdays", "legend"]);

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

function renderGauge(slide) {
  const min = Number.isFinite(Number(slide.min)) ? Number(slide.min) : 0;
  const max = Number.isFinite(Number(slide.max)) && Number(slide.max) > min ? Number(slide.max) : 100;
  const rawValue = Number.isFinite(Number(slide.value)) ? Number(slide.value) : min;
  const value = Math.min(max, Math.max(min, rawValue));
  const ratio = (value - min) / Math.max(max - min, 1);
  const cx = 280;
  const cy = 246;
  const radius = 176;
  const pointerRadius = 142;
  const metricLabel = escapeHtml(typeof slide.label === "string" && slide.label.trim() ? slide.label : "综合评分");

  function polarToCartesian(centerX, centerY, r, angleDeg) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: centerX + r * Math.cos(angleRad), y: centerY + r * Math.sin(angleRad) };
  }

  function describeArc(centerX, centerY, r, startAngle, endAngle) {
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

function renderPyramid(slide) {
  const rawLevels = Array.isArray(slide.levels)
    ? slide.levels
    : Array.isArray(slide.blocks)
      ? slide.blocks
      : Array.isArray(slide.bullets)
        ? slide.bullets
        : [];

  if (!rawLevels.length) return "";

  const total = rawLevels.length;
  const topOffsetRatio = 0.136;
  const gapRatio = 0.047;
  const layers = rawLevels
    .slice(0, 5)
    .map((lv, idx) => {
      const obj = typeof lv === "string" ? { title: lv } : asObject(lv) ?? {};
      const title = escapeHtml(obj.title ?? obj.label ?? `层级 ${idx + 1}`);
      const text = typeof obj.text === "string" ? escapeHtml(obj.text) : "";
      const bullets = Array.isArray(obj.bullets)
        ? obj.bullets
            .map((item) => String(item ?? "").trim())
            .filter(Boolean)
            .slice(0, 2)
        : [];
      const layerRatio = Math.max((1 - topOffsetRatio - gapRatio * (total - 1)) / total, 0.08);
      const topRatio = topOffsetRatio + idx * (layerRatio + gapRatio);
      const bottomRatio = Math.min(topRatio + layerRatio, 1);
      const topWidth = topRatio * 100;
      const bottomWidth = bottomRatio * 100;
      const topInset = ((bottomWidth - topWidth) / 2 / bottomWidth) * 100;
      const contentInset = Math.max(7, Math.min(13, topInset + 2));
      const palette = [
        ["#2c7df2", "#195dca"],
        ["#3b8dff", "#216fe0"],
        ["#5a9eff", "#2f7be5"],
        ["#79b0ff", "#4189ef"],
        ["#9dc5ff", "#5f9af4"]
      ];
      const [from, to] = palette[idx % palette.length];
      const body = text
        ? `<div style="color:rgba(255,255,255,.92);font-size:14px;line-height:1.45">${text}</div>`
        : bullets.length
          ? `<div style="display:grid;gap:4px">${bullets.map((item) => `<div style="color:rgba(255,255,255,.92);font-size:14px;line-height:1.4">• ${escapeHtml(item)}</div>`).join("")}</div>`
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

function renderSectorExplainer(slide) {
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
  const raw = Array.isArray(slide.sectors) ? slide.sectors : Array.isArray(slide.items) ? slide.items : Array.isArray(slide.blocks) ? slide.blocks : [];
  const sectors = presets.map((preset, idx) => {
    const item = raw[idx];
    if (typeof item === "string") return { ...preset, title: escapeHtml(item) };
    const obj = asObject(item) ?? {};
    const title = escapeHtml(obj.title ?? obj.name ?? preset.title);
    const text =
      typeof obj.text === "string"
        ? escapeHtml(obj.text)
        : Array.isArray(obj.bullets)
          ? escapeHtml(obj.bullets.map((it) => String(it ?? "").trim()).filter(Boolean).slice(0, 2).join(" / "))
          : preset.text;
    return { ...preset, title, text };
  });
  const centerTitle = escapeHtml(slide.center_title ?? slide.center?.title ?? "核心议题");
  const chips = [
    { x: "40%", y: "14%" },
    { x: "66%", y: "34%" },
    { x: "78%", y: "60%" },
    { x: "42%", y: "84%" }
  ];
  const left = sectors
    .map(
      (sector, idx) => `<div style="position:absolute;left:${chips[idx].x};top:${chips[idx].y};transform:translate(-50%,-50%);padding:8px 14px;border-radius:999px;background:linear-gradient(135deg,${sector.from} 0%,${sector.to} 100%);color:#fff;font-size:18px;font-weight:800;line-height:1.1;box-shadow:0 14px 28px rgba(20,61,122,.12)">${sector.title}</div>`
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

function renderDoubleLoop(slide) {
  const leftTitle = escapeHtml(typeof slide.left_title === "string" && slide.left_title.trim() ? slide.left_title : slide.loops?.left?.title ?? "策略循环");
  const rightTitle = escapeHtml(typeof slide.right_title === "string" && slide.right_title.trim() ? slide.right_title : slide.loops?.right?.title ?? "执行循环");
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
  const leftRaw = Array.isArray(slide.left_nodes) ? slide.left_nodes : Array.isArray(slide.loops?.left?.nodes) ? slide.loops.left.nodes : [];
  const rightRaw = Array.isArray(slide.right_nodes) ? slide.right_nodes : Array.isArray(slide.loops?.right?.nodes) ? slide.loops.right.nodes : [];
  const left = leftPresets
    .map((preset, idx) => {
      const item = leftRaw[idx];
      const title = escapeHtml(typeof item === "string" ? item : item?.title ?? preset.title);
      return `<div style="position:absolute;left:${preset.x};top:${preset.y};transform:translate(-50%,-50%)">
        <div style="width:24px;height:24px;border-radius:999px;background:#fff;border:6px solid #1d6fe8;box-shadow:0 12px 22px rgba(20,61,122,.12)"></div>
        <div style="position:absolute;left:0;top:0;transform:translate(${preset.dx},${preset.dy});min-width:104px;padding:10px 16px;border-radius:16px;background:rgba(255,255,255,.96);border:1px solid rgba(215,227,244,.96);box-shadow:0 14px 28px rgba(20,61,122,.10);color:#143d7a;font-size:16px;font-weight:800;line-height:1.2;white-space:nowrap">${title}</div>
      </div>`;
    })
    .join("");
  const right = rightPresets
    .map((preset, idx) => {
      const item = rightRaw[idx];
      const title = escapeHtml(typeof item === "string" ? item : item?.title ?? preset.title);
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
        <linearGradient id="doubleLoopBuildStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#1d6fe8"></stop>
          <stop offset="50%" stop-color="#4da0ff"></stop>
          <stop offset="100%" stop-color="#1d6fe8"></stop>
        </linearGradient>
      </defs>
      <path d="M120 210 C120 92 250 48 374 150 C445 210 555 210 626 150 C750 48 880 92 880 210 C880 328 750 372 626 270 C555 210 445 210 374 270 C250 372 120 328 120 210" fill="none" stroke="#d8e7fb" stroke-width="58" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M120 210 C120 92 250 48 374 150 C445 210 555 210 626 150 C750 48 880 92 880 210 C880 328 750 372 626 270 C555 210 445 210 374 270 C250 372 120 328 120 210" fill="none" stroke="url(#doubleLoopBuildStroke)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M120 210 C120 92 250 48 374 150 C445 210 555 210 626 150 C750 48 880 92 880 210 C880 328 750 372 626 270 C555 210 445 210 374 270 C250 372 120 328 120 210" fill="none" stroke="#93c5fd" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="12 14" opacity=".92"></path>
    </svg>
    ${left}
    ${right}
  </div>`;
}

function renderIceberg(slide) {
  const readSection = (raw, fallbackTitle, fallbackTag) => {
    const record = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const bulletSource = record.items ?? record.bullets;
    const bullets = Array.isArray(bulletSource)
      ? bulletSource.map((item) => escapeHtml(toText(item))).filter(Boolean).slice(0, 5)
      : [];
    return {
      tag: escapeHtml(toText(record.tag) || fallbackTag),
      title: escapeHtml(toText(record.title) || fallbackTitle),
      text: escapeHtml(toText(record.text)),
      bullets
    };
  };

  const tip = readSection(slide.tip ?? slide.visible ?? slide.above, "表层表现", "VISIBLE");
  const base = readSection(slide.base ?? slide.hidden ?? slide.below, "深层驱动", "HIDDEN");
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

function renderHouse(slide) {
  const rawRoof =
    slide.roof && typeof slide.roof === "object" && !Array.isArray(slide.roof)
      ? slide.roof
      : slide.top && typeof slide.top === "object" && !Array.isArray(slide.top)
        ? slide.top
        : {};
  const roofTag = escapeHtml(typeof rawRoof.tag === "string" && rawRoof.tag.trim() ? rawRoof.tag : "ROOF");
  const roofTitle = escapeHtml(typeof rawRoof.title === "string" && rawRoof.title.trim() ? rawRoof.title : "战略屋顶");
  const roofText = escapeHtml(typeof rawRoof.text === "string" && rawRoof.text.trim() ? rawRoof.text : "统一目标、方法论与衡量口径");

  const rawPillars = Array.isArray(slide.pillars)
    ? slide.pillars
    : Array.isArray(slide.columns)
      ? slide.columns
      : Array.isArray(slide.blocks)
        ? slide.blocks
        : [];
  if (!rawPillars.length) return "";

  const palette = [
    ["#2563eb", "#1d4ed8"],
    ["#3b82f6", "#2563eb"],
    ["#60a5fa", "#3b82f6"],
    ["#93c5fd", "#60a5fa"]
  ];

  const pillars = rawPillars
    .slice(0, 4)
    .map((item, index) => {
      const record = item && typeof item === "object" && !Array.isArray(item) ? item : typeof item === "string" ? { title: item } : {};
      const tag = escapeHtml(typeof record.tag === "string" ? record.tag : "");
      const title = escapeHtml(typeof record.title === "string" && record.title.trim() ? record.title : typeof record.name === "string" && record.name.trim() ? record.name : `支柱 ${index + 1}`);
      const text = escapeHtml(typeof record.text === "string" ? record.text : "");
      const bullets = Array.isArray(record.bullets)
        ? record.bullets.map((bullet) => escapeHtml(typeof bullet === "string" ? bullet : "")).filter(Boolean).slice(0, 3)
        : [];
      const [from, to] = palette[index % palette.length];
      const body = text
        ? `<div style="margin-top:10px;margin-left:8px;color:#475569;font-size:14px;line-height:1.5">${text}</div>`
        : bullets.length
          ? `<ul style="margin:10px 0 0 26px;padding:0;color:#475569;font-size:14px;line-height:1.45;display:grid;gap:6px">${bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>`
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
    slide.foundation && typeof slide.foundation === "object" && !Array.isArray(slide.foundation)
      ? slide.foundation
      : slide.base && typeof slide.base === "object" && !Array.isArray(slide.base)
        ? slide.base
        : slide.bottom && typeof slide.bottom === "object" && !Array.isArray(slide.bottom)
          ? slide.bottom
          : {};
  const foundationTitle = escapeHtml(typeof rawFoundation.title === "string" && rawFoundation.title.trim() ? rawFoundation.title : "基础底座");
  const foundationText = escapeHtml(typeof rawFoundation.text === "string" ? rawFoundation.text : "");
  const foundationSource = rawFoundation.items ?? rawFoundation.bullets;
  const foundationItems = Array.isArray(foundationSource)
    ? foundationSource.map((item) => escapeHtml(typeof item === "string" ? item : "")).filter(Boolean).slice(0, 4)
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
      ${foundationItems.length ? `<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">${foundationItems.map((item) => `<div style="padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.72);border:1px solid rgba(191,219,254,.9);color:#1d4ed8;font-size:13px;font-weight:700;line-height:1.2">${item}</div>`).join("")}</div>` : ""}
    </div>
  </div>`;
}

function renderRadialExplainer(slide) {
  const rawCenter = slide.center && typeof slide.center === "object" && !Array.isArray(slide.center) ? slide.center : {};
  const centerTag = escapeHtml(typeof rawCenter.tag === "string" && rawCenter.tag.trim() ? rawCenter.tag : "CENTER");
  const centerTitle = escapeHtml(typeof rawCenter.title === "string" && rawCenter.title.trim() ? rawCenter.title : typeof slide.center_title === "string" && slide.center_title.trim() ? slide.center_title : "核心议题");
  const centerText = escapeHtml(typeof rawCenter.text === "string" && rawCenter.text.trim() ? rawCenter.text : "围绕中心主题，向外展开关键模块、动作或解释。");

  const rawItems = Array.isArray(slide.items)
    ? slide.items
    : Array.isArray(slide.points)
      ? slide.points
      : Array.isArray(slide.blocks)
        ? slide.blocks
        : Array.isArray(slide.sectors)
          ? slide.sectors
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
  };

  const source = rawItems.slice(0, 6);
  const presets = presetMap[Math.min(Math.max(source.length, 3), 6)] || presetMap[4];
  const connector = (preset) => {
    const cx = 50;
    const cy = 50;
    const mx = (cx + preset.dotX) / 2;
    const my = (cy + preset.dotY) / 2;
    return `M ${cx} ${cy} Q ${mx} ${my} ${preset.dotX} ${preset.dotY}`;
  };
  const lines = source.map((_, index) => {
    const preset = presets[index];
    return `<path d="${connector(preset)}" fill="none" stroke="url(#radialBuildStroke)" stroke-width="0.7" stroke-linecap="round" stroke-dasharray="1.8 1.5" opacity=".85"></path>
    <circle cx="${preset.dotX}" cy="${preset.dotY}" r="1.7" fill="#fff" stroke="#2563eb" stroke-width=".7"></circle>`;
  }).join("");
  const cards = source.map((item, index) => {
    const preset = presets[index];
    const record = item && typeof item === "object" && !Array.isArray(item) ? item : typeof item === "string" ? { title: item } : {};
    const tag = escapeHtml(typeof record.tag === "string" ? record.tag : "");
    const title = escapeHtml(typeof record.title === "string" && record.title.trim() ? record.title : typeof record.name === "string" && record.name.trim() ? record.name : `要点 ${index + 1}`);
    const text = escapeHtml(
      typeof record.text === "string" && record.text.trim()
        ? record.text
        : Array.isArray(record.bullets)
          ? record.bullets.map((bullet) => typeof bullet === "string" ? bullet.trim() : "").filter(Boolean).slice(0, 2).join(" / ")
          : ""
    );
    const transform = preset.align === "left" ? "translate(0,-50%)" : preset.align === "right" ? "translate(-100%,-50%)" : "translate(-50%,-50%)";
    const marginLeft = preset.align === "center" ? "0" : "10px";
    return `<div style="position:absolute;left:${preset.cardX}%;top:${preset.cardY}%;transform:${transform};width:26%;min-width:180px;max-width:250px;min-height:88px;padding:16px 18px;border-radius:22px;background:rgba(255,255,255,.97);border:1px solid rgba(215,227,244,.96);box-shadow:0 16px 28px rgba(20,61,122,.08);overflow:hidden;text-align:${preset.align === "center" ? "center" : "left"}">
      <div style="position:absolute;inset:0 auto 0 0;width:7px;background:linear-gradient(180deg,#60a5fa 0%,#2563eb 100%)"></div>
      ${tag ? `<div style="position:relative;margin-left:${marginLeft};color:#2563eb;font-size:11px;font-weight:800;letter-spacing:.08em">${tag}</div>` : ""}
      <div style="position:relative;margin-top:8px;margin-left:${marginLeft};color:#143d7a;font-size:20px;font-weight:800;line-height:1.2">${title}</div>
      ${text ? `<div style="position:relative;margin-top:8px;margin-left:${marginLeft};color:#475569;font-size:13px;line-height:1.45">${text}</div>` : ""}
    </div>`;
  }).join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.14), transparent 30%),linear-gradient(180deg,#f8fbff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
      <defs>
        <linearGradient id="radialBuildStroke" x1="0" y1="0" x2="1" y2="1">
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

function renderBrainExplainer(slide) {
  const rawBrain =
    slide.brain && typeof slide.brain === "object" && !Array.isArray(slide.brain)
      ? slide.brain
      : slide.center && typeof slide.center === "object" && !Array.isArray(slide.center)
        ? slide.center
        : {};
  const brainTag = escapeHtml(typeof rawBrain.tag === "string" && rawBrain.tag.trim() ? rawBrain.tag : "BRAIN");
  const brainTitle = escapeHtml(typeof rawBrain.title === "string" && rawBrain.title.trim() ? rawBrain.title : "智能中枢");
  const brainText = escapeHtml(typeof rawBrain.text === "string" && rawBrain.text.trim() ? rawBrain.text : "以统一认知、规则和反馈闭环驱动周边模块协同运转。");

  const rawItems = Array.isArray(slide.items)
    ? slide.items
    : Array.isArray(slide.points)
      ? slide.points
      : Array.isArray(slide.blocks)
        ? slide.blocks
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
  };

  const source = rawItems.slice(0, 6);
  const presets = presetMap[Math.min(Math.max(source.length, 4), 6)] || presetMap[5];
  const connector = (preset) => {
    const cx = 50;
    const cy = 50;
    const mx = (cx + preset.dotX) / 2;
    const my = (cy + preset.dotY) / 2;
    return `M ${cx} ${cy} Q ${mx} ${my} ${preset.dotX} ${preset.dotY}`;
  };
  const lines = source.map((_, index) => {
    const preset = presets[index];
    return `<path d="${connector(preset)}" fill="none" stroke="url(#brainBuildStroke)" stroke-width="0.72" stroke-linecap="round" stroke-dasharray="1.9 1.5" opacity=".88"></path>
    <circle cx="${preset.dotX}" cy="${preset.dotY}" r="1.75" fill="#fff" stroke="#2563eb" stroke-width=".7"></circle>`;
  }).join("");
  const cards = source.map((item, index) => {
    const preset = presets[index];
    const record = item && typeof item === "object" && !Array.isArray(item) ? item : typeof item === "string" ? { title: item } : {};
    const tag = escapeHtml(typeof record.tag === "string" ? record.tag : "");
    const title = escapeHtml(typeof record.title === "string" && record.title.trim() ? record.title : typeof record.name === "string" && record.name.trim() ? record.name : `模块 ${index + 1}`);
    const text = escapeHtml(
      typeof record.text === "string" && record.text.trim()
        ? record.text
        : Array.isArray(record.bullets)
          ? record.bullets.map((bullet) => typeof bullet === "string" ? bullet.trim() : "").filter(Boolean).slice(0, 2).join(" / ")
          : ""
    );
    const transform = preset.align === "left" ? "translate(0,-50%)" : preset.align === "right" ? "translate(-100%,-50%)" : "translate(-50%,-50%)";
    const marginLeft = preset.align === "center" ? "0" : "10px";
    return `<div style="position:absolute;left:${preset.cardX}%;top:${preset.cardY}%;transform:${transform};width:25%;min-width:176px;max-width:244px;min-height:84px;padding:16px 18px;border-radius:22px;background:rgba(255,255,255,.97);border:1px solid rgba(215,227,244,.96);box-shadow:0 16px 28px rgba(20,61,122,.08);overflow:hidden;text-align:${preset.align === "center" ? "center" : "left"}">
      <div style="position:absolute;inset:0 auto 0 0;width:7px;background:linear-gradient(180deg,#60a5fa 0%,#2563eb 100%)"></div>
      ${tag ? `<div style="position:relative;margin-left:${marginLeft};color:#2563eb;font-size:11px;font-weight:800;letter-spacing:.08em">${tag}</div>` : ""}
      <div style="position:relative;margin-top:8px;margin-left:${marginLeft};color:#143d7a;font-size:20px;font-weight:800;line-height:1.2">${title}</div>
      ${text ? `<div style="position:relative;margin-top:8px;margin-left:${marginLeft};color:#475569;font-size:13px;line-height:1.45">${text}</div>` : ""}
    </div>`;
  }).join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.14), transparent 28%),linear-gradient(180deg,#f8fbff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
      <defs>
        <linearGradient id="brainBuildStroke" x1="0" y1="0" x2="1" y2="1">
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
          <linearGradient id="brainBuildFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f8fbff"></stop>
            <stop offset="100%" stop-color="#eaf2ff"></stop>
          </linearGradient>
        </defs>
        <path d="M209 60 C176 30 124 34 97 68 C74 72 56 91 54 118 C37 134 34 166 50 188 C47 213 61 237 84 247 C96 271 122 286 148 283 C164 294 188 296 209 286" fill="url(#brainBuildFill)" stroke="#2563eb" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M211 60 C244 30 296 34 323 68 C346 72 364 91 366 118 C383 134 386 166 370 188 C373 213 359 237 336 247 C324 271 298 286 272 283 C256 294 232 296 211 286" fill="url(#brainBuildFill)" stroke="#2563eb" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path>
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

function renderProfileIntro(slide) {
  const rawPhoto =
    slide.photo && typeof slide.photo === "object" && !Array.isArray(slide.photo)
      ? slide.photo
      : slide.image && typeof slide.image === "object" && !Array.isArray(slide.image)
        ? slide.image
        : {};
  const photoSrc = escapeHtml(typeof rawPhoto.src === "string" && rawPhoto.src.trim() ? rawPhoto.src : typeof rawPhoto.url === "string" ? rawPhoto.url : "");
  const photoAlt = escapeHtml(typeof rawPhoto.alt === "string" && rawPhoto.alt.trim() ? rawPhoto.alt : typeof slide.title === "string" && slide.title.trim() ? slide.title : "profile photo");
  const photoCaption = escapeHtml(typeof rawPhoto.caption === "string" ? rawPhoto.caption : "");

  const rawProfile = slide.profile && typeof slide.profile === "object" && !Array.isArray(slide.profile) ? slide.profile : {};
  const name = escapeHtml(typeof rawProfile.name === "string" && rawProfile.name.trim() ? rawProfile.name : "姓名 Name");
  const role = escapeHtml(typeof rawProfile.role === "string" && rawProfile.role.trim() ? rawProfile.role : "职位 / Role");
  const summary = escapeHtml(typeof rawProfile.summary === "string" && rawProfile.summary.trim() ? rawProfile.summary : "用一段简短的话概括个人背景、职责和核心价值。");
  const organization = escapeHtml(typeof rawProfile.organization === "string" ? rawProfile.organization : "");
  const location = escapeHtml(typeof rawProfile.location === "string" ? rawProfile.location : "");
  const tagsRaw = Array.isArray(rawProfile.tags) && rawProfile.tags.length ? rawProfile.tags : Array.isArray(slide.tags) ? slide.tags : [];
  const tags = tagsRaw
    .map((tag) => typeof tag === "string" ? tag.trim() : "")
    .filter(Boolean)
    .slice(0, 6)
    .map((tag) => `<div style="padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.14);color:#fff;font-size:12px;font-weight:700">${escapeHtml(tag)}</div>`)
    .join("");
  const facts = [organization, location]
    .filter(Boolean)
    .slice(0, 2)
    .map((fact) => `<div style="padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.16);color:rgba(255,255,255,.92);font-size:12px;font-weight:700">${fact}</div>`)
    .join("");

  const rawSections = Array.isArray(slide.sections) ? slide.sections : Array.isArray(slide.blocks) ? slide.blocks : [];
  const sections = rawSections.slice(0, 4).map((section, index) => {
    const record = section && typeof section === "object" && !Array.isArray(section) ? section : typeof section === "string" ? { title: `模块 ${index + 1}`, text: section } : {};
    const label = escapeHtml(typeof record.label === "string" && record.label.trim() ? record.label : `PART ${String(index + 1).padStart(2, "0")}`);
    const title = escapeHtml(typeof record.title === "string" && record.title.trim() ? record.title : `模块 ${index + 1}`);
    const text = escapeHtml(typeof record.text === "string" ? record.text : "");
    const items = Array.isArray(record.items)
      ? record.items
          .map((item) => typeof item === "string" ? item.trim() : "")
          .filter(Boolean)
          .slice(0, 4)
          .map((item) => `<div style="padding:9px 12px;border-radius:14px;background:rgba(29,111,232,.06);color:#334155;font-size:12px;line-height:1.45">${escapeHtml(item)}</div>`)
          .join("")
      : "";
    return `<div style="min-width:0;padding:16px 16px 14px;border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.98) 0%,rgba(248,251,255,.98) 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 16px 28px rgba(20,61,122,.08)">
      <div style="display:inline-flex;min-height:24px;align-items:center;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d4ed8;font-size:11px;font-weight:800;letter-spacing:.08em">${label}</div>
      <div style="margin-top:10px;color:#143d7a;font-size:20px;font-weight:800;line-height:1.2">${title}</div>
      ${text ? `<div style="margin-top:8px;color:#475569;font-size:13px;line-height:1.55">${text}</div>` : ""}
      ${items ? `<div style="margin-top:12px;display:grid;gap:8px">${items}</div>` : ""}
    </div>`;
  }).join("");

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

function renderChipExplainer(slide) {
  const rawChip =
    slide.chip && typeof slide.chip === "object" && !Array.isArray(slide.chip)
      ? slide.chip
      : slide.center && typeof slide.center === "object" && !Array.isArray(slide.center)
        ? slide.center
        : {};
  const chipTag = escapeHtml(typeof rawChip.tag === "string" && rawChip.tag.trim() ? rawChip.tag : "CHIP");
  const chipTitle = escapeHtml(typeof rawChip.title === "string" && rawChip.title.trim() ? rawChip.title : "智能芯片");
  const chipText = escapeHtml(typeof rawChip.text === "string" && rawChip.text.trim() ? rawChip.text : "作为统一算力与规则中枢，向四个方向分发能力、接口与协同机制。");

  const rawItems = Array.isArray(slide.items)
    ? slide.items
    : Array.isArray(slide.points)
      ? slide.points
      : Array.isArray(slide.blocks)
        ? slide.blocks
        : [];
  if (!rawItems.length) return "";

  const presets = [
    { cardX: 50, cardY: 14, dotX: 50, dotY: 32, align: "center" },
    { cardX: 83, cardY: 50, dotX: 67, dotY: 50, align: "left" },
    { cardX: 50, cardY: 86, dotX: 50, dotY: 68, align: "center" },
    { cardX: 17, cardY: 50, dotX: 33, dotY: 50, align: "right" }
  ];
  const source = rawItems.slice(0, 4);
  const connector = (preset) => {
    const cx = 50;
    const cy = 50;
    const mx = preset.align === "center" ? 50 : (cx + preset.dotX) / 2;
    const my = preset.align === "center" ? (cy + preset.dotY) / 2 : 50;
    return `M ${cx} ${cy} Q ${mx} ${my} ${preset.dotX} ${preset.dotY}`;
  };
  const lines = source.map((_, index) => {
    const preset = presets[index];
    return `<path d="${connector(preset)}" fill="none" stroke="url(#chipBuildStroke)" stroke-width="0.72" stroke-linecap="round" stroke-dasharray="1.9 1.5" opacity=".88"></path>
    <circle cx="${preset.dotX}" cy="${preset.dotY}" r="1.7" fill="#fff" stroke="#2563eb" stroke-width=".7"></circle>`;
  }).join("");
  const cards = source.map((item, index) => {
    const preset = presets[index];
    const record = item && typeof item === "object" && !Array.isArray(item) ? item : typeof item === "string" ? { title: item } : {};
    const tag = escapeHtml(typeof record.tag === "string" ? record.tag : "");
    const title = escapeHtml(typeof record.title === "string" && record.title.trim() ? record.title : typeof record.name === "string" && record.name.trim() ? record.name : `模块 ${index + 1}`);
    const text = escapeHtml(
      typeof record.text === "string" && record.text.trim()
        ? record.text
        : Array.isArray(record.bullets)
          ? record.bullets.map((bullet) => typeof bullet === "string" ? bullet.trim() : "").filter(Boolean).slice(0, 2).join(" / ")
          : ""
    );
    const transform = preset.align === "left" ? "translate(0,-50%)" : preset.align === "right" ? "translate(-100%,-50%)" : "translate(-50%,-50%)";
    const marginLeft = preset.align === "center" ? "0" : "10px";
    return `<div style="position:absolute;left:${preset.cardX}%;top:${preset.cardY}%;transform:${transform};width:25%;min-width:178px;max-width:248px;min-height:88px;padding:16px 18px;border-radius:22px;background:rgba(255,255,255,.97);border:1px solid rgba(215,227,244,.96);box-shadow:0 16px 28px rgba(20,61,122,.08);overflow:hidden;text-align:${preset.align === "center" ? "center" : "left"}">
      <div style="position:absolute;inset:0 auto 0 0;width:7px;background:linear-gradient(180deg,#60a5fa 0%,#2563eb 100%)"></div>
      ${tag ? `<div style="position:relative;margin-left:${marginLeft};color:#2563eb;font-size:11px;font-weight:800;letter-spacing:.08em">${tag}</div>` : ""}
      <div style="position:relative;margin-top:8px;margin-left:${marginLeft};color:#143d7a;font-size:20px;font-weight:800;line-height:1.2">${title}</div>
      ${text ? `<div style="position:relative;margin-top:8px;margin-left:${marginLeft};color:#475569;font-size:13px;line-height:1.45">${text}</div>` : ""}
    </div>`;
  }).join("");

  const topPins = Array.from({ length: 6 }, () => `<span style="display:block;height:10px;border-radius:999px;background:linear-gradient(180deg,#60a5fa 0%,#2563eb 100%);box-shadow:0 6px 10px rgba(20,61,122,.12)"></span>`).join("");
  const sidePins = Array.from({ length: 6 }, () => `<span style="display:block;width:10px;border-radius:999px;background:linear-gradient(180deg,#60a5fa 0%,#2563eb 100%);box-shadow:0 6px 10px rgba(20,61,122,.12)"></span>`).join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.14), transparent 28%),linear-gradient(180deg,#f8fbff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
      <defs>
        <linearGradient id="chipBuildStroke" x1="0" y1="0" x2="1" y2="1">
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

function renderDevelopmentRoute(slide) {
  const rawStages = Array.isArray(slide.stages)
    ? slide.stages
    : Array.isArray(slide.items)
      ? slide.items
      : Array.isArray(slide.blocks)
        ? slide.blocks
        : [];
  if (!rawStages.length) return "";

  const positions = [
    { nodeX: 18, nodeY: 74, cardX: 8, cardY: 78 },
    { nodeX: 36, nodeY: 59, cardX: 24, cardY: 34 },
    { nodeX: 55, nodeY: 47, cardX: 44, cardY: 56 },
    { nodeX: 73, nodeY: 31, cardX: 62, cardY: 8 },
    { nodeX: 86, nodeY: 18, cardX: 70, cardY: 54 }
  ];

  const rawDestination =
    slide.destination && typeof slide.destination === "object" && !Array.isArray(slide.destination)
      ? slide.destination
      : slide.goal && typeof slide.goal === "object" && !Array.isArray(slide.goal)
        ? slide.goal
        : {};
  const destinationTitle = escapeHtml(typeof rawDestination.title === "string" && rawDestination.title.trim() ? rawDestination.title : "目标状态");
  const destinationText = escapeHtml(typeof rawDestination.text === "string" && rawDestination.text.trim() ? rawDestination.text : typeof slide.summary === "string" && slide.summary.trim() ? slide.summary : "形成清晰的发展路径、阶段目标与组织支撑能力。");
  const baseLabel = escapeHtml(typeof slide.base_label === "string" && slide.base_label.trim() ? slide.base_label : "当前基础");

  const stageCards = rawStages.slice(0, 5).map((item, index) => {
    const preset = positions[index] || positions[0];
    const record = item && typeof item === "object" && !Array.isArray(item) ? item : typeof item === "string" ? { title: item, phase: `阶段 ${index + 1}` } : {};
    const phase = escapeHtml(typeof record.phase === "string" && record.phase.trim() ? record.phase : `阶段 ${index + 1}`);
    const title = escapeHtml(typeof record.title === "string" && record.title.trim() ? record.title : typeof record.name === "string" && record.name.trim() ? record.name : `阶段 ${index + 1}`);
    const text = escapeHtml(typeof record.text === "string" ? record.text : "");
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
  }).join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.16), transparent 34%),linear-gradient(180deg,#f7faff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96)">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
      <defs>
        <linearGradient id="developmentRouteBuildStroke" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stop-color="#8fbaf4"></stop>
          <stop offset="100%" stop-color="#1d6fe8"></stop>
        </linearGradient>
      </defs>
      <path d="M10 80 C20 74 24 68 30 63 C38 56 44 52 49 49 C56 43 62 37 68 33 C74 28 81 22 90 14" fill="none" stroke="url(#developmentRouteBuildStroke)" stroke-width="6" stroke-linecap="round"></path>
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

function renderCycleExplainer(slide) {
  const rawCenter = slide.center && typeof slide.center === "object" && !Array.isArray(slide.center) ? slide.center : {};
  const centerTag = escapeHtml(typeof rawCenter.tag === "string" && rawCenter.tag.trim() ? rawCenter.tag : "CYCLE");
  const centerTitle = escapeHtml(typeof rawCenter.title === "string" && rawCenter.title.trim() ? rawCenter.title : "核心闭环");
  const centerText = escapeHtml(typeof rawCenter.text === "string" && rawCenter.text.trim() ? rawCenter.text : "把关键动作组织成持续迭代、持续优化的循环机制。");

  const rawItems = Array.isArray(slide.items)
    ? slide.items
    : Array.isArray(slide.steps)
      ? slide.steps
      : Array.isArray(slide.blocks)
        ? slide.blocks
        : [];
  if (!rawItems.length) return "";

  const source = rawItems.slice(0, 6);
  const count = Math.max(source.length, 1);
  const nodes = source.map((item, index) => {
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

    const record = item && typeof item === "object" && !Array.isArray(item) ? item : typeof item === "string" ? { title: item, tag: `0${index + 1}`.slice(-2) } : {};
    const tag = escapeHtml(typeof record.tag === "string" && record.tag.trim() ? record.tag : `0${index + 1}`.slice(-2));
    const title = escapeHtml(typeof record.title === "string" && record.title.trim() ? record.title : typeof record.name === "string" && record.name.trim() ? record.name : `环节 ${index + 1}`);
    const text = escapeHtml(typeof record.text === "string" ? record.text : "");
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

  const lines = nodes.map((node) => `<path d="${node.path}" fill="none" stroke="#bfdbfe" stroke-width="0.8" stroke-dasharray="1.6 1.8" stroke-linecap="round"></path>`).join("");
  const dots = nodes.map((node) => `<div style="position:absolute;left:${node.x}%;top:${node.y}%;transform:translate(-50%,-50%)"><div style="width:52px;height:52px;display:grid;place-items:center;border-radius:999px;background:#fff;border:6px solid #1d6fe8;box-shadow:0 14px 28px rgba(20,61,122,.12);color:#143d7a;font-size:14px;font-weight:800">${node.tag}</div></div>`).join("");
  const cards = nodes.map((node) => `<div style="position:absolute;left:${node.cardX}%;top:${node.cardY}%;transform:${node.transform};width:180px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,.96);border:1px solid rgba(215,227,244,.96);box-shadow:0 14px 28px rgba(20,61,122,.1)"><div style="color:#143d7a;font-size:15px;font-weight:800;line-height:1.35">${node.title}</div>${node.text ? `<div style="margin-top:6px;color:#475569;font-size:12px;line-height:1.5">${node.text}</div>` : ""}</div>`).join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.16), transparent 34%),linear-gradient(180deg,#f7faff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08)">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
      <defs>
        <linearGradient id="cycleBuildStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1f4f97"></stop>
          <stop offset="100%" stop-color="#1d6fe8"></stop>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="29" fill="none" stroke="#dbeafe" stroke-width="10"></circle>
      <circle cx="50" cy="50" r="29" fill="none" stroke="url(#cycleBuildStroke)" stroke-width="4.8" stroke-dasharray="12 8"></circle>
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

function renderSwimlaneBoard(slide) {
  const rawLanes = Array.isArray(slide.lanes) ? slide.lanes.slice(0, 4) : [];
  if (!rawLanes.length) return "";

  const lanes = rawLanes.map((lane, laneIndex) => {
    const record = lane && typeof lane === "object" && !Array.isArray(lane) ? lane : {};
    const name = escapeHtml(typeof record.name === "string" && record.name.trim() ? record.name : `泳道 ${laneIndex + 1}`);
    const note = escapeHtml(typeof record.note === "string" ? record.note : "");
    const items = Array.isArray(record.items) ? record.items.slice(0, 4) : [];
    const cards = items
      .map((item, itemIndex) => {
        const cell = item && typeof item === "object" && !Array.isArray(item) ? item : typeof item === "string" ? { title: item } : {};
        const tag = escapeHtml(typeof cell.tag === "string" ? cell.tag : "");
        const title = escapeHtml(typeof cell.title === "string" && cell.title.trim() ? cell.title : `动作 ${itemIndex + 1}`);
        const text = escapeHtml(typeof cell.text === "string" ? cell.text : "");
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
  }).join("");

  return `<div style="height:100%;min-height:0;display:grid;grid-template-rows:repeat(${Math.max(lanes.length, 1)},minmax(0,1fr));gap:14px">${lanes}</div>`;
}

function renderKanbanBoard(slide) {
  const rawColumns = Array.isArray(slide.columns) ? slide.columns.slice(0, 4) : [];
  if (!rawColumns.length) return "";

  const iconGlyph = (icon, index) => {
    const key = typeof icon === "string" ? icon : "";
    const map = { todo: "○", doing: "◐", review: "◇", done: "✓" };
    return map[key] ?? ["○", "◐", "◇", "✓"][index % 4];
  };

  const progressText = (value) => {
    if (typeof value === "number") return `${value}%`;
    if (typeof value === "string") return value;
    return "";
  };

  const columns = rawColumns.map((column, columnIndex) => {
    const record = column && typeof column === "object" && !Array.isArray(column) ? column : {};
    const title = escapeHtml(typeof record.title === "string" && record.title.trim() ? record.title : `列 ${columnIndex + 1}`);
    const icon = escapeHtml(iconGlyph(record.icon, columnIndex));
    const cardsRaw = Array.isArray(record.cards) ? record.cards.slice(0, 4) : [];
    const cards = cardsRaw
      .map((card, cardIndex) => {
        const item = card && typeof card === "object" && !Array.isArray(card) ? card : {};
        const owner = escapeHtml(typeof item.owner === "string" && item.owner.trim() ? item.owner : "负责人待补充");
        const task = escapeHtml(
          typeof item.task === "string" && item.task.trim()
            ? item.task
            : typeof item.title === "string" && item.title.trim()
              ? item.title
              : `任务 ${cardIndex + 1}`
        );
        const progress = escapeHtml(progressText(item.progress));
        const due = escapeHtml(typeof item.due === "string" ? item.due : "");
        const note = escapeHtml(typeof item.note === "string" ? item.note : "");
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
  }).join("");

  return `<div style="height:100%;min-height:0;display:grid;gap:16px;grid-template-columns:repeat(${Math.max(rawColumns.length, 1)},minmax(0,1fr))">${columns}</div>`;
}

function renderMonthCalendar(slide) {
  const monthTitle = escapeHtml(typeof slide.month === "string" && slide.month.trim() ? slide.month : "2026 / 08");
  const subtitle = escapeHtml(typeof slide.subtitle === "string" ? slide.subtitle : "");
  const weekdaysSource = Array.isArray(slide.weekdays) && slide.weekdays.length >= 7 ? slide.weekdays.slice(0, 7) : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekdays = weekdaysSource.map((item) => `<div style="display:flex;align-items:center;justify-content:center;min-height:38px;border-radius:16px;background:rgba(29,111,232,.08);color:#1d6fe8;font-size:13px;font-weight:800;letter-spacing:.04em">${escapeHtml(String(item ?? ""))}</div>`).join("");

  const toneStyle = (tone) => {
    const key = typeof tone === "string" ? tone.toLowerCase() : "";
    if (["green", "success"].includes(key)) return "background:rgba(22,163,74,.12);color:#15803d";
    if (["amber", "orange", "warning", "yellow"].includes(key)) return "background:rgba(245,158,11,.14);color:#b45309";
    if (["red", "danger", "alert"].includes(key)) return "background:rgba(239,68,68,.12);color:#b91c1c";
    return "background:rgba(29,111,232,.12);color:#1d4ed8";
  };

  const legendSource = Array.isArray(slide.legend) && slide.legend.length
    ? slide.legend.slice(0, 4)
    : [
        { label: "关键会议", tone: "blue" },
        { label: "里程碑", tone: "amber" },
        { label: "已完成", tone: "green" },
        { label: "风险提醒", tone: "red" }
      ];
  const legend = legendSource.map((item) => {
    const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
    const label = escapeHtml(typeof record.label === "string" && record.label.trim() ? record.label : "事项");
    return `<div style="display:inline-flex;align-items:center;gap:8px;color:#64748b;font-size:12px;font-weight:700"><span style="width:10px;height:10px;border-radius:999px;${toneStyle(record.tone)}"></span><span>${label}</span></div>`;
  }).join("");

  const rawDays = Array.isArray(slide.days) && slide.days.length
    ? slide.days.slice(0, 35)
    : Array.from({ length: 35 }, (_, index) => ({
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

  const days = rawDays.map((item, index) => {
    const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
    const rawDay = record.day ?? record.date ?? index + 1;
    const day = escapeHtml(typeof rawDay === "string" || typeof rawDay === "number" ? String(rawDay) : String(index + 1));
    const muted = Boolean(record.muted);
    const today = Boolean(record.today);
    const eventsSource = Array.isArray(record.events) ? record.events.slice(0, 2) : [];
    const events = eventsSource.map((event, eventIndex) => {
      const detail = event && typeof event === "object" && !Array.isArray(event) ? event : { label: event };
      const label = escapeHtml(typeof detail.label === "string" && detail.label.trim() ? detail.label : `事项 ${eventIndex + 1}`);
      return `<div style="min-width:0;padding:7px 8px;border-radius:12px;font-size:11px;font-weight:700;line-height:1.35;word-break:break-word;${toneStyle(detail.tone)}">${label}</div>`;
    }).join("");
    const moreCount = Array.isArray(record.events) && record.events.length > 2 ? record.events.length - 2 : 0;
    return `<div style="min-width:0;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr);gap:10px;padding:12px;border-radius:20px;overflow:hidden;background:${muted ? "rgba(244,247,251,.88)" : "rgba(255,255,255,.98)"};border:1px solid ${today ? "rgba(29,111,232,.52)" : "rgba(215,227,244,.92)"};box-shadow:${today ? "0 16px 26px rgba(29,111,232,.12)" : "0 12px 22px rgba(20,61,122,.06)"};opacity:${muted ? ".72" : "1"}">
      <div style="color:#143d7a;font-size:16px;font-weight:800;line-height:1">${day}</div>
      <div style="min-height:0;display:grid;align-content:start;gap:6px;overflow:hidden">
        ${events}
        ${moreCount ? `<div style="color:#64748b;font-size:11px;font-weight:700">+${moreCount}</div>` : ""}
      </div>
    </div>`;
  }).join("");

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

function renderSymmetricBlock(obj, fallbackTitle) {
  const block = asObject(obj) ?? {};
  const title = escapeHtml(typeof block.title === "string" && block.title.trim() ? block.title : fallbackTitle);
  const imageObj = asObject(block.image) ?? null;
  const imageSrc =
    typeof block.image === "string"
      ? block.image
      : typeof imageObj?.src === "string"
        ? imageObj.src
        : typeof imageObj?.url === "string"
          ? imageObj.url
          : typeof block.image_path === "string"
            ? block.image_path
            : typeof block.image_url === "string"
              ? block.image_url
              : "";
  const text = typeof block.text === "string" && block.text.trim() ? `<div style="white-space:pre-wrap;color:#334155;font-size:14px;line-height:1.65">${escapeHtml(block.text)}</div>` : "";
  const bullets = renderBullets(block.bullets);
  const blocks = renderBlocks(block.blocks);
  const table = block.table ? renderTable({ table: block.table }) : "";
  const image = imageSrc
    ? `<div class="card"><div class="cardTitle">${title}</div><img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(typeof imageObj?.alt === "string" ? imageObj.alt : title)}" style="width:100%;max-height:320px;object-fit:contain;border-radius:16px;background:#f8fafc;padding:10px;border:1px solid rgba(215,227,244,.8)" /></div>`
    : "";
  const body = image || text || bullets || blocks || table || `<div class="card"><div class="cardTitle">${title}</div></div>`;
  if (body.startsWith("<div class=\"card\">") || body.startsWith("<table")) return body;
  return `<div class="card"><div class="cardTitle">${title}</div>${body}</div>`;
}

function renderSymmetricSplit(slide) {
  const left = asObject(slide.left) ?? asObject(Array.isArray(slide.columns) ? slide.columns[0] : null) ?? {};
  const right = asObject(slide.right) ?? asObject(Array.isArray(slide.columns) ? slide.columns[1] : null) ?? {};
  const centerLabel = escapeHtml(typeof slide.center_label === "string" && slide.center_label.trim() ? slide.center_label : "VS");
  const leftTag = escapeHtml(typeof left.tag === "string" && left.tag.trim() ? left.tag : "LEFT");
  const rightTag = escapeHtml(typeof right.tag === "string" && right.tag.trim() ? right.tag : "RIGHT");
  const leftTitle = escapeHtml(typeof left.title === "string" && left.title.trim() ? left.title : "左侧内容");
  const rightTitle = escapeHtml(typeof right.title === "string" && right.title.trim() ? right.title : "右侧内容");
  const leftBody = renderSymmetricBlock(left, "左侧内容");
  const rightBody = renderSymmetricBlock(right, "右侧内容");

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

function renderPetalExplainer(slide) {
  const rawItems = Array.isArray(slide.items)
    ? slide.items
    : Array.isArray(slide.points)
      ? slide.points
      : Array.isArray(slide.blocks)
        ? slide.blocks
        : [];
  const core = slide.core && typeof slide.core === "object" && !Array.isArray(slide.core) ? slide.core : {};
  const coreTitle = escapeHtml(
    typeof core.title === "string" && core.title.trim()
      ? core.title
      : typeof slide.core_title === "string" && slide.core_title.trim()
        ? slide.core_title
        : typeof slide.center_title === "string" && slide.center_title.trim()
          ? slide.center_title
          : "核心标题"
  );
  const presets = [
    { left: 50, top: 22, rotate: 0, innerRotate: 0 },
    { left: 78, top: 50, rotate: 90, innerRotate: -90 },
    { left: 50, top: 78, rotate: 180, innerRotate: -180 },
    { left: 22, top: 50, rotate: -90, innerRotate: 90 }
  ];

  const petals = Array.from({ length: 4 }, (_, index) => {
    const item = rawItems[index];
    const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
    const title = escapeHtml(
      typeof record.title === "string" && record.title.trim()
        ? record.title
        : typeof record.name === "string" && record.name.trim()
          ? record.name
          : `花瓣 ${index + 1}`
    );
    const tag = escapeHtml(typeof record.tag === "string" ? record.tag : "");
    const bullets = Array.isArray(record.bullets)
      ? record.bullets.map((entry) => String(entry ?? "").trim()).filter(Boolean).slice(0, 2).join(" / ")
      : "";
    const text = escapeHtml(typeof record.text === "string" && record.text.trim() ? record.text : bullets);
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

function renderFanExplainer(slide) {
  const rawItems = Array.isArray(slide.items)
    ? slide.items
    : Array.isArray(slide.points)
      ? slide.points
      : Array.isArray(slide.blocks)
        ? slide.blocks
        : [];
  const coreRecord = slide.core && typeof slide.core === "object" && !Array.isArray(slide.core)
    ? slide.core
    : slide.center && typeof slide.center === "object" && !Array.isArray(slide.center)
      ? slide.center
      : {};
  const core = {
    title: escapeHtml(
      typeof coreRecord.title === "string" && coreRecord.title.trim()
        ? coreRecord.title
        : typeof slide.core_title === "string" && slide.core_title.trim()
          ? slide.core_title
          : typeof slide.center_title === "string" && slide.center_title.trim()
            ? slide.center_title
            : "核心主题"
    ),
    tag: escapeHtml(typeof coreRecord.tag === "string" && coreRecord.tag.trim() ? coreRecord.tag : "FAN"),
    text: escapeHtml(
      typeof coreRecord.text === "string" && coreRecord.text.trim()
        ? coreRecord.text
        : "从一个核心主题向外展开四个关键解释模块。"
    )
  };
  const presets = [
    { angle: -34, zIndex: 1 },
    { angle: -12, zIndex: 3 },
    { angle: 12, zIndex: 4 },
    { angle: 34, zIndex: 2 }
  ];

  const blades = Array.from({ length: 4 }, (_, index) => {
    const item = rawItems[index];
    const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
    const title = escapeHtml(
      typeof record.title === "string" && record.title.trim()
        ? record.title
        : typeof record.name === "string" && record.name.trim()
          ? record.name
          : `扇面 ${index + 1}`
    );
    const tag = escapeHtml(typeof record.tag === "string" && record.tag.trim() ? record.tag : "");
    const bullets = Array.isArray(record.bullets)
      ? record.bullets.map((entry) => String(entry ?? "").trim()).filter(Boolean).slice(0, 2).join(" / ")
      : "";
    const text = escapeHtml(
      typeof record.text === "string" && record.text.trim()
        ? record.text
        : bullets
    );
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

function renderUpwardArrows(slide) {
  const rawItems = Array.isArray(slide.items)
    ? slide.items
    : Array.isArray(slide.steps)
      ? slide.steps
      : Array.isArray(slide.stages)
        ? slide.stages
        : Array.isArray(slide.blocks)
          ? slide.blocks
          : [];
  const heights = [48, 58, 70, 82];

  const arrows = Array.from({ length: 4 }, (_, index) => {
    const item = rawItems[index];
    const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
    const title = escapeHtml(
      typeof record.title === "string" && record.title.trim()
        ? record.title
        : typeof record.name === "string" && record.name.trim()
          ? record.name
          : `阶段 ${index + 1}`
    );
    const tag = escapeHtml(
      typeof record.tag === "string" && record.tag.trim()
        ? record.tag
        : typeof record.phase === "string" && record.phase.trim()
          ? record.phase
          : ""
    );
    const bullets = Array.isArray(record.bullets)
      ? record.bullets.map((entry) => String(entry ?? "").trim()).filter(Boolean).slice(0, 2).join(" / ")
      : "";
    const text = escapeHtml(typeof record.text === "string" && record.text.trim() ? record.text : bullets);
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

function renderScreenExplainer(slide) {
  const screenRecord = slide.screen && typeof slide.screen === "object" && !Array.isArray(slide.screen)
    ? slide.screen
    : slide.center && typeof slide.center === "object" && !Array.isArray(slide.center)
      ? slide.center
      : {};
  const imageRecord = screenRecord.image && typeof screenRecord.image === "object" && !Array.isArray(screenRecord.image)
    ? screenRecord.image
    : slide.image && typeof slide.image === "object" && !Array.isArray(slide.image)
      ? slide.image
      : {};
  const screen = {
    tag: escapeHtml(typeof screenRecord.tag === "string" && screenRecord.tag.trim() ? screenRecord.tag : "SCREEN"),
    title: escapeHtml(
      typeof screenRecord.title === "string" && screenRecord.title.trim()
        ? screenRecord.title
        : typeof slide.center_title === "string" && slide.center_title.trim()
          ? slide.center_title
          : "核心屏幕"
    ),
    text: escapeHtml(
      typeof screenRecord.text === "string" && screenRecord.text.trim()
        ? screenRecord.text
        : "把核心界面、关键结论或主流程放在中心屏幕中，周围通过浮窗解释补充信息。"
    ),
    imageSrc: escapeHtml(
      typeof imageRecord.src === "string" && imageRecord.src.trim()
        ? imageRecord.src
        : typeof imageRecord.url === "string" && imageRecord.url.trim()
          ? imageRecord.url
          : ""
    ),
    imageAlt: escapeHtml(typeof imageRecord.alt === "string" && imageRecord.alt.trim() ? imageRecord.alt : "screen image")
  };
  const presets = [
    { left: 15, top: 20, rotate: -7 },
    { left: 85, top: 22, rotate: 6 },
    { left: 14, top: 76, rotate: 5 },
    { left: 86, top: 74, rotate: -6 }
  ];
  const rawItems = Array.isArray(slide.items)
    ? slide.items
    : Array.isArray(slide.windows)
      ? slide.windows
      : Array.isArray(slide.blocks)
        ? slide.blocks
        : [];
  const windows = Array.from({ length: 4 }, (_, index) => {
    const item = rawItems[index];
    const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
    const tag = escapeHtml(typeof record.tag === "string" ? record.tag : "");
    const title = escapeHtml(
      typeof record.title === "string" && record.title.trim()
        ? record.title
        : typeof record.name === "string" && record.name.trim()
          ? record.name
          : `浮窗 ${index + 1}`
    );
    const bullets = Array.isArray(record.bullets)
      ? record.bullets.map((entry) => String(entry ?? "").trim()).filter(Boolean).slice(0, 2).join(" / ")
      : "";
    const text = escapeHtml(typeof record.text === "string" && record.text.trim() ? record.text : bullets);
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
          ${screen.imageSrc
            ? `<img src="${screen.imageSrc}" alt="${screen.imageAlt}" style="width:100%;height:100%;object-fit:cover" />`
            : `<div style="position:relative;min-height:280px;height:100%;display:grid;align-content:center;justify-items:center;gap:10px;padding:24px 30px;text-align:center;overflow:hidden">
                <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(191,219,254,.22) 1px, transparent 1px),linear-gradient(90deg, rgba(191,219,254,.22) 1px, transparent 1px);background-size:22px 22px"></div>
                <div style="position:relative;z-index:1;display:inline-flex;align-items:center;min-height:24px;padding:0 10px;border-radius:999px;background:rgba(29,111,232,.08);color:#1d6fe8;font-size:11px;font-weight:800;letter-spacing:.08em">${screen.tag}</div>
                <div style="position:relative;z-index:1;color:#143d7a;font-size:28px;font-weight:800;line-height:1.25">${screen.title}</div>
                <div style="position:relative;z-index:1;max-width:82%;color:#475569;font-size:14px;line-height:1.6">${screen.text}</div>
              </div>`}
        </div>
      </div>
      <div style="width:132px;height:18px;margin:14px auto 0;border-radius:999px;background:linear-gradient(180deg, rgba(29,111,232,.24) 0%, rgba(29,111,232,.08) 100%)"></div>
    </div>
    ${windows}
  </div>`;
}

function renderStageChevrons(slide) {
  const colors = [
    "linear-gradient(135deg, #eef6ff 0%, #dbeafe 100%)",
    "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    "linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)",
    "linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)",
    "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)"
  ];
  const rawStages = Array.isArray(slide.stages)
    ? slide.stages
    : Array.isArray(slide.steps)
      ? slide.steps
      : Array.isArray(slide.phases)
        ? slide.phases
        : Array.isArray(slide.items)
          ? slide.items
          : [];
  const count = Math.max(rawStages.slice(0, 5).length, 1);
  const items = rawStages.slice(0, 5).map((item, index) => {
    const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
    const tag = escapeHtml(
      typeof record.tag === "string" && record.tag.trim()
        ? record.tag
        : typeof record.phase === "string" && record.phase.trim()
          ? record.phase
          : ""
    );
    const title = escapeHtml(
      typeof record.title === "string" && record.title.trim()
        ? record.title
        : typeof record.name === "string" && record.name.trim()
          ? record.name
          : `阶段 ${index + 1}`
    );
    const bullets = Array.isArray(record.bullets)
      ? record.bullets.map((entry) => String(entry ?? "").trim()).filter(Boolean).slice(0, 2).join(" / ")
      : "";
    const text = escapeHtml(typeof record.text === "string" && record.text.trim() ? record.text : bullets);
    const isFirst = index === 0;
    const isLast = index === rawStages.slice(0, 5).length - 1;
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

function renderStageStaircase(slide) {
  const heights = [38, 50, 64, 78, 90];
  const rawStages = Array.isArray(slide.stages)
    ? slide.stages
    : Array.isArray(slide.steps)
      ? slide.steps
      : Array.isArray(slide.phases)
        ? slide.phases
        : Array.isArray(slide.items)
          ? slide.items
          : [];
  const count = Math.max(rawStages.slice(0, 5).length, 1);
  const items = rawStages.slice(0, 5).map((item, index) => {
    const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
    const tag = escapeHtml(
      typeof record.tag === "string" && record.tag.trim()
        ? record.tag
        : typeof record.phase === "string" && record.phase.trim()
          ? record.phase
          : ""
    );
    const title = escapeHtml(
      typeof record.title === "string" && record.title.trim()
        ? record.title
        : typeof record.name === "string" && record.name.trim()
          ? record.name
          : `阶段 ${index + 1}`
    );
    const bullets = Array.isArray(record.bullets)
      ? record.bullets.map((entry) => String(entry ?? "").trim()).filter(Boolean).slice(0, 2).join(" / ")
      : "";
    const text = escapeHtml(typeof record.text === "string" && record.text.trim() ? record.text : bullets);
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
    <div style="position:relative;z-index:1;height:100%;min-height:0;display:grid;grid-template-columns:repeat(${count}, minmax(0,1fr));gap:16px;align-items:end;padding:8% 6% 10%">${items}</div>
  </div>`;
}

function renderStageZigzag(slide) {
  const rawStages = Array.isArray(slide.stages)
    ? slide.stages
    : Array.isArray(slide.steps)
      ? slide.steps
      : Array.isArray(slide.phases)
        ? slide.phases
        : Array.isArray(slide.items)
          ? slide.items
          : [];
  const count = Math.max(rawStages.slice(0, 6).length, 1);
  const items = rawStages.slice(0, 6).map((item, index) => {
    const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
    const tag = escapeHtml(
      typeof record.tag === "string" && record.tag.trim()
        ? record.tag
        : typeof record.phase === "string" && record.phase.trim()
          ? record.phase
          : ""
    );
    const title = escapeHtml(
      typeof record.title === "string" && record.title.trim()
        ? record.title
        : typeof record.name === "string" && record.name.trim()
          ? record.name
          : `阶段 ${index + 1}`
    );
    const bullets = Array.isArray(record.bullets)
      ? record.bullets.map((entry) => String(entry ?? "").trim()).filter(Boolean).slice(0, 2).join(" / ")
      : "";
    const text = escapeHtml(typeof record.text === "string" && record.text.trim() ? record.text : bullets);
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
    <div style="position:relative;z-index:1;height:100%;min-height:0;display:grid;grid-template-columns:repeat(${count}, minmax(0,1fr));gap:12px;padding:6% 5%">${items}</div>
  </div>`;
}

function renderTripleMetrics(slide) {
  const rawMetrics = Array.isArray(slide.metrics)
    ? slide.metrics
    : Array.isArray(slide.cards)
      ? slide.cards
      : Array.isArray(slide.items)
        ? slide.items
        : [];
  const positions = [
    { left: 22, size: 24, valueSize: 42 },
    { left: 50, size: 30, valueSize: 54 },
    { left: 78, size: 24, valueSize: 42 }
  ];

  const circles = Array.from({ length: 3 }, (_, index) => {
    const item = rawMetrics[index];
    const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
    const label = escapeHtml(
      typeof record.label === "string" && record.label.trim()
        ? record.label
        : typeof record.title === "string" && record.title.trim()
          ? record.title
          : `指标 ${index + 1}`
    );
    const tag = escapeHtml(typeof record.tag === "string" ? record.tag : "");
    const value =
      typeof record.value === "number" || typeof record.value === "string"
        ? escapeHtml(String(record.value))
        : "-";
    const unit = escapeHtml(typeof record.unit === "string" ? record.unit : "");
    const note = escapeHtml(
      typeof record.note === "string" && record.note.trim()
        ? record.note
        : typeof record.text === "string" && record.text.trim()
          ? record.text
          : ""
    );
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

function renderStaffList(slide) {
  const rawItems = Array.isArray(slide.items)
    ? slide.items
    : Array.isArray(slide.bullets)
      ? slide.bullets
      : [];
  const eyebrow =
    typeof slide.eyebrow === "string" && slide.eyebrow.trim() ? escapeHtml(slide.eyebrow) : "Staff List";
  const subtitle = typeof slide.subtitle === "string" && slide.subtitle.trim() ? escapeHtml(slide.subtitle) : "";
  const fallbackTitles = ["战略方向", "能力建设", "执行机制", "落地保障", "结果复盘"];
  const fallbackTexts = ["先明确主线判断。", "再铺开关键能力。", "同步拆到责任动作。", "最后补齐治理与复盘。", "形成下一轮迭代输入。"];
  const sourceItems = rawItems.length
    ? rawItems
    : Array.from({ length: 4 }, (_, index) => ({
        tag: `章节 ${String(index + 1).padStart(2, "0")}`,
        title: fallbackTitles[index] ?? `条目 ${index + 1}`,
        text: fallbackTexts[index] ?? ""
      }));
  const count = Math.max(sourceItems.slice(0, 5).length, 1);
  const items = sourceItems.slice(0, 5).map((item, index) => {
    const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
    const title = escapeHtml(
      typeof item === "string" && item.trim()
        ? item
        : typeof record.title === "string" && record.title.trim()
          ? record.title
          : typeof record.name === "string" && record.name.trim()
            ? record.name
            : `条目 ${index + 1}`
    );
    const tag = escapeHtml(
      typeof record.tag === "string" && record.tag.trim()
        ? record.tag
        : typeof record.label === "string" && record.label.trim()
          ? record.label
          : `重点 ${String(index + 1).padStart(2, "0")}`
    );
    const bullets = Array.isArray(record.bullets)
      ? record.bullets.map((entry) => String(entry ?? "").trim()).filter(Boolean).slice(0, 2).join(" / ")
      : "";
    const text = escapeHtml(
      typeof record.text === "string" && record.text.trim()
        ? record.text
        : typeof record.note === "string" && record.note.trim()
          ? record.note
          : bullets
    );
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
  }).join("");

  return `<div style="position:relative;height:100%;min-height:0;overflow:hidden;border-radius:28px;background:radial-gradient(circle at top right, rgba(77,160,255,.16), transparent 30%),radial-gradient(circle at left bottom, rgba(244,199,106,.14), transparent 28%),linear-gradient(180deg,#f8fbff 0%,#eef4fb 100%);border:1px solid rgba(215,227,244,.96);box-shadow:0 20px 36px rgba(20,61,122,.08);display:grid;grid-template-rows:auto minmax(0,1fr);gap:16px;padding:18px 20px 20px">
    <div style="position:absolute;width:220px;height:220px;top:-72px;right:-42px;border-radius:999px;background:radial-gradient(circle, rgba(147,197,253,.28) 0%, rgba(147,197,253,.06) 58%, transparent 74%)"></div>
    <div style="position:absolute;width:180px;height:180px;bottom:-54px;left:-36px;border-radius:999px;background:radial-gradient(circle, rgba(245,158,11,.18) 0%, rgba(245,158,11,.04) 58%, transparent 74%)"></div>
    <div style="position:relative;z-index:1;display:grid;gap:8px">
      <div style="display:inline-flex;align-items:center;width:fit-content;min-height:28px;padding:0 12px;border-radius:999px;background:linear-gradient(135deg, rgba(29,111,232,.12) 0%, rgba(77,160,255,.12) 100%);color:#1d6fe8;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">${eyebrow}</div>
      ${subtitle ? `<div style="max-width:82%;color:#475569;font-size:13px;line-height:1.55">${subtitle}</div>` : ""}
    </div>
    <div style="position:relative;z-index:1;min-height:0;display:grid;grid-template-rows:repeat(${count}, minmax(0,1fr));gap:12px">${items}</div>
  </div>`;
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
  if (layout === "sector_explainer") {
    return renderSectorExplainer(slide);
  }
  if (layout === "before_after") {
    return renderBeforeAfter(slide);
  }
  if (layout === "gauge") {
    return renderGauge(slide);
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
