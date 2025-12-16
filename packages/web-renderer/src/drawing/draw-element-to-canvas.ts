import {calculateTransforms} from './calculate-transforms';
import {drawElement} from './draw-element';
import {transformIn3d} from './transform-in-3d';

export const drawElementToCanvas = async ({
	element,
	context,
	draw,
}: {
	element: HTMLElement | SVGElement;
	context: OffscreenCanvasRenderingContext2D;
	draw: (
		dimensions: DOMRect,
		computedStyle: CSSStyleDeclaration,
	) => Promise<void> | void;
}) => {
	const {totalMatrix, reset, dimensions, opacity, computedStyle} =
		calculateTransforms(element);

	if (opacity === 0) {
		reset();
		return;
	}

	if (dimensions.width <= 0 || dimensions.height <= 0) {
		reset();
		return;
	}

	if (!totalMatrix.is2D) {
		const tempCanvasWidth = Math.max(dimensions.width, dimensions.right);
		const tempCanvasHeight = Math.max(dimensions.height, dimensions.bottom);
		const tempCanvas = new OffscreenCanvas(tempCanvasWidth, tempCanvasHeight);
		const context2 = tempCanvas.getContext('2d');
		if (!context2) {
			throw new Error('Could not get context');
		}

		await drawElement({
			dimensions,
			computedStyle,
			context: context2,
			draw,
			opacity,
			totalMatrix: new DOMMatrix(),
		});

		const transformed = transformIn3d({
			canvasWidth: tempCanvasWidth,
			canvasHeight: tempCanvasHeight,
			matrix: totalMatrix,
			sourceCanvas: tempCanvas,
		});
		context.drawImage(transformed, 0, 0);
	} else {
		await drawElement({
			dimensions,
			computedStyle,
			context,
			draw,
			opacity,
			totalMatrix,
		});
	}

	reset();
};
