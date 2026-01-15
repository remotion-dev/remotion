import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import type {DrawFn} from '../drawn-fn';
import {applyTextTransform} from './apply-text-transform';
import {findLineBreaks} from './find-line-breaks.text';

export const drawText = ({
	span,
	logLevel,
	onlyBackgroundClipText,
}: {
	span: HTMLSpanElement;
	logLevel: LogLevel;
	onlyBackgroundClipText: boolean;
}) => {
	const drawFn: DrawFn = ({dimensions: rect, computedStyle, contextToDraw}) => {
		const {
			fontFamily,
			fontSize,
			fontWeight,
			direction,
			writingMode,
			letterSpacing,
			textTransform,
			webkitTextFillColor,
		} = computedStyle;
		const isVertical = writingMode !== 'horizontal-tb';
		if (isVertical) {
			// TODO: Only warn once per render.
			Internals.Log.warn(
				{
					logLevel,
					tag: '@remotion/web-renderer',
				},
				'Detected "writing-mode" CSS property. Vertical text is not yet supported in @remotion/web-renderer',
			);
			return;
		}

		contextToDraw.save();

		const fontSizePx = parseFloat(fontSize);

		contextToDraw.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;
		contextToDraw.fillStyle =
			// If text is being applied with backgroundClipText, we need to use a solid color otherwise it won't get
			// applied in canvas
			onlyBackgroundClipText
				? 'black'
				: // -webkit-text-fill-color overrides color, and defaults to the value of `color`
					webkitTextFillColor;
		contextToDraw.letterSpacing = letterSpacing;

		const isRTL = direction === 'rtl';
		contextToDraw.textAlign = isRTL ? 'right' : 'left';
		contextToDraw.textBaseline = 'alphabetic';

		const originalText = span.textContent;
		const transformedText = applyTextTransform(originalText, textTransform);
		span.textContent = transformedText;

		const {lines, xPosition} = findLineBreaks(span, isRTL);

		let offsetTop = 0;

		const measurements = contextToDraw.measureText(lines[0].text);
		const {fontBoundingBoxDescent, fontBoundingBoxAscent} = measurements;

		const fontHeight = fontBoundingBoxAscent + fontBoundingBoxDescent;

		for (const line of lines) {
			// Calculate leading
			const leading = line.height - fontHeight;
			const halfLeading = leading / 2;

			contextToDraw.fillText(
				line.text,
				xPosition + line.offsetHorizontal,
				rect.top + halfLeading + fontBoundingBoxAscent + offsetTop,
			);
			offsetTop += line.height;
		}

		span.textContent = originalText;

		contextToDraw.restore();
	};

	return drawFn;
};
