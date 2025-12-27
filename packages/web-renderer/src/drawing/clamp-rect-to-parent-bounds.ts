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
		Math.max(
			0,
			Math.min(rect.right, parentRect.right) -
				Math.max(rect.left, parentRect.left),
		),
		Math.max(
			0,
			Math.min(rect.bottom, parentRect.bottom) -
				Math.max(rect.top, parentRect.top),
		),
	);
};
