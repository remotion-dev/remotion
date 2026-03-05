export const setFilter = ({
	ctx,
	filter,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	filter: string;
}) => {
	const previousFilter = ctx.filter;
	if (filter && filter !== 'none') {
		ctx.filter = filter;
	}

	return () => {
		ctx.filter = previousFilter;
	};
};
