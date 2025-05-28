import type {
	MediaParserDimensions,
	ParseMediaSrc,
} from '@remotion/media-parser';
import {
	hasBeenAborted,
	mediaParserController,
	parseMedia,
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
}: {
	src: ParseMediaSrc;
	signal: AbortSignal;
	onDimensions: (dim: MediaParserDimensions | null) => void;
	onDurationInSeconds: (duration: number) => void;
	drawFrame: (frame: VideoFrame) => void;
	onError: (err: Error) => void;
}) => {
	const wcController = webcodecsController();
	const mpController = mediaParserController();

	const frameBuffer = makeFrameBuffer({
		drawFrame,
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
					frameBuffer.addFrame(frame);
				},
				track,
				controller: wcController,
			});

			return async (sample) => {
				await decoder.waitForQueueToBeLessThan(15);
				await frameBuffer.waitForQueueToBeLessThan(15);
				await decoder.decode(sample);
				return async () => {
					await decoder.flush();
					frameBuffer.setLastFrameReceived();
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
		addEventListener: frameBuffer.playback.emitter.addEventListener,
		removeEventListener: frameBuffer.playback.emitter.removeEventListener,
	};
};

export type Player = ReturnType<typeof playMedia>;
