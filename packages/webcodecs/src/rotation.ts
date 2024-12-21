import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import {calculateNewSizeAfterResizing} from './resizing/calculate-new-size';
import type {ResizingOperation} from './resizing/mode';

export const calculateNewDimensionsFromDimensions = ({
	width,
	height,
	rotation,
	resizingOperation,
	videoCodec,
}: {
	width: number;
	height: number;
	rotation: number;
	resizingOperation: ResizingOperation | null;
	videoCodec: ConvertMediaVideoCodec;
}) => {
	const switchDimensions = rotation % 90 === 0 && rotation % 180 !== 0;

	const newHeight = switchDimensions ? width : height;
	const newWidth = switchDimensions ? height : width;

	return calculateNewSizeAfterResizing({
		dimensions: {height: newHeight, width: newWidth},
		resizingOperation,
		videoCodec,
	});
};
