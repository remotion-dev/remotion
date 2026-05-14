import type {PlayerProps, PlayerRef} from '@remotion/player';
import {Player} from '@remotion/player';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {AnyZodObject} from 'remotion';
import {useMediaKeyboardShortcuts} from './useMediaKeyboardShortcuts.js';

const formatTime = (seconds: number): string => {
	if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${String(s).padStart(2, '0')}`;
};

export type AccessiblePlayerProps<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = Omit<
	PlayerProps<Schema, Props>,
	| 'controls'
	| 'clickToPlay'
	| 'doubleClickToFullscreen'
	| 'spaceKeyToPlayOrPause'
	| 'showVolumeControls'
	| 'alwaysShowControls'
	| 'hideControlsWhenPointerDoesntMove'
> & {
	readonly accessibleName?: string;
	readonly keyboardShortcuts?: boolean;
};

export const AccessiblePlayer = <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>({
	accessibleName = 'Video player',
	keyboardShortcuts = true,
	fps,
	durationInFrames,
	...playerProps
}: AccessiblePlayerProps<Schema, Props>) => {
	const playerRef = useRef<PlayerRef>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [currentFrame, setCurrentFrame] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [volume, setVolume] = useState(1);
	const [status, setStatus] = useState('');

	useEffect(() => {
		const player = playerRef.current;
		if (!player) return;

		const onFrame = () => {
			setCurrentFrame(player.getCurrentFrame());
		};

		const onPlay = () => {
			setIsPlaying(true);
			setStatus('Playing');
		};

		const onPause = () => {
			setIsPlaying(false);
			setStatus('Paused');
		};

		const onMuteChange = () => {
			setIsMuted(player.isMuted());
		};

		const onVolumeChange = () => {
			setVolume(player.getVolume());
		};

		const onFullscreen = () => setIsFullscreen(true);
		const onExitFullscreen = () => setIsFullscreen(false);
		const onEnded = () => setStatus('Ended');

		player.addEventListener('frameupdate', onFrame);
		player.addEventListener('play', onPlay);
		player.addEventListener('pause', onPause);
		player.addEventListener('mutechange', onMuteChange);
		player.addEventListener('volumechange', onVolumeChange);
		player.addEventListener('fullscreenchange', (e) => {
			if (e.detail.isFullscreen) onFullscreen();
			else onExitFullscreen();
		});
		player.addEventListener('ended', onEnded);

		return () => {
			player.removeEventListener('frameupdate', onFrame);
			player.removeEventListener('play', onPlay);
			player.removeEventListener('pause', onPause);
			player.removeEventListener('mutechange', onMuteChange);
			player.removeEventListener('volumechange', onVolumeChange);
			player.removeEventListener('ended', onEnded);
		};
	}, []);

	useMediaKeyboardShortcuts({
		playerRef,
		containerRef,
		fps,
		durationInFrames,
		enabled: keyboardShortcuts,
	});

	const handleTogglePlay = useCallback(() => {
		playerRef.current?.toggle();
	}, []);

	const handleToggleMute = useCallback(() => {
		const p = playerRef.current;
		if (!p) return;
		if (p.isMuted()) p.unmute();
		else p.mute();
	}, []);

	const handleToggleFullscreen = useCallback(() => {
		const p = playerRef.current;
		if (!p) return;
		if (p.isFullscreen()) p.exitFullscreen();
		else p.requestFullscreen();
	}, []);

	const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const frame = Number(e.target.value);
		playerRef.current?.seekTo(frame);
	}, []);

	const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const v = Number(e.target.value);
		playerRef.current?.setVolume(v);
	}, []);

	const currentSeconds = currentFrame / fps;
	const totalSeconds = durationInFrames / fps;
	const valueText = `${formatTime(currentSeconds)} of ${formatTime(totalSeconds)}`;

	return (
		<div
			ref={containerRef}
			role="region"
			aria-label={accessibleName}
			tabIndex={-1}
			style={{display: 'inline-block'}}
		>
			{React.createElement(
				Player as React.ComponentType,
				{
					...(playerProps as Record<string, unknown>),
					ref: playerRef,
					fps,
					durationInFrames,
					controls: false,
					clickToPlay: false,
					spaceKeyToPlayOrPause: false,
				} as Record<string, unknown>,
			)}

			<div
				role="toolbar"
				aria-label="Player controls"
				aria-controls=""
				style={{
					display: 'flex',
					gap: 8,
					alignItems: 'center',
					padding: 8,
				}}
			>
				<button
					type="button"
					aria-label={isPlaying ? 'Pause' : 'Play'}
					aria-pressed={isPlaying}
					onClick={handleTogglePlay}
				>
					{isPlaying ? '❚❚' : '▶'}
				</button>

				<input
					type="range"
					aria-label="Seek"
					aria-valuetext={valueText}
					min={0}
					max={Math.max(0, durationInFrames - 1)}
					step={1}
					value={currentFrame}
					onChange={handleSeek}
					style={{flex: 1}}
				/>

				<span aria-hidden="true">{valueText}</span>

				<button
					type="button"
					aria-label={isMuted ? 'Unmute' : 'Mute'}
					aria-pressed={isMuted}
					onClick={handleToggleMute}
				>
					{isMuted ? '🔇' : '🔊'}
				</button>

				<input
					type="range"
					aria-label="Volume"
					aria-valuetext={`${Math.round(volume * 100)} percent`}
					min={0}
					max={1}
					step={0.05}
					value={volume}
					onChange={handleVolume}
				/>

				<button
					type="button"
					aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
					aria-pressed={isFullscreen}
					onClick={handleToggleFullscreen}
				>
					⛶
				</button>
			</div>

			<div
				role="status"
				aria-live="polite"
				style={{
					position: 'absolute',
					width: 1,
					height: 1,
					overflow: 'hidden',
					clip: 'rect(0 0 0 0)',
					whiteSpace: 'nowrap',
				}}
			>
				{status}
			</div>
		</div>
	);
};
