import {expect, test} from 'bun:test';
import {Internals, type CanUpdateSequencePropsResponse} from 'remotion';
import {optimisticUpdateForCodeValues} from '../optimistic-update-for-code-values';

test('optimisticUpdateForCodeValues should return the correct response', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			'style.opacity': {
				canUpdate: true,
				codeValue: 0.5,
			},
		},
		effects: [],
	};
	const updated = optimisticUpdateForCodeValues({
		previous,
		fieldKey: 'style.opacity',
		value: 0.6,
		schema: Internals.sequenceSchema,
	});

	expect(updated).toEqual({
		canUpdate: true,
		props: {
			'style.opacity': {
				canUpdate: true,
				codeValue: 0.6,
			},
		},
		effects: [],
	});

	const layout = optimisticUpdateForCodeValues({
		previous: updated,
		fieldKey: 'layout',
		value: 'none',
		schema: Internals.sequenceSchema,
	});
	expect(layout).toEqual({
		canUpdate: true,
		props: {
			layout: {
				canUpdate: true,
				codeValue: 'none',
			},
		},
		effects: [],
	});
});
