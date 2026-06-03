import {expect, test} from 'bun:test';
import {parseEffectClipboardData} from '../effect-clipboard-data';

test('parseEffectClipboardData accepts keyframed v3 effect payloads', () => {
	const parsed = parseEffectClipboardData(
		JSON.stringify({
			type: 'effects-additive',
			version: 3,
			remotionClipboard: 'effects',
			effects: [
				{
					callee: 'brightness',
					importPath: '@remotion/effects/brightness',
					params: {
						amount: {
							type: 'keyframed',
							interpolationFunction: 'interpolate',
							keyframes: [
								{frame: 0, value: 0},
								{frame: 100, value: 1},
							],
							easing: ['linear'],
							clamping: {left: 'clamp', right: 'clamp'},
						},
					},
				},
			],
		}),
	);

	expect(parsed).toEqual({
		type: 'effects-additive',
		version: 3,
		remotionClipboard: 'effects',
		effects: [
			{
				callee: 'brightness',
				importPath: '@remotion/effects/brightness',
				params: {
					amount: {
						type: 'keyframed',
						interpolationFunction: 'interpolate',
						keyframes: [
							{frame: 0, value: 0},
							{frame: 100, value: 1},
						],
						easing: ['linear'],
						clamping: {left: 'clamp', right: 'clamp'},
					},
				},
			},
		],
	});
});

test('parseEffectClipboardData normalizes old v2 static effect payloads', () => {
	const parsed = parseEffectClipboardData(
		JSON.stringify({
			type: 'effects-replacing',
			version: 2,
			remotionClipboard: 'effects',
			effects: [
				{
					callee: 'blur',
					importPath: '@remotion/effects/blur',
					params: {radius: 10},
				},
			],
		}),
	);

	expect(parsed).toEqual({
		type: 'effects-replacing',
		version: 3,
		remotionClipboard: 'effects',
		effects: [
			{
				callee: 'blur',
				importPath: '@remotion/effects/blur',
				params: {
					radius: {
						type: 'static',
						value: 10,
					},
				},
			},
		],
	});
});

test('parseEffectClipboardData rejects malformed keyframed payloads', () => {
	expect(
		parseEffectClipboardData(
			JSON.stringify({
				type: 'effects-additive',
				version: 3,
				remotionClipboard: 'effects',
				effects: [
					{
						callee: 'brightness',
						importPath: '@remotion/effects/brightness',
						params: {
							amount: {
								type: 'keyframed',
								interpolationFunction: 'interpolate',
								keyframes: [{frame: 0, value: 0}],
								easing: ['linear'],
								clamping: {left: 'clamp', right: 'clamp'},
							},
						},
					},
				],
			}),
		),
	).toBe(null);
});
