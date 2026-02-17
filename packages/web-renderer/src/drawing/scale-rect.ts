export const scaleRect = ({
	rect,
	scale,
}: {
	rect: DOMRect;
	scale: number;
}): DOMRect => {
	return new DOMRect(
		rect.x * scale,
		rect.y * scale,
		rect.width * scale,
		rect.height * scale,
	);
};
