export const setTransform = ({
	ctx,
	transform,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	transform: DOMMatrix;
}) => {
	ctx.setTransform(transform);

	return () => {
		ctx.setTransform(new DOMMatrix());
	};
};
