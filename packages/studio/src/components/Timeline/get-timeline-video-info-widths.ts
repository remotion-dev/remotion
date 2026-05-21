export const getTimelineVideoInfoWidths = ({
	visualizationWidth,
	naturalWidth,
	premountWidth,
	postmountWidth,
}: {
	visualizationWidth: number;
	naturalWidth: number;
	premountWidth: number;
	postmountWidth: number;
}) => {
	const mountWidth = premountWidth + postmountWidth;

	return {
		mediaVisualizationWidth: Math.max(0, visualizationWidth - mountWidth),
		mediaNaturalWidth: Math.max(0, naturalWidth - mountWidth),
	};
};
