import { defineConfig } from "vite";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import vue from "@vitejs/plugin-vue";

// 截图版导出需要在独立 Node 子进程里执行：headless Chrome 在 vite dev server 进程内
// 会因 GPU 进程问题崩溃（SIGTRAP / "GPU process isn't usable"），在纯 Node 子进程中则正常。
// 子进程直接复用 scripts/export-pptx.mjs，保证 CLI 与 HTTP 两条链路只有一份渲染实现。
function runShotExport(repoRoot, { projectDir, style, viewerBaseUrl }) {
  const script = path.resolve(repoRoot, "scripts", "export-pptx.mjs");
  const args = [script, "--project", path.basename(projectDir), "--mode", "shots", "--viewer", viewerBaseUrl];
  if (style) args.push("--style", style);

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: repoRoot, stdio: ["ignore", "pipe", "pipe"] });
    let log = "";
    const collect = (chunk) => {
      const text = chunk.toString();
      log += text;
      process.stdout.write(text);
    };
    child.stdout?.on("data", collect);
    child.stderr?.on("data", collect);
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`截图导出子进程退出码 ${code}：\n${log}`));
        return;
      }
      const suffix = ["shots", style].filter(Boolean).join(".");
      resolve(path.join(projectDir, "exports", `deck.${suffix}.pptx`));
    });
  });
}

export default defineConfig({
  plugins: [
    vue(),
    {
      name: "ppt-viewer-deck-api",
      configureServer(server) {
        const repoRoot = path.resolve(process.cwd(), "..");

        const workDir = path.resolve(repoRoot, "work");
        const workPptDir = path.resolve(workDir, "ppt");

        // dev server 的 module runner 在重启后会被关闭，配置里任何 import() 都会被
        // Vite 改写为 runner 请求，从而抛 "Vite module runner has been closed."。
        // 用 Function 构造出的原生 import 绕开 Vite 的模块转换，直接由 Node 加载导出模块。
        const nativeImport = new Function("specifier", "return import(specifier)");

        async function loadExporter() {
          const url = pathToFileURL(path.resolve(repoRoot, "lib/pptxExport.mjs")).href;
          return await nativeImport(url);
        }

        async function fileExists(p) {
          try {
            await fs.access(p);
            return true;
          } catch {
            return false;
          }
        }

        function normalizeProjectName(value) {
          return typeof value === "string" ? value.trim() : "";
        }

        async function findProjectDirByToken(token) {
          const normalized = normalizeProjectName(token);
          if (!normalized) return null;

          const exact = path.resolve(workPptDir, normalized);
          if (await fileExists(exact)) return exact;

          try {
            const entries = await fs.readdir(workPptDir, { withFileTypes: true });
            const candidates = entries
              .filter((e) => e.isDirectory())
              .map((e) => e.name)
              .filter((name) => name === normalized || name.startsWith(`${normalized}_`));
            if (candidates.length > 0) return path.resolve(workPptDir, candidates.sort()[0]);
          } catch {}

          return null;
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
          if (deckProjectEnv) return path.resolve(workPptDir, deckProjectEnv);

          try {
            const entries = await fs.readdir(workPptDir, { withFileTypes: true });
            const candidates = entries
              .filter((e) => (e.isDirectory() || e.isSymbolicLink()) && /^\d{3}_.+/.test(e.name))
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
          return workPptDir;
        }

        async function loadDeck(projectDir) {
          const deckPath = path.join(projectDir, "deck.json");
          if (await fileExists(deckPath)) {
            const manifest = JSON.parse(await fs.readFile(deckPath, "utf8"));
            const deck = manifest && typeof manifest === "object" ? manifest.deck ?? {} : {};
            const slideFiles = Array.isArray(manifest?.slide_files) ? manifest.slide_files : [];
            const slides = [];
            for (const rel of slideFiles) {
              const full = path.join(projectDir, rel);
              slides.push(JSON.parse(await fs.readFile(full, "utf8")));
            }
            return JSON.stringify({ deck, slides });
          }

          return await fs.readFile(path.join(projectDir, "outline.json"), "utf8");
        }

        const serveDeck = async (req, res) => {
          try {
            const reqUrl = new URL(req.url ?? "/", "http://localhost");
            const projectDir = await resolveProjectDir(reqUrl.searchParams);
            const content = await loadDeck(projectDir);
            res.statusCode = 200;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end(content);
          } catch (e) {
            res.statusCode = 500;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end(String(e?.stack ?? e));
          }
        };

        server.middlewares.use("/api/deck", serveDeck);
        server.middlewares.use("/api/outline", serveDeck);
        server.middlewares.use("/api/export/pptx", async (req, res) => {
          try {
            const reqUrl = new URL(req.url ?? "/", "http://localhost");
            const projectDir = await resolveProjectDir(reqUrl.searchParams);
            const style = normalizeProjectName(reqUrl.searchParams.get("style"));
            const mode = normalizeProjectName(reqUrl.searchParams.get("mode")) === "shots" ? "shots" : "native";
            let out;
            if (mode === "shots") {
              const outFile = await runShotExport(repoRoot, {
                projectDir,
                style,
                viewerBaseUrl: `http://${req.headers.host ?? "127.0.0.1:5173"}/`
              });
              out = await fs.readFile(outFile);
            } else {
              const { exportDeckToPptx } = await loadExporter();
              out = await exportDeckToPptx(projectDir, style ? { style } : undefined);
            }
            res.statusCode = 200;
            res.setHeader("content-type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
            res.setHeader("content-disposition", `attachment; filename="${mode === "shots" ? "deck-shots" : "deck"}${style ? `-${style}` : ""}.pptx"`);
            res.end(out);
          } catch (e) {
            res.statusCode = 500;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end(String(e?.stack ?? e));
          }
        });

        server.middlewares.use("/work", async (req, res) => {
          try {
            const reqUrl = new URL(req.url ?? "/", "http://localhost");
            const filePath = path.join(repoRoot, "work", reqUrl.pathname.replace(/^\/+/, ""));
            const content = await fs.readFile(filePath);
            const ext = path.extname(filePath).toLowerCase();
            const mime =
              ext === ".svg"
                ? "image/svg+xml"
                : ext === ".png"
                  ? "image/png"
                  : ext === ".jpg" || ext === ".jpeg"
                    ? "image/jpeg"
                    : ext === ".webp"
                      ? "image/webp"
                      : ext === ".json"
                        ? "application/json; charset=utf-8"
                        : "application/octet-stream";
            res.statusCode = 200;
            res.setHeader("content-type", mime);
            res.end(content);
          } catch (e) {
            res.statusCode = 404;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end(String(e?.stack ?? e));
          }
        });
      }
    }
  ],
  server: {
    port: 5173
  }
});
