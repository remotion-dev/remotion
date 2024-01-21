import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 90000,
    maxConcurrency: 1,
    pool: "forks",
    poolOptions: {
      forks: {
        minForks: 1,
        maxForks: 1,
        singleFork: true,
      },
    },
  },
});
