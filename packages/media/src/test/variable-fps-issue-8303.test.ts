import {ALL_FORMATS, CanvasSink, Input, UrlSource} from 'mediabunny';
import {expect, test} from 'vitest';
import {makePrewarmedVideoIteratorCache} from '../prewarm-iterator-for-looping';
import {createVideoIterator} from '../video/video-preview-iterator';

const FPS = 60;
const SRC = '/variable-fps.webm';
const FIRST_NON_ZERO_TIMESTAMP = 3.364;

const loadVideoTrack = async () => {
	const input = new Input({
		source: new UrlSource(SRC),
		formats: ALL_FORMATS,
	});
	const videoTrack = await input.getPrimaryVideoTrack();
	if (!videoTrack) {
		throw new Error('No video track found');
	}

	return {input, videoTrack};
};

test('variable FPS video can be sought forward one frame at a time', async () => {
	const {input, videoTrack} = await loadVideoTrack();
	const canvasSink = new CanvasSink(videoTrack, {
		width: 160,
		height: 160,
		fit: 'contain',
		alpha: true,
		poolSize: 3,
	});
	const cache = makePrewarmedVideoIteratorCache(canvasSink);
	const iterator = await createVideoIterator(0, cache);

	try {
		const timestamps: number[] = [];

		for (let frame = 0; frame <= 210; frame++) {
			const time = frame / FPS;
			const result = await iterator.tryToSatisfySeek(time);
			if (result.type !== 'satisfied') {
				throw new Error(
					`Expected seek to ${time.toFixed(3)}s to be satisfied, got ${result.reason}`,
				);
			}

			timestamps.push(Number(result.frame.timestamp.toFixed(3)));
		}

		const firstAdvance = timestamps.findIndex((timestamp) => {
			return timestamp === FIRST_NON_ZERO_TIMESTAMP;
		});

		expect(firstAdvance).toBe(202);

		// Regression for #8303: After the seek at 3.367s advanced to the
		// 3.364s frame, the next frame-step seeks used to jump back to 0s.
		for (let frame = firstAdvance; frame <= 210; frame++) {
			expect(timestamps[frame]).toBe(FIRST_NON_ZERO_TIMESTAMP);
		}
	} finally {
		iterator.destroy();
		cache.destroy();
		input.dispose();
	}
});
