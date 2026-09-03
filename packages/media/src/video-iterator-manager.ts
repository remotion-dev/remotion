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

export type VideoIteratorPresentation = {
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
};

export const isSequentialMediaTimeAdvance = ({
	previousTime,
	newTime,
	fps,
	playbackRate,
	isPlaying,
}: {
	previousTime: number;
	newTime: number;
	fps: number;
	playbackRate: number;
	isPlaying: boolean;
}) => {
	if (!isPlaying || newTime < previousTime) {
		return false;
	}

	const maximumSequentialAdvance = Math.abs(playbackRate) / fps;
	return (
		roundTo4Digits(newTime - previousTime) <=
		roundTo4Digits(maximumSequentialAdvance)
	);
};

export const videoIteratorManager = async (
	args:
		| {videoTrack: InputVideoTrack}
		| ({videoTrack: InputVideoTrack} & VideoIteratorPresentation),
) => {
	const {videoTrack} = args;
	let presentation: VideoIteratorPresentation | null =
		'canvas' in args ? args : null;
	let videoIteratorsCreated = 0;
	let videoFrameIterator: VideoIterator | null = null;
	let framesRendered = 0;
	let currentDelayHandle: {unblock: () => void} | null = null;
	let lastDrawnFrame: WrappedCanvas | null = null;
	let currentSeek: number | null = null;

	const clearLastDrawnFrame = () => {
		lastDrawnFrame = null;
	};

	const sizeCanvas = async () => {
		const canvas = presentation?.canvas;
		if (!canvas) {
			return;
		}

		const displayWidth = await videoTrack.getDisplayWidth();
		const displayHeight = await videoTrack.getDisplayHeight();
		if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
			canvas.width = displayWidth;
			canvas.height = displayHeight;
		}
	};

	const canvasSink = new CanvasSink(videoTrack, {
		// Match the preview look-ahead buffer size. CanvasSink may reuse pooled
		// canvas objects for later decoded frames, so Remotion copies pixels into
		// stable canvases before retaining frames across seeks/peeks.
		poolSize: 3,
		fit: 'contain',
		alpha: true,
	});

	const prewarmedVideoIteratorCache =
		makePrewarmedVideoIteratorCache(canvasSink);

	await sizeCanvas();

	const paintFrame = async (frame: WrappedCanvas): Promise<void> => {
		const canvas = presentation?.canvas;
		const context = presentation?.context;
		if (context && canvas) {
			const effects = presentation?.getEffects() ?? [];
			const chainState = presentation?.getEffectChainState(
				canvas.width,
				canvas.height,
			);
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

		presentation?.drawDebugOverlay();
		const callback = presentation?.getOnVideoFrameCallback();
		if (callback) {
			callback(frame.canvas);
		}

		Internals.Log.trace(
			{logLevel: presentation?.logLevel ?? 'info', tag: '@remotion/media'},
			`[MediaPlayer] Drew frame ${frame.timestamp.toFixed(3)}s`,
		);
	};

	const redrawCurrentFrame = async (): Promise<void> => {
		if (!lastDrawnFrame) {
			return;
		}

		await paintFrame(lastDrawnFrame);

		presentation?.drawDebugOverlay();
		const callback = presentation?.getOnVideoFrameCallback();
		if (callback) {
			callback(lastDrawnFrame.canvas);
		}

		Internals.Log.trace(
			{logLevel: presentation?.logLevel ?? 'info', tag: '@remotion/media'},
			`[MediaPlayer] Redrew frame ${lastDrawnFrame.timestamp.toFixed(3)}s with updated effects`,
		);
	};

	const startVideoIterator = async (
		timeToSeek: number,
		nonce: Nonce,
	): Promise<void> => {
		clearLastDrawnFrame();
		videoFrameIterator?.destroy();
		videoFrameIterator = null;
		const activePresentation = presentation;
		if (!activePresentation) {
			return;
		}

		using delayHandle =
			activePresentation.delayPlaybackHandleIfNotPremounting();
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
			// During a paused scrub, every seek goes stale before its decode
			// lands, so returning undrawn would discard every frame and freeze
			// the preview. Painting is safe: the newer seek always lands last.
			if (!videoFrameIterator.isDestroyed() && iterator.initialFrame) {
				await drawFrame(iterator.initialFrame);
			}

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

	const seek = async ({
		newTime,
		nonce,
		fps,
		playbackRate,
		isPlaying,
	}: {
		newTime: number;
		nonce: Nonce;
		fps: number;
		playbackRate: number;
		isPlaying: boolean;
	}) => {
		if (!videoFrameIterator) {
			return;
		}

		if (
			currentSeek !== null &&
			roundTo4Digits(currentSeek) === roundTo4Digits(newTime)
		) {
			return;
		}

		const previousTime = currentSeek;
		currentSeek = newTime;

		if (presentation?.getIsLooping()) {
			// If less than 1 second from the end away, we pre-warm a new iterator
			if (presentation.getLoopSegmentMediaEndTimestamp() - newTime < 1) {
				prewarmedVideoIteratorCache.prewarmIteratorForLooping({
					timeToSeek: presentation.getStartTime(),
				});
			}
		}

		const pendingFrameBehavior =
			previousTime !== null &&
			isSequentialMediaTimeAdvance({
				previousTime,
				newTime,
				fps,
				playbackRate,
				isPlaying,
			})
				? 'wait'
				: 'restart-iterator';
		const videoSatisfyResult = await videoFrameIterator.tryToSatisfySeek(
			newTime,
			{
				pendingFrameBehavior,
				shouldContinue: () => !nonce.isStale(),
			},
		);

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

	const resumeAt = async ({
		newTime,
		nonce,
		fps,
		playbackRate,
		isPlaying,
	}: {
		newTime: number;
		nonce: Nonce;
		fps: number;
		playbackRate: number;
		isPlaying: boolean;
	}) => {
		if (!videoFrameIterator) {
			await startVideoIterator(newTime, nonce);
			return;
		}

		await seek({newTime, nonce, fps, playbackRate, isPlaying});
	};

	return {
		attach: async (nextPresentation: VideoIteratorPresentation) => {
			presentation = nextPresentation;
			await sizeCanvas();
			await redrawCurrentFrame();
		},
		detach: () => {
			const canvas = presentation?.canvas;
			const context = presentation?.context;
			if (context && canvas) {
				context.clearRect(0, 0, canvas.width, canvas.height);
			}

			if (currentDelayHandle) {
				currentDelayHandle.unblock();
				currentDelayHandle = null;
			}

			presentation = null;
		},
		startVideoIterator,
		resumeAt,
		getVideoIteratorsCreated: () => videoIteratorsCreated,
		seek,
		destroy: () => {
			clearLastDrawnFrame();
			prewarmedVideoIteratorCache.destroy();
			videoFrameIterator?.destroy();
			presentation = null;
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
