import path from 'node:path';
import {webdriverio} from '@vitest/browser-webdriverio';
import {defineConfig} from 'vitest/config';

export default defineConfig({
	resolve: {dedupe: ['react', 'react-dom', 'remotion']},
	// Avoid discovering another React runtime midway through browser tests.
	optimizeDeps: {
		include: [
			'react',
			'react/jsx-runtime',
			'react/jsx-dev-runtime',
			'react-dom/client',
			'remotion',
			'@remotion/player',
		],
	},
	test: {
		browser: {
			provider: webdriverio(),
			instances: [{browser: 'chrome'}],
			headless: true,
			screenshotFailures: false,
			expect: {
				toMatchScreenshot: {
					resolveScreenshotPath: ({
						arg,
						browserName,
						ext,
						root,
						screenshotDirectory,
						testFileDirectory,
						testFileName,
					}) => {
						return path.resolve(
							root,
							testFileDirectory,
							screenshotDirectory,
							testFileName,
							`${arg}-${browserName}${ext}`,
						);
					},
				},
			},
		},
	},
	publicDir: path.join(__dirname, '..', 'example-videos', 'videos'),
});
