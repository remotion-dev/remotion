import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {hasBeenAborted} from '../../errors';
import {mediaParserController} from '../../media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';
import type {AudioOrVideoSample} from '../../webcodec-sample-types';

test('should be able to seek forward and then backwards', async () => {
	const controller = mediaParserController();

	let currentSample: AudioOrVideoSample | undefined;
	let samples = 0;

	try {
		controller._experimentalSeek({
			type: 'keyframe-before-time-in-seconds',
			time: 10.6,
		});

		await parseMedia({
			src: exampleVideos.bigBuckBunny,
			controller,
			reader: nodeReader,
			onVideoTrack: () => {
				return (s) => {
					currentSample = s;
					samples++;

					if (samples === 1) {
						const timeInSeconds =
							(currentSample?.timestamp ?? 0) / (currentSample?.timescale ?? 1);
						expect(timeInSeconds).toBe(10.5);
						controller._experimentalSeek({
							type: 'keyframe-before-time-in-seconds',
							time: 0,
						});
					}

					if (samples === 2) {
						const timeInSeconds =
							(currentSample?.timestamp ?? 0) / (currentSample?.timescale ?? 1);
						expect(timeInSeconds).toBe(0.08333333333333333);
						controller.abort();
					}
				};
			},
			acknowledgeRemotionLicense: true,
		});
		throw new Error('should not complete');
	} catch (err) {
		expect(hasBeenAborted(err)).toBe(true);
	}
});
