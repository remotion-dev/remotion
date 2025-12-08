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
	Internals,
	Audio as RemotionAudio,
	useBufferState,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {getTimeInSeconds} from '../get-time-in-seconds';
import {MediaPlayer} from '../media-player';
import {useLoopDisplay} from '../show-in-timeline';
import {useMediaInTimeline} from '../use-media-in-timeline';
import type {FallbackHtml5AudioProps} from './props';

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
} = Internals;

type NewAudioForPreviewProps = {
	readonly src: string;
	readonly playbackRate: number;
	readonly logLevel: LogLevel;
	readonly muted: boolean;
	readonly volume: VolumeProp;
	readonly loopVolumeCurveBehavior: LoopVolumeCurveBehavior;
	readonly loop: boolean;
	readonly trimAfter: number | undefined;
	readonly trimBefore: number | undefined;
	readonly name: string | undefined;
	readonly showInTimeline: boolean;
	readonly stack: string | null;
	readonly disallowFallbackToHtml5Audio: boolean;
	readonly toneFrequency: number | undefined;
	readonly audioStreamIndex: number | undefined;
	readonly fallbackHtml5AudioProps: FallbackHtml5AudioProps | undefined;
};

const AudioForPreviewAssertedShowing: React.FC<NewAudioForPreviewProps> = ({
	src,
	playbackRate,
	logLevel,
	muted,
	volume,
	loopVolumeCurveBehavior,
	loop,
	trimAfter,
	trimBefore,
	name,
	showInTimeline,
	stack,
	disallowFallbackToHtml5Audio,
	toneFrequency,
	audioStreamIndex,
	fallbackHtml5AudioProps,
}) => {
	const videoConfig = useUnsafeVideoConfig();
	const frame = useCurrentFrame();
	const mediaPlayerRef = useRef<MediaPlayer | null>(null);
	const initialTrimBeforeRef = useRef(trimBefore);
	const initialTrimAfterRef = useRef(trimAfter);

	const [mediaPlayerReady, setMediaPlayerReady] = useState(false);
	const [shouldFallbackToNativeAudio, setShouldFallbackToNativeAudio] =
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

	const volumePropFrame = useFrameForVolumeProp(
		loopVolumeCurveBehavior ?? 'repeat',
	);

	const userPreferredVolume = evaluateVolume({
		frame: volumePropFrame,
		volume,
		mediaVolume,
	});

	warnAboutTooHighVolume(userPreferredVolume);

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	if (!src) {
		throw new TypeError('No `src` was passed to <NewAudioForPreview>.');
	}

	const currentTime = frame / videoConfig.fps;

	const currentTimeRef = useRef(currentTime);
	currentTimeRef.current = currentTime;

	const preloadedSrc = usePreload(src);

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

	useMediaInTimeline({
		volume,
		mediaVolume,
		mediaType: 'audio',
		src,
		playbackRate,
		displayName: name ?? null,
		stack,
		showInTimeline,
		premountDisplay: parentSequence?.premountDisplay ?? null,
		postmountDisplay: parentSequence?.postmountDisplay ?? null,
		loopDisplay,
		trimAfter,
		trimBefore,
	});

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
				src: preloadedSrc,
				logLevel,
				sharedAudioContext: sharedAudioContext.audioContext,
				loop,
				trimAfter: initialTrimAfterRef.current,
				trimBefore: initialTrimBeforeRef.current,
				fps: videoConfig.fps,
				canvas: null,
				playbackRate,
				audioStreamIndex: audioStreamIndex ?? 0,
				debugOverlay: false,
				bufferState: buffer,
				isPostmounting,
				isPremounting,
				globalPlaybackRate,
			});

			mediaPlayerRef.current = player;

			player
				.initialize(currentTimeRef.current)
				.then((result) => {
					if (result.type === 'disposed') {
						return;
					}

					if (result.type === 'unknown-container-format') {
						if (disallowFallbackToHtml5Audio) {
							throw new Error(
								`Unknown container format ${preloadedSrc}, and 'disallowFallbackToHtml5Audio' was set.`,
							);
						}

						Internals.Log.warn(
							{logLevel, tag: '@remotion/media'},
							`Unknown container format for ${preloadedSrc} (Supported formats: https://www.remotion.dev/docs/mediabunny/formats), falling back to <Html5Audio>`,
						);
						setShouldFallbackToNativeAudio(true);
						return;
					}

					if (result.type === 'network-error') {
						if (disallowFallbackToHtml5Audio) {
							throw new Error(
								`Network error fetching ${preloadedSrc}, and 'disallowFallbackToHtml5Audio' was set.`,
							);
						}

						Internals.Log.warn(
							{logLevel, tag: '@remotion/media'},
							`Network error fetching ${preloadedSrc}, falling back to <Html5Audio>`,
						);
						setShouldFallbackToNativeAudio(true);
						return;
					}

					if (result.type === 'cannot-decode') {
						if (disallowFallbackToHtml5Audio) {
							throw new Error(
								`Cannot decode ${preloadedSrc}, and 'disallowFallbackToHtml5Audio' was set.`,
							);
						}

						Internals.Log.warn(
							{logLevel, tag: '@remotion/media'},
							`Cannot decode ${preloadedSrc}, falling back to <Html5Audio>`,
						);
						setShouldFallbackToNativeAudio(true);
						return;
					}

					if (result.type === 'no-tracks') {
						if (disallowFallbackToHtml5Audio) {
							throw new Error(
								`No video or audio tracks found for ${preloadedSrc}, and 'disallowFallbackToHtml5Audio' was set.`,
							);
						}

						Internals.Log.warn(
							{logLevel, tag: '@remotion/media'},
							`No video or audio tracks found for ${preloadedSrc}, falling back to <Html5Audio>`,
						);
						setShouldFallbackToNativeAudio(true);
						return;
					}

					if (result.type === 'success') {
						setMediaPlayerReady(true);
						setMediaDurationInSeconds(result.durationInSeconds);

						Internals.Log.trace(
							{logLevel, tag: '@remotion/media'},
							`[AudioForPreview] MediaPlayer initialized successfully`,
						);
					}
				})
				.catch((error) => {
					Internals.Log.error(
						{logLevel, tag: '@remotion/media'},
						'[AudioForPreview] Failed to initialize MediaPlayer',
						error,
					);
					setShouldFallbackToNativeAudio(true);
				});
		} catch (error) {
			Internals.Log.error(
				{logLevel, tag: '@remotion/media'},
				'[AudioForPreview] MediaPlayer initialization failed',
				error,
			);
			setShouldFallbackToNativeAudio(true);
		}

		return () => {
			if (mediaPlayerRef.current) {
				Internals.Log.trace(
					{logLevel, tag: '@remotion/media'},
					`[AudioForPreview] Disposing MediaPlayer`,
				);
				mediaPlayerRef.current.dispose();
				mediaPlayerRef.current = null;
			}

			setMediaPlayerReady(false);
			setShouldFallbackToNativeAudio(false);
		};
	}, [
		preloadedSrc,
		logLevel,
		sharedAudioContext,
		currentTimeRef,
		loop,
		playbackRate,
		videoConfig.fps,
		audioStreamIndex,
		disallowFallbackToHtml5Audio,
		buffer,
		isPremounting,
		isPostmounting,
		globalPlaybackRate,
	]);

	useEffect(() => {
		const audioPlayer = mediaPlayerRef.current;
		if (!audioPlayer) return;

		if (playing && !isPlayerBuffering) {
			audioPlayer.play(currentTimeRef.current);
		} else {
			audioPlayer.pause();
		}
	}, [isPlayerBuffering, logLevel, playing]);

	useLayoutEffect(() => {
		const audioPlayer = mediaPlayerRef.current;
		if (!audioPlayer || !mediaPlayerReady) return;

		audioPlayer.seekTo(currentTime).catch(() => {
			// Might be disposed
		});
		Internals.Log.trace(
			{logLevel, tag: '@remotion/media'},
			`[AudioForPreview] Updating target time to ${currentTime.toFixed(3)}s`,
		);
	}, [currentTime, logLevel, mediaPlayerReady]);

	const effectiveMuted = muted || mediaMuted || userPreferredVolume <= 0;

	useEffect(() => {
		const audioPlayer = mediaPlayerRef.current;
		if (!audioPlayer || !mediaPlayerReady) return;

		audioPlayer.setMuted(effectiveMuted);
	}, [effectiveMuted, mediaPlayerReady]);

	useEffect(() => {
		const audioPlayer = mediaPlayerRef.current;
		if (!audioPlayer || !mediaPlayerReady) {
			return;
		}

		audioPlayer.setVolume(userPreferredVolume);
	}, [userPreferredVolume, mediaPlayerReady]);

	useEffect(() => {
		const audioPlayer = mediaPlayerRef.current;
		if (!audioPlayer || !mediaPlayerReady) {
			return;
		}

		audioPlayer.setPlaybackRate(playbackRate);
	}, [playbackRate, mediaPlayerReady]);

	useEffect(() => {
		const audioPlayer = mediaPlayerRef.current;
		if (!audioPlayer || !mediaPlayerReady) {
			return;
		}

		audioPlayer.setGlobalPlaybackRate(globalPlaybackRate);
	}, [globalPlaybackRate, mediaPlayerReady]);

	useEffect(() => {
		const audioPlayer = mediaPlayerRef.current;
		if (!audioPlayer || !mediaPlayerReady) {
			return;
		}

		audioPlayer.setFps(videoConfig.fps);
	}, [videoConfig.fps, mediaPlayerReady]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setTrimBefore(trimBefore);
	}, [trimBefore, mediaPlayerReady]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setTrimAfter(trimAfter);
	}, [trimAfter, mediaPlayerReady]);

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

		mediaPlayer.setIsPremounting(isPremounting);
	}, [isPremounting, mediaPlayerReady]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setIsPostmounting(isPostmounting);
	}, [isPostmounting, mediaPlayerReady]);

	if (shouldFallbackToNativeAudio && !disallowFallbackToHtml5Audio) {
		return (
			<RemotionAudio
				src={src}
				muted={muted}
				volume={volume}
				startFrom={trimBefore}
				endAt={trimAfter}
				playbackRate={playbackRate}
				loopVolumeCurveBehavior={loopVolumeCurveBehavior}
				name={name}
				loop={loop}
				showInTimeline={showInTimeline}
				stack={stack ?? undefined}
				toneFrequency={toneFrequency}
				audioStreamIndex={audioStreamIndex}
				pauseWhenBuffering={fallbackHtml5AudioProps?.pauseWhenBuffering}
				crossOrigin={fallbackHtml5AudioProps?.crossOrigin}
				{...fallbackHtml5AudioProps}
			/>
		);
	}

	return null;
};

