import fs from 'fs';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, rootFile} from './constants.mts';
import {navigateToSchemaTest, readStudioLogs, stripAnsi} from './helpers.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test.describe('visual mode', () => {
	test('should edit a prop and update source code', async ({page}) => {
		await navigateToSchemaTest(page);

		const titleInput = page
			.locator(
				'input[name="title"][type="text"], input[name="title"]:not([type="checkbox"])',
			)
			.first();
		await expect(titleInput).toBeVisible({timeout: 15_000});

		const newTitle = 'e2e-test-title';
		const beforeContent = fs.readFileSync(rootFile, 'utf-8');
		expect(beforeContent).not.toContain(newTitle);

		const logCountBefore = readStudioLogs().length;

		await titleInput.fill(newTitle);
		await titleInput.blur();

		await expect
			.poll(
				() => {
					const content = fs.readFileSync(rootFile, 'utf-8');
					return content.includes(newTitle);
				},
				{
					message: `Expected Root.tsx to contain "${newTitle}" after prop edit`,
					timeout: 10_000,
				},
			)
			.toBe(true);

		expect(fs.readFileSync(rootFile, 'utf-8')).toContain(newTitle);

		// Verify exactly 1 "Updated default props" log was emitted
		await expect
			.poll(
				() => {
					const newLogs = readStudioLogs().slice(logCountBefore);
					return newLogs.filter((log) =>
						stripAnsi(log).includes('Updated default props for "schema-test"'),
					).length;
				},
				{timeout: 5_000},
			)
			.toBe(1);
	});
});
