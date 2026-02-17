export const setTransform = ({
	ctx,
	transform,
	parentRect,
	scale,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	transform: DOMMatrix;
	parentRect: DOMRect;
	scale: number;
}) => {
	const offsetMatrix = new DOMMatrix()
		.scale(scale, scale)
		.translate(-parentRect.x, -parentRect.y)
		.multiply(transform)
		.translate(parentRect.x, parentRect.y);

	ctx.setTransform(offsetMatrix);

	return () => {
		ctx.setTransform(new DOMMatrix());
	};
};
