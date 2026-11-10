import React, {
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {EffectsOutputSize} from 'remotion';
import type {
	EffectDefinitionAndStack,
	LogLevel,
	LoopVolumeCurveBehavior,
	SequenceControls,
	StaticFile,
	VolumeProp,
} from 'remotion';
import {
	Html5Video,
	Internals,
	useBufferState,
	useCurrentFrame,
	useRemotionEnvironment,
	useVideoConfig,
} from 'remotion';
import {getSharedInputCacheKey} from '../get-shared-input';
import {getTimeInSeconds} from '../get-time-in-seconds';
import {frameForVolumeProp} from '../looped-frame';
import {MediaPlayer} from '../media-player';
import {type MediaOnError, callOnErrorAndResolve} from '../on-error';
import {ProResDecoderNotEnabledError} from '../prores-error';
import type {MediaRequestInit} from '../request-init';
import {useCommonEffects} from '../use-common-effects';
import {useMediaPlayerMuted} from '../use-media-player-muted';
import type {
	FallbackOffthreadVideoProps,
	MaxCanvasSinkFrameSize,
	NativeVideoProps,
	VideoObjectFit,
} from './props';
import {cacheVideoFrame, getCachedVideoFrame} from './video-frame-cache';
import {warnAboutObjectFitInStyleOrClassName} from './warn-object-fit-css';

const {
	useUnsafeVideoConfig,
	SharedAudioContext,
	useMediaVolumeState,
	useFrameForVolumeProp,
	evaluateVolume,
	warnAboutTooHighVolume,
	usePreload,
	SequenceContext,
	useEffectChainState,
	usePlaying,
	useBuffering,
	useMediaAudioState,
} = Internals;

type VideoForPreviewProps = NativeVideoProps & {
	readonly src: string;
	readonly style: React.CSSProperties | undefined;
	readonly playbackRate: number;
	readonly preservePitch: boolean | null;
	readonly toneFrequency: number;
	readonly logLevel: LogLevel;
	readonly className: string | undefined;
	readonly muted: boolean;
	readonly volume: VolumeProp;
	readonly loopVolumeCurveBehavior: LoopVolumeCurveBehavior;
	readonly onVideoFrame: undefined | ((frame: CanvasImageSource) => void);
	readonly showInTimeline: boolean;
	readonly loop: boolean;
	readonly trimAfter: number | undefined;
	readonly trimBefore: number | undefined;
	readonly _remotionInternalStack: string | null;
	readonly disallowFallbackToOffthreadVideo: boolean;
	readonly fallbackOffthreadVideoProps: FallbackOffthreadVideoProps;
	readonly audioStreamIndex: number | null;
	readonly debugOverlay: boolean;
	readonly headless: boolean;
	readonly onError: MediaOnError | undefined;
	readonly credentials: RequestCredentials | undefined;
	readonly requestInit: MediaRequestInit | undefined;
	readonly objectFit: VideoObjectFit;
	readonly maxCanvasSinkFrameSize: MaxCanvasSinkFrameSize | null;
	readonly setMediaDurationInSeconds: (durationInSeconds: number) => void;
	readonly _experimentalInitiallyDrawCachedFrame: boolean;
	readonly effects: EffectDefinitionAndStack<unknown>[];
	readonly effectsOutputSize: EffectsOutputSize | null;
};

type VideoForPreviewAssertedShowingProps = VideoForPreviewProps & {
	readonly mediaTime: number;
};

const studioVideoCanvases = new Map<
	HTMLCanvasElement,
	{sourceKey: string; getPlainFrameTime: () => number | null}
>();

const VideoForPreviewAssertedShowing: React.FC<
	VideoForPreviewAssertedShowingProps
> = ({
	src: unpreloadedSrc,
	mediaTime,
	style,
	playbackRate,
	toneFrequency,
	preservePitch,
	logLevel,
	className,
	muted,
	volume,
	loopVolumeCurveBehavior,
	onVideoFrame,
	showInTimeline,
	loop,
	trimAfter,
	trimBefore,
	_remotionInternalStack,
	disallowFallbackToOffthreadVideo,
	fallbackOffthreadVideoProps,
	audioStreamIndex,
	debugOverlay,
	headless,
	onError,
	credentials,
	requestInit,
	objectFit: objectFitProp,
	maxCanvasSinkFrameSize,
	_experimentalInitiallyDrawCachedFrame,
	effects,
	effectsOutputSize,
	setMediaDurationInSeconds,
	...props
}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const {isStudio} = useRemotionEnvironment();
	const [staticFiles, setStaticFiles] = useState<StaticFile[] | null>(() =>
		isStudio ? (window.remotion_staticFiles ?? null) : null,
	);
	useEffect(() => {
		if (!isStudio) {
			return;
		}

		const update = () => setStaticFiles(window.remotion_staticFiles ?? null);
		update();
		window.addEventListener(Internals.WATCH_REMOTION_STATIC_FILES, update);
		return () => {
			window.removeEventListener(Internals.WATCH_REMOTION_STATIC_FILES, update);
		};
	}, [isStudio]);

	const knownStaticFile = useMemo(
		() =>
			isStudio
				? (window.remotion_staticFiles?.find(
						(file) => file.src === unpreloadedSrc,
					) ?? null)
				: null,
		[isStudio, unpreloadedSrc],
	);
	const {missing: missingStaticFile, src: resolvedSrc} = useMemo(() => {
		const unchanged = {missing: null, src: unpreloadedSrc};
		if (!isStudio || !staticFiles) {
			return unchanged;
		}

		let fileName = knownStaticFile?.name ?? null;
		if (fileName === null) {
			const staticBase = window.remotion_staticBase;
			if (
				typeof staticBase !== 'string' ||
				(staticBase === '' &&
					(!unpreloadedSrc.startsWith('/') || unpreloadedSrc.startsWith('//')))
			) {
				return unchanged;
			}

			try {
				const source = new URL(unpreloadedSrc, window.location.href);
				const base = new URL(`${staticBase}/`, window.location.href);
				if (
					source.origin !== base.origin ||
					!source.pathname.startsWith(base.pathname)
				) {
					return unchanged;
				}

				fileName = decodeURIComponent(
					source.pathname.slice(base.pathname.length),
				);
			} catch {
				return unchanged;
			}
		}

		const file = staticFiles.find((entry) => entry.name === fileName);
		return {
			missing: file ? null : fileName,
			src: file?.src.startsWith('blob:') ? file.src : unpreloadedSrc,
		};
	}, [isStudio, knownStaticFile, staticFiles, unpreloadedSrc]);
	const src = usePreload(resolvedSrc);
	const videoConfig = useUnsafeVideoConfig();
	const frame = useCurrentFrame();
	const mediaPlayerRef = useRef<MediaPlayer | null>(null);
	const initialTrimBeforeRef = useRef(trimBefore);
	const initialTrimAfterRef = useRef(trimAfter);
	const initialOnVideoFrameRef = useRef(onVideoFrame);
	const [initialRequestInit] = useState(requestInit);

	const [mediaPlayerReady, setMediaPlayerReady] = useState(false);
	const [knownDuration, setKnownDuration] = useState<number | null>(null);
	const [terminalError, setTerminalError] = useState<Error | null>(null);
	const [shouldFallbackToNativeVideo, setShouldFallbackToNativeVideo] =
		useState(false);

	const playing = usePlaying();
	const {playbackRate: globalPlaybackRate} = Internals.usePlaybackRate();
	const preservePitchOnPlayback = useContext(Internals.PlaybackPitchContext);
	const sharedAudioContext = useContext(SharedAudioContext);
	const buffer = useBufferState();

	const [mediaVolume] = useMediaVolumeState();

	const unloopedVolumePropFrame = useFrameForVolumeProp(
		loopVolumeCurveBehavior,
	);
	const volumePropFrame =
		loop && videoConfig
			? frameForVolumeProp({
					behavior: loopVolumeCurveBehavior,
					loop,
					assetDurationInSeconds: knownDuration,
					fps: videoConfig.fps,
					frame,
					startsAt: unloopedVolumePropFrame - frame,
					playbackRate,
					trimBefore,
					trimAfter,
				})
			: unloopedVolumePropFrame;

	const userPreferredVolume = evaluateVolume({
		frame: volumePropFrame,
		volume,
		mediaVolume,
	});

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	warnAboutTooHighVolume(userPreferredVolume);

	const effectChainState = useEffectChainState(effectsOutputSize);

	const effectsRef = useRef(effects);
	effectsRef.current = effects;

	const onErrorRef = useRef(onError);
	onErrorRef.current = onError;
	const disallowFallbackRef = useRef(disallowFallbackToOffthreadVideo);
	disallowFallbackRef.current = disallowFallbackToOffthreadVideo;

	const effectChainStateRef = useRef(effectChainState);
	effectChainStateRef.current = effectChainState;

	const maxCanvasSinkFrameSizeRef = useRef(maxCanvasSinkFrameSize);
	maxCanvasSinkFrameSizeRef.current = maxCanvasSinkFrameSize;

	const parentSequence = useContext(SequenceContext);
	const isPremounting = Boolean(parentSequence?.premounting);
	const isPostmounting = Boolean(parentSequence?.postmounting);
	const sequenceOffset = (parentSequence?.absoluteFrom ?? 0) / videoConfig.fps;

	const sequencePlaybackRate = parentSequence?.playbackRate ?? 1;
	const effectivePlaybackRate = playbackRate * sequencePlaybackRate;
	const effectiveToneFrequency =
		(toneFrequency ?? 1) /
		(preservePitch ? effectivePlaybackRate : 1) /
		(preservePitchOnPlayback && globalPlaybackRate > 0
			? globalPlaybackRate
			: 1);
	const sequenceDurationInFrames =
		videoConfig.durationInFrames / sequencePlaybackRate;
	const currentTime = frame / sequencePlaybackRate / videoConfig.fps;

	const currentTimeRef = useRef(currentTime);
	currentTimeRef.current = currentTime;

	const preloadedSrc = usePreload(src);
	const audioEnabled = Internals.useAudioEnabled();
	// TODO: Consider Sequence hidden
	const {isMutedForPlayback: effectiveMuted} = useMediaAudioState({
		muted: muted || audioEnabled === false,
		volume: userPreferredVolume,
		audioEnabled: audioEnabled !== false,
	});
	const mediaPlayerMuted = useMediaPlayerMuted({
		muted,
		volume: userPreferredVolume,
	});

	const isPlayerBuffering = useBuffering();
	const initialPlaying = useRef(playing && !isPlayerBuffering);
	const initialIsPremounting = useRef(isPremounting);
	const initialIsPostmounting = useRef(isPostmounting);
	const initialGlobalPlaybackRate = useRef(globalPlaybackRate);
	const initialPlaybackRate = useRef(effectivePlaybackRate);
	const initialToneFrequency = useRef(effectiveToneFrequency);
	const initialMuted = useRef(mediaPlayerMuted);
	const initialVolume = useRef(userPreferredVolume);
	const initialSequenceDuration = useRef(sequenceDurationInFrames);
	const initialSequenceOffset = useRef(sequenceOffset);
	const hasDrawnRealFrameRef = useRef(false);
	const isPremountingRef = useRef(isPremounting);
	isPremountingRef.current = isPremounting;

	const maxWidth = maxCanvasSinkFrameSize?.width;
	const maxHeight = maxCanvasSinkFrameSize?.height;
	const studioSourceKey = useMemo(
		() =>
			isStudio
				? JSON.stringify([
						getSharedInputCacheKey({
							src: preloadedSrc,
							credentials,
							requestInit: initialRequestInit,
						}),
						maxWidth,
						maxHeight,
					])
				: null,
		[
			credentials,
			initialRequestInit,
			isStudio,
			maxHeight,
			maxWidth,
			preloadedSrc,
		],
	);
	const copiedFrameRef = useRef<{
		canvas: HTMLCanvasElement;
		sourceKey: string;
		mediaTime: number;
		width: number;
		height: number;
	} | null>(null);
	const canSharePausedFrame =
		!shouldFallbackToNativeVideo &&
		terminalError === null &&
		!playing &&
		!loop &&
		!debugOverlay &&
		!onVideoFrame &&
		effects.length === 0 &&
		!_experimentalInitiallyDrawCachedFrame;
	const canSharePausedFrameRef = useRef(canSharePausedFrame);
	canSharePausedFrameRef.current = canSharePausedFrame;
	const mediaTimeRef = useRef(mediaTime);
	mediaTimeRef.current = mediaTime;
	const canReceivePausedFrame =
		canSharePausedFrame && !isPremounting && !isPostmounting && !headless;
	useLayoutEffect(() => {
		const canvas = canvasRef.current;
		if (
			!canvas ||
			!studioSourceKey ||
			!canReceivePausedFrame ||
			mediaPlayerRef.current
		) {
			return;
		}

		for (const [source, previous] of studioVideoCanvases) {
			if (
				source !== canvas &&
				previous.sourceKey === studioSourceKey &&
				previous.getPlainFrameTime() === mediaTimeRef.current
			) {
				const context = canvas.getContext('2d');
				if (!context) {
					return;
				}

				canvas.width = source.width;
				canvas.height = source.height;
				context.drawImage(source, 0, 0);
				copiedFrameRef.current = {
					canvas,
					sourceKey: studioSourceKey,
					mediaTime: mediaTimeRef.current,
					width: canvas.width,
					height: canvas.height,
				};
				break;
			}
		}
	}, [canReceivePausedFrame, studioSourceKey]);

	useLayoutEffect(() => {
		if (!_experimentalInitiallyDrawCachedFrame) {
			return;
		}

		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const cached = getCachedVideoFrame(src);
		if (!cached) {
			return;
		}

		canvas.width = cached.width;
		canvas.height = cached.height;
		const ctx = canvas.getContext('2d', {
			alpha: true,
		});
		if (!ctx) {
			return;
		}

		ctx.drawImage(cached, 0, 0);
	}, [_experimentalInitiallyDrawCachedFrame, src]);

	useLayoutEffect(() => {
		if (!_experimentalInitiallyDrawCachedFrame) {
			return;
		}

		const currentCanvasRef = canvasRef;
		return () => {
			const canvas = currentCanvasRef.current;

			if (
				!canvas ||
				!hasDrawnRealFrameRef.current ||
				isPremountingRef.current
			) {
				return;
			}

			cacheVideoFrame(src, canvas);
		};
	}, [_experimentalInitiallyDrawCachedFrame, src]);

	useEffect(() => {
		if (missingStaticFile !== null) {
			return;
		}

		// The context is created after commit. Avoid initializing a silent player
		// that would immediately be replaced when its audio context becomes ready.
		if (sharedAudioContext?.audioContextPending) {
			return;
		}

		const sharedAudioContextForMediaPlayer =
			sharedAudioContext?.audioContext && sharedAudioContext.gainNode
				? {
						audioContext: sharedAudioContext.audioContext,
						gainNode: sharedAudioContext.gainNode,
						audioSyncAnchor: sharedAudioContext.audioSyncAnchor,
						scheduleAudioNode: sharedAudioContext.scheduleAudioNode,
						unscheduleAudioNode: sharedAudioContext.unscheduleAudioNode,
					}
				: null;

		const canvas = canvasRef.current;
		try {
			const player = new MediaPlayer({
				canvas,
				src: preloadedSrc,
				logLevel,
				sharedAudioContext: sharedAudioContextForMediaPlayer,
				loop,
				trimAfter: initialTrimAfterRef.current,
				trimBefore: initialTrimBeforeRef.current,
				fps: videoConfig.fps,
				playbackRate: initialPlaybackRate.current,
				toneFrequency: initialToneFrequency.current,
				audioStreamIndex,
				debugOverlay,
				bufferState: buffer,
				isPremounting: initialIsPremounting.current,
				isPostmounting: initialIsPostmounting.current,
				globalPlaybackRate: initialGlobalPlaybackRate.current,
				durationInFrames: initialSequenceDuration.current,
				onVideoFrameCallback: initialOnVideoFrameRef.current ?? null,
				playing: initialPlaying.current,
				sequenceOffset: initialSequenceOffset.current,
				credentials,
				requestInit: initialRequestInit,
				tagType: 'video',
				getEffects: () => effectsRef.current,
				getEffectChainState: (width, height) =>
					effectChainStateRef.current?.get(width, height)!,
				maxCanvasSinkFrameSize: maxCanvasSinkFrameSizeRef.current,
				onError: (error) => {
					const [action, errorToUse] = callOnErrorAndResolve({
						onError: onErrorRef.current,
						error,
						disallowFallback: disallowFallbackRef.current,
						isClientSideRendering: false,
						clientSideError: error,
					});
					if (action === 'fallback') {
						setShouldFallbackToNativeVideo(true);
					} else {
						setTerminalError(errorToUse);
					}
				},
			});

			if (canvas && studioSourceKey) {
				const copied = copiedFrameRef.current;
				copiedFrameRef.current = null;
				studioVideoCanvases.set(canvas, {
					sourceKey: studioSourceKey,
					getPlainFrameTime: () => {
						if (!canSharePausedFrameRef.current) {
							return null;
						}

						const copiedTime =
							copied?.canvas === canvas &&
							copied.sourceKey === studioSourceKey &&
							copied.mediaTime === mediaTimeRef.current &&
							copied.width === canvas.width &&
							copied.height === canvas.height
								? copied.mediaTime
								: null;
						return player.videoIteratorManager
							? player.videoIteratorManager.getPlainFrameTime(copiedTime)
							: copiedTime;
					},
				});
			}

			mediaPlayerRef.current = player;
			player
				.initialize(
					currentTimeRef.current,
					initialMuted.current,
					initialVolume.current,
				)
				.then((result) => {
					if (result.type === 'disposed') {
						return;
					}

					const handleError = (error: Error, fallbackMessage: string) => {
						const [action, errorToUse] = callOnErrorAndResolve({
							onError: onErrorRef.current,
							error,
							disallowFallback: disallowFallbackToOffthreadVideo,
							isClientSideRendering: false,
							clientSideError: error,
						});
						if (action === 'fail') {
							throw errorToUse;
						}

						// action === 'fallback'
						Internals.Log.warn(
							{logLevel, tag: '@remotion/media'},
							fallbackMessage,
						);
						setShouldFallbackToNativeVideo(true);
					};

					if (
						result.type === 'unknown-container-format' ||
						result.type === 'network-error'
					) {
						// The catch below applies onError and the existing fallback policy.
						throw result.error;
					}

					if (result.type === 'cannot-decode') {
						handleError(
							result.error,
							`Cannot decode ${preloadedSrc}, falling back to <OffthreadVideo>`,
						);
						return;
					}

					if (result.type === 'cannot-decode-prores') {
						// Unrecoverable: a native <video> can't decode ProRes either, so
						// we must not fall back. The .catch below notifies onError and
						// rethrows without falling back.
						throw new ProResDecoderNotEnabledError(preloadedSrc);
					}

					if (result.type === 'no-tracks') {
						handleError(
							new Error(`No video or audio tracks found for ${preloadedSrc}.`),
							`No video or audio tracks found for ${preloadedSrc}, falling back to <OffthreadVideo>`,
						);
						return;
					}

					if (result.type === 'success') {
						setMediaPlayerReady(true);
						setMediaDurationInSeconds(result.durationInSeconds);
						setKnownDuration(result.durationInSeconds);

						hasDrawnRealFrameRef.current = true;
					}
				})
				.catch((error) => {
					// ProRes without a registered decoder is unrecoverable and must not
					// fall back to a native <video> (which cannot decode it either).
					// Notify onError once for observability, then rethrow.
					if (error instanceof ProResDecoderNotEnabledError) {
						onErrorRef.current?.(error);
						throw error;
					}

					const [action, errorToUse] = callOnErrorAndResolve({
						onError: onErrorRef.current,
						error,
						disallowFallback: disallowFallbackToOffthreadVideo,
						isClientSideRendering: false,
						clientSideError: error,
					});
					if (action === 'fail') {
						throw errorToUse;
					}

					Internals.Log.error(
						{logLevel, tag: '@remotion/media'},
						'[VideoForPreview] Failed to initialize MediaPlayer',
						errorToUse,
					);
					setShouldFallbackToNativeVideo(true);
				});
		} catch (error) {
			const [action, errorToUse] = callOnErrorAndResolve({
				error: error as Error,
				onError: onErrorRef.current,
				disallowFallback: disallowFallbackToOffthreadVideo,
				isClientSideRendering: false,
				clientSideError: error as Error,
			});
			if (action === 'fail') {
				throw errorToUse;
			}

			Internals.Log.error(
				{logLevel, tag: '@remotion/media'},
				'[VideoForPreview] MediaPlayer initialization failed',
				errorToUse,
			);
			setShouldFallbackToNativeVideo(true);
		}

		return () => {
			if (canvas && studioSourceKey) {
				studioVideoCanvases.delete(canvas);
			}

			if (mediaPlayerRef.current) {
				Internals.Log.trace(
					{logLevel, tag: '@remotion/media'},
					`[VideoForPreview] Disposing MediaPlayer`,
				);
				mediaPlayerRef.current.dispose();
				mediaPlayerRef.current = null;
			}

			setMediaPlayerReady(false);
			setShouldFallbackToNativeVideo(false);
			hasDrawnRealFrameRef.current = false;
		};
	}, [
		audioStreamIndex,
		buffer,
		debugOverlay,
		disallowFallbackToOffthreadVideo,
		logLevel,
		loop,
		missingStaticFile,
		preloadedSrc,
		sharedAudioContext,
		videoConfig.fps,
		credentials,
		initialRequestInit,
		setMediaDurationInSeconds,
		studioSourceKey,
		// Compare the numbers, so that a new object with the same size does not
		// recreate the player.
		maxCanvasSinkFrameSize?.width,
		maxCanvasSinkFrameSize?.height,
	]);

	warnAboutObjectFitInStyleOrClassName({style, className, logLevel});

	const classNameValue = useMemo(() => {
		return [Internals.OBJECTFIT_CONTAIN_CLASS_NAME, className]
			.filter(Internals.truthy)
			.join(' ');
	}, [className]);

	useCommonEffects({
		mediaPlayerRef,
		mediaPlayerReady,
		currentTimeRef,
		playing,
		isPlayerBuffering,
		frame,
		trimBefore,
		trimAfter,
		effectiveMuted: mediaPlayerMuted,
		userPreferredVolume,
		playbackRate: effectivePlaybackRate,
		toneFrequency: effectiveToneFrequency,
		globalPlaybackRate,
		fps: videoConfig.fps,
		sequenceOffset,
		loop,
		durationInFrames: sequenceDurationInFrames,
		isPremounting,
		isPostmounting,
		currentTime,
		logLevel,
		label: 'VideoForPreview',
	});

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setDebugOverlay(debugOverlay);
	}, [debugOverlay, mediaPlayerReady]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setVideoFrameCallback(onVideoFrame ?? null);
	}, [onVideoFrame, mediaPlayerReady]);

	const lastEffectsTime = useRef(currentTime);
	useLayoutEffect(() => {
		const timeChanged = lastEffectsTime.current !== currentTime;
		lastEffectsTime.current = currentTime;
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady || timeChanged) {
			return;
		}

		mediaPlayer.redrawVideoEffects().catch(() => {
			// Player may have been disposed between layout and the async redraw.
		});
	}, [
		currentTime,
		effects,
		effectsOutputSize?.width,
		effectsOutputSize?.height,
		mediaPlayerReady,
		mediaPlayerRef,
	]);

	const actualStyle: React.CSSProperties = useMemo(() => {
		return {
			...style,
			// TODO: Previousy we did hide on isSequenceHidden
			objectFit: objectFitProp,
		};
	}, [objectFitProp, style]);

	if (missingStaticFile !== null) {
		if (headless) {
			return null;
		}

		return (
			<div
				{...props}
				className={className}
				role="img"
				aria-label={`Media unavailable: ${missingStaticFile}`}
				style={{
					width: 300,
					height: 150,
					...actualStyle,
					backgroundColor: '#2a1819',
				}}
			>
				<svg width="100%" height="100%" viewBox="0 0 480 270">
					<g
						fill="none"
						stroke="#d58d90"
						strokeWidth={2}
						strokeLinejoin="round"
					>
						<path
							d="M238.680 70.333C237.925 70.054 237.138 69.781 236.267 69.496C233.039 68.442 229.044 67.527 225.665 67.071C225.134 66.999 224.413 66.958 224.036 66.977C222.881 67.040 221.950 67.223 221.011 67.580C220.543 67.757 219.776 68.140 219.354 68.405C217.588 69.513 216.242 71.177 215.540 73.114C215.400 73.498 215.021 74.721 214.777 75.563C213.154 81.191 212.233 87.345 212.035 93.858C212.003 94.896 212.003 97.366 212.035 98.386C212.167 102.705 212.580 106.603 213.328 110.579C213.632 112.188 214.119 114.349 214.401 115.331C214.978 117.326 216.155 119.024 217.829 120.269C218.951 121.104 220.225 121.664 221.636 121.938C222.316 122.071 223.214 122.131 223.875 122.088C224.789 122.028 226.603 121.784 228.077 121.521C231.772 120.863 235.310 119.914 238.680 118.680L235.460 104.720L240.980 93.910L234.540 86.550Z"
							transform="translate(-6 0) rotate(-8 230 97)"
						/>
						<path
							d="M238.680 118.680C241.370 117.695 243.953 116.529 246.423 115.182C249.948 113.259 252.961 111.177 255.868 108.651C258.765 106.137 261.235 103.433 263.409 100.398C263.913 99.696 264.166 99.286 264.420 98.770C265.071 97.438 265.377 96.114 265.375 94.633C265.375 93.253 265.114 92.027 264.552 90.773C264.282 90.167 264.024 89.733 263.445 88.908C261.312 85.871 258.946 83.225 256.061 80.653C251.588 76.668 246.276 73.399 240.344 70.979C239.793 70.755 239.246 70.542 238.680 70.333L234.540 86.550L240.980 93.910L235.460 104.720Z"
							transform="translate(7 2) rotate(9 254 97)"
						/>
					</g>
					<text
						x={240}
						y={155}
						textAnchor="middle"
						fill="#ffe1e1"
						fontFamily="Arial, sans-serif"
						fontSize={24}
					>
						Media unavailable
					</text>
					<foreignObject x={20} y={158} width={440} height={50}>
						<div
							style={{
								color: '#d58d90',
								fontFamily: 'Arial, sans-serif',
								fontSize: 14,
								textAlign: 'center',
								overflowWrap: 'anywhere',
							}}
						>
							{missingStaticFile}
						</div>
					</foreignObject>
				</svg>
			</div>
		);
	}

	if (terminalError) {
		throw terminalError;
	}

	if (shouldFallbackToNativeVideo && !disallowFallbackToOffthreadVideo) {
		// <Video> will fallback to <VideoForPreview> anyway
		// not using <OffthreadVideo> because it does not support looping
		return (
			<Html5Video
				{...props}
				src={src}
				style={actualStyle}
				className={className}
				muted={effectiveMuted}
				volume={volume}
				trimAfter={trimAfter}
				trimBefore={trimBefore}
				playbackRate={playbackRate}
				toneFrequency={toneFrequency}
				loopVolumeCurveBehavior={loopVolumeCurveBehavior}
				name={'<Html5Video> (fallback)'}
				loop={loop}
				showInTimeline={showInTimeline}
				_remotionInternalStack={_remotionInternalStack ?? undefined}
				{...fallbackOffthreadVideoProps}
				preservePitch={
					fallbackOffthreadVideoProps?.preservePitch ?? preservePitch ?? true
				}
			/>
		);
	}

	if (headless) {
		return null;
	}

	return (
		<canvas
			{...props}
			ref={canvasRef}
			// Don't set width and height here.
			// Width is set in the video iterator manager, if props are being updated, they are being applied again by React.
			// This will lead to inefficient resizes.
			style={actualStyle}
			className={classNameValue}
		/>
	);
};

export const VideoForPreview: React.FC<
	VideoForPreviewProps & {
		readonly controls: SequenceControls | undefined;
	}
> = (props) => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const currentTime = frame / videoConfig.fps;

	const mediaTime = useMemo(
		() =>
			getTimeInSeconds({
				unloopedTimeInSeconds: currentTime,
				playbackRate: props.playbackRate,
				loop: props.loop,
				trimBefore: props.trimBefore,
				trimAfter: props.trimAfter,
				mediaDurationInSeconds: Infinity,
				fps: videoConfig.fps,
				ifNoMediaDuration: 'infinity',
				src: props.src,
			}),
		[
			currentTime,
			props.loop,
			props.playbackRate,
			props.src,
			videoConfig.fps,
			props.trimBefore,
			props.trimAfter,
		],
	);

	if (mediaTime === null) {
		return null;
	}

	return <VideoForPreviewAssertedShowing {...props} mediaTime={mediaTime} />;
};
