import type {LogLevel} from 'remotion';
import {compose} from '../compose';
import type {InternalState} from '../internal-state';

export const precomposeDOMElement = async ({
	boundingRect,
	element,
	logLevel,
	internalState,
}: {
	boundingRect: DOMRect;
	element: HTMLElement | SVGElement;
	logLevel: LogLevel;
	internalState: InternalState;
}) => {
	const canvas = new OffscreenCanvas(boundingRect.width, boundingRect.height);

	const context = canvas.getContext('2d')!;

	await compose({
		element,
		context,
		logLevel,
		parentRect: boundingRect,
		internalState,
		onlyBackgroundClip: false,
	});

	return {tempCanvas: canvas, tempContext: context};
};
