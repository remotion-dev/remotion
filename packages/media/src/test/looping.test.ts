import {assert, expect, test} from 'vitest';
import {extractFrame} from '../video-extraction/extract-frame';

const fps = 25;
const trimBefore = 100;
const trimAfter = 200;
const playbackRate = 2;
const loop = true;

test('when looping with a lot of concurrency, it must be frame-accurate', async () => {
	const letInputTimestamps = [1.96, 2, 2.04, 2.08];
	const outputTimestamps = [];

	for (const timeInSeconds of letInputTimestamps) {
		const result = await extractFrame({
			src: 'https://remotion.media/video.mp4',
			timeInSeconds,
			logLevel: 'verbose',
			loop,
			trimAfter,
			trimBefore,
			playbackRate,
			fps,
		});
		expect(result.type).toBe('success');
		assert(result.type === 'success');
		outputTimestamps.push(result.frame?.timestamp ?? 0);
	}

	expect(outputTimestamps).toEqual([4, 4, 4, 4]);
});
