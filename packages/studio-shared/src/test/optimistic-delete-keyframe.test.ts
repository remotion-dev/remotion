import {expect, test} from 'bun:test';
import type {CanUpdateSequencePropsResponse} from 'remotion';
import {
	optimisticDeleteEffectKeyframe,
	optimisticDeleteEffectKeyframes,
	optimisticDeleteSequenceKeyframe,
	optimisticDeleteSequenceKeyframes,
} from '../optimistic-delete-keyframe';

test('optimisticDeleteSequenceKeyframe removes the matching keyframe and an easing segment', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			'style.opacity': {
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 0},
					{frame: 30, value: 0.5},
					{frame: 60, value: 1},
				],
				easing: [{type: 'linear'}, {type: 'linear'}],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
				output: undefined,
			},
		},
		effects: [],
	};

	const updated = optimisticDeleteSequenceKeyframe({
		previous,
		fieldKey: 'style.opacity',
		frame: 30,
	});

	if (!updated.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	const status = updated.props['style.opacity'];
	if (status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([
		{frame: 0, value: 0},
		{frame: 60, value: 1},
	]);
	expect(status.easing).toEqual([{type: 'linear'}]);
});

test('optimisticDeleteSequenceKeyframe preserves the left segment easing when removing a middle keyframe', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			'style.opacity': {
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 0},
					{frame: 31, value: 0.5},
					{frame: 38, value: 0.75},
					{frame: 60, value: 1},
				],
				easing: [
					{type: 'linear'},
					{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
					{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
				],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
				output: undefined,
			},
		},
		effects: [],
	};

	const updated = optimisticDeleteSequenceKeyframe({
		previous,
		fieldKey: 'style.opacity',
		frame: 38,
	});

	if (!updated.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	const status = updated.props['style.opacity'];
	if (status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.easing).toEqual([
		{type: 'linear'},
		{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
	]);
});

test('optimisticDeleteSequenceKeyframe converts the last keyframe to a static value', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			width: {
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [{frame: 12, value: 320}],
				easing: [],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
				output: undefined,
			},
		},
		effects: [],
	};

	const updated = optimisticDeleteSequenceKeyframe({
		previous,
		fieldKey: 'width',
		frame: 12,
	});

	if (!updated.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	expect(updated.props.width).toEqual({
		status: 'static',
		codeValue: 320,
	});
});

test('optimisticDeleteSequenceKeyframe is a no-op when no keyframe matches', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			'style.opacity': {
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [{frame: 0, value: 0}],
				easing: [],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
				output: undefined,
			},
		},
		effects: [],
	};

	const updated = optimisticDeleteSequenceKeyframe({
		previous,
		fieldKey: 'style.opacity',
		frame: 99,
	});

	expect(updated.canUpdate && updated.props['style.opacity']).toEqual(
		previous.canUpdate && previous.props['style.opacity'],
	);
});

test('optimisticDeleteSequenceKeyframe is a no-op when sequence is not updateable', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: false,
		reason: 'not-found',
	};

	const result = optimisticDeleteSequenceKeyframe({
		previous,
		fieldKey: 'style.opacity',
		frame: 0,
	});

	expect(result).toBe(previous);
});

test('optimisticDeleteSequenceKeyframes deletes multiple keyframes in one pass', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			width: {
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 100},
					{frame: 30, value: 200},
					{frame: 60, value: 300},
				],
				easing: [{type: 'linear'}, {type: 'linear'}],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
				output: undefined,
			},
		},
		effects: [],
	};

	const updated = optimisticDeleteSequenceKeyframes({
		previous,
		keyframes: [
			{fieldKey: 'width', frame: 0},
			{fieldKey: 'width', frame: 60},
		],
	});

	if (!updated.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	const status = updated.props.width;
	if (status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([{frame: 30, value: 200}]);
	expect(status.easing).toEqual([]);
});

