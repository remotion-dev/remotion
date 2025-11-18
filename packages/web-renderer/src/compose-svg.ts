import {calculateTransforms} from './calculate-transforms';

type ImgDrawable = {
	image: HTMLImageElement;
	width: number;
	height: number;
	left: number;
	top: number;
};

export const svgToImageBitmap = (
	svg: SVGSVGElement,
): Promise<ImgDrawable | null> => {
	const {
		dimensions: svgDimensions,
		totalMatrix,
		reset,
	} = calculateTransforms(svg);

	const originalTransform = svg.style.transform;
	const originalTransformOrigin = svg.style.transformOrigin;
	svg.style.transform = totalMatrix.toString();
	svg.style.transformOrigin = '50% 50%';

	// Margins were already included in the positioning calculation,
	// so we need to remove them to avoid double counting.
	svg.style.marginLeft = '0';
	svg.style.marginRight = '0';
	svg.style.marginTop = '0';
	svg.style.marginBottom = '0';

	const svgData = new XMLSerializer().serializeToString(svg);

	svg.style.transform = originalTransform;
	svg.style.transformOrigin = originalTransformOrigin;

	reset();

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
