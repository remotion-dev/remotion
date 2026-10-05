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
	const {height, horizontalOffset, width} = getDevicePixelAlignedCanvasLayout({
		containerLeft,
		cssHeight,
		cssWidth,
		devicePixelRatio: pixelRatio,
	});

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
