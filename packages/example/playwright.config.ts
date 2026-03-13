import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	globalSetup: './e2e/global-setup.mts',
	globalTeardown: './e2e/global-teardown.mts',
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
