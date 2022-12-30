import {expect, test} from 'vitest';
import {RenderInternals} from '..';
import {compose} from '../compositor/compose';
import type {Layer} from '../compositor/payloads';

test('Should handle the overlay', async () => {
	try {
		const layers = [
			{
				invalid: 'json',
			},
		];
		await compose({
			height: 1080,
			width: 1080,
			layers: layers as unknown as Layer[],
			output: 'test.mp4',
			downloadMap: RenderInternals.makeDownloadMap(),
			imageFormat: 'Png',
		});

		throw new Error('should not reach here');
	} catch (err) {
		console.log(err);
		expect(err).toMatch(/missing field/);
	}
});
