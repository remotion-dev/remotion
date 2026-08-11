import type {MediabunnyResize} from './mediabunny-calculate-resize-option';

export type Dimensions = {
	width: number;
	height: number;
};

const ensureMultipleOfTwo = ({
	dimensions,
	needsToBeMultipleOfTwo,
}: {
	dimensions: Dimensions;
	needsToBeMultipleOfTwo: boolean;
}): Dimensions => {
	if (!needsToBeMultipleOfTwo) {
		return dimensions;
	}

	return {
		width: Math.floor(dimensions.width / 2) * 2,
		height: Math.floor(dimensions.height / 2) * 2,
	};
};

export const calculateNewSizeAfterResizing = ({
	dimensions,
	resizeOperation,
	needsToBeMultipleOfTwo,
}: {
	dimensions: Dimensions;
	resizeOperation: MediabunnyResize | null;
	needsToBeMultipleOfTwo: boolean;
}) => {
	if (resizeOperation === null) {
		return ensureMultipleOfTwo({
			dimensions,
			needsToBeMultipleOfTwo,
		});
	}

	if (resizeOperation.mode === 'max-height') {
		const height = Math.min(dimensions.height, resizeOperation.maxHeight);
		return ensureMultipleOfTwo({
			dimensions: {
				width: Math.round((height / dimensions.height) * dimensions.width),
				height,
			},
			needsToBeMultipleOfTwo,
		});
	}

	if (resizeOperation.mode === 'max-width') {
		const width = Math.min(dimensions.width, resizeOperation.maxWidth);
		return ensureMultipleOfTwo({
			dimensions: {
				width,
				height: Math.round((width / dimensions.width) * dimensions.height),
			},
			needsToBeMultipleOfTwo,
		});
	}

	if (resizeOperation.mode === 'scale') {
		if (resizeOperation.scale <= 0) {
			throw new Error('Scale must be greater than 0');
		}

		const width = Math.round(dimensions.width * resizeOperation.scale);
		const height = Math.round(dimensions.height * resizeOperation.scale);
		return ensureMultipleOfTwo({
			dimensions: {
				width,
				height,
			},
			needsToBeMultipleOfTwo,
		});
	}

	throw new Error('Invalid resizing mode ' + (resizeOperation satisfies never));
};

export const normalizeVideoRotation = (rotation: number) => {
	return ((rotation % 360) + 360) % 360;
};

export const calculateNewDimensionsFromRotate = ({
	height,
	width,
	rotation,
}: Dimensions & {
	rotation: number;
}) => {
	const normalized = normalizeVideoRotation(rotation);
	const switchDimensions = normalized % 90 === 0 && normalized % 180 !== 0;

	const newHeight = switchDimensions ? width : height;
	const newWidth = switchDimensions ? height : width;
	return {
		height: newHeight,
		width: newWidth,
	};
};

export const calculateNewDimensionsFromRotateAndScale = ({
	width,
	height,
	rotation,
	resizeOperation,
	needsToBeMultipleOfTwo,
}: {
	width: number;
	height: number;
	rotation: number;
	resizeOperation: MediabunnyResize | null;
	needsToBeMultipleOfTwo: boolean;
}) => {
	const {height: newHeight, width: newWidth} = calculateNewDimensionsFromRotate(
		{
			height,
			rotation,
			width,
		},
	);

	return calculateNewSizeAfterResizing({
		dimensions: {height: newHeight, width: newWidth},
		resizeOperation,
		needsToBeMultipleOfTwo,
	});
};
