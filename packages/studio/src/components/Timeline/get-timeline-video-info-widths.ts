import {getTimelineMediaVisualizationLayout} from './get-timeline-media-visualization-layout';

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
	return {
		mediaVisualizationWidth: getTimelineMediaVisualizationLayout({
			visualizationWidth,
			premountWidth,
			postmountWidth,
		}).width,
		mediaNaturalWidth: getTimelineMediaVisualizationLayout({
			visualizationWidth: naturalWidth,
			premountWidth,
			postmountWidth,
		}).width,
	};
};
