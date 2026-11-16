import {ALL_FORMATS, Input, UrlSource, VideoSampleSink} from 'mediabunny';
import {assert, expect, test} from 'vitest';
import {
	getMaxVideoCacheSize,
	globalMediaCache,
	keyframeManager,
	makeMediaCache,
} from '../caches';
import {makePrewarmedVideoIteratorCache} from '../prewarm-iterator-for-looping';
import {extractFrame} from '../video-extraction/extract-frame';
import {makeKeyframeBank} from '../video-extraction/keyframe-bank';
import {createVideoIterator} from '../video/video-preview-iterator';

const openBankAt = async (src: string, timestamp: number) => {
	const input = new Input({
		source: new UrlSource(src),
		formats: ALL_FORMATS,
	});
	const track = await input.getPrimaryVideoTrack();
	assert(track);

	const realSink = new VideoSampleSink(track);
	const decodedTimestamps: number[] = [];
	const sink = {
		...realSink,
		async *samples(start?: number, end?: number) {
			for await (const sample of realSink.samples(start, end)) {
				decodedTimestamps.push(sample.timestamp);
				yield sample;
			}
		},
	} as VideoSampleSink;

	const bank = await makeKeyframeBank({
		logLevel: 'error',
		src,
		videoSampleSink: sink,
		timeResolution: await track.getTimeResolution(),
		initialTimestampRequest: timestamp,
	});

	return {bank, decodedTimestamps, input};
};

// ffmpeg -f lavfi -i testsrc2=size=320x180:rate=24:duration=3 \
//   -c:v libx264 -pix_fmt yuv420p -bf 0 -g 72 -video_track_timescale 90000 \
//   -movie_timescale 90000 -output_ts_offset 2.916667 delayed-fractional-start.mp4
test.each([0, 1 / 30])(
	'reuses a decoder before a delayed fractional first frame when starting at %s seconds',
	async (initialTimestamp) => {
		const mediaCache = makeMediaCache();
		const NativeVideoDecoder = globalThis.VideoDecoder;
		let decodersCreated = 0;
		globalThis.VideoDecoder = new Proxy(NativeVideoDecoder, {
			construct(target, args) {
				decodersCreated++;
				return Reflect.construct(target, args);
			},
		});

		try {
			for (const timestamp of [
				initialTimestamp,
				...Array.from({length: 12}, (_, i) => initialTimestamp + i / 30),
				3.5,
			]) {
				const result = await extractFrame({
					src: '/delayed-fractional-start.mp4',
					timeInSeconds: timestamp,
					logLevel: 'error',
					loop: false,
					trimAfter: undefined,
					trimBefore: undefined,
					playbackRate: 1,
					fps: 30,
					maxCacheSize: 1024 * 1024 * 1024,
					credentials: undefined,
					mediaCache,
				});
				assert(result.type === 'success');
				assert(result.frame);
				try {
					expect(result.frame.timestamp / 1_000_000).toBeCloseTo(
						Math.max(35 / 12, timestamp),
						5,
					);
					expect(decodersCreated).toBe(1);
				} finally {
					result.frame.close();
				}
			}
		} finally {
			globalThis.VideoDecoder = NativeVideoDecoder;
			mediaCache.dispose('error');
		}
	},
);

// ffmpeg -f lavfi -i testsrc2=size=128x72:rate=30000/1001 -frames:v 150 \
//   -c:v libx264 -g 61 -keyint_min 61 -sc_threshold 0 -bf 0 \
//   -video_track_timescale 30000 fractional-keyframe.mp4
test('starts decoding at a fractional MP4 keyframe instead of the previous GOP', async () => {
	const keyframe = 61061 / 30000;
	const {bank, decodedTimestamps, input} = await openBankAt(
		'/fractional-keyframe.mp4',
		keyframe,
	);

	try {
		const frame = await bank.getFrameFromTimestamp(keyframe, 30000 / 1001);
		expect(frame?.timestamp).toBe(keyframe);
		expect(decodedTimestamps[0]).toBe(keyframe);
	} finally {
		bank.prepareForDeletion('error', 'test');
		input.dispose();
	}
});

// ffmpeg -f lavfi -i testsrc2=size=128x72:rate=30 -frames:v 130 \
//   -c:v libvpx-vp9 -g 62 -keyint_min 62 millisecond-keyframe.webm
test('starts decoding at a millisecond-quantized WebM keyframe instead of the previous GOP', async () => {
	const {bank, decodedTimestamps, input} = await openBankAt(
		'/millisecond-keyframe.webm',
		62 / 30,
	);

	try {
		const frame = await bank.getFrameFromTimestamp(62 / 30, 30);
		expect(frame?.timestamp).toBe(2.067);
		expect(decodedTimestamps[0]).toBe(2.067);
	} finally {
		bank.prepareForDeletion('error', 'test');
		input.dispose();
	}
});

// https://github.com/Vanilagy/mediabunny/issues/269
// Open GOP with B-frames: the keyframe at 1.6667s is stored before the frame at 1.6333s.
// ffmpeg -f lavfi -i testsrc2=size=128x72:rate=30 -frames:v 150 -c:v libx264 -bf 3 \
//   -x264-params open-gop=1:keyint=50:min-keyint=50:scenecut=0 open-gop.mp4
test('does not skip frames around reordered open-GOP keyframes', async () => {
	keyframeManager.clearAll('info');

	for (let i = 40; i <= 60; i++) {
		const result = await extractFrame({
			src: '/open-gop.mp4',
			timeInSeconds: i / 30,
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
		expect(
			Math.abs(result.frame.timestamp - (i / 30) * 1_000_000),
		).toBeLessThan(1000);
		result.frame.close();
	}

	keyframeManager.clearAll('info');
});

test('preview playback starts decoding at a millisecond-quantized WebM keyframe', async () => {
	const input = new Input({
		source: new UrlSource('/millisecond-keyframe.webm'),
		formats: ALL_FORMATS,
	});
	const track = await input.getPrimaryVideoTrack();
	assert(track);

	const realSink = new VideoSampleSink(track);
	const decodedTimestamps: number[] = [];
	const sink = {
		async *samples(start?: number, end?: number) {
			for await (const canvas of realSink.samples(start, end)) {
				decodedTimestamps.push(canvas.timestamp);
				yield canvas;
			}
		},
	} as VideoSampleSink;

	const cache = makePrewarmedVideoIteratorCache(
		sink,
		await track.getTimeResolution(),
	);
	const iterator = await createVideoIterator(62 / 30, cache);

	try {
		expect(iterator.initialFrame?.timestamp).toBe(2.067);
		expect(decodedTimestamps[0]).toBe(2.067);
	} finally {
		iterator.destroy();
		cache.destroy();
		input.dispose();
	}
});
