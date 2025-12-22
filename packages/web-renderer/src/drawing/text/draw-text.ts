import {Internals} from 'remotion';
import type {DrawFn} from '../drawn-fn';
import {applyTextTransform} from './apply-text-transform';
import {findLineBreaks} from './find-line-breaks.text';
import {getCollapsedText} from './get-collapsed-text';

export const drawText = (span: HTMLSpanElement) => {
	const drawFn: DrawFn = ({dimensions: rect, computedStyle, contextToDraw}) => {
		const {
			fontFamily,
			fontSize,
			fontWeight,
			color,
			direction,
			writingMode,
			letterSpacing,
			textTransform,
		} = computedStyle;
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

		contextToDraw.save();

		const fontSizePx = parseFloat(fontSize);

		contextToDraw.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;
		contextToDraw.fillStyle = color;
		contextToDraw.letterSpacing = letterSpacing;

		const isRTL = direction === 'rtl';
		contextToDraw.textAlign = isRTL ? 'right' : 'left';

		const originalText = span.textContent;
		const collapsedText = getCollapsedText(span);
		const transformedText = applyTextTransform(collapsedText, textTransform);
		span.textContent = transformedText;

		// For RTL text, fill from the right edge instead of left
		const xPosition = isRTL ? rect.right : rect.left;
		const lines = findLineBreaks(span, isRTL);

		let offsetTop = 0;

		for (const line of lines) {
			const {fontBoundingBoxAscent} = contextToDraw.measureText(line.text);

			contextToDraw.fillText(
				line.text,
				xPosition + line.offsetHorizontal,
				rect.top + offsetTop + fontBoundingBoxAscent,
			);
			offsetTop += line.offsetTop;
		}

		span.textContent = originalText;

		contextToDraw.restore();
	};

	return drawFn;
};
