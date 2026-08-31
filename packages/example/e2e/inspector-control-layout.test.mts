import {expect, type Locator, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

const getBox = async (locator: Locator) => {
	const box = await locator.boundingBox();
	expect(box).not.toBeNull();
	return box!;
};

const expectInspectorControlsToUseAvailableWidth = async (
	origin: Locator,
	destination: Locator,
	label: Locator,
	labelInput: Locator,
	routeColor: Locator,
	keyframeButton: Locator,
	colorButton: Locator,
) => {
	const [
		originBox,
		destinationBox,
		labelBox,
		labelInputBox,
		routeColorBox,
		keyframeButtonBox,
		colorButtonBox,
	] = await Promise.all([
		getBox(origin),
		getBox(destination),
		getBox(label),
		getBox(labelInput),
		getBox(routeColor),
		getBox(keyframeButton),
		getBox(colorButton),
	]);

	for (const fieldBox of [
		destinationBox,
		labelBox,
		labelInputBox,
		routeColorBox,
	]) {
		expect(Math.abs(fieldBox.x - originBox.x)).toBeLessThanOrEqual(2);
	}

	expect(keyframeButtonBox.x + keyframeButtonBox.width).toBeLessThanOrEqual(
		routeColorBox.x,
	);
	expect(routeColorBox.x + routeColorBox.width).toBeLessThan(colorButtonBox.x);
};

test.describe('Inspector control layout', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('keeps inspector controls aligned', async ({page}) => {
		await page.goto(`${STUDIO_URL}/inspector-control-layout-e2e`);
		await expect(page).toHaveURL(/inspector-control-layout-e2e/, {
			timeout: 15_000,
		});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const sequence = page
			.getByText('Inspector control layout', {exact: true})
			.first();
		const origin = page.getByText('Origin [longitude, latitude]', {
			exact: true,
		});
		await expect(async () => {
			await sequence.click();
			await expect(origin).toBeVisible({timeout: 1_000});
		}).toPass({timeout: 30_000});

		const destination = page.getByText('Destination [longitude, latitude]', {
			exact: true,
		});
		const label = page.getByText('Origin label', {exact: true});
		const labelInput = page.getByRole('textbox');
		const routeColor = page.getByText('Route color', {exact: true});
		const keyframeButton = page
			.getByRole('button', {name: 'Add keyframe'})
			.first();
		const colorButton = page.getByRole('button', {name: '#ff5c4d'});
		const sourceAction = page.getByRole('button', {name: 'tablet.mp4'});
		const duplicateAction = page.getByRole('button', {
			name: 'Duplicate',
			exact: true,
		});
		const [sourceActionBox, duplicateActionBox] = await Promise.all([
			getBox(sourceAction),
			getBox(duplicateAction),
		]);
		expect(
			Math.abs(sourceActionBox.x - duplicateActionBox.x),
		).toBeLessThanOrEqual(1);

		await expectInspectorControlsToUseAvailableWidth(
			origin,
			destination,
			label,
			labelInput,
			routeColor,
			keyframeButton,
			colorButton,
		);

		await page.getByRole('button', {name: '-0.1276', exact: true}).click();
		await page.keyboard.press('Escape');
		await expectInspectorControlsToUseAvailableWidth(
			origin,
			destination,
			label,
			labelInput,
			routeColor,
			keyframeButton,
			colorButton,
		);

		const rightSplitter = page.locator('.remotion-splitter-vertical').last();
		const splitterBox = await getBox(rightSplitter);
		await page.mouse.move(
			splitterBox.x + splitterBox.width / 2,
			splitterBox.y + splitterBox.height / 2,
		);
		await page.mouse.down();
		await page.mouse.move(page.viewportSize()!.width - 250, splitterBox.y + 20);
		await page.mouse.up();

		await expectInspectorControlsToUseAvailableWidth(
			origin,
			destination,
			label,
			labelInput,
			routeColor,
			keyframeButton,
			colorButton,
		);
	});
});
