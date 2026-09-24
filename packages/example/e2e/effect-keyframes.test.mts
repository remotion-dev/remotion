import fs from 'fs';
import assert from 'node:assert';
import {expect, test, type Locator, type Page} from '@playwright/test';
import {wave} from '@remotion/effects/wave';
import {getAllSchemaKeys} from '@remotion/studio-shared';
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
		await page
			.getByRole('group', {name: 'Scale precision', exact: true})
			.first()
			.click();
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

	test('deletes keyframes without flashing and keeps their property selected', async ({
		page,
	}) => {
		test.setTimeout(120_000);
		const originalContent = fs.readFileSync(effectKeyframeE2eFile, 'utf-8');
		fs.writeFileSync(
			effectKeyframeE2eFile,
			originalContent.replace(
				'opacity: interpolate(frame, [0, 30], [0, 1])',
				'opacity: interpolate(frame, [0, 10, 20, 30, 40, 60, 89], [0, 1, 0, 1, 0, 1, 0])',
			),
		);
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

		const keyframes = page.getByRole('button', {
			name: /^Select keyframe at frame /,
		});
		await expect(keyframes).toHaveCount(7);
		await page
			.getByRole('button', {name: 'Select keyframe at frame 10', exact: true})
			.scrollIntoViewIfNeeded();
		const propertyLabel = opacity.last().locator('..');
		await page
			.getByRole('button', {name: 'Select keyframe at frame 10', exact: true})
			.click();
		await expect(propertyLabel).toHaveCSS(
			'background-color',
			'rgba(255, 255, 255, 0.1)',
		);
		await page.keyboard.press('Escape');
		await expect(propertyLabel).toHaveCSS(
			'background-color',
			'rgba(0, 0, 0, 0)',
		);
		await page
			.getByRole('button', {
				name: 'Select easing from frame 10 to 20',
				exact: true,
			})
			.click();
		await expect(propertyLabel).toHaveCSS(
			'background-color',
			'rgba(255, 255, 255, 0.1)',
		);
		const first = await page
			.getByRole('button', {name: 'Select keyframe at frame 10', exact: true})
			.last()
			.boundingBox();
		const second = await page
			.getByRole('button', {name: 'Select keyframe at frame 20', exact: true})
			.last()
			.boundingBox();
		assert(first && second);
		await page.mouse.move(first.x - 2, first.y - 2);
		await page.mouse.down();
		await page.mouse.move(
			second.x + second.width + 2,
			second.y + second.height + 2,
			{
				steps: 5,
			},
		);
		await page.mouse.up();
		await expect(propertyLabel).toHaveCSS(
			'background-color',
			'rgba(255, 255, 255, 0.1)',
		);

		// Hold the real save request so the optimistic timeline update is visible.
		let resumeDelete: () => void = () => undefined;
		const deleteGate = new Promise<void>((resolve) => {
			resumeDelete = resolve;
		});
		await page.route('**/api/delete-keyframes', async (route) => {
			await deleteGate;
			await route.continue();
		});
		const deleteRequest = page.waitForRequest('**/api/delete-keyframes', {
			timeout: 10_000,
		});
		try {
			await page.keyboard.press('Backspace');
			await deleteRequest;
			await expect(keyframes).toHaveCount(5);
			const easings = page.getByRole('button', {
				name: /^Select easing from frame /,
			});
			await expect(easings).toHaveCount(4);
			for (const easing of await easings.all()) {
				await expect(easing.locator('div')).toHaveCSS('outline-style', 'none');
			}

			await expect(opacity).toHaveCount(2);
		} finally {
			resumeDelete();
			await page.unrouteAll({behavior: 'wait'});
		}

		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf-8'))
			.toMatch(/interpolate\(\s*frame,\s*\[0,\s*30,\s*40,\s*60,\s*89\]/);

		// Single-keyframe deletion also selects the property, even at the playhead.
		await page
			.getByRole('button', {name: 'Go to next keyframe'})
			.last()
			.click();
		await page
			.getByRole('button', {name: 'Select keyframe at frame 30', exact: true})
			.click();
		await page.keyboard.press('Backspace');
		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf-8'))
			.toMatch(/interpolate\(\s*frame,\s*\[0,\s*40,\s*60,\s*89\]/);
		await expect(
			page.getByRole('button', {name: 'Back to property', exact: true}),
		).toHaveCount(0);
		await expect(opacity).toHaveCount(2);

		// Removing from the keyframe inspector has the same result.
		await page
			.getByRole('button', {name: 'Go to next keyframe'})
			.last()
			.click();
		await page
			.getByRole('button', {name: 'Select keyframe at frame 40', exact: true})
			.click();
		await page
			.getByRole('button', {name: 'Remove keyframe', exact: true})
			.first()
			.click();
		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf-8'))
			.toMatch(/interpolate\(\s*frame,\s*\[0,\s*60,\s*89\]/);
		await expect(
			page.getByRole('button', {name: 'Back to property', exact: true}),
		).toHaveCount(0);
		await expect(opacity).toHaveCount(2);

		// The timeline's keyframe toggle also keeps the property selected.
		await page
			.getByRole('button', {name: 'Go to next keyframe'})
			.last()
			.click();
		await page
			.getByRole('button', {name: 'Remove keyframe', exact: true})
			.last()
			.click();
		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf-8'))
			.toMatch(/interpolate\(\s*frame,\s*\[0,\s*89\]/);
		await expect(
			page.getByRole('button', {name: 'Back to property', exact: true}),
		).toHaveCount(0);
		await expect(opacity).toHaveCount(2);

		// The property remains selected, so another Backspace resets its value.
		await page.keyboard.press('Backspace');
		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf-8'))
			.not.toContain('opacity:');
		await page.reload();
		await expect(
			page
				.getByRole('group', {name: 'Timeline expansion', exact: true})
				.first(),
		).toBeVisible();
		await expect(keyframes).toHaveCount(0);
	});

	test('edits precise inspector values and adds effect keyframes', async ({
		page,
	}) => {
		test.setTimeout(120_000);
		await page.goto(`${STUDIO_URL}/effect-keyframe-e2e`);
		await expect(page).toHaveURL(/effect-keyframe-e2e/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const originalContent = fs.readFileSync(effectKeyframeE2eFile, 'utf-8');
		const factorDragger = page.getByRole('button', {name: '0.75', exact: true});
		await expect(async () => {
			await page
				.getByRole('group', {name: 'Effect scale precision', exact: true})
				.first()
				.click();
			await expect(page.getByText('Factor', {exact: true})).toBeVisible({
				timeout: 1_000,
			});
		}).toPass({timeout: 15_000});
		await expect(factorDragger).toBeVisible();

		await factorDragger.click();
		const factorInput = page.getByRole('textbox');
		await expect(factorInput).toHaveValue('0.75');
		await factorInput.press('Enter');
		await expect(factorDragger).toBeVisible();
		expect(fs.readFileSync(effectKeyframeE2eFile, 'utf-8')).toBe(
			originalContent,
		);

		await factorDragger.click();
		await factorInput.fill('0.625');
		await factorInput.press('ArrowUp');
		await expect(factorInput).toHaveValue('0.725');
		await factorInput.press('ArrowDown');
		await expect(factorInput).toHaveValue('0.625');
		await factorInput.press('Enter');
		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf-8'))
			.toContain('scale: 0.625');

		const preciseFactorDragger = page.getByRole('button', {
			name: '0.625',
			exact: true,
		});
		await expect(preciseFactorDragger).toBeVisible();
		await preciseFactorDragger.click();
		await expect(factorInput).toHaveValue('0.625');
		await factorInput.press('Enter');

		// Dragging still increments and snaps to the effect's 0.1 step.
		const factorBounds = await preciseFactorDragger.boundingBox();
		assert(factorBounds);
		const factorX = factorBounds.x + factorBounds.width / 2;
		const factorY = factorBounds.y + factorBounds.height / 2;
		await page.mouse.move(factorX, factorY);
		await page.mouse.down();
		await page.mouse.move(factorX + 5, factorY);
		await page.mouse.up();
		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf-8'))
			.toContain('scale: 0.8');
		await page.reload();
		await expect(async () => {
			await page
				.getByRole('group', {name: 'Effect scale precision', exact: true})
				.first()
				.click();
			await expect(
				page.getByRole('button', {name: '0.8', exact: true}),
			).toBeVisible({timeout: 1_000});
		}).toPass({timeout: 15_000});

		const timelineExpansionLabel = page
			.getByText('Timeline expansion', {exact: true})
			.last();
		const timelineExpansionRow = timelineExpansionLabel
			.locator('..')
			.locator('..');
		const opacityRow = page.getByText('Opacity', {exact: true});
		await expect(async () => {
			await page
				.getByRole('group', {name: 'Timeline expansion', exact: true})
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
			await page
				.getByRole('group', {name: 'Scale precision', exact: true})
				.first()
				.click();
			await expect(waveRow).toHaveCount(1, {timeout: 1_000});
		}).toPass({timeout: 15_000});

		await waveRow.click();
		await expect(waveRow).toHaveCount(2);

		const scaleRow = page
			.getByText('Scale', {exact: true})
			.locator('..')
			.locator('..');
		const scaleDragger = scaleRow
			.locator('button.__remotion_input_dragger')
			.first();
		await selectScalePrecisionAndWaitFor({page, locator: scaleDragger});
		await scaleDragger.click();

		const scaleInput = scaleRow.locator('input[type="text"]');
		await expect(scaleInput).toBeVisible();
		await scaleInput.fill('0.525');
		await scaleInput.press('ArrowUp');
		await expect(scaleInput).toHaveValue('0.535');
		await scaleInput.fill('0.525');
		await scaleInput.press('Enter');

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

		const rotationRow = page
			.getByText('Rotation', {exact: true})
			.locator('..')
			.locator('..');
		const rotationDragger = rotationRow.locator(
			'button.__remotion_input_dragger',
		);
		await selectScalePrecisionAndWaitFor({page, locator: rotationDragger});
		await rotationDragger.click();

		const rotationInput = rotationRow.locator('input[type="text"]');
		await expect(rotationInput).toBeVisible();
		await rotationInput.fill('0.525');
		await rotationInput.press('ArrowUp');
		await expect(rotationInput).toHaveValue('1.525');
		await rotationInput.fill('0.525');
		await rotationInput.press('Enter');
		await expect(rotationInput).toBeHidden();

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

		const cropInput = cropRow.locator('input[type="text"]');
		await expect(cropInput).toBeVisible();
		await cropInput.fill('0.005');
		await cropInput.press('ArrowUp');
		await expect(cropInput).toHaveValue('0.015');
		await cropInput.fill('0.005');
		await cropInput.press('Enter');
		await expect(cropInput).toBeHidden();

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

		await expect(
			page.getByRole('button', {name: '0.005', exact: true}),
		).toBeVisible();

		await selectScalePrecisionAndWaitFor({page, locator: waveRow});
		await waveRow.click();

		const amplitudeRow = page
			.getByText('Amplitude', {exact: true})
			.locator('..')
			.locator('..');
		await amplitudeRow.locator('button.__remotion_input_dragger').click();

		const amplitudeInput = amplitudeRow.locator('input[type="text"]');
		await expect(amplitudeInput).toBeVisible();
		await amplitudeInput.fill('60.525');
		await amplitudeInput.press('ArrowUp');
		await expect(amplitudeInput).toHaveValue('61.525');
		await amplitudeInput.fill('60.525');
		await amplitudeInput.press('Enter');
		await expect(amplitudeInput).toBeHidden();

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
		await expect(
			page.getByRole('button', {name: '60.525', exact: true}),
		).toBeVisible();

		const schema = wave().definition.schema;
		const content = fs.readFileSync(effectKeyframeE2eFile, 'utf-8');
		const solidLine = getLine(content, '<Solid');

		const subscriptionResponse = await apiCall(
			'/api/subscribe-to-sequence-props',
			{
				requests: [
					{
						fileName: 'src/EffectKeyframeE2e.tsx',
						line: solidLine,
						column: 0,
						nodePath: null,
						componentIdentity: 'dev.remotion.remotion.Solid',
						keys: [],
						assetKeys: [],
						effects: [getAllSchemaKeys(schema)],
						clientId: 'effect-keyframe-subscribe',
						videoConfigValues: {
							durationInFrames: 90,
							fps: 30,
							height: 1080,
							width: 1920,
						},
					},
				],
			},
		);
		expect(subscriptionResponse.success).toBe(true);
		assert(subscriptionResponse.success);
		const subscription = subscriptionResponse.data.results[0];
		assert(subscription);
		expect(subscription.success).toBe(true);
		assert(subscription.success);
		expect(subscription.status.canUpdate).toBe(true);
		assert(subscription.status.canUpdate);
		const [effectStatus] = subscription.status.effects;
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
			sequenceNodePath: subscription.nodePath,
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
});
