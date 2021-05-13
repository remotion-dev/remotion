import {MEMORY_SIZE} from '../constants';
import {getPriceInCents} from '../pricing/get-price';

test('Should calculate costs accurately', () => {
	expect(
		getPriceInCents({
			region: 'us-east-1',
			durationMs: 20000,
			memory: MEMORY_SIZE,
		})
	).toEqual(0.0011518950117187499);
});
