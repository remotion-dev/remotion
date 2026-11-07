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
	position: number; // 0-1, representing position along gradient
}

export interface LinearGradientInfo {
	angle: number; // Degrees, 0 = to top, 90 = to right, 180 = to bottom, 270 = to left
	colorStops: ColorStop[];
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

const parseColorStops = (colorStopsStr: string): ColorStop[] | null => {
	// Split by comma, but respect parentheses in rgba(), rgb(), hsl(), hsla()
	const parts = colorStopsStr.split(/,(?![^(]*\))/);

	const stops: ColorStop[] = [];

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

		const colorStr = colorMatch[0];

		// Validate that this is actually a valid CSS color
		if (!isValidColor(colorStr)) {
			continue;
		}

		const remaining = trimmed
			.substring(colorMatch.index! + colorStr.length)
			.trim();

		// Canvas API supports CSS colors directly, so we can use the color string as-is
		const normalizedColor = colorStr;

		// Parse position if provided
		let position: number | null = null;
		if (remaining) {
			const posMatch = remaining.match(/(-?\d+\.?\d*)(%|px)?/);
			if (posMatch) {
				const value = parseFloat(posMatch[1]);
				const unit = posMatch[2];

				if (unit === '%') {
					position = value / 100;
				} else if (unit === 'px') {
					// px values need element dimensions, which we don't have here
					// We'll handle this as a percentage for now (not fully CSS-compliant but good enough)
					position = null;
				} else {
					position = value / 100; // Assume percentage if no unit
				}
			}
		}

		stops.push({
			color: normalizedColor,
			position: position !== null ? position : -1, // -1 means needs to be calculated
		});
	}

	if (stops.length === 0) {
		return null;
	}

	// Anchor omitted endpoint stops before distributing interior runs.
	if (stops[0].position === -1) stops[0].position = 0;
	if (stops[stops.length - 1].position === -1)
		stops[stops.length - 1].position = 1;
	let lastExplicitIndex = -1;
	let lastExplicitPosition = 0;

	for (let i = 0; i < stops.length; i++) {
		if (stops[i].position !== -1) {
			// Found an explicit position
			if (lastExplicitIndex >= 0) {
				// Interpolate between last explicit and current explicit
				const numImplicit = i - lastExplicitIndex - 1;
				if (numImplicit > 0) {
					const step =
						(stops[i].position - lastExplicitPosition) / (numImplicit + 1);
					for (let j = lastExplicitIndex + 1; j < i; j++) {
						stops[j].position =
							lastExplicitPosition + step * (j - lastExplicitIndex);
					}
				}
			} else {
				// Backfill from start to first explicit
				const numImplicit = i;
				if (numImplicit > 0) {
					const step = stops[i].position / (numImplicit + 1);
					for (let j = 0; j < i; j++) {
						stops[j].position = step * (j + 1);
					}
				}
			}

			lastExplicitIndex = i;
			lastExplicitPosition = stops[i].position;
		}
	}

	// If no explicit positions were provided at all, distribute evenly
	// Check this BEFORE handling trailing stops
	if (stops.every((s) => s.position === -1)) {
		if (stops.length === 1) {
			stops[0].position = 0.5;
		} else {
			for (let i = 0; i < stops.length; i++) {
				stops[i].position = i / (stops.length - 1);
			}
		}
	} else if (lastExplicitIndex < stops.length - 1) {
		const numImplicit = stops.length - 1 - lastExplicitIndex;
		const step = (1 - lastExplicitPosition) / (numImplicit + 1);
		for (let i = lastExplicitIndex + 1; i < stops.length; i++) {
			stops[i].position = lastExplicitPosition + step * (i - lastExplicitIndex);
		}
	}

	// Clamp positions to 0-1
	for (const stop of stops) {
		stop.position = Math.max(0, Math.min(1, stop.position));
	}

	// CSS Color Level 4: `transparent` should interpolate as the same hue
	// with zero alpha, not as rgba(0,0,0,0). Replace `transparent` stops
	// with the RGB of the nearest non-transparent neighbor at alpha 0.
	resolveTransparentStops(stops);

	return stops;
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
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	gradientInfo: LinearGradientInfo;
	offsetLeft: number;
	offsetTop: number;
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

	const x0 = centerX - cos * length;
	const y0 = centerY - sin * length;
	const x1 = centerX + cos * length;
	const y1 = centerY + sin * length;

	const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

	// Add color stops
	for (const stop of gradientInfo.colorStops) {
		gradient.addColorStop(stop.position, stop.color);
	}

	return gradient;
};

// Bounded support shared by backgrounds and alpha masks: centered default
// farthest-corner gradients and explicitly sized percentage ellipses.
export const parseRadialGradient = (value: string) => {
	const match = /^radial-gradient\((.*)\)$/.exec(value);
	if (!match) return null;
	const parts = match[1].split(/,(?![^(]*\))/);
	const first = parts[0].trim();
	const hasShape = parseLinearGradient(`linear-gradient(${first})`) === null;
	const percentages =
		/^(?:ellipse\s+)?([\d.]+)%\s+([\d.]+)%(?:\s+at\s+(?:center|50% 50%))?$/.exec(
			first,
		);
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
	contextToDraw,
	rect,
	offsetLeft,
	offsetTop,
}: {
	gradientInfo: RadialGradientInfo;
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
	const crop = getNarrowerRect({
		firstRect: positionedRect,
		secondRect: canvasViewport,
	});
	if (!(crop.width > 0 && crop.height > 0)) return null;
	const densityX = Math.hypot(targetTransform.a, targetTransform.b) || 1;
	const densityY = Math.hypot(targetTransform.c, targetTransform.d) || 1;
	const width = Math.max(
		1,
		Math.min(contextToDraw.canvas.width, Math.ceil(crop.width * densityX)),
	);
	const height = Math.max(
		1,
		Math.min(contextToDraw.canvas.height, Math.ceil(crop.height * densityY)),
	);
	const canvas = new OffscreenCanvas(width, height);
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Could not get radial gradient context');
	ctx.scale(width / crop.width, height / crop.height);
	const centerX = positionedRect.left + rect.width / 2;
	const centerY = positionedRect.top + rect.height / 2;
	ctx.translate(centerX - crop.left, centerY - crop.top);
	ctx.scale(radiusX, radiusY);
	const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
	for (const stop of gradientInfo.colorStops)
		gradient.addColorStop(stop.position, stop.color);
	ctx.fillStyle = gradient;
	ctx.fillRect(
		(crop.left - centerX) / radiusX,
		(crop.top - centerY) / radiusY,
		crop.width / radiusX,
		crop.height / radiusY,
	);
	const pattern = contextToDraw.createPattern(canvas, 'no-repeat');
	pattern?.setTransform(
		new DOMMatrix()
			.translate(crop.left, crop.top)
			.scale(crop.width / width, crop.height / height),
	);
	return pattern;
};
