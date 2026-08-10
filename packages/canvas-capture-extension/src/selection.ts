export type SelectionRectangle = {
	readonly left: number;
	readonly top: number;
	readonly right: number;
	readonly bottom: number;
	readonly width: number;
	readonly height: number;
};

export const makeSelectionRectangle = (
	startX: number,
	startY: number,
	endX: number,
	endY: number,
): SelectionRectangle => {
	const left = Math.min(startX, endX);
	const top = Math.min(startY, endY);
	const right = Math.max(startX, endX);
	const bottom = Math.max(startY, endY);
	return {
		left,
		top,
		right,
		bottom,
		width: right - left,
		height: bottom - top,
	};
};