test('optimisticDeleteSequenceKeyframes uses the playhead value when deleting all keyframes', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			width: {
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 100},
					{frame: 30, value: 200},
				],
				easing: [{type: 'linear'}],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
				output: undefined,
			},
		},
		effects: [],
	};

	const updated = optimisticDeleteSequenceKeyframes({
		previous,
		keyframes: [
			{
				fieldKey: 'width',
				frame: 0,
				valueWhenLastKeyframeDeleted: 150,
			},
			{
				fieldKey: 'width',
				frame: 30,
				valueWhenLastKeyframeDeleted: 150,
			},
		],
	});

	expect(updated.canUpdate && updated.props.width).toEqual({
		status: 'static',
		codeValue: 150,
	});
});

test('optimisticDeleteEffectKeyframe removes the matching keyframe on the target effect', () => {
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
						status: 'keyframed',
						interpolationFunction: 'interpolate',
						keyframes: [
							{frame: 0, value: 0},
							{frame: 30, value: 1},
						],
						easing: [{type: 'linear'}],
						clamping: {left: 'extend', right: 'extend'},
						posterize: undefined,
						output: undefined,
					},
				},
			},
		],
	};

	const updated = optimisticDeleteEffectKeyframe({
		previous,
		effectIndex: 0,
		fieldKey: 'amount',
		frame: 0,
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

	expect(status.keyframes).toEqual([{frame: 30, value: 1}]);
	expect(status.easing).toEqual([]);
});

test('optimisticDeleteEffectKeyframe converts the last keyframe on the target effect to a static value', () => {
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
						status: 'keyframed',
						interpolationFunction: 'interpolate',
						keyframes: [{frame: 40, value: 0.6}],
						easing: [],
						clamping: {left: 'extend', right: 'extend'},
						posterize: undefined,
						output: undefined,
					},
				},
			},
		],
	};

	const updated = optimisticDeleteEffectKeyframe({
		previous,
		effectIndex: 0,
		fieldKey: 'amount',
		frame: 40,
	});

	if (!updated.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	const effect = updated.effects[0];
	if (!effect.canUpdate) {
		throw new Error('expected effect canUpdate true');
	}

	expect(effect.props.amount).toEqual({
		status: 'static',
		codeValue: 0.6,
	});
});

test('optimisticDeleteEffectKeyframe is a no-op when effect index not found', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		effects: [],
	};

	const result = optimisticDeleteEffectKeyframe({
		previous,
		effectIndex: 0,
		fieldKey: 'amount',
		frame: 0,
	});

	expect(result).toBe(previous);
});

test('optimisticDeleteEffectKeyframes deletes multiple keyframes in one pass', () => {
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
						status: 'keyframed',
						interpolationFunction: 'interpolate',
						keyframes: [
							{frame: 0, value: 0},
							{frame: 30, value: 0.5},
							{frame: 60, value: 1},
						],
						easing: [{type: 'linear'}, {type: 'linear'}],
						clamping: {left: 'extend', right: 'extend'},
						posterize: undefined,
						output: undefined,
					},
				},
			},
		],
	};

	const updated = optimisticDeleteEffectKeyframes({
		previous,
		keyframes: [
			{effectIndex: 0, fieldKey: 'amount', frame: 0},
			{effectIndex: 0, fieldKey: 'amount', frame: 60},
		],
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

	expect(status.keyframes).toEqual([{frame: 30, value: 0.5}]);
	expect(status.easing).toEqual([]);
});

test('optimisticDeleteEffectKeyframes uses the playhead value when deleting all keyframes', () => {
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
						status: 'keyframed',
						interpolationFunction: 'interpolate',
						keyframes: [
							{frame: 0, value: 0},
							{frame: 30, value: 1},
						],
						easing: [{type: 'linear'}],
						clamping: {left: 'extend', right: 'extend'},
						posterize: undefined,
						output: undefined,
					},
				},
			},
		],
	};

	const updated = optimisticDeleteEffectKeyframes({
		previous,
		keyframes: [
			{
				effectIndex: 0,
				fieldKey: 'amount',
				frame: 0,
				valueWhenLastKeyframeDeleted: 0.5,
			},
			{
				effectIndex: 0,
				fieldKey: 'amount',
				frame: 30,
				valueWhenLastKeyframeDeleted: 0.5,
			},
		],
	});

	const effect = updated.canUpdate ? updated.effects[0] : null;
	expect(effect?.canUpdate && effect.props.amount).toEqual({
		status: 'static',
		codeValue: 0.5,
	});
});
