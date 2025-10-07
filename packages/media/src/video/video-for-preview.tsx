import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {
	LogLevel,
	LoopVolumeCurveBehavior,
	OnVideoFrame,
	VolumeProp,
} from 'remotion';
import {Internals, useBufferState, useCurrentFrame} from 'remotion';
import {MediaPlayer} from './media-player';

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

type NewVideoForPreviewProps = {
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
};

const NewVideoForPreview: React.FC<NewVideoForPreviewProps> = ({
	src,
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

	const [mediaMuted] = useMediaMutedState();
	const [mediaVolume] = useMediaVolumeState();

	const volumePropFrame = useFrameForVolumeProp(loopVolumeCurveBehavior);

	const userPreferredVolume = evaluateVolume({
		frame: volumePropFrame,
		volume,
		mediaVolume,
	});

	warnAboutTooHighVolume(userPreferredVolume);

	const [timelineId] = useState(() => String(Math.random()));

	const parentSequence = useContext(SequenceContext);

	useMediaInTimeline({
		volume,
		mediaVolume,
		mediaType: 'video',
		src,
		playbackRate,
		displayName: name ?? null,
		id: timelineId,
		stack: null,
		showInTimeline,
		premountDisplay: parentSequence?.premountDisplay ?? null,
		postmountDisplay: parentSequence?.postmountDisplay ?? null,
	});

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	if (!src) {
		throw new TypeError('No `src` was passed to <NewVideoForPreview>.');
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
				trimAfterSeconds: trimAfter ? trimAfter * videoConfig.fps : undefined,
				trimBeforeSeconds: trimBefore
					? trimBefore * videoConfig.fps
					: undefined,
			});

			mediaPlayerRef.current = player;

			player
				.initialize(currentTimeRef.current)
				.then(() => {
					setMediaPlayerReady(true);
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
	}, [
		preloadedSrc,
		logLevel,
		sharedAudioContext,
		loop,
		trimAfter,
		trimBefore,
		videoConfig.fps,
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

		let currentBlock: {unblock: () => void} | null = null;

		const unsubscribe = mediaPlayer.onBufferingChange((newBufferingState) => {
			if (newBufferingState && !currentBlock) {
				currentBlock = buffer.delayPlayback();

				Internals.Log.trace(
					{logLevel, tag: '@remotion/media'},
					'[NewVideoForPreview] MediaPlayer buffering - blocking Remotion playback',
				);
			} else if (!newBufferingState && currentBlock) {
				currentBlock.unblock();
				currentBlock = null;

				Internals.Log.trace(
					{logLevel, tag: '@remotion/media'},
					'[NewVideoForPreview] MediaPlayer unbuffering - unblocking Remotion playback',
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

		mediaPlayer.setPlaybackRate(effectivePlaybackRate);
	}, [effectivePlaybackRate, mediaPlayerReady, logLevel]);

	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) {
			return;
		}

		mediaPlayer.setLoop(loop);
	}, [loop, mediaPlayerReady]);

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

type InnerVideoProps = {
	readonly className: string | undefined;
	readonly loop: boolean;
	readonly src: string;
	readonly logLevel: LogLevel;
	readonly muted: boolean;
	readonly name: string | undefined;
	readonly volume: VolumeProp;
	readonly loopVolumeCurveBehavior: LoopVolumeCurveBehavior;
	readonly onVideoFrame: OnVideoFrame | undefined;
	readonly playbackRate: number;
	readonly style: React.CSSProperties;
	readonly showInTimeline: boolean;
};

export const VideoForPreview: React.FC<InnerVideoProps> = ({
	className,
	loop,
	src,
	logLevel,
	muted,
	name,
	volume,
	loopVolumeCurveBehavior,
	onVideoFrame,
	playbackRate,
	style,
	showInTimeline,
}) => {
	const preloadedSrc = usePreload(src);

	return (
		<NewVideoForPreview
			className={className}
			logLevel={logLevel}
			muted={muted}
			onVideoFrame={onVideoFrame}
			playbackRate={playbackRate}
			src={preloadedSrc}
			style={style}
			volume={volume}
			name={name}
			trimAfter={undefined}
			trimBefore={undefined}
			loop={loop}
			loopVolumeCurveBehavior={loopVolumeCurveBehavior}
			showInTimeline={showInTimeline}
		/>
	);
};
