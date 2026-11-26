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

type IteratorStart = {
	time: number;
	nonce: Nonce;
	seekRevision: number;
	catchUp: boolean;
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
	getIsPlaying,
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
	getIsPlaying: () => boolean;
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
	let pendingEffectRun: {
		state: EffectChainState;
		runId: number;
		nonce: Nonce | null;
	} | null = null;

	const cancelStaleEffect = () => {
		if (
			pendingEffectRun &&
			(destroyed || pendingEffectRun.nonce?.isStale()) &&
			pendingEffectRun.state.currentRunId === pendingEffectRun.runId
		) {
			pendingEffectRun.state.currentRunId++;
		}
	};

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
		nonce: Nonce | null,
	): Promise<boolean> => {
		if (destroyed) {
			return false;
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
					return true;
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

				const run = {
					state: chainState,
					runId: chainState.currentRunId + 1,
					nonce,
				};
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

					return completed;
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

		return true;
	};

	const drawFrame = async (
		frame: WrappedCanvas,
		mediaTime: number,
		nonce: Nonce | null,
	): Promise<boolean> => {
		const painted = await paintFrame(frame, mediaTime, nonce);
		if (!painted || destroyed || nonce?.isStale()) {
			return false;
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
		return true;
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

		const painted = await paintFrame(lastDrawnFrame, lastDrawnMediaTime, null);
		if (!painted || destroyed) {
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

	let catchUpTarget: {seekRevision: number; lastTime: number} | null = null;

	const startVideoIterator = async (
		{time, nonce, seekRevision, catchUp}: IteratorStart,
		retryReclaimed: boolean,
	): Promise<void> => {
		clearLastDrawnFrame();
		videoFrameIterator?.destroy();
		videoFrameIterator = null;
		catchUpTarget = catchUp ? {seekRevision, lastTime: time} : null;
		currentSeek = null;
		using delayHandle = delayPlaybackHandleIfNotPremounting();
		currentDelayHandle = delayHandle;

		let iterator: VideoIterator;
		try {
			iterator = await createVideoIterator(time, prewarmedVideoIteratorCache);
		} catch (error) {
			if (!retryReclaimed || !isCodecReclaimedError(error)) {
				throw error;
			}

			// A cached loop iterator can already be reclaimed before its first read.
			prewarmedVideoIteratorCache.clear();
			if (destroyed || nonce.isStale()) {
				return;
			}

			iterator = await createVideoIterator(time, prewarmedVideoIteratorCache);
		}

		videoIteratorsCreated++;
		if (destroyed) {
			iterator.destroy();
			return;
		}

		videoFrameIterator = iterator;
		if (iterator.isDestroyed()) {
			return;
		}

		if (catchUp || (getIsPlaying() && getCatchesUp())) {
			catchUpTarget ??= {seekRevision, lastTime: time};
			return;
		}

		// During paused scrubbing every decode may be superseded before it lands.
		// Draw it anyway so the preview updates while dragging.
		currentSeek = time;
		if (iterator.initialFrame) {
			await drawFrame(iterator.initialFrame, time, null);
		}
	};

	const seek = async ({
		newTime,
		nonce,
		fps,
		playbackRate,
		isPlaying,
		continuousPlayback,
		seekRevision,
	}: {
		newTime: number;
		nonce: Nonce;
		fps: number;
		playbackRate: number;
		isPlaying: boolean;
		continuousPlayback: boolean | null;
		seekRevision: number;
	}) => {
		const catchUp = isPlaying && getCatchesUp();
		const restartIterator = (retryReclaimed: boolean) =>
			startVideoIterator(
				{time: newTime, nonce, seekRevision, catchUp},
				retryReclaimed,
			);

		if (!catchUp) {
			catchUpTarget = null;
		}

		if (catchUpTarget) {
			if (
				seekRevision !== catchUpTarget.seekRevision ||
				roundTo4Digits(newTime) < roundTo4Digits(catchUpTarget.lastTime)
			) {
				await restartIterator(true);
				return;
			}

			catchUpTarget.lastTime = newTime;
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

		if (!catchUpTarget && getIsLooping()) {
			// If less than 1 second from the end away, we pre-warm a new iterator
			if (getLoopSegmentMediaEndTimestamp() - newTime < 1) {
				prewarmedVideoIteratorCache.prewarmIteratorForLooping({
					timeToSeek: getStartTime(),
				});
			}
		}

		const pendingFrameBehavior =
			catchUpTarget ||
			(previousTime !== null &&
				newTime >= previousTime &&
				(continuousPlayback ??
					isSequentialMediaTimeAdvance({
						previousTime,
						newTime,
						fps,
						playbackRate,
						isPlaying,
					})))
				? 'wait'
				: 'restart-iterator';
		const iterator = videoFrameIterator;
		const pending: {
			handle: DelayPlaybackIfNotPremounting | null;
			waitedSince: number | null;
		} = {
			handle: null,
			waitedSince: null,
		};
		try {
			const result = await iterator
				.tryToSatisfySeek(newTime, {
					pendingFrameBehavior,
					onWait: () => {
						if (catchUpTarget) {
							pending.waitedSince ??= performance.now();
						}

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
				prewarmedVideoIteratorCache.clear();
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
				if (
					pending.waitedSince !== null &&
					performance.now() - pending.waitedSince >= 1000 / fps
				) {
					return;
				}

				const painted = await drawFrame(
					result.frame,
					newTime,
					catchUp ? nonce : null,
				);
				if (painted) {
					catchUpTarget = null;
					currentSeek = newTime;
				}

				return;
			}

			if (catchUpTarget) {
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
		startVideoIterator: (options: IteratorStart) =>
			startVideoIterator(options, true),
		cancelStaleEffect,
		isCatchingUp: () => catchUpTarget !== null,
		getVideoIteratorsCreated: () => videoIteratorsCreated,
		seek,
		destroy: () => {
			if (destroyed) {
				return;
			}

			destroyed = true;
			onCanvasUpdated = null;
			releaseSink();
			cancelStaleEffect();
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
