import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';
import base from './vitest.config';

// Run with Chrome 157+ to exercise both DOM and nested native capture:
// REMOTION_CHROME_EXECUTABLE=/path/to/chrome bunx vitest --run --config vitest.html-in-canvas.config.ts
export default defineConfig({
	...base,
	test: {
		...base.test,
		include: ['src/test/html-in-canvas.test.tsx'],
		browser: {
			...base.test?.browser,
			instances: [
				{
					browser: 'chromium',
					provider: playwright({
						launchOptions: {
							...(process.env.REMOTION_CHROME_EXECUTABLE
								? {executablePath: process.env.REMOTION_CHROME_EXECUTABLE}
								: {channel: 'chrome'}),
							args: [
								'--enable-features=CanvasDrawElement',
								'--enable-blink-features=CanvasDrawElement',
								'--enable-unsafe-webgpu',
								'--use-gl=angle',
								process.platform === 'darwin'
									? '--use-angle=metal'
									: '--use-angle=swiftshader',
							],
						},
					}),
					viewport: {width: 1280, height: 720},
				},
			],
		},
	},
});
