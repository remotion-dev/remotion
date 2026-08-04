import fs from 'fs';
import assert from 'node:assert';
import {expect, test} from '@playwright/test';
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
			posterize: undefined,
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

		await page.getByTitle('Scale precision', {exact: true}).first().click();

		const scaleRow = page
			.getByText('Scale', {exact: true})
			.locator('..')
			.locator('..');
		const scaleDragger = scaleRow
			.locator('button.__remotion_input_dragger')
			.first();
		await expect(scaleDragger).toBeVisible({timeout: 15_000});
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
});
