import {Player, type PlayerRef} from '@remotion/player';
import type {CropRectangle} from 'mediabunny';
import {useEffect, useRef, useState} from 'react';
import {
	AbsoluteFill,
	Audio,
	useCurrentFrame,
	useVideoConfig,
	Video,
} from 'remotion';
import type {Dimensions} from '~/lib/calculate-new-dimensions-from-dimensions';
import type {Source} from '~/lib/convert-state';
import {cn} from '~/lib/utils';
import {AudioWaveForm, AudioWaveformContainer} from './AudioWaveform';
import {CropUI} from './crop-ui/CropUi';

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

const RemotionMediaPreview: React.FC<{
	readonly src: string;
	readonly isAudio: boolean;
	readonly waveform: number[];
}> = ({src, isAudio, waveform}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const progress = frame / Math.max(1, durationInFrames - 1);

	if (!isAudio) {
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
	}

	return (
		<AbsoluteFill>
			<Audio src={src} />
			<AudioWaveformContainer>
				<AudioWaveForm bars={waveform} progress={progress} playing />
			</AudioWaveformContainer>
		</AbsoluteFill>
	);
};

export function VideoPlayer({
	src: source,
	isAudio,
	waveform,
	crop,
	setUnclampedRect,
	unclampedRect,
	dimensions,
	durationInSeconds,
	fps,
	onPlaybackTimeChange,
}: {
	readonly src: Source;
	readonly waveform: number[];
	readonly isAudio: boolean;
	readonly crop: boolean;
	readonly unclampedRect: CropRectangle;
	readonly dimensions: Dimensions | null | undefined;
	readonly durationInSeconds: number | null | undefined;
	readonly fps: number | null | undefined;
	readonly onPlaybackTimeChange: (timeInSeconds: number) => void;
	readonly setUnclampedRect: React.Dispatch<
		React.SetStateAction<CropRectangle>
	>;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<PlayerRef>(null);
	const videoSourceUrl = useVideoSourceUrl(source);

	const playerFps = getPlayerFps(fps);
	const durationInFrames = getDurationInFrames({
		durationInSeconds,
		fps: playerFps,
	});
	const playerDimensions = isAudio
		? {width: 732, height: 197}
		: (dimensions ?? null);

	useEffect(() => {
		const {current} = playerRef;
		if (!current) {
			return;
		}

		const onFrameChange = (event: {detail: {frame: number}}) => {
			const timeInSeconds = event.detail.frame / playerFps;
			onPlaybackTimeChange(timeInSeconds);
		};

		current.addEventListener('timeupdate', onFrameChange);
		current.addEventListener('seeked', onFrameChange);

		return () => {
			current.removeEventListener('timeupdate', onFrameChange);
			current.removeEventListener('seeked', onFrameChange);
		};
	}, [onPlaybackTimeChange, playerFps, videoSourceUrl]);

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
					'relative',
				)}
			>
				{videoSourceUrl && playerDimensions && durationInFrames ? (
					<Player
						ref={playerRef}
						key={videoSourceUrl}
						component={RemotionMediaPreview}
						inputProps={{src: videoSourceUrl, isAudio, waveform}}
						durationInFrames={durationInFrames}
						compositionWidth={playerDimensions.width}
						compositionHeight={playerDimensions.height}
						fps={playerFps}
						controls={!crop}
						acknowledgeRemotionLicense
						style={{width: '100%'}}
						overflowVisible
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
		</div>
	);
}
