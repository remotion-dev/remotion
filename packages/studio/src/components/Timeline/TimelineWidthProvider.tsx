import {createContext, useContext} from 'react';
import {Internals} from 'remotion';
import {
	getTimelineWidth,
	getTimelineZoom,
} from '../../helpers/get-timeline-max-zoom';
import {TimelineZoomCtx} from '../../state/timeline-zoom';
import {
	SplitterContext,
	SplitterLayoutContext,
} from '../Splitter/SplitterContext';
import {SPLITTER_HANDLE_SIZE} from '../Splitter/SplitterHandle';

export const TimelineWidthContext = createContext<number | null>(null);
export const TimelineViewportWidthContext = createContext<number | null>(null);

export const TimelineWidthProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const splitterWidth = useContext(SplitterLayoutContext)?.width ?? null;
	const {position} = useContext(SplitterContext);
	const {zoom: zoomMap} = useContext(TimelineZoomCtx);
	const videoConfig = Internals.useUnsafeVideoConfig();

	const viewportWidth =
		splitterWidth === null || position === null
			? null
			: Math.max(
					0,
					Math.round(
						splitterWidth - SPLITTER_HANDLE_SIZE - position.positionInPixels,
					),
				);

	const durationInFrames = videoConfig?.durationInFrames ?? 1;
	const contentWidth =
		viewportWidth === null
			? null
			: getTimelineWidth({
					durationInFrames,
					zoom: getTimelineZoom({
						durationInFrames,
						timelineViewportWidth: viewportWidth,
						zoom:
							videoConfig === null ? null : (zoomMap[videoConfig.id] ?? null),
					}),
				});

	return (
		<TimelineViewportWidthContext.Provider value={viewportWidth}>
			<TimelineWidthContext.Provider value={contentWidth}>
				{children}
			</TimelineWidthContext.Provider>
		</TimelineViewportWidthContext.Provider>
	);
};
