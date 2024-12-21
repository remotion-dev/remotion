import type {MediaParserVideoCodec} from '@remotion/media-parser';
import type {ConvertMediaVideoCodec} from '../get-available-video-codecs';
import type {Dimensions, ResizeOperation} from './mode';

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
	videoCodec,
}: {
	dimensions: Dimensions;
	resizeOperation: ResizeOperation | null;
	videoCodec: ConvertMediaVideoCodec | MediaParserVideoCodec;
}) => {
	const needsToBeMultipleOfTwo = videoCodec === 'h264';

	if (resizeOperation === null) {
		return ensureMultipleOfTwo({
			dimensions,
			needsToBeMultipleOfTwo,
		});
	}

	if (resizeOperation.mode === 'width') {
		return ensureMultipleOfTwo({
			dimensions: {
				width: resizeOperation.width,
				height: Math.round(
					(resizeOperation.width / dimensions.width) * dimensions.height,
				),
			},
			needsToBeMultipleOfTwo,
		});
	}

	if (resizeOperation.mode === 'height') {
		return ensureMultipleOfTwo({
			dimensions: {
				width: Math.round(
					(resizeOperation.height / dimensions.height) * dimensions.width,
				),
				height: resizeOperation.height,
			},
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

	if (resizeOperation.mode === 'max-height-width') {
		const height = Math.min(dimensions.height, resizeOperation.maxHeight);
		const width = Math.min(dimensions.width, resizeOperation.maxWidth);

		const scale = Math.min(
			width / dimensions.width,
			height / dimensions.height,
		);

		const actualWidth = Math.round(dimensions.width * scale);
		const actualHeight = Math.round(dimensions.height * scale);

		return ensureMultipleOfTwo({
			dimensions: {
				height: actualHeight,
				width: actualWidth,
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
