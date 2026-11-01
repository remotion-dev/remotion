import {VideoSample, type VideoSampleSink} from 'mediabunny';
import {expect, test} from 'vitest';
// Importing `keyframe-manager` directly would hit the import cycle with
// `caches.ts`, so use the singleton it exports.
import {keyframeManager} from '../caches';

const FPS = 10;

// A bank keeps its `samples()` iterator suspended between requests, and that
// iterator owns a decoder. Counting the open iterators counts the live decoders.
const makeDecoderTrackingSink = () => {
	const decoders = {open: 0, opened: 0};
	const sink: VideoSampleSink = {
		getSample() {
			return Promise.reject(new Error('Not implemented'));
		},
		async *samples(start = 0) {
			decoders.open++;
			decoders.opened++;
			try {
				for (let i = Math.round(Math.floor(start) * FPS); ; i++) {
					yield new VideoSample(new Uint8Array(4), {
						format: 'RGBA',
						codedWidth: 1,
						codedHeight: 1,
						timestamp: i / FPS,
						duration: 1 / FPS,
					});
				}
			} finally {
				decoders.open--;
			}
		},
		async *samplesAtTimestamps() {
			yield* [];
		},
	};

	return {sink, decoders};
};

const request = async ({
	src,
	timestamp,
	sink,
}: {
	src: string;
	timestamp: number;
	sink: VideoSampleSink;
}) => {
	const bank = await keyframeManager.requestKeyframeBank({
		timestamp,
		videoSampleSink: sink,
		timeResolution: 1000,
		src,
		logLevel: 'error',
		maxCacheSize: 100 * 1024 * 1024,
		fps: FPS,
	});
	if (bank === null) {
		throw new Error('Expected an active keyframe bank');
	}

	await bank.getFrameFromTimestamp(timestamp, FPS);
};

test('a src that is no longer requested closes its decoder', async () => {
	keyframeManager.clearAll('error');
	const {sink, decoders} = makeDecoderTrackingSink();

	// 12 clips with different sources following each other on the timeline.
	for (let take = 0; take < 12; take++) {
		for (let step = 0; step < 60; step++) {
			await request({src: `take-${take}.mp4`, timestamp: step / FPS, sink});
		}
	}

	await expect.poll(() => decoders.open).toBeLessThanOrEqual(2);
	expect(decoders.opened).toBe(12);

	keyframeManager.clearAll('error');
	await expect.poll(() => decoders.open).toBe(0);
});

test('sources on screen together stay open, however many there are', async () => {
	keyframeManager.clearAll('error');
	const {sink, decoders} = makeDecoderTrackingSink();

	// More sources than the recency window, all advancing frame by frame.
	const sources = new Array(60).fill(true).map((_, i) => `grid-${i}.mp4`);
	for (let step = 0; step < 10; step++) {
		for (const src of sources) {
			await request({src, timestamp: step / FPS, sink});
		}
	}

	expect(decoders.opened).toBe(sources.length);
	expect(decoders.open).toBe(sources.length);

	keyframeManager.clearAll('error');
	await expect.poll(() => decoders.open).toBe(0);
});
