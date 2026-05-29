import {expect, test} from 'bun:test';
import type {CanUpdateSequencePropsResponse} from 'remotion';
import {
	optimisticDeleteEffectKeyframe,
	optimisticDeleteSequenceKeyframe,
} from '../optimistic-delete-keyframe';

test('optimisticDeleteSequenceKeyframe removes the matching keyframe and an easing segment', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			'style.opacity': {
				canUpdate: false,
				reason: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 0},
					{frame: 30, value: 0.5},
					{frame: 60, value: 1},
				],
				easing: ['linear', 'linear'],
				clamping: {left: 'extend', right: 'extend'},
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
	if (status.canUpdate || status.reason !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([
		{frame: 0, value: 0},
		{frame: 60, value: 1},
	]);
	expect(status.easing).toEqual(['linear']);
});

test('optimisticDeleteSequenceKeyframe is a no-op when no keyframe matches', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			'style.opacity': {
				canUpdate: false,
				reason: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [{frame: 0, value: 0}],
				easing: [],
				clamping: {left: 'extend', right: 'extend'},
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

test('optimisticDeleteEffectKeyframe removes the matching keyframe on the target effect', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		effects: [
			{
				canUpdate: true,
				effectIndex: 0,
				callee: 'tint',
				props: {
					amount: {
						canUpdate: false,
						reason: 'keyframed',
						interpolationFunction: 'interpolate',
						keyframes: [
							{frame: 0, value: 0},
							{frame: 30, value: 1},
						],
						easing: ['linear'],
						clamping: {left: 'extend', right: 'extend'},
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
	if (status.canUpdate || status.reason !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([{frame: 30, value: 1}]);
	expect(status.easing).toEqual([]);
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
