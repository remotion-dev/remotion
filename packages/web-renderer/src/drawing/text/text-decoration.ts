type TextDecorationLine = 'underline' | 'overline' | 'line-through';
export type TextDecorationStyle = 'solid' | 'double' | 'dotted' | 'dashed';

export type TextDecoration = {
	lines: TextDecorationLine[];
	color: string;
	thickness: number;
	style: TextDecorationStyle;
};

const textDecorationLines: TextDecorationLine[] = [
	'underline',
	'overline',
	'line-through',
];

const currentColorValues = new Set(['currentcolor', 'currentColor']);

const getDefaultTextDecorationThickness = (fontSizePx: number) => {
	return Math.max(1, Number.isFinite(fontSizePx) ? fontSizePx / 16 : 1);
};

const getTextDecorationStyle = (style: string): TextDecorationStyle | null => {
	if (style === 'wavy') {
		return null;
	}

	if (style === 'double' || style === 'dotted' || style === 'dashed') {
		return style;
	}

	return 'solid';
};

export const parseTextDecoration = ({
	onlyBackgroundClipText,
	style,
}: {
	onlyBackgroundClipText: boolean;
	style: CSSStyleDeclaration;
}): TextDecoration | null => {
	const textDecorationStyle = getTextDecorationStyle(
		style.getPropertyValue('text-decoration-style').trim(),
	);
	if (textDecorationStyle === null) {
		return null;
	}

	const textDecorationLine = style.getPropertyValue('text-decoration-line');
	const lineParts = textDecorationLine.split(/\s+/);
	const lines = textDecorationLines.filter((line) => lineParts.includes(line));

	if (lines.length === 0) {
		return null;
	}

	const textDecorationThickness = style.getPropertyValue(
		'text-decoration-thickness',
	);
	const thicknessValue = parseFloat(textDecorationThickness);
	const thickness = Number.isFinite(thicknessValue)
		? thicknessValue
		: getDefaultTextDecorationThickness(parseFloat(style.fontSize));

	if (thickness <= 0) {
		return null;
	}

	const textDecorationColor = style.getPropertyValue('text-decoration-color');

	return {
		lines,
		color:
			onlyBackgroundClipText ||
			!textDecorationColor ||
			currentColorValues.has(textDecorationColor)
				? onlyBackgroundClipText
					? 'black'
					: style.color
				: textDecorationColor,
		thickness,
		style: textDecorationStyle,
	};
};

export const getTextDecorations = ({
	computedStyle,
	onlyBackgroundClipText,
	span,
}: {
	computedStyle: CSSStyleDeclaration;
	onlyBackgroundClipText: boolean;
	span: HTMLSpanElement;
}) => {
	const decorations: TextDecoration[] = [];
	const spanDecoration = parseTextDecoration({
		onlyBackgroundClipText,
		style: computedStyle,
	});

	if (spanDecoration) {
		decorations.push(spanDecoration);
	}

	let parent = span.parentElement;

	while (parent) {
		const parentDecoration = parseTextDecoration({
			onlyBackgroundClipText,
			style: getComputedStyle(parent),
		});

		if (parentDecoration) {
			decorations.push(parentDecoration);
		}

		parent = parent.parentElement;
	}

	return decorations;
};

const getTextDecorationY = ({
	line,
	measurements,
	y,
	thickness,
	fontSizePx,
}: {
	line: TextDecorationLine;
	measurements: TextMetrics;
	y: number;
	thickness: number;
	fontSizePx: number;
}) => {
	const fontAscent =
		measurements.fontBoundingBoxAscent ||
		measurements.actualBoundingBoxAscent ||
		fontSizePx;
	const fontDescent =
		measurements.fontBoundingBoxDescent ||
		measurements.actualBoundingBoxDescent ||
		fontSizePx * 0.2;
	const actualAscent = measurements.actualBoundingBoxAscent || fontAscent;

	if (line === 'underline') {
		return y + Math.max(thickness, fontDescent * 0.4);
	}

	if (line === 'overline') {
		return y - fontAscent + thickness / 2;
	}

	return y - actualAscent * 0.35;
};

const getTextDecorationLineDashPattern = (
	style: TextDecorationStyle,
	thickness: number,
): number[] => {
	if (style === 'dashed') {
		return [thickness * 2, thickness];
	}

	if (style === 'dotted') {
		return [thickness, thickness];
	}

	return [];
};

const strokeTextDecorationLine = ({
	contextToDraw,
	endX,
	lineY,
	startX,
}: {
	contextToDraw: OffscreenCanvasRenderingContext2D;
	endX: number;
	lineY: number;
	startX: number;
}) => {
	contextToDraw.beginPath();
	contextToDraw.moveTo(startX, lineY);
	contextToDraw.lineTo(endX, lineY);
	contextToDraw.stroke();
};

export const drawTextDecoration = ({
	contextToDraw,
	fontSizePx,
	measurements,
	parentRect,
	textDecorations,
	token,
	y,
}: {
	contextToDraw: OffscreenCanvasRenderingContext2D;
	fontSizePx: number;
	measurements: TextMetrics;
	parentRect: DOMRect;
	textDecorations: TextDecoration[];
	token: {
		rect: DOMRect;
	};
	y: number;
}) => {
	if (textDecorations.length === 0) {
		return;
	}

	const startX = token.rect.left - parentRect.x;
	const endX = token.rect.right - parentRect.x;

	if (endX <= startX) {
		return;
	}

	contextToDraw.save();
	contextToDraw.lineCap = 'butt';

	for (const textDecoration of textDecorations) {
		contextToDraw.strokeStyle = textDecoration.color;
		contextToDraw.lineWidth = textDecoration.thickness;

		for (const line of textDecoration.lines) {
			const lineY = getTextDecorationY({
				line,
				measurements,
				y,
				thickness: textDecoration.thickness,
				fontSizePx,
			});

			if (textDecoration.style === 'double') {
				contextToDraw.setLineDash([]);
				strokeTextDecorationLine({
					contextToDraw,
					endX,
					lineY: lineY - textDecoration.thickness,
					startX,
				});
				strokeTextDecorationLine({
					contextToDraw,
					endX,
					lineY: lineY + textDecoration.thickness,
					startX,
				});
				contextToDraw.setLineDash([]);
				continue;
			}

			contextToDraw.setLineDash(
				getTextDecorationLineDashPattern(
					textDecoration.style,
					textDecoration.thickness,
				),
			);
			strokeTextDecorationLine({
				contextToDraw,
				endX,
				lineY,
				startX,
			});
			contextToDraw.setLineDash([]);
		}
	}

	contextToDraw.restore();
};
