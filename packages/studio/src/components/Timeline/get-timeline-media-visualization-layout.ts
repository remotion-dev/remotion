export const getTimelineMediaVisualizationLayout = ({
	visualizationWidth,
	premountWidth,
	postmountWidth,
}: {
	readonly visualizationWidth: number;
	readonly premountWidth: number;
	readonly postmountWidth: number;
}) => {
	return {
		marginLeft: premountWidth,
		width: Math.max(0, visualizationWidth - premountWidth - postmountWidth),
	};
};
