import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('should be able to seek forward and then backwards', async () => {
	const controller = mediaParserController();

	let samples = 0;

	try {
		controller.seek({
			type: 'keyframe-before-time',
			timeInSeconds: 10.6,
		});

		await parseMedia({
			src: exampleVideos.bigBuckBunny,
			controller,
			reader: nodeReader,
			onVideoTrack: () => {
				return (sample) => {
					samples++;

					if (samples === 1) {
						expect((sample?.timestamp ?? 0) / (sample?.timescale ?? 1)).toBe(
							10.5,
						);
						controller.seek({
							type: 'keyframe-before-time',
							timeInSeconds: 0,
						});
					}

					if (samples === 2) {
						expect((sample?.timestamp ?? 0) / (sample?.timescale ?? 1)).toBe(
							0.08333333333333333,
						);
						controller.abort();
					}
				};
			},
			acknowledgeRemotionLicense: true,
		});
		throw new Error('should not complete');
	} catch (err) {
		expect(hasBeenAborted(err)).toBe(true);
		expect(samples).toBe(2);
	}
});
