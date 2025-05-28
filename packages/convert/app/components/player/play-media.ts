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

	let lastMediaParserSeek = 0;
	const mediaParserSeek = (timestamp: number) => {
		lastMediaParserSeek = timestamp;
		mpController.seek(timestamp);
	};

	const frameBuffer = makeFrameBuffer({
		drawFrame,
		initialLoop: loop,
	});

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
					if (frame.timestamp < lastMediaParserSeek * WEBCODECS_TIMESCALE) {
						return;
					}

					frameBuffer.addFrame(frame);
				},
				track,
				controller: wcController,
			});

			return async (sample) => {
				await decoder.waitForQueueToBeLessThan(15);
				const cancelled = await frameBuffer.waitForQueueToBeLessThan(15);
				if (cancelled) {
					decoder.reset();

					return;
				}

				await decoder.decode(sample);

				return async () => {
					await decoder.flush();
					frameBuffer.setLastFrameReceived();
					mpController.pause();

					if (loop) {
						mediaParserSeek(0);
						mpController.resume();
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
			mediaParserSeek(time);

			mpController.resume();
			frameBuffer.clearBecauseOfSeek();
			frameBuffer.playback.setCurrentTime(time * WEBCODECS_TIMESCALE);
		},
		addEventListener: frameBuffer.playback.emitter.addEventListener,
		removeEventListener: frameBuffer.playback.emitter.removeEventListener,
	};
};

export type Player = ReturnType<typeof playMedia>;
