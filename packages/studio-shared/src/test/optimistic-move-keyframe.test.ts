import {expect, test} from 'bun:test';
import type {CanUpdateSequencePropsResponse} from 'remotion';
import {
	optimisticMoveEffectKeyframes,
	optimisticMoveSequenceKeyframes,
} from '../optimistic-move-keyframe';

const previous: CanUpdateSequencePropsResponse = {
	canUpdate: true,
	props: {
		scale: {
			status: 'keyframed',
			codeValue: undefined,
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: 1},
				{frame: 20, value: 2},
				{frame: 40, value: 3},
			],
			easing: ['linear', 'linear'],
			clamping: {left: 'extend', right: 'extend'},
			posterize: undefined,
		},
	},
	effects: [
		{
			canUpdate: true,
			effectIndex: 0,
			callee: 'blur',
			importPath: null,
			props: {
				amount: {
					status: 'keyframed',
					codeValue: undefined,
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 0, value: 0.2},
						{frame: 20, value: 0.5},
					],
					easing: ['linear'],
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
				},
			},
		},
	],
};

test('optimisticMoveSequenceKeyframes moves multiple keyframes in one field', () => {
	const updated = optimisticMoveSequenceKeyframes({
		previous,
		keyframes: [
			{fieldKey: 'scale', fromFrame: 0, toFrame: 10},
			{fieldKey: 'scale', fromFrame: 20, toFrame: 30},
		],
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const status = updated.props.scale;
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([
		{frame: 10, value: 1},
		{frame: 30, value: 2},
		{frame: 40, value: 3},
	]);
	expect(status.easing).toEqual(['linear', 'linear']);
});

test('optimisticMoveSequenceKeyframes resorts when moving past an adjacent keyframe', () => {
	const updated = optimisticMoveSequenceKeyframes({
		previous,
		keyframes: [{fieldKey: 'scale', fromFrame: 0, toFrame: 30}],
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const status = updated.props.scale;
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([
		{frame: 20, value: 2},
		{frame: 30, value: 1},
		{frame: 40, value: 3},
	]);
	expect(status.easing).toEqual(['linear', 'linear']);
});

test('optimisticMoveEffectKeyframes moves effect keyframes', () => {
	const updated = optimisticMoveEffectKeyframes({
		previous,
		keyframes: [
			{effectIndex: 0, fieldKey: 'amount', fromFrame: 0, toFrame: 12},
		],
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const effect = updated.effects[0];
	if (!effect.canUpdate) {
		throw new Error('expected updateable effect');
	}

	const status = effect.props.amount;
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([
		{frame: 12, value: 0.2},
		{frame: 20, value: 0.5},
	]);
});
