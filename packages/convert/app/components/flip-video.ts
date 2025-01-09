export const flipVideoFrame = ({
	frame,
	horizontal,
	vertical,
}: {
	frame: VideoFrame;
	horizontal: boolean;
	vertical: boolean;
}) => {
	if (!horizontal && !vertical) {
		return frame;
	}

	const canvas = new OffscreenCanvas(frame.displayWidth, frame.displayHeight);
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get 2d context');
	}

	canvas.width = frame.displayWidth;
	canvas.height = frame.displayHeight;
	ctx.translate(
		horizontal ? frame.displayWidth : 0,
		vertical ? frame.displayHeight : 0,
	);
	ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
	ctx.drawImage(frame, 0, 0);

	return new VideoFrame(canvas, {
		displayHeight: frame.displayHeight,
		displayWidth: frame.displayWidth,
		duration: frame.duration ?? undefined,
		timestamp: frame.timestamp,
	});
};
