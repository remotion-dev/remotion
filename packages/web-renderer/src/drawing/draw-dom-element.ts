import type {DrawFn} from './drawn-fn';
import {turnSvgIntoDrawable} from './turn-svg-into-drawable';

export const drawDomElement = (node: HTMLElement | SVGElement) => {
	const domDrawFn: DrawFn = async ({dimensions, contextToDraw}) => {
		const drawable = await (node instanceof SVGSVGElement
			? turnSvgIntoDrawable(node)
			: node instanceof HTMLImageElement
				? node
				: node instanceof HTMLCanvasElement
					? node
					: null);

		if (!drawable) {
			return;
		}

		contextToDraw.drawImage(
			drawable,
			dimensions.left,
			dimensions.top,
			dimensions.width,
			dimensions.height,
		);
	};

	return domDrawFn;
};
