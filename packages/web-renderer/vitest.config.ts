import {webdriverio} from '@vitest/browser-webdriverio';
import {defineConfig} from 'vitest/config';

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;

function truthy<T>(value: T): value is Truthy<T> {
	return Boolean(value);
}

export default defineConfig({
	test: {
		browser: {
			enabled: true,
			provider: webdriverio(),
			instances: [
				{browser: 'chrome'} as const,
				!process.env.CI ? ({browser: 'firefox'} as const) : undefined,
			].filter(truthy),
			headless: true,
			screenshotFailures: false,
		},
	},
});
