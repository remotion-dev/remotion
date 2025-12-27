export const canvasOffsetFromRect = ({rect}: {rect: DOMRect}) => {
	const canvasOffsetLeft = Math.min(rect.left, 0);
	const canvasOffsetTop = Math.min(rect.top, 0);

	const canvasWidth = Math.max(rect.width, rect.right);
	const canvasHeight = Math.max(rect.height, rect.bottom);

	return {
		offsetLeft: canvasOffsetLeft,
		offsetTop: canvasOffsetTop,
		canvasWidth,
		canvasHeight,
	};
};
