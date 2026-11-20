import {NoReactInternals} from 'remotion/no-react';
import {getNarrowerRect} from './clamp-rect-to-parent-bounds';
import {transformDOMRect} from './transform-rect-with-matrix';

const isValidColor = (color: string): boolean => {
	try {
		const result = NoReactInternals.processColor(color);
		return result !== null && result !== undefined;
	} catch {
		return false;
	}
};

export interface ColorStop {
	color: string; // Normalized CSS color
	position: number; // Fraction of the gradient line, may be outside 0-1
}

export interface UnresolvedColorStop {
	color: string;
	position: {value: number; unit: '%' | 'px'} | null;
}

export interface LinearGradientInfo {
	angle: number; // Degrees, 0 = to top, 90 = to right, 180 = to bottom, 270 = to left
	colorStops: UnresolvedColorStop[];
}

const parseDirection = (directionStr: string): number => {
	const trimmed = directionStr.trim().toLowerCase();

	// Handle keywords like "to right", "to bottom", etc.
	if (trimmed.startsWith('to ')) {
		const direction = trimmed.substring(3).trim();
		switch (direction) {
			case 'top':
				return 0;
			case 'right':
				return 90;
			case 'bottom':
				return 180;
			case 'left':
				return 270;
			case 'top right':
			case 'right top':
				return 45;
			case 'bottom right':
			case 'right bottom':
				return 135;
			case 'bottom left':
			case 'left bottom':
				return 225;
			case 'top left':
			case 'left top':
				return 315;
			default:
				return 180; // Default to bottom
		}
	}

	// Handle angle values: deg, rad, grad, turn
	const angleMatch = trimmed.match(/^(-?\d+\.?\d*)(deg|rad|grad|turn)$/);
	if (angleMatch) {
		const value = parseFloat(angleMatch[1]);
		const unit = angleMatch[2];

		switch (unit) {
			case 'deg':
				return value;
			case 'rad':
				return (value * 180) / Math.PI;
			case 'grad':
				return (value * 360) / 400;
			case 'turn':
				return value * 360;
			default:
				return value;
		}
	}

	// Default: to bottom
	return 180;
};

const cssColorToRgba = (
	color: string,
): {r: number; g: number; b: number; a: number} | null => {
	try {
		const packed = NoReactInternals.processColor(color);
		// processColor returns ((normalizedColor << 24) | (normalizedColor >>> 8)) >>> 0
		// which is ARGB packed as a 32-bit unsigned integer
		const a = ((packed >>> 24) & 255) / 255;
		const r = (packed >>> 16) & 255;
		const g = (packed >>> 8) & 255;
		const b = packed & 255;
		return {r, g, b, a};
	} catch {
		return null;
	}
};

const isFullyTransparent = (color: string): boolean => {
	const rgba = cssColorToRgba(color);
	return rgba !== null && rgba.a === 0;
};

const findNearestNonTransparent = (
	stops: ColorStop[],
	fromIndex: number,
	direction: -1 | 1,
): string | null => {
	let i = fromIndex + direction;
	while (i >= 0 && i < stops.length) {
		if (!isFullyTransparent(stops[i].color)) {
			return stops[i].color;
		}

		i += direction;
	}

	return null;
};

