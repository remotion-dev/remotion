import type {MediaParserVideoCodec} from '@remotion/media-parser';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import {calculateNewSizeAfterResizing} from './resizing/calculate-new-size';
import type {ResizeOperation} from './resizing/mode';

export const calculateNewDimensionsFromDimensions = ({
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
	const switchDimensions = rotation % 90 === 0 && rotation % 180 !== 0;

	const newHeight = switchDimensions ? width : height;
	const newWidth = switchDimensions ? height : width;

	return calculateNewSizeAfterResizing({
		dimensions: {height: newHeight, width: newWidth},
		resizeOperation,
		videoCodec,
	});
};
