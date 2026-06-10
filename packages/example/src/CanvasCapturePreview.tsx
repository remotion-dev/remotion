import {Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	CalculateMetadataFunction,
	Img,
	Interactive,
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
	readonly cursorAssetBasePath: string | null;
	readonly cursorData?: CursorRecording;
	width: number | null;
	height: number | null;
};

export const canvasCapturePreviewDefaultProps: CanvasCapturePreviewProps = {
	videoFile: 'https://remotion.media/remotion-studio-canvas-recording.webm',
	cursorFile: 'remotion-studio-canvas-recording.json',
	cursorScale: 3,
	cursorOffsetX: 0,
	cursorOffsetY: 0,
	cursorAssetBasePath: 'https://remotion.media/mac-cursors',
};

const macCursorFilenameByCssValue: Record<string, string | null> = {
	alias: 'makealias.svg',
	'all-scroll': 'move.svg',
	auto: 'default.svg',
	beachball: 'beachball.svg',
	busy: 'busy.svg',
	cell: 'cell.svg',
	'col-resize': 'resizeleftright.svg',
	'context-menu': 'contextualmenu.svg',
	contextualmenu: 'contextualmenu.svg',
	copy: 'copy.svg',
	crosshair: 'cross.svg',
	cross: 'cross.svg',
	default: 'default.svg',
	'e-resize': 'resizeeast.svg',
	'ew-resize': 'resizeleftright.svg',
	grab: 'handopen.svg',
	grabbing: 'handgrabbing.svg',
	handgrabbing: 'handgrabbing.svg',
	handopen: 'handopen.svg',
	handpointing: 'handpointing.svg',
	help: 'help.svg',
	makealias: 'makealias.svg',
	move: 'move.svg',
	'n-resize': 'resizenorth.svg',
	'ne-resize': 'resizenortheast.svg',
	'nesw-resize': 'resizenortheastsouthwest.svg',
	'no-drop': 'notallowed.svg',
	none: null,
	'not-allowed': 'notallowed.svg',
	'ns-resize': 'resizenorthsouth.svg',
	'nw-resize': 'resizenorthwest.svg',
	'nwse-resize': 'resizenorthwestsoutheast.svg',
	pointer: 'handpointing.svg',
	poof: 'poof.svg',
	progress: 'busy.svg',
	'resize northsouth': 'resize northsouth.svg',
	resizedown: 'resizedown.svg',
	resizeeast: 'resizeeast.svg',
	resizeleft: 'resizeleft.svg',
	resizeleftright: 'resizeleftright.svg',
	resizenorth: 'resizenorth.svg',
	resizenortheast: 'resizenortheast.svg',
	resizenortheastsouthwest: 'resizenortheastsouthwest.svg',
	resizenorthsouth: 'resizenorthsouth.svg',
	resizenorthwest: 'resizenorthwest.svg',
	resizenorthwestsoutheast: 'resizenorthwestsoutheast.svg',
	resizeright: 'resizeright.svg',
	resizesouth: 'resizesouth.svg',
	resizesoutheast: 'resizesoutheast.svg',
	resizesouthwest: 'resizesouthwest.svg',
	resizeup: 'resizeup.svg',
	resizeupdown: 'resizeupdown.svg',
	resizewest: 'resizewest.svg',
	resizewesteast: 'resizewesteast.svg',
	'row-resize': 'resizenorthsouth.svg',
	's-resize': 'resizesouth.svg',
	screenshotselection: 'screenshotselection.svg',
	screenshotwindow: 'screenshotwindow.svg',
	'se-resize': 'resizesoutheast.svg',
	'sw-resize': 'resizesouthwest.svg',
	text: 'textcursor.svg',
	textcursor: 'textcursor.svg',
	textcursorvertical: 'textcursorvertical.svg',
	'vertical-text': 'textcursorvertical.svg',
	'w-resize': 'resizewest.svg',
	wait: 'busy.svg',
	'zoom-in': 'zoomin.svg',
	'zoom-out': 'zoomout.svg',
};

type CursorHotspot = {
	readonly x: number;
	readonly y: number;
};

