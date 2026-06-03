import {expect, test} from 'bun:test';
import type {CanUpdateSequencePropsResponse} from 'remotion';
import {
	optimisticMoveEffectKeyframe,
	optimisticMoveSequenceKeyframe,
} from '../optimistic-move-keyframe';

test('optimisticMoveSequenceKeyframe moves and re-sorts the matching keyframe', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			opacity: {
				status: 'keyframed',
				codeValue: undefined,
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 0},
					{frame: 30, value: 0.5},
					{frame: 60, value: 1},
				],
				easing: ['linear', 'linear'],
				clamping: {left: 'clamp', right: 'clamp'},
				posterize: undefined,
			},
		},
		effects: [],
	};

	const updated = optimisticMoveSequenceKeyframe({
		previous,
		fieldKey: 'opacity',
		fromFrame: 30,
		toFrame: 10,
	});

	if (!updated.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	const status = updated.props.opacity;
	if (status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([
		{frame: 0, value: 0},
		{frame: 10, value: 0.5},
		{frame: 60, value: 1},
	]);
	expect(status.easing).toEqual(['linear', 'linear']);
});

test('optimisticMoveSequenceKeyframe ignores collisions', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			opacity: {
				status: 'keyframed',
				codeValue: undefined,
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 0},
					{frame: 30, value: 0.5},
				],
				easing: ['linear'],
				clamping: {left: 'clamp', right: 'clamp'},
				posterize: undefined,
			},
		},
		effects: [],
	};

	expect(
		optimisticMoveSequenceKeyframe({
			previous,
			fieldKey: 'opacity',
			fromFrame: 0,
			toFrame: 30,
		}),
	).toEqual(previous);
});

test('optimisticMoveEffectKeyframe moves a keyframe on the target effect', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		effects: [
			{
				canUpdate: true,
				callee: 'tint',
				importPath: null,
				effectIndex: 0,
				props: {
					amount: {
						status: 'keyframed',
						codeValue: undefined,
						interpolationFunction: 'interpolate',
						keyframes: [
							{frame: 0, value: 0},
							{frame: 30, value: 1},
						],
						easing: ['linear'],
						clamping: {left: 'clamp', right: 'clamp'},
						posterize: undefined,
					},
				},
			},
		],
	};

	const updated = optimisticMoveEffectKeyframe({
		previous,
		effectIndex: 0,
		fieldKey: 'amount',
		fromFrame: 30,
		toFrame: 15,
	});

	if (!updated.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	const effect = updated.effects[0];
	if (!effect.canUpdate) {
		throw new Error('expected effect canUpdate true');
	}

	const status = effect.props.amount;
	if (status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([
		{frame: 0, value: 0},
		{frame: 15, value: 1},
	]);
});
