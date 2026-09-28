export const alignCanvasToDevicePixels = ({
	canvas,
	cssWidth,
	cssHeight,
	pixelRatio,
}: {
	readonly canvas: HTMLCanvasElement;
	readonly cssWidth: number;
	readonly cssHeight: number;
	readonly pixelRatio: number;
}) => {
	const containerLeft =
		canvas.parentElement?.getBoundingClientRect().left ??
		canvas.getBoundingClientRect().left;
	const containerLeftInPixels = containerLeft * pixelRatio;
	// Keep the canvas bitmap on the device-pixel grid. The returned offset lets
	// callers preserve the exact timeline position in their drawing coordinates.
	const horizontalOffset =
		cssWidth === 0
			? 0
			: containerLeftInPixels - Math.floor(containerLeftInPixels);
	const width = Math.ceil(cssWidth * pixelRatio + horizontalOffset);
	const height = Math.ceil(cssHeight * pixelRatio);

	canvas.width = width;
	canvas.height = height;
	canvas.style.width = width / pixelRatio + 'px';
	canvas.style.height = height / pixelRatio + 'px';
	if (canvas.style.position === '') {
		canvas.style.position = 'relative';
	}

	canvas.style.left = -horizontalOffset / pixelRatio + 'px';

	return {
		height,
		horizontalOffset,
		width,
	};
};
