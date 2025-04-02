import {getRemoteExampleVideo} from '@remotion/example-videos';
import {beforeAll, expect, test} from 'bun:test';
import {mediaParserController} from '../controller/media-parser-controller';
import {hasBeenAborted} from '../errors';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

beforeAll(async () => {
	await getRemoteExampleVideo('tsKeyframes');
});

test('Should be able to seek back based on already observed keyframes', async () => {
	const keyframes = 0;
	let samples = 0;

	const controller = mediaParserController();

	try {
		await parseMedia({
			src: await getRemoteExampleVideo('tsKeyframes'),
			onVideoTrack: () => {
				return (sample) => {
					samples++;
					const timeInSeconds = sample.timestamp / sample.timescale;
					if (timeInSeconds === 5.8058) {
						controller._experimentalSeek({
							type: 'keyframe-before-time-in-seconds',
							time: 3,
						});
					}

					if (samples === 176) {
						expect(timeInSeconds).toBe(2.9029);
						expect(sample.type).toBe('key');
						controller._experimentalSeek({
							type: 'keyframe-before-time-in-seconds',
							time: 2,
						});
					}

					if (samples === 177) {
						expect(timeInSeconds).toBe(1.9352666666666665);
						expect(sample.type).toBe('key');
						controller.abort();
					}
				};
			},
			controller,
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
		});

		expect(keyframes).toBe(78);
	} catch (e) {
		if (!hasBeenAborted(e)) {
			throw e;
		}
	}

	const performedSeeks =
		controller._internals.performedSeeksSignal.getPerformedSeeks();

	expect(samples).toBe(177);
	expect(performedSeeks).toEqual([
		{
			from: 1026292,
			to: 440672,
			type: 'user-initiated',
		},
		{
			from: 470940,
			to: 239136,
			type: 'user-initiated',
		},
	]);
});
