import {defineConfig, devices} from '@playwright/test';

// Below every OS's ephemeral port range (macOS and Windows start at 49152,
// Linux at 32768), so an outgoing connection cannot already occupy it.
const port = 31338;

export default defineConfig({
	testDir: './e2e',
	outputDir: './dist/e2e-test-results',
	timeout: 90_000,
	expect: {
		timeout: 60_000,
	},
	fullyParallel: false,
	workers: 1,
	retries: 0,
	use: {
		baseURL: `http://127.0.0.1:${port}`,
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: {...devices['Desktop Chrome']},
		},
	],
	webServer: {
		command: `PORT=${port} bun e2e/server.ts`,
		url: `http://127.0.0.1:${port}`,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
