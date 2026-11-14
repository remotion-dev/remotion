import {NoReactInternals} from 'remotion/no-react';

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
	colorStopsSource: string;
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
	gradientLength: number | null,
): ColorStop[] | null => {
	const parts = colorStopsStr.split(/,(?![^(]*\))/);
	const stops: {color: string; position: number | null}[] = [];
	for (const part of parts) {
		const trimmed = part.trim();
		if (!trimmed) continue;
		const colorMatch = trimmed.match(
			/(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-f]{3,8}|[a-z]+)/i,
		);
		if (!colorMatch || !isValidColor(colorMatch[0])) continue;
		const color = colorMatch[0];
		const remaining = trimmed
			.substring(colorMatch.index! + color.length)
			.trim();
		// Computed CSS resolves supported length stops to pixels. Keep two-position
		// stops distinct, and defer their conversion until the paint box is known.
		const positions = remaining ? remaining.split(/\s+/) : [''];
		const numeric = positions.every((position) =>
			/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:%|px)?$/.test(position),
		);
		if (remaining && !numeric) {
			const legacy = remaining.match(/(-?\d+\.?\d*)(%|px)?/);
			stops.push({
				color,
				position: legacy && legacy[2] !== 'px' ? Number(legacy[1]) / 100 : null,
			});
			continue;
		}

		for (const position of numeric ? positions : ['']) {
			const match = position.match(/^([-+]?(?:\d+(?:\.\d*)?|\.\d+))(%|px)?$/);
			const value = match ? Number(match[1]) : null;
			stops.push({
				color,
				position:
					value === null
						? null
						: match![2] === 'px'
							? gradientLength
								? value / gradientLength
								: null
							: value / 100,
			});
		}
	}

	if (stops.length === 0) return null;
	if (stops[0].position === null) stops[0].position = 0;
	if (stops[stops.length - 1].position === null)
		stops[stops.length - 1].position = 1;
	// CSS stop fixup clamps decreasing explicit positions before distributing
	// unspecified runs. Explicit negative and outside stops remain meaningful.
	let previous = -Infinity;
	for (const stop of stops) {
		if (stop.position === null) continue;
		stop.position = Math.max(previous, stop.position);
		previous = stop.position;
	}

	for (let start = 0; start < stops.length - 1; ) {
		let end = start + 1;
		while (stops[end].position === null) end++;
		const from = stops[start].position!;
		const step = (stops[end].position! - from) / (end - start);
		for (let i = start + 1; i < end; i++)
			stops[i].position = from + step * (i - start);
		start = end;
	}

	const resolved = stops.map(({color, position}) => ({
		color,
		position:
			gradientLength === null ? Math.max(0, Math.min(1, position!)) : position!,
	}));
	resolveTransparentStops(resolved);
	return resolved;
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
	const colorStops = parseColorStops(colorStopsStr, null);

	if (!colorStops || colorStops.length === 0) {
		return null;
	}

	return {
		angle,
		colorStops,
		colorStopsSource: colorStopsStr,
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
}): {gradient: CanvasGradient; hasInterpolation: boolean} => {
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

	const stops = parseColorStops(gradientInfo.colorStopsSource, length * 2)!;
	const first = Math.min(0, stops[0].position);
	const last = Math.max(1, stops[stops.length - 1].position);
	const x0 = centerX + cos * length * (first * 2 - 1);
	const y0 = centerY + sin * length * (first * 2 - 1);
	const x1 = centerX + cos * length * (last * 2 - 1);
	const y1 = centerY + sin * length * (last * 2 - 1);
	const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
	for (const stop of stops)
		gradient.addColorStop((stop.position - first) / (last - first), stop.color);

	return {
		gradient,
		hasInterpolation: stops.some(
			(stop, index) =>
				index > 0 &&
				stop.position > stops[index - 1].position &&
				stop.color !== stops[index - 1].color,
		),
	};
};
