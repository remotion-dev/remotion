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
		const realTimestamps = [];
		const outputTimestamps = [];

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
			});
			expect(result.type).toBe('success');
			assert(result.type === 'success');
			outputTimestamps.push(result.frame?.timestamp ?? 0);
		}

		expect(realTimestamps).toEqual([
			6.466666666666666, 6.533333333333332, 6.6000000000000005,
			3.3333333333333335, 3.4, 3.4666666666666663,
		]);
		expect(outputTimestamps).toEqual([6.44, 6.52, 6.6, 3.32, 3.4, 3.44]);
	},
);
