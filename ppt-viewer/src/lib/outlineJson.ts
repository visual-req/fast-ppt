import type { Deck, DeckMeta, Slide } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toDeckMeta(value: unknown): DeckMeta | undefined {
  if (!isRecord(value)) return undefined;
  const aspect_ratio = typeof value.aspect_ratio === "string" ? value.aspect_ratio : undefined;
  const style = typeof value.style === "string" ? value.style : undefined;
  const language = typeof value.language === "string" ? value.language : undefined;
  return { aspect_ratio, style, language };
}

function toSlide(value: unknown): Slide {
  if (!isRecord(value)) return {};
  return value as unknown as Slide;
}

export function parseOutlineJson(text: string): Deck {
  const parsed = JSON.parse(text) as unknown;
  if (!isRecord(parsed)) return { slides: [] };
  const deck = toDeckMeta(parsed.deck);
  const slidesRaw = Array.isArray(parsed.slides) ? parsed.slides : [];
  const slides = slidesRaw.map(toSlide);
  return { deck, slides };
}

