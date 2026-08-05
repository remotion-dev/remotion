import {Audio, Video} from '@remotion/media';
import {Player, type PlayerRef} from '@remotion/player';
import type {CropRectangle} from 'mediabunny';
import {type CSSProperties, useEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {
	calculateNewDimensionsFromRotate,
	type Dimensions,
	normalizeVideoRotation,
} from '~/lib/calculate-new-dimensions-from-dimensions';
import type {Source} from '~/lib/convert-state';
import {cn} from '~/lib/utils';
import {AudioWaveForm, AudioWaveformContainer} from './AudioWaveform';
import {CropUI} from './crop-ui/CropUi';
import {Filmstrip} from './player/filmstrip';

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

export const getPlayerDimensions = ({
	dimensions,
	isAudio,
	rotation,
}: {
	dimensions: Dimensions | null | undefined;
	isAudio: boolean;
	rotation: number;
}): Dimensions | null => {
	if (isAudio) {
		return {width: 732, height: 197};
	}

	if (!dimensions) {
		return null;
	}

	return calculateNewDimensionsFromRotate({
		...dimensions,
		rotation,
	});
};

export const getVideoPreviewStyle = ({
	width,
	height,
	rotation,
	mirrorHorizontal,
	mirrorVertical,
}: Dimensions & {
	rotation: number;
	mirrorHorizontal: boolean;
	mirrorVertical: boolean;
}): CSSProperties => {
	const normalizedRotation = normalizeVideoRotation(rotation);
	const switchesDimensions =
		normalizedRotation % 90 === 0 && normalizedRotation % 180 !== 0;

	return {
		position: 'absolute',
		left: '50%',
		top: '50%',
		width: switchesDimensions ? height : width,
		height: switchesDimensions ? width : height,
		transform: `translate(-50%, -50%) scale(${mirrorHorizontal ? -1 : 1}, ${mirrorVertical ? -1 : 1}) rotate(${normalizedRotation}deg)`,
	};
};

const RemotionMediaPreview: React.FC<{
	readonly src: string;
	readonly isAudio: boolean;
	readonly waveform: number[];
	readonly rotation: number;
	readonly mirrorHorizontal: boolean;
	readonly mirrorVertical: boolean;
}> = ({src, isAudio, waveform, rotation, mirrorHorizontal, mirrorVertical}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, width, height} = useVideoConfig();
	const progress = frame / Math.max(1, durationInFrames - 1);

	if (!isAudio) {
		return (
			<AbsoluteFill style={{backgroundColor: 'black'}}>
				<Video
					src={src}
					objectFit="contain"
					style={getVideoPreviewStyle({
						width,
						height,
						rotation,
						mirrorHorizontal,
						mirrorVertical,
					})}
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
	trim,
	trimInFrame,
	trimOutFrame,
	setTrimInFrame,
	setTrimOutFrame,
	setUnclampedRect,
	unclampedRect,
	dimensions,
	durationInSeconds,
	fps,
	rotation,
	mirrorHorizontal,
	mirrorVertical,
	onPlaybackTimeChange,
}: {
	readonly src: Source;
	readonly waveform: number[];
	readonly isAudio: boolean;
	readonly crop: boolean;
	readonly trim: boolean;
	readonly trimInFrame: number | null;
	readonly trimOutFrame: number | null;
	readonly setTrimInFrame: React.Dispatch<React.SetStateAction<number | null>>;
	readonly setTrimOutFrame: React.Dispatch<React.SetStateAction<number | null>>;
	readonly unclampedRect: CropRectangle;
	readonly dimensions: Dimensions | null | undefined;
	readonly durationInSeconds: number | null | undefined;
	readonly fps: number | null | undefined;
	readonly rotation: number;
	readonly mirrorHorizontal: boolean;
	readonly mirrorVertical: boolean;
	readonly onPlaybackTimeChange: (timeInSeconds: number) => void;
	readonly setUnclampedRect: React.Dispatch<
		React.SetStateAction<CropRectangle>
	>;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<PlayerRef>(null);
	const trimFrameToSeekRef = useRef<number | null>(null);
	const videoSourceUrl = useVideoSourceUrl(source);

	const playerFps = getPlayerFps(fps);
	const durationInFrames = getDurationInFrames({
		durationInSeconds,
		fps: playerFps,
	});
	const playerDimensions = getPlayerDimensions({
		dimensions,
		isAudio,
		rotation,
	});
	const actualInFrame =
		trim &&
		trimInFrame !== null &&
		durationInFrames &&
		trimInFrame > 0 &&
		trimInFrame <= durationInFrames - 1
			? trimInFrame
			: null;
	const actualOutFrame =
		trim && trimOutFrame !== null && durationInFrames
			? (() => {
					const minimumPreviewOutFrame = (actualInFrame ?? 0) + 1;
					const previewOutFrame = Math.max(
						trimOutFrame,
						minimumPreviewOutFrame,
					);

					return previewOutFrame < durationInFrames - 1
						? previewOutFrame
						: null;
				})()
			: null;

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

	useEffect(() => {
		const frameToSeek = trimFrameToSeekRef.current;
		if (frameToSeek === null) {
			return;
		}

		trimFrameToSeekRef.current = null;
		playerRef.current?.seekTo(frameToSeek);
	}, [trimInFrame, trimOutFrame]);

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
						inputProps={{
							src: videoSourceUrl,
							isAudio,
							waveform,
							rotation,
							mirrorHorizontal,
							mirrorVertical,
						}}
						durationInFrames={durationInFrames}
						compositionWidth={playerDimensions.width}
						compositionHeight={playerDimensions.height}
						fps={playerFps}
						inFrame={actualInFrame}
						outFrame={actualOutFrame}
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
				{!isAudio && crop && playerDimensions ? (
					<CropUI
						setUnclampedRect={setUnclampedRect}
						unclampedRect={unclampedRect}
						dimensions={playerDimensions}
					/>
				) : null}
			</div>
			{!isAudio &&
			trim &&
			videoSourceUrl &&
			durationInSeconds &&
			durationInFrames ? (
				<Filmstrip
					src={videoSourceUrl}
					durationInSeconds={durationInSeconds}
					durationInFrames={durationInFrames}
					inFrame={trimInFrame}
					outFrame={trimOutFrame}
					onTrim={(nextTrim, seekToFrame) => {
						trimFrameToSeekRef.current = seekToFrame;
						setTrimInFrame(nextTrim.inFrame);
						setTrimOutFrame(nextTrim.outFrame);
					}}
				/>
			) : null}
		</div>
	);
}
