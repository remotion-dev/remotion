import type {MediaFox} from '@mediafox/core';
import {Player} from '@remotion/player';
import type {CropRectangle} from 'mediabunny';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AbsoluteFill, Video} from 'remotion';
import type {Dimensions} from '~/lib/calculate-new-dimensions-from-dimensions';
import type {Source} from '~/lib/convert-state';
import {cn} from '~/lib/utils';
import {AudioWaveForm, AudioWaveformContainer} from './AudioWaveform';
import {CropUI} from './crop-ui/CropUi';
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

export const getPlayerFps = (fps: number | null | undefined) => {
	if (typeof fps !== 'number' || !Number.isFinite(fps) || fps <= 0) {
		return 30;
	}

	return fps;
};

export const getDurationInFrames = ({
	durationInSeconds,
	fps,
}: {
	durationInSeconds: number | null | undefined;
	fps: number;
}) => {
	if (
		typeof durationInSeconds !== 'number' ||
		!Number.isFinite(durationInSeconds) ||
		durationInSeconds <= 0
	) {
		return null;
	}

	return Math.max(1, Math.ceil(durationInSeconds * fps));
};

const useVideoSourceUrl = (source: Source) => {
	const [objectUrl, setObjectUrl] = useState<string | null>(null);

	useEffect(() => {
		if (source.type === 'url') {
			setObjectUrl(null);
			return;
		}

		const url = URL.createObjectURL(source.file);
		setObjectUrl(url);

		return () => {
			URL.revokeObjectURL(url);
		};
	}, [source]);

	if (source.type === 'url') {
		return source.url;
	}

	return objectUrl;
};

const RemotionVideoPreview: React.FC<{
	readonly src: string;
}> = ({src}) => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Video
				src={src}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'contain',
				}}
			/>
		</AbsoluteFill>
	);
};

export function VideoPlayer({
	src: source,
	isAudio,
	waveform,
	mediaFox,
	crop,
	setUnclampedRect,
	unclampedRect,
	dimensions,
	durationInSeconds,
	fps,
}: {
	readonly src: Source;
	readonly waveform: number[];
	readonly isAudio: boolean;
	readonly mediaFox: MediaFox;
	readonly crop: boolean;
	readonly unclampedRect: CropRectangle;
	readonly dimensions: Dimensions | null | undefined;
	readonly durationInSeconds: number | null | undefined;
	readonly fps: number | null | undefined;
	readonly setUnclampedRect: React.Dispatch<
		React.SetStateAction<CropRectangle>
	>;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const videoSourceUrl = useVideoSourceUrl(source);

	const src = useMemo(() => {
		if (source.type === 'url') {
			return source.url;
		}

		return source.file;
	}, [source]);

	useEffect(() => {
		if (!isAudio) {
			return;
		}

		mediaFox.setRenderTarget(canvasRef.current!);

		// Load media
		mediaFox.load(src).then(() => {});

		return () => {
			mediaFox.dispose();
		};
	}, [isAudio, src, mediaFox]);

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

	const toggleFullscreen = useCallback(() => {
		if (!containerRef.current) {
			return;
		}

		if (!document.fullscreenElement) {
			containerRef.current.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}, [containerRef]);

	const playerFps = getPlayerFps(fps);
	const durationInFrames = getDurationInFrames({
		durationInSeconds,
		fps: playerFps,
	});

	return (
		<div
			ref={containerRef}
			style={{maxWidth: 732}}
			className={cn(
				'flex',
				'flex-col',
				'group',
				'group-fullscreen:border-b-0',
				'group-fullscreen:rounded-none',
				'relative',
			)}
		>
			<div
				className={cn(
					crop ? 'border-0' : 'border-2',
					'rounded-md',
					crop ? 'border-transparent' : 'border-black',
					'overflow-hidden',
					'relative',
				)}
			>
				{isAudio ? (
					<>
						<AudioWaveformContainer>
							<AudioWaveForm bars={waveform} mediafox={mediaFox} />
						</AudioWaveformContainer>
						<canvas ref={canvasRef} style={{display: 'none'}} />
					</>
				) : videoSourceUrl && dimensions && durationInFrames ? (
					<Player
						key={videoSourceUrl}
						component={RemotionVideoPreview}
						inputProps={{src: videoSourceUrl}}
						durationInFrames={durationInFrames}
						compositionWidth={dimensions.width}
						compositionHeight={dimensions.height}
						fps={playerFps}
						controls={!crop}
						acknowledgeRemotionLicense
						style={{width: '100%'}}
					/>
				) : (
					<div
						className="bg-slate-100 text-muted-foreground flex items-center justify-center text-sm"
						style={{
							aspectRatio: dimensions
								? `${dimensions.width} / ${dimensions.height}`
								: '16 / 9',
						}}
					>
						Loading preview...
					</div>
				)}
				{!isAudio && crop && dimensions ? (
					<CropUI
						setUnclampedRect={setUnclampedRect}
						unclampedRect={unclampedRect}
						dimensions={dimensions}
					/>
				) : null}
			</div>
			<div className="h-2" />
			{isAudio ? (
				<div
					className={cn(
						'flex',
						'row',
						'border-2',
						'border-b-4',
						'rounded-md',
						'border-black',
						'items-center',
						'bg-white',
					)}
				>
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
