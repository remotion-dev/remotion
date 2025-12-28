export const setTransform = ({
	ctx,
	transform,
	parentRect,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	transform: DOMMatrix;
	parentRect: DOMRect;
}) => {
	const offsetMatrix = new DOMMatrix()
		.translate(-parentRect.x, -parentRect.y)
		.multiply(transform)
		.translate(parentRect.x, parentRect.y);

	ctx.setTransform(offsetMatrix);

	return () => {
		ctx.setTransform(new DOMMatrix());
	};
};
