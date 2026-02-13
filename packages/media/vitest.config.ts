import {playwright} from '@vitest/browser-playwright';
import path from 'node:path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		maxWorkers: process.env.CI ? 1 : 5,
		browser: {
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
				},
				{
					browser: 'firefox',
				},
			],
			headless: true,
			screenshotFailures: false,
		},
	},
	publicDir: path.join(__dirname, '..', 'example-videos', 'videos'),
});
