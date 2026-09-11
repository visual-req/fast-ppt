import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { exportDeckToPptx, loadDeckObject } from "../lib/pptxExport.mjs";
import { exportDeckToPptxShots } from "../lib/pptxShotExport.mjs";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const workPptDir = path.join(repoRoot, "work", "ppt");

function normalizeProjectName(raw) {
  if (typeof raw !== "string") return "";
  return raw.trim().replace(/^(\.\.(\/|\\|$))+/, "").replace(/[\/\\]+/g, "");
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listProjectDirNames() {
  const entries = await fs.readdir(workPptDir, { withFileTypes: true });
  // work/ppt 下的项目目录可能是软链接，Dirent.isDirectory() 对软链返回 false，需要一并纳入。
  return entries.filter((item) => item.isDirectory() || item.isSymbolicLink()).map((item) => item.name);
}

async function findProjectDirByToken(token) {
  const normalized = normalizeProjectName(token);
  if (!normalized) return "";
  const names = await listProjectDirNames();
  if (names.includes(normalized)) return path.join(workPptDir, normalized);
  const padded = /^\d+$/.test(normalized) ? normalized.padStart(3, "0") : normalized;
  const matched = names.filter((name) => name === padded || name.startsWith(`${padded}_`)).sort()[0];
  return matched ? path.join(workPptDir, matched) : "";
}

async function listProjectDirs() {
  const names = await listProjectDirNames();
  const dirs = [];
  for (const name of names) {
    const dirPath = path.join(workPptDir, name);
    if (await fileExists(path.join(dirPath, "deck.json"))) dirs.push(dirPath);
  }
  return dirs.sort();
}

async function inspectPptx(outFile) {
  const { stdout } = await execFileAsync("unzip", ["-Z1", outFile]);
  const lines = stdout.split("\n").filter(Boolean);
  const slideXmlCount = lines.filter((line) => /^ppt\/slides\/slide\d+\.xml$/.test(line)).length;
  return { slideXmlCount };
}

async function exportOne(projectDir, options = {}) {
  const { styleOverride = "", mode = "native", viewerBaseUrl = "", shotsDir = "" } = options;
  const { deck, slides } = await loadDeckObject(projectDir);
  const effectiveStyle = styleOverride || deck?.style || "";
  let pageSize = "";
  const buffer =
    mode === "shots"
      ? await exportDeckToPptxShots(projectDir, {
          style: effectiveStyle,
          viewerBaseUrl,
          shotsDir,
          onProgress: ({ index, total, bytes, width, height, deviceScaleFactor }) => {
            pageSize = `${Math.round(width * deviceScaleFactor)}x${Math.round(height * deviceScaleFactor)}`;
            console.log(
              `  [${String(index).padStart(2, " ")}/${total}] ${pageSize} ${(bytes / 1024).toFixed(0)}KB`
            );
          }
        })
      : await exportDeckToPptx(projectDir, effectiveStyle ? { style: effectiveStyle } : undefined);
  const outDir = path.join(projectDir, "exports");
  await fs.mkdir(outDir, { recursive: true });
  const suffix = [mode === "shots" ? "shots" : "", styleOverride ? effectiveStyle : ""].filter(Boolean).join(".");
  const outFile = path.join(outDir, suffix ? `deck.${suffix}.pptx` : "deck.pptx");
  await fs.writeFile(outFile, buffer);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const stat = await fs.stat(outFile);
  const inspect = await inspectPptx(outFile);
  const report = {
    project: path.basename(projectDir),
    title: deck?.title ?? "",
    style: effectiveStyle,
    mode,
    renderer: mode === "shots" ? "headless-chrome-screenshot" : "pptxgenjs-native",
    output: path.relative(repoRoot, outFile),
    bytes: stat.size,
    sha256: hash,
    expected_slides: slides.length,
    actual_slide_xml: inspect.slideXmlCount,
    ok: slides.length === inspect.slideXmlCount
  };
  if (pageSize) report.image_px = pageSize;
  await fs.writeFile(path.join(outDir, "export-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

async function main() {
  const args = process.argv.slice(2);
  const projectIndex = args.indexOf("--project");
  const projectToken = projectIndex >= 0 ? args[projectIndex + 1] : "";
  const styleIndex = args.indexOf("--style");
  const styleOverride = styleIndex >= 0 ? normalizeProjectName(args[styleIndex + 1]) : "";
  const modeIndex = args.indexOf("--mode");
  const mode = modeIndex >= 0 && args[modeIndex + 1] === "shots" ? "shots" : "native";
  const viewerIndex = args.indexOf("--viewer");
  const viewerBaseUrl = viewerIndex >= 0 ? args[viewerIndex + 1] : "";
  const shotsDirIndex = args.indexOf("--shots-dir");
  const shotsDir = shotsDirIndex >= 0 ? args[shotsDirIndex + 1] : "";
  const all = args.includes("--all");
  const targets = all
    ? await listProjectDirs()
    : projectToken
      ? [await findProjectDirByToken(projectToken)].filter(Boolean)
      : [];

  if (!targets.length) {
    console.error(
      "用法: node scripts/export-pptx.mjs --project 002 [--style demo] [--mode native|shots] [--viewer http://127.0.0.1:9030/] [--shots-dir /tmp/shots]\n" +
        "      node scripts/export-pptx.mjs --all [--style demo]\n" +
        "说明: --mode shots 走“逐页高清截图铺满”，需要 viewer 已启动（npm run viewer）。"
    );
    process.exit(1);
  }

  const reports = [];
  for (const target of targets) {
    const report = await exportOne(target, { styleOverride, mode, viewerBaseUrl, shotsDir });
    reports.push(report);
    console.log(
      `${report.ok ? "OK" : "FAIL"} ${report.project} [${report.mode}] -> ${report.output} (${report.actual_slide_xml}/${report.expected_slides})`
    );
  }

  if (reports.some((report) => !report.ok)) process.exit(1);
}

main().catch((error) => {
  console.error(error?.stack ?? String(error));
  process.exit(1);
});
