import {parsePosition, resolvePosition} from './background-image-rect';

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

export const calculateObjectFit = ({
	objectFit,
	objectPosition,
	containerSize,
	intrinsicSize,
}: {
	objectFit: ObjectFit;
	objectPosition: string;
} & ObjectFitParams): ObjectFitResult => {
	let {width, height} = intrinsicSize;
	if (objectFit === 'fill') {
		width = containerSize.width;
		height = containerSize.height;
	} else if (objectFit !== 'none') {
		const widthScale = containerSize.width / width;
		const heightScale = containerSize.height / height;
		const scale =
			objectFit === 'cover'
				? Math.max(widthScale, heightScale)
				: Math.min(
						widthScale,
						heightScale,
						objectFit === 'scale-down' ? 1 : Infinity,
					);
		width = scale === widthScale ? containerSize.width : width * scale;
		height = scale === heightScale ? containerSize.height : height * scale;
	}

	const position = parsePosition(objectPosition);
	const left = resolvePosition({
		containerSize: containerSize.width,
		imageSize: width,
		value: position.x,
	});
	const top = resolvePosition({
		containerSize: containerSize.height,
		imageSize: height,
		value: position.y,
	});
	const clippedLeft = Math.max(0, left);
	const clippedTop = Math.max(0, top);
	const clippedRight = Math.min(containerSize.width, left + width);
	const clippedBottom = Math.min(containerSize.height, top + height);
	const destWidth = Math.max(0, clippedRight - clippedLeft);
	const destHeight = Math.max(0, clippedBottom - clippedTop);

	return {
		sourceX: ((clippedLeft - left) * intrinsicSize.width) / width,
		sourceY: ((clippedTop - top) * intrinsicSize.height) / height,
		// Keep exact intrinsic extents when the corresponding destination edges were not clipped.
		sourceWidth:
			clippedLeft === left && clippedRight === left + width
				? intrinsicSize.width
				: (destWidth * intrinsicSize.width) / width,
		sourceHeight:
			clippedTop === top && clippedBottom === top + height
				? intrinsicSize.height
				: (destHeight * intrinsicSize.height) / height,
		destX: containerSize.left + clippedLeft,
		destY: containerSize.top + clippedTop,
		destWidth,
		destHeight,
	};
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
