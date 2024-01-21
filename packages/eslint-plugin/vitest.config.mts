import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 90000,
    maxConcurrency: 1,
    threads: false,
    setupFiles: ["src/tests/setup.ts"],
  },
});
