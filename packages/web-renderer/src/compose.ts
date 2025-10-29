import type {Composable} from './composable';

type ImgDrawable = {
	image: HTMLImageElement;
	width: number;
	height: number;
	left: number;
	top: number;
};

const svgToImageBitmap = (svg: SVGSVGElement): Promise<ImgDrawable | null> => {
	const svgDimensions = svg.getBoundingClientRect();
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
				context.drawImage(imageBitmap.image, imageBitmap.left, imageBitmap.top);
			}
		}
	}

	return canvas;
};
