import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const presetFile = path.resolve(__dirname, "..", "ppt-viewer", "src", "lib", "stylePresets.json");
const presetConfig = JSON.parse(fs.readFileSync(presetFile, "utf8"));
const presets = presetConfig.presets ?? {};
const defaultKey = typeof presetConfig.default === "string" && presetConfig.default in presets ? presetConfig.default : "consulting";

export function getStylePreset(styleName) {
  if (typeof styleName === "string" && styleName in presets) return presets[styleName];
  return presets[defaultKey];
}

export function listStylePresetKeys() {
  return Object.keys(presets);
}

export { presetFile };
