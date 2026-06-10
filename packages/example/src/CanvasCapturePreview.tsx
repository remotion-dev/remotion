import {Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	CalculateMetadataFunction,
	Html5Video,
	Img,
	Interactive,
	Solid,
	staticFile,
	useCurrentFrame,
	useRemotionEnvironment,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {getMediaMetadata} from './get-media-metadata';

type MouseMovement = {
	readonly timeInSeconds: number;
	readonly clientX: number;
	readonly clientY: number;
	readonly pageX: number;
	readonly pageY: number;
	readonly canvasX: number | null;
	readonly canvasY: number | null;
	readonly cursor: string;
};

type CaptureMetadata = {
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
	readonly viewport: {
		readonly width: number;
		readonly height: number;
		readonly scrollX: number;
		readonly scrollY: number;
	};
};

type CursorRecording = {
	readonly startedAt: number;
	readonly endedAt: number;
	readonly captureMetadata: CaptureMetadata;
	readonly mouseMovements: MouseMovement[];
};

export const canvasCapturePreviewSchema = z.object({
	videoFile: z.string(),
	cursorFile: z.string(),
	cursorScale: z.number(),
});

export type CanvasCapturePreviewProps = z.infer<
	typeof canvasCapturePreviewSchema
> & {
	readonly cursorData?: CursorRecording;
	width: number | null;
	height: number | null;
};

const CURSOR_ASSET_BASE_PATH = 'https://remotion.media/mac-cursors';

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

// Derived from the official macOS cursor hotspots (HIServices cursor
// resources + NSCursor), mapped into the 32x32 viewBox of each SVG.
const macCursorHotspotByFilename: Record<string, CursorHotspot> = {
	'resize northsouth.svg': {x: 16, y: 16},
	'beachball.svg': {x: 16, y: 16},
	'busy.svg': {x: 8, y: 3},
	'cell.svg': {x: 16, y: 16},
	'contextualmenu.svg': {x: 9, y: 10},
	'copy.svg': {x: 8, y: 3},
	'cross.svg': {x: 16, y: 16},
	'default.svg': {x: 10, y: 9},
	'handgrabbing.svg': {x: 15, y: 14},
	'handopen.svg': {x: 15, y: 14},
	'handpointing.svg': {x: 14, y: 8},
	'help.svg': {x: 16, y: 17},
	'makealias.svg': {x: 18, y: 10},
	'move.svg': {x: 16, y: 16},
	'notallowed.svg': {x: 8, y: 3},
	'poof.svg': {x: 8, y: 3},
	'resizedown.svg': {x: 16, y: 15},
	'resizeeast.svg': {x: 15, y: 16},
	'resizeleft.svg': {x: 19, y: 16},
	'resizeleftright.svg': {x: 16, y: 16},
	'resizenorth.svg': {x: 16, y: 18},
	'resizenortheast.svg': {x: 15, y: 18},
	'resizenortheastsouthwest.svg': {x: 16, y: 16},
	'resizenorthsouth.svg': {x: 16, y: 16},
	'resizenorthwest.svg': {x: 18, y: 18},
	'resizenorthwestsoutheast.svg': {x: 16, y: 16},
	'resizeright.svg': {x: 14, y: 16},
	'resizesouth.svg': {x: 16, y: 15},
	'resizesoutheast.svg': {x: 15, y: 14},
	'resizesouthwest.svg': {x: 18, y: 14},
	'resizeup.svg': {x: 16, y: 18},
	'resizeupdown.svg': {x: 16, y: 16},
	'resizewest.svg': {x: 18, y: 16},
	'resizewesteast.svg': {x: 16, y: 17},
	'screenshotselection.svg': {x: 16.5, y: 16.5},
	'screenshotwindow.svg': {x: 16, y: 16},
	'textcursor.svg': {x: 16.5, y: 16},
	'textcursorvertical.svg': {x: 16.5, y: 15.5},
	'zoomin.svg': {x: 14, y: 14},
	'zoomout.svg': {x: 14, y: 14},
};

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

type UrlCursor = {
	readonly url: string;
	readonly hotspotX: number;
	readonly hotspotY: number;
};

// Parses the first url(...) entry from a CSS cursor value, e.g.:
//   url("data:image/svg+xml,...") 12 12, alias
const parseUrlCursor = (cursor: string): UrlCursor | null => {
	const match = cursor.match(
		/^url\(["']([^"']+)["']\)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/,
	);
	if (!match) return null;
	return {
		url: match[1],
		hotspotX: Number(match[2]),
		hotspotY: Number(match[3]),
	};
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
	readonly cursor: string;
	readonly scale: number;
	readonly cursorScale: number;
}> = ({cursor, scale, cursorScale}) => {
	const urlCursor = parseUrlCursor(cursor);

	if (urlCursor) {
		return (
			<CursorImg
				src={urlCursor.url}
				hotspotX={urlCursor.hotspotX}
				hotspotY={urlCursor.hotspotY}
				cursorScale={cursorScale}
			/>
		);
	}

	const macCursorFilename = getMacCursorFilename(cursor);

	if (macCursorFilename === null) {
		return null;
	}

	if (CURSOR_ASSET_BASE_PATH) {
		const hotspot = getMacCursorHotspot(macCursorFilename);

		return (
			<CursorImg
				src={resolveCursorAsset(CURSOR_ASSET_BASE_PATH, macCursorFilename)}
				hotspotX={hotspot.x}
				hotspotY={hotspot.y}
				cursorScale={cursorScale}
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

const CursorImg: React.FC<{
	readonly src: string;
	readonly hotspotX: number;
	readonly hotspotY: number;
	readonly cursorScale: number;
}> = ({src, hotspotX, hotspotY, cursorScale}) => {
	return (
		<Img
			src={src}
			style={{
				display: 'block',
				height: 32,
				marginLeft: -hotspotX,
				marginTop: -hotspotY,
				transformOrigin: `${hotspotX}px ${hotspotY}px`,
				width: 32,
				position: 'absolute',
				scale: cursorScale,
				translate: '0px -0.5px',
			}}
		/>
	);
};

const CursorOverlay: React.FC<{
	readonly cursorData: CursorRecording;
	readonly cursorScale: number;
}> = ({cursorData, cursorScale}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cursor = findCursorAtTime(cursorData.mouseMovements, frame / fps);

	if (!cursor || cursor.canvasX === null || cursor.canvasY === null) {
		return null;
	}

	const scale = cursorData.captureMetadata.density;
	const x = cursor.canvasX;
	const y = cursor.canvasY;

	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				transform: `translate(${x}px, ${y}px)`,
				pointerEvents: 'none',
				height: 32,
				width: 32,
			}}
		>
			<CursorGlyph
				cursor={cursor.cursor}
				scale={scale}
				cursorScale={cursorScale}
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
		props: {
			...props,
			cursorData,
			width: dimensions.width,
			height: dimensions.height,
		},
	};
};

const CanvasCaptureInner: React.FC<{
	readonly videoFile: string;
	readonly cursorFile: string;
	readonly cursorData: CursorRecording;
	readonly cursorScale: number;
	readonly width: number;
	readonly height: number;
}> = ({videoFile, cursorData, cursorScale, width, height}) => {
	const isStudio = useRemotionEnvironment().isStudio;
	return (
		<>
			{!isStudio ? (
				<Html5Video
					src={resolveAsset(videoFile)}
					showInTimeline={false}
					style={{
						width,
						height,
					}}
				/>
			) : (
				<Video
					src={resolveAsset(videoFile)}
					showInTimeline={false}
					style={{
						width,
						height,
					}}
				/>
			)}

			<CursorOverlay cursorData={cursorData} cursorScale={cursorScale} />
		</>
	);
};

export const ClickStar: React.FC<CanvasCapturePreviewProps> = ({
	cursorData,
	cursorFile,
	cursorScale,
	videoFile,
	width,
	height,
}) => {
	if (!cursorData) {
		throw new Error(`Cursor data from ${cursorFile} was not loaded.`);
	}

	return (
		<AbsoluteFill style={{backgroundColor: 'black', overflow: 'hidden'}}>
			<Interactive.Div
				style={{
					position: 'absolute',
					width: width!,
					height: height!,
					translate: '-1856.2px -1020.9px',
					scale: 0.55,
				}}
			>
				<CanvasCaptureInner
					videoFile={videoFile}
					cursorFile={cursorFile}
					cursorData={cursorData}
					cursorScale={cursorScale}
					width={width!}
					height={height!}
				/>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const StarRadius: React.FC<CanvasCapturePreviewProps> = ({
	cursorData,
	cursorFile,
	cursorScale,
	videoFile,
	width,
	height,
}) => {
	if (!cursorData) {
		throw new Error(`Cursor data from ${cursorFile} was not loaded.`);
	}

	return (
		<AbsoluteFill style={{backgroundColor: 'black', overflow: 'hidden'}}>
			<Solid
				width={1080}
				height={1350}
				style={{
					position: 'absolute',
				}}
				color={'#1e2527'}
			/>
			<Interactive.Div
				style={{
					position: 'absolute',
					width: width!,
					height: height!,
					translate: '-241.7px -396.2px',
					scale: 0.729009,
				}}
			>
				<CanvasCaptureInner
					videoFile={videoFile}
					cursorFile={cursorFile}
					cursorData={cursorData}
					cursorScale={cursorScale}
					width={width!}
					height={height!}
				/>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const StarColor: React.FC<CanvasCapturePreviewProps> = ({
	cursorData,
	cursorFile,
	cursorScale,
	videoFile,
	width,
	height,
}) => {
	if (!cursorData) {
		throw new Error(`Cursor data from ${cursorFile} was not loaded.`);
	}

	return (
		<AbsoluteFill style={{backgroundColor: 'black', overflow: 'hidden'}}>
			<Interactive.Div
				style={{
					position: 'absolute',
					width: width!,
					height: height!,
					translate: '-1850.8px -982.4px',
					scale: 0.455842,
				}}
			>
				<CanvasCaptureInner
					videoFile={videoFile}
					cursorFile={cursorFile}
					cursorData={cursorData}
					cursorScale={cursorScale}
					width={width!}
					height={height!}
				/>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
