import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exportDeckToPptx as exportDeckToPptxShared } from "./lib/pptxExport.mjs";

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
  let decoded = requestPath;
  try {
    decoded = decodeURIComponent(requestPath);
  } catch {}
  const normalized = path.posix.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");
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

function normalizeProjectName(raw) {
  if (typeof raw !== "string") return "";
  const value = raw.trim();
  if (!value) return "";
  return value.replace(/^(\.\.(\/|\\|$))+/, "").replace(/[\/\\]+/g, "");
}

async function findProjectDirByToken(token) {
  const normalized = normalizeProjectName(token);
  if (!normalized) return "";

  const entries = await fs.readdir(workPptDir, { withFileTypes: true });
  const dirNames = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  if (dirNames.includes(normalized)) return path.resolve(workPptDir, normalized);

  const padded = /^\d+$/.test(normalized) ? normalized.padStart(3, "0") : normalized;
  const prefixMatches = dirNames
    .filter((name) => name === padded || name.startsWith(`${padded}_`))
    .sort((a, b) => a.localeCompare(b));

  if (prefixMatches.length) return path.resolve(workPptDir, prefixMatches[0]);
  return "";
}

async function resolveProjectDir(searchParams) {
  const requestedProject = normalizeProjectName(searchParams?.get("project"));
  if (requestedProject) {
    const matchedDir = await findProjectDirByToken(requestedProject);
    if (matchedDir) return matchedDir;
    return path.resolve(workPptDir, requestedProject);
  }

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

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    if (url.pathname === "/health") {
      send(res, 200, "application/json; charset=utf-8", JSON.stringify({ ok: true }));
      return;
    }

    if (url.pathname === "/api/deck" || url.pathname === "/api/outline") {
      try {
        const projectDir = await resolveProjectDir(url.searchParams);
        const content = await loadDeck(projectDir);
        send(res, 200, "application/json; charset=utf-8", content);
      } catch (e) {
        send(res, 404, "text/plain; charset=utf-8", `PPT JSON 产物不存在\n${String(e?.stack ?? e)}`);
      }
      return;
    }

    if (url.pathname === "/api/export/pptx") {
      try {
        const projectDir = await resolveProjectDir(url.searchParams);
        const style = normalizeProjectName(url.searchParams.get("style"));
        const buf = await exportDeckToPptxShared(projectDir, style ? { style } : undefined);
        res.statusCode = 200;
        res.setHeader("content-type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
        res.setHeader("content-disposition", `attachment; filename="${style ? `deck-${style}` : "deck"}.pptx"`);
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
