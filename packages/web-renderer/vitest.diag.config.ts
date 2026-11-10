import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';
import base from './vitest.config';

// Temporary: diagnose multi-second stalls on macOS CI runners.
// VITE_WR_DIAG=1 bunx vitest --run --config vitest.diag.config.ts <files>
export default defineConfig({
	...base,
	test: {
		...base.test,
		setupFiles: ['src/test/diag-setup.ts'],
		browser: {
			...base.test?.browser,
			instances: [
				{
					browser: 'chromium',
					provider: playwright({
						launchOptions: {channel: 'chrome'},
						actionTimeout: 5_000,
					}),
					viewport: {width: 1280, height: 720},
				},
			],
		},
	},
});
