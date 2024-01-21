import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		testTimeout: 90000,
		maxConcurrency: 1,
		pool: 'threads',
		poolOptions: {
			threads: {
				maxThreads: 2,
				minThreads: 0,
			},
		},
	},
});
