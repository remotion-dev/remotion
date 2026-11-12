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

		const controlPoint = page.getByLabel('Bezier control point 1', {
			exact: true,
		});
		const positionBeforeDrag = await controlPoint.getAttribute('style');
		const bounds = await controlPoint.boundingBox();
		expect(bounds).not.toBeNull();
		const x = bounds!.x + bounds!.width / 2;
		const y = bounds!.y + bounds!.height / 2;
		await page.mouse.move(x, y);
		await page.mouse.down();
		await page.mouse.move(x + 30, y - 20, {steps: 5});
		await expect(controlPoint).not.toHaveAttribute(
			'style',
			positionBeforeDrag!,
		);
		await page.keyboard.press('Escape');
		await expect(handle).toHaveAttribute('r', '4.25');
		await expect(controlPoint).toHaveAttribute('style', positionBeforeDrag!);
		await page.mouse.up();

		// The next Escape steps back the timeline selection as before.
		await page.keyboard.press('Escape');
		await expect(handle).toHaveCount(0);
	});

	test('switching modes with the keyboard does not leave a hidden handle selected', async ({
		page,
	}) => {
		test.setTimeout(120_000);
		const handle = await openEasingEditor(page);
		for (const name of ['Spring', 'Hold', 'Apply Spring easing']) {
			await handle.click();
			await expect(handle).toHaveAttribute('r', '6.8');
			await page.getByRole('button', {name, exact: true}).focus();
			await page.keyboard.press('Enter');
			await expect(handle).toHaveCount(0);

			await page.getByRole('button', {name: 'Bezier', exact: true}).focus();
			await page.keyboard.press('Enter');
			await expect(handle).toHaveAttribute('r', '4.25');
		}

		await handle.click();
		await page.getByRole('button', {name: 'Spring', exact: true}).focus();
		await page.keyboard.press('Enter');
		await expect(handle).toHaveCount(0);

		// Escape must step back the timeline selection, not deselect a hidden handle.
		await page.keyboard.press('Escape');
		await expect(page.getByText('Spring', {exact: true})).toHaveCount(0);
	});
});
