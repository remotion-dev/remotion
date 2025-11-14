import type {Composable} from './composable';

type ImgDrawable = {
	image: HTMLImageElement;
	width: number;
	height: number;
	left: number;
	top: number;
};

const svgToImageBitmap = (svg: SVGSVGElement): Promise<ImgDrawable | null> => {
	const computedStyle = getComputedStyle(svg);

	const {transform: originalTransform} = computedStyle;

	// we remove the transform, since it skews the positioning.
	// When we later apply the positioning again, the transform will be applied to the position.
	svg.style.transform = 'none';
	const svgDimensions = svg.getBoundingClientRect();
	svg.style.transform = originalTransform;

	if (svgDimensions.width === 0 || svgDimensions.height === 0) {
		return Promise.resolve(null);
	}

	const svgData = new XMLSerializer().serializeToString(svg);

	return new Promise<ImgDrawable>((resolve, reject) => {
		const image = new Image(svgDimensions.width, svgDimensions.height);
		const url = 'data:image/svg+xml;base64,' + window.btoa(svgData);

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
			// This already takes care of the "transform" of the SVG
			// but not of the transforms of the parent
			const imageBitmap = await svgToImageBitmap(composable.element);

			if (imageBitmap) {
				// transform origin
				// Don't need to get transform from SVG
				context.drawImage(imageBitmap.image, imageBitmap.left, imageBitmap.top);
			}
		}
	}

	return canvas;
};
