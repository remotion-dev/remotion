import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

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
		await show3DControls.click();
		await expect(
			page.getByRole('button', {name: 'Scale Z', exact: true}),
		).toBeVisible();
		const scaleLabelBox = await page
			.getByTitle('Scale', {exact: true})
			.boundingBox();
		const scaleZBox = await page
			.getByRole('button', {name: 'Scale Z', exact: true})
			.boundingBox();
		if (scaleLabelBox === null || scaleZBox === null) {
			throw new Error('Scale controls should have a visible layout');
		}

		expect(scaleZBox.y).toBeGreaterThan(scaleLabelBox.y + scaleLabelBox.height);
		await expect(
			page.getByRole('button', {name: 'Rotation X', exact: true}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Rotation Y', exact: true}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Rotation Z', exact: true}),
		).toBeVisible();
		const rotationLabelBox = await page
			.getByTitle('Rotation', {exact: true})
			.boundingBox();
		const rotationXBox = await page
			.getByRole('button', {name: 'Rotation X', exact: true})
			.boundingBox();
		if (rotationLabelBox === null || rotationXBox === null) {
			throw new Error('Rotation controls should have a visible layout');
		}

		expect(rotationXBox.y).toBeGreaterThan(
			rotationLabelBox.y + rotationLabelBox.height,
		);
		await expect(
			page.getByRole('button', {name: 'Transform origin Z', exact: true}),
		).toBeVisible();

		await page.locator('[title="3D transform"]').first().click();
		await expect(
			page.getByRole('button', {
				name: '3D controls are required by the current transform values',
				exact: true,
			}),
		).toBeDisabled();
		await expect(
			page.getByRole('button', {name: 'Scale Z', exact: true}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Rotation X', exact: true}),
		).toContainText('X 30');
	});
});
