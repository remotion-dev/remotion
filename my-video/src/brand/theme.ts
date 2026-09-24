// FinHub brand tokens for real videos, set by the owner (2026-09-24): the logo
// blue (#0064A8, sampled from finhub-logo.png) with the web brand's navy and an
// amber accent. The logo's "NETWORKS" wordmark is black, so the logo always sits
// on a white card; four of the five badges need a light background too (see
// "Badges and logos" in AGENTS.md).
export const brand = {
  background: "#0B1F3D",
  panel: "rgba(11, 31, 61, 0.9)",
  card: "#ffffff",
  text: "#ffffff",
  textDim: "#c9d3e6",
  textOnCard: "#0B1F3D",
  accent: "#F5A524",
  primary: "#0064A8",
  highlight: "#FFB938",
  good: "#3DDC97",
  bad: "#FF5A5F",
} as const;
