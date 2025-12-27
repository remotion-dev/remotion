export function doRectsIntersect(rect1: DOMRect, rect2: DOMRect) {
	return !(
		rect1.right <= rect2.left ||
		rect1.left >= rect2.right ||
		rect1.bottom <= rect2.top ||
		rect1.top >= rect2.bottom
	);
}
