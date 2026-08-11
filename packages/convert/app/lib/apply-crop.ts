import type {CropRectangle} from 'mediabunny';
import {
	type Dimensions,
	normalizeVideoRotation,
} from './calculate-new-dimensions-from-dimensions';

export const getVisibleCropRectangle = ({
	dimensions,
	cropRect,
}: {
	dimensions: Dimensions;
	cropRect: CropRectangle;
}): CropRectangle => {
	const left = Math.min(Math.max(0, cropRect.left), dimensions.width);
	const top = Math.min(Math.max(0, cropRect.top), dimensions.height);
	const width = Math.min(
		Number.isFinite(cropRect.width)
			? Math.max(0, cropRect.width)
			: dimensions.width - left,
		dimensions.width - left,
	);
	const height = Math.min(
		Number.isFinite(cropRect.height)
			? Math.max(0, cropRect.height)
			: dimensions.height - top,
		dimensions.height - top,
	);

	return {height, left, top, width};
};

export const applyCrop = (dimensions: Dimensions, cropRect: CropRectangle) => {
	const visibleCropRectangle = getVisibleCropRectangle({
		cropRect,
		dimensions,
	});

	return {
		width: visibleCropRectangle.width,
		height: visibleCropRectangle.height,
	};
};

export const getCropRectangleBeforeMirror = ({
	cropRect,
	dimensions,
	mirrorHorizontal,
	mirrorVertical,
}: {
	cropRect: CropRectangle;
	dimensions: Dimensions;
	mirrorHorizontal: boolean;
	mirrorVertical: boolean;
}): CropRectangle => {
	return {
		...cropRect,
		left: mirrorHorizontal
			? dimensions.width - cropRect.left - cropRect.width
			: cropRect.left,
		top: mirrorVertical
			? dimensions.height - cropRect.top - cropRect.height
			: cropRect.top,
	};
};

export const getCropRectangleBeforeRotation = ({
	cropRect,
	rotation,
	sourceDimensions,
}: {
	cropRect: CropRectangle;
	rotation: number;
	sourceDimensions: Dimensions;
}): CropRectangle => {
	const normalizedRotation = normalizeVideoRotation(rotation);

	if (normalizedRotation === 0) {
		return cropRect;
	}

	if (normalizedRotation === 90) {
		return {
			left: cropRect.top,
			top: sourceDimensions.height - cropRect.left - cropRect.width,
			width: cropRect.height,
			height: cropRect.width,
		};
	}

	if (normalizedRotation === 180) {
		return {
			left: sourceDimensions.width - cropRect.left - cropRect.width,
			top: sourceDimensions.height - cropRect.top - cropRect.height,
			width: cropRect.width,
			height: cropRect.height,
		};
	}

	if (normalizedRotation === 270) {
		return {
			left: sourceDimensions.width - cropRect.top - cropRect.height,
			top: cropRect.left,
			width: cropRect.height,
			height: cropRect.width,
		};
	}

	throw new Error(`Unsupported rotation: ${rotation}`);
};
