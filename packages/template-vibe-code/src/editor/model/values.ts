// Helpers for the CSS-ish values used by the interactivity schema.

export const parseTranslate = (value: unknown): { x: number; y: number } => {
  if (typeof value !== "string") {
    return { x: 0, y: 0 };
  }

  const [x = "0", y = "0"] = value.trim().split(/\s+/);
  return { x: parseFloat(x) || 0, y: parseFloat(y) || 0 };
};

export const serializeTranslate = ({ x, y }: { x: number; y: number }) =>
  `${formatNumber(x)}px ${formatNumber(y)}px`;

export const parseRotation = (value: unknown): number => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const trimmed = value.trim();
  if (trimmed.endsWith("rad")) {
    return (parseFloat(trimmed) * 180) / Math.PI;
  }

  if (trimmed.endsWith("turn")) {
    return parseFloat(trimmed) * 360;
  }

  return parseFloat(trimmed) || 0;
};

export const serializeRotation = (degrees: number) =>
  `${formatNumber(degrees)}deg`;

export const parseScale = (value: unknown): number => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return parseFloat(value.trim().split(/\s+/)[0]) || 1;
  }

  return 1;
};

export const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const formatNumber = (value: number, digits = 2) => {
  const rounded = Number(value.toFixed(digits));
  return String(Object.is(rounded, -0) ? 0 : rounded);
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const formatTimecode = (frame: number, fps: number) => {
  const totalSeconds = Math.floor(frame / fps);
  const frames = Math.floor(frame % fps);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(minutes / 60);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${hours > 0 ? `${pad(hours)}:` : ""}${pad(minutes % 60)}:${pad(seconds)}:${pad(frames)}`;
};

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const formatDuration = (ms: number) => {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};
