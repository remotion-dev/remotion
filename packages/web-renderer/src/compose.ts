import type {Composable} from './composable';
import {parseTransformOrigin} from './parse-transform-origin';

type ImgDrawable = {
	image: HTMLImageElement;
	width: number;
	height: number;
	left: number;
	top: number;
	matrix: DOMMatrix;
	transformOrigin: {x: number; y: number};
};

const svgToImageBitmap = (svg: SVGSVGElement): Promise<ImgDrawable | null> => {
	const computedStyle = getComputedStyle(svg);
	const {transform: originalTransform, transformOrigin} = computedStyle;
	// TODO: Parse transform origin
	svg.style.transform = 'none';
	const svgDimensions = svg.getBoundingClientRect();
	svg.style.transform = originalTransform;

	const parsedTransformOrigin = parseTransformOrigin(transformOrigin);

	const matrix = new DOMMatrix(computedStyle.transform!);
	if (svgDimensions.width === 0 || svgDimensions.height === 0) {
		return Promise.resolve(null);
	}

	const svgData = new XMLSerializer().serializeToString(svg);

	return new Promise<ImgDrawable>((resolve) => {
		const image = new Image(svgDimensions.width, svgDimensions.height);
		const url = 'data:image/svg+xml;base64,' + window.btoa(svgData);

		image.onload = function () {
			resolve({
				image,
				width: svgDimensions.width,
				height: svgDimensions.height,
				left: svgDimensions.left,
				top: svgDimensions.top,
				matrix,
				transformOrigin: parsedTransformOrigin ?? {
					x: svgDimensions.width / 2,
					y: svgDimensions.height / 2,
				},
			});
		};

		image.src = url;
	});
};

export const compose = async ({
	composables,
	width,
	height,
}: {
	composables: Composable[];
	width: number;
	height: number;
}) => {
	const canvas = new OffscreenCanvas(width, height);
	const context = canvas.getContext('2d');

	if (!context) {
		throw new Error('Could not get context');
	}

	// TODO: Consider z-index
	for (const composable of composables) {
		if (composable.type === 'canvas') {
			context.drawImage(composable.element, 0, 0);
		} else if (composable.type === 'svg') {
			const imageBitmap = await svgToImageBitmap(composable.element);

			if (imageBitmap) {
				// transform origin
				context.translate(
					imageBitmap.transformOrigin.x,
					imageBitmap.transformOrigin.y,
				);
				context.transform(
					imageBitmap.matrix.a,
					imageBitmap.matrix.b,
					imageBitmap.matrix.c,
					imageBitmap.matrix.d,
					imageBitmap.matrix.e,
					imageBitmap.matrix.f,
				);
				context.translate(
					-imageBitmap.transformOrigin.x,
					-imageBitmap.transformOrigin.y,
				);
				context.drawImage(imageBitmap.image, imageBitmap.left, imageBitmap.top);
				context.setTransform(1, 0, 0, 1, 0, 0);
			}
		}
	}

	return canvas;
};
