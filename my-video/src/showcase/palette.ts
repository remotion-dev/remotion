// Shared visual language for the showcase reel, so every scene reads as one video.
export const palette = {
  bg: "#0b1120",
  bgAlt: "#111827",
  accent: "#6366f1",
  accent2: "#22d3ee",
  text: "#f8fafc",
  textDim: "#94a3b8",
} as const;

export const gradientBg = `radial-gradient(circle at 30% 20%, ${palette.bgAlt} 0%, ${palette.bg} 65%)`;
