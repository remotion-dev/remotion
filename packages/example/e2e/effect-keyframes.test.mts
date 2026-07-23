import fs from 'fs';
import assert from 'node:assert';
import {expect, test} from '@playwright/test';
import {wave} from '@remotion/effects/wave';
import {getAllSchemaKeys} from '@remotion/studio-shared';
import {apiCall} from './api-call.mts';
import {effectKeyframeE2eFile} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

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
});
