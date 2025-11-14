import type {Composable} from './composable';

type ImgDrawable = {
	image: HTMLImageElement;
	width: number;
	height: number;
	left: number;
	top: number;
};

type Transform = {
	matrix: DOMMatrix;
	rect: HTMLElement | SVGSVGElement;
	transformOrigin: string;
	boundingClientRect: DOMRect | null;
};

const svgToImageBitmap = (svg: SVGSVGElement): Promise<ImgDrawable | null> => {
	// Compute the cumulative transform by traversing parent nodes
	let parent: HTMLElement | SVGSVGElement | null = svg;
	const transforms: Transform[] = [];
	const toReset: (() => void)[] = [];
	while (parent) {
		const computedStyle = getComputedStyle(parent);
		if (
			(computedStyle.transform && computedStyle.transform !== 'none') ||
			parent === svg
		) {
			const matrix = new DOMMatrix(computedStyle.transform);
			const {transform} = parent.style;
			parent.style.transform = 'none';
			transforms.push({
				matrix,
				rect: parent,
				transformOrigin: computedStyle.transformOrigin,
				boundingClientRect: null,
			});
			const parentRef = parent;
			toReset.push(() => {
				parentRef!.style.transform = transform;
			});
		}

		parent = parent.parentElement;
	}

	for (const transform of transforms) {
		transform.boundingClientRect = transform.rect.getBoundingClientRect();
	}

	const svgDimensions = transforms[0].boundingClientRect!;

	let totalMatrix = new DOMMatrix();
	for (const transform of transforms.slice().reverse()) {
		const [xTo, yTo] = transform.transformOrigin.split(' ');
		const originX = parseFloat(xTo);
		const originY = parseFloat(yTo);

		if (!transform.boundingClientRect) {
			throw new Error('Bounding client rect not found');
		}

		const centerX = transform.boundingClientRect.width / 2;
		const centerY = transform.boundingClientRect.height / 2;

		const deviationFromX = centerX - originX;
		const deviationFromY = centerY - originY;

		totalMatrix = totalMatrix
			.translate(-deviationFromX, -deviationFromX)
			.multiply(transform.matrix)
			.translate(deviationFromX, deviationFromY);
	}

	// For preview: Not modifying the DOM here, but if you want
	// you could set svg.style.transform = cumulativeTransform after getting bounding rect

	const originalTransform = svg.style.transform;
	const originalTransformOrigin = svg.style.transformOrigin;
	svg.style.transform = totalMatrix.toString();
	svg.style.transformOrigin = '50% 50%';
	const svgData = new XMLSerializer().serializeToString(svg);

	svg.style.transform = originalTransform;
	svg.style.transformOrigin = originalTransformOrigin;

	for (const reset of toReset) {
		reset();
	}

	return new Promise<ImgDrawable>((resolve, reject) => {
		const image = new Image(svgDimensions.width, svgDimensions.height);
		const url = `data:image/svg+xml;base64,${btoa(svgData)}`;

		image.onload = function () {
			resolve({
				image,
				width: svgDimensions.width,
				height: svgDimensions.height,
				left: svgDimensions.left,
				top: svgDimensions.top,
			});
		};

		image.onerror = () => {
			reject(new Error('Failed to convert SVG to image'));
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
			const boundingClientRect = composable.element.getBoundingClientRect();
			context.drawImage(
				composable.element,
				boundingClientRect.left,
				boundingClientRect.top,
			);
		} else if (composable.type === 'svg') {
			// This already accumulates the transforms of the parent

			const imageBitmap = await svgToImageBitmap(composable.element);

			if (imageBitmap) {
				context.drawImage(imageBitmap.image, imageBitmap.left, imageBitmap.top);
			}
		}
	}

	return canvas;
};
