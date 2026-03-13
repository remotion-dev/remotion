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
import {useCommonEffects} from '../use-common-effects';
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
	readonly debugAudioScheduling: boolean;
	readonly headless: boolean;
	readonly onError: MediaOnError | undefined;
	readonly credentials: RequestCredentials | undefined;
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
	debugAudioScheduling,
	headless,
	onError,
	credentials,
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
	const timelineContext = Internals.useTimelineContext();
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

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	warnAboutTooHighVolume(userPreferredVolume);

	const parentSequence = useContext(SequenceContext);
	const isPremounting = Boolean(parentSequence?.premounting);
	const isPostmounting = Boolean(parentSequence?.postmounting);
	const sequenceOffset =
		((parentSequence?.cumulatedFrom ?? 0) +
			(parentSequence?.relativeFrom ?? 0)) /
		videoConfig.fps;

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
	const initialSequenceOffset = useRef(sequenceOffset);

	useEffect(() => {
		if (!sharedAudioContext) return;
		if (!sharedAudioContext.audioContext) return;

		const {audioContext, audioSyncAnchor, scheduleAudioNode} =
			sharedAudioContext;

		try {
			const player = new MediaPlayer({
				canvas: canvasRef.current,
				src: preloadedSrc,
				logLevel,
				sharedAudioContext: {audioContext, audioSyncAnchor, scheduleAudioNode},
				loop,
				trimAfter: initialTrimAfterRef.current,
				trimBefore: initialTrimBeforeRef.current,
				fps: videoConfig.fps,
				playbackRate: initialPlaybackRate.current,
				audioStreamIndex,
				debugOverlay,
				debugAudioScheduling,
				bufferState: buffer,
				isPremounting: initialIsPremounting.current,
				isPostmounting: initialIsPostmounting.current,
				globalPlaybackRate: initialGlobalPlaybackRate.current,
				durationInFrames: videoConfig.durationInFrames,
				onVideoFrameCallback: initialOnVideoFrameRef.current ?? null,
				playing: initialPlaying.current,
				sequenceOffset: initialSequenceOffset.current,
				credentials,
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
		debugAudioScheduling,
		disallowFallbackToOffthreadVideo,
		logLevel,
		loop,
		preloadedSrc,
		sharedAudioContext,
		videoConfig.fps,
		onError,
		videoConfig.durationInFrames,
		credentials,
	]);

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
		effectiveMuted,
		userPreferredVolume,
		playbackRate,
		globalPlaybackRate,
		fps: videoConfig.fps,
		sequenceOffset,
		loop,
		debugAudioScheduling,
		durationInFrames: videoConfig.durationInFrames,
		isPremounting,
		isPostmounting,
		currentTime,
		logLevel,
		sharedAudioContext,
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

	const showShow = useMemo(() => {
		return (
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
			}) !== null
		);
	}, [
		currentTime,
		props.loop,
		props.playbackRate,
		props.src,
		videoConfig.fps,
		props.trimBefore,
		props.trimAfter,
	]);

	if (!showShow) {
		return null;
	}

	return (
		<VideoForPreviewAssertedShowing {...props} controls={props.controls} />
	);
};
