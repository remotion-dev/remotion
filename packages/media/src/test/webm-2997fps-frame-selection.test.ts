import {ALL_FORMATS, VideoSampleSink, Input, UrlSource} from 'mediabunny';
import {assert, expect, test} from 'vitest';
import {
	getMaxVideoCacheSize,
	globalMediaCache,
	keyframeManager,
} from '../caches';
import {makePrewarmedVideoIteratorCache} from '../prewarm-iterator-for-looping';
import {extractFrame} from '../video-extraction/extract-frame';
import {createVideoIterator} from '../video/video-preview-iterator';

// ffmpeg -f lavfi -i testsrc2=size=128x72:rate=30000/1001 -frames:v 32 \
//   -c:v libvpx -b:v 200k 2997fps.webm
// WebM stores milliseconds, so frame n is stored at round(n * 1001 / 30) ms.
const src = '/2997fps.webm';

// On a 30fps timeline, a frame that starts up to 1ms after the requested
// time is shown; one starting later is not.
const cases = [
	// 0.200 starts exactly at 6/30
	{frame: 6, expected: 0.2},
	// 0.234 starts 0.67ms after 7/30 = 0.2333
	{frame: 7, expected: 0.234},
	// 0.501 starts exactly 1ms after 15/30 = 0.5
	{frame: 15, expected: 0.501},
	// 0.968 starts 1.33ms after 29/30 = 0.9667, so 0.934 is still shown
	{frame: 29, expected: 0.934},
];

const openPreview = async () => {
	const input = new Input({
		source: new UrlSource(src),
		formats: ALL_FORMATS,
	});
	const track = await input.getPrimaryVideoTrack();
	assert(track);
	const cache = makePrewarmedVideoIteratorCache(
		new VideoSampleSink(track),
		await track.getTimeResolution(),
	);

	return {input, cache};
};

test('rendering a 29.97fps WebM on a 30fps timeline picks frames up to 1ms late', async () => {
	keyframeManager.clearAll('info');

	for (const {frame, expected} of cases) {
		const result = await extractFrame({
			src,
			timeInSeconds: frame / 30,
			logLevel: 'info',
			loop: false,
			trimAfter: undefined,
			trimBefore: undefined,
			playbackRate: 1,
			fps: 30,
			maxCacheSize: getMaxVideoCacheSize('info'),
			credentials: undefined,
			mediaCache: globalMediaCache,
		});

		assert(result.type === 'success');
		assert(result.frame);
		expect({frame, shown: result.frame.timestamp / 1_000_000}).toEqual({
			frame,
			shown: expected,
		});
		result.frame.close();
	}

	keyframeManager.clearAll('info');
});

test('previewing a 29.97fps WebM on a 30fps timeline picks frames up to 1ms late when seeking', async () => {
	const {input, cache} = await openPreview();

	try {
		for (const {frame, expected} of cases) {
			const iterator = await createVideoIterator(frame / 30, cache);
			expect({frame, shown: iterator.initialFrame?.timestamp}).toEqual({
				frame,
				shown: expected,
			});
			iterator.destroy();
		}
	} finally {
		cache.destroy();
		input.dispose();
	}
});

test('previewing a 29.97fps WebM on a 30fps timeline picks frames up to 1ms late when playing', async () => {
	const {input, cache} = await openPreview();
	const iterator = await createVideoIterator(0, cache);

	try {
		for (let frame = 1; frame <= 29; frame++) {
			const result = await iterator.tryToSatisfySeek(frame / 30, {
				pendingFrameBehavior: 'wait',
				onWait: () => undefined,
				shouldContinue: () => true,
			});
			assert(result.type === 'satisfied', `frame ${frame} was not satisfied`);

			const testCase = cases.find((c) => c.frame === frame);
			if (testCase) {
				expect({frame, shown: result.frame.timestamp}).toEqual({
					frame,
					shown: testCase.expected,
				});
			}
		}
	} finally {
		iterator.destroy();
		cache.destroy();
		input.dispose();
	}
});
