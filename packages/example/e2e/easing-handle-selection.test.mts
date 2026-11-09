import {expect, test, type Page} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

const openEasingEditor = async (page: Page) => {
	await page.goto(`${STUDIO_URL}/effect-keyframe-e2e`);
	const opacity = page.getByText('Opacity', {exact: true});
	await expect(async () => {
		await page
			.getByRole('group', {name: 'Timeline expansion', exact: true})
			.first()
			.click();
		await expect(opacity).toHaveCount(1, {timeout: 1_000});
	}).toPass({timeout: 30_000});
	await opacity.click();
	await page
		.getByRole('button', {name: /^Select easing from frame /})
		.first()
		.click();
	const handle = page
		.getByLabel('Bezier control point 1', {exact: true})
		.locator('circle');
	await expect(handle).toBeVisible();
	return handle;
};

test.describe('easing editor handles', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('a selected bezier handle is deselected by Escape and by clicking elsewhere', async ({
		page,
	}) => {
		test.setTimeout(120_000);
		const handle = await openEasingEditor(page);
		await expect(handle).toHaveAttribute('r', '4.25');

		await handle.click();
		await expect(handle).toHaveAttribute('r', '6.8');
		// Clicking elsewhere in the editor deselects the handle.
		await page.getByText('Bezier', {exact: true}).first().click();
		await expect(handle).toHaveAttribute('r', '4.25');

		await handle.click();
		await expect(handle).toHaveAttribute('r', '6.8');
		// The first Escape only deselects the handle; the easing stays selected.
		await page.keyboard.press('Escape');
		await expect(handle).toHaveAttribute('r', '4.25');
		// The next Escape steps back the timeline selection as before.
		await page.keyboard.press('Escape');
		await expect(handle).toHaveCount(0);
	});
});
