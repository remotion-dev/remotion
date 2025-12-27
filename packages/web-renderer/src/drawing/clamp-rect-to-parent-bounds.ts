export const getNarrowerRect = ({
	firstRect,
	secondRect,
}: {
	firstRect: DOMRect;
	secondRect: DOMRect;
}) => {
	const left = Math.max(firstRect.left, secondRect.left);
	const top = Math.max(firstRect.top, secondRect.top);
	const bottom = Math.min(firstRect.bottom, secondRect.bottom);
	const right = Math.min(firstRect.right, secondRect.right);

	return new DOMRect(left, top, right - left, bottom - top);
};
