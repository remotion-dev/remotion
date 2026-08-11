import type {CropRectangle} from 'mediabunny';

export const moveCropRect = ({
	previousRect,
	visibleRect,
	left,
	top,
}: {
	readonly previousRect: CropRectangle;
	readonly visibleRect: CropRectangle;
	readonly left: number;
	readonly top: number;
}): CropRectangle => {
	return {
		...previousRect,
		left: Math.round(left),
		top: Math.round(top),
		width: visibleRect.width,
		height: visibleRect.height,
	};
};
