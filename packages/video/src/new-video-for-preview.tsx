import React, {useEffect, useRef, useState} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {Log, type LogLevel} from './log';
import {MediaPlayer} from './media-player';

const {useUnsafeVideoConfig, Timeline} = Internals;

type NewVideoForPreviewProps = {
	readonly src: string;
	readonly style?: React.CSSProperties;
	readonly playbackRate?: number;
	readonly logLevel?: LogLevel;
};

export const NewVideoForPreview: React.FC<NewVideoForPreviewProps> = ({
	src,
	style,
	playbackRate = 1,
	logLevel = 'info',
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const videoConfig = useUnsafeVideoConfig();
	const frame = useCurrentFrame();
	const lastCurrentTimeRef = useRef<number>(-1);
	const mediaPlayerRef = useRef<MediaPlayer | null>(null);

	const [mediaPlayerReady, setMediaPlayerReady] = useState(false);

	const [playing] = Timeline.usePlayingState();

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	if (!src) {
		throw new TypeError('No `src` was passed to <NewVideoForPreview>.');
	}

	const actualFps = videoConfig.fps / playbackRate;
	const currentTime = frame / actualFps;

	useEffect(() => {
		if (!canvasRef.current) return;

		let mounted = true;

		const initializePlayer = async () => {
			try {
				Log.trace(
					logLevel,
					`[NewVideoForPreview] Creating MediaPlayer for src: ${src}`,
				);
				const player = new MediaPlayer({
					canvas: canvasRef.current!,
					src,
					logLevel,
				});

				mediaPlayerRef.current = player;
				await player.initialize();

				if (!mounted) {
					player.dispose();
					return;
				}

				Log.trace(
					logLevel,
					`[NewVideoForPreview] MediaPlayer initialized successfully`,
				);

				setMediaPlayerReady(true);
			} catch (error) {
				if (mounted) {
					Log.error(
						'[NewVideoForPreview] MediaPlayer initialization failed',
						error,
					);
				}
			}
		};

		initializePlayer();

		return () => {
			mounted = false;
			if (mediaPlayerRef.current) {
				Log.trace(logLevel, `[NewVideoForPreview] Disposing MediaPlayer`);
				mediaPlayerRef.current.dispose();
				mediaPlayerRef.current = null;
			}
		};
	}, [src, logLevel]);

	// sync play/pause state with Remotion timeline (like old VideoForPreview video does)
	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer) return;

		if (playing) {
			Log.trace(
				logLevel,
				`[NewVideoForPreview] Remotion playing - calling MediaPlayer.play()`,
			);
			mediaPlayer.play();
		} else {
			Log.trace(
				logLevel,
				`[NewVideoForPreview] Remotion paused - calling MediaPlayer.pause()`,
			);
			mediaPlayer.pause();
		}
	}, [playing, logLevel]);

	// sync target time with MediaPlayer
	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) return;

		mediaPlayer.seekTo(currentTime);
		Log.trace(
			logLevel,
			`[NewVideoForPreview] Updating target time to ${currentTime.toFixed(3)}s`,
		);

		lastCurrentTimeRef.current = currentTime;
	}, [currentTime, logLevel, mediaPlayerReady]);

	return (
		<canvas
			ref={canvasRef}
			width={videoConfig.width}
			height={videoConfig.height}
			style={style}
		/>
	);
};
