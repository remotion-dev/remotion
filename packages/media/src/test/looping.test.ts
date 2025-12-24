import {assert, expect, test} from 'vitest';
import {getMaxVideoCacheSize} from '../caches';
import {getTimeInSeconds} from '../get-time-in-seconds';
import {extractFrame} from '../video-extraction/extract-frame';

const fps = 25;
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
				src: 'https://remotion.media/video.mp4',
				trimAfter,
				trimBefore,
				unloopedTimeInSeconds: timeInFrames / fps,
				ifNoMediaDuration: 'fail',
			});
			realTimestamps.push(realTimestamp);

			const result = await extractFrame({
				src: 'https://remotion.media/video.mp4',
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
			7.76, 7.84, 7.92, 4, 4.079999999999998, 4.16,
		]);
		expect(outputTimestamps).toEqual([
			7.733333333333333, 7.833333333333333, 7.9, 4, 4.066666666666666,
			4.133333333333334,
		]);
	},
);
