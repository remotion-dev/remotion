import type {InputVideoTrack, WrappedCanvas} from 'mediabunny';
import {CanvasSink} from 'mediabunny';
import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import type {Nonce} from './nonce-manager';
import {
	createVideoIterator,
	type VideoIterator,
} from './video/video-preview-iterator';

export const videoIteratorManager = ({
	delayPlaybackHandleIfNotPremounting,
	canvas,
	context,
	drawDebugOverlay,
	logLevel,
	getOnVideoFrameCallback,
	videoTrack,
}: {
	videoTrack: InputVideoTrack;
	delayPlaybackHandleIfNotPremounting: () => {unblock: () => void};
	context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;
	canvas: OffscreenCanvas | HTMLCanvasElement | null;
	getOnVideoFrameCallback: () => null | ((frame: CanvasImageSource) => void);
	logLevel: LogLevel;
	drawDebugOverlay: () => void;
}) => {
	let videoIteratorsCreated = 0;
	let videoFrameIterator: VideoIterator | null = null;
	let framesRendered = 0;

	if (canvas) {
		canvas.width = videoTrack.displayWidth;
		canvas.height = videoTrack.displayHeight;
	}

	const canvasSink = new CanvasSink(videoTrack, {
		poolSize: 2,
		fit: 'contain',
		alpha: true,
	});

	const drawFrame = (frame: WrappedCanvas): void => {
		if (context && canvas) {
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.drawImage(frame.canvas, 0, 0);
		}

		framesRendered++;

		drawDebugOverlay();
		const callback = getOnVideoFrameCallback();
		if (callback) {
			callback(frame.canvas);
		}

		Internals.Log.trace(
			{logLevel, tag: '@remotion/media'},
			`[MediaPlayer] Drew frame ${frame.timestamp.toFixed(3)}s`,
		);
	};

	const startVideoIterator = async (
		timeToSeek: number,
		nonce: Nonce,
	): Promise<void> => {
		videoFrameIterator?.destroy();
		const iterator = createVideoIterator(timeToSeek, canvasSink);
		videoIteratorsCreated++;
		videoFrameIterator = iterator;

		const delayHandle = delayPlaybackHandleIfNotPremounting();
		const frameResult = await iterator.getNext();
		delayHandle.unblock();

		if (iterator.isDestroyed()) {
			return;
		}

		if (nonce.isStale()) {
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

	const seek = async ({newTime, nonce}: {newTime: number; nonce: Nonce}) => {
		if (!videoFrameIterator) {
			return;
		}

		// Should return immediately, so it's okay to not use Promise.all here
		const videoSatisfyResult =
			await videoFrameIterator.tryToSatisfySeek(newTime);

		// Doing this before the staleness check, because
		// frame might be better than what we currently have
		// TODO: check if this is actually true
		if (videoSatisfyResult.type === 'satisfied') {
			drawFrame(videoSatisfyResult.frame);
			return;
		}

		if (nonce.isStale()) {
			return;
		}

		// Intentionally not awaited, letting audio start as well
		startVideoIterator(newTime, nonce).catch(() => {
			// Ignore errors, might be stale or disposed
		});
	};

	return {
		startVideoIterator,
		getVideoIteratorsCreated: () => videoIteratorsCreated,
		seek,
		destroy: () => {
			videoFrameIterator?.destroy();
			if (context && canvas) {
				context.clearRect(0, 0, canvas.width, canvas.height);
			}

			videoFrameIterator = null;
		},
		getVideoFrameIterator: () => videoFrameIterator,
		drawFrame,
		getFramesRendered: () => framesRendered,
	};
};

export type VideoIteratorManager = ReturnType<typeof videoIteratorManager>;
