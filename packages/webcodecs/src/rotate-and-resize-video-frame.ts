import type {ResizeOperation} from './resizing/mode';
import {
	calculateNewDimensionsFromRotate,
	calculateNewDimensionsFromRotateAndScale,
} from './rotation';

export const normalizeVideoRotation = (rotation: number) => {
	return ((rotation % 360) + 360) % 360;
};

export const rotateAndResizeVideoFrame = ({
	frame,
	rotation,
	needsToBeMultipleOfTwo = false,
	resizeOperation,
}: {
	frame: VideoFrame;
	rotation: number;
	resizeOperation: ResizeOperation | null;
	needsToBeMultipleOfTwo?: boolean;
}) => {
	const normalized = normalizeVideoRotation(rotation);

	// No resize, no rotation
	if (normalized === 0 && resizeOperation === null) {
		return frame;
	}

	if (normalized % 90 !== 0) {
		throw new Error('Only 90 degree rotations are supported');
	}

	const {height, width} = calculateNewDimensionsFromRotateAndScale({
		height: frame.displayHeight,
		width: frame.displayWidth,
		rotation,
		needsToBeMultipleOfTwo,
		resizeOperation,
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

	// @ts-expect-error
	const frameRotation: number = frame.rotation ?? 0;
	const canvasRotationToApply = normalizeVideoRotation(
		normalized + frameRotation,
	);

	if (canvasRotationToApply === 90) {
		ctx.translate(width, 0);
	} else if (canvasRotationToApply === 180) {
		ctx.translate(width, height);
	} else if (canvasRotationToApply === 270) {
		ctx.translate(0, height);
	}

	if (canvasRotationToApply !== 0) {
		ctx.rotate(canvasRotationToApply * (Math.PI / 180));
	}

	if (frame.displayHeight !== height || frame.displayWidth !== width) {
		const dimensionsAfterRotate = calculateNewDimensionsFromRotate({
			height: frame.displayHeight,
			rotation,
			width: frame.displayWidth,
		});
		ctx.scale(
			width / dimensionsAfterRotate.width,
			height / dimensionsAfterRotate.height,
		);
	}

	ctx.drawImage(frame, 0, 0);

	return new VideoFrame(canvas, {
		displayHeight: height,
		displayWidth: width,
		duration: frame.duration ?? undefined,
		timestamp: frame.timestamp,
	});
};
