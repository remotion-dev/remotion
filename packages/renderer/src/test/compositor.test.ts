import {unlinkSync} from 'node:fs';
import {expect, test} from 'vitest';
import {composeWithoutCache} from '../compositor/compose';
import {startCompositor} from '../compositor/compositor';
import type {Layer} from '../compositor/payloads';

test('Should handle the overlay', async () => {
	try {
		const layers = [
			{
				invalid: 'json',
			},
		];
		const compositor = startCompositor(
			'StartLongRunningProcess',
			{
				concurrency: 2,
				maximum_frame_cache_items: 100,
				verbose: false,
			},
			false
		);

		await composeWithoutCache({
			height: 1080,
			width: 1080,
			layers: layers as unknown as Layer[],
			output: 'test.mp4',
			imageFormat: 'Png',
			compositor,
		});

		compositor.finishCommands();
		await compositor.waitForDone();

		throw new Error('should not reach here');
	} catch (err) {
		expect(err).toMatch(/missing field/);
	}
});

test('Should handle valid', async () => {
	const layers: Layer[] = [
		{
			type: 'Solid',
			params: {
				fill: [255, 0, 0, 255],
				height: 1080,
				width: 1080,
				x: 0,
				y: 0,
			},
		},
	];

	const compositor = startCompositor(
		'StartLongRunningProcess',
		{
			concurrency: 2,
			maximum_frame_cache_items: 100,
			verbose: false,
		},
		false
	);

	await composeWithoutCache({
		height: 1080,
		width: 1080,
		layers,
		output: 'test.png',
		imageFormat: 'Png',
		compositor,
	});

	compositor.finishCommands();
	await compositor.waitForDone();

	unlinkSync('test.png');
});
