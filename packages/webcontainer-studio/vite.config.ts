import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

// WebContainers require SharedArrayBuffer which needs COOP/COEP headers
const coopCoepPlugin = (): Plugin => ({
	name: "coop-coep-headers",
	configureServer(server) {
		server.middlewares.use((_req, res, next) => {
			res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
			res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
			next();
		});
	},
	configurePreviewServer(server) {
		server.middlewares.use((_req, res, next) => {
			res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
			res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
			next();
		});
	},
});

export default defineConfig({
	plugins: [coopCoepPlugin(), react()],
	server: {
		port: 3100,
	},
});
