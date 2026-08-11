export const setOpacity = ({
	ctx,
	opacity,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	opacity: number;
}) => {
	const previousAlpha = ctx.globalAlpha;
	ctx.globalAlpha = previousAlpha * opacity;

	return () => {
		ctx.globalAlpha = previousAlpha;
	};
};
