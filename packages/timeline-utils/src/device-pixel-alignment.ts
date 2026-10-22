export const getDevicePixelAlignedCanvasLayout = ({
	cssWidth,
	cssHeight,
	containerLeft,
	devicePixelRatio,
}: {
	readonly cssWidth: number;
	readonly cssHeight: number;
	readonly containerLeft: number;
	readonly devicePixelRatio: number;
}) => {
	const containerLeftInPixels = containerLeft * devicePixelRatio;
	const horizontalOffset =
		cssWidth === 0
			? 0
			: containerLeftInPixels - Math.floor(containerLeftInPixels);

	return {
		height: Math.ceil(cssHeight * devicePixelRatio),
		horizontalOffset,
		width: Math.ceil(cssWidth * devicePixelRatio + horizontalOffset),
	};
};

export const snapCanvasPositionToDevicePixel = ({
	position,
	horizontalOffset,
}: {
	readonly position: number;
	readonly horizontalOffset: number;
}) => {
	return Math.floor(position + horizontalOffset) - horizontalOffset;
};
