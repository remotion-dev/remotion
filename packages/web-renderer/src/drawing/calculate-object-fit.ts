export type ObjectFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

export type ObjectFitResult = {
	// Source rectangle (which part of the image to draw)
	sourceX: number;
	sourceY: number;
	sourceWidth: number;
	sourceHeight: number;
	// Destination rectangle (where to draw on canvas)
	destX: number;
	destY: number;
	destWidth: number;
	destHeight: number;
};

type ObjectFitParams = {
	containerSize: {width: number; height: number; left: number; top: number};
	intrinsicSize: {width: number; height: number};
};

/**
 * fill: Stretch the image to fill the container, ignoring aspect ratio
 */
const calculateFill = ({
	containerSize,
	intrinsicSize,
}: ObjectFitParams): ObjectFitResult => {
	return {
		sourceX: 0,
		sourceY: 0,
		sourceWidth: intrinsicSize.width,
		sourceHeight: intrinsicSize.height,
		destX: containerSize.left,
		destY: containerSize.top,
		destWidth: containerSize.width,
		destHeight: containerSize.height,
	};
};

/**
 * contain: Scale the image to fit inside the container while maintaining aspect ratio.
 * This may result in letterboxing (empty space on sides or top/bottom).
 */
const calculateContain = ({
	containerSize,
	intrinsicSize,
}: ObjectFitParams): ObjectFitResult => {
	const containerAspect = containerSize.width / containerSize.height;
	const imageAspect = intrinsicSize.width / intrinsicSize.height;

	let destWidth: number;
	let destHeight: number;

	if (imageAspect > containerAspect) {
		// Image is wider than container (relative to their heights)
		// Fit by width, letterbox top/bottom
		destWidth = containerSize.width;
		destHeight = containerSize.width / imageAspect;
	} else {
		// Image is taller than container (relative to their widths)
		// Fit by height, letterbox left/right
		destHeight = containerSize.height;
		destWidth = containerSize.height * imageAspect;
	}

	// Center the image in the container
	const destX = containerSize.left + (containerSize.width - destWidth) / 2;
	const destY = containerSize.top + (containerSize.height - destHeight) / 2;

	return {
		sourceX: 0,
		sourceY: 0,
		sourceWidth: intrinsicSize.width,
		sourceHeight: intrinsicSize.height,
		destX,
		destY,
		destWidth,
		destHeight,
	};
};

/**
 * cover: Scale the image to cover the container while maintaining aspect ratio.
 * Parts of the image may be cropped.
 */
const calculateCover = ({
	containerSize,
	intrinsicSize,
}: ObjectFitParams): ObjectFitResult => {
	const containerAspect = containerSize.width / containerSize.height;
	const imageAspect = intrinsicSize.width / intrinsicSize.height;

	let sourceX = 0;
	let sourceY = 0;
	let sourceWidth = intrinsicSize.width;
	let sourceHeight = intrinsicSize.height;

	if (imageAspect > containerAspect) {
		// Image is wider than container - crop horizontally
		// Scale by height, then crop width
		sourceWidth = intrinsicSize.height * containerAspect;
		sourceX = (intrinsicSize.width - sourceWidth) / 2;
	} else {
		// Image is taller than container - crop vertically
		// Scale by width, then crop height
		sourceHeight = intrinsicSize.width / containerAspect;
		sourceY = (intrinsicSize.height - sourceHeight) / 2;
	}

	return {
		sourceX,
		sourceY,
		sourceWidth,
		sourceHeight,
		destX: containerSize.left,
		destY: containerSize.top,
		destWidth: containerSize.width,
		destHeight: containerSize.height,
	};
};

/**
 * none: Draw the image at its natural size, centered in the container.
 * Clips to the container bounds if the image overflows.
 */
const calculateNone = ({
	containerSize,
	intrinsicSize,
}: ObjectFitParams): ObjectFitResult => {
	// Calculate centered position (can be negative if image is larger than container)
	const centeredX =
		containerSize.left + (containerSize.width - intrinsicSize.width) / 2;
	const centeredY =
		containerSize.top + (containerSize.height - intrinsicSize.height) / 2;

	// Calculate clipping bounds
	let sourceX = 0;
	let sourceY = 0;
	let sourceWidth = intrinsicSize.width;
	let sourceHeight = intrinsicSize.height;
	let destX = centeredX;
	let destY = centeredY;
	let destWidth = intrinsicSize.width;
	let destHeight = intrinsicSize.height;

	// Clip left edge
	if (destX < containerSize.left) {
		const clipAmount = containerSize.left - destX;
		sourceX = clipAmount;
		sourceWidth -= clipAmount;
		destX = containerSize.left;
		destWidth -= clipAmount;
	}

	// Clip top edge
	if (destY < containerSize.top) {
		const clipAmount = containerSize.top - destY;
		sourceY = clipAmount;
		sourceHeight -= clipAmount;
		destY = containerSize.top;
		destHeight -= clipAmount;
	}

	// Clip right edge
	const containerRight = containerSize.left + containerSize.width;
	if (destX + destWidth > containerRight) {
		const clipAmount = destX + destWidth - containerRight;
		sourceWidth -= clipAmount;
		destWidth -= clipAmount;
	}

	// Clip bottom edge
	const containerBottom = containerSize.top + containerSize.height;
	if (destY + destHeight > containerBottom) {
		const clipAmount = destY + destHeight - containerBottom;
		sourceHeight -= clipAmount;
		destHeight -= clipAmount;
	}

	return {
		sourceX,
		sourceY,
		sourceWidth,
		sourceHeight,
		destX,
		destY,
		destWidth,
		destHeight,
	};
};

/**
 * Calculates how to draw an image based on object-fit CSS property.
 *
 * @param objectFit - The CSS object-fit value
 * @param containerSize - The container dimensions (where the image should be drawn)
 * @param intrinsicSize - The natural/intrinsic size of the image
 * @returns Source and destination rectangles for drawImage
 */
export const calculateObjectFit = ({
	objectFit,
	containerSize,
	intrinsicSize,
}: {
	objectFit: ObjectFit;
} & ObjectFitParams): ObjectFitResult => {
	switch (objectFit) {
		case 'fill':
			return calculateFill({containerSize, intrinsicSize});

		case 'contain':
			return calculateContain({containerSize, intrinsicSize});

		case 'cover':
			return calculateCover({containerSize, intrinsicSize});

		case 'none':
			return calculateNone({containerSize, intrinsicSize});

		case 'scale-down': {
			// scale-down behaves like contain or none, whichever results in a smaller image
			const containResult = calculateContain({containerSize, intrinsicSize});
			const noneResult = calculateNone({containerSize, intrinsicSize});

			// Compare the rendered size - use whichever is smaller
			const containArea = containResult.destWidth * containResult.destHeight;
			const noneArea = noneResult.destWidth * noneResult.destHeight;

			return containArea < noneArea ? containResult : noneResult;
		}

		default: {
			const exhaustiveCheck: never = objectFit;
			throw new Error(`Unknown object-fit value: ${exhaustiveCheck}`);
		}
	}
};

/**
 * Parse an object-fit CSS value string into our ObjectFit type.
 * Returns 'fill' as the default if the value is not recognized.
 */
export const parseObjectFit = (value: string | null | undefined): ObjectFit => {
	if (!value) {
		return 'fill';
	}

	const normalized = value.trim().toLowerCase();

	switch (normalized) {
		case 'fill':
		case 'contain':
		case 'cover':
		case 'none':
		case 'scale-down':
			return normalized;
		default:
			return 'fill';
	}
};
