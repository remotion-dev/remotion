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
			easing: [{type: 'linear'}],
			clamping: {left: 'clamp', right: 'wrap'},
			posterize: 3,
			output: undefined,
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
					output: undefined,
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
			easing: {type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
		},
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const status = updated.props.scale;
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.easing).toEqual([
		{type: 'linear'},
		{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
	]);
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
			easing: {type: 'bezier', x1: 0, y1: 0, x2: 0.58, y2: 1},
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

	expect(status.easing).toEqual([
		{type: 'bezier', x1: 0, y1: 0, x2: 0.58, y2: 1},
	]);
});

test('optimisticUpdateSequenceKeyframeSettings updates output', () => {
	const updated = optimisticUpdateSequenceKeyframeSettings({
		previous,
		fieldKey: 'scale',
		settings: {
			type: 'settings',
			clamping: {left: 'clamp', right: 'wrap'},
			output: 'perceptual-scale',
			posterize: 3,
		},
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const status = updated.props.scale;
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.output).toBe('perceptual-scale');
	expect(status.posterize).toBe(3);
});
