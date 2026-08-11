import {getScaledImageThumbnailDimensions} from './get-scaled-image-thumbnail-dimensions';

type ImageWithNaturalDimensions = CanvasImageSource & {
	readonly naturalWidth: number;
	readonly naturalHeight: number;
};

const createOffscreenCanvas = (width: number, height: number) => {
	if (typeof document !== 'undefined') {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		return canvas;
	}

	if (typeof OffscreenCanvas !== 'undefined') {
		return new OffscreenCanvas(width, height);
	}

	throw new Error('No canvas implementation available');
};

export const drawRepeatingImageThumbnail = ({
	canvas,
	image,
}: {
	readonly canvas: HTMLCanvasElement | OffscreenCanvas;
	readonly image: ImageWithNaturalDimensions;
}) => {
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('Failed to get canvas context');
	}

	const {width, height} = canvas;

	if (width === 0 || height === 0) {
		return;
	}

	const {scaledWidth, scaledHeight} = getScaledImageThumbnailDimensions({
		naturalWidth: image.naturalWidth,
		naturalHeight: image.naturalHeight,
		canvasHeight: height,
	});

	if (scaledWidth === 0 || scaledHeight === 0) {
		return;
	}

	const offscreen = createOffscreenCanvas(scaledWidth, scaledHeight);
	const offCtx = offscreen.getContext('2d');

	if (!offCtx) {
		throw new Error('Failed to get offscreen canvas context');
	}

	offCtx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

	const pattern = ctx.createPattern(offscreen, 'repeat-x');

	if (!pattern) {
		return;
	}

	ctx.fillStyle = pattern;
	ctx.fillRect(0, 0, width, height);
};
