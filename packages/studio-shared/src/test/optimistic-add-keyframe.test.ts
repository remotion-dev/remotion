import {expect, test} from 'bun:test';
import type {CanUpdateSequencePropsResponse} from 'remotion';
import {
	optimisticAddEffectKeyframe,
	optimisticAddSequenceKeyframe,
} from '../optimistic-add-keyframe';

test('optimisticAddSequenceKeyframe converts a static prop to a single keyframe', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			opacity: {
				canUpdate: true,
				codeValue: 0.5,
				keyframed: false,
			},
		},
		effects: [],
	};

	const updated = optimisticAddSequenceKeyframe({
		previous,
		fieldKey: 'opacity',
		frame: 25,
		value: 0.75,
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const status = updated.props.opacity;
	if (!status || !status.canUpdate || !('keyframes' in status)) {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([{frame: 25, value: 0.75}]);
	expect(status.easing).toEqual([]);
});

test('optimisticAddSequenceKeyframe appends a keyframe to an existing interpolation', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			scale: {
				canUpdate: true,
				codeValue: undefined,
				keyframed: true,
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 1},
					{frame: 60, value: 2},
				],
				easing: ['linear'],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
			},
		},
		effects: [],
	};

	const updated = optimisticAddSequenceKeyframe({
		previous,
		fieldKey: 'scale',
		frame: 30,
		value: 1.5,
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const status = updated.props.scale;
	if (!status || !status.canUpdate || !('keyframes' in status)) {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([
		{frame: 0, value: 1},
		{frame: 30, value: 1.5},
		{frame: 60, value: 2},
	]);
	expect(status.easing).toEqual(['linear', 'linear']);
});

test('optimisticAddEffectKeyframe appends a keyframe on the target effect', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		effects: [
			{
				canUpdate: true,
				effectIndex: 0,
				callee: 'tint',
				importPath: null,
				props: {
					amount: {
						canUpdate: true,
						codeValue: undefined,
						keyframed: true,
						interpolationFunction: 'interpolate',
						keyframes: [{frame: 0, value: 0.2}],
						easing: [],
						clamping: {left: 'extend', right: 'extend'},
						posterize: undefined,
					},
				},
			},
		],
	};

	const updated = optimisticAddEffectKeyframe({
		previous,
		effectIndex: 0,
		fieldKey: 'amount',
		frame: 30,
		value: 0.5,
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const effect = updated.effects[0];
	if (!effect.canUpdate) {
		throw new Error('expected updateable effect');
	}

	const status = effect.props.amount;
	if (!status || !status.canUpdate || !('keyframes' in status)) {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([
		{frame: 0, value: 0.2},
		{frame: 30, value: 0.5},
	]);
});

test('optimisticAddEffectKeyframe converts a static prop to a single keyframe', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		effects: [
			{
				canUpdate: true,
				effectIndex: 0,
				callee: 'tint',
				importPath: null,
				props: {
					amount: {
						canUpdate: true,
						codeValue: 0.2,
						keyframed: false,
					},
				},
			},
		],
	};

	const updated = optimisticAddEffectKeyframe({
		previous,
		effectIndex: 0,
		fieldKey: 'amount',
		frame: 30,
		value: 0.5,
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const effect = updated.effects[0];
	if (!effect.canUpdate) {
		throw new Error('expected updateable effect');
	}

	const status = effect.props.amount;
	if (!status || !status.canUpdate || !('keyframes' in status)) {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([{frame: 30, value: 0.5}]);
	expect(status.easing).toEqual([]);
});
