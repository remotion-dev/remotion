import {expect, test} from 'bun:test';
import {
	getEffectiveVisualModeValue,
	resolveDragOverrideValue,
} from '../get-effective-visual-mode-value';
import {
	computeEffectiveSchemaValuesDotNotation,
	makeKeyframedDragOverride,
	makeStaticDragOverride,
	type CanUpdateSequencePropStatusKeyframed,
} from '../use-schema';

const makeKeyframedStatus = (): CanUpdateSequencePropStatusKeyframed => ({
	status: 'keyframed',
	interpolationFunction: 'interpolate',
	keyframes: [
		{frame: 0, value: 2},
		{frame: 60, value: 4},
	],
	easing: [{type: 'linear'}],
	clamping: {left: 'extend', right: 'extend'},
	posterize: undefined,
});

test('makeKeyframedDragOverride inserts a new keyframe and preserves easing length', () => {
	const override = makeKeyframedDragOverride({
		status: makeKeyframedStatus(),
		frame: 30,
		value: 3,
	});

	expect(override).toEqual({
		type: 'keyframed',
		status: {
			...makeKeyframedStatus(),
			keyframes: [
				{frame: 0, value: 2},
				{frame: 30, value: 3},
				{frame: 60, value: 4},
			],
			easing: [{type: 'linear'}, {type: 'linear'}],
		},
	});

	expect(
		resolveDragOverrideValue({dragOverrideValue: override, frame: 30}),
	).toEqual({
		type: 'resolved',
		value: 3,
	});
});

test('makeKeyframedDragOverride duplicates the split segment easing', () => {
	const status: CanUpdateSequencePropStatusKeyframed = {
		...makeKeyframedStatus(),
		keyframes: [
			{frame: 0, value: 2},
			{frame: 31, value: 3},
			{frame: 60, value: 4},
		],
		easing: [{type: 'linear'}, {type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1}],
	};
	const override = makeKeyframedDragOverride({
		status,
		frame: 38,
		value: 3.5,
	});

	expect(override).toEqual({
		type: 'keyframed',
		status: {
			...status,
			keyframes: [
				{frame: 0, value: 2},
				{frame: 31, value: 3},
				{frame: 38, value: 3.5},
				{frame: 60, value: 4},
			],
			easing: [
				{type: 'linear'},
				{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
				{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
			],
		},
	});
});

test('makeKeyframedDragOverride uses linear easing outside the keyframe range', () => {
	const status: CanUpdateSequencePropStatusKeyframed = {
		...makeKeyframedStatus(),
		easing: [{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1}],
	};
	const override = makeKeyframedDragOverride({
		status,
		frame: 90,
		value: 5,
	});

	expect(override).toEqual({
		type: 'keyframed',
		status: {
			...status,
			keyframes: [
				{frame: 0, value: 2},
				{frame: 60, value: 4},
				{frame: 90, value: 5},
			],
			easing: [
				{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
				{type: 'linear'},
			],
		},
	});
});

test('makeKeyframedDragOverride replaces an existing keyframe without changing easing length', () => {
	const override = makeKeyframedDragOverride({
		status: makeKeyframedStatus(),
		frame: 60,
		value: 5,
	});

	expect(override).toEqual({
		type: 'keyframed',
		status: {
			...makeKeyframedStatus(),
			keyframes: [
				{frame: 0, value: 2},
				{frame: 60, value: 5},
			],
			easing: [{type: 'linear'}],
		},
	});
});

test('computeEffectiveSchemaValuesDotNotation resolves keyframed drag overrides at the current frame', () => {
	const status = makeKeyframedStatus();
	const {merged} = computeEffectiveSchemaValuesDotNotation({
		schema: {
			opacity: {
				type: 'number',
				default: 1,
				hiddenFromList: false,
			},
		},
		currentValue: {opacity: 2},
		overrideValues: {
			opacity: makeKeyframedDragOverride({
				status,
				frame: 30,
				value: 3,
			}),
		},
		propStatus: {
			opacity: status,
		},
		frame: 30,
	});

	expect(merged.opacity).toBe(3);
});

test('getEffectiveVisualModeValue resolves static string drag overrides', () => {
	expect(
		getEffectiveVisualModeValue({
			propStatus: {
				status: 'static',
				codeValue: 'Old',
			},
			dragOverrideValue: makeStaticDragOverride('New'),
			defaultValue: undefined,
			frame: null,
			shouldResortToDefaultValueIfUndefined: false,
		}),
	).toBe('New');

	expect(
		getEffectiveVisualModeValue({
			propStatus: {
				status: 'static',
				codeValue: 'Old',
			},
			dragOverrideValue: makeStaticDragOverride(''),
			defaultValue: undefined,
			frame: null,
			shouldResortToDefaultValueIfUndefined: false,
		}),
	).toBe('');
});

test('getEffectiveVisualModeValue resolves keyframed drag overrides at the source frame', () => {
	const status = makeKeyframedStatus();

	expect(
		getEffectiveVisualModeValue({
			propStatus: {
				status: 'static',
				codeValue: 2,
			},
			dragOverrideValue: makeKeyframedDragOverride({
				status,
				frame: 30,
				value: 3,
			}),
			defaultValue: 1,
			frame: 30,
			shouldResortToDefaultValueIfUndefined: true,
		}),
	).toBe(3);
});
