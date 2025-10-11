import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { reactRouter } from "@react-router/dev/vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [reactRouter(), tsconfigPaths(), tailwindcss()],
});
