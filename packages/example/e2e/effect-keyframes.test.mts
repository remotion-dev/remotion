import {expect, test, type Locator, type Page} from '@playwright/test';
import {wave} from '@remotion/effects/wave';
import {getAllSchemaKeys} from '@remotion/studio-shared';
import fs from 'fs';
import assert from 'node:assert';
import {apiCall} from './api-call.mts';
import {
	EXPANDED_SIDEBAR_STATE,
	STUDIO_URL,
	effectKeyframeE2eFile,
} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

const getLine = (input: string, search: string) => {
	const line = input.split('\n').findIndex((l) => l.includes(search));
	if (line === -1) {
		throw new Error(`Could not find line containing ${search}`);
	}

	return line + 1;
};

const selectScalePrecisionAndWaitFor = async ({
	page,
	locator,
}: {
	readonly page: Page;
	readonly locator: Locator;
}) => {
	await expect(async () => {
		await page.getByTitle('Scale precision', {exact: true}).first().click();
		await expect(locator).toBeVisible({timeout: 1_000});
	}).toPass({timeout: 15_000});
};

test.describe('effect keyframes', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('adds the effect prop before adding a keyframe', async () => {
		const schema = wave().definition.schema;
		const content = fs.readFileSync(effectKeyframeE2eFile, 'utf-8');
		const solidLine = getLine(content, '<Solid');

		const subscription = await apiCall('/api/subscribe-to-sequence-props', {
			fileName: 'src/EffectKeyframeE2e.tsx',
			line: solidLine,
			column: 0,
			nodePath: null,
			componentIdentity: 'dev.remotion.remotion.Solid',
			keys: [],
			effects: [getAllSchemaKeys(schema)],
			clientId: 'effect-keyframe-subscribe',
		});
		expect(subscription.success).toBe(true);
		assert(subscription.success);
		expect(subscription.data.success).toBe(true);
		assert(subscription.data.success);
		expect(subscription.data.status.canUpdate).toBe(true);
		assert(subscription.data.status.canUpdate);
		const [effectStatus] = subscription.data.status.effects;
		assert(effectStatus);
		expect(effectStatus.canUpdate).toBe(true);
		assert(effectStatus.canUpdate);
		expect(effectStatus.props.phase).toEqual({
			status: 'static',
			codeValue: undefined,
			keyframeDisplayOffsetAdjustment: null,
		});

		const keyframe = await apiCall('/api/add-effect-keyframe', {
			fileName: 'src/EffectKeyframeE2e.tsx',
			sequenceNodePath: subscription.data.nodePath,
			effectIndex: 0,
			key: 'phase',
			frame: 30,
			value: JSON.stringify(90),
			schema,
			clientId: 'effect-keyframe-add',
		});
		expect(keyframe.success).toBe(true);
		assert(keyframe.success);
		expect(keyframe.data.canUpdate).toBe(true);
		assert(keyframe.data.canUpdate);
		expect(keyframe.data.props.phase).toEqual({
			status: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [{frame: 30, value: 90}],
			easing: [],
			clamping: {left: 'clamp', right: 'clamp'},
			keyframeDisplayOffsetAdjustment: 0,
		});

		await expect
			.poll(
				() => {
					const output = fs.readFileSync(effectKeyframeE2eFile, 'utf-8');
					return (
						output.includes('const frame = useCurrentFrame();') &&
						output.includes('phase: interpolate(frame, [30], [90], {')
					);
				},
				{
					message:
						'Expected EffectKeyframeE2e.tsx to contain the inserted phase keyframe',
					timeout: 10_000,
				},
			)
			.toBe(true);
	});

	test('accepts a scale value that is more precise than its interaction step', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/effect-keyframe-e2e`);
		await expect(page).toHaveURL(/effect-keyframe-e2e/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const scaleRow = page
			.getByText('Scale', {exact: true})
			.locator('..')
			.locator('..');
		const scaleDragger = scaleRow
			.locator('button.__remotion_input_dragger')
			.first();
		await selectScalePrecisionAndWaitFor({page, locator: scaleDragger});
		await scaleDragger.click();

		const input = scaleRow.locator('input[type="text"]');
		await expect(input).toBeVisible();
		await input.fill('0.525');
		await input.press('ArrowUp');
		await expect(input).toHaveValue('0.535');
		await input.fill('0.525');
		await input.press('Enter');

		await expect
			.poll(
				() => {
					const content = fs.readFileSync(effectKeyframeE2eFile, 'utf-8');
					return content.includes('scale: 0.525');
				},
				{
					message: 'Expected the precise scale value to be written to source',
					timeout: 10_000,
				},
			)
			.toBe(true);
	});

	test('accepts a rotation value that is more precise than its interaction step', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/effect-keyframe-e2e`);
		await expect(page).toHaveURL(/effect-keyframe-e2e/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const rotationRow = page
			.getByText('Rotation', {exact: true})
			.locator('..')
			.locator('..');
		const rotationDragger = rotationRow.locator(
			'button.__remotion_input_dragger',
		);
		await selectScalePrecisionAndWaitFor({page, locator: rotationDragger});
		await rotationDragger.click();

		const input = rotationRow.locator('input[type="text"]');
		await expect(input).toBeVisible();
		await input.fill('0.525');
		await input.press('ArrowUp');
		await expect(input).toHaveValue('1.525');
		await input.fill('0.525');
		await input.press('Enter');
		await expect(input).toBeHidden();

		await expect
			.poll(
				() => {
					const content = fs.readFileSync(effectKeyframeE2eFile, 'utf-8');
					return content.includes("rotate: '0.525deg'");
				},
				{
					message:
						'Expected the precise rotation value to be written to source',
					timeout: 10_000,
				},
			)
			.toBe(true);
	});

	test('accepts a crop value that is more precise than its interaction step', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/effect-keyframe-e2e`);
		await expect(page).toHaveURL(/effect-keyframe-e2e/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const expandCrop = page.getByRole('button', {
			name: 'Expand Crop',
			exact: true,
		});
		await selectScalePrecisionAndWaitFor({page, locator: expandCrop});
		await expandCrop.click();

		const cropRow = page
			.getByText('Crop left', {exact: true})
			.locator('..')
			.locator('..');
		await cropRow.locator('button.__remotion_input_dragger').click();

		const input = cropRow.locator('input[type="text"]');
		await expect(input).toBeVisible();
		await input.fill('0.005');
		await input.press('ArrowUp');
		await expect(input).toHaveValue('0.015');
		await input.fill('0.005');
		await input.press('Enter');
		await expect(input).toBeHidden();

		await expect
			.poll(
				() => {
					const content = fs.readFileSync(effectKeyframeE2eFile, 'utf-8');
					return content.includes('cropLeft={0.005}');
				},
				{
					message: 'Expected the precise crop value to be written to source',
					timeout: 10_000,
				},
			)
			.toBe(true);
	});

	test('accepts an effect parameter that is more precise than its interaction step', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/effect-keyframe-e2e`);
		await expect(page).toHaveURL(/effect-keyframe-e2e/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const waveRow = page.getByText('wave()', {exact: true});
		await selectScalePrecisionAndWaitFor({page, locator: waveRow});
		await waveRow.click();

		const amplitudeRow = page
			.getByText('Amplitude', {exact: true})
			.locator('..')
			.locator('..');
		await amplitudeRow.locator('button.__remotion_input_dragger').click();

		const input = amplitudeRow.locator('input[type="text"]');
		await expect(input).toBeVisible();
		await input.fill('60.525');
		await input.press('ArrowUp');
		await expect(input).toHaveValue('61.525');
		await input.fill('60.525');
		await input.press('Enter');
		await expect(input).toBeHidden();

		await expect
			.poll(
				() => {
					const content = fs.readFileSync(effectKeyframeE2eFile, 'utf-8');
					return content.includes('amplitude: 60.525');
				},
				{
					message:
						'Expected the precise effect parameter to be written to source',
					timeout: 10_000,
				},
			)
			.toBe(true);
	});

	test('collapses timeline tracks until a property or effect is selected', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/effect-keyframe-e2e`);
		await expect(page).toHaveURL(/effect-keyframe-e2e/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const timelineExpansionLabel = page
			.getByText('Timeline expansion', {exact: true})
			.last();
		const timelineExpansionRow = timelineExpansionLabel
			.locator('..')
			.locator('..');
		const opacityRow = page.getByText('Opacity', {exact: true});
		await expect(async () => {
			await page
				.getByTitle('Timeline expansion', {exact: true})
				.first()
				.click();
			await expect(opacityRow).toHaveCount(1, {timeout: 1_000});
		}).toPass({timeout: 15_000});
		await expect(
			timelineExpansionRow.getByRole('button', {
				name: 'Expand track properties',
			}),
		).toBeVisible();

		await opacityRow.click();

		await expect(
			timelineExpansionRow.getByRole('button', {
				name: 'Collapse track properties',
			}),
		).toBeVisible();
		await expect(opacityRow).toHaveCount(2);

		const waveRow = page.getByText('wave()', {exact: true});
		await expect(async () => {
			await page.getByTitle('Scale precision', {exact: true}).first().click();
			await expect(waveRow).toHaveCount(1, {timeout: 1_000});
		}).toPass({timeout: 15_000});

		await waveRow.click();

		await expect(waveRow).toHaveCount(2);
	});
});
