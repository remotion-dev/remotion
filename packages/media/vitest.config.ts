import path from 'node:path';
import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';
import {cachedExampleMediaPaths} from '../example-videos/src/cached-example-media';

export default defineConfig({
	plugins: [
		{
			name: 'cached-example-media',
			configureServer: (server) => {
				server.middlewares.use((request, _response, next) => {
					if (request.url?.split('?')[0] === '/bigbuckbunny.mp4') {
						request.url = `/@fs/${cachedExampleMediaPaths.bigBuckBunny.split(path.sep).join('/')}`;
					}

					next();
				});
			},
		},
	],
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
			provider: playwright(),
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
