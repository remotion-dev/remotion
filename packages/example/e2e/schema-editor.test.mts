import fs from 'fs';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, rootFile} from './constants.mts';
import {navigateToSchemaTest, readStudioLogs, stripAnsi} from './helpers.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test.describe('visual mode', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('should edit schema props and update source code', async ({page}) => {
		await navigateToSchemaTest(page);

		await expect(
			page.getByRole('checkbox', {name: '<null>'}).first(),
		).toBeVisible();

		const optionalEnumCheckbox = page.getByRole('checkbox', {
			name: '<undefined>',
		});
		const optionalEnumLabel = page.getByText('optionalEnum:', {exact: true});
		const optionalEnumLabelBefore = await optionalEnumLabel.boundingBox();
		expect(optionalEnumLabelBefore).not.toBeNull();
		await expect(optionalEnumCheckbox).toBeChecked();
		await optionalEnumCheckbox.uncheck();

		await expect(page.getByRole('button', {name: 'vert'})).toBeVisible();
		const optionalEnumLabelAfter = await optionalEnumLabel.boundingBox();
		expect(optionalEnumLabelAfter?.x).toBe(optionalEnumLabelBefore?.x);
		await expect
			.poll(
				() =>
					fs.readFileSync(rootFile, 'utf-8').includes("optionalEnum: 'vert'"),
				{
					message: 'Expected the optional enum value to be persisted',
					timeout: 10_000,
				},
			)
			.toBe(true);

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
					message: `Expected E2eTestRoot.tsx to contain "${newTitle}" after prop edit`,
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
