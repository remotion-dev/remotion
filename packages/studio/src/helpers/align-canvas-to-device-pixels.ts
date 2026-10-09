import {getDevicePixelAlignedCanvasLayout} from '@remotion/timeline-utils';

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
	const {devicePixelRatio} = window;
	const {
		height: devicePixelHeight,
		horizontalOffset: devicePixelHorizontalOffset,
		width: devicePixelWidth,
	} = getDevicePixelAlignedCanvasLayout({
		containerLeft,
		cssHeight,
		cssWidth,
		devicePixelRatio,
	});
	// Keep DOM geometry on the screen's pixel grid even when the canvas bitmap
	// uses a higher resolution. Drawing offsets are expressed in bitmap pixels.
	const resolutionScale = pixelRatio / devicePixelRatio;
	const width = Math.ceil(devicePixelWidth * resolutionScale);
	const height = Math.ceil(devicePixelHeight * resolutionScale);
	const horizontalOffset = devicePixelHorizontalOffset * resolutionScale;

	canvas.width = width;
	canvas.height = height;
	canvas.style.width = devicePixelWidth / devicePixelRatio + 'px';
	canvas.style.height = devicePixelHeight / devicePixelRatio + 'px';
	if (canvas.style.position === '') {
		canvas.style.position = 'relative';
	}

	canvas.style.left = -devicePixelHorizontalOffset / devicePixelRatio + 'px';

	return {
		height,
		horizontalOffset,
		width,
	};
};
