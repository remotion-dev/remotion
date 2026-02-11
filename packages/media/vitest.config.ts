import {playwright} from '@vitest/browser-playwright';
import path from 'node:path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		browser: {
			provider: playwright(),
			instances: [
				{
					browser: 'chromium',
					provider: playwright({
						launchOptions: {
							channel: 'chrome',
						},
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
