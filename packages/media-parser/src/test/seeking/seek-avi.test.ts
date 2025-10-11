import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';

test(
	'seek avi',
	async () => {
		const controller = mediaParserController();

		controller.seek(10);

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
							expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(
								8.333333333333334,
							);
							expect(sample.type).toBe('key');
							controller.seek(20);
						}

						if (samples === 2) {
							expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(
								16.666666666666668,
							);
							expect(sample.type).toBe('key');
						}

						if (samples === 3) {
							expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(16.8);
							expect(sample.type).toBe('delta');
							controller.seek(0);
						}

						if (samples === 4) {
							expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(0);
							expect(sample.type).toBe('key');

							controller.seek(40);
						}

						if (samples === 5) {
							expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(25);
							expect(sample.type).toBe('key');
						}

						if (samples === 155) {
							expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(
								29.966666666666665,
							);
							expect(sample.type).toBe('delta');

							controller.seek(100);
						}

						if (samples === 156) {
							expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(25);
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
	},
	{timeout: 15000},
);
