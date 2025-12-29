import type {LogLevel} from 'remotion';
import type {InternalState} from '../internal-state';
import {calculateTransforms} from './calculate-transforms';
import {drawElement} from './draw-element';
import type {DrawFn} from './drawn-fn';
import {handle3dTransform} from './handle-3d-transform';
import {handleMask} from './handle-mask';
import {getMaskImageValue, parseMaskImage} from './mask-image';

export type ProcessNodeReturnValue =
	| {type: 'continue'; cleanupAfterChildren: null | (() => void)}
	| {type: 'skip-children'};

export const processNode = async ({
	element,
	context,
	draw,
	logLevel,
	parentRect,
	internalState,
	rootElement,
}: {
	element: HTMLElement | SVGElement;
	context: OffscreenCanvasRenderingContext2D;
	draw: DrawFn;
	logLevel: LogLevel;
	parentRect: DOMRect;
	internalState: InternalState;
	rootElement: HTMLElement | SVGElement;
}): Promise<ProcessNodeReturnValue> => {
	const transforms = calculateTransforms({
		element,
		rootElement,
	});

	const {totalMatrix, reset, dimensions, opacity, computedStyle} = transforms;

	if (opacity === 0) {
		reset();
		return {type: 'skip-children'};
	}

	if (dimensions.width <= 0 || dimensions.height <= 0) {
		reset();
		return {type: 'continue', cleanupAfterChildren: null};
	}

	const rect = new DOMRect(
		dimensions.left - parentRect.x,
		dimensions.top - parentRect.y,
		dimensions.width,
		dimensions.height,
	);

	// Check for mask-image
	const maskImageValue = getMaskImageValue(computedStyle);
	const maskGradientInfo = maskImageValue
		? parseMaskImage(maskImageValue)
		: null;

	if (maskGradientInfo) {
		await handleMask({
			element,
			parentRect,
			context,
			logLevel,
			internalState,
			gradientInfo: maskGradientInfo,
			rect,
		});
		reset();
		return {type: 'skip-children'};
	}

	if (!totalMatrix.is2D) {
		await handle3dTransform({
			element,
			matrix: totalMatrix,
			parentRect,
			context,
			logLevel,
			internalState,
		});
		reset();
		return {type: 'skip-children'};
	}

	const {cleanupAfterChildren} = await drawElement({
		rect,
		computedStyle,
		context,
		draw,
		opacity,
		totalMatrix,
		parentRect,
		logLevel,
	});

	reset();

	return {type: 'continue', cleanupAfterChildren};
};
