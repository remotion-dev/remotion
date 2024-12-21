import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import type {ResizingOperation} from './resizing/mode';
import {calculateNewDimensionsFromDimensions} from './rotation';

export const normalizeVideoRotation = (rotation: number) => {
	return ((rotation % 360) + 360) % 360;
};

export const rotateAndResizeVideoFrame = ({
	frame,
	rotation,
	videoCodec,
	resizingOperation,
}: {
	frame: VideoFrame;
	rotation: number;
	videoCodec: ConvertMediaVideoCodec;
	resizingOperation: ResizingOperation | null;
}) => {
	const normalized = ((rotation % 360) + 360) % 360;

	// No resize, no rotation
	if (normalized === 0 && resizingOperation === null) {
		return frame;
	}

	if (normalized % 90 !== 0) {
		throw new Error('Only 90 degree rotations are supported');
	}

	const {height, width} = calculateNewDimensionsFromDimensions({
		height: frame.displayHeight,
		width: frame.displayWidth,
		rotation,
		videoCodec,
		resizingOperation,
	});

	// No rotation, and resize turned out to be same dimensions
	if (
		normalized === 0 &&
		height === frame.displayHeight &&
		width === frame.displayWidth
	) {
		return frame;
	}

	const canvas = new OffscreenCanvas(width, height);
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get 2d context');
	}

	canvas.width = width;
	canvas.height = height;

	if (normalized === 90) {
		ctx.translate(width, 0);
	} else if (normalized === 180) {
		ctx.translate(width, height);
	} else if (normalized === 270) {
		ctx.translate(0, height);
	}

	if (normalized !== 0) {
		ctx.rotate(normalized * (Math.PI / 180));
	}

	if (frame.displayHeight !== height || frame.displayWidth !== width) {
		ctx.scale(width / frame.displayWidth, height / frame.displayHeight);
	}

	ctx.drawImage(frame, 0, 0);

	return new VideoFrame(canvas, {
		displayHeight: height,
		displayWidth: width,
		duration: frame.duration ?? undefined,
		timestamp: frame.timestamp,
	});
};
