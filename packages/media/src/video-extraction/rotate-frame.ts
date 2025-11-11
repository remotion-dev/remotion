export const rotateFrame = async ({
	frame,
	rotation,
}: {
	frame: VideoFrame;
	rotation: number;
}): Promise<ImageBitmap> => {
	if (rotation === 0) {
		const directBitmap = await createImageBitmap(frame);
		frame.close();
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
	frame.close();
	return bitmap;
};
