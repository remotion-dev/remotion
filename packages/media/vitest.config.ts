import path from 'node:path';
import {playwright} from '@vitest/browser-playwright';
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
		fileParallelism: false,
		browser: {
			provider: playwright({launchOptions: {channel: 'chrome'}}),
			instances: [{browser: 'chromium'}],
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
