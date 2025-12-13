import {getCollapsedText} from './get-collapsed-text';

export const handleTextNode = (
	node: Text,
	context: OffscreenCanvasRenderingContext2D,
) => {
	// Save the canvas context state
	context.save();

	// Create a new span element
	const span = document.createElement('span');
	const parent = node.parentNode;
	if (!parent) {
		throw new Error('Text node has no parent');
	}

	parent.insertBefore(span, node);
	span.appendChild(node);
	const rect = span.getBoundingClientRect();
	const style = getComputedStyle(span);
	const {fontFamily, fontSize, fontWeight, color, lineHeight, direction} =
		style;

	context.font = `${fontWeight} ${fontSize} ${fontFamily}`;
	context.fillStyle = color;
	context.textBaseline = 'top';

	// Handle RTL text rendering
	const isRTL = direction === 'rtl';
	context.textAlign = isRTL ? 'right' : 'left';

	// Calculate the baseline position considering line height
	const fontSizePx = parseFloat(fontSize);
	// TODO: This is not necessarily correct, need to create text and measur to know for sure
	const lineHeightPx =
		lineHeight === 'normal' ? 1.2 * fontSizePx : parseFloat(lineHeight);

	const baselineOffset = (lineHeightPx - fontSizePx) / 2;

	// For RTL text, fill from the right edge instead of left
	const xPosition = isRTL ? rect.right : rect.left;

	context.fillText(
		getCollapsedText(span),
		xPosition,
		rect.top + baselineOffset,
	);

	// Undo the layout manipulation
	parent.insertBefore(node, span);
	parent.removeChild(span);

	// Restore the canvas context state
	context.restore();
};
