import type {BorderRadiusCorners} from './border-radius';
import {drawRoundedRectPath} from './draw-rounded';

export const parseOutlineWidth = (value: string): number => {
	return parseFloat(value) || 0;
};

export const parseOutlineOffset = (value: string): number => {
	return parseFloat(value) || 0;
};

const getLineDashPattern = (style: string, width: number): number[] => {
	if (style === 'dashed') {
		return [width * 2, width];
	}

	if (style === 'dotted') {
		return [width, width];
	}

	return [];
};

export const drawOutline = ({
	ctx,
	rect,
	borderRadius,
	computedStyle,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	borderRadius: BorderRadiusCorners;
	computedStyle: CSSStyleDeclaration;
}) => {
	const outlineWidth = parseOutlineWidth(computedStyle.outlineWidth);
	const {outlineStyle} = computedStyle;
	const outlineColor = computedStyle.outlineColor || 'black';
	const outlineOffset = parseOutlineOffset(computedStyle.outlineOffset);

	// Check if we have a visible outline
	if (
		outlineWidth <= 0 ||
		outlineStyle === 'none' ||
		outlineStyle === 'hidden'
	) {
		return;
	}

	// Save original canvas state
	const originalStrokeStyle = ctx.strokeStyle;
	const originalLineWidth = ctx.lineWidth;
	const originalLineDash = ctx.getLineDash();

	ctx.strokeStyle = outlineColor;
	ctx.lineWidth = outlineWidth;
	ctx.setLineDash(getLineDashPattern(outlineStyle, outlineWidth));

	// Calculate outline position
	// Outline is drawn outside the border edge, offset by outlineOffset
	const halfWidth = outlineWidth / 2;
	const offset = outlineOffset + halfWidth;

	const outlineX = rect.left - offset;
	const outlineY = rect.top - offset;
	const outlineW = rect.width + offset * 2;
	const outlineH = rect.height + offset * 2;
	drawRoundedRectPath({
		ctx,
		x: outlineX,
		y: outlineY,
		width: outlineW,
		height: outlineH,
		borderRadius,
	});
	ctx.stroke();

	// Restore original canvas state
	ctx.strokeStyle = originalStrokeStyle;
	ctx.lineWidth = originalLineWidth;
	ctx.setLineDash(originalLineDash);
};
