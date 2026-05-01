import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
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
import {type MediaOnError, callOnErrorAndResolve} from '../on-error';
import {useCommonEffects} from '../use-common-effects';
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
	readonly onError: MediaOnError | undefined;
	readonly credentials: RequestCredentials | undefined;
	readonly setMediaDurationInSeconds: (durationInSeconds: number) => void;
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
	onError,
	credentials,
	setMediaDurationInSeconds,
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
	const timelineContext = Internals.useTimelineContext();
	const globalPlaybackRate = timelineContext.playbackRate;
	const sharedAudioContext = useContext(SharedAudioContext);
	const buffer = useBufferState();

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

	const parentSequence = useContext(SequenceContext);
	const isPremounting = Boolean(parentSequence?.premounting);
	const isPostmounting = Boolean(parentSequence?.postmounting);
	const sequenceOffset =
		((parentSequence?.cumulatedFrom ?? 0) +
			(parentSequence?.relativeFrom ?? 0)) /
		videoConfig.fps;

	const bufferingContext = useContext(Internals.BufferingContextReact);

	if (!bufferingContext) {
		throw new Error(
			'useMediaPlayback must be used inside a <BufferingContext>',
		);
	}

	const effectiveMuted = muted || mediaMuted || userPreferredVolume <= 0;

	const isPlayerBuffering = Internals.useIsPlayerBuffering(bufferingContext);
	const initialPlaying = useRef(playing && !isPlayerBuffering);
	const initialIsPremounting = useRef(isPremounting);
	const initialIsPostmounting = useRef(isPostmounting);
	const initialGlobalPlaybackRate = useRef(globalPlaybackRate);
	const initialPlaybackRate = useRef(playbackRate);
	const initialMuted = useRef(effectiveMuted);
	const initialDurationInFrames = useRef(videoConfig.durationInFrames);
	const initialSequenceOffset = useRef(sequenceOffset);

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
		durationInFrames: videoConfig.durationInFrames,
		isPremounting,
		isPostmounting,
		currentTime,
		logLevel,
		label: 'AudioForPreview',
	});

	useEffect(() => {
		if (!sharedAudioContext) return;
		if (!sharedAudioContext.audioContext) return;

		const {
			audioContext,
			gainNode,
			audioSyncAnchor,
			scheduleAudioNode,
			unscheduleAudioNode,
		} = sharedAudioContext;

		if (!gainNode) {
			return;
		}

		try {
			const player = new MediaPlayer({
				src: preloadedSrc,
				logLevel,
				sharedAudioContext: {
					audioContext,
					gainNode,
					audioSyncAnchor,
					scheduleAudioNode,
					unscheduleAudioNode,
				},
				loop,
				trimAfter: initialTrimAfterRef.current,
				trimBefore: initialTrimBeforeRef.current,
				fps: videoConfig.fps,
				canvas: null,
				playbackRate: initialPlaybackRate.current,
				audioStreamIndex: audioStreamIndex ?? null,
				debugOverlay: false,
				bufferState: buffer,
				isPostmounting: initialIsPostmounting.current,
				isPremounting: initialIsPremounting.current,
				globalPlaybackRate: initialGlobalPlaybackRate.current,
				durationInFrames: initialDurationInFrames.current,
				onVideoFrameCallback: null,
				playing: initialPlaying.current,
				sequenceOffset: initialSequenceOffset.current,
				credentials,
				tagType: 'audio',
				getEffects: () => [],
				getEffectChainState: () => null,
				getCurrentFrame: () => 0,
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
							disallowFallback: disallowFallbackToHtml5Audio,
							isClientSideRendering: false,
							clientSideError: error,
						});
						if (action === 'fail') {
							throw errorToUse;
						} else {
							Internals.Log.warn(
								{logLevel, tag: '@remotion/media'},
								fallbackMessage,
							);
							setShouldFallbackToNativeAudio(true);
						}
					};

					if (result.type === 'unknown-container-format') {
						handleError(
							new Error(`Unknown container format ${preloadedSrc}.`),
							`Unknown container format for ${preloadedSrc} (Supported formats: https://www.remotion.dev/docs/mediabunny/formats), falling back to <Html5Audio>`,
						);
						return;
					}

					if (result.type === 'network-error') {
						handleError(
							new Error(`Network error fetching ${preloadedSrc}.`),
							`Network error fetching ${preloadedSrc}, falling back to <Html5Audio>`,
						);
						return;
					}

					if (result.type === 'cannot-decode') {
						handleError(
							new Error(`Cannot decode ${preloadedSrc}.`),
							`Cannot decode ${preloadedSrc}, falling back to <Html5Audio>`,
						);
						return;
					}

					if (result.type === 'no-tracks') {
						handleError(
							new Error(`No video or audio tracks found for ${preloadedSrc}.`),
							`No video or audio tracks found for ${preloadedSrc}, falling back to <Html5Audio>`,
						);
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
					const [action, errorToUse] = callOnErrorAndResolve({
						onError,
						error,
						disallowFallback: disallowFallbackToHtml5Audio,
						isClientSideRendering: false,
						clientSideError: error,
					});
					if (action === 'fail') {
						throw errorToUse;
					} else {
						Internals.Log.error(
							{logLevel, tag: '@remotion/media'},
							'[AudioForPreview] Failed to initialize MediaPlayer',
							error,
						);
						setShouldFallbackToNativeAudio(true);
					}
				});
		} catch (error) {
			const [action, errorToUse] = callOnErrorAndResolve({
				error: error as Error,
				onError,
				disallowFallback: disallowFallbackToHtml5Audio,
				isClientSideRendering: false,
				clientSideError: error as Error,
			});
			if (action === 'fail') {
				throw errorToUse;
			}

			Internals.Log.error(
				{logLevel, tag: '@remotion/media'},
				'[AudioForPreview] MediaPlayer initialization failed',
				errorToUse,
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
		loop,
		videoConfig.fps,
		audioStreamIndex,
		disallowFallbackToHtml5Audio,
		buffer,
		onError,
		credentials,
		setMediaDurationInSeconds,
	]);

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
	readonly onError?: MediaOnError;
	readonly credentials?: RequestCredentials;
	readonly setMediaDurationInSeconds?: (durationInSeconds: number) => void;
};

