import React, {
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {
	LogLevel,
	LoopVolumeCurveBehavior,
	SequenceControls,
	SequenceSchema,
	VolumeProp,
} from 'remotion';
import {
	Html5Video,
	Internals,
	useBufferState,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {getTimeInSeconds} from '../get-time-in-seconds';
import {MediaPlayer} from '../media-player';
import {type MediaOnError, callOnErrorAndResolve} from '../on-error';
import {useLoopDisplay} from '../show-in-timeline';
import {useMediaInTimeline} from '../use-media-in-timeline';
import type {FallbackOffthreadVideoProps} from './props';

const {
	useUnsafeVideoConfig,
	Timeline,
	SharedAudioContext,
	useMediaMutedState,
	useMediaVolumeState,
	useFrameForVolumeProp,
	evaluateVolume,
	warnAboutTooHighVolume,
	usePreload,
	SequenceContext,
	SequenceVisibilityToggleContext,
} = Internals;

type VideoForPreviewProps = {
	readonly src: string;
	readonly style: React.CSSProperties | undefined;
	readonly playbackRate: number;
	readonly logLevel: LogLevel;
	readonly className: string | undefined;
	readonly muted: boolean;
	readonly volume: VolumeProp;
	readonly loopVolumeCurveBehavior: LoopVolumeCurveBehavior;
	readonly onVideoFrame: undefined | ((frame: CanvasImageSource) => void);
	readonly showInTimeline: boolean;
	readonly loop: boolean;
	readonly name: string | undefined;
	readonly trimAfter: number | undefined;
	readonly trimBefore: number | undefined;
	readonly stack: string | null;
	readonly disallowFallbackToOffthreadVideo: boolean;
	readonly fallbackOffthreadVideoProps: FallbackOffthreadVideoProps;
	readonly audioStreamIndex: number;
	readonly debugOverlay: boolean;
	readonly headless: boolean;
	readonly onError: MediaOnError | undefined;
};

type VideoForPreviewAssertedShowingProps = VideoForPreviewProps & {
	readonly controls: SequenceControls | undefined;
};

const VideoForPreviewAssertedShowing: React.FC<
	VideoForPreviewAssertedShowingProps
> = ({
	src: unpreloadedSrc,
	style,
	playbackRate,
	logLevel,
	className,
	muted,
	volume,
	loopVolumeCurveBehavior,
	onVideoFrame,
	showInTimeline,
	loop,
	name,
	trimAfter,
	trimBefore,
	stack,
	disallowFallbackToOffthreadVideo,
	fallbackOffthreadVideoProps,
	audioStreamIndex,
	debugOverlay,
	headless,
	onError,
	controls,
}) => {
	const src = usePreload(unpreloadedSrc);

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const videoConfig = useUnsafeVideoConfig();
	const frame = useCurrentFrame();
	const mediaPlayerRef = useRef<MediaPlayer | null>(null);
	const initialTrimBeforeRef = useRef(trimBefore);
	const initialTrimAfterRef = useRef(trimAfter);
	const initialOnVideoFrameRef = useRef(onVideoFrame);

	const [mediaPlayerReady, setMediaPlayerReady] = useState(false);
	const [shouldFallbackToNativeVideo, setShouldFallbackToNativeVideo] =
		useState(false);

	const [playing] = Timeline.usePlayingState();
	const timelineContext = useContext(Internals.TimelineContext);
	const globalPlaybackRate = timelineContext.playbackRate;
	const sharedAudioContext = useContext(SharedAudioContext);
	const buffer = useBufferState();

	const [mediaMuted] = useMediaMutedState();
	const [mediaVolume] = useMediaVolumeState();
	const [mediaDurationInSeconds, setMediaDurationInSeconds] = useState<
		number | null
	>(null);

	const {hidden} = useContext(SequenceVisibilityToggleContext);

	const volumePropFrame = useFrameForVolumeProp(loopVolumeCurveBehavior);

	const userPreferredVolume = evaluateVolume({
		frame: volumePropFrame,
		volume,
		mediaVolume,
	});

	warnAboutTooHighVolume(userPreferredVolume);

	const parentSequence = useContext(SequenceContext);
	const isPremounting = Boolean(parentSequence?.premounting);
	const isPostmounting = Boolean(parentSequence?.postmounting);
	const {premountFramesRemaining, playing: playingWhilePremounting} =
		useContext(Internals.PremountContext);

	// Allows for pre-scheduling audio nodes before the premounting ends,
	// since there is some latency.
	const isNextFrameGoingToPlay =
		playingWhilePremounting &&
		premountFramesRemaining > 0 &&
		premountFramesRemaining <= 1.000000001;

	const loopDisplay = useLoopDisplay({
		loop,
		mediaDurationInSeconds,
		playbackRate,
		trimAfter,
		trimBefore,
	});

	const {id: timelineId} = useMediaInTimeline({
		volume,
		mediaType: 'video',
		src,
		playbackRate,
		displayName: name ?? null,
		stack,
		showInTimeline,
		premountDisplay: parentSequence?.premountDisplay ?? null,
		postmountDisplay: parentSequence?.postmountDisplay ?? null,
		loopDisplay,
		mediaVolume,
		trimAfter,
		trimBefore,
		controls,
	});

	const isSequenceHidden = hidden[timelineId] ?? false;

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	const currentTime = frame / videoConfig.fps;

	const currentTimeRef = useRef(currentTime);
	currentTimeRef.current = currentTime;

	const preloadedSrc = usePreload(src);
	const buffering = useContext(Internals.BufferingContextReact);

	if (!buffering) {
		throw new Error(
			'useMediaPlayback must be used inside a <BufferingContext>',
		);
	}

	const effectiveMuted =
		isSequenceHidden || muted || mediaMuted || userPreferredVolume <= 0;

	const isPlayerBuffering = Internals.useIsPlayerBuffering(buffering);
	const initialPlaying = useRef(playing && !isPlayerBuffering);
	const initialIsPremounting = useRef(isPremounting);
	const initialIsPostmounting = useRef(isPostmounting);
	const initialGlobalPlaybackRate = useRef(globalPlaybackRate);
	const initialPlaybackRate = useRef(playbackRate);
	const initialMuted = useRef(effectiveMuted);

	useEffect(() => {
		if (!sharedAudioContext) return;

		try {
			const player = new MediaPlayer({
				canvas: canvasRef.current,
				src: preloadedSrc,
				logLevel,
				sharedAudioContext: sharedAudioContext.audioContext,
				loop,
				trimAfter: initialTrimAfterRef.current,
				trimBefore: initialTrimBeforeRef.current,
				fps: videoConfig.fps,
				playbackRate: initialPlaybackRate.current,
				audioStreamIndex,
				debugOverlay,
				bufferState: buffer,
				isPremounting: initialIsPremounting.current,
				isPostmounting: initialIsPostmounting.current,
				globalPlaybackRate: initialGlobalPlaybackRate.current,
				durationInFrames: videoConfig.durationInFrames,
				onVideoFrameCallback: initialOnVideoFrameRef.current ?? null,
				playing: initialPlaying.current,
			});

			mediaPlayerRef.current = player;
			player
				.initialize(currentTimeRef.current, initialMuted.current)
				.then((result) => {
					if (result.type === 'disposed') {
						return;
					}

					const handleError = (error: Error, fallbackMessage: string) => {
						const [action, errorToUse] = callOnErrorAndResolve({
							onError,
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

					if (result.type === 'unknown-container-format') {
						handleError(
							new Error(`Unknown container format ${preloadedSrc}.`),
							`Unknown container format for ${preloadedSrc} (Supported formats: https://www.remotion.dev/docs/mediabunny/formats), falling back to <OffthreadVideo>`,
						);
						return;
					}

					if (result.type === 'network-error') {
						handleError(
							new Error(`Network error fetching ${preloadedSrc}.`),
							`Network error fetching ${preloadedSrc}, falling back to <OffthreadVideo>`,
						);
						return;
					}

					if (result.type === 'cannot-decode') {
						handleError(
							new Error(`Cannot decode ${preloadedSrc}.`),
							`Cannot decode ${preloadedSrc}, falling back to <OffthreadVideo>`,
						);
						return;
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
					}
				})
				.catch((error) => {
					const [action, errorToUse] = callOnErrorAndResolve({
						onError,
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
				onError,
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
		};
	}, [
		audioStreamIndex,
		buffer,
		debugOverlay,
		disallowFallbackToOffthreadVideo,
		logLevel,
		loop,
		preloadedSrc,
		sharedAudioContext,
		videoConfig.fps,
		onError,
		videoConfig.durationInFrames,
	]);

	const classNameValue = useMemo(() => {
		return [Internals.OBJECTFIT_CONTAIN_CLASS_NAME, className]
			.filter(Internals.truthy)
			.join(' ');
	}, [className]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer) return;

		if (isNextFrameGoingToPlay) {
			const currentTimeUntilZero =
				// Premounting does not consider the local playback rate, just the global one.
				premountFramesRemaining / videoConfig.fps / globalPlaybackRate;
			mediaPlayer.playAudio(currentTimeRef.current - currentTimeUntilZero);
		}
	}, [
		isNextFrameGoingToPlay,
		premountFramesRemaining,
		videoConfig.fps,
		globalPlaybackRate,
	]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer) return;

		if (playing && !isPlayerBuffering && !isNextFrameGoingToPlay) {
			// Play does nothing if already playing, so it can be called multiple times.
			mediaPlayer.play(currentTimeRef.current);
		} else {
			// Pause will do the work all over again and check if there are scheduled nodes.
			// This is why isNextFrameGoingToPlay is the in the dependency array.
			// We want to trigger another pause if due to being 1 frame before premounting ends,
			// audio is resumed and at the same time a pause is happening, we need to ensure
			// that the pause is triggered again even though officially "playing" never changed.
			mediaPlayer.pause();
		}
	}, [
		isPlayerBuffering,
		playing,
		logLevel,
		mediaPlayerReady,
		isNextFrameGoingToPlay,
	]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setTrimBefore(trimBefore, currentTimeRef.current);
	}, [trimBefore, mediaPlayerReady]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setTrimAfter(trimAfter, currentTimeRef.current);
	}, [trimAfter, mediaPlayerReady]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) return;

		mediaPlayer.setMuted(effectiveMuted);
	}, [effectiveMuted, mediaPlayerReady]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setVolume(userPreferredVolume);
	}, [userPreferredVolume, mediaPlayerReady]);

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

		mediaPlayer.setPlaybackRate(playbackRate, currentTimeRef.current);
	}, [playbackRate, mediaPlayerReady]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setGlobalPlaybackRate(globalPlaybackRate);
	}, [globalPlaybackRate, mediaPlayerReady]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setLoop(loop);
	}, [loop, mediaPlayerReady]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setDurationInFrames(videoConfig.durationInFrames);
	}, [videoConfig.durationInFrames, mediaPlayerReady]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setIsPremounting(isPremounting);
	}, [isPremounting, mediaPlayerReady]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setIsPostmounting(isPostmounting);
	}, [isPostmounting, mediaPlayerReady]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setFps(videoConfig.fps);
	}, [videoConfig.fps, mediaPlayerReady]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setVideoFrameCallback(onVideoFrame ?? null);
	}, [onVideoFrame, mediaPlayerReady]);

	useLayoutEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) return;

		mediaPlayer.seekTo(currentTime).catch(() => {
			// Might be disposed
		});
		Internals.Log.trace(
			{logLevel, tag: '@remotion/media'},
			`[VideoForPreview] Updating target time to ${currentTime.toFixed(3)}s`,
		);
	}, [currentTime, logLevel, mediaPlayerReady]);

	const actualStyle: React.CSSProperties = useMemo(() => {
		return {
			...style,
			opacity: isSequenceHidden ? 0 : (style?.opacity ?? 1),
		};
	}, [isSequenceHidden, style]);

	if (shouldFallbackToNativeVideo && !disallowFallbackToOffthreadVideo) {
		// <Video> will fallback to <VideoForPreview> anyway
		// not using <OffthreadVideo> because it does not support looping
		return (
			<Html5Video
				src={src}
				style={actualStyle}
				className={className}
				muted={muted}
				volume={volume}
				trimAfter={trimAfter}
				trimBefore={trimBefore}
				playbackRate={playbackRate}
				loopVolumeCurveBehavior={loopVolumeCurveBehavior}
				name={name}
				loop={loop}
				showInTimeline={showInTimeline}
				stack={stack ?? undefined}
				{...fallbackOffthreadVideoProps}
			/>
		);
	}

	if (headless) {
		return null;
	}

	return (
		<canvas
			ref={canvasRef}
			width={videoConfig.width}
			height={videoConfig.height}
			style={actualStyle}
			className={classNameValue}
		/>
	);
};

