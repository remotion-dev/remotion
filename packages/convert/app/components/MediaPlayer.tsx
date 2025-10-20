import type {MediaFox} from '@mediafox/core';
import {useEffect, useMemo, useRef, useState} from 'react';
import type {Source} from '~/lib/convert-state';
import {AudioWaveForm, AudioWaveformContainer} from './AudioWaveform';
import {PlayerVolume} from './player/mute-button';
import {PlayPauseButton} from './player/play-button';
import {PlayerFullscreen} from './player/player-fullscreen';
import {PlayerSeekBar} from './player/player-seekbar';
import {TimeDisplay} from './player/time-display';

const Separator: React.FC = () => {
	return (
		<div
			style={{
				borderRight: `2px solid black`,
				height: 50,
			}}
		/>
	);
};

export function VideoPlayer({
	src: source,
	isAudio,
	waveform,
	mediaFox,
}: {
	readonly src: Source;
	readonly waveform: number[];
	readonly isAudio: boolean;
	readonly mediaFox: MediaFox;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const src = useMemo(() => {
		if (source.type === 'url') {
			return source.url;
		}

		return source.file;
	}, [source]);

	useEffect(() => {
		mediaFox.setRenderTarget(canvasRef.current!);

		// Load media
		mediaFox.load(src).then(() => {});

		return () => {
			mediaFox.dispose();
		};
	}, [src, mediaFox]);

	const [isFullscreen, setIsFullscreen] = useState(false);

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(document.fullscreenElement === containerRef.current);
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);

		return () => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
		};
	}, []);

	const toggleFullscreen = () => {
		if (!containerRef.current) {
			return;
		}

		if (!document.fullscreenElement) {
			containerRef.current.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	};

	return (
		<div
			ref={containerRef}
			style={{maxWidth: 732}}
			className="border-2 border-b-4 border-black rounded-md overflow-hidden flex flex-col group group-fullscreen:border-b-0 group-fullscreen:rounded-none"
		>
			{isAudio ? (
				<AudioWaveformContainer>
					<AudioWaveForm bars={waveform} mediafox={mediaFox} />
				</AudioWaveformContainer>
			) : null}
			<canvas
				ref={canvasRef}
				style={{width: '100%', display: isAudio ? 'none' : 'block'}}
				className="group-fullscreen:flex-1"
			/>
			{mediaFox ? (
				<div className="flex row border-t-2 border-t-black items-center bg-white">
					<PlayPauseButton playerRef={mediaFox} />
					<Separator />
					<PlayerVolume playerRef={mediaFox} />
					<Separator />
					<div style={{width: 15}} />
					<TimeDisplay playerRef={mediaFox} />
					<div style={{width: 15}} />
					<PlayerSeekBar playerRef={mediaFox} />
					<div style={{width: 15}} />
					<Separator />
					<PlayerFullscreen
						isFullscreen={isFullscreen}
						onClick={toggleFullscreen}
					/>
				</div>
			) : null}
		</div>
	);
}
