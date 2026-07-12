import presetConfig from "./stylePresets.json";

export type StylePreset = {
  name: string;
  page_bg: string;
  surface: string;
  surface_alt: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  cover_bg: string;
  cover_bg_alt: string;
  cover_overlay: string;
  cover_glow: string;
  cover_line: string;
};

const presets = presetConfig.presets as Record<string, StylePreset>;
const defaultKey = presetConfig.default in presets ? presetConfig.default : "consulting";

export function getStylePreset(styleName?: string): StylePreset {
  if (styleName && styleName in presets) return presets[styleName];
  return presets[defaultKey];
}

export function listStylePresetKeys(): string[] {
  return Object.keys(presets);
}
