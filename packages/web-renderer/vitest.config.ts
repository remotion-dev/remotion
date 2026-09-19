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
		maxWorkers: process.env.CI ? 1 : 5,
		browser: {
			enabled: true,
			provider: playwright(),
			instances: [
				{
					browser: 'chromium',
					name: 'chromium-native',
					include: ['src/test/native-mask-readiness.test.ts'],
					provider: playwright({
						launchOptions: {
							channel: 'chrome',
							args: ['--enable-blink-features=CanvasDrawElement'],
						},
					}),
				} as const,
				{
					browser: 'chromium',
					exclude: ['src/test/native-mask-readiness.test.ts'],
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
					exclude: ['src/test/native-mask-readiness.test.ts'],
					viewport: {width: 1280, height: 720},
				} as const,
				{
					browser: 'webkit',
					exclude: ['src/test/native-mask-readiness.test.ts'],
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
