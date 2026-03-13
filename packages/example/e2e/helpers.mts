import {expect} from '@playwright/test';
import type {Page} from '@playwright/test';
import fs from 'fs';
import {LOGS_FILE, STUDIO_URL} from './constants.mts';

export async function navigateToSchemaTest(page: Page): Promise<void> {
	await page.goto(STUDIO_URL);
	const schemaFolder = page.getByTitle('Schema');
	await schemaFolder.click({timeout: 15_000});
	const schemaTestLink = page.getByText('schema-test', {exact: true}).first();
	await schemaTestLink.click({timeout: 10_000});
	await expect(page).toHaveURL(/schema-test/, {timeout: 10_000});
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
