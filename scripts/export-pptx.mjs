import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { exportDeckToPptx, loadDeckObject } from "../lib/pptxExport.mjs";

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

async function findProjectDirByToken(token) {
  const normalized = normalizeProjectName(token);
  if (!normalized) return "";
  const entries = await fs.readdir(workPptDir, { withFileTypes: true });
  const names = entries.filter((item) => item.isDirectory()).map((item) => item.name);
  if (names.includes(normalized)) return path.join(workPptDir, normalized);
  const padded = /^\d+$/.test(normalized) ? normalized.padStart(3, "0") : normalized;
  const matched = names.filter((name) => name === padded || name.startsWith(`${padded}_`)).sort()[0];
  return matched ? path.join(workPptDir, matched) : "";
}

async function listProjectDirs() {
  const entries = await fs.readdir(workPptDir, { withFileTypes: true });
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const deckPath = path.join(workPptDir, entry.name, "deck.json");
    if (await fileExists(deckPath)) dirs.push(path.join(workPptDir, entry.name));
  }
  return dirs.sort();
}

async function inspectPptx(outFile) {
  const { stdout } = await execFileAsync("unzip", ["-Z1", outFile]);
  const lines = stdout.split("\n").filter(Boolean);
  const slideXmlCount = lines.filter((line) => /^ppt\/slides\/slide\d+\.xml$/.test(line)).length;
  return { slideXmlCount };
}

async function exportOne(projectDir, styleOverride = "") {
  const { deck, slides } = await loadDeckObject(projectDir);
  const effectiveStyle = styleOverride || deck?.style || "";
  const buffer = await exportDeckToPptx(projectDir, effectiveStyle ? { style: effectiveStyle } : undefined);
  const outDir = path.join(projectDir, "exports");
  await fs.mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, styleOverride ? `deck.${effectiveStyle}.pptx` : "deck.pptx");
  await fs.writeFile(outFile, buffer);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const stat = await fs.stat(outFile);
  const inspect = await inspectPptx(outFile);
  const report = {
    project: path.basename(projectDir),
    title: deck?.title ?? "",
    style: effectiveStyle,
    output: path.relative(repoRoot, outFile),
    bytes: stat.size,
    sha256: hash,
    expected_slides: slides.length,
    actual_slide_xml: inspect.slideXmlCount,
    ok: slides.length === inspect.slideXmlCount
  };
  await fs.writeFile(path.join(outDir, "export-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

async function main() {
  const args = process.argv.slice(2);
  const projectIndex = args.indexOf("--project");
  const projectToken = projectIndex >= 0 ? args[projectIndex + 1] : "";
  const styleIndex = args.indexOf("--style");
  const styleOverride = styleIndex >= 0 ? normalizeProjectName(args[styleIndex + 1]) : "";
  const all = args.includes("--all");
  const targets = all
    ? await listProjectDirs()
    : projectToken
      ? [await findProjectDirByToken(projectToken)].filter(Boolean)
      : [];

  if (!targets.length) {
    console.error("用法: node scripts/export-pptx.mjs --project 002 [--style demo]  或  node scripts/export-pptx.mjs --all [--style demo]");
    process.exit(1);
  }

  const reports = [];
  for (const target of targets) {
    const report = await exportOne(target, styleOverride);
    reports.push(report);
    console.log(`${report.ok ? "OK" : "FAIL"} ${report.project} -> ${report.output} (${report.actual_slide_xml}/${report.expected_slides})`);
  }

  if (reports.some((report) => !report.ok)) process.exit(1);
}

main().catch((error) => {
  console.error(error?.stack ?? String(error));
  process.exit(1);
});
