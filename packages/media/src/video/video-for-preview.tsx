import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {LogLevel, LoopVolumeCurveBehavior, VolumeProp} from 'remotion';
import {Html5Video, Internals, useBufferState, useCurrentFrame} from 'remotion';
import {useLoopDisplay} from '../show-in-timeline';
import {useMediaInTimeline} from '../use-media-in-timeline';
import {MediaPlayer} from './media-player';
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
};

export const VideoForPreview: React.FC<VideoForPreviewProps> = ({
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
}) => {
	const src = usePreload(unpreloadedSrc);

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const videoConfig = useUnsafeVideoConfig();
	const frame = useCurrentFrame();
	const mediaPlayerRef = useRef<MediaPlayer | null>(null);

	const [mediaPlayerReady, setMediaPlayerReady] = useState(false);
	const [shouldFallbackToNativeVideo, setShouldFallbackToNativeVideo] =
		useState(false);

	const [playing] = Timeline.usePlayingState();
	const timelineContext = useContext(Timeline.TimelineContext);
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

	useEffect(() => {
		if (!canvasRef.current) return;
		if (!sharedAudioContext) return;
		if (!sharedAudioContext.audioContext) return;

		try {
			const player = new MediaPlayer({
				canvas: canvasRef.current!,
				src: preloadedSrc,
				logLevel,
				sharedAudioContext: sharedAudioContext.audioContext,
				loop,
				trimAfter,
				trimBefore,
				fps: videoConfig.fps,
				playbackRate,
				audioStreamIndex,
				debugOverlay,
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
				mediaPlayerRef.current.dispose().catch((error) => {
					Internals.Log.error(
						{logLevel, tag: '@remotion/media'},
						'[VideoForPreview] Failed to dispose MediaPlayer',
						error,
					);
				});
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
		trimAfter,
		trimBefore,
		videoConfig.fps,
		playbackRate,
		disallowFallbackToOffthreadVideo,
		audioStreamIndex,
		debugOverlay,
	]);

	const classNameValue = useMemo(() => {
		return [Internals.OBJECTFIT_CONTAIN_CLASS_NAME, className]
			.filter(Internals.truthy)
			.join(' ');
	}, [className]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer) return;

		if (playing) {
			mediaPlayer.play().catch((error) => {
				Internals.Log.error(
					{logLevel, tag: '@remotion/media'},
					'[VideoForPreview] Failed to play',
					error,
				);
			});
		} else {
			mediaPlayer.pause();
		}
	}, [playing, logLevel, mediaPlayerReady]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) return;

		mediaPlayer.seekTo(currentTime);
		Internals.Log.trace(
			{logLevel, tag: '@remotion/media'},
			`[VideoForPreview] Updating target time to ${currentTime.toFixed(3)}s`,
		);
	}, [currentTime, logLevel, mediaPlayerReady]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) return;

		let currentBlock: {unblock: () => void} | null = null;

		const unsubscribe = mediaPlayer.onBufferingChange((newBufferingState) => {
			if (newBufferingState && !currentBlock) {
				currentBlock = buffer.delayPlayback();

				Internals.Log.trace(
					{logLevel, tag: '@remotion/media'},
					'[VideoForPreview] MediaPlayer buffering - blocking Remotion playback',
				);
			} else if (!newBufferingState && currentBlock) {
				currentBlock.unblock();
				currentBlock = null;

				Internals.Log.trace(
					{logLevel, tag: '@remotion/media'},
					'[VideoForPreview] MediaPlayer unbuffering - unblocking Remotion playback',
				);
			}
		});

		return () => {
			unsubscribe();
			if (currentBlock) {
				currentBlock.unblock();
				currentBlock = null;
			}
		};
	}, [mediaPlayerReady, buffer, logLevel]);

	const effectiveMuted =
		isSequenceHidden || muted || mediaMuted || userPreferredVolume <= 0;

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) return;

		mediaPlayer.setMuted(effectiveMuted);
	}, [effectiveMuted, mediaPlayerReady]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setVolume(userPreferredVolume);
	}, [userPreferredVolume, mediaPlayerReady]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setDebugOverlay(debugOverlay);
	}, [debugOverlay, mediaPlayerReady]);

	const effectivePlaybackRate = useMemo(
		() => playbackRate * globalPlaybackRate,
		[playbackRate, globalPlaybackRate],
	);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setPlaybackRate(effectivePlaybackRate);
	}, [effectivePlaybackRate, mediaPlayerReady]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setLoop(loop);
	}, [loop, mediaPlayerReady]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setFps(videoConfig.fps);
	}, [videoConfig.fps, mediaPlayerReady]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady || !onVideoFrame) {
			return;
		}

		const unsubscribe = mediaPlayer.onVideoFrame(onVideoFrame);

		return () => {
			unsubscribe();
		};
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
