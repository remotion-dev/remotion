import {ACCENT, BLUE, DARK, FONT} from "../tydo/TyDoOverlays";

// FinHub brand tokens for real videos: Finance Hub's own logo blue, web-brand
// navy and amber accent, as TyDoReel defines them, and Be Vietnam Pro, which
// has every Vietnamese diacritic. Call useTyDoFont() in a composition that
// shows text so the font's local files load before a frame renders.
export const brand = {
  background: DARK,
  panel: "rgba(11, 31, 61, 0.88)",
  card: "#ffffff",
  text: "#ffffff",
  textDim: "#c7d2e0",
  textOnCard: DARK,
  accent: ACCENT,
  blue: BLUE,
  font: FONT,
} as const;
