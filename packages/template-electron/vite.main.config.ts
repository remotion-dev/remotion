import {defineConfig} from "vite";

export default defineConfig({
  define: {
    // `ws` can break when bundled by Vite/Rollup if it tries to use its optional native helpers.
    // Keep the bundled version on the pure-JS path so packaging works without manually copying `ws`.
    "process.env.WS_NO_BUFFER_UTIL": JSON.stringify("1"),
    "process.env.WS_NO_UTF_8_VALIDATE": JSON.stringify("1"),
  },
  build: {
    rollupOptions: {
      external: ["@remotion/bundler"],
    },
  },
});
