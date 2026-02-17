import type {LogLevel} from 'remotion';
import {compose} from './compose';
import type {InternalState} from './internal-state';

export const createLayer = async ({
	element,
	scale,
	logLevel,
	internalState,
	onlyBackgroundClipText,
	cutout,
}: {
	element: HTMLElement | SVGElement;
	scale: number;
	logLevel: LogLevel;
	internalState: InternalState;
	onlyBackgroundClipText: boolean;
	cutout: DOMRect;
}) => {
	const scaledWidth = Math.ceil(cutout.width * scale);
	const scaledHeight = Math.ceil(cutout.height * scale);
	const canvas = new OffscreenCanvas(scaledWidth, scaledHeight);
	const context = canvas.getContext('2d');

	if (!context) {
		throw new Error('Could not get context');
	}

	await compose({
		element,
		context,
		logLevel,
		parentRect: cutout,
		internalState,
		onlyBackgroundClipText,
		scale,
	});

	return context;
};
