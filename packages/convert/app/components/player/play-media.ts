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
	let seekVideo = (_time: number) => undefined;

	const seek = throttledSeek(mpController, (t) => seekVideo(t));
	seekVideo = (time: number) => {
		console.log('media parser seek', time);
		seek.seek(time);
		frameBuffer.clearBecauseOfSeek();
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
			const decoder = createVideoDecoder({
				onError: (err) => {
					onError(err);
					mpController.abort();
				},
				onFrame: (frame) => {
					console.log('onFrame', frame.timestamp);
					const desiredSeek = seek.getDesiredSeek();
					if (desiredSeek) {
						desiredSeek.observedFramesSinceSeek.push(frame.timestamp);
						if (desiredSeek.isInfeasible()) {
							// Seek is pending, but we already too far.
							console.log('replace with newest seek');
							frame.close();
							decoder.reset();
							seek.replaceWithNewestSeek();
							return;
						}

						if (desiredSeek.isDone()) {
							console.log('seek done');
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
				const desiredSeek = seek.getDesiredSeek();

				await decoder.waitForQueueToBeLessThan(15);
				const cancelled = await frameBuffer.waitForQueueToBeLessThan(15);

				console.log('retrieved sample', sample.timestamp, cancelled);

				if (cancelled) {
					decoder.reset();
					return;
				}

				await decoder.decode(sample);

				return async () => {
					console.log('end - flushing');
					await decoder.flush();
					console.log('end - flushing done');
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
