import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		setupFiles: ['./src/test/setup.ts'],
		maxConcurrency: 1,
		testTimeout: 90000,
		pool: 'threads',
		poolOptions: {
			threads: {
				minThreads: 1,
				maxThreads: 1,
			},
		},
	},
});
