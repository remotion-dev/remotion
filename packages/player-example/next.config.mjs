/** @type {import('next').NextConfig} */
const nextConfig = {
	agentRules: false,
	async headers() {
		return ['/browser-bundler', '/_next/:path*'].map((source) => ({
			source,
			headers: [
				{key: 'Cross-Origin-Opener-Policy', value: 'same-origin'},
				{key: 'Cross-Origin-Embedder-Policy', value: 'require-corp'},
			],
		}));
	},
	webpack(config) {
		config.module.rules.push(
			// A blob: WASI worker needs absolute URLs for importScripts().
			{test: /browser-bundler-worker\.js$/, parser: {url: true}},
			{test: /\.wasm$/, type: 'asset/resource'},
			{test: /wasi-worker-browser\.mjs$/, type: 'asset/resource'},
		);
		return config;
	},
};

export default nextConfig;
