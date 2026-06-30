import type {InputVideoTrack, WrappedCanvas} from 'mediabunny';
import {CanvasSink} from 'mediabunny';
import type {
	EffectChainState,
	EffectDefinitionAndStack,
	LogLevel,
} from 'remotion';
import {Internals} from 'remotion';
import type {DelayPlaybackIfNotPremounting} from './delay-playback-if-not-premounting';
import {roundTo4Digits} from './helpers/round-to-4-digits';
import type {Nonce} from './nonce-manager';
import {makePrewarmedVideoIteratorCache} from './prewarm-iterator-for-looping';
import {
	createVideoIterator,
	type VideoIterator,
} from './video/video-preview-iterator';

const {runEffectChain} = Internals;

export const videoIteratorManager = async ({
	delayPlaybackHandleIfNotPremounting,
	canvas,
	context,
	drawDebugOverlay,
	logLevel,
	getOnVideoFrameCallback,
	videoTrack,
	getLoopSegmentMediaEndTimestamp,
	getStartTime,
	getIsLooping,
	getEffects,
	getEffectChainState,
}: {
	videoTrack: InputVideoTrack;
	delayPlaybackHandleIfNotPremounting: () => DelayPlaybackIfNotPremounting;
	context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;
	canvas: OffscreenCanvas | HTMLCanvasElement | null;
	getOnVideoFrameCallback: () => null | ((frame: CanvasImageSource) => void);
	logLevel: LogLevel;
	drawDebugOverlay: () => void;
	getLoopSegmentMediaEndTimestamp: () => number;
	getStartTime: () => number;
	getIsLooping: () => boolean;
	getEffects: () => EffectDefinitionAndStack<unknown>[];
	getEffectChainState: (
		width: number,
		height: number,
	) => EffectChainState | null;
}) => {
	let videoIteratorsCreated = 0;
	let videoFrameIterator: VideoIterator | null = null;
	let framesRendered = 0;
	let currentDelayHandle: {unblock: () => void} | null = null;
	let lastDrawnFrame: WrappedCanvas | null = null;
	let currentSeek: number | null = null;

	const clearLastDrawnFrame = () => {
		lastDrawnFrame = null;
	};

	if (canvas) {
		const displayWidth = await videoTrack.getDisplayWidth();
		const displayHeight = await videoTrack.getDisplayHeight();
		if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
			canvas.width = displayWidth;
			canvas.height = displayHeight;
		}
	}

	const canvasSink = new CanvasSink(videoTrack, {
		// Keep one canvas each for the initial frame, the last returned frame
		// and the next frame while iterating.
		poolSize: 3,
		fit: 'contain',
		alpha: true,
	});

	const prewarmedVideoIteratorCache =
		makePrewarmedVideoIteratorCache(canvasSink);

	const paintFrame = async (frame: WrappedCanvas): Promise<void> => {
		if (context && canvas) {
			const effects = getEffects();
			const chainState = getEffectChainState(canvas.width, canvas.height);
			if (
				effects.length > 0 &&
				chainState &&
				canvas instanceof HTMLCanvasElement
			) {
				await runEffectChain({
					state: chainState,
					source: frame.canvas,
					effects,
					output: canvas,
					width: canvas.width,
					height: canvas.height,
				});
			} else {
				context.clearRect(0, 0, canvas.width, canvas.height);
				context.drawImage(frame.canvas, 0, 0);
			}
		}
	};

	const drawFrame = async (frame: WrappedCanvas): Promise<void> => {
		await paintFrame(frame);
		lastDrawnFrame = frame;

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

	const redrawCurrentFrame = async (): Promise<void> => {
		if (!lastDrawnFrame) {
			return;
		}

		await paintFrame(lastDrawnFrame);

		drawDebugOverlay();
		const callback = getOnVideoFrameCallback();
		if (callback) {
			callback(lastDrawnFrame.canvas);
		}

		Internals.Log.trace(
			{logLevel, tag: '@remotion/media'},
			`[MediaPlayer] Redrew frame ${lastDrawnFrame.timestamp.toFixed(3)}s with updated effects`,
		);
	};

	const startVideoIterator = async (
		timeToSeek: number,
		nonce: Nonce,
	): Promise<void> => {
		clearLastDrawnFrame();
		videoFrameIterator?.destroy();
		using delayHandle = delayPlaybackHandleIfNotPremounting();
		currentDelayHandle = delayHandle;
		currentSeek = timeToSeek;

		const iterator = await createVideoIterator(
			timeToSeek,
			prewarmedVideoIteratorCache,
		);
		videoIteratorsCreated++;
		videoFrameIterator = iterator;

		if (iterator.isDestroyed()) {
			return;
		}

		if (nonce.isStale()) {
			return;
		}

		if (videoFrameIterator.isDestroyed()) {
			return;
		}

		if (!iterator.initialFrame) {
			// media ended
			return;
		}

		await drawFrame(iterator.initialFrame);
	};

	const seek = async ({newTime, nonce}: {newTime: number; nonce: Nonce}) => {
		if (!videoFrameIterator) {
			return;
		}

		if (
			currentSeek !== null &&
			roundTo4Digits(currentSeek) === roundTo4Digits(newTime)
		) {
			return;
		}

		currentSeek = newTime;

		if (getIsLooping()) {
			// If less than 1 second from the end away, we pre-warm a new iterator
			if (getLoopSegmentMediaEndTimestamp() - newTime < 1) {
				prewarmedVideoIteratorCache.prewarmIteratorForLooping({
					timeToSeek: getStartTime(),
				});
			}
		}

		const videoSatisfyResult =
			await videoFrameIterator.tryToSatisfySeek(newTime);

		// Doing this before the staleness check, because
		// frame might be better than what we currently have
		// TODO: check if this is actually true
		if (videoSatisfyResult.type === 'satisfied') {
			await drawFrame(videoSatisfyResult.frame);
			return;
		}

		if (nonce.isStale()) {
			return;
		}

		await startVideoIterator(newTime, nonce);
	};

	return {
		startVideoIterator,
		getVideoIteratorsCreated: () => videoIteratorsCreated,
		seek,
		destroy: () => {
			clearLastDrawnFrame();
			prewarmedVideoIteratorCache.destroy();
			videoFrameIterator?.destroy();
			if (context && canvas) {
				context.clearRect(0, 0, canvas.width, canvas.height);
			}

			if (currentDelayHandle) {
				currentDelayHandle.unblock();
				currentDelayHandle = null;
			}

			videoFrameIterator = null;
		},
		getVideoFrameIterator: () => videoFrameIterator,
		drawFrame,
		redrawCurrentFrame,
		getFramesRendered: () => framesRendered,
	};
};

export type VideoIteratorManager = Awaited<
	ReturnType<typeof videoIteratorManager>
>;
