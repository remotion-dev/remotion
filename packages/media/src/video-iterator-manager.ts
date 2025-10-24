import type {InputVideoTrack, WrappedCanvas} from 'mediabunny';
import {CanvasSink} from 'mediabunny';
import type {LogLevel} from 'remotion';
import {Internals, type useBufferState} from 'remotion';
import {
	createVideoIterator,
	type VideoIterator,
} from './video/video-preview-iterator';

export const videoIteratorManager = ({
	bufferState,
	canvas,
	context,
	drawDebugOverlay,
	logLevel,
	onVideoFrameCallback,
	videoTrack,
}: {
	videoTrack: InputVideoTrack;
	bufferState: ReturnType<typeof useBufferState>;
	context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
	canvas: OffscreenCanvas | HTMLCanvasElement;
	onVideoFrameCallback: null | ((frame: CanvasImageSource) => void);
	logLevel: LogLevel;
	drawDebugOverlay: () => void;
}) => {
	let videoIteratorsCreated = 0;
	let videoFrameIterator: VideoIterator | null = null;
	let framesRendered = 0;

	canvas.width = videoTrack.displayWidth;
	canvas.height = videoTrack.displayHeight;

	const canvasSink = new CanvasSink(videoTrack, {
		poolSize: 2,
		fit: 'contain',
		alpha: true,
	});

	const drawFrame = (frame: WrappedCanvas): void => {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(frame.canvas, 0, 0);
		framesRendered++;

		drawDebugOverlay();
		if (onVideoFrameCallback) {
			onVideoFrameCallback(canvas);
		}

		Internals.Log.trace(
			{logLevel, tag: '@remotion/media'},
			`[MediaPlayer] Drew frame ${frame.timestamp.toFixed(3)}s`,
		);
	};

	const startVideoIterator = async (
		timeToSeek: number,
		nonce: number,
		getSeekNonce: () => number,
	): Promise<void> => {
		videoFrameIterator?.destroy();
		const iterator = createVideoIterator(timeToSeek, canvasSink);
		videoIteratorsCreated++;
		videoFrameIterator = iterator;

		const delayHandle = bufferState.delayPlayback();
		const frameResult = await iterator.getNext();
		delayHandle.unblock();

		if (iterator.isDestroyed()) {
			return;
		}

		if (nonce !== getSeekNonce()) {
			return;
		}

		if (videoFrameIterator.isDestroyed()) {
			return;
		}

		if (!frameResult.value) {
			// media ended
			return;
		}

		drawFrame(frameResult.value);
	};

	return {
		startVideoIterator,
		getVideoIteratorsCreated: () => videoIteratorsCreated,
		destroy: () => {
			videoFrameIterator?.destroy();
			videoFrameIterator = null;
		},
		getVideoFrameIterator: () => videoFrameIterator,
		drawFrame,
		getFramesRendered: () => framesRendered,
	};
};

export type VideoIteratorManager = ReturnType<typeof videoIteratorManager>;
