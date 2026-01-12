import type {LogLevel} from 'remotion';
import {compose} from './compose';
import type {InternalState} from './internal-state';
import type {RenderStillOnWebImageFormat} from './render-still-on-web';

export const createFrame = async ({
	div,
	width,
	height,
	scale,
	logLevel,
	internalState,
}: {
	div: HTMLDivElement;
	width: number;
	height: number;
	scale: number;
	logLevel: LogLevel;
	internalState: InternalState;
}) => {
	const scaledWidth = Math.round(width * scale);
	const scaledHeight = Math.round(height * scale);
	const canvas = new OffscreenCanvas(scaledWidth, scaledHeight);
	const context = canvas.getContext('2d');

	if (!context) {
		throw new Error('Could not get context');
	}

	await compose({
		element: div,
		context,
		logLevel,
		parentRect: new DOMRect(0, 0, width, height),
		internalState,
		onlyBackgroundClip: false,
		scale,
	});

	return canvas;
};

export const takeScreenshot = async ({
	div,
	width,
	height,
	scale,
	imageFormat,
	logLevel,
	internalState,
}: {
	div: HTMLDivElement;
	width: number;
	height: number;
	scale: number;
	imageFormat: RenderStillOnWebImageFormat;
	logLevel: LogLevel;
	internalState: InternalState;
}) => {
	const frame = await createFrame({
		div,
		width,
		height,
		scale,
		logLevel,
		internalState,
	});

	const imageData = await frame.convertToBlob({
		type: `image/${imageFormat}`,
	});

	return imageData;
};
