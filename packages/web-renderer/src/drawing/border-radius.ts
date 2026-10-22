import {drawRoundedRectPath} from './draw-rounded';
import {getBoxBasedOnBackgroundClip} from './get-padding-box';

export type BorderRadiusCorners = {
	topLeft: {horizontal: number; vertical: number};
	topRight: {horizontal: number; vertical: number};
	bottomRight: {horizontal: number; vertical: number};
	bottomLeft: {horizontal: number; vertical: number};
};

function parseValue({
	value,
	reference,
}: {
	value: string;
	reference: number;
}): number {
	value = value.trim();
	if (value.endsWith('%')) {
		const percentage = parseFloat(value);
		return (percentage / 100) * reference;
	}

	if (value.endsWith('px')) {
		return parseFloat(value);
	}

	// If no unit, assume pixels
	return parseFloat(value);
}

function expandShorthand(values: string[]): [string, string, string, string] {
	if (values.length === 1) {
		// All corners the same
		return [values[0], values[0], values[0], values[0]];
	}

	if (values.length === 2) {
		// [0] = top-left & bottom-right, [1] = top-right & bottom-left
		return [values[0], values[1], values[0], values[1]];
	}

	if (values.length === 3) {
		// [0] = top-left, [1] = top-right & bottom-left, [2] = bottom-right
		return [values[0], values[1], values[2], values[1]];
	}

	// 4 values: top-left, top-right, bottom-right, bottom-left
	return [values[0], values[1], values[2], values[3]];
}

function clampBorderRadius({
	borderRadius,
	width,
	height,
}: {
	borderRadius: BorderRadiusCorners;
	width: number;
	height: number;
}): BorderRadiusCorners {
	// CSS scales all radii by the same factor when any adjacent pair overlaps.
	// This preserves circular corners for pill shapes such as border-radius: 999px.
	const topHorizontal =
		borderRadius.topLeft.horizontal + borderRadius.topRight.horizontal;
	const bottomHorizontal =
		borderRadius.bottomLeft.horizontal + borderRadius.bottomRight.horizontal;
	const leftVertical =
		borderRadius.topLeft.vertical + borderRadius.bottomLeft.vertical;
	const rightVertical =
		borderRadius.topRight.vertical + borderRadius.bottomRight.vertical;
	const factor = Math.min(
		1,
		topHorizontal === 0 ? 1 : width / topHorizontal,
		bottomHorizontal === 0 ? 1 : width / bottomHorizontal,
		leftVertical === 0 ? 1 : height / leftVertical,
		rightVertical === 0 ? 1 : height / rightVertical,
	);

	return {
		topLeft: {
			horizontal: borderRadius.topLeft.horizontal * factor,
			vertical: borderRadius.topLeft.vertical * factor,
		},
		topRight: {
			horizontal: borderRadius.topRight.horizontal * factor,
			vertical: borderRadius.topRight.vertical * factor,
		},
		bottomRight: {
			horizontal: borderRadius.bottomRight.horizontal * factor,
			vertical: borderRadius.bottomRight.vertical * factor,
		},
		bottomLeft: {
			horizontal: borderRadius.bottomLeft.horizontal * factor,
			vertical: borderRadius.bottomLeft.vertical * factor,
		},
	};
}

export function parseBorderRadius({
	borderRadius,
	width,
	height,
}: {
	borderRadius: string;
	width: number;
	height: number;
}): BorderRadiusCorners {
	// Split by '/' to separate horizontal and vertical radii
	const parts = borderRadius.split('/').map((part) => part.trim());

	const horizontalPart = parts[0];
	const verticalPart = parts[1];

	// Split each part into individual values
	const horizontalValues = horizontalPart.split(/\s+/).filter((v) => v);
	const verticalValues = verticalPart
		? verticalPart.split(/\s+/).filter((v) => v)
		: horizontalValues; // If no '/', use horizontal values for vertical

	// Expand shorthand to 4 values
	const [hTopLeft, hTopRight, hBottomRight, hBottomLeft] =
		expandShorthand(horizontalValues);
	const [vTopLeft, vTopRight, vBottomRight, vBottomLeft] =
		expandShorthand(verticalValues);

	return clampBorderRadius({
		borderRadius: {
			topLeft: {
				horizontal: parseValue({value: hTopLeft, reference: width}),
				vertical: parseValue({value: vTopLeft, reference: height}),
			},
			topRight: {
				horizontal: parseValue({value: hTopRight, reference: width}),
				vertical: parseValue({value: vTopRight, reference: height}),
			},
			bottomRight: {
				horizontal: parseValue({value: hBottomRight, reference: width}),
				vertical: parseValue({value: vBottomRight, reference: height}),
			},
			bottomLeft: {
				horizontal: parseValue({value: hBottomLeft, reference: width}),
				vertical: parseValue({value: vBottomLeft, reference: height}),
			},
		},
		width,
		height,
	});
}

export function setBorderRadius({
	ctx,
	rect,
	borderRadius,
	forceClipEvenWhenZero = false,
	computedStyle,
	backgroundClip,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	borderRadius: BorderRadiusCorners;
	forceClipEvenWhenZero: boolean;
	computedStyle: CSSStyleDeclaration;
	backgroundClip: string;
}) {
	if (
		borderRadius.topLeft.horizontal === 0 &&
		borderRadius.topLeft.vertical === 0 &&
		borderRadius.topRight.horizontal === 0 &&
		borderRadius.topRight.vertical === 0 &&
		borderRadius.bottomRight.horizontal === 0 &&
		borderRadius.bottomRight.vertical === 0 &&
		borderRadius.bottomLeft.horizontal === 0 &&
		borderRadius.bottomLeft.vertical === 0 &&
		!forceClipEvenWhenZero
	) {
		return () => {};
	}

	ctx.save();

	const boundingRect = getBoxBasedOnBackgroundClip(
		rect,
		computedStyle,
		backgroundClip,
	);

	// See background-clip tests for why this logic matters!
	const actualBorderRadius: BorderRadiusCorners = {
		topLeft: {
			horizontal: Math.max(
				0,
				borderRadius.topLeft.horizontal - (boundingRect.left - rect.left),
			),
			vertical: Math.max(
				0,
				borderRadius.topLeft.vertical - (boundingRect.top - rect.top),
			),
		},
		topRight: {
			horizontal: Math.max(
				0,
				borderRadius.topRight.horizontal - (rect.right - boundingRect.right),
			),
			vertical: Math.max(
				0,
				borderRadius.topRight.vertical - (boundingRect.top - rect.top),
			),
		},
		bottomRight: {
			horizontal: Math.max(
				0,
				borderRadius.bottomRight.horizontal - (rect.right - boundingRect.right),
			),
			vertical: Math.max(
				0,
				borderRadius.bottomRight.vertical - (rect.bottom - boundingRect.bottom),
			),
		},
		bottomLeft: {
			horizontal: Math.max(
				0,
				borderRadius.bottomLeft.horizontal - (boundingRect.left - rect.left),
			),
			vertical: Math.max(
				0,
				borderRadius.bottomLeft.vertical - (rect.bottom - boundingRect.bottom),
			),
		},
	};

	drawRoundedRectPath({
		ctx,
		x: boundingRect.left,
		y: boundingRect.top,
		width: boundingRect.width,
		height: boundingRect.height,
		borderRadius: actualBorderRadius,
	});
	ctx.clip();

	return () => {
		ctx.restore();
	};
}
