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
import {MediaPlayer} from './media-player';
import type {VideoProps} from './props';

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

type NewVideoForPreviewProps = {
	readonly src: string;
	readonly style?: React.CSSProperties;
	readonly playbackRate?: number;
	readonly logLevel?: LogLevel;
	readonly className?: string;
	readonly muted?: boolean;
	readonly volume?: VolumeProp;
	readonly loopVolumeCurveBehavior?: LoopVolumeCurveBehavior;
	readonly onVideoFrame?: (frame: CanvasImageSource) => void;
	readonly _remotionInternalNativeLoopPassed?: boolean;
};

const NewVideoForPreview: React.FC<NewVideoForPreviewProps> = ({
	src,
	style,
	playbackRate = 1,
	logLevel = 'info',
	className,
	muted = false,
	volume,
	loopVolumeCurveBehavior,
	onVideoFrame,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
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

	const [timelineId] = useState(() => String(Math.random()));

	useMediaInTimeline({
		volume,
		mediaVolume,
		mediaType: 'video',
		src,
		playbackRate,
		displayName: null,
		id: timelineId,
		stack: null,
		showInTimeline: true,
		premountDisplay: null,
		postmountDisplay: null,
	});

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	if (!src) {
		throw new TypeError('No `src` was passed to <NewVideoForPreview>.');
	}

	const actualFps = videoConfig.fps / playbackRate;
	const currentTime = frame / actualFps;

	const [initialTimestamp] = useState(currentTime);

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
			});

			mediaPlayerRef.current = player;

			player
				.initialize(initialTimestamp)
				.then(() => {
					setMediaPlayerReady(true);
					Internals.Log.trace(
						{logLevel, tag: '@remotion/media'},
						`[NewVideoForPreview] MediaPlayer initialized successfully`,
					);
				})
				.catch((error) => {
					Internals.Log.error(
						{logLevel, tag: '@remotion/media'},
						'[NewVideoForPreview] Failed to initialize MediaPlayer',
						error,
					);
				});
		} catch (error) {
			Internals.Log.error(
				{logLevel, tag: '@remotion/media'},
				'[NewVideoForPreview] MediaPlayer initialization failed',
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
					`[NewVideoForPreview] Disposing MediaPlayer`,
				);
				mediaPlayerRef.current.dispose();
				mediaPlayerRef.current = null;
			}

			setMediaPlayerReady(false);
		};
	}, [preloadedSrc, logLevel, sharedAudioContext, initialTimestamp]);

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
					'[NewVideoForPreview] Failed to play',
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
			`[NewVideoForPreview] Updating target time to ${currentTime.toFixed(3)}s`,
		);
	}, [currentTime, logLevel, mediaPlayerReady]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) return;

		mediaPlayer.onBufferingChange((newBufferingState) => {
			if (newBufferingState && !delayHandleRef.current) {
				delayHandleRef.current = buffer.delayPlayback();
				Internals.Log.trace(
					{logLevel, tag: '@remotion/media'},
					'[NewVideoForPreview] MediaPlayer buffering - blocking Remotion playback',
				);
			} else if (!newBufferingState && delayHandleRef.current) {
				delayHandleRef.current.unblock();
				delayHandleRef.current = null;
				Internals.Log.trace(
					{logLevel, tag: '@remotion/media'},
					'[NewVideoForPreview] MediaPlayer unbuffering - unblocking Remotion playback',
				);
			}
		});
	}, [mediaPlayerReady, buffer, logLevel]);

	const effectiveMuted = muted || mediaMuted || userPreferredVolume <= 0;

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
	}, [userPreferredVolume, mediaPlayerReady, logLevel]);

	const effectivePlaybackRate = useMemo(
		() => playbackRate * globalPlaybackRate,
		[playbackRate, globalPlaybackRate],
	);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setPlaybackRate(effectivePlaybackRate).catch((error) => {
			Internals.Log.error(
				{logLevel, tag: '@remotion/media'},
				'[NewVideoForPreview] Failed to set playback rate',
				error,
			);
		});
	}, [effectivePlaybackRate, mediaPlayerReady, logLevel]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		if (onVideoFrame) {
			mediaPlayer.onVideoFrame(onVideoFrame);
		}
	}, [onVideoFrame, mediaPlayerReady]);

	return (
		<canvas
			ref={canvasRef}
			width={videoConfig.width}
			height={videoConfig.height}
			style={style}
			className={classNameValue}
		/>
	);
};

interface VideoForPreviewWithDurationProps extends VideoProps {
	readonly durationInSeconds: number;
}

const VideoForPreviewWithDuration: React.FC<
	VideoForPreviewWithDurationProps
> = (props) => {
	const {name, durationInSeconds, loop, trimBefore, trimAfter, ...otherProps} =
		props;
	const {fps} = useVideoConfig();

	if (loop) {
		if (!Number.isFinite(durationInSeconds)) {
			return (
				<VideoForPreviewWithDuration
					{...props}
					_remotionInternalNativeLoopPassed
					loop={false}
				/>
			);
		}

		const mediaDuration = durationInSeconds * fps;

		return (
			<Loop
				durationInFrames={calculateLoopDuration({
					endAt: trimAfter,
					mediaDuration,
					playbackRate: props.playbackRate ?? 1,
					startFrom: trimBefore,
				})}
				layout="none"
				name={name}
			>
				<VideoForPreviewWithDuration
					{...props}
					_remotionInternalNativeLoopPassed
					loop={false}
				/>
			</Loop>
		);
	}

	return (
		<NewVideoForPreview
			src={otherProps.src}
			style={otherProps.style}
			playbackRate={otherProps.playbackRate}
			logLevel={otherProps.logLevel}
			muted={otherProps.muted}
			volume={otherProps.volume}
			loopVolumeCurveBehavior={otherProps.loopVolumeCurveBehavior}
			onVideoFrame={otherProps.onVideoFrame}
			_remotionInternalNativeLoopPassed={
				otherProps._remotionInternalNativeLoopPassed
			}
		/>
	);
};

export const VideoForPreview: React.FC<VideoProps> = (props) => {
	const {loop, src, logLevel} = props;
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
			try {
				const urlSource = new UrlSource(preloadedSrc);
				const input = new Input({
					source: urlSource,
					formats: ALL_FORMATS,
				});

				const duration = await input.computeDuration();

				if (!cancelled) {
					setDurationInSeconds(duration);
				}

				input.dispose();
			} catch (error) {
				Internals.Log.error(
					{logLevel: logLevel ?? 'info', tag: '@remotion/media'},
					'[VideoForPreview] Failed to compute duration',
					error,
				);
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
		<VideoForPreviewWithDuration
			{...props}
			durationInSeconds={durationInSeconds ?? 0}
		/>
	);
};
