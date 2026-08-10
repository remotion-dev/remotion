import {expect, test} from '@playwright/test';
import fs from 'fs';
import {
	EXPANDED_SIDEBAR_STATE,
	STUDIO_URL,
	visualMode3DFile,
} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

const read2DTransformRotation = () => {
	const source = fs.readFileSync(visualMode3DFile, 'utf-8');
	const sequenceStart = source.indexOf('name="2D transform"');
	const sequenceEnd = source.indexOf('name="3D transform"');
	const sequenceSource = source.slice(sequenceStart, sequenceEnd);
	return /rotate: '([^']+)'/.exec(sequenceSource)?.[1] ?? null;
};

test.describe('inspector section collapse', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('collapses inactive static sections and lets the user expand them', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/issue-8216`);
		await expect(page).toHaveURL(/issue-8216/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const foreground = page.locator('[title="Foreground"]').first();
		const expandBackground = page.getByRole('button', {
			name: 'Expand Background',
			exact: true,
		});
		await expect(async () => {
			await foreground.click();
			await expect(expandBackground).toBeVisible({timeout: 1_000});
		}).toPass({timeout: 15_000});
		await expect(
			page.getByRole('button', {name: 'Expand Border', exact: true}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Expand Border radius', exact: true}),
		).toBeVisible();
		await expect(
			page.getByTitle('Use individual corner radii', {exact: true}),
		).toHaveCount(0);
		await expect(
			page.getByRole('button', {name: 'Expand Crop', exact: true}),
		).toBeVisible();

		await page
			.getByRole('button', {name: 'Expand Border radius', exact: true})
			.click();
		await expect(
			page.getByTitle('Use individual corner radii', {exact: true}),
		).toBeVisible();
		const expandedBorderRadiusButton = page.getByRole('button', {
			name: 'Collapse Border radius',
			exact: true,
		});
		await expect(expandedBorderRadiusButton).toBeFocused();
		expect(
			await expandedBorderRadiusButton.evaluate((element) => {
				const style = getComputedStyle(element);
				return {boxShadow: style.boxShadow, outlineStyle: style.outlineStyle};
			}),
		).toEqual({boxShadow: 'none', outlineStyle: 'none'});

		await page.keyboard.press('Tab');
		await page.keyboard.press('Shift+Tab');
		await expect(expandedBorderRadiusButton).toBeFocused();
		expect(
			await expandedBorderRadiusButton.evaluate(
				(element) => getComputedStyle(element).boxShadow,
			),
		).not.toBe('none');

		await page.getByRole('button', {name: 'Expand Crop', exact: true}).click();
		await expect(
			page.getByRole('button', {name: 'Collapse Crop', exact: true}),
		).toBeVisible();
		await expect(page.getByText('Crop left', {exact: true})).toBeVisible();

		await page
			.locator('[title="Default absolute-fill layout"]')
			.first()
			.click();
		await expect(
			page.getByRole('button', {name: 'Expand Layout', exact: true}),
		).toBeVisible();
		await page
			.getByRole('button', {name: 'Expand Layout', exact: true})
			.click();
		await expect(page.getByText('Premount For', {exact: true})).toBeVisible();

		await page.locator('[title="Default none layout"]').first().click();
		await expect(
			page.getByRole('button', {name: 'Expand Layout', exact: true}),
		).toBeVisible();

		await page.locator('[title="Default premount"]').first().click();
		await expect(
			page.getByRole('button', {name: 'Expand Layout', exact: true}),
		).toBeVisible();

		await page.goto(`${STUDIO_URL}/visual-mode-3d`);
		await expect(page).toHaveURL(/visual-mode-3d/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		await page.locator('[title="2D transform"]').first().click();
		const show3DControls = page.getByRole('button', {
			name: 'Show 3D transform controls',
			exact: true,
		});
		await expect(show3DControls).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Scale Z', exact: true}),
		).toHaveCount(0);
		await expect(
			page.getByRole('button', {name: 'Rotation Z', exact: true}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Rotation X', exact: true}),
		).toHaveCount(0);
		await page.getByTitle('Rotation', {exact: true}).click();
		const compositionContainer = page.locator(
			'.remotion-studio-composition-container',
		);
		const compositionBox = await compositionContainer.boundingBox();
		if (compositionBox === null) {
			throw new Error('Composition should have a visible layout');
		}

		await page.mouse.move(
			compositionBox.x + compositionBox.width / 2,
			compositionBox.y + compositionBox.height / 2,
		);
		const canvasRotationSurface = page.locator(
			'[data-remotion-studio-canvas-rotation]',
		);
		await expect(canvasRotationSurface).toBeVisible();
		const rotationSurfaceBox = await canvasRotationSurface.boundingBox();
		if (rotationSurfaceBox === null) {
			throw new Error('Canvas rotation surface should have a visible layout');
		}

		const startX = rotationSurfaceBox.x + rotationSurfaceBox.width * 0.25;
		const startY = rotationSurfaceBox.y + rotationSurfaceBox.height * 0.25;
		await page.mouse.move(startX, startY);
		await page.mouse.down();
		await page.mouse.move(startX + 60, startY + 80, {steps: 5});
		await page.mouse.up();
		await expect.poll(read2DTransformRotation).toMatch(/^-?\d+(?:\.\d+)?deg$/);

		await show3DControls.click();
		await expect(
			page.getByRole('button', {name: 'Scale Z', exact: true}),
		).toBeVisible();
		await page.getByTitle('Rotation', {exact: true}).click();
		await page.mouse.move(
			compositionBox.x + compositionBox.width / 2,
			compositionBox.y + compositionBox.height / 2,
		);
		await expect(canvasRotationSurface).toBeVisible();
		const threeDRotationSurfaceBox = await canvasRotationSurface.boundingBox();
		if (threeDRotationSurfaceBox === null) {
			throw new Error(
				'3D canvas rotation surface should have a visible layout',
			);
		}

		const threeDStartX =
			threeDRotationSurfaceBox.x + threeDRotationSurfaceBox.width * 0.25;
		const threeDStartY =
			threeDRotationSurfaceBox.y + threeDRotationSurfaceBox.height * 0.25;
		await page.mouse.move(threeDStartX, threeDStartY);
		await page.mouse.down();
		await page.mouse.move(threeDStartX + 80, threeDStartY + 60, {steps: 5});
		await page.mouse.up();
		await expect
			.poll(() => read2DTransformRotation()?.split(' ').length)
			.toBe(4);
		const scaleLabelBox = await page
			.getByTitle('Scale', {exact: true})
			.first()
			.boundingBox();
		const scaleXBox = await page
			.getByRole('button', {name: 'Scale X', exact: true})
			.first()
			.boundingBox();
		const scaleZBox = await page
			.getByRole('button', {name: 'Scale Z', exact: true})
			.first()
			.boundingBox();
		if (scaleLabelBox === null || scaleXBox === null || scaleZBox === null) {
			throw new Error('Scale controls should have a visible layout');
		}

		expect(
			scaleZBox.y - (scaleLabelBox.y + scaleLabelBox.height),
		).toBeGreaterThanOrEqual(-1);
		expect(
			scaleZBox.y - (scaleLabelBox.y + scaleLabelBox.height),
		).toBeLessThanOrEqual(1);
		await expect(
			page.getByRole('button', {name: 'Rotation X', exact: true}).first(),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Rotation Y', exact: true}).first(),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Rotation Z', exact: true}).first(),
		).toBeVisible();
		const rotationLabelBox = await page
			.getByTitle('Rotation', {exact: true})
			.first()
			.boundingBox();
		const rotationXBox = await page
			.getByRole('button', {name: 'Rotation X', exact: true})
			.first()
			.boundingBox();
		if (rotationLabelBox === null || rotationXBox === null) {
			throw new Error('Rotation controls should have a visible layout');
		}

		expect(
			rotationXBox.y - (rotationLabelBox.y + rotationLabelBox.height),
		).toBeGreaterThanOrEqual(-1);
		expect(
			rotationXBox.y - (rotationLabelBox.y + rotationLabelBox.height),
		).toBeLessThanOrEqual(1);
		expect(Math.abs(scaleXBox.x - rotationXBox.x)).toBeLessThanOrEqual(1);
		await expect(
			page
				.getByRole('button', {name: 'Transform origin Z', exact: true})
				.first(),
		).toBeVisible();

		await page.locator('[title="3D transform"]').first().click();
		await expect(
			page
				.getByRole('button', {
					name: '3D controls are required by the current transform values',
					exact: true,
				})
				.first(),
		).toBeDisabled();
		await expect(
			page.getByRole('button', {name: 'Scale Z', exact: true}).first(),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Rotation X', exact: true}).first(),
		).toContainText('X 30');
	});
});
