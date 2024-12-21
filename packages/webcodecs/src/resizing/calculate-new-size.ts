import type {ConvertMediaVideoCodec} from '../get-available-video-codecs';
import type {Dimensions, ResizingOperation} from './mode';

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
	resizingOperation,
	videoCodec,
}: {
	dimensions: Dimensions;
	resizingOperation: ResizingOperation | null;
	videoCodec: ConvertMediaVideoCodec;
}) => {
	const needsToBeMultipleOfTwo = videoCodec === 'h264';

	if (resizingOperation === null) {
		return ensureMultipleOfTwo({
			dimensions,
			needsToBeMultipleOfTwo,
		});
	}

	if (resizingOperation.mode === 'width') {
		return ensureMultipleOfTwo({
			dimensions: {
				width: resizingOperation.width,
				height: Math.round(
					(resizingOperation.width / dimensions.width) * dimensions.height,
				),
			},
			needsToBeMultipleOfTwo,
		});
	}

	if (resizingOperation.mode === 'height') {
		return ensureMultipleOfTwo({
			dimensions: {
				width: Math.round(
					(resizingOperation.height / dimensions.height) * dimensions.width,
				),
				height: resizingOperation.height,
			},
			needsToBeMultipleOfTwo,
		});
	}

	if (resizingOperation.mode === 'max-height') {
		const height = Math.min(dimensions.height, resizingOperation.maxHeight);
		return ensureMultipleOfTwo({
			dimensions: {
				width: Math.round((height / dimensions.height) * dimensions.width),
				height,
			},
			needsToBeMultipleOfTwo,
		});
	}

	if (resizingOperation.mode === 'max-width') {
		const width = Math.min(dimensions.width, resizingOperation.maxWidth);
		return ensureMultipleOfTwo({
			dimensions: {
				width,
				height: Math.round((width / dimensions.width) * dimensions.height),
			},
			needsToBeMultipleOfTwo,
		});
	}

	if (resizingOperation.mode === 'max-height-width') {
		const height = Math.min(dimensions.height, resizingOperation.maxHeight);
		const width = Math.min(dimensions.width, resizingOperation.maxWidth);

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

	throw new Error(
		'Invalid resizing mode ' + (resizingOperation satisfies never),
	);
};
