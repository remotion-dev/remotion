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
			ID: 'delete-after-1-day',
			Status: 'Enabled',
		},
		{
			Expiration: {
				Days: 3,
			},
			Filter: {
				Prefix: 'renders/3days/',
			},
			ID: 'delete-after-3-days',
			Status: 'Enabled',
		},
		{
			Expiration: {
				Days: 7,
			},
			Filter: {
				Prefix: 'renders/7days/',
			},
			ID: 'delete-after-7-days',
			Status: 'Enabled',
		},
		{
			Expiration: {
				Days: 30,
			},
			Filter: {
				Prefix: 'renders/30days/',
			},
			ID: 'delete-after-30-days',
			Status: 'Enabled',
		},
	]);
});
