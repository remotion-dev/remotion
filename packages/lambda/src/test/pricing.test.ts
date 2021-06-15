import {calculatePrice} from '../pricing/calculate-price';

test('Should calculate costs accurately', () => {
	expect(
		calculatePrice({
			region: 'us-east-1',
			durationMs: 20000,
			memory: 2048,
		})
	).toEqual(0.00067);
	expect(
		calculatePrice({
			region: 'us-east-1',
			durationMs: 20000,
			memory: 1024,
		})
	).toEqual(0.00033);
});
