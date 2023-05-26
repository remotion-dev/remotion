import {unlinkSync} from 'node:fs';
import {expect, test} from 'vitest';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';
import {compose} from '../compositor/compose';
import {startCompositor} from '../compositor/compositor';
import type {Layer} from '../compositor/payloads';

test('Should handle the overlay', async () => {
	try {
		const layers = [
			{
				invalid: 'json',
			},
		];
		const map = makeDownloadMap();
		const compositor = startCompositor(
			'StartLongRunningProcess',
			{
				concurrency: 2,
				maximum_frame_cache_items: 100,
				verbose: false,
			},
			false
		);

		await compose({
			height: 1080,
			width: 1080,
			layers: layers as unknown as Layer[],
			output: 'test.mp4',
			downloadMap: map,
			imageFormat: 'Png',
			compositor,
		});

		cleanDownloadMap(map);

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
	const map = makeDownloadMap();

	const compositor = startCompositor(
		'StartLongRunningProcess',
		{
			concurrency: 2,
			maximum_frame_cache_items: 100,
			verbose: false,
		},
		false
	);

	await compose({
		height: 1080,
		width: 1080,
		layers,
		output: 'test.png',
		downloadMap: map,
		imageFormat: 'Png',
		compositor,
	});

	unlinkSync('test.png');
	cleanDownloadMap(map);
});
