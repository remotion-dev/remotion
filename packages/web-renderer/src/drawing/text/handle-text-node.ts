// Supported:
// - fontFamily
// - fontSize
// - fontWeight
// - color
// - lineHeight
// - direction

// Not supported:
// - writingMode
// - textDecoration

import {Internals} from 'remotion';
import {drawElementToCanvas} from '../draw-element-to-canvas';
import {getCollapsedText} from './get-collapsed-text';

export const handleTextNode = async (
	node: Text,
	context: OffscreenCanvasRenderingContext2D,
) => {
	// Create a new span element
	const span = document.createElement('span');
	const parent = node.parentNode;
	if (!parent) {
		throw new Error('Text node has no parent');
	}

	parent.insertBefore(span, node);
	span.appendChild(node);

	await drawElementToCanvas({
		context,
		element: span,
		draw(rect) {
			// Save the canvas context state
			context.save();

			const style = getComputedStyle(span);
			const {
				fontFamily,
				fontSize,
				fontWeight,
				color,
				lineHeight,
				direction,
				writingMode,
			} = style;

			context.font = `${fontWeight} ${fontSize} ${fontFamily}`;
			context.fillStyle = color;

			// Calculate the baseline position considering line height
			const fontSizePx = parseFloat(fontSize);
			// TODO: This is not necessarily correct, need to create text and measur to know for sure
			const lineHeightPx =
				lineHeight === 'normal' ? 1.2 * fontSizePx : parseFloat(lineHeight);

			const baselineOffset = (lineHeightPx - fontSizePx) / 2;

			// Handle different writing modes
			const isVertical = writingMode !== 'horizontal-tb';

			if (isVertical) {
				// TODO: Only warn once per render.
				Internals.Log.warn(
					{
						logLevel: 'warn',
						tag: '@remotion/web-renderer',
					},
					'Detected "writing-mode" CSS property. Vertical text is not yet supported in @remotion/web-renderer',
				);
			} else {
				// Horizontal text (LTR or RTL)
				const isRTL = direction === 'rtl';
				context.textAlign = isRTL ? 'right' : 'left';
				context.textBaseline = 'top';

				// For RTL text, fill from the right edge instead of left
				const xPosition = isRTL ? rect.right : rect.left;

				context.fillText(
					getCollapsedText(span),
					xPosition,
					rect.top + baselineOffset,
				);
			}

			// Restore the canvas context state
			context.restore();
		},
	});

	// Undo the layout manipulation
	parent.insertBefore(node, span);
	parent.removeChild(span);
};
