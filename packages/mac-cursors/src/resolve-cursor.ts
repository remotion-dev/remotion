import {cursorAssets} from './cursor-assets';

type CursorHotspot = {
	readonly x: number;
	readonly y: number;
};

export type ResolvedCursor = {
	readonly src: string;
	readonly hotspot: CursorHotspot;
	readonly width: number | null;
	readonly height: number | null;
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

export const macOSCursorNames = Object.keys(macCursorFilenameByCssValue);

const macCursorHotspotByFilename: Record<string, CursorHotspot> = {
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
	'resize northsouth.svg': {x: 16, y: 16},
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

const customCursorRegex =
	/^\s*url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)(?:\s+([-+]?(?:\d+\.?\d*|\.\d+))\s+([-+]?(?:\d+\.?\d*|\.\d+)))?/;

const getSvgDimensions = (
	src: string,
): {readonly width: number; readonly height: number} | null => {
	const dataUri = src.match(/^data:image\/svg\+xml([^,]*),(.*)$/i);
	if (!dataUri) {
		return null;
	}

	try {
		const svg = dataUri[1]?.includes(';base64')
			? atob(dataUri[2] ?? '')
			: decodeURIComponent(dataUri[2] ?? '');
		const openingTag = svg.match(/<svg\b[^>]*>/i)?.[0];
		if (!openingTag) {
			return null;
		}

		const width = Number(
			openingTag.match(
				/\bwidth\s*=\s*["']\s*(\d+(?:\.\d+)?)\s*(?:px)?\s*["']/i,
			)?.[1],
		);
		const height = Number(
			openingTag.match(
				/\bheight\s*=\s*["']\s*(\d+(?:\.\d+)?)\s*(?:px)?\s*["']/i,
			)?.[1],
		);
		if (width > 0 && height > 0) {
			return {width, height};
		}
	} catch {
		return null;
	}

	return null;
};

export const resolveCursor = (cursor: string): ResolvedCursor | null => {
	const customCursor = cursor.match(customCursorRegex);
	if (customCursor) {
		const customSrc = customCursor[1] ?? customCursor[2] ?? customCursor[3];
		const dimensions = getSvgDimensions(customSrc);
		return {
			src: customSrc,
			hotspot: {
				x: Number(customCursor[4] ?? 0),
				y: Number(customCursor[5] ?? 0),
			},
			width: dimensions?.width ?? null,
			height: dimensions?.height ?? null,
		};
	}

	const normalizedCursor =
		cursor.split(',').at(-1)?.trim().toLowerCase() ?? 'auto';
	const filename = macCursorFilenameByCssValue[normalizedCursor];
	if (filename === null) {
		return null;
	}

	const resolvedFilename = filename ?? 'default.svg';
	const hotspot = macCursorHotspotByFilename[resolvedFilename];
	const src = cursorAssets[resolvedFilename];
	if (!hotspot || !src) {
		throw new Error(`Missing macOS cursor asset: ${resolvedFilename}`);
	}

	return {src, hotspot, width: 32, height: 32};
};