export const AudioForPreview: React.FC<InnerAudioProps> = ({
	loop = false,
	src,
	logLevel,
	muted,
	name,
	volume,
	loopVolumeCurveBehavior,
	playbackRate = 1,
	trimAfter,
	trimBefore,
	showInTimeline,
	stack,
	disallowFallbackToHtml5Audio,
	toneFrequency,
	audioStreamIndex,
	fallbackHtml5AudioProps,
	onError,
	credentials,
	setMediaDurationInSeconds,
}) => {
	const preloadedSrc = usePreload(src);

	const defaultLogLevel = Internals.useLogLevel();
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const currentTime = frame / videoConfig.fps;

	const showShow = useMemo(() => {
		return (
			getTimeInSeconds({
				unloopedTimeInSeconds: currentTime,
				playbackRate,
				loop,
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
		playbackRate,
		src,
		trimAfter,
		trimBefore,
		videoConfig.fps,
		loop,
	]);

	if (!showShow) {
		return null;
	}

	if (!setMediaDurationInSeconds) {
		throw new Error('setMediaDurationInSeconds is required');
	}

	return (
		<AudioForPreviewAssertedShowing
			audioStreamIndex={audioStreamIndex}
			src={preloadedSrc}
			playbackRate={playbackRate}
			logLevel={logLevel ?? defaultLogLevel}
			muted={muted ?? false}
			volume={volume ?? 1}
			loopVolumeCurveBehavior={loopVolumeCurveBehavior ?? 'repeat'}
			loop={loop}
			trimAfter={trimAfter}
			trimBefore={trimBefore}
			name={name}
			showInTimeline={showInTimeline ?? true}
			stack={stack}
			disallowFallbackToHtml5Audio={disallowFallbackToHtml5Audio ?? false}
			toneFrequency={toneFrequency}
			onError={onError}
			credentials={credentials}
			fallbackHtml5AudioProps={fallbackHtml5AudioProps}
			setMediaDurationInSeconds={setMediaDurationInSeconds}
		/>
	);
};
