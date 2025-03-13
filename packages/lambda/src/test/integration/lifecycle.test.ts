import {LambdaClientInternals} from '@remotion/lambda-client';
import {expect, test} from 'bun:test';

test('Lifecycle', () => {
	expect(LambdaClientInternals.getLifeCycleRules()).toEqual([
		{
			Expiration: {
				Days: 1,
			},
			Filter: {
				Prefix: 'renders/1-day',
			},
			ID: 'delete-after-1-day',
			Status: 'Enabled',
		},
		{
			Expiration: {
				Days: 3,
			},
			Filter: {
				Prefix: 'renders/3-days',
			},
			ID: 'delete-after-3-days',
			Status: 'Enabled',
		},
		{
			Expiration: {
				Days: 7,
			},
			Filter: {
				Prefix: 'renders/7-days',
			},
			ID: 'delete-after-7-days',
			Status: 'Enabled',
		},
		{
			Expiration: {
				Days: 30,
			},
			Filter: {
				Prefix: 'renders/30-days',
			},
			ID: 'delete-after-30-days',
			Status: 'Enabled',
		},
	]);
});
