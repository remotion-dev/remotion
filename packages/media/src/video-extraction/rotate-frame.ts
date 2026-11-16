export const rotateFrame = async ({
	frame,
	rotation,
	flip,
}: {
	frame: VideoFrame;
	rotation: number;
	flip: boolean;
}): Promise<ImageBitmap> => {
	if (rotation === 0 && !flip) {
		const directBitmap = await createImageBitmap(frame);
		return directBitmap;
	}

	const width =
		rotation === 90 || rotation === 270
			? frame.displayHeight
			: frame.displayWidth;
	const height =
		rotation === 90 || rotation === 270
			? frame.displayWidth
			: frame.displayHeight;

	const canvas = new OffscreenCanvas(width, height);
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get 2d context');
	}

	canvas.width = width;
	canvas.height = height;

	// Mediabunny applies the flip after the rotation.
	// Canvas transforms run in reverse order, so we set the flip first.
	if (flip) {
		ctx.translate(width, 0);
		ctx.scale(-1, 1);
	}

	if (rotation === 90) {
		ctx.translate(width, 0);
	} else if (rotation === 180) {
		ctx.translate(width, height);
	} else if (rotation === 270) {
		ctx.translate(0, height);
	}

	ctx.rotate(rotation * (Math.PI / 180));
	ctx.drawImage(frame, 0, 0);

	const bitmap = await createImageBitmap(canvas);
	return bitmap;
};
