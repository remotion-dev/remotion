import type {
	Alignment,
	AlignmentFactory,
	RiveCanvas,
} from '@rive-app/canvas-advanced';

export type RemotionRiveCanvasFit =
	| 'contain'
	| 'cover'
	| 'fill'
	| 'fit-height'
	| 'none'
	| 'scale-down'
	| 'fit-width';

export const mapToFit = (fit: RemotionRiveCanvasFit, canvas: RiveCanvas) => {
	if (fit === 'contain') {
		return canvas.Fit.contain;
	}

	if (fit === 'cover') {
		return canvas.Fit.cover;
	}

	if (fit === 'fill') {
		return canvas.Fit.fill;
	}

	if (fit === 'fit-height') {
		return canvas.Fit.fitHeight;
	}

	if (fit === 'fit-width') {
		return canvas.Fit.fitWidth;
	}

	if (fit === 'none') {
		return canvas.Fit.none;
	}

	if (fit === 'scale-down') {
		return canvas.Fit.scaleDown;
	}

	throw new Error('Invalid fit: ' + fit);
};

export type RemotionRiveCanvasAlignment =
	| 'center'
	| 'bottom-center'
	| 'bottom-left'
	| 'bottom-right'
	| 'center-left'
	| 'center-right'
	| 'top-center'
	| 'top-left'
	| 'top-right';

export const mapToAlignment = (
	alignment: RemotionRiveCanvasAlignment,
	factory: AlignmentFactory,
): Alignment => {
	if (alignment === 'center') {
		return factory.center;
	}

	if (alignment === 'bottom-center') {
		return factory.bottomCenter;
	}

	if (alignment === 'bottom-left') {
		return factory.bottomLeft;
	}

	if (alignment === 'bottom-right') {
		return factory.bottomRight;
	}

	if (alignment === 'center-left') {
		return factory.centerLeft;
	}

	if (alignment === 'center-right') {
		return factory.centerRight;
	}

	if (alignment === 'top-center') {
		return factory.topCenter;
	}

	if (alignment === 'top-left') {
		return factory.topLeft;
	}

	if (alignment === 'top-right') {
		return factory.topRight;
	}

	throw new Error('Invalid alignment: ' + alignment);
};
