import {getPriceInCents} from '../pricing/get-price';

test('Should calculate costs accurately', () => {
	expect(
		getPriceInCents({
			region: 'us-east-1',
			durationMs: 20000,
			memory: 2048,
		})
	).toEqual(0.00067);
	expect(
		getPriceInCents({
			region: 'us-east-1',
			durationMs: 20000,
			memory: 1024,
		})
	).toEqual(0.00033);
});
