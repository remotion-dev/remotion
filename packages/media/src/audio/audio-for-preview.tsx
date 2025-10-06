import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {LogLevel, LoopVolumeCurveBehavior, VolumeProp} from 'remotion';
import {
	Internals,
	Loop,
	useBufferState,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {MediaPlayer} from '../video/media-player';

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
	useLogLevel,
} = Internals;

const calculateLoopDuration = ({
	endAt,
	mediaDuration,
	playbackRate,
	startFrom,
}: {
	mediaDuration: number;
	playbackRate: number;
	startFrom: number | undefined;
	endAt: number | undefined;
}) => {
	let duration = mediaDuration;

	if (typeof endAt !== 'undefined') {
		duration = endAt;
	}

	if (typeof startFrom !== 'undefined') {
		duration -= startFrom;
	}

	const actualDuration = duration / playbackRate;

	return Math.floor(actualDuration);
};

type NewAudioForPreviewProps = {
	readonly src: string;
	readonly playbackRate: number;
	readonly logLevel: LogLevel;
	readonly muted: boolean;
	readonly volume: VolumeProp;
	readonly loopVolumeCurveBehavior: LoopVolumeCurveBehavior;
};

const NewAudioForPreview: React.FC<NewAudioForPreviewProps> = ({
	src,
	playbackRate,
	logLevel,
	muted,
	volume,
	loopVolumeCurveBehavior,
}) => {
	const videoConfig = useUnsafeVideoConfig();
	const frame = useCurrentFrame();
	const mediaPlayerRef = useRef<MediaPlayer | null>(null);

	const [mediaPlayerReady, setMediaPlayerReady] = useState(false);

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

	const actualFps = videoConfig.fps / playbackRate;
	const currentTime = frame / actualFps;

	const [initialTimestamp] = useState(currentTime);

	const preloadedSrc = usePreload(src);

	useEffect(() => {
		if (!sharedAudioContext) return;
		if (!sharedAudioContext.audioContext) return;

		try {
			const player = new MediaPlayer({
				src: preloadedSrc,
				logLevel,
				sharedAudioContext: sharedAudioContext.audioContext,
			});

			mediaPlayerRef.current = player;

			player
				.initialize(initialTimestamp)
				.then(() => {
					setMediaPlayerReady(true);
					Internals.Log.trace(
						{logLevel, tag: '@remotion/media'},
						`[NewAudioForPreview] MediaPlayer initialized successfully`,
					);
				})
				.catch((error) => {
					Internals.Log.error(
						{logLevel, tag: '@remotion/media'},
						'[NewAudioForPreview] Failed to initialize MediaPlayer',
						error,
					);
				});
		} catch (error) {
			Internals.Log.error(
				{logLevel, tag: '@remotion/media'},
				'[NewAudioForPreview] MediaPlayer initialization failed',
				error,
			);
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
		};
	}, [preloadedSrc, logLevel, sharedAudioContext, initialTimestamp]);

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

		audioPlayer.setPlaybackRate(effectivePlaybackRate).catch((error) => {
			Internals.Log.error(
				{logLevel, tag: '@remotion/media'},
				'[NewAudioForPreview] Failed to set playback rate',
				error,
			);
		});
	}, [effectivePlaybackRate, mediaPlayerReady, logLevel]);

	return null;
};

interface AudioForPreviewWithDurationProps {
	readonly durationInSeconds: number | null;
	readonly src: string;
	readonly playbackRate: number;
	readonly logLevel: LogLevel;
	readonly muted: boolean;
	readonly volume: VolumeProp;
	readonly loopVolumeCurveBehavior: LoopVolumeCurveBehavior;
	readonly loop: boolean;
	readonly name: string | undefined;
	readonly trimAfter: number | undefined;
	readonly trimBefore: number | undefined;
}

const AudioForPreviewWithDuration: React.FC<
	AudioForPreviewWithDurationProps
> = ({
	durationInSeconds,
	logLevel,
	loopVolumeCurveBehavior,
	muted,
	playbackRate,
	src,
	volume,
	loop,
	name,
	trimAfter,
	trimBefore,
}) => {
	const {fps} = useVideoConfig();

	if (loop) {
		if (!Number.isFinite(durationInSeconds) || durationInSeconds === null) {
			return (
				<AudioForPreviewWithDuration
					loop={false}
					durationInSeconds={durationInSeconds}
					logLevel={logLevel}
					loopVolumeCurveBehavior={loopVolumeCurveBehavior}
					muted={muted}
					playbackRate={playbackRate}
					src={src}
					volume={volume}
					name={name}
					trimAfter={trimAfter}
					trimBefore={trimBefore}
				/>
			);
		}

		const mediaDuration = durationInSeconds * fps;

		return (
			<Loop
				durationInFrames={calculateLoopDuration({
					endAt: trimAfter,
					mediaDuration,
					playbackRate: playbackRate ?? 1,
					startFrom: trimBefore,
				})}
				layout="none"
				name={name}
			>
				<AudioForPreviewWithDuration
					loop={false}
					durationInSeconds={durationInSeconds}
					logLevel={logLevel}
					loopVolumeCurveBehavior={loopVolumeCurveBehavior}
					muted={muted}
					playbackRate={playbackRate}
					src={src}
					volume={volume}
					name={name}
					trimAfter={trimAfter}
					trimBefore={trimBefore}
				/>
			</Loop>
		);
	}

	return (
		<NewAudioForPreview
			src={src}
			playbackRate={playbackRate}
			logLevel={logLevel}
			muted={muted}
			volume={volume}
			loopVolumeCurveBehavior={loopVolumeCurveBehavior}
		/>
	);
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
};

export const AudioForPreview: React.FC<InnerAudioProps> = ({
	loop = false,
	src,
	logLevel: logLevelProp,
	muted = false,
	name,
	volume = 1,
	loopVolumeCurveBehavior = 'repeat',
	playbackRate = 1,
}) => {
	const logLevel = useLogLevel() ?? logLevelProp ?? 'info';
	const preloadedSrc = usePreload(src);

	const [durationInSeconds, setDurationInSeconds] = useState<number | null>(
		null,
	);

	useEffect(() => {
		if (!loop) {
			return;
		}

		let cancelled = false;

		const computeDuration = async () => {
			const urlSource = new UrlSource(preloadedSrc);
			const input = new Input({
				source: urlSource,
				formats: ALL_FORMATS,
			});

			try {
				const duration = await input.computeDuration();

				if (!cancelled) {
					setDurationInSeconds(duration);
				}
			} catch (error) {
				Internals.Log.error(
					{logLevel, tag: '@remotion/media'},
					'[AudioForPreview] Failed to compute duration',
					error,
				);
			} finally {
				input.dispose();
			}
		};

		computeDuration();

		return () => {
			cancelled = true;
		};
	}, [loop, preloadedSrc, logLevel]);

	if (loop && durationInSeconds === null) {
		return null;
	}

	return (
		<AudioForPreviewWithDuration
			durationInSeconds={durationInSeconds}
			logLevel={logLevel}
			muted={muted}
			playbackRate={playbackRate}
			src={src}
			volume={volume}
			name={name}
			trimAfter={undefined}
			trimBefore={undefined}
			loop={loop}
			loopVolumeCurveBehavior={loopVolumeCurveBehavior}
		/>
	);
};
