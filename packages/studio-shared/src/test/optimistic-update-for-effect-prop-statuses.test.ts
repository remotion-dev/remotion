import {expect, test} from 'bun:test';
import type {CanUpdateSequencePropsResponse} from 'remotion';
import {optimisticUpdateForEffectPropStatuses} from '../optimistic-update-for-effect-prop-statuses';

test('optimisticUpdateForEffectPropStatuses updates the matching effect prop', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		effects: [
			{
				canUpdate: true,
				effectIndex: 0,
				props: {
					color: {status: 'static', codeValue: 'red'},
					opacity: {status: 'static', codeValue: 0.5},
				},
				callee: 'tint',
				importPath: null,
			},
		],
	};

	const updated = optimisticUpdateForEffectPropStatuses({
		previous,
		effectIndex: 0,
		fieldKey: 'opacity',
		value: 0.8,
		schema: {opacity: {type: 'number', default: 1, hiddenFromList: false}},
	});

	if (!updated.canUpdate) {
		throw new Error('expected canUpdate true');
	}

	const effect = updated.effects[0];
	if (!effect.canUpdate) {
		throw new Error('expected effect canUpdate true');
	}

	expect(effect.props.opacity).toEqual({
		status: 'static',
		codeValue: 0.8,
	});
	expect(effect.props.color).toEqual({
		status: 'static',
		codeValue: 'red',
	});
});

test('optimisticUpdateForEffectPropStatuses is a no-op when sequence is not updateable', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: false,
		reason: 'not-found',
	};

	const result = optimisticUpdateForEffectPropStatuses({
		previous,
		effectIndex: 0,
		fieldKey: 'opacity',
		value: 0.8,
		schema: {opacity: {type: 'number', default: 1, hiddenFromList: false}},
	});

	expect(result).toBe(previous);
});

test('optimisticUpdateForEffectPropStatuses is a no-op when effect index not found', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		effects: [],
	};

	const result = optimisticUpdateForEffectPropStatuses({
		previous,
		effectIndex: 0,
		fieldKey: 'opacity',
		value: 0.8,
		schema: {opacity: {type: 'number', default: 1, hiddenFromList: false}},
	});

	expect(result).toBe(previous);
});

test('optimisticUpdateForEffectPropStatuses applies when effect props are unset (zero-arg style)', () => {
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
					amount: {status: 'static', codeValue: undefined},
				},
			},
		],
	};

	const updated = optimisticUpdateForEffectPropStatuses({
		previous,
		effectIndex: 0,
		fieldKey: 'amount',
		value: 0.5,
		schema: {amount: {type: 'number', default: 1, hiddenFromList: false}},
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
		codeValue: 0.5,
	});
});
