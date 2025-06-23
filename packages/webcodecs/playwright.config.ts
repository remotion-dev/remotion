import {defineConfig, devices, Project} from '@playwright/test';

export default defineConfig({
	projects: [
		{
			name: 'chrome',
			use: {
				...devices['Desktop Chrome'],
				channel: 'chrome', // Use Google Chrome instead of Chromium to get proprietary codecs
			},
		},
		{
			name: 'firefox',
			use: {...devices['Desktop Firefox']},
		},
		{
			name: 'webkit',
			use: {...devices['Desktop Safari']},
		},
	].filter(Boolean) as Project[],
});
