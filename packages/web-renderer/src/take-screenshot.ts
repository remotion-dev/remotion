import type {LogLevel} from 'remotion';
import {compose} from './compose';
import type {InternalState} from './internal-state';
import type {RenderStillOnWebImageFormat} from './render-still-on-web';

export const createFrame = async ({
	div,
	width,
	height,
	logLevel,
	internalState,
}: {
	div: HTMLDivElement;
	width: number;
	height: number;
	logLevel: LogLevel;
	internalState: InternalState;
}) => {
	const canvas = new OffscreenCanvas(width, height);
	const context = canvas.getContext('2d');

	if (!context) {
		throw new Error('Could not get context');
	}

	await compose({
		rootElement: div,
		context,
		logLevel,
		parentRect: new DOMRect(0, 0, width, height),
		internalState,
		onlyBackgroundClip: false,
		isIn3dRenderingContext: null,
	});

	return canvas;
};

export const takeScreenshot = async ({
	div,
	width,
	height,
	imageFormat,
	logLevel,
	internalState,
}: {
	div: HTMLDivElement;
	width: number;
	height: number;
	imageFormat: RenderStillOnWebImageFormat;
	logLevel: LogLevel;
	internalState: InternalState;
}) => {
	const frame = await createFrame({
		div,
		width,
		height,
		logLevel,
		internalState,
	});

	const imageData = await frame.convertToBlob({
		type: `image/${imageFormat}`,
	});

	return imageData;
};
