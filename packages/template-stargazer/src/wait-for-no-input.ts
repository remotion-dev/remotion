import { getRemotionEnvironment } from "remotion";

export const waitForNoInput = (signal: AbortSignal, ms: number) => {
  // Don't wait during rendering
  if (getRemotionEnvironment().isRendering) {
    return Promise.resolve();
  }

  if (signal.aborted) {
    return Promise.reject(new Error("stale"));
  }

  return Promise.race<void>([
    new Promise<void>((_, reject) => {
      signal.addEventListener("abort", () => {
        reject(new Error("stale"));
      });
    }),
    new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    }),
  ]);
};
