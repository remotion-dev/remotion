import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {hasBeenAborted} from '../../errors';
import {parseMediaOnServerWorker} from '../../server-worker.module';
import type {MediaParserVideoSample} from '../../webcodec-sample-types';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';

test('seek should also work on worker', async () => {
	const controller = mediaParserController();

	let firstSample: MediaParserVideoSample | undefined;

	try {
		controller.seek(10.6);

		await parseMediaOnServerWorker({
			src: exampleVideos.bigBuckBunny,
			controller,
			onVideoTrack: () => {
				return (s) => {
					firstSample = s;
					controller.abort();
				};
			},
			acknowledgeRemotionLicense: true,
		});
		throw new Error('should not complete');
	} catch (err) {
		expect(hasBeenAborted(err)).toBe(true);
		const timeInSeconds =
			(firstSample?.timestamp ?? 0) / (WEBCODECS_TIMESCALE ?? 1);
		expect(timeInSeconds).toBe(10.416666666666666);
	}

	const hints = await controller.getSeekingHints();
	expect(hints?.type).toEqual('iso-base-media-seeking-hints');
});

test('should be able to seek forward and then backwards', async () => {
	const controller = mediaParserController();

	let samples = 0;

	try {
		controller.seek(10.6);

		await parseMediaOnServerWorker({
			src: exampleVideos.bigBuckBunny,
			controller,
			onVideoTrack: () => {
				return async (sample) => {
					samples++;

					if (samples === 1) {
						expect(
							(sample?.timestamp ?? 0) / (WEBCODECS_TIMESCALE ?? 1),
						).toBeCloseTo(10.416666666666666);

						const simulatedSeek = await controller.simulateSeek(0);
						expect(simulatedSeek).toEqual({
							type: 'do-seek',
							byte: 48,
							timeInSeconds: 0,
						});
						controller.seek(0);
					}

					if (samples === 2) {
						expect((sample?.timestamp ?? 0) / (WEBCODECS_TIMESCALE ?? 1)).toBe(
							0,
						);
						const simulatedSeek = await controller.simulateSeek(10.6);
						expect(simulatedSeek).toEqual({
							type: 'do-seek',
							byte: 2271206,
							timeInSeconds: 10.416666666666666,
						});
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

		expect(hasBeenAborted(err)).toBe(true);
		expect(samples).toBe(2);
	}
});
