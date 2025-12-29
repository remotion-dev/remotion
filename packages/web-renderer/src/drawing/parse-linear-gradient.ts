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

		const remaining = trimmed.substring(colorMatch.index! + colorStr.length).trim();

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

	// Distribute positions evenly for stops that don't have explicit positions
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
	} else {
		// Handle trailing stops without explicit positions
		if (lastExplicitIndex < stops.length - 1) {
			const numImplicit = stops.length - 1 - lastExplicitIndex;
			const step = (1 - lastExplicitPosition) / (numImplicit + 1);
			for (let i = lastExplicitIndex + 1; i < stops.length; i++) {
				stops[i].position =
					lastExplicitPosition + step * (i - lastExplicitIndex);
			}
		}
	}

	// Clamp positions to 0-1
	for (const stop of stops) {
		stop.position = Math.max(0, Math.min(1, stop.position));
	}

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
	let contentStart = startIndex + prefix.length;
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
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	gradientInfo: LinearGradientInfo;
}): CanvasGradient => {
	// Convert angle to radians
	// CSS angles: 0deg = to top, 90deg = to right, 180deg = to bottom, 270deg = to left
	// We need to calculate the gradient line that spans the rectangle at the given angle

	const angleRad = ((gradientInfo.angle - 90) * Math.PI) / 180;

	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 2;

	// Calculate gradient line endpoints
	// The gradient line passes through the center and has the specified angle
	const cos = Math.cos(angleRad);
	const sin = Math.sin(angleRad);

	// Find the intersection of the gradient line with the rectangle edges
	const halfWidth = rect.width / 2;
	const halfHeight = rect.height / 2;

	// Calculate the length from center to edge along the gradient line
	const length =
		Math.abs(cos) * halfWidth + Math.abs(sin) * halfHeight ||
		Math.sqrt(halfWidth ** 2 + halfHeight ** 2);

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
