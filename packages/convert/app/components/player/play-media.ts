import type {
	MediaParserDimensions,
	ParseMediaSrc,
} from '@remotion/media-parser';
import {
	hasBeenAborted,
	mediaParserController,
	parseMedia,
	WEBCODECS_TIMESCALE,
} from '@remotion/media-parser';
import type {WebCodecsVideoDecoder} from '@remotion/webcodecs';
import {createVideoDecoder, webcodecsController} from '@remotion/webcodecs';
import {makeFrameBuffer} from './frame-buffer';
import {throttledSeek} from './throttled-seek';

export const playMedia = ({
	src,
	signal,
	onDimensions,
	onDurationInSeconds,
	onError,
	drawFrame,
	loop,
}: {
	src: ParseMediaSrc;
	signal: AbortSignal;
	onDimensions: (dim: MediaParserDimensions | null) => void;
	onDurationInSeconds: (duration: number | null) => void;
	drawFrame: (frame: VideoFrame) => void;
	onError: (err: Error) => void;
	loop: boolean;
}) => {
	const wcController = webcodecsController();
	const mpController = mediaParserController();

	const frameBuffer = makeFrameBuffer({
		drawFrame,
		initialLoop: loop,
	});

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let seekVideo = (_time: number, _reason: string) => undefined;

	let decoder: WebCodecsVideoDecoder | null = null;

	const seek = throttledSeek(mpController, (t, r) => seekVideo(t, r));
	seekVideo = (time: number, reason: string) => {
		if (decoder) {
			decoder.reset();
		}

		seek.seek(time);
		frameBuffer.clearBecauseOfSeek();
		mpController.resume();
	};

	const onAbort = () => {
		mpController.abort();
	};

	signal.addEventListener('abort', onAbort);

	parseMedia({
		src,
		acknowledgeRemotionLicense: true,
		controller: mpController,
		onDimensions,
		onDurationInSeconds,
		onVideoTrack: ({track}) => {
			decoder = createVideoDecoder({
				onError: (err) => {
					onError(err);
					mpController.abort();
				},
				onFrame: (frame) => {
					console.log('decoded', frame.timestamp);

					const desiredSeek = seek.getDesiredSeek();
					if (desiredSeek) {
						desiredSeek.addObservedFrame(frame.timestamp);
						if (desiredSeek.isInfeasible()) {
							console.log(
								'infeasible, ' + desiredSeek.getDesired() + ' replace seek',
							);
							// Seek is pending, but we already too far.
							frame.close();
							decoder.reset();
							seek.replaceWithNewestSeek();
							desiredSeek.clearObservedFramesSinceSeek();
							return;
						}

						if (desiredSeek.isDone()) {
							seek.clearSeek();
						} else {
							frame.close();
							return;
						}
					}

					frameBuffer.addFrame(frame);
				},
				track,
				controller: wcController,
			});

			return async (sample) => {
				console.log('retrieved sample', sample.timestamp, sample.type);

				const decoderCancelled = await decoder!.waitForQueueToBeLessThan(20);
				if (decoderCancelled) {
					console.log('decoder cancelled');
					return;
				}

				console.log(decoderCancelled, sample.timestamp);

				const frameBufferCancelled =
					await frameBuffer.waitForQueueToBeLessThan(15);
				if (frameBufferCancelled) {
					decoder!.reset();
					return;
				}

				console.log('decoding', sample.timestamp, sample.type);
				await decoder!.decode(sample);

				console.log('ready for next sample');
				return async () => {
					await decoder!.flush();
					frameBuffer.setLastFrameReceived();
					mpController.pause();

					if (loop) {
						seek.seek(0);
					}
				};
			};
		},
	})
		.catch((err) => {
			if (!hasBeenAborted(err)) {
				onError(err);
			} else {
				console.log('aborted');
			}
		})
		.finally(() => {
			signal.removeEventListener('abort', onAbort);
		});

	return {
		play: () => {
			frameBuffer.play();
		},
		pause: () => {
			frameBuffer.pause();
		},
		isPlaying: () => {
			return frameBuffer.playback.isPlaying();
		},
		getCurrentTime: () => {
			return frameBuffer.playback.getCurrentTime();
		},
		seek: (time: number) => {
			frameBuffer.playback.setCurrentTime(time * WEBCODECS_TIMESCALE);
			if (frameBuffer.processSeekWithQueue(time)) {
				console.log('processed seek in queue');
				seek.clearSeek();
				mpController.resume();
				return;
			}

			seek.queueSeek(time);
		},
		getBufferedTimestamps: () => {
			return frameBuffer.getBufferedTimestamps();
		},
		addEventListener: frameBuffer.playback.emitter.addEventListener,
		removeEventListener: frameBuffer.playback.emitter.removeEventListener,
	};
};

export type Player = ReturnType<typeof playMedia>;
