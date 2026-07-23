import {Video} from '@remotion/media';
import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import React from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {
	AbsoluteFill,
	Img,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';

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

type PointerClick = {
	readonly timeInSeconds: number;
	readonly type: 'pointer-down' | 'pointer-up';
};

type CursorRecording = {
	readonly startedAt: number;
	readonly endedAt: number;
	readonly captureMetadata: CaptureMetadata;
	readonly mouseMovements: MouseMovement[];
	readonly pointerClicks?: PointerClick[];
};

export const canvasCapturePreviewSchema = z.object({
	videoFile: z.string(),
	cursorScale: z.number(),
	hidden: z.enum(['cursor', 'screen']).nullable(),
});

export type CanvasCapturePreviewProps = z.infer<
	typeof canvasCapturePreviewSchema
> & {
	readonly cursorData?: CursorRecording | null;
	readonly width: number | null;
	readonly height: number | null;
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
			}}
			from={-64}
		/>
	);
};

export const CursorGlyph: React.FC<{
	readonly cursor: string;
	readonly scale: number;
	readonly cursorScale: number;
}> = ({cursor, scale: _scale, cursorScale}) => {
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
	const hotspot = getMacCursorHotspot(macCursorFilename);

	return (
		<CursorImg
			src={resolveCursorAsset(CURSOR_ASSET_BASE_PATH, macCursorFilename)}
			hotspotX={hotspot.x}
			hotspotY={hotspot.y}
			cursorScale={cursorScale}
		/>
	);
};

const CLICK_SCALE = 0.9;

const isPointerDown = (
	pointerClicks: readonly PointerClick[] | undefined,
	timeInSeconds: number,
) => {
	if (!pointerClicks) {
		return false;
	}

	let down = false;
	for (const click of pointerClicks) {
		if (click.timeInSeconds > timeInSeconds) {
			break;
		}

		down = click.type === 'pointer-down';
	}

	return down;
};

const CursorOverlay: React.FC<{
	readonly cursorData: CursorRecording;
	readonly cursorScale: number;
}> = ({cursorData, cursorScale}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const timeInSeconds = frame / fps;
	const cursor = findCursorAtTime(cursorData.mouseMovements, timeInSeconds);

	if (!cursor || cursor.canvasX === null || cursor.canvasY === null) {
		return null;
	}

	const scale = cursorData.captureMetadata.density;
	const clickScale = isPointerDown(cursorData.pointerClicks, timeInSeconds)
		? CLICK_SCALE
		: 1;
	const x = cursor.canvasX;
	const y = cursor.canvasY;

	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				transform: `translate(${x}px, ${y}px) scale(${clickScale})`,
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

const CAPTURE_METADATA_TAG_KEY = 'REMOTION_CAPTURE_DATA';

export const calculateCanvasCapturePreviewMetadata: CalculateMetadataFunction<
	CanvasCapturePreviewProps
> = async ({props}) => {
	const fps = 30;
	const videoSrc = props.videoFile;

	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(videoSrc, {
			getRetryDelay: () => null,
		}),
	});

	const [durationInSeconds, videoTrack, tags] = await Promise.all([
		input.computeDuration(),
		input.getPrimaryVideoTrack(),
		input.getMetadataTags(),
	]);

	const dimensions = videoTrack
		? {
				width: await videoTrack.getDisplayWidth(),
				height: await videoTrack.getDisplayHeight(),
			}
		: null;

	const rawCaptureData = tags.raw?.[CAPTURE_METADATA_TAG_KEY];
	const cursorData =
		typeof rawCaptureData === 'string'
			? (JSON.parse(rawCaptureData) as CursorRecording)
			: null;

	if (!dimensions) {
		throw new Error('Could not determine canvas capture video dimensions.');
	}

	return {
		width: dimensions.width,
		height: dimensions.height,
		durationInFrames: Math.ceil(durationInSeconds * fps),
		fps,
		defaultCodec: 'prores',
		defaultProResProfile: '4444',
		defaultPixelFormat: 'yuva444p10le',
		defaultVideoImageFormat: 'png',
		props: {
			...props,
			cursorData,
			width: dimensions.width,
			height: dimensions.height,
		},
	};
};

export const CanvasCapturePreview: React.FC<CanvasCapturePreviewProps> = ({
	cursorData,
	cursorScale,
	videoFile,
	width,
	height,
	hidden,
}) => {
	const showScreen = hidden !== 'screen';
	const showCursor = hidden !== 'cursor';

	return (
		<AbsoluteFill>
			{showScreen ? (
				<Video
					src={videoFile}
					style={{
						width: width!,
						height: height!,
					}}
				/>
			) : null}
			{showCursor && cursorData ? (
				<CursorOverlay cursorData={cursorData} cursorScale={cursorScale} />
			) : null}
		</AbsoluteFill>
	);
};