const resolveTransparentStops = (stops: ColorStop[]): void => {
	for (let i = 0; i < stops.length; i++) {
		if (!isFullyTransparent(stops[i].color)) {
			continue;
		}

		// Find nearest non-transparent neighbor
		const prev = findNearestNonTransparent(stops, i, -1);
		const next = findNearestNonTransparent(stops, i, 1);
		const neighbor = prev ?? next;

		if (neighbor) {
			const rgba = cssColorToRgba(neighbor);
			if (rgba) {
				stops[i].color = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0)`;
			}
		}
	}
};

const parseColorStops = (
	colorStopsStr: string,
): UnresolvedColorStop[] | null => {
	// Split by comma, but respect parentheses in rgba(), rgb(), hsl(), hsla()
	const parts = colorStopsStr.split(/,(?![^(]*\))/);

	const stops: UnresolvedColorStop[] = [];

	for (const part of parts) {
		const trimmed = part.trim();
		if (!trimmed) continue;

		// Extract color: can be rgb(), rgba(), hsl(), hsla(), hex, or named color
		const colorMatch = trimmed.match(
			/(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-f]{3,8}|[a-z]+)/i,
		);

		if (!colorMatch) {
			continue;
		}

		const color = colorMatch[0];

		// Validate that this is actually a valid CSS color
		if (!isValidColor(color)) {
			continue;
		}

		const remaining = trimmed
			.substring(colorMatch.index! + color.length)
			.trim();

		// A stop may have up to two positions: `red 10% 30%` is `red 10%, red 30%`.
		const positions = Array.from(
			remaining.matchAll(/(-?\d*\.?\d+)(%|px)?/g),
			(match) => ({
				value: parseFloat(match[1]),
				unit: match[2] === '%' ? ('%' as const) : ('px' as const),
			}),
		);

		if (positions.length === 0) {
			stops.push({color, position: null});
		}

		for (const position of positions.slice(0, 2)) {
			stops.push({color, position});
		}
	}

	if (stops.length === 0) {
		return null;
	}

	return stops;
};

// https://drafts.csswg.org/css-images-4/#color-stop-fixup
export const resolveColorStops = (
	stops: UnresolvedColorStop[],
	gradientLength: number,
): ColorStop[] => {
	const positions = stops.map((stop) => {
		if (stop.position === null) {
			return null;
		}

		return stop.position.unit === '%'
			? stop.position.value / 100
			: gradientLength === 0
				? 0
				: stop.position.value / gradientLength;
	});

	if (positions[0] === null) {
		positions[0] = 0;
	}

	if (positions[positions.length - 1] === null) {
		positions[positions.length - 1] = 1;
	}

	let largest = -Infinity;
	for (let i = 0; i < positions.length; i++) {
		const position = positions[i];
		if (position !== null) {
			largest = Math.max(largest, position);
			positions[i] = largest;
		}
	}

	for (let i = 0; i < positions.length; i++) {
		if (positions[i] !== null) {
			continue;
		}

		const start = i - 1;
		let end = i;
		while (positions[end] === null) {
			end++;
		}

		const from = positions[start]!;
		const to = positions[end]!;
		for (let j = i; j < end; j++) {
			positions[j] = from + ((to - from) * (j - start)) / (end - start);
		}
	}

	const resolved = stops.map((stop, i) => ({
		color: stop.color,
		position: positions[i]!,
	}));

	// CSS Color Level 4: `transparent` should interpolate as the same hue
	// with zero alpha, not as rgba(0,0,0,0). Replace `transparent` stops
	// with the RGB of the nearest non-transparent neighbor at alpha 0.
	resolveTransparentStops(resolved);

	return resolved;
};

// Canvas gradients only accept stops between 0 and 1. Stretch the gradient
// line so stops outside that range keep their place.
export const getCanvasGradientRange = (stops: ColorStop[]) => {
	const start = Math.min(0, stops[0].position);
	const end = Math.max(1, stops[stops.length - 1].position);
	return {
		start,
		end,
		toCanvasOffset: (position: number) =>
			end === start ? 0 : (position - start) / (end - start),
	};
};

const extractGradientContent = (backgroundImage: string): string | null => {
	const prefix = 'linear-gradient(';
	const startIndex = backgroundImage.toLowerCase().indexOf(prefix);
	if (startIndex === -1) {
		return null;
	}

	// Find matching closing parenthesis, handling nested parens from rgb(), rgba(), etc.
	let depth = 0;
	const contentStart = startIndex + prefix.length;
	for (let i = contentStart; i < backgroundImage.length; i++) {
		const char = backgroundImage[i];
		if (char === '(') {
			depth++;
		} else if (char === ')') {
			if (depth === 0) {
				return backgroundImage.substring(contentStart, i).trim();
			}

			depth--;
		}
	}

	return null;
};

export const parseLinearGradient = (
	backgroundImage: string,
): LinearGradientInfo | null => {
	if (!backgroundImage || backgroundImage === 'none') {
		return null;
	}

	const content = extractGradientContent(backgroundImage);

	if (!content) {
		return null;
	}

	// Try to identify the direction/angle part vs color stops
	// Direction/angle is optional and comes first
	// It can be: "to right", "45deg", etc.

	// Split into parts, respecting parentheses
	const parts = content.split(/,(?![^(]*\))/);

	let angle = 180; // Default: to bottom
	let colorStopsStart = 0;

	// Check if first part is a direction/angle
	if (parts.length > 0) {
		const firstPart = parts[0].trim();
		// Check if it looks like a direction or angle (not a color)
		const isDirection =
			firstPart.startsWith('to ') ||
			/^-?\d+\.?\d*(deg|rad|grad|turn)$/.test(firstPart);

		if (isDirection) {
			angle = parseDirection(firstPart);
			colorStopsStart = 1;
		}
	}

	// Parse color stops
	const colorStopsStr = parts.slice(colorStopsStart).join(',');
	const colorStops = parseColorStops(colorStopsStr);

	if (!colorStops || colorStops.length === 0) {
		return null;
	}

	return {
		angle,
		colorStops,
	};
};

export const createCanvasGradient = ({
	ctx,
	rect,
	gradientInfo,
	offsetLeft,
	offsetTop,
	cssPixelsPerUnit,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	gradientInfo: LinearGradientInfo;
	offsetLeft: number;
	offsetTop: number;
	// How many units of `rect` make up one CSS pixel, for resolving px stops.
	cssPixelsPerUnit: number;
}): CanvasGradient => {
	// Convert angle to radians
	// CSS angles: 0deg = to top, 90deg = to right, 180deg = to bottom, 270deg = to left
	// We need to calculate the gradient line that spans the rectangle at the given angle

	const angleRad = ((gradientInfo.angle - 90) * Math.PI) / 180;

	const centerX = rect.left - offsetLeft + rect.width / 2;
	const centerY = rect.top - offsetTop + rect.height / 2;

	// Calculate gradient line endpoints
	// The gradient line passes through the center and has the specified angle
	const cos = Math.cos(angleRad);
	const sin = Math.sin(angleRad);

	// Find the intersection of the gradient line with the rectangle edges
	const halfWidth = rect.width / 2;
	const halfHeight = rect.height / 2;

	// Calculate the length from center to edge along the gradient line.
	// Primary formula should always be > 0 for valid angles and non-zero rects;
	// fall back to diagonal length only for degenerate or invalid cases.
	let length = Math.abs(cos) * halfWidth + Math.abs(sin) * halfHeight;
	if (!Number.isFinite(length) || length === 0) {
		length = Math.sqrt(halfWidth ** 2 + halfHeight ** 2);
	}

	const stops = resolveColorStops(
		gradientInfo.colorStops,
		(length * 2) / cssPixelsPerUnit,
	);
	const {start, end, toCanvasOffset} = getCanvasGradientRange(stops);

	const x0 = centerX - cos * length;
	const y0 = centerY - sin * length;
	const dx = cos * length * 2;
	const dy = sin * length * 2;

	const gradient = ctx.createLinearGradient(
		x0 + dx * start,
		y0 + dy * start,
		x0 + dx * end,
		y0 + dy * end,
	);

	for (const stop of stops) {
		gradient.addColorStop(toCanvasOffset(stop.position), stop.color);
	}

	return gradient;
};

// Bounded support shared by backgrounds and alpha masks: centered default
// farthest-corner gradients and explicitly sized percentage ellipses.
export const parseRadialGradient = (
	value: string,
	experimental3DRendering = false,
) => {
	const match = /^radial-gradient\((.*)\)$/.exec(value);
	if (!match) return null;
	const parts = match[1].split(/,(?![^(]*\))/);
	const first = parts[0].trim();
	const hasShape = parseLinearGradient(`linear-gradient(${first})`) === null;
	const percentages =
		/^(?:ellipse\s+)?([\d.]+)%\s+([\d.]+)%(?:\s+at\s+(?:center|50% 50%))?$/.exec(
			first,
		);
	if (!experimental3DRendering && percentages) return null;
	if (
		hasShape &&
		!percentages &&
		!/^(?:(?:ellipse|circle)(?: farthest-corner)?|farthest-corner)?(?:\s*at (?:center|50% 50%))?$/.test(
			first,
		)
	)
		return null;
	const stops = parseLinearGradient(
		`linear-gradient(${parts.slice(hasShape ? 1 : 0).join(',')})`,
	);
	if (!stops) return null;
	return {
		colorStops: stops.colorStops,
		circle: hasShape && first.startsWith('circle'),
		radiusX: percentages ? Number(percentages[1]) / 100 : Math.SQRT1_2,
		radiusY: percentages ? Number(percentages[2]) / 100 : Math.SQRT1_2,
	};
};

export type RadialGradientInfo = NonNullable<
	ReturnType<typeof parseRadialGradient>
>;
export const createRadialGradientFill = ({
	gradientInfo,
	cssPixelsPerUnit,
	experimental3DRendering,
	contextToDraw,
	rect,
	offsetLeft,
	offsetTop,
}: {
	gradientInfo: RadialGradientInfo;
	cssPixelsPerUnit: number;
	experimental3DRendering: boolean;
	contextToDraw: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	offsetLeft: number;
	offsetTop: number;
}) => {
	const radiusX = gradientInfo.circle
		? Math.hypot(rect.width / 2, rect.height / 2)
		: rect.width * gradientInfo.radiusX;
	const radiusY = gradientInfo.circle
		? radiusX
		: rect.height * gradientInfo.radiusY;
	if (!(radiusX > 0 && radiusY > 0)) return null;
	const targetTransform = contextToDraw.getTransform();
	const canvasViewport = transformDOMRect({
		rect: new DOMRect(
			0,
			0,
			contextToDraw.canvas.width,
			contextToDraw.canvas.height,
		),
		matrix: targetTransform.inverse(),
	});
	const positionedRect = new DOMRect(
		rect.left - offsetLeft,
		rect.top - offsetTop,
		rect.width,
		rect.height,
	);
	const crop = experimental3DRendering
		? getNarrowerRect({
				firstRect: positionedRect,
				secondRect: canvasViewport,
			})
		: positionedRect;
	if (!(crop.width > 0 && crop.height > 0)) return null;
	const densityX = Math.hypot(targetTransform.a, targetTransform.b) || 1;
	const densityY = Math.hypot(targetTransform.c, targetTransform.d) || 1;
	const width = experimental3DRendering
		? Math.max(
				1,
				Math.min(contextToDraw.canvas.width, Math.ceil(crop.width * densityX)),
			)
		: Math.ceil(rect.width);
	const height = experimental3DRendering
		? Math.max(
				1,
				Math.min(
					contextToDraw.canvas.height,
					Math.ceil(crop.height * densityY),
				),
			)
		: Math.ceil(rect.height);
	const canvas = new OffscreenCanvas(width, height);
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Could not get radial gradient context');
	if (experimental3DRendering)
		ctx.scale(width / crop.width, height / crop.height);
	const centerX = positionedRect.left + rect.width / 2;
	const centerY = positionedRect.top + rect.height / 2;
	ctx.translate(centerX - crop.left, centerY - crop.top);
	ctx.scale(radiusX, radiusY);
	const stops = resolveColorStops(
		gradientInfo.colorStops,
		radiusX / cssPixelsPerUnit,
	).map((stop) => ({...stop, position: Math.max(0, stop.position)}));
	const {end, toCanvasOffset} = getCanvasGradientRange(stops);
	const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, end);
	for (const stop of stops)
		gradient.addColorStop(toCanvasOffset(stop.position), stop.color);
	ctx.fillStyle = gradient;
	if (experimental3DRendering) {
		ctx.fillRect(
			(crop.left - centerX) / radiusX,
			(crop.top - centerY) / radiusY,
			crop.width / radiusX,
			crop.height / radiusY,
		);
	} else ctx.fillRect(-1, -1, 2, 2);

	const pattern = contextToDraw.createPattern(canvas, 'no-repeat');
	const patternTransform = new DOMMatrix().translate(crop.left, crop.top);
	if (experimental3DRendering)
		patternTransform.scaleSelf(crop.width / width, crop.height / height);
	pattern?.setTransform(patternTransform);
	return pattern;
};
