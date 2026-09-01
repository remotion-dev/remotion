import {PlayerInternals} from '@remotion/player';
import {createContext, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {
	getTimelineWidth,
	getTimelineZoom,
} from '../../helpers/get-timeline-max-zoom';
import {TimelineZoomCtx} from '../../state/timeline-zoom';
import {scrollableRef, sliderAreaRef} from './timeline-refs';

type TimelineWidthContextType = number | null;

export const TimelineWidthContext =
	createContext<TimelineWidthContextType>(null);

export const TimelineWidthProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const size = PlayerInternals.useElementSize(scrollableRef, {
		triggerOnWindowResize: false,
		shouldApplyCssTransforms: true,
	});
	const {zoom: zoomMap} = useContext(TimelineZoomCtx);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const videoConfig = Internals.useUnsafeVideoConfig();

	const width = useMemo(() => {
		const scrollableWidth = size?.width ?? scrollableRef.current?.clientWidth;
		if (scrollableWidth === undefined) {
			return sliderAreaRef.current?.clientWidth ?? null;
		}

		const durationInFrames = videoConfig?.durationInFrames ?? 1;
		const zoom = getTimelineZoom({
			durationInFrames,
			timelineViewportWidth: scrollableWidth,
			zoom:
				canvasContent?.type === 'composition'
					? (zoomMap[canvasContent.compositionId] ?? null)
					: null,
		});

		return getTimelineWidth({durationInFrames, zoom});
	}, [canvasContent, size?.width, videoConfig?.durationInFrames, zoomMap]);

	return (
		<TimelineWidthContext.Provider value={width}>
			{children}
		</TimelineWidthContext.Provider>
	);
};