type InnerAudioProps = {
	readonly loop?: boolean;
	readonly src: string;
	readonly logLevel?: LogLevel;
	readonly muted?: boolean;
	readonly name?: string | undefined;
	readonly volume?: VolumeProp;
	readonly loopVolumeCurveBehavior?: LoopVolumeCurveBehavior;
	readonly playbackRate?: number;
	// Props we ignore but are passed from old usage
	readonly _remotionInternalNativeLoopPassed?: boolean;
	readonly _remotionInternalStack?: string | null;
	readonly shouldPreMountAudioTags?: boolean;
	readonly onNativeError?: React.ReactEventHandler<HTMLAudioElement>;
	readonly onDuration?: (src: string, durationInSeconds: number) => void;
	readonly pauseWhenBuffering?: boolean;
	readonly _remotionInternalNeedsDurationCalculation?: boolean;
	readonly showInTimeline?: boolean;
	readonly trimAfter?: number | undefined;
	readonly trimBefore?: number | undefined;
	readonly stack: string | null;
	readonly disallowFallbackToHtml5Audio?: boolean;
	readonly toneFrequency?: number;
	readonly audioStreamIndex?: number;
	readonly fallbackHtml5AudioProps?: FallbackHtml5AudioProps;
};

export const AudioForPreview: React.FC<InnerAudioProps> = ({
	loop,
	src,
	logLevel,
	muted,
	name,
	volume,
	loopVolumeCurveBehavior,
	playbackRate,
	trimAfter,
	trimBefore,
	showInTimeline,
	stack,
	disallowFallbackToHtml5Audio,
	toneFrequency,
	audioStreamIndex,
	fallbackHtml5AudioProps,
}) => {
	const preloadedSrc = usePreload(src);

	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const currentTime = frame / videoConfig.fps;

	const showShow = useMemo(() => {
		return (
			getTimeInSeconds({
				unloopedTimeInSeconds: currentTime,
				playbackRate: playbackRate ?? 1,
				loop: loop ?? false,
				trimBefore,
				trimAfter,
				mediaDurationInSeconds: Infinity,
				fps: videoConfig.fps,
				ifNoMediaDuration: 'infinity',
				src,
			}) !== null
		);
	}, [
		currentTime,
		loop,
		playbackRate,
		src,
		trimAfter,
		trimBefore,
		videoConfig.fps,
	]);

	if (!showShow) {
		return null;
	}

	return (
		<AudioForPreviewAssertedShowing
			audioStreamIndex={audioStreamIndex ?? 0}
			src={preloadedSrc}
			playbackRate={playbackRate ?? 1}
			logLevel={
				logLevel ??
				(typeof window !== 'undefined'
					? (window.remotion_logLevel ?? 'info')
					: 'info')
			}
			muted={muted ?? false}
			volume={volume ?? 1}
			loopVolumeCurveBehavior={loopVolumeCurveBehavior ?? 'repeat'}
			loop={loop ?? false}
			trimAfter={trimAfter}
			trimBefore={trimBefore}
			name={name}
			showInTimeline={showInTimeline ?? true}
			stack={stack}
			disallowFallbackToHtml5Audio={disallowFallbackToHtml5Audio ?? false}
			toneFrequency={toneFrequency}
			fallbackHtml5AudioProps={fallbackHtml5AudioProps}
		/>
	);
};
