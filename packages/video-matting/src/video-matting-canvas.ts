import type {VideoMattingPipelineResult} from './load-video-matting-model';

export type VideoMattingCanvas = HTMLCanvasElement | OffscreenCanvas;

type VideoMattingCanvasContext =
	| CanvasRenderingContext2D
	| OffscreenCanvasRenderingContext2D;

export const createVideoMattingCanvas = ({
	width,
	height,
}: {
	width: number;
	height: number;
}): VideoMattingCanvas => {
	if (typeof OffscreenCanvas !== 'undefined') {
		return new OffscreenCanvas(width, height);
	}

	if (typeof document !== 'undefined') {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		return canvas;
	}

	throw new Error(
		'Could not create a canvas. This API must run in a browser with OffscreenCanvas or the DOM available.',
	);
};

export const getVideoMattingCanvasContext = (
	canvas: VideoMattingCanvas,
): VideoMattingCanvasContext => {
	const context = canvas.getContext('2d', {willReadFrequently: true});
	if (!context) {
		throw new Error('Could not create a 2D canvas context.');
	}

	return context as VideoMattingCanvasContext;
};

export const drawOpaqueBaseFrame = ({
	context,
	source,
	width,
	height,
}: {
	context: VideoMattingCanvasContext;
	source: VideoMattingCanvas;
	width: number;
	height: number;
}) => {
	context.save();
	context.globalCompositeOperation = 'copy';
	context.fillStyle = '#000000';
	context.fillRect(0, 0, width, height);
	context.globalCompositeOperation = 'source-over';
	context.drawImage(source, 0, 0, width, height);
	context.restore();
};

export const drawForegroundFrame = ({
	context,
	result,
	source,
	targetWidth,
	targetHeight,
}: {
	context: VideoMattingCanvasContext;
	result: VideoMattingPipelineResult;
	source: VideoMattingCanvas;
	targetWidth: number;
	targetHeight: number;
}) => {
	if (
		!Number.isInteger(result.width) ||
		result.width <= 0 ||
		!Number.isInteger(result.height) ||
		result.height <= 0
	) {
		throw new Error('The video matting model returned invalid dimensions.');
	}

	const expectedLength = result.width * result.height * result.channels;
	if (result.data.length !== expectedLength) {
		throw new Error(
			`The video matting model returned ${result.data.length} bytes, but ${expectedLength} RGBA bytes were expected.`,
		);
	}

	const imageData = new ImageData(result.data, result.width, result.height);

	context.clearRect(0, 0, targetWidth, targetHeight);
	if (result.width === targetWidth && result.height === targetHeight) {
		context.putImageData(imageData, 0, 0);
	} else {
		const intermediateCanvas = createVideoMattingCanvas({
			width: result.width,
			height: result.height,
		});
		const intermediateContext =
			getVideoMattingCanvasContext(intermediateCanvas);
		intermediateContext.putImageData(imageData, 0, 0);
		context.drawImage(intermediateCanvas, 0, 0, targetWidth, targetHeight);
	}

	context.save();
	context.globalCompositeOperation = 'destination-in';
	context.drawImage(source, 0, 0, targetWidth, targetHeight);
	context.restore();
};
