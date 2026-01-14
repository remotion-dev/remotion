import type {LogLevel} from 'remotion';
import {compose} from '../compose';
import type {InternalState} from '../internal-state';

export const precomposeDOMElement = async ({
	boundingRect,
	element,
	logLevel,
	internalState,
	scale,
	onlyBackgroundClipText,
}: {
	boundingRect: DOMRect;
	element: HTMLElement | SVGElement;
	logLevel: LogLevel;
	internalState: InternalState;
	scale: number;
	onlyBackgroundClipText: boolean;
}) => {
	const tempCanvas = new OffscreenCanvas(
		Math.ceil(boundingRect.width * scale),
		Math.ceil(boundingRect.height * scale),
	);

	const context = tempCanvas.getContext('2d')!;

	await compose({
		element,
		context,
		logLevel,
		parentRect: boundingRect,
		internalState,
		onlyBackgroundClipText,
		scale,
	});

	return context;
};
