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
	offsetLeft,
	offsetTop,
	logLevel,
	parentRect,
	internalState,
}: {
	element: HTMLElement | SVGElement;
	context: OffscreenCanvasRenderingContext2D;
	draw: DrawFn;
	offsetLeft: number;
	offsetTop: number;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
}): Promise<ProcessNodeReturnValue> => {
	const transforms = calculateTransforms({element, offsetLeft, offsetTop});

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
		dimensions: new DOMRect(
			dimensions.left - offsetLeft,
			dimensions.top - offsetTop,
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
