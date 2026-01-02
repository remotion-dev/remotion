import type {LogLevel} from 'remotion';
import {compose} from '../compose';
import type {InternalState} from '../internal-state';

export const getClippedBackground = async ({
	element,
	boundingRect,
	logLevel,
	internalState,
}: {
	element: HTMLElement | SVGElement;
	boundingRect: DOMRect;
	logLevel: LogLevel;
	internalState: InternalState;
}) => {
	const tempCanvas = new OffscreenCanvas(
		boundingRect.width,
		boundingRect.height,
	);

	const tempContext = tempCanvas.getContext('2d')!;

	await compose({
		element,
		context: tempContext,
		logLevel,
		parentRect: boundingRect,
		internalState,
		onlyBackgroundClip: true,
	});

	return tempContext;
};
