import fs from 'fs';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, rootFile} from './constants.mts';
import {navigateToSchemaTest} from './helpers.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

async function openJsonEditor(page: import('@playwright/test').Page) {
	await navigateToSchemaTest(page);

	const jsonTab = page.getByRole('button', {name: 'JSON', exact: true});
	await expect(jsonTab).toBeVisible({timeout: 10_000});
	await jsonTab.click();

	const textarea = page.locator('textarea');
	await expect(textarea).toBeVisible({timeout: 10_000});
	await expect(textarea).not.toHaveValue('', {timeout: 10_000});
	return textarea;
}

test.describe('visual mode', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('should edit props via JSON editor and save on blur', async ({page}) => {
		const textarea = await openJsonEditor(page);

		const currentJson = await textarea.inputValue();
		const parsed = JSON.parse(currentJson);
		const newTitle = 'json-editor-e2e-test';

		const beforeContent = fs.readFileSync(rootFile, 'utf-8');
		expect(beforeContent).not.toContain(newTitle);

		parsed.title = newTitle;
		await textarea.fill(JSON.stringify(parsed, null, 2));
		await textarea.blur();

		await expect
			.poll(
				() => {
					const content = fs.readFileSync(rootFile, 'utf-8');
					return content.includes(newTitle);
				},
				{
					message: `Expected E2eTestRoot.tsx to contain "${newTitle}" after JSON editor edit`,
					timeout: 10_000,
				},
			)
			.toBe(true);
	});

	test('should show error and not save on blur when JSON is invalid', async ({
		page,
	}) => {
		const textarea = await openJsonEditor(page);
		const contentBefore = fs.readFileSync(rootFile, 'utf-8');

		await textarea.fill('{invalid json');

		const errorDiv = page.locator('[data-testid="json-props-error"]');

		await expect(errorDiv).not.toBeEmpty({timeout: 5_000});

		await textarea.blur();

		await expect
			.poll(() => fs.readFileSync(rootFile, 'utf-8') === contentBefore, {
				timeout: 2_000,
			})
			.toBe(true);

		// Update the root file on disk — the textarea should auto-update and the error should clear
		const updatedTitle = 'disk-update-clears-error';
		const updatedContent = contentBefore.replace(
			/title: '[^']*'/,
			`title: '${updatedTitle}'`,
		);
		fs.writeFileSync(rootFile, updatedContent);

		await expect(textarea).toHaveValue(new RegExp(updatedTitle), {
			timeout: 10_000,
		});

		await expect(errorDiv).toBeEmpty({timeout: 5_000});

		// Restore original file
		fs.writeFileSync(rootFile, contentBefore);

		await expect(textarea).not.toHaveValue(new RegExp(updatedTitle), {
			timeout: 10_000,
		});
	});

	test('should show error and not save on blur when JSON does not match schema', async ({
		page,
	}) => {
		const textarea = await openJsonEditor(page);
		const currentJson = await textarea.inputValue();
		const parsed = JSON.parse(currentJson);
		const contentBefore = fs.readFileSync(rootFile, 'utf-8');

		// delay: -1 violates the .min(0) constraint
		parsed.delay = -1;
		await textarea.fill(JSON.stringify(parsed, null, 2));

		await expect(
			page.locator('[data-testid="json-props-error"]'),
		).not.toBeEmpty({timeout: 5_000});

		await textarea.blur();

		await expect
			.poll(() => fs.readFileSync(rootFile, 'utf-8') === contentBefore, {
				timeout: 2_000,
			})
			.toBe(true);
	});
});