const videoSchema = {
	volume: {
		type: 'number',
		min: 0,
		max: 20,
		step: 0.01,
		default: 1,
		description: 'Volume',
	},
	playbackRate: {
		type: 'number',
		min: 0,
		step: 0.01,
		default: 1,
		description: 'Playback Rate',
	},
	trimBefore: {type: 'number', min: 0, default: 0},
	trimAfter: {type: 'number', min: 0, default: 0},
} as const satisfies SequenceSchema;

export const VideoForPreview: React.FC<VideoForPreviewProps> = (props) => {
	const schemaInput = useMemo(() => {
		if (typeof props.volume !== 'number') {
			return null;
		}

		return {
			volume: props.volume,
			playbackRate: props.playbackRate,
			trimBefore: props.trimBefore,
			trimAfter: props.trimAfter,
			loop: props.loop,
		};
	}, [
		props.volume,
		props.playbackRate,
		props.trimBefore,
		props.trimAfter,
		props.loop,
	]);

	const {controls, values} = Internals.useSchema(
		schemaInput ? videoSchema : null,
		schemaInput,
	);

	const volume =
		schemaInput !== null ? (values.volume as number) : props.volume;
	const playbackRate =
		schemaInput !== null ? (values.playbackRate as number) : props.playbackRate;
	const trimBefore =
		schemaInput !== null
			? (values.trimBefore as number | undefined)
			: props.trimBefore;
	const trimAfter =
		schemaInput !== null
			? (values.trimAfter as number | undefined)
			: props.trimAfter;
	const effectiveLoop =
		schemaInput !== null ? (values.loop as boolean) : props.loop;

	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const currentTime = frame / videoConfig.fps;

	const showShow = useMemo(() => {
		return (
			getTimeInSeconds({
				unloopedTimeInSeconds: currentTime,
				playbackRate,
				loop: effectiveLoop,
				trimBefore,
				trimAfter,
				mediaDurationInSeconds: Infinity,
				fps: videoConfig.fps,
				ifNoMediaDuration: 'infinity',
				src: props.src,
			}) !== null
		);
	}, [
		currentTime,
		effectiveLoop,
		playbackRate,
		props.src,
		trimAfter,
		trimBefore,
		videoConfig.fps,
	]);

	if (!showShow) {
		return null;
	}

	return (
		<VideoForPreviewAssertedShowing
			{...props}
			volume={volume}
			playbackRate={playbackRate}
			loop={effectiveLoop}
			trimBefore={trimBefore}
			trimAfter={trimAfter}
			controls={controls}
		/>
	);
};
