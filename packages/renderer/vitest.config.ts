import {defineConfig} from 'vitest/config';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

export default defineConfig({
	test: {
		environment: 'jsdom',
		include: ['**/*.{test,spec}.{ts,mts,cts,tsx}'],
		setupFiles: ['./src/test/setup.ts'],
		threads: false,
	},
});
