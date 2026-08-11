import type {MediaParserDimensions} from '@remotion/media-parser';
import {calculateNewSizeAfterResizing} from './resizing/calculate-new-size';
import type {ResizeOperation} from './resizing/mode';
import {normalizeVideoRotation} from './rotate-and-resize-video-frame';

export const calculateNewDimensionsFromRotate = ({
	height,
	width,
	rotation,
}: MediaParserDimensions & {
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
	resizeOperation: ResizeOperation | null;
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
