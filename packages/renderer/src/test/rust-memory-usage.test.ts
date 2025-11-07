import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {startLongRunningCompositor} from '../compositor/compositor';

test('Should respect the maximum frame cache limit', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: 50 * 24 * 1024 * 1024,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	await compositor.executeCommand('ExtractFrame', {
		src: exampleVideos.bigBuckBunny,
		original_src: exampleVideos.bigBuckBunny,
		time: 3.333,
		transparent: false,
		tone_mapped: false,
	});

	const stats = await compositor.executeCommand('GetOpenVideoStats', {});
	const statsJson = JSON.parse(new TextDecoder('utf-8').decode(stats));
	expect(statsJson).toEqual({
		frames_in_cache: 84,
		open_streams: 1,
	});
});
