import type {Dimensions, MediaParserVideoCodec} from '@remotion/media-parser';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import {calculateNewSizeAfterResizing} from './resizing/calculate-new-size';
import type {ResizeOperation} from './resizing/mode';
import {normalizeVideoRotation} from './rotate-and-resize-video-frame';

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
	videoCodec,
}: {
	width: number;
	height: number;
	rotation: number;
	resizeOperation: ResizeOperation | null;
	videoCodec: ConvertMediaVideoCodec | MediaParserVideoCodec;
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
		videoCodec,
	});
};
