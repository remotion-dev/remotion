import {expect, test} from 'bun:test';
import {
	parseEasingClipboardData,
	parseEasingClipboardDataResult,
} from '../easing-clipboard-data';
import {
	parseEffectClipboardData,
	parseEffectClipboardDataResult,
	parseEffectPropClipboardData,
	parseEffectPropClipboardDataResult,
} from '../effect-clipboard-data';

test('parseEasingClipboardData accepts easing payloads', () => {
	expect(
		parseEasingClipboardData(
			JSON.stringify({
				type: 'easing',
				version: 1,
				remotionClipboard: 'easing',
				easing: {type: 'bezier', x1: 0.42, y1: 0, x2: 0.58, y2: 1},
			}),
		),
	).toEqual({
		type: 'easing',
		version: 1,
		remotionClipboard: 'easing',
		easing: {type: 'bezier', x1: 0.42, y1: 0, x2: 0.58, y2: 1},
	});
	expect(
		parseEasingClipboardData(
			JSON.stringify({
				type: 'easing',
				version: 1,
				remotionClipboard: 'easing',
				easing: {type: 'linear'},
			}),
		)?.easing,
	).toEqual({type: 'linear'});
	expect(
		parseEasingClipboardData(
			JSON.stringify({
				type: 'easing',
				version: 1,
				remotionClipboard: 'easing',
				easing: {
					type: 'spring',
					damping: 12,
					mass: 1.5,
					stiffness: 180,
					overshootClamping: true,
				},
			}),
		)?.easing,
	).toEqual({
		type: 'spring',
		allowTail: null,
		damping: 12,
		durationRestThreshold: null,
		mass: 1.5,
		stiffness: 180,
		overshootClamping: true,
	});
});

test('parseEasingClipboardData reports old easing payloads as unsupported', () => {
	const payload = JSON.stringify({
		type: 'easing',
		version: 0,
		remotionClipboard: 'easing',
		easing: 'linear',
	});

	expect(parseEasingClipboardData(payload)).toBe(null);
	expect(parseEasingClipboardDataResult(payload)).toEqual({
		status: 'unsupported-version',
		version: 0,
	});
});

test('parseEasingClipboardData rejects malformed easing payloads', () => {
	expect(
		parseEasingClipboardData(
			JSON.stringify({
				type: 'easing',
				version: 1,
				remotionClipboard: 'easing',
				easing: [0.42, 0, 0.58, 1],
			}),
		),
	).toBe(null);
});

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
							easing: [{type: 'linear'}],
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
						easing: [{type: 'linear'}],
						clamping: {left: 'clamp', right: 'clamp'},
					},
				},
			},
		],
	});
});

test('parseEffectClipboardData accepts spring easing payloads', () => {
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
							easing: [
								{
									type: 'spring',
									damping: 12,
									mass: 1.5,
									stiffness: 180,
									overshootClamping: true,
								},
							],
							clamping: {left: 'clamp', right: 'clamp'},
						},
					},
				},
			],
		}),
	);

	expect(parsed?.effects[0]?.params.amount).toEqual({
		type: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [
			{frame: 0, value: 0},
			{frame: 100, value: 1},
		],
		easing: [
			{
				type: 'spring',
				allowTail: null,
				damping: 12,
				durationRestThreshold: null,
				mass: 1.5,
				stiffness: 180,
				overshootClamping: true,
			},
		],
		clamping: {left: 'clamp', right: 'clamp'},
	});
});

test('parseEffectClipboardData accepts rotate interpolation functions', () => {
	const parsed = parseEffectClipboardData(
		JSON.stringify({
			type: 'effects-additive',
			version: 3,
			remotionClipboard: 'effects',
			effects: [
				{
					callee: 'customEffect',
					importPath: '@remotion/effects/custom-effect',
					params: {
						angle: {
							type: 'keyframed',
							interpolationFunction: 'interpolate',
							keyframes: [
								{frame: 0, value: '0deg'},
								{frame: 100, value: '90deg'},
							],
							easing: [{type: 'linear'}],
							clamping: {left: 'extend', right: 'extend'},
						},
					},
				},
			],
		}),
	);

	expect(parsed?.effects[0]?.params.angle).toEqual({
		type: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [
			{frame: 0, value: '0deg'},
			{frame: 100, value: '90deg'},
		],
		easing: [{type: 'linear'}],
		clamping: {left: 'extend', right: 'extend'},
	});
});

test('parseEffectClipboardData reports old v2 effect payloads as unsupported', () => {
	const payload = JSON.stringify({
		type: 'effects-replacing',
		version: 2,
		remotionClipboard: 'effects',
		effects: [
			{
				callee: 'blur',
				importPath: '@remotion/effects/blur',
				params: {
					radius: {
						type: 'keyframed',
						keyframes: [
							{frame: 0, value: 10},
							{frame: 30, value: 20},
						],
					},
				},
			},
		],
	});

	expect(parseEffectClipboardData(payload)).toBe(null);
	expect(parseEffectClipboardDataResult(payload)).toEqual({
		status: 'unsupported-version',
		version: 2,
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
								easing: [{type: 'linear'}],
								clamping: {left: 'clamp', right: 'clamp'},
							},
						},
					},
				],
			}),
		),
	).toBe(null);
});

test('parseEffectPropClipboardData accepts keyframed effect prop payloads', () => {
	const parsed = parseEffectPropClipboardData(
		JSON.stringify({
			type: 'effect-prop',
			version: 1,
			remotionClipboard: 'effect-prop',
			effect: {
				callee: 'brightness',
				importPath: '@remotion/effects/brightness',
			},
			key: 'amount',
			param: {
				type: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 0},
					{frame: 100, value: 1},
				],
				easing: [{type: 'linear'}],
				clamping: {left: 'clamp', right: 'clamp'},
			},
		}),
	);

	expect(parsed).toEqual({
		type: 'effect-prop',
		version: 1,
		remotionClipboard: 'effect-prop',
		effect: {
			callee: 'brightness',
			importPath: '@remotion/effects/brightness',
		},
		key: 'amount',
		param: {
			type: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: 0},
				{frame: 100, value: 1},
			],
			easing: [{type: 'linear'}],
			clamping: {left: 'clamp', right: 'clamp'},
		},
	});
});

test('parseEffectPropClipboardData reports old payloads as unsupported', () => {
	const payload = JSON.stringify({
		type: 'effect-prop',
		version: 0,
		remotionClipboard: 'effect-prop',
		effect: {
			callee: 'brightness',
			importPath: '@remotion/effects/brightness',
		},
		key: 'amount',
		param: {type: 'static', value: 1},
	});

	expect(parseEffectPropClipboardData(payload)).toBe(null);
	expect(parseEffectPropClipboardDataResult(payload)).toEqual({
		status: 'unsupported-version',
		version: 0,
	});
});
