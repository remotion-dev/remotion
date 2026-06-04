import {expect, test} from 'bun:test';
import {
	computeEffectiveSchemaValuesDotNotation,
	makeKeyframedDragOverride,
	resolveDragOverrideValue,
	type CanUpdateSequencePropStatusKeyframed,
} from '../use-schema';

const makeKeyframedStatus = (): CanUpdateSequencePropStatusKeyframed => ({
	status: 'keyframed',
	codeValue: undefined,
	interpolationFunction: 'interpolate',
	keyframes: [
		{frame: 0, value: 2},
		{frame: 60, value: 4},
	],
	easing: ['linear'],
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
			easing: ['linear', 'linear'],
		},
	});

	expect(
		resolveDragOverrideValue({dragOverrideValue: override, frame: 30}),
	).toEqual({
		type: 'resolved',
		value: 3,
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
			easing: ['linear'],
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
