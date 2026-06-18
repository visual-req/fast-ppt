import type { Deck, JsonObject, JsonValue, Slide } from "./types";

const arrayKeys = new Set(["bullets", "blocks", "rows", "items", "quadrants", "cards", "columns"]);

function parseScalar(raw: string): JsonValue {
  const trimmed = raw.trim();
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

function parseInlineObject(raw: string): JsonObject {
  const inside = raw.trim().slice(1, -1).trim();
  if (!inside) return {};
  const parts = splitTopLevel(inside, ",");
  const out: JsonObject = {};
  for (const part of parts) {
    const [k, v] = splitOnce(part, ":");
    if (!k) continue;
    out[k.trim()] = parseScalar((v ?? "").trim());
  }
  return out;
}

function splitOnce(input: string, delimiter: string): [string, string] | [string] {
  const idx = input.indexOf(delimiter);
  if (idx < 0) return [input];
  return [input.slice(0, idx), input.slice(idx + delimiter.length)];
}

function splitTopLevel(input: string, delimiterChar: string): string[] {
  const out: string[] = [];
  let buf = "";
  let quote: "'" | '"' | null = null;
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

function parseYamlFrontmatter(lines: string[], startLineIndex: number): { meta: JsonObject; nextIndex: number } {
  const meta: JsonObject = {};
  let i = startLineIndex;
  if (lines[i]?.trim() !== "---") return { meta, nextIndex: startLineIndex };
  i++;
  const block: string[] = [];
  while (i < lines.length && lines[i]?.trim() !== "---") {
    block.push(lines[i] ?? "");
    i++;
  }
  if (lines[i]?.trim() === "---") i++;
  const parsed = parseSimpleYaml(block);
  return { meta: parsed, nextIndex: i };
}

function parseSimpleYaml(lines: string[]): JsonObject {
  const root: JsonObject = {};
  const stack: Array<{ indent: number; obj: JsonObject }> = [{ indent: -1, obj: root }];

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, "  ");
    if (!line.trim()) continue;
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    const trimmed = line.trim();
    const [k, v] = splitOnce(trimmed, ":");
    const key = k?.trim();
    if (!key) continue;
    const valueRaw = (v ?? "").trim();
    while (stack.length > 1 && stack[stack.length - 1]!.indent >= indent) stack.pop();
    const parent = stack[stack.length - 1]!.obj;
    if (!valueRaw) {
      const child: JsonObject = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
      continue;
    }
    parent[key] = parseScalar(valueRaw);
  }

  return root;
}

type Container = JsonObject | JsonValue[];

function isArrayContainer(container: Container): container is JsonValue[] {
  return Array.isArray(container);
}

function createChildContainerForKey(key: string): Container {
  if (arrayKeys.has(key)) return [];
  return {};
}

export function parseOutlineMarkdown(markdown: string): Deck {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const { meta, nextIndex } = parseYamlFrontmatter(lines, 0);

  const slides: Slide[] = [];
  let currentSlide: Slide | null = null;
  let cursor = nextIndex;

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
    const bulletLines: string[] = [];
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

  const deckMeta = (meta.deck && typeof meta.deck === "object" && !Array.isArray(meta.deck) ? meta.deck : undefined) as
    | JsonObject
    | undefined;

  return {
    deck: deckMeta
      ? {
          aspect_ratio: typeof deckMeta.aspect_ratio === "string" ? deckMeta.aspect_ratio : undefined,
          style: typeof deckMeta.style === "string" ? deckMeta.style : undefined,
          language: typeof deckMeta.language === "string" ? deckMeta.language : undefined
        }
      : undefined,
    slides
  };
}

function applyBullets(slide: Slide, bulletLines: string[]) {
  const root: Container = slide as unknown as JsonObject;
  const stack: Array<{ indent: number; container: Container }> = [{ indent: -1, container: root }];

  for (const raw of bulletLines) {
    const match = raw.match(/^(\s*)-\s+(.*)$/);
    if (!match) continue;
    const indent = match[1]?.length ?? 0;
    const content = match[2] ?? "";
    while (stack.length > 1 && stack[stack.length - 1]!.indent >= indent) stack.pop();
    const parent = stack[stack.length - 1]!.container;

    const maybeKv = splitOnce(content, ":");
    const hasColon = maybeKv.length === 2;
    if (!hasColon) {
      if (!isArrayContainer(parent)) continue;
      parent.push(parseScalar(content));
      continue;
    }

    const key = (maybeKv[0] ?? "").trim();
    const valueRaw = (maybeKv[1] ?? "").trim();

    if (isArrayContainer(parent)) {
      const obj: JsonObject = {};
      if (!valueRaw) {
        obj[key] = createChildContainerForKey(key) as unknown as JsonValue;
        parent.push(obj);
        stack.push({ indent, container: obj[key] as unknown as Container });
        continue;
      }
      obj[key] = parseScalar(valueRaw);
      parent.push(obj);
      stack.push({ indent, container: obj });
      continue;
    }

    if (!valueRaw) {
      const child = createChildContainerForKey(key);
      parent[key] = child as unknown as JsonValue;
      stack.push({ indent, container: child });
      continue;
    }
    parent[key] = parseScalar(valueRaw);
  }
}

