import type {LogLevel} from 'remotion';
import {compose} from '../compose';
import type {InternalState} from '../internal-state';

export const precomposeDOMElement = async ({
	boundingRect,
	element,
	logLevel,
	internalState,
	scale,
}: {
	boundingRect: DOMRect;
	element: HTMLElement | SVGElement;
	logLevel: LogLevel;
	internalState: InternalState;
	scale: number;
}) => {
	const tempCanvas = new OffscreenCanvas(
		Math.ceil(boundingRect.width * scale),
		Math.ceil(boundingRect.height * scale),
	);

	const tempContext = tempCanvas.getContext('2d')!;

	await compose({
		element,
		context: tempContext,
		logLevel,
		parentRect: boundingRect,
		internalState,
		onlyBackgroundClip: false,
		scale,
	});

	return {tempCanvas, tempContext};
};
