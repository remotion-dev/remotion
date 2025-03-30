import {getRemoteExampleVideo} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {parseMedia} from '../../parse-media';
import {nodeReader} from '../../readers/from-node';

test('seek moof, should make use of the mfra atom if available', async () => {
	const video = await getRemoteExampleVideo('fragmentedMoofTrickyDuration');

	const controller = mediaParserController();

	controller._experimentalSeek({
		type: 'keyframe-before-time-in-seconds',
		time: 20,
	});
	let samples = 0;

	try {
		await parseMedia({
			src: video,
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
			controller,
			fields: {
				internalStats: true,
			},
			onVideoTrack: () => {
				return (sample) => {
					samples++;

					if (samples > 3) {
						throw new Error('should not reach here');
					}

					if (sample.cts === 19533333.333333336) {
						expect(sample.type).toBe('key');

						controller._experimentalSeek({
							type: 'keyframe-before-time-in-seconds',
							time: 0,
						});
					}

					if (sample.dts === 0) {
						controller._experimentalSeek({
							type: 'keyframe-before-time-in-seconds',
							time: 10,
						});
					}

					if (sample.dts === 9700000) {
						controller.abort();
					}
				};
			},
		});
		throw new Error('should not reach here');
	} catch (err) {
		if (!hasBeenAborted(err)) {
			throw err;
		}

		expect(hasBeenAborted(err)).toBe(true);
		expect(
			controller._internals.performedSeeksSignal.getPerformedSeeks(),
		).toEqual([
			{
				from: 2052,
				to: 1214780,
				type: 'user-initiated',
			},
			{
				from: 1261511,
				to: 2052,
				type: 'user-initiated',
			},
			{
				from: 9349,
				to: 802392,
				type: 'user-initiated',
			},
		]);
	}
});
