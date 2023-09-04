import {expect, test} from 'vitest';
import {getLifeCycleRules} from '../../functions/helpers/lifecycle';

test('Lifecycle', () => {
	expect(getLifeCycleRules()).toEqual([
		{
			Expiration: {
				Days: 1,
			},
			Filter: {
				Prefix: 'renders/1days/',
			},
			ID: 'DELETE_AFTER_1_DAYS',
			Status: 'Enabled',
		},
		{
			Expiration: {
				Days: 3,
			},
			Filter: {
				Prefix: 'renders/3days/',
			},
			ID: 'DELETE_AFTER_3_DAYS',
			Status: 'Enabled',
		},
		{
			Expiration: {
				Days: 7,
			},
			Filter: {
				Prefix: 'renders/7days/',
			},
			ID: 'DELETE_AFTER_7_DAYS',
			Status: 'Enabled',
		},
		{
			Expiration: {
				Days: 30,
			},
			Filter: {
				Prefix: 'renders/30days/',
			},
			ID: 'DELETE_AFTER_30_DAYS',
			Status: 'Enabled',
		},
	]);
});
