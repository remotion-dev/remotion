import type {LogLevel} from 'remotion';
import type {InternalState} from '../internal-state';
import {calculateTransforms} from './calculate-transforms';
import {drawElement} from './draw-element';
import type {DrawFn} from './drawn-fn';
import {handle3dTransform} from './handle-3d-transform';

export type ProcessNodeReturnValue =
	| {type: 'continue'; cleanupAfterChildren: () => void}
	| {type: 'skip-children'};

export const processNode = async ({
	element,
	context,
	draw,
	logLevel,
	parentRect,
	internalState,
}: {
	element: HTMLElement | SVGElement;
	context: OffscreenCanvasRenderingContext2D;
	draw: DrawFn;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
}): Promise<ProcessNodeReturnValue> => {
	const transforms = calculateTransforms({
		element,
		offsetLeft: parentRect.x,
		offsetTop: parentRect.y,
	});

	const {totalMatrix, reset, dimensions, opacity, computedStyle} = transforms;

	if (opacity === 0) {
		reset();
		return {type: 'continue', cleanupAfterChildren: () => {}};
	}

	if (dimensions.width <= 0 || dimensions.height <= 0) {
		reset();
		return {type: 'continue', cleanupAfterChildren: () => {}};
	}

	if (!totalMatrix.is2D) {
		await handle3dTransform({
			element,
			totalMatrix,
			parentRect,
			context,
			logLevel,
			internalState,
		});
		reset();
		return {type: 'skip-children'};
	}

	const {cleanupAfterChildren} = await drawElement({
		rect: new DOMRect(
			dimensions.left - parentRect.x,
			dimensions.top - parentRect.y,
			dimensions.width,
			dimensions.height,
		),
		computedStyle,
		context,
		draw,
		opacity,
		totalMatrix,
	});

	reset();

	return {type: 'continue', cleanupAfterChildren};
};
