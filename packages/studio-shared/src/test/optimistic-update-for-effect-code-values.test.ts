import {expect, test} from 'bun:test';
import type {CanUpdateSequencePropsResponse} from 'remotion';
import {optimisticUpdateForEffectCodeValues} from '../optimistic-update-for-effect-code-values';

test('optimisticUpdateForEffectCodeValues updates the matching effect prop', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		effects: [
			{
				canUpdate: true,
				effectIndex: 0,
				props: {
					color: {canUpdate: true, codeValue: 'red'},
					opacity: {canUpdate: true, codeValue: 0.5},
				},
				callee: 'tint',
				importPath: null,
			},
		],
	};

	const updated = optimisticUpdateForEffectCodeValues({
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

	expect(effect.props.opacity).toEqual({canUpdate: true, codeValue: 0.8});
	expect(effect.props.color).toEqual({canUpdate: true, codeValue: 'red'});
});

test('optimisticUpdateForEffectCodeValues is a no-op when sequence is not updateable', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: false,
		reason: 'not-found',
	};

	const result = optimisticUpdateForEffectCodeValues({
		previous,
		effectIndex: 0,
		fieldKey: 'opacity',
		value: 0.8,
		schema: {opacity: {type: 'number', default: 1, hiddenFromList: false}},
	});

	expect(result).toBe(previous);
});

test('optimisticUpdateForEffectCodeValues is a no-op when effect index not found', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		effects: [],
	};

	const result = optimisticUpdateForEffectCodeValues({
		previous,
		effectIndex: 0,
		fieldKey: 'opacity',
		value: 0.8,
		schema: {opacity: {type: 'number', default: 1, hiddenFromList: false}},
	});

	expect(result).toBe(previous);
});

test('optimisticUpdateForEffectCodeValues applies when effect props are unset (zero-arg style)', () => {
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
					amount: {canUpdate: true, codeValue: undefined},
				},
			},
		],
	};

	const updated = optimisticUpdateForEffectCodeValues({
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

	expect(effect.props.amount).toEqual({canUpdate: true, codeValue: 0.5});
});
