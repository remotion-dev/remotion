import fs from 'fs';
import {expect} from '@playwright/test';
import type {Page} from '@playwright/test';
import {LOGS_FILE, STUDIO_URL} from './constants.mts';

export async function navigateToSchemaTest(page: Page): Promise<void> {
	const subscriptionPromise = page.waitForResponse(
		(resp) =>
			resp.url().includes('/api/subscribe-to-default-props') &&
			resp.status() === 200,
		{timeout: 15_000},
	);

	await page.goto(`${STUDIO_URL}/schema-test`);
	await expect(page).toHaveURL(/schema-test/, {timeout: 15_000});

	await subscriptionPromise;
}

export async function navigateToVisualControls(page: Page): Promise<void> {
	await page.goto(`${STUDIO_URL}/visual-controls`);
	await expect(page).toHaveURL(/visual-controls/, {timeout: 10_000});
}

export async function openVisualControlsPanel(page: Page): Promise<void> {
	await navigateToVisualControls(page);
	const controlsTab = page.getByText('Controls', {exact: true});
	await expect(controlsTab).toBeVisible({timeout: 15_000});
	await controlsTab.click();

	// Wait for the source map to resolve — the header shows "Loading..."
	// until it's done, then shows the file name.
	await page.waitForFunction(
		() => !document.body.innerText.includes('Loading...'),
		{timeout: 15_000},
	);
}

export const stripAnsi = (s: string) =>
	// eslint-disable-next-line no-control-regex
	s.replace(/\x1b\[[0-9;]*m/g, '').replace(/\]8;;[^\x1b]*\x1b\\/g, '');

export const readStudioLogs = (): string[] => {
	if (!fs.existsSync(LOGS_FILE)) {
		return [];
	}

	return fs
		.readFileSync(LOGS_FILE, 'utf-8')
		.split('\n')
		.filter((l) => l.trim())
		.map((l) => JSON.parse(l) as string);
};
