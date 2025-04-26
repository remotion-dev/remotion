import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('seek avi', async () => {
	const controller = mediaParserController();

	controller.seek({
		timeInSeconds: 10,
		type: 'keyframe-before-time',
	});

	let samples = 0;

	try {
		await parseMedia({
			src: exampleVideos.avi,
			controller,
			acknowledgeRemotionLicense: true,
			reader: nodeReader,
			onVideoTrack: () => {
				return (sample) => {
					samples++;
					if (samples === 1) {
						expect(sample.timestamp / sample.timescale).toBe(8.333333333333334);
						expect(sample.type).toBe('key');
						controller.seek({
							timeInSeconds: 20,
							type: 'keyframe-before-time',
						});
					}

					if (samples === 2) {
						expect(sample.timestamp / sample.timescale).toBe(
							16.666666666666668,
						);
						expect(sample.type).toBe('key');
					}

					if (samples === 3) {
						expect(sample.timestamp / sample.timescale).toBe(16.7);
						expect(sample.type).toBe('delta');
						controller.seek({
							timeInSeconds: 0,
							type: 'keyframe-before-time',
						});
					}

					if (samples === 4) {
						expect(sample.timestamp / sample.timescale).toBe(0);
						expect(sample.type).toBe('key');

						controller.seek({
							timeInSeconds: 40,
							type: 'keyframe-before-time',
						});
					}

					if (samples === 5) {
						expect(sample.timestamp / sample.timescale).toBe(25);
						expect(sample.type).toBe('key');
					}

					if (samples === 155) {
						expect(sample.timestamp / sample.timescale).toBe(30);
						expect(sample.type).toBe('delta');

						controller.seek({
							timeInSeconds: 100,
							type: 'keyframe-before-time',
						});
					}

					if (samples === 156) {
						expect(sample.timestamp / sample.timescale).toBe(25);
						expect(sample.type).toBe('key');
						controller.abort();
					}
				};
			},
		});
		throw new Error('Should not happen');
	} catch (error) {
		if (!hasBeenAborted(error)) {
			throw error;
		}
	}

	expect(samples).toBe(156);
});
