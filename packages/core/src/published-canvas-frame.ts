type CanvasFrameSource = HTMLCanvasElement | OffscreenCanvas;

const publishedCanvasFrames = new WeakMap<HTMLCanvasElement, OffscreenCanvas>();

export const publishCanvasFrame = ({
	canvas,
	source,
}: {
	readonly canvas: HTMLCanvasElement;
	readonly source: CanvasFrameSource;
}): void => {
	if (typeof OffscreenCanvas === 'undefined') {
		return;
	}

	let publishedFrame = publishedCanvasFrames.get(canvas);
	if (
		!publishedFrame ||
		publishedFrame.width !== source.width ||
		publishedFrame.height !== source.height
	) {
		publishedFrame = new OffscreenCanvas(source.width, source.height);
		publishedCanvasFrames.set(canvas, publishedFrame);
	}

	const context = publishedFrame.getContext('2d');
	if (!context) {
		throw new Error(
			'Could not create a 2D context for a published canvas frame',
		);
	}

	context.reset();
	context.drawImage(source, 0, 0);
};

export const getPublishedCanvasFrame = (
	canvas: HTMLCanvasElement,
): OffscreenCanvas | null => {
	return publishedCanvasFrames.get(canvas) ?? null;
};
