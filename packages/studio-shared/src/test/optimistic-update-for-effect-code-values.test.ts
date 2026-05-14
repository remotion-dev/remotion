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
				factoryName: 'tint',
				props: {
					color: {canUpdate: true, codeValue: 'red'},
					opacity: {canUpdate: true, codeValue: 0.5},
				},
			},
		],
	};

	const updated = optimisticUpdateForEffectCodeValues({
		previous,
		effectIndex: 0,
		fieldKey: 'opacity',
		value: 0.8,
		schema: {opacity: {type: 'number', default: 1}},
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
		reason: 'something',
	};

	const result = optimisticUpdateForEffectCodeValues({
		previous,
		effectIndex: 0,
		fieldKey: 'opacity',
		value: 0.8,
		schema: {opacity: {type: 'number', default: 1}},
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
		schema: {opacity: {type: 'number', default: 1}},
	});

	expect(result).toBe(previous);
});

test('optimisticUpdateForEffectCodeValues is a no-op when effect status is non-updateable', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		effects: [
			{
				canUpdate: false,
				effectIndex: 0,
				factoryName: 'tint',
				reason: 'effect-reordered',
			},
		],
	};

	const result = optimisticUpdateForEffectCodeValues({
		previous,
		effectIndex: 0,
		fieldKey: 'opacity',
		value: 0.8,
		schema: {opacity: {type: 'number', default: 1}},
	});

	expect(result).toBe(previous);
});
