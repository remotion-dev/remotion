import type {LogLevel} from 'remotion';
import {compose} from '../compose';
import type {InternalState} from '../internal-state';

export const precomposeDOMElement = async ({
	boundingRect,
	element,
	logLevel,
	internalState,
	isIn3dRenderingContext,
}: {
	boundingRect: DOMRect;
	element: HTMLElement | SVGElement;
	logLevel: LogLevel;
	internalState: InternalState;
	isIn3dRenderingContext: DOMMatrix | null;
}) => {
	const canvas = new OffscreenCanvas(boundingRect.width, boundingRect.height);

	const context = canvas.getContext('2d')!;

	const {elementsToBeRenderedIndependently} = await compose({
		rootElement: element,
		context,
		logLevel,
		parentRect: boundingRect,
		internalState,
		onlyBackgroundClip: false,
		isIn3dRenderingContext,
	});

	return {
		tempCanvas: canvas,
		tempContext: context,
		elementsToBeRenderedIndependently,
	};
};
