import type {InputVideoTrack, WrappedCanvas} from 'mediabunny';
import {VideoSampleSink} from 'mediabunny';
import type {
	EffectChainState,
	EffectDefinitionAndStack,
	LogLevel,
} from 'remotion';
import {Internals} from 'remotion';
import {drawStableFrame, getStableEffectSource} from './canvas-ahead-of-time';
import type {DelayPlaybackIfNotPremounting} from './delay-playback-if-not-premounting';
import {roundTo4Digits} from './helpers/round-to-4-digits';
import {isCodecReclaimedError} from './is-type-of-error';
import type {Nonce} from './nonce-manager';
import {makePrewarmedVideoIteratorCache} from './prewarm-iterator-for-looping';
import type {PreviewFrameResize} from './resize-preview-sample';
import type {MaxCanvasSinkFrameSize} from './video/props';
import {
	createVideoIterator,
	type VideoIterator,
} from './video/video-preview-iterator';

const {runEffectChain} = Internals;

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

	// Legacy fallback for hosts without explicit preview seek intent.
	const maximumSequentialAdvance = Math.abs(playbackRate) / fps;
	return (
		roundTo4Digits(newTime - previousTime) <=
		roundTo4Digits(maximumSequentialAdvance)
	);
};

export const videoIteratorManager = async ({
	getIsDisposed,
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
	maxCanvasSinkFrameSize,
	getCatchesUp,
}: {
	getIsDisposed: () => boolean;
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
	maxCanvasSinkFrameSize: MaxCanvasSinkFrameSize | null;
	getCatchesUp: () => boolean;
}) => {
	let videoIteratorsCreated = 0;
	let videoFrameIterator: VideoIterator | null = null;
	let framesRendered = 0;
	let currentDelayHandle: {unblock: () => void} | null = null;
	let lastDrawnFrame: WrappedCanvas | null = null;
	let lastDrawnMediaTime: number | null = null;
	let lastPlainFrameTime: number | null | undefined;
	let currentSeek: number | null = null;
	let lastPaintedEffects: EffectDefinitionAndStack<unknown>[] = [];
	let lastPaintedEffectChainState: EffectChainState | null = null;
	let lastCompletedEffectPaint: {
		frame: WrappedCanvas;
		effects: EffectDefinitionAndStack<unknown>[];
		chainState: EffectChainState;
	} | null = null;
	let destroyed = false;
	let onCanvasUpdated: ((canvas: HTMLCanvasElement) => void) | null = null;
	let pendingEffectRun: {state: EffectChainState; runId: number} | null = null;

	const clearLastDrawnFrame = () => {
		lastDrawnFrame = null;
		lastDrawnMediaTime = null;
		if (lastPlainFrameTime !== undefined) {
			lastPlainFrameTime = null;
		}

		lastCompletedEffectPaint = null;
	};

	const displayWidth = await videoTrack.getDisplayWidth();
	const displayHeight = await videoTrack.getDisplayHeight();
	if (canvas && !getIsDisposed()) {
		if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
			lastPlainFrameTime = null;
			canvas.width = displayWidth;
			canvas.height = displayHeight;
		}
	}

	const maxWidth = maxCanvasSinkFrameSize?.width ?? Infinity;
	const maxHeight = maxCanvasSinkFrameSize?.height ?? Infinity;
	const frameSize: PreviewFrameResize | null =
		maxWidth / displayWidth < Math.min(1, maxHeight / displayHeight)
			? {axis: 'width', size: maxWidth}
			: maxHeight < displayHeight
				? {axis: 'height', size: maxHeight}
				: null;

	const videoSink = new VideoSampleSink(videoTrack);

	const prewarmedVideoIteratorCache = makePrewarmedVideoIteratorCache(
		videoSink,
		await videoTrack.getTimeResolution(),
		frameSize,
	);

	const releaseSink = Internals.registerMediabunnySink(videoTrack.input);

	const paintFrame = async (
		frame: WrappedCanvas,
		mediaTime: number | null,
	): Promise<void> => {
		if (destroyed) {
			return;
		}

		if (context && canvas) {
			lastPlainFrameTime = null;
			const effects = getEffects();
			lastPaintedEffects = effects;
			const chainState = getEffectChainState(canvas.width, canvas.height);
			lastPaintedEffectChainState = chainState;
			if (
				effects.length > 0 &&
				chainState &&
				canvas instanceof HTMLCanvasElement
			) {
				if (
					lastCompletedEffectPaint?.frame === frame &&
					lastCompletedEffectPaint.effects === effects &&
					lastCompletedEffectPaint.chainState === chainState
				) {
					return;
				}

				lastCompletedEffectPaint = null;
				const firstEnabledEffect = effects.find(
					(effect) => !(effect.params as {disabled?: boolean}).disabled,
				);
				const source = getStableEffectSource(frame, {
					width: canvas.width,
					height: canvas.height,
					allowDirectSource:
						!firstEnabledEffect ||
						firstEnabledEffect.definition.backend === '2d',
				});

				const run = {state: chainState, runId: chainState.currentRunId + 1};
				pendingEffectRun = run;
				try {
					const completed = await runEffectChain({
						state: chainState,
						source,
						effects,
						output: canvas,
						width: canvas.width,
						height: canvas.height,
					});
					if (completed && pendingEffectRun === run) {
						lastCompletedEffectPaint = {frame, effects, chainState};
					}
				} finally {
					if (pendingEffectRun === run) {
						pendingEffectRun = null;
					}
				}
			} else {
				lastCompletedEffectPaint = null;
				context.clearRect(0, 0, canvas.width, canvas.height);
				drawStableFrame(context, frame, canvas.width, canvas.height);
				if (effects.length === 0) {
					lastPlainFrameTime = mediaTime;
				}
			}
		}
	};

	const drawFrame = async (
		frame: WrappedCanvas,
		mediaTime: number,
	): Promise<void> => {
		await paintFrame(frame, mediaTime);
		if (destroyed) {
			return;
		}

		lastDrawnFrame = frame;
		lastDrawnMediaTime = mediaTime;

		framesRendered++;

		drawDebugOverlay();
		if (onCanvasUpdated !== null && canvas instanceof HTMLCanvasElement)
			onCanvasUpdated(canvas);
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

		if (context && canvas) {
			// Once the player becomes ready, an effects redraw is requested even
			// though the initial paint already used the current effects. Skip it
			// so that onVideoFrame does not report the same frame twice.
			const effects = getEffects();
			const chainState = getEffectChainState(canvas.width, canvas.height);
			if (
				effects === lastPaintedEffects &&
				chainState === lastPaintedEffectChainState &&
				(effects.length === 0 ||
					lastCompletedEffectPaint?.frame === lastDrawnFrame)
			) {
				return;
			}
		}

		await paintFrame(lastDrawnFrame, lastDrawnMediaTime);
		if (destroyed) {
			return;
		}

		drawDebugOverlay();
		if (onCanvasUpdated !== null && canvas instanceof HTMLCanvasElement)
			onCanvasUpdated(canvas);
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
		retryReclaimed: boolean,
	): Promise<void> => {
		clearLastDrawnFrame();
		videoFrameIterator?.destroy();
		using delayHandle = delayPlaybackHandleIfNotPremounting();
		currentDelayHandle = delayHandle;
		currentSeek = timeToSeek;

		let iterator: VideoIterator;
		try {
			iterator = await createVideoIterator(
				timeToSeek,
				prewarmedVideoIteratorCache,
			);
		} catch (error) {
			videoFrameIterator = null;
			if (!retryReclaimed || !isCodecReclaimedError(error)) {
				throw error;
			}

			// A cached loop iterator can already be reclaimed before its first read.
			prewarmedVideoIteratorCache.destroy();
			currentSeek = null;
			if (destroyed || nonce.isStale()) {
				return;
			}

			iterator = await createVideoIterator(
				timeToSeek,
				prewarmedVideoIteratorCache,
			);
			currentSeek = timeToSeek;
		}

		videoIteratorsCreated++;

		// destroy() may have run while the first frame was decoding. It could
		// not reach this iterator yet, and nothing else references it, so it
		// would keep pre-decoding samples that are never closed.
		if (destroyed) {
			iterator.destroy();
			return;
		}

		videoFrameIterator = iterator;

		if (iterator.isDestroyed()) {
			return;
		}

		if (nonce.isStale()) {
			// During a paused scrub, every seek goes stale before its decode
			// lands, so returning undrawn would discard every frame and freeze
			// the preview. Painting is safe: the newer seek always lands last.
			if (!videoFrameIterator.isDestroyed() && iterator.initialFrame) {
				await drawFrame(iterator.initialFrame, timeToSeek);
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

		await drawFrame(iterator.initialFrame, timeToSeek);
	};

	// With `pauseWhenBuffering: false`, the player may not hold the clock. It
	// cannot catch the clock by restarting at the current time on every tick:
	// each restart decodes from the keyframe again while the clock moves on.
	// Instead it starts at the playhead and keeps decoding forward across ticks,
	// drawing nothing until it has a frame for the playhead.
	let catchingUp = false;
	let catchUpStart: number | null = null;
	// The timeline seek revision of the playback run being caught up with. null
	// until the first seek of a run that started during initialization.
	let catchUpRevision: number | null = null;

	const startCatchUp = async ({
		time,
		revision,
	}: {
		time: number;
		revision: number | null;
	}): Promise<void> => {
		// The destroyed iterator releases the frame these still point to.
		clearLastDrawnFrame();
		videoFrameIterator?.destroy();
		videoFrameIterator = null;
		catchingUp = true;
		catchUpStart = time;
		catchUpRevision = revision;
		currentSeek = time;

		let iterator: VideoIterator;
		try {
			iterator = await createVideoIterator(time, prewarmedVideoIteratorCache);
		} catch (error) {
			if (!isCodecReclaimedError(error)) {
				catchingUp = false;
				currentSeek = null;
				throw error;
			}

			prewarmedVideoIteratorCache.destroy();
			iterator = await createVideoIterator(time, prewarmedVideoIteratorCache);
		}

		videoIteratorsCreated++;
		if (destroyed || !catchingUp || catchUpStart !== time) {
			iterator.destroy();
			return;
		}

		videoFrameIterator = iterator;
	};

	const seek = async ({
		newTime,
		nonce,
		fps,
		playbackRate,
		isPlaying,
		continuousPlayback,
		seekRevision,
		mappingChanged,
	}: {
		newTime: number;
		nonce: Nonce;
		fps: number;
		playbackRate: number;
		isPlaying: boolean;
		continuousPlayback: boolean | null;
		seekRevision: number | null;
		mappingChanged: boolean;
	}) => {
		const catchesUp = isPlaying && getCatchesUp();
		const restartIterator = (retryReclaimed: boolean) =>
			catchesUp
				? startCatchUp({time: newTime, revision: seekRevision})
				: startVideoIterator(newTime, nonce, retryReclaimed);

		if (!catchesUp) {
			if (catchingUp) {
				// Nothing was drawn while catching up, so this request must not be
				// skipped as a repeat of currentSeek.
				catchingUp = false;
				currentSeek = null;
			}
		} else if (catchingUp) {
			// Catching up belongs to the uninterrupted playback run that started it.
			// An explicit seek, a mapping change or a jump back (a loop wrapping)
			// starts again at the new time.
			catchUpRevision ??= seekRevision;
			if (
				!videoFrameIterator ||
				mappingChanged ||
				(seekRevision !== null && seekRevision !== catchUpRevision) ||
				(catchUpStart !== null && newTime < catchUpStart)
			) {
				await restartIterator(true);
				return;
			}

			const iterator = videoFrameIterator;
			let waited = false;
			const result = await iterator
				.tryToSatisfySeek(newTime, {
					pendingFrameBehavior: 'wait',
					onWait: () => {
						waited = true;
					},
					shouldContinue: () => !nonce.isStale() && !iterator.isDestroyed(),
				})
				.catch((error: unknown) => {
					if (isCodecReclaimedError(error)) {
						return {type: 'decoder-reclaimed' as const};
					}

					throw error;
				});
			if (result.type === 'decoder-reclaimed') {
				prewarmedVideoIteratorCache.destroy();
				await restartIterator(false);
				return;
			}

			// Superseded by a newer tick: the decoder keeps its place and continues
			// from there.
			if (nonce.isStale() || iterator.isDestroyed()) {
				return;
			}

			// Caught up only once the frame was already decoded when asked for. A
			// decoder that had to wait for it is still at the edge, and would hold
			// playback on the next frame as soon as it is shown.
			if (result.type === 'satisfied' && !waited) {
				catchingUp = false;
				await drawFrame(result.frame, newTime);
				currentSeek = newTime;
			}

			return;
		}

		if (!videoFrameIterator) {
			// The previous iterator failed to start, or was discarded after its
			// decoder was reclaimed by a seek that was then superseded.
			if (!destroyed) {
				await restartIterator(true);
			}

			return;
		}

		if (
			currentSeek !== null &&
			roundTo4Digits(currentSeek) === roundTo4Digits(newTime)
		) {
			// A loop can map a new composition frame to the same media time
			// while its effect parameters or output size have changed.
			const effects = getEffects();
			const chainState = canvas
				? getEffectChainState(canvas.width, canvas.height)
				: null;
			if (
				(effects !== lastPaintedEffects ||
					chainState !== lastPaintedEffectChainState) &&
				(effects.length > 0 || lastPaintedEffects.length > 0)
			) {
				await redrawCurrentFrame();
			}

			return;
		}

		const previousTime = currentSeek;

		if (getIsLooping()) {
			// If less than 1 second from the end away, we pre-warm a new iterator
			if (getLoopSegmentMediaEndTimestamp() - newTime < 1) {
				prewarmedVideoIteratorCache.prewarmIteratorForLooping({
					timeToSeek: getStartTime(),
				});
			}
		}

		const pendingFrameBehavior =
			previousTime !== null &&
			newTime >= previousTime &&
			(continuousPlayback ??
				isSequentialMediaTimeAdvance({
					previousTime,
					newTime,
					fps,
					playbackRate,
					isPlaying,
				}))
				? 'wait'
				: 'restart-iterator';
		const iterator = videoFrameIterator;
		const pending: {handle: DelayPlaybackIfNotPremounting | null} = {
			handle: null,
		};
		try {
			const result = await iterator
				.tryToSatisfySeek(newTime, {
					pendingFrameBehavior,
					onWait: () => {
						pending.handle ??= delayPlaybackHandleIfNotPremounting();
						currentDelayHandle = pending.handle;
					},
					shouldContinue: () => !nonce.isStale() && !iterator.isDestroyed(),
				})
				.catch((error: unknown) => {
					if (isCodecReclaimedError(error)) {
						return {type: 'decoder-reclaimed' as const};
					}

					throw error;
				});

			if (result.type === 'decoder-reclaimed') {
				Internals.Log.verbose(
					{logLevel, tag: '@remotion/media'},
					`[MediaPlayer] Video decoder was reclaimed, recreating it at ${newTime.toFixed(3)}s`,
				);
				// Prewarmed loop iterators were idle as well, so their decoders are
				// likely reclaimed too.
				prewarmedVideoIteratorCache.destroy();
				iterator.destroy();
				clearLastDrawnFrame();
				videoFrameIterator = null;
				currentSeek = null;
				if (destroyed || nonce.isStale()) {
					return;
				}

				pending.handle?.unblock();
				pending.handle = null;
				currentDelayHandle = null;
				// A single attempt: if the fresh decoder fails as well, the error
				// propagates.
				await restartIterator(false);
				return;
			}

			if (nonce.isStale() || iterator.isDestroyed()) {
				return;
			}

			if (result.type === 'satisfied') {
				await drawFrame(result.frame, newTime);
				currentSeek = newTime;
				return;
			}

			// The replacement iterator owns its own buffering handle.
			pending.handle?.unblock();
			pending.handle = null;
			currentDelayHandle = null;
			await restartIterator(true);
		} finally {
			pending.handle?.unblock();
			if (currentDelayHandle === pending.handle) {
				currentDelayHandle = null;
			}
		}
	};

	return {
		setCanvasUpdateCallback: (
			callback: ((canvas: HTMLCanvasElement) => void) | null,
		) => {
			onCanvasUpdated = callback;
		},
		startVideoIterator: (timeToSeek: number, nonce: Nonce) =>
			startVideoIterator(timeToSeek, nonce, true),
		startCatchUp,
		isCatchingUp: () => catchingUp,
		getVideoIteratorsCreated: () => videoIteratorsCreated,
		seek,
		destroy: () => {
			if (destroyed) {
				return;
			}

			destroyed = true;
			onCanvasUpdated = null;
			releaseSink();
			// Cancel only this manager's pending run, not a newer run sharing its state.
			if (
				pendingEffectRun &&
				pendingEffectRun.state.currentRunId === pendingEffectRun.runId
			) {
				pendingEffectRun.state.currentRunId++;
			}

			pendingEffectRun = null;
			clearLastDrawnFrame();
			prewarmedVideoIteratorCache.destroy();
			videoFrameIterator?.destroy();
			if (context && canvas && framesRendered > 0) {
				context.clearRect(0, 0, canvas.width, canvas.height);
			}

			if (currentDelayHandle) {
				currentDelayHandle.unblock();
				currentDelayHandle = null;
			}

			videoFrameIterator = null;
		},
		getVideoFrameIterator: () => videoFrameIterator,
		getPlainFrameTime: (copiedFrameTime: number | null) => {
			if (destroyed || pendingEffectRun || lastCompletedEffectPaint) {
				return null;
			}

			return lastPlainFrameTime === undefined
				? copiedFrameTime
				: lastPlainFrameTime;
		},
		drawFrame,
		redrawCurrentFrame,
		getFramesRendered: () => framesRendered,
	};
};

export type VideoIteratorManager = Awaited<
	ReturnType<typeof videoIteratorManager>
>;
