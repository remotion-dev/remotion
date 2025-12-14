// Supported:
// - fontFamily
// - fontSize
// - fontWeight
// - color
// - lineHeight
// - direction
// - letterSpacing
// - textTransform

// Not supported:
// - writingMode
// - textDecoration

import {Internals} from 'remotion';
import {drawElementToCanvas} from '../draw-element-to-canvas';
import {findLineBreaks} from './find-line-breaks.text';
import {getCollapsedText} from './get-collapsed-text';

const applyTextTransform = (text: string, transform: string): string => {
	if (transform === 'uppercase') {
		return text.toUpperCase();
	}

	if (transform === 'lowercase') {
		return text.toLowerCase();
	}

	if (transform === 'capitalize') {
		return text.replace(/\b\w/g, (char) => char.toUpperCase());
	}

	return text;
};

export const handleTextNode = async (
	node: Text,
	context: OffscreenCanvasRenderingContext2D,
) => {
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
		draw(rect, style) {
			const {
				fontFamily,
				fontSize,
				fontWeight,
				color,
				lineHeight,
				direction,
				writingMode,
				letterSpacing,
				textTransform,
			} = style;
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
				return;
			}

			context.save();

			context.font = `${fontWeight} ${fontSize} ${fontFamily}`;
			context.fillStyle = color;
			context.letterSpacing = letterSpacing;

			const fontSizePx = parseFloat(fontSize);
			// TODO: This is not necessarily correct, need to create text and measure to know for sure
			const lineHeightPx =
				lineHeight === 'normal' ? 1.2 * fontSizePx : parseFloat(lineHeight);

			const baselineOffset = (lineHeightPx - fontSizePx) / 2;

			const isRTL = direction === 'rtl';
			context.textAlign = isRTL ? 'right' : 'left';
			context.textBaseline = 'top';

			const originalText = span.textContent;
			const collapsedText = getCollapsedText(span);
			const transformedText = applyTextTransform(collapsedText, textTransform);
			span.textContent = transformedText;

			// For RTL text, fill from the right edge instead of left
			const xPosition = isRTL ? rect.right : rect.left;
			const lines = findLineBreaks(span, isRTL);

			let offsetTop = 0;

			for (const line of lines) {
				context.fillText(
					line.text,
					xPosition + line.offsetHorizontal,
					rect.top + baselineOffset + offsetTop,
				);
				offsetTop += line.offsetTop;
			}

			span.textContent = originalText;

			context.restore();
		},
	});

	// Undo the layout manipulation
	parent.insertBefore(node, span);
	parent.removeChild(span);
};
