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

export const playVideo = ({
	src,
	signal,
	onDimensions,
	onError,
	drawFrame,
}: {
	src: ParseMediaSrc;
	signal: AbortSignal;
	onDimensions: (dim: MediaParserDimensions | null) => void;
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
		onVideoTrack: ({track}) => {
			const decoder = createVideoDecoder({
				onError: console.error,
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
	};
};

export type Player = ReturnType<typeof playVideo>;
