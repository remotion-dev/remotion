import type {LogLevel} from 'remotion';
import {compose} from './compose';
import type {InternalState} from './internal-state';
import type {RenderStillOnWebImageFormat} from './render-still-on-web';
import {screenshot} from './renoun';

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
		element: div,
		context,
		logLevel,
		parentRect: new DOMRect(0, 0, width, height),
		internalState,
		onlyBackgroundClip: false,
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
	useRenoun = false,
}: {
	div: HTMLDivElement;
	width: number;
	height: number;
	imageFormat: RenderStillOnWebImageFormat;
	logLevel: LogLevel;
	internalState: InternalState;
	useRenoun?: boolean;
}) => {
	if (!useRenoun) {
		const f = await createFrame({
			div,
			width,
			height,
			logLevel,
			internalState,
		});
		return f.convertToBlob({
			type: `image/${imageFormat}`,
		});
	}

	const frame = screenshot(div, {width, height, includeFixed: 'all'});

	const imageData = await frame.blob({
		format: imageFormat,
	});

	return imageData;
};
