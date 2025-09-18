import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		browser: {
			provider: 'webdriverio',
			instances: [{browser: 'chrome'}],
			headless: true,
		},
	},
});
