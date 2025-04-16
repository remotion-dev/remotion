import {defineConfig, devices, Project} from '@playwright/test';

export default defineConfig({
	projects: [
		{
			name: 'chromium',
			use: {...devices['Desktop Chrome']},
		},
		{
			name: 'firefox',
			use: {...devices['Desktop Firefox']},
		},
		process.env.CI
			? null
			: {
					name: 'webkit',
					use: {...devices['Desktop Safari']},
				},
	].filter(Boolean) as Project[],
});
