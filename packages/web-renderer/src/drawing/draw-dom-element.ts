import type {DrawFn} from './drawn-fn';
import {turnSvgIntoDrawable} from './turn-svg-into-drawable';

const getReadableImageError = (
	err: unknown,
	node: HTMLImageElement,
): Error | null => {
	if (!(err instanceof DOMException)) {
		return null;
	}

	if (err.name === 'SecurityError') {
		return new Error(
			`Could not draw image with src="${node.src}" to canvas: ` +
				`The image is tainted due to CORS restrictions. ` +
				`The server hosting this image must respond with the "Access-Control-Allow-Origin" header. ` +
				`See: https://remotion.dev/docs/client-side-rendering/migration`,
		);
	}

	if (err.name === 'InvalidStateError') {
		return new Error(
			`Could not draw image with src="${node.src}" to canvas: ` +
				`The image is in a broken state. ` +
				`This usually means the image failed to load - check that the URL is valid and accessible.`,
		);
	}

	return null;
};

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

		try {
			contextToDraw.drawImage(
				drawable,
				dimensions.left,
				dimensions.top,
				dimensions.width,
				dimensions.height,
			);
		} catch (err) {
			// Check if we should ignore errors for this element
			if (
				node instanceof HTMLImageElement &&
				node.dataset.remotionErrorBehavior === 'ignore'
			) {
				return;
			}

			// Provide readable error messages for image errors
			if (node instanceof HTMLImageElement) {
				const readableError = getReadableImageError(err, node);
				if (readableError) {
					throw readableError;
				}
			}

			throw err;
		}
	};

	return domDrawFn;
};
