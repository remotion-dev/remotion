import {expect, test} from 'vitest';
import {compose} from '../compositor/compose';

test('Should handle the overlay', async () => {
	try {
		await compose({
			height: 1080,
			width: 1080,
			layers: [
				{
					// @ts-expect-error
					invalid: 'json',
				},
			],
			output: 'test.mp4',
		});

		throw new Error('should not reach here');
	} catch (err) {
		expect(err).toMatch(/missing field/);
	}
});
