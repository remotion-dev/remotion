import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';
import type {DrawFn} from '../drawn-fn';
import {applyTextTransform} from './apply-text-transform';
import {findWords} from './find-line-breaks.text';
import {parsePaintOrder} from './parse-paint-order';
import {parseTextShadow} from './parse-text-shadow';

export const drawText = ({
	span,
	logLevel,
	onlyBackgroundClipText,
	parentRect,
}: {
	span: HTMLSpanElement;
	logLevel: LogLevel;
	parentRect: DOMRect;
	onlyBackgroundClipText: boolean;
}) => {
	const drawFn: DrawFn = ({computedStyle, contextToDraw}) => {
		const {
			fontFamily,
			fontSize,
			fontWeight,
			fontStyle,
			direction,
			writingMode,
			letterSpacing,
			textTransform,
			webkitTextFillColor,
			webkitTextStrokeWidth,
			webkitTextStrokeColor,
			textShadow: textShadowValue,
			paintOrder,
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

		contextToDraw.font = `${fontStyle} ${fontWeight} ${fontSizePx}px ${fontFamily}`;
		contextToDraw.fillStyle =
			// If text is being applied with backgroundClipText, we need to use a solid color otherwise it won't get
			// applied in canvas
			onlyBackgroundClipText
				? 'black'
				: // -webkit-text-fill-color overrides color, and defaults to the value of `color`
					webkitTextFillColor;
		contextToDraw.letterSpacing = letterSpacing;

		const strokeWidth = parseFloat(webkitTextStrokeWidth);
		const hasStroke = strokeWidth > 0;
		if (hasStroke) {
			contextToDraw.strokeStyle = webkitTextStrokeColor;
			contextToDraw.lineWidth = strokeWidth;
		}

		const isRTL = direction === 'rtl';
		contextToDraw.textAlign = isRTL ? 'right' : 'left';
		contextToDraw.textBaseline = 'alphabetic';

		const originalText = span.textContent;
		const transformedText = applyTextTransform(originalText, textTransform);
		span.textContent = transformedText;

		const tokens = findWords(span);

		const textShadows = parseTextShadow(textShadowValue);

		const {strokeFirst} = parsePaintOrder(paintOrder);

		for (const token of tokens) {
			const measurements = contextToDraw.measureText(originalText);
			const {fontBoundingBoxDescent, fontBoundingBoxAscent} = measurements;

			const fontHeight = fontBoundingBoxAscent + fontBoundingBoxDescent;
			// Calculate leading
			const leading = token.rect.height - fontHeight;
			const halfLeading = leading / 2;

			const x = (isRTL ? token.rect.right : token.rect.left) - parentRect.x;
			const y =
				token.rect.top + fontBoundingBoxAscent + halfLeading - parentRect.y;

			// Draw text shadows from last to first (so first shadow appears on top)
			for (let i = textShadows.length - 1; i >= 0; i--) {
				const shadow = textShadows[i];
				contextToDraw.shadowColor = shadow.color;
				contextToDraw.shadowBlur = shadow.blurRadius;
				contextToDraw.shadowOffsetX = shadow.offsetX;
				contextToDraw.shadowOffsetY = shadow.offsetY;
				contextToDraw.fillText(token.text, x, y);
			}

			// Reset shadow and draw the actual text on top
			contextToDraw.shadowColor = 'transparent';
			contextToDraw.shadowBlur = 0;
			contextToDraw.shadowOffsetX = 0;
			contextToDraw.shadowOffsetY = 0;

			const drawFill = () => contextToDraw.fillText(token.text, x, y);
			const drawStroke = () => {
				if (hasStroke) {
					contextToDraw.strokeText(token.text, x, y);
				}
			};

			if (strokeFirst) {
				drawStroke();
				drawFill();
			} else {
				drawFill();
				drawStroke();
			}
		}

		span.textContent = originalText;

		contextToDraw.restore();
	};

	return drawFn;
};
