export const waitForNoInput = (signal: AbortSignal, ms: number) => {
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
