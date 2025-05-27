import type {
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

export type ExtractFrameGetTimestamps = (options: {
	track: MediaParserVideoTrack;
	durationInSeconds: number | null;
}) => Promise<number[]> | number[];

export const extractFrames = ({
	src,
	onFrame,
	signal,
	timestamps,
}: {
	timestamps: ExtractFrameGetTimestamps;
	src: string;
	onFrame: (frame: VideoFrame) => void;
	signal: AbortSignal;
}) => {
	const controller = mediaParserController();

	const expectedFrames: number[] = [];

	const resolvers = withResolvers<void>();

	const abortListener = () => {
		controller.abort();
		resolvers.reject(new MediaParserAbortError('Aborted by user'));
	};

	signal.addEventListener('abort', abortListener, {once: true});

	let dur: number | null = null;

	parseMediaOnWebWorker({
		src: new URL(src, window.location.href),
		acknowledgeRemotionLicense: true,
		controller,
		onDurationInSeconds(durationInSeconds) {
			dur = durationInSeconds;
		},
		onVideoTrack: async ({track}) => {
			const timestampTargets_ = await timestamps({
				track,
				durationInSeconds: dur,
			});

			const timestampTargets = timestampTargets_.sort((a, b) => a - b);

			controller.seek(timestampTargets[0]);

			const decoder = createVideoDecoder({
				onFrame: (frame) => {
					if (frame.timestamp >= expectedFrames[0] - 1) {
						expectedFrames.shift();
						onFrame(frame);
					} else {
						frame.close();
					}
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

			return async (sample) => {
				const nextTimestampWeWant = timestampTargets[0];

				if (
					sample.timestamp >
					timestampTargets[timestampTargets.length - 1] * WEBCODECS_TIMESCALE
				) {
					await decoder.flush();
					controller.abort();
					return;
				}

				if (nextTimestampWeWant === undefined) {
					throw new Error('this should not happen');
				}

				if (sample.type === 'key') {
					queued.length = 0;
				}

				queued.push(sample);

				if (sample.timestamp > nextTimestampWeWant * WEBCODECS_TIMESCALE) {
					expectedFrames.push(
						(timestampTargets.shift() as number) * WEBCODECS_TIMESCALE,
					);

					while (queued.length > 0) {
						const sam = queued.shift();
						await decoder.waitForQueueToBeLessThan(10);
						await decoder.decode(sam as MediaParserVideoSample);
					}

					if (timestampTargets.length === 0) {
						await decoder.flush();
						controller.abort();
					}
				}
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
			signal.removeEventListener('abort', abortListener);
		});

	return resolvers.promise;
};
