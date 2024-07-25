import {expect, test} from 'bun:test';
import {unlinkSync} from 'node:fs';
import path from 'node:path';
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
		const compositor = startCompositor({
			type: 'StartLongRunningProcess',
			payload: {
				concurrency: 2,
				maximum_frame_cache_size_in_bytes: 100,
				verbose: false,
			},
			logLevel: 'info',
			indent: false,
			binariesDirectory: null,
		});

		await composeWithoutCache({
			height: 1080,
			width: 1080,
			layers: layers as unknown as Layer[],
			output: 'test.mp4',
			imageFormat: 'Png',
			compositor,
		});

		await compositor.finishCommands();
		await compositor.waitForDone();

		throw new Error('should not reach here');
	} catch (err) {
		expect((err as Error).message).toMatch(/missing field/);
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

	const compositor = startCompositor({
		type: 'StartLongRunningProcess',
		payload: {
			concurrency: 2,
			maximum_frame_cache_size_in_bytes: 100,
			verbose: false,
		},
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
	});

	const output = path.join(__dirname, 'test.png');

	await composeWithoutCache({
		height: 1080,
		width: 1080,
		layers,
		output,
		imageFormat: 'Png',
		compositor,
	});

	await compositor.finishCommands();
	await compositor.waitForDone();

	unlinkSync(output);
});
