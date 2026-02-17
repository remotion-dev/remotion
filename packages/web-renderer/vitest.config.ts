import react from '@vitejs/plugin-react';
import {playwright} from '@vitest/browser-playwright';
import path from 'node:path';
import {defineConfig} from 'vitest/config';

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;

function truthy<T>(value: T): value is Truthy<T> {
	return Boolean(value);
}

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
			].filter(truthy),
			headless: true,
			screenshotFailures: false,
		},
	},
	esbuild: {
		target: 'es2022',
	},
	plugins: [react()],
	publicDir: path.join(__dirname, '..', 'example-videos', 'videos'),
});