const macCursorHotspotByFilename: Record<string, CursorHotspot> = {
	'resize northsouth.svg': {x: 10, y: 8},
	'beachball.svg': {x: 6, y: 6},
	'busy.svg': {x: 1, y: 14},
	'cell.svg': {x: 9, y: 9},
	'contextualmenu.svg': {x: 8, y: 7},
	'copy.svg': {x: 1, y: 14},
	'cross.svg': {x: 9, y: 9},
	'default.svg': {x: 10, y: 7},
	'handgrabbing.svg': {x: 8, y: 9},
	'handopen.svg': {x: 7, y: 6},
	'handpointing.svg': {x: 9, y: 8},
	'help.svg': {x: 12, y: 10},
	'makealias.svg': {x: 10, y: 9},
	'move.svg': {x: 8, y: 8},
	'notallowed.svg': {x: 7, y: 0},
	'poof.svg': {x: 7, y: 0},
	'resizedown.svg': {x: 8, y: 11},
	'resizeeast.svg': {x: 10, y: 10},
	'resizeleft.svg': {x: 11, y: 8},
	'resizeleftright.svg': {x: 7, y: 8},
	'resizenorth.svg': {x: 10, y: 10},
	'resizenortheast.svg': {x: 11, y: 11},
	'resizenortheastsouthwest.svg': {x: 9, y: 9},
	'resizenorthsouth.svg': {x: 10, y: 8},
	'resizenorthwest.svg': {x: 11, y: 11},
	'resizenorthwestsoutheast.svg': {x: 9, y: 9},
	'resizeright.svg': {x: 11, y: 8},
	'resizesouth.svg': {x: 10, y: 10},
	'resizesoutheast.svg': {x: 11, y: 11},
	'resizesouthwest.svg': {x: 11, y: 11},
	'resizeup.svg': {x: 8, y: 10},
	'resizeupdown.svg': {x: 8, y: 7},
	'resizewest.svg': {x: 10, y: 10},
	'resizewesteast.svg': {x: 8, y: 10},
	'screenshotselection.svg': {x: 5, y: 5},
	'screenshotwindow.svg': {x: 5, y: 7},
	'textcursor.svg': {x: 13, y: 8},
	'textcursorvertical.svg': {x: 12, y: 24},
	'zoomin.svg': {x: 8, y: 8},
	'zoomout.svg': {x: 8, y: 8},
};

const macCursorSvgScale = 3.23;

const resolveAsset = (src: string) => {
	return src.startsWith('http://') || src.startsWith('https://')
		? src
		: staticFile(src);
};

const resolveCursorAsset = (basePath: string, filename: string) => {
	const normalizedBasePath = basePath.endsWith('/')
		? basePath.slice(0, -1)
		: basePath;

	return normalizedBasePath.startsWith('http://') ||
		normalizedBasePath.startsWith('https://')
		? `${normalizedBasePath}/${encodeURIComponent(filename)}`
		: staticFile(`${normalizedBasePath}/${filename}`);
};

const getNormalizedCursor = (cursor: string) => {
	return cursor.split(',').at(-1)?.trim().toLowerCase() ?? 'auto';
};

const getMacCursorFilename = (cursor: string) => {
	return (
		macCursorFilenameByCssValue[getNormalizedCursor(cursor)] ?? 'default.svg'
	);
};

const getMacCursorHotspot = (filename: string) => {
	const hotspot = macCursorHotspotByFilename[filename];

	if (!hotspot) {
		throw new Error(`Missing hotspot for Mac cursor asset: ${filename}`);
	}

	return hotspot;
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
	readonly cursorAssetBasePath: string | null;
	readonly cursor: string;
	readonly scale: number;
}> = ({cursor, cursorAssetBasePath, scale}) => {
	const macCursorFilename = getMacCursorFilename(cursor);

	if (macCursorFilename === null) {
		return null;
	}

	if (cursorAssetBasePath) {
		const hotspot = getMacCursorHotspot(macCursorFilename);

		return (
			<Img
				src={resolveCursorAsset(cursorAssetBasePath, macCursorFilename)}
				style={{
					display: 'block',
					height: 32 * scale,
					marginLeft: -hotspot.x * scale,
					marginTop: -hotspot.y * scale,
					scale: macCursorSvgScale,
					transformOrigin: `${hotspot.x * scale}px ${hotspot.y * scale}px`,
					width: 32 * scale,
				}}
			/>
		);
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
	readonly cursorAssetBasePath: string | null;
	readonly cursorData: CursorRecording;
	readonly cursorOffsetX: number;
	readonly cursorOffsetY: number;
	readonly cursorScale: number;
}> = ({
	cursorAssetBasePath,
	cursorData,
	cursorOffsetX,
	cursorOffsetY,
	cursorScale,
}) => {
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
			<CursorGlyph
				cursor={cursor.cursor}
				cursorAssetBasePath={cursorAssetBasePath}
				scale={scale}
			/>
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
		width: 1920,
		height: 1080,
		props: {
			...props,
			cursorData,
			width: dimensions.width,
			height: dimensions.height,
		},
	};
};

export const CanvasCapturePreview: React.FC<CanvasCapturePreviewProps> = ({
	cursorAssetBasePath,
	cursorData,
	cursorFile,
	cursorOffsetX,
	cursorOffsetY,
	cursorScale,
	videoFile,
	width,
	height,
}) => {
	if (!cursorData) {
		throw new Error(`Cursor data from ${cursorFile} was not loaded.`);
	}

	if (!Number.isFinite(cursorScale) || cursorScale <= 0) {
		throw new Error('Cursor scale must be greater than 0.');
	}

	return (
		<AbsoluteFill style={{backgroundColor: 'black', overflow: 'hidden'}}>
			<Interactive.Div
				style={{
					position: 'absolute',
					width: width!,
					height: height!,
					scale: 2.895791,
					translate: '388.1px -2436px',
				}}
			>
				<Video
					src={resolveAsset(videoFile)}
					showInTimeline={false}
					style={{
						width: width!,
						height: height!,
					}}
				/>
				<CursorOverlay
					cursorAssetBasePath={cursorAssetBasePath}
					cursorData={cursorData}
					cursorOffsetX={cursorOffsetX}
					cursorOffsetY={cursorOffsetY}
					cursorScale={cursorScale}
				/>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
