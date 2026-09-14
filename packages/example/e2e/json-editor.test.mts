import fs from 'fs';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, rootFile} from './constants.mts';
import {navigateToSchemaTest} from './helpers.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test.describe('visual mode', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('should edit JSON props and reject invalid or schema-mismatching JSON', async ({
		page,
	}) => {
		test.setTimeout(90_000);
		await navigateToSchemaTest(page);

		const jsonTab = page.getByRole('button', {name: 'JSON', exact: true});
		await expect(jsonTab).toBeVisible({timeout: 10_000});
		await jsonTab.click();

		const textarea = page.locator('textarea');
		await expect(textarea).toBeVisible({timeout: 10_000});
		await expect(textarea).not.toHaveValue('', {timeout: 10_000});

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

		const contentAfterValidEdit = fs.readFileSync(rootFile, 'utf-8');
		await textarea.fill('{invalid json');

		const errorDiv = page.locator('[data-testid="json-props-error"]');
		await expect(errorDiv).not.toBeEmpty({timeout: 5_000});
		await textarea.blur();

		await expect
			.poll(
				() => fs.readFileSync(rootFile, 'utf-8') === contentAfterValidEdit,
				{
					timeout: 2_000,
				},
			)
			.toBe(true);

		const updatedTitle = 'disk-update-clears-error';
		const updatedContent = contentAfterValidEdit.replace(
			/title: '[^']*'/,
			`title: '${updatedTitle}'`,
		);
		fs.writeFileSync(rootFile, updatedContent);

		await expect(textarea).toHaveValue(new RegExp(updatedTitle), {
			timeout: 10_000,
		});
		await expect(errorDiv).toBeEmpty({timeout: 5_000});

		fs.writeFileSync(rootFile, contentAfterValidEdit);

		await expect(textarea).not.toHaveValue(new RegExp(updatedTitle), {
			timeout: 10_000,
		});

		const jsonAfterRestore = JSON.parse(await textarea.inputValue());
		jsonAfterRestore.delay = -1;
		await textarea.fill(JSON.stringify(jsonAfterRestore, null, 2));

		await expect(errorDiv).not.toBeEmpty({timeout: 5_000});
		await textarea.blur();

		await expect
			.poll(
				() => fs.readFileSync(rootFile, 'utf-8') === contentAfterValidEdit,
				{
					timeout: 2_000,
				},
			)
			.toBe(true);
	});
});
