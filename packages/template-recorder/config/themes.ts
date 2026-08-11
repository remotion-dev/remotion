import { z } from "zod";

export const theme = z.enum(["light", "dark"]);
export type Theme = z.infer<typeof theme>;

type ColorTheme = {
  BACKGROUND: string;
  CAPTIONS_BACKGROUND: string;
  BORDER_COLOR: string;
  WORD_COLOR_ON_BG_APPEARED: string;
  WORD_COLOR_ON_BG_GREYED: string;
  WORD_HIGHLIGHT_COLOR: string;
  ACCENT_COLOR: string;
  CTA_BUTTON_COLOR: string;
  CTA_BUTTON_BACKGROUND_COLOR: string;
  ENDCARD_TEXT_COLOR: string;
};

export const COLORS: { [key in Theme]: ColorTheme } = {
  light: {
    BACKGROUND: "#FAFAFA",
    CAPTIONS_BACKGROUND: "#fff",
    BORDER_COLOR: "#EBEBEB",
    WORD_COLOR_ON_BG_APPEARED: "black",
    WORD_COLOR_ON_BG_GREYED: "rgba(0, 0, 0, 0.3)",
    WORD_HIGHLIGHT_COLOR: "#3B82EB",
    ACCENT_COLOR: "#3B82EB",
    CTA_BUTTON_COLOR: "white",
    CTA_BUTTON_BACKGROUND_COLOR: "black",
    ENDCARD_TEXT_COLOR: "black",
  },
  dark: {
    BACKGROUND: "#000000",
    CAPTIONS_BACKGROUND: "#0A0A0A",
    BORDER_COLOR: "#1F1F1F",
    WORD_COLOR_ON_BG_APPEARED: "white",
    WORD_COLOR_ON_BG_GREYED: "rgba(255, 255, 255, 0.3)",
    WORD_HIGHLIGHT_COLOR: "#3B82EB",
    ACCENT_COLOR: "#3B82EB",
    CTA_BUTTON_COLOR: "black",
    CTA_BUTTON_BACKGROUND_COLOR: "white",
    ENDCARD_TEXT_COLOR: "white",
  },
};
