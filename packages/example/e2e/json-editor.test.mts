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

		const collapseMetadata = page.getByRole('button', {
			name: 'Collapse Metadata',
			exact: true,
		});
		await page.mouse.move(0, 0);
		await expect(collapseMetadata).toHaveCSS('cursor', 'default');
		await expect(collapseMetadata).toHaveCSS('color', 'rgb(166, 167, 169)');
		await collapseMetadata.hover();
		await expect(collapseMetadata).toHaveCSS('cursor', 'default');
		await expect(collapseMetadata).toHaveCSS('color', 'rgb(255, 255, 255)');
		await collapseMetadata.click();
		const expandMetadata = page.getByRole('button', {
			name: 'Expand Metadata',
			exact: true,
		});
		await expect(expandMetadata).toBeFocused();
		await expect(expandMetadata).toHaveCSS('box-shadow', 'none');
		await expect(page.getByText('Frame rate', {exact: true})).toBeHidden();
		await page.reload();
		await expect(expandMetadata).toBeVisible();
		await expandMetadata.click();
		await expect(page.getByText('Frame rate', {exact: true})).toBeVisible();

		await page
			.getByRole('button', {name: 'Collapse Actions', exact: true})
			.click();
		await expect(
			page.getByRole('button', {name: 'Add Solid', exact: true}),
		).toBeHidden();
		await page
			.getByRole('button', {name: 'Expand Actions', exact: true})
			.press('Enter');
		await expect(
			page.getByRole('button', {name: 'Add Solid', exact: true}),
		).toBeVisible();

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

		await page
			.getByRole('button', {name: 'Collapse Default Props', exact: true})
			.click();
		await expect(textarea).toBeHidden();
		await expect(jsonTab).toBeHidden();
		const expandDefaultProps = page.getByRole('button', {
			name: 'Expand Default Props',
			exact: true,
		});
		await page.keyboard.press('Tab');
		await page.keyboard.press('Shift+Tab');
		await expect(expandDefaultProps).toBeFocused();
		await expect(expandDefaultProps).not.toHaveCSS('box-shadow', 'none');
		await expandDefaultProps.press('Space');
		await expect(textarea).toBeVisible();
		await expect(textarea).toHaveValue('{invalid json');
		await expect(errorDiv).not.toBeEmpty();

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
