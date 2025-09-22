import React, {useContext, useEffect, useRef, useState} from 'react';
import {Internals, useBufferState, useCurrentFrame} from 'remotion';
import {Log, type LogLevel} from '../log';
import {MediaPlayer} from './media-player';

const {useUnsafeVideoConfig, Timeline, SharedAudioContext} = Internals;

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
	const sharedAudioContext = useContext(SharedAudioContext);
	const buffer = useBufferState();
	const delayHandleRef = useRef<{unblock: () => void} | null>(null);

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	if (!src) {
		throw new TypeError('No `src` was passed to <NewVideoForPreview>.');
	}

	const actualFps = videoConfig.fps / playbackRate;
	const currentTime = frame / actualFps;

	const [initialTimestamp] = useState(currentTime);

	useEffect(() => {
		if (!canvasRef.current) return;
		if (!sharedAudioContext) return;
		if (!sharedAudioContext.audioContext) return;

		try {
			Log.trace(
				logLevel,
				`[NewVideoForPreview] Creating MediaPlayer for src: ${src}`,
			);
			const player = new MediaPlayer({
				canvas: canvasRef.current!,
				src,
				logLevel,
				sharedAudioContext: sharedAudioContext.audioContext,
			});

			mediaPlayerRef.current = player;
			player
				.initialize(initialTimestamp)
				.then(() => {
					setMediaPlayerReady(true);
					Log.trace(
						logLevel,
						`[NewVideoForPreview] MediaPlayer initialized successfully`,
					);
				})
				.catch((error) => {
					Log.error(
						'[NewVideoForPreview] Failed to initialize MediaPlayer',
						error,
					);
				});
		} catch (error) {
			Log.error(
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
				Log.trace(logLevel, `[NewVideoForPreview] Disposing MediaPlayer`);
				mediaPlayerRef.current.dispose();
				mediaPlayerRef.current = null;
			}

			setMediaPlayerReady(false);
		};
	}, [src, logLevel, sharedAudioContext, initialTimestamp]);

	// sync play/pause state with Remotion timeline (like old VideoForPreview video does)
	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer) return;

		if (playing) {
			Log.trace(
				logLevel,
				`[NewVideoForPreview] Remotion playing - calling MediaPlayer.play()`,
			);
			mediaPlayer.play().catch((error) => {
				Log.error('[NewVideoForPreview] Failed to play', error);
			});
		} else {
			Log.trace(
				logLevel,
				`[NewVideoForPreview] Remotion paused - calling MediaPlayer.pause()`,
			);
			mediaPlayer.pause();
		}
	}, [playing, logLevel, mediaPlayerReady]);

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

	// sync MediaPlayer stalling with Remotion buffering
	useEffect(() => {
		const mediaPlayer = mediaPlayerRef.current;
		if (!mediaPlayer || !mediaPlayerReady) return;

		mediaPlayer.onStalledChange((isStalled) => {
			if (isStalled && !delayHandleRef.current) {
				// Start blocking Remotion playback
				delayHandleRef.current = buffer.delayPlayback();
				Log.trace(
					logLevel,
					'[NewVideoForPreview] MediaPlayer stalled - blocking Remotion playback',
				);
			} else if (!isStalled && delayHandleRef.current) {
				// Unblock Remotion playback
				delayHandleRef.current.unblock();
				delayHandleRef.current = null;
				Log.trace(
					logLevel,
					'[NewVideoForPreview] MediaPlayer unstalled - unblocking Remotion playback',
				);
			}
		});
	}, [mediaPlayerReady, buffer, logLevel]);

	return (
		<canvas
			ref={canvasRef}
			width={videoConfig.width}
			height={videoConfig.height}
			style={style}
		/>
	);
};
