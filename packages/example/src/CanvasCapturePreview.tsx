import {Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	CalculateMetadataFunction,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {getMediaMetadata} from './get-media-metadata';

type MouseMovement = {
	readonly timeInSeconds: number;
	readonly clientX: number;
	readonly clientY: number;
	readonly pageX: number;
	readonly pageY: number;
	readonly canvasX?: number | null;
	readonly canvasY?: number | null;
	readonly cursor: string;
};

type CursorRecording = {
	readonly startedAt: number;
	readonly endedAt: number;
	readonly captureMetadata?: {
		readonly density: number;
		readonly contentRect: {
			readonly left: number;
			readonly top: number;
			readonly width: number;
			readonly height: number;
		};
		readonly canvasSize: {
			readonly width: number;
			readonly height: number;
		};
	} | null;
	readonly mouseMovements: MouseMovement[];
};

export type CanvasCapturePreviewProps = {
	readonly videoFile: string;
	readonly cursorFile: string;
	readonly cursorScale: number;
	readonly cursorOffsetX: number;
	readonly cursorOffsetY: number;
	readonly cursorData?: CursorRecording;
};

export const canvasCapturePreviewDefaultProps: CanvasCapturePreviewProps = {
	videoFile: 'https://remotion.media/remotion-studio-canvas-recording.webm',
	cursorFile: 'remotion-studio-canvas-recording.json',
	cursorScale: 3,
	cursorOffsetX: 0,
	cursorOffsetY: 0,
};

const resolveAsset = (src: string) => {
	return src.startsWith('http://') || src.startsWith('https://')
		? src
		: staticFile(src);
};

const findCursorAtTime = (
	mouseMovements: readonly MouseMovement[],
	timeInSeconds: number,
) => {
	let low = 0;
	let high = mouseMovements.length - 1;
	let latest: MouseMovement | null = null;

	while (low <= high) {
		const middle = Math.floor((low + high) / 2);
		const movement = mouseMovements[middle];

		if (movement.timeInSeconds <= timeInSeconds) {
			latest = movement;
			low = middle + 1;
		} else {
			high = middle - 1;
		}
	}

	return latest;
};

const ArrowCursor: React.FC<{readonly scale: number}> = ({scale}) => {
	const size = 24 * scale;

	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			style={{
				display: 'block',
				overflow: 'visible',
				transform: `translate(${-4 * scale}px, ${-2 * scale}px)`,
			}}
		>
			<path
				d="M4 2L18 15H10L7 22L4 20L7 14H2L4 2Z"
				fill="white"
				stroke="black"
				strokeLinejoin="round"
				strokeWidth={1.75}
			/>
		</svg>
	);
};

const TextCursor: React.FC<{readonly scale: number}> = ({scale}) => {
	const height = 28 * scale;

	return (
		<div
			style={{
				width: 2 * scale,
				height,
				backgroundColor: 'white',
				borderLeft: `${Math.max(1, scale)}px solid black`,
				borderRight: `${Math.max(1, scale)}px solid black`,
				transform: `translate(${-scale}px, ${-height / 2}px)`,
			}}
		/>
	);
};

const ResizeCursor: React.FC<{
	readonly scale: number;
	readonly direction: 'horizontal' | 'vertical';
}> = ({direction, scale}) => {
	const size = 26 * scale;
	const rotation = direction === 'horizontal' ? 90 : 0;

	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 26 26"
			style={{
				display: 'block',
				overflow: 'visible',
				transform: `translate(${-size / 2}px, ${-size / 2}px) rotate(${rotation}deg)`,
			}}
		>
			<path
				d="M13 2L18 8H14V18H18L13 24L8 18H12V8H8L13 2Z"
				fill="white"
				stroke="black"
				strokeLinejoin="round"
				strokeWidth={1.75}
			/>
		</svg>
	);
};

const CursorGlyph: React.FC<{
	readonly cursor: string;
	readonly scale: number;
}> = ({cursor, scale}) => {
	if (cursor === 'none') {
		return null;
	}

	if (cursor.includes('text')) {
		return <TextCursor scale={scale} />;
	}

	if (cursor === 'row-resize' || cursor === 'ns-resize') {
		return <ResizeCursor direction="vertical" scale={scale} />;
	}

	if (cursor === 'col-resize' || cursor === 'ew-resize') {
		return <ResizeCursor direction="horizontal" scale={scale} />;
	}

	return <ArrowCursor scale={scale} />;
};

const CursorOverlay: React.FC<{
	readonly cursorData: CursorRecording;
	readonly cursorOffsetX: number;
	readonly cursorOffsetY: number;
	readonly cursorScale: number;
}> = ({cursorData, cursorOffsetX, cursorOffsetY, cursorScale}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cursor = findCursorAtTime(cursorData.mouseMovements, frame / fps);

	if (!cursor) {
		return null;
	}

	const metadata = cursorData.captureMetadata;
	const scale = metadata?.density ?? cursorScale;
	const x =
		typeof cursor.canvasX === 'number'
			? cursor.canvasX
			: metadata
				? (cursor.clientX - metadata.contentRect.left) * metadata.density
				: (cursor.pageX - cursorOffsetX) * cursorScale;
	const y =
		typeof cursor.canvasY === 'number'
			? cursor.canvasY
			: metadata
				? (cursor.clientY - metadata.contentRect.top) * metadata.density
				: (cursor.pageY - cursorOffsetY) * cursorScale;

	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				transform: `translate(${x}px, ${y}px)`,
				pointerEvents: 'none',
			}}
		>
			<CursorGlyph cursor={cursor.cursor} scale={scale} />
		</div>
	);
};

export const calculateCanvasCapturePreviewMetadata: CalculateMetadataFunction<
	CanvasCapturePreviewProps
> = async ({props}) => {
	const fps = 30;
	const videoSrc = resolveAsset(props.videoFile);
	const [{durationInSeconds, dimensions}, cursorData] = await Promise.all([
		getMediaMetadata(videoSrc),
		fetch(staticFile(props.cursorFile)).then((res) => {
			if (!res.ok) {
				throw new Error(`Could not load cursor data: ${res.status}`);
			}

			return res.json() as Promise<CursorRecording>;
		}),
	]);

	if (!dimensions) {
		throw new Error('Could not determine canvas capture video dimensions.');
	}

	return {
		durationInFrames: Math.ceil(durationInSeconds * fps),
		fps,
		width: dimensions.width,
		height: dimensions.height,
		props: {
			...props,
			cursorData,
		},
	};
};

export const CanvasCapturePreview: React.FC<CanvasCapturePreviewProps> = ({
	cursorData,
	cursorFile,
	cursorOffsetX,
	cursorOffsetY,
	cursorScale,
	videoFile,
}) => {
	if (!cursorData) {
		throw new Error(`Cursor data from ${cursorFile} was not loaded.`);
	}

	if (!Number.isFinite(cursorScale) || cursorScale <= 0) {
		throw new Error('Cursor scale must be greater than 0.');
	}

	return (
		<AbsoluteFill style={{backgroundColor: 'black', overflow: 'hidden'}}>
			<Video
				src={resolveAsset(videoFile)}
				objectFit="fill"
				style={{
					width: '100%',
					height: '100%',
				}}
			/>
			<CursorOverlay
				cursorData={cursorData}
				cursorOffsetX={cursorOffsetX}
				cursorOffsetY={cursorOffsetY}
				cursorScale={cursorScale}
			/>
		</AbsoluteFill>
	);
};
