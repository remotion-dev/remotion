import type {
	MediaParserContainer,
	MediaParserLogLevel,
	MediaParserVideoSample,
	MediaParserVideoTrack,
} from '@remotion/media-parser';
import {
	hasBeenAborted,
	MediaParserAbortError,
	mediaParserController,
	WEBCODECS_TIMESCALE,
} from '@remotion/media-parser';
import {parseMediaOnWebWorker} from '@remotion/media-parser/worker';
import {createVideoDecoder} from './create-video-decoder';
import {withResolvers} from './create/with-resolvers';
import {Log} from './log';

export type ExtractFramesTimestampsInSecondsFn = (options: {
	track: MediaParserVideoTrack;
	container: MediaParserContainer;
	durationInSeconds: number | null;
}) => Promise<number[]> | number[];

const internalExtractFrames = ({
	src,
	onFrame,
	signal,
	timestampsInSeconds,
	acknowledgeRemotionLicense,
	logLevel,
}: {
	timestampsInSeconds: number[] | ExtractFramesTimestampsInSecondsFn;
	src: string;
	onFrame: (frame: VideoFrame) => void;
	signal: AbortSignal | null;
	acknowledgeRemotionLicense: boolean;
	logLevel: MediaParserLogLevel;
}) => {
	const controller = mediaParserController();

	const expectedFrames: number[] = [];

	const resolvers = withResolvers<void>();

	const abortListener = () => {
		controller.abort();
		resolvers.reject(new MediaParserAbortError('Aborted by user'));
	};

	signal?.addEventListener('abort', abortListener, {once: true});

	let dur: number | null = null;

	parseMediaOnWebWorker({
		src: new URL(src, window.location.href),
		acknowledgeRemotionLicense,
		controller,
		logLevel,
		onDurationInSeconds(durationInSeconds) {
			dur = durationInSeconds;
		},
		onVideoTrack: async ({track, container}) => {
			const timestampTargetsUnsorted =
				typeof timestampsInSeconds === 'function'
					? await timestampsInSeconds({
							track,
							container,
							durationInSeconds: dur,
						})
					: timestampsInSeconds;

			const timestampTargets = timestampTargetsUnsorted.sort((a, b) => a - b);

			if (timestampTargets.length === 0) {
				throw new Error(
					'expected at least one timestamp to extract but found zero',
				);
			}

			controller.seek(timestampTargets[0]);

			let lastFrame: VideoFrame | undefined;

			const decoder = createVideoDecoder({
				onFrame: (frame) => {
					Log.trace(logLevel, 'Received frame with timestamp', frame.timestamp);
					if (expectedFrames.length === 0) {
						frame.close();
						return;
					}

					if (frame.timestamp < expectedFrames[0] - 1) {
						if (lastFrame) {
							lastFrame.close();
						}

						lastFrame = frame;
						return;
					}

					// A WebM might have a timestamp of 67000 but we request 66666
					// See a test with this problem in it-tests/rendering/frame-accuracy.test.ts
					// Solution: We allow a 10.000ms - 3.333ms = 6.667ms difference between the requested timestamp and the actual timestamp
					if (expectedFrames[0] + 6667 < frame.timestamp && lastFrame) {
						onFrame(lastFrame);
						expectedFrames.shift();

						lastFrame = frame;
						return;
					}

					expectedFrames.shift();
					onFrame(frame);

					lastFrame = frame;
				},
				onError: (e) => {
					controller.abort();
					try {
						decoder.close();
					} catch {}

					resolvers.reject(e);
				},
				track,
			});

			const queued: MediaParserVideoSample[] = [];

			const doProcess = async () => {
				expectedFrames.push(
					(timestampTargets.shift() as number) * WEBCODECS_TIMESCALE,
				);

				while (queued.length > 0) {
					const sam = queued.shift();
					if (!sam) {
						throw new Error('Sample is undefined');
					}

					await decoder.waitForQueueToBeLessThan(10);
					Log.trace(logLevel, 'Decoding sample', sam.timestamp);
					await decoder.decode(sam);
				}
			};

			return async (sample) => {
				const nextTimestampWeWant = timestampTargets[0];
				Log.trace(
					logLevel,
					'Received sample with dts',
					sample.decodingTimestamp,
					'and cts',
					sample.timestamp,
				);

				if (sample.type === 'key') {
					await decoder.flush();
					queued.length = 0;
				}

				queued.push(sample);

				if (
					sample.decodingTimestamp >=
					timestampTargets[timestampTargets.length - 1] * WEBCODECS_TIMESCALE
				) {
					await doProcess();

					await decoder.flush();
					controller.abort();
					return;
				}

				if (nextTimestampWeWant === undefined) {
					throw new Error('this should not happen');
				}

				if (
					sample.decodingTimestamp >=
					nextTimestampWeWant * WEBCODECS_TIMESCALE
				) {
					await doProcess();

					if (timestampTargets.length === 0) {
						await decoder.flush();
						controller.abort();
					}
				}

				return async () => {
					await doProcess();
					await decoder.flush();
					if (lastFrame) {
						lastFrame.close();
					}
				};
			};
		},
	})
		.then(() => {
			resolvers.resolve();
		})
		.catch((e) => {
			if (!hasBeenAborted(e)) {
				resolvers.reject(e);
			} else {
				resolvers.resolve();
			}
		})
		.finally(() => {
			signal?.removeEventListener('abort', abortListener);
		});

	return resolvers.promise;
};

export const extractFrames = (options: {
	src: string;
	timestampsInSeconds: number[] | ExtractFramesTimestampsInSecondsFn;
	onFrame: (frame: VideoFrame) => void;
	signal?: AbortSignal;
	acknowledgeRemotionLicense?: boolean;
	logLevel?: MediaParserLogLevel;
}) => {
	return internalExtractFrames({
		...options,
		signal: options.signal ?? null,
		acknowledgeRemotionLicense: options.acknowledgeRemotionLicense ?? false,
		logLevel: options.logLevel ?? 'info',
	});
};
