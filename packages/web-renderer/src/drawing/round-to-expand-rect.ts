export const roundToExpandRect = (rect: DOMRect) => {
	const left = Math.floor(rect.left);
	const top = Math.floor(rect.top);
	const right = Math.ceil(rect.right);
	const bottom = Math.ceil(rect.bottom);

	return new DOMRect(left, top, right - left, bottom - top);
};
