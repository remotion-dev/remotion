import {assert, expect, test} from 'vitest';
import {getMaxVideoCacheSize} from '../caches';
import {getTimeInSeconds} from '../get-time-in-seconds';
import {extractFrame} from '../video-extraction/extract-frame';

const fps = 30;
const trimBefore = 100;
const trimAfter = 200;
const playbackRate = 2;
const loop = true;

test(
	'when looping with a lot of concurrency, it must be frame-accurate',
	{retry: 3},
	async () => {
		const letInputTimestamps = [197, 198, 199, 200, 201, 202];
		const realTimestamps: number[] = [];
		const outputTimestamps: number[] = [];

		for (const timeInFrames of letInputTimestamps) {
			const realTimestamp = getTimeInSeconds({
				fps,
				loop,
				mediaDurationInSeconds: 10,
				playbackRate,
				src: '/video.mp4',
				trimAfter,
				trimBefore,
				unloopedTimeInSeconds: timeInFrames / fps,
				ifNoMediaDuration: 'fail',
			});
			expect(realTimestamp).not.toBeNull();
			assert(realTimestamp !== null);
			realTimestamps.push(realTimestamp);

			const result = await extractFrame({
				src: '/video.mp4',
				timeInSeconds: timeInFrames / fps,
				logLevel: 'info',
				loop,
				trimAfter,
				trimBefore,
				playbackRate,
				fps,
				maxCacheSize: getMaxVideoCacheSize('info'),
				credentials: undefined,
			});
			expect(result.type).toBe('success');
			assert(result.type === 'success');
			outputTimestamps.push(result.frame?.timestamp ?? 0);
		}

		// getTimeInSeconds() maps looped media time in frame units; round back to
		// frames to avoid asserting insignificant JS floating-point spellings.
		const mappedFrames = realTimestamps.map((time) => Math.round(time * fps));
		expect(mappedFrames).toEqual([194, 196, 198, 100, 102, 104]);
		expect(outputTimestamps).toEqual([
			6.44 * 1_000_000,
			6.52 * 1_000_000,
			6.6 * 1_000_000,
			3.32 * 1_000_000,
			3.4 * 1_000_000,
			3.44 * 1_000_000,
		]);
	},
);

test('gettime in seconds', () => {
	const looped = getTimeInSeconds({
		unloopedTimeInSeconds: 71.46366666666667,
		playbackRate: 1,
		loop: true,
		trimBefore: 640,
		trimAfter: 1800,
		mediaDurationInSeconds: 596.4741950113379,
		fps: 30,
		ifNoMediaDuration: 'infinity',
		src: '/video.mp4',
	});

	expect(looped).toBeDefined();
});
