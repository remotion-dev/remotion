import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';

test('should be able to seek forward and then backwards', async () => {
	const controller = mediaParserController();

	let samples = 0;

	try {
		controller.seek(10.6);

		await parseMedia({
			src: exampleVideos.bigBuckBunny,
			controller,
			reader: nodeReader,
			onVideoTrack: () => {
				return (sample) => {
					samples++;

					if (samples === 1) {
						expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(
							10.416666666666666,
						);
						controller.seek(0);
					}

					if (samples === 2) {
						expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(0);
						controller.abort();
					}
				};
			},
			acknowledgeRemotionLicense: true,
		});
		throw new Error('should not complete');
	} catch (err) {
		if (!hasBeenAborted(err)) {
			throw err;
		}

		expect(samples).toBe(2);
	}
});
