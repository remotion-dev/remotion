import {expect, test} from 'bun:test';
import type {
	CanUpdateSequencePropStatusKeyframed,
	InteractivitySchema,
} from 'remotion';
import {shouldFlipEasingGraph} from '../components/Timeline/should-flip-easing-graph';

const makeStatus = (
	fromValue: unknown,
	toValue: unknown,
): CanUpdateSequencePropStatusKeyframed => ({
	status: 'keyframed',
	interpolationFunction: 'interpolate',
	keyframes: [
		{frame: 0, value: fromValue},
		{frame: 30, value: toValue},
	],
	easing: [{type: 'linear'}],
	clamping: {left: 'extend', right: 'extend'},
	posterize: undefined,
});

test('shouldFlipEasingGraph flips descending number keyframes', () => {
	const schema = {
		opacity: {
			type: 'number',
			default: 1,
			hiddenFromList: false,
		},
	} satisfies InteractivitySchema;

	expect(
		shouldFlipEasingGraph({
			schema,
			fieldKey: 'opacity',
			propStatus: makeStatus(1, 0),
			segmentIndex: 0,
		}),
	).toBe(true);
});

test('shouldFlipEasingGraph keeps ascending number keyframes upright', () => {
	const schema = {
		opacity: {
			type: 'number',
			default: 0,
			hiddenFromList: false,
		},
	} satisfies InteractivitySchema;

	expect(
		shouldFlipEasingGraph({
			schema,
			fieldKey: 'opacity',
			propStatus: makeStatus(0, 1),
			segmentIndex: 0,
		}),
	).toBe(false);
});

test('shouldFlipEasingGraph flips descending scalar scale keyframes', () => {
	const schema = {
		'style.scale': {
			type: 'scale',
			default: 1,
		},
	} satisfies InteractivitySchema;

	expect(
		shouldFlipEasingGraph({
			schema,
			fieldKey: 'style.scale',
			propStatus: makeStatus(2, 1),
			segmentIndex: 0,
		}),
	).toBe(true);
});

test('shouldFlipEasingGraph keeps compound scale keyframes upright', () => {
	const schema = {
		'style.scale': {
			type: 'scale',
			default: '1 1',
		},
	} satisfies InteractivitySchema;

	expect(
		shouldFlipEasingGraph({
			schema,
			fieldKey: 'style.scale',
			propStatus: makeStatus('2 2', '1 1'),
			segmentIndex: 0,
		}),
	).toBe(false);
});

test('shouldFlipEasingGraph keeps translate keyframes upright', () => {
	const schema = {
		'style.translate': {
			type: 'translate',
			default: '0px 0px',
		},
	} satisfies InteractivitySchema;

	expect(
		shouldFlipEasingGraph({
			schema,
			fieldKey: 'style.translate',
			propStatus: makeStatus('100px 100px', '0px 0px'),
			segmentIndex: 0,
		}),
	).toBe(false);
});

test('shouldFlipEasingGraph keeps tuple keyframes upright', () => {
	const schema = {
		position: {
			type: 'uv-coordinate',
			default: [1, 1],
		},
	} satisfies InteractivitySchema;

	expect(
		shouldFlipEasingGraph({
			schema,
			fieldKey: 'position',
			propStatus: makeStatus([1, 1], [0, 0]),
			segmentIndex: 0,
		}),
	).toBe(false);
});

test('shouldFlipEasingGraph keeps non-ordered color keyframes upright', () => {
	const schema = {
		color: {
			type: 'color',
			default: 'white',
		},
	} satisfies InteractivitySchema;

	expect(
		shouldFlipEasingGraph({
			schema,
			fieldKey: 'color',
			propStatus: makeStatus('white', 'black'),
			segmentIndex: 0,
		}),
	).toBe(false);
});
