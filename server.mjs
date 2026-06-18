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
