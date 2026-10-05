import {getBackgroundImageRect} from './background-image-rect';
import {
	createCanvasGradient,
	parseLinearGradient,
} from './parse-linear-gradient';

const isColorTransparent = (color: string) => {
	return (
		color === 'transparent' ||
		(color.startsWith('rgba') &&
			(color.endsWith(', 0)') || color.endsWith(',0')))
	);
};

export const getBackgroundFill = ({
	backgroundColor,
	backgroundImage,
	backgroundPosition,
	backgroundSize,
	contextToDraw,
	boundingRect,
	offsetLeft,
	offsetTop,
}: {
	backgroundImage: string;
	backgroundPosition: string;
	backgroundSize: string;
	backgroundColor: string;
	contextToDraw: OffscreenCanvasRenderingContext2D;
	boundingRect: DOMRect;
	offsetLeft: number;
	offsetTop: number;
}): CanvasGradient | CanvasPattern | string | null => {
	if (backgroundImage && backgroundImage !== 'none') {
		const radialMatch = /^radial-gradient\((.*)\)$/.exec(backgroundImage);
		if (radialMatch) {
			const parts = radialMatch[1].split(/,(?![^(]*\))/);
			const firstPart = parts[0].trim();
			const hasShape = /^(ellipse|circle|farthest-corner|at)\b/.test(firstPart);
			// Handle centered gradients with the default farthest-corner extent.
			// Other positions and explicit radii need their own geometry.
			if (
				!hasShape ||
				/^(?:(?:ellipse|circle)(?: farthest-corner)?|farthest-corner)?(?:\s*at (?:center|50% 50%))?$/.test(
					firstPart,
				)
			) {
				const stops = parseLinearGradient(
					`linear-gradient(${parts.slice(hasShape ? 1 : 0).join(',')})`,
				);
				if (stops) {
					const rect = getBackgroundImageRect({
						backgroundPosition,
						backgroundSize,
						positioningArea: boundingRect,
					});
					const circle = hasShape && firstPart.startsWith('circle');
					const radiusX = circle
						? Math.hypot(rect.width / 2, rect.height / 2)
						: (rect.width / 2) * Math.SQRT2;
					const radiusY = circle ? radiusX : (rect.height / 2) * Math.SQRT2;
					if (radiusX > 0 && radiusY > 0) {
						const canvas = new OffscreenCanvas(
							Math.ceil(rect.width),
							Math.ceil(rect.height),
						);
						const ctx = canvas.getContext('2d');
						if (!ctx) throw new Error('Could not get radial gradient context');
						ctx.translate(rect.width / 2, rect.height / 2);
						ctx.scale(radiusX, radiusY);
						const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
						for (const stop of stops.colorStops)
							gradient.addColorStop(stop.position, stop.color);
						ctx.fillStyle = gradient;
						ctx.fillRect(-1, -1, 2, 2);
						const pattern = contextToDraw.createPattern(canvas, 'no-repeat');
						pattern?.setTransform(
							new DOMMatrix().translate(
								rect.left - offsetLeft,
								rect.top - offsetTop,
							),
						);
						return pattern;
					}
				}
			}
		}

		const gradientInfo = parseLinearGradient(backgroundImage);
		if (gradientInfo) {
			const backgroundImageRect = getBackgroundImageRect({
				backgroundPosition,
				backgroundSize,
				positioningArea: boundingRect,
			});
			const gradient = createCanvasGradient({
				ctx: contextToDraw,
				rect: backgroundImageRect,
				gradientInfo,
				offsetLeft,
				offsetTop,
			});

			return gradient;
		}
	}

	if (
		backgroundColor &&
		backgroundColor !== 'transparent' &&
		!isColorTransparent(backgroundColor)
	) {
		return backgroundColor;
	}

	return null;
};
