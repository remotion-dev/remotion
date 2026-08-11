import react from '@vitejs/plugin-react';
import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
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
			],
			headless: true,
			screenshotFailures: false,
		},
	},
	esbuild: {
		target: 'es2022',
	},
	plugins: [react()],
});
