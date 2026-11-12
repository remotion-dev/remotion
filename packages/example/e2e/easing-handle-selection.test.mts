import fs from 'node:fs';
import {expect, test, type Page} from '@playwright/test';
import {
	EXPANDED_SIDEBAR_STATE,
	STUDIO_URL,
	effectKeyframeE2eFile,
} from './constants.mts';
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

	test('inspector clicks preserve easing and keyframe selections while Escape steps back', async ({
		page,
	}) => {
		test.setTimeout(120_000);
		const handle = await openEasingEditor(page);
		await expect(handle).toHaveAttribute('r', '4.25');
		await page.getByLabel('Bezier curve editor', {exact: true}).click({
			position: {x: 10, y: 10},
		});
		await expect(handle).toHaveAttribute('r', '4.25');

		await handle.click();
		await expect(handle).toHaveAttribute('r', '6.8');
		await page.getByLabel('Bezier curve editor', {exact: true}).click({
			position: {x: 10, y: 10},
		});
		await expect(handle).toHaveAttribute('r', '4.25');
		await page.getByText('Output', {exact: true}).click();
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

		await page
			.getByRole('button', {name: 'Select keyframe at frame 0', exact: true})
			.click();
		const removeKeyframe = page.getByText('Remove keyframe', {exact: true});
		await expect(removeKeyframe).toBeVisible();
		await page.getByText('Frame', {exact: true}).click();
		await expect(removeKeyframe).toBeVisible();
		await page.getByRole('button', {name: 'Back to property'}).click();
		await expect(removeKeyframe).toHaveCount(0);
	});

	test('mode changes clear handles and effect inspector clicks preserve the effect selection', async ({
		page,
	}) => {
		test.setTimeout(120_000);
		const original = fs.readFileSync(effectKeyframeE2eFile, 'utf8');
		fs.writeFileSync(
			effectKeyframeE2eFile,
			original
				.replace(
					"import {scale} from '@remotion/effects/scale';",
					"import {scale} from '@remotion/effects/scale';\nimport {levels} from '@remotion/effects/levels';",
				)
				.replace(
					'effects={[scale({scale: 0.75})]}',
					'effects={[levels({gamma: 2.01})]}',
				),
		);
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

		const image = page.getByRole('group', {
			name: 'Effect scale precision',
			exact: true,
		});
		await image.first().click();
		const levelsEffect = page
			.getByRole('region', {name: 'Effects', exact: true})
			.getByRole('group', {name: 'levels()', exact: true});
		await levelsEffect.getByText('levels()', {exact: true}).click();
		await page.getByText('Input levels', {exact: true}).click();

		await page.setViewportSize({width: 1280, height: 1200});
		for (const name of ['Source', 'Controls', 'Transform', 'Actions']) {
			const collapse = page.getByRole('button', {
				name: `Collapse ${name}`,
				exact: true,
			});
			if (await collapse.isVisible()) {
				await collapse.click();
			}
		}

		const background = page.locator('[data-remotion-inspector-background]');
		const backgroundBounds = await background.boundingBox();
		expect(backgroundBounds).not.toBeNull();
		await background.click({
			position: {x: 8, y: backgroundBounds!.height - 8},
		});
		await expect(levelsEffect).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(
			page.getByRole('button', {name: 'Choose width preset', exact: true}),
		).toBeVisible();

		await image.first().click();
		await levelsEffect.getByText('levels()', {exact: true}).click();
		await page.getByText('Input levels', {exact: true}).click();
		await page.keyboard.press('Backspace');
		await expect(levelsEffect).toHaveCount(0);
		await expect(image.first()).toBeVisible();
		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf8'))
			.toContain('name="Effect scale precision"');
		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf8'))
			.not.toMatch(/levels\(\s*\{/);
	});
});
