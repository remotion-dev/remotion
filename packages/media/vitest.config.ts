import path from 'node:path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		browser: {
			provider: 'webdriverio',
			instances: [{browser: 'chrome'}],
			headless: true,
		},
	},
	publicDir: path.join(__dirname, '..', 'example-videos', 'videos'),
});
