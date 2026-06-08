import {expect, test} from 'bun:test';
import type {CanUpdateSequencePropsResponse} from 'remotion';
import {
	optimisticUpdateEffectKeyframeSettings,
	optimisticUpdateSequenceKeyframeSettings,
} from '../optimistic-update-keyframe-settings';

const previous: CanUpdateSequencePropsResponse = {
	canUpdate: true,
	props: {
		scale: {
			status: 'keyframed',
			interpolationFunction: 'interpolate',
			keyframes: [
				{frame: 0, value: 1},
				{frame: 20, value: 2},
				{frame: 40, value: 3},
			],
			easing: ['linear'],
			clamping: {left: 'clamp', right: 'wrap'},
			posterize: 3,
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
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 0, value: 0.2},
						{frame: 20, value: 0.5},
					],
					easing: [],
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
				},
			},
		},
	],
};

test('optimisticUpdateSequenceKeyframeSettings updates easing without changing other settings', () => {
	const updated = optimisticUpdateSequenceKeyframeSettings({
		previous,
		fieldKey: 'scale',
		settings: {
			type: 'easing',
			segmentIndex: 1,
			easing: [0.42, 0, 1, 1],
		},
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const status = updated.props.scale;
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.easing).toEqual(['linear', [0.42, 0, 1, 1]]);
	expect(status.clamping).toEqual({left: 'clamp', right: 'wrap'});
	expect(status.posterize).toBe(3);
});

test('optimisticUpdateEffectKeyframeSettings updates easing', () => {
	const updated = optimisticUpdateEffectKeyframeSettings({
		previous,
		effectIndex: 0,
		fieldKey: 'amount',
		settings: {
			type: 'easing',
			segmentIndex: 0,
			easing: [0, 0, 0.58, 1],
		},
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

	expect(status.easing).toEqual([[0, 0, 0.58, 1]]);
});
