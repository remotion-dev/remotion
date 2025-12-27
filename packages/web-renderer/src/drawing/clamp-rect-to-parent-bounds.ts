export const clampRectToParentBounds = ({
	rect,
	parentRect,
}: {
	rect: DOMRect;
	parentRect: DOMRect;
}) => {
	return new DOMRect(
		Math.max(rect.left, parentRect.left),
		Math.max(rect.top, parentRect.top),
		Math.min(rect.width, parentRect.width),
		Math.min(rect.height, parentRect.height),
	);
};
