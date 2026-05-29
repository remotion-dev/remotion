import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
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
						actionTimeout: 5000,
					}),
					viewport: {width: 640, height: 480},
				} as const,
			],
			headless: true,
			screenshotFailures: false,
		},
	},
	esbuild: {
		target: 'es2022',
	},
});
