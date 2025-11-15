import {playwright} from '@vitest/browser-playwright';
import path from 'node:path';
import {defineConfig} from 'vitest/config';

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;

function truthy<T>(value: T): value is Truthy<T> {
	return Boolean(value);
}

export default defineConfig({
	test: {
		browser: {
			enabled: true,
			provider: playwright(),
			instances: [
				{
					browser: 'chromium',
					viewport: {width: 1280, height: 720},
					provider: playwright({
						launchOptions: {
							channel: 'chrome',
						},
						actionTimeout: 5_000,
					}),
				} as const,
				!process.env.CI
					? ({
							browser: 'firefox',
							viewport: {width: 1280, height: 720},
						} as const)
					: undefined,
			].filter(truthy),
			headless: true,
			screenshotFailures: false,
		},
	},
	publicDir: path.join(__dirname, '..', 'example-videos', 'videos'),
});
