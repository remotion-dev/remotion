import {defineConfig, devices} from '@playwright/test';

const port = 3137;

export default defineConfig({
	testDir: './e2e',
	outputDir: './node_modules/.cache/browser-bundler-test-results',
	timeout: 120_000,
	expect: {timeout: 60_000},
	fullyParallel: false,
	workers: 1,
	use: {
		baseURL: `http://localhost:${port}`,
		trace: 'retain-on-failure',
	},
	projects: [
		{
			name: 'chromium',
			use: {...devices['Desktop Chrome']},
		},
	],
	webServer: {
		command: `bun run testnextjs && bunx next start --port ${port}`,
		url: `http://localhost:${port}`,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
