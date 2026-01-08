import {type LogLevel} from 'remotion';
import type {InternalState} from '../internal-state';
import {calculateTransforms} from './calculate-transforms';
import {drawElement} from './draw-element';
import type {DrawFn} from './drawn-fn';
import {precomposeAndDraw} from './precompose-and-draw';

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
	using transforms = calculateTransforms({
		element,
		rootElement,
	});

	const {opacity, computedStyle, totalMatrix, dimensions, precompositing} =
		transforms;

	if (opacity === 0) {
		return {type: 'skip-children'};
	}

	// When backfaceVisibility is 'hidden', don't render if the element is rotated
	// to show its backface. The backface is visible when the z-component of the
	// transformed normal vector (0, 0, 1) is negative, which corresponds to m33 < 0.
	if (computedStyle.backfaceVisibility === 'hidden' && totalMatrix.m33 < 0) {
		return {type: 'skip-children'};
	}

	if (dimensions.width <= 0 || dimensions.height <= 0) {
		return {type: 'continue', cleanupAfterChildren: null};
	}

	const rect = new DOMRect(
		dimensions.left - parentRect.x,
		dimensions.top - parentRect.y,
		dimensions.width,
		dimensions.height,
	);

	if (precompositing.needsPrecompositing) {
		const elementsIn3dRenderingContext = [element];

		const planes = [];

		for (const e of elementsIn3dRenderingContext) {
			const results = await precomposeAndDraw({
				element: e,
				logLevel,
				parentRect,
				internalState,
				precompositing,
				totalMatrix,
				rect,
			});
			if (results === null) {
				continue;
			}

			planes.push(results);
		}

		for (const plane of planes) {
			const previousTransform = context.getTransform();
			context.setTransform(new DOMMatrix());
			context.drawImage(
				plane.drawable,
				0,
				plane.drawable.height - plane.rectAfterTransforms.height,
				plane.rectAfterTransforms.width,
				plane.rectAfterTransforms.height,
				plane.rectAfterTransforms.left - parentRect.x,
				plane.rectAfterTransforms.top - parentRect.y,
				plane.rectAfterTransforms.width,
				plane.rectAfterTransforms.height,
			);

			context.setTransform(previousTransform);
		}

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
		element,
		internalState,
	});

	return {type: 'continue', cleanupAfterChildren};
};
