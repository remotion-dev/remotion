import {expect, test} from 'bun:test';
import {type CanUpdateSequencePropsResponse} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {optimisticUpdateForPropStatuses} from '../optimistic-update-for-prop-statuses';

test('optimisticUpdateForPropStatuses should return the correct response', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			'style.opacity': {
				status: 'static',
				codeValue: 0.5,
			},
		},
		effects: [],
	};
	const updated = optimisticUpdateForPropStatuses({
		previous,
		fieldKey: 'style.opacity',
		value: 0.6,
		schema: NoReactInternals.sequenceSchema,
	});

	expect(updated).toEqual({
		canUpdate: true,
		props: {
			'style.opacity': {
				status: 'static',
				codeValue: 0.6,
			},
		},
		effects: [],
	});

	const layout = optimisticUpdateForPropStatuses({
		previous: updated,
		fieldKey: 'layout',
		value: 'none',
		schema: NoReactInternals.sequenceSchema,
	});
	expect(layout).toEqual({
		canUpdate: true,
		props: {
			layout: {
				status: 'static',
				codeValue: 'none',
			},
		},
		effects: [],
	});
});

test('optimisticUpdateForPropStatuses should use undefined for removed default values', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			name: {
				status: 'static',
				codeValue: 'hehe',
			},
		},
		effects: [],
	};

	const updated = optimisticUpdateForPropStatuses({
		previous,
		fieldKey: 'name',
		value: '',
		defaultValue: JSON.stringify(''),
		schema: NoReactInternals.sequenceSchema,
	});

	expect(updated).toEqual({
		canUpdate: true,
		props: {
			name: {
				status: 'static',
				codeValue: undefined,
			},
		},
		effects: [],
	});
});
