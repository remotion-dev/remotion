import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {LogLevel, LoopVolumeCurveBehavior, VolumeProp} from 'remotion';
import {
	Internals,
	Audio as RemotionAudio,
	useBufferState,
	useCurrentFrame,
} from 'remotion';
import {MediaPlayer} from '../video/media-player';
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
	useMediaInTimeline,
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

const NewAudioForPreview: React.FC<NewAudioForPreviewProps> = ({
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

	const [mediaPlayerReady, setMediaPlayerReady] = useState(false);
	const [shouldFallbackToNativeAudio, setShouldFallbackToNativeAudio] =
		useState(false);

	const [playing] = Timeline.usePlayingState();
	const timelineContext = useContext(Timeline.TimelineContext);
	const globalPlaybackRate = timelineContext.playbackRate;
	const sharedAudioContext = useContext(SharedAudioContext);
	const buffer = useBufferState();
	const delayHandleRef = useRef<{unblock: () => void} | null>(null);

	const [mediaMuted] = useMediaMutedState();
	const [mediaVolume] = useMediaVolumeState();

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

	const [timelineId] = useState(() => String(Math.random()));

	const parentSequence = useContext(SequenceContext);

	useMediaInTimeline({
		volume,
		mediaVolume,
		mediaType: 'audio',
		src,
		playbackRate,
		displayName: name ?? null,
		id: timelineId,
		stack,
		showInTimeline,
		premountDisplay: parentSequence?.premountDisplay ?? null,
		postmountDisplay: parentSequence?.postmountDisplay ?? null,
	});

	useEffect(() => {
		if (!sharedAudioContext) return;
		if (!sharedAudioContext.audioContext) return;

		try {
			const player = new MediaPlayer({
				src: preloadedSrc,
				logLevel,
				sharedAudioContext: sharedAudioContext.audioContext,
				loop,
				trimAfterSeconds: trimAfter ? trimAfter / videoConfig.fps : undefined,
				trimBeforeSeconds: trimBefore
					? trimBefore / videoConfig.fps
					: undefined,
				canvas: null,
				playbackRate,
			});

			mediaPlayerRef.current = player;

			player
				.initialize(currentTimeRef.current)
				.then((result) => {
					if (result.type === 'unknown-container-format') {
						if (disallowFallbackToHtml5Audio) {
							throw new Error(
								`Unknown container format ${preloadedSrc}, and 'disallowFallbackToHtml5Audio' was set.`,
							);
						}

						Internals.Log.warn(
							{logLevel, tag: '@remotion/media'},
							`Unknown container format for ${preloadedSrc} (Supported formats: https://www.remotion.dev/docs/mediabunny/formats), falling back to <Audio>`,
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
							`Network error fetching ${preloadedSrc}, falling back to <Audio>`,
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
							`Cannot decode ${preloadedSrc}, falling back to <Audio>`,
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
							`No video or audio tracks found for ${preloadedSrc}, falling back to <Audio>`,
						);
						setShouldFallbackToNativeAudio(true);
						return;
					}

					if (result.type === 'success') {
						setMediaPlayerReady(true);
						Internals.Log.trace(
							{logLevel, tag: '@remotion/media'},
							`[NewAudioForPreview] MediaPlayer initialized successfully`,
						);
					}
				})
				.catch((error) => {
					Internals.Log.error(
						{logLevel, tag: '@remotion/media'},
						'[NewAudioForPreview] Failed to initialize MediaPlayer',
						error,
					);
					setShouldFallbackToNativeAudio(true);
				});
		} catch (error) {
			Internals.Log.error(
				{logLevel, tag: '@remotion/media'},
				'[NewAudioForPreview] MediaPlayer initialization failed',
				error,
			);
			setShouldFallbackToNativeAudio(true);
		}

		return () => {
			if (delayHandleRef.current) {
				delayHandleRef.current.unblock();
				delayHandleRef.current = null;
			}

			if (mediaPlayerRef.current) {
				Internals.Log.trace(
					{logLevel, tag: '@remotion/media'},
					`[NewAudioForPreview] Disposing MediaPlayer`,
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
		trimAfter,
		trimBefore,
		playbackRate,
		videoConfig.fps,
		disallowFallbackToHtml5Audio,
	]);

	useEffect(() => {
		const audioPlayer = mediaPlayerRef.current;
		if (!audioPlayer) return;

		if (playing) {
			audioPlayer.play().catch((error) => {
				Internals.Log.error(
					{logLevel, tag: '@remotion/media'},
					'[NewAudioForPreview] Failed to play',
					error,
				);
			});
		} else {
			audioPlayer.pause();
		}
	}, [playing, logLevel, mediaPlayerReady]);

	useEffect(() => {
		const audioPlayer = mediaPlayerRef.current;
		if (!audioPlayer || !mediaPlayerReady) return;

		audioPlayer.seekTo(currentTime);
		Internals.Log.trace(
			{logLevel, tag: '@remotion/media'},
			`[NewAudioForPreview] Updating target time to ${currentTime.toFixed(3)}s`,
		);
	}, [currentTime, logLevel, mediaPlayerReady]);

	useEffect(() => {
		const audioPlayer = mediaPlayerRef.current;
		if (!audioPlayer || !mediaPlayerReady) return;

		audioPlayer.onBufferingChange((newBufferingState) => {
			if (newBufferingState && !delayHandleRef.current) {
				delayHandleRef.current = buffer.delayPlayback();
				Internals.Log.trace(
					{logLevel, tag: '@remotion/media'},
					'[NewAudioForPreview] MediaPlayer buffering - blocking Remotion playback',
				);
			} else if (!newBufferingState && delayHandleRef.current) {
				delayHandleRef.current.unblock();
				delayHandleRef.current = null;
				Internals.Log.trace(
					{logLevel, tag: '@remotion/media'},
					'[NewAudioForPreview] MediaPlayer unbuffering - unblocking Remotion playback',
				);
			}
		});
	}, [mediaPlayerReady, buffer, logLevel]);

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
	}, [userPreferredVolume, mediaPlayerReady, logLevel]);

	const effectivePlaybackRate = useMemo(
		() => playbackRate * globalPlaybackRate,
		[playbackRate, globalPlaybackRate],
	);

	useEffect(() => {
		const audioPlayer = mediaPlayerRef.current;
		if (!audioPlayer || !mediaPlayerReady) {
			return;
		}

		audioPlayer.setPlaybackRate(effectivePlaybackRate);
	}, [effectivePlaybackRate, mediaPlayerReady, logLevel]);

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

	return (
		<NewAudioForPreview
			src={preloadedSrc}
			playbackRate={playbackRate ?? 1}
			logLevel={logLevel ?? window.remotion_logLevel}
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
			audioStreamIndex={audioStreamIndex}
			fallbackHtml5AudioProps={fallbackHtml5AudioProps}
		/>
	);
};
