import {readFileSync} from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;

function truthy<T>(value: T): value is Truthy<T> {
	return Boolean(value);
}

export default defineConfig({
	test: {
		include: ['src/test/**/*.test.{ts,tsx}'],
		maxWorkers: process.env.CI ? 1 : 5,
		browser: {
			enabled: true,
			provider: playwright(),
			instances: [
				{
					browser: 'chromium',
					provider: playwright({
						launchOptions: {
							channel: 'chrome',
						},
						actionTimeout: 5_000,
					}),
					viewport: {width: 1280, height: 720},
				} as const,
				{
					browser: 'firefox',
					viewport: {width: 1280, height: 720},
				} as const,
				{
					browser: 'webkit',
					viewport: {width: 1280, height: 720},
				} as const,
			].filter(truthy),
			headless: true,
			screenshotFailures: false,
		},
	},
	esbuild: {
		target: 'es2022',
	},
	plugins: [
		react(),
		{
			name: 'cors-image-fixture',
			configureServer(server) {
				server.middlewares.use((request, response, next) => {
					if (request.url === '/1.jpg?cors-denied') {
						response.setHeader(
							'X-Test-Local-Address',
							request.socket.localAddress!,
						);
						response.removeHeader('Access-Control-Allow-Origin');
						response.setHeader('Content-Type', 'image/jpeg');
						response.end(
							readFileSync(
								path.join(__dirname, '..', 'example-videos', 'videos', '1.jpg'),
							),
						);
						return;
					}

					next();
				});
			},
		},
	],
	publicDir: path.join(__dirname, '..', 'example-videos', 'videos'),
});
