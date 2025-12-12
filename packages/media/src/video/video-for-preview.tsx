import React, {
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {LogLevel, LoopVolumeCurveBehavior, VolumeProp} from 'remotion';
import {
	Html5Video,
	Internals,
	useBufferState,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {getTimeInSeconds} from '../get-time-in-seconds';
import {MediaPlayer} from '../media-player';
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
};

const VideoForPreviewAssertedShowing: React.FC<VideoForPreviewProps> = ({
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

	const isPlayerBuffering = Internals.useIsPlayerBuffering(buffering);

	useEffect(() => {
		if (!sharedAudioContext) return;
		if (!sharedAudioContext.audioContext) return;

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
				playbackRate,
				audioStreamIndex,
				debugOverlay,
				bufferState: buffer,
				isPremounting,
				isPostmounting,
				globalPlaybackRate,
				onVideoFrameCallback: initialOnVideoFrameRef.current ?? null,
			});

			mediaPlayerRef.current = player;
			player
				.initialize(currentTimeRef.current)
				.then((result) => {
					if (result.type === 'disposed') {
						return;
					}

					if (result.type === 'unknown-container-format') {
						if (disallowFallbackToOffthreadVideo) {
							throw new Error(
								`Unknown container format ${preloadedSrc}, and 'disallowFallbackToOffthreadVideo' was set.`,
							);
						}

						Internals.Log.warn(
							{logLevel, tag: '@remotion/media'},
							`Unknown container format for ${preloadedSrc} (Supported formats: https://www.remotion.dev/docs/mediabunny/formats), falling back to <OffthreadVideo>`,
						);
						setShouldFallbackToNativeVideo(true);
						return;
					}

					if (result.type === 'network-error') {
						if (disallowFallbackToOffthreadVideo) {
							throw new Error(
								`Network error fetching ${preloadedSrc}, and 'disallowFallbackToOffthreadVideo' was set.`,
							);
						}

						Internals.Log.warn(
							{logLevel, tag: '@remotion/media'},
							`Network error fetching ${preloadedSrc}, falling back to <OffthreadVideo>`,
						);
						setShouldFallbackToNativeVideo(true);
						return;
					}

					if (result.type === 'cannot-decode') {
						if (disallowFallbackToOffthreadVideo) {
							throw new Error(
								`Cannot decode ${preloadedSrc}, and 'disallowFallbackToOffthreadVideo' was set.`,
							);
						}

						Internals.Log.warn(
							{logLevel, tag: '@remotion/media'},
							`Cannot decode ${preloadedSrc}, falling back to <OffthreadVideo>`,
						);
						setShouldFallbackToNativeVideo(true);
						return;
					}

					if (result.type === 'no-tracks') {
						if (disallowFallbackToOffthreadVideo) {
							throw new Error(
								`No video or audio tracks found for ${preloadedSrc}, and 'disallowFallbackToOffthreadVideo' was set.`,
							);
						}

						Internals.Log.warn(
							{logLevel, tag: '@remotion/media'},
							`No video or audio tracks found for ${preloadedSrc}, falling back to <OffthreadVideo>`,
						);
						setShouldFallbackToNativeVideo(true);
						return;
					}

					if (result.type === 'success') {
						setMediaPlayerReady(true);
						setMediaDurationInSeconds(result.durationInSeconds);
					}
				})
				.catch((error) => {
					Internals.Log.error(
						{logLevel, tag: '@remotion/media'},
						'[VideoForPreview] Failed to initialize MediaPlayer',
						error,
					);
					setShouldFallbackToNativeVideo(true);
				});
		} catch (error) {
			Internals.Log.error(
				{logLevel, tag: '@remotion/media'},
				'[VideoForPreview] MediaPlayer initialization failed',
				error,
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
		preloadedSrc,
		logLevel,
		sharedAudioContext,
		loop,
		videoConfig.fps,
		playbackRate,
		disallowFallbackToOffthreadVideo,
		audioStreamIndex,
		debugOverlay,
		buffer,
		isPremounting,
		isPostmounting,
		globalPlaybackRate,
	]);

	const classNameValue = useMemo(() => {
		return [Internals.OBJECTFIT_CONTAIN_CLASS_NAME, className]
			.filter(Internals.truthy)
			.join(' ');
	}, [className]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer) return;

		if (playing && !isPlayerBuffering) {
			mediaPlayer.play(currentTimeRef.current);
		} else {
			mediaPlayer.pause();
		}
	}, [isPlayerBuffering, playing, logLevel, mediaPlayerReady]);

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

	const effectiveMuted =
		isSequenceHidden || muted || mediaMuted || userPreferredVolume <= 0;

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

		mediaPlayer.setPlaybackRate(playbackRate);
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

export const VideoForPreview: React.FC<VideoForPreviewProps> = (props) => {
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
		props.trimAfter,
		props.trimBefore,
		videoConfig.fps,
	]);

	if (!showShow) {
		return null;
	}

	return <VideoForPreviewAssertedShowing {...props} />;
};
