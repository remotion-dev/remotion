import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	timeout: 60_000,
	expect: {
		timeout: 10_000,
	},
	fullyParallel: false,
	workers: 1,
	retries: 0,
	use: {
		baseURL: 'http://localhost:3123',
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: {...devices['Desktop Chrome']},
		},
	],
});
