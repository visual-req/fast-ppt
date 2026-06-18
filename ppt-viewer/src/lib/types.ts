export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type DeckMeta = {
  aspect_ratio?: string;
  style?: string;
  language?: string;
};

export type Slide = JsonObject & {
  layout_type?: string;
  title?: string;
};

export type Deck = {
  deck?: DeckMeta;
  slides: Slide[];
};

