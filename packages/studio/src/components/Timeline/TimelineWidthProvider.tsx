import {PlayerInternals} from '@remotion/player';
import {createContext, useContext, useLayoutEffect, useMemo} from 'react';
import {Internals} from 'remotion';
import {
	getMaxTimelineZoom,
	TIMELINE_MIN_ZOOM,
	TimelineZoomCtx,
} from '../../state/timeline-zoom';
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
	const videoConfig = Internals.useUnsafeVideoConfig();
	const {setMaxZoom, zoom: zoomMap} = useContext(TimelineZoomCtx);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const timelineViewportWidth =
		size?.width ?? scrollableRef.current?.clientWidth ?? null;
	const compositionId =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;
	const maxZoom =
		videoConfig && timelineViewportWidth
			? getMaxTimelineZoom({
					durationInFrames: videoConfig.durationInFrames,
					timelineViewportWidth,
				})
			: null;

	useLayoutEffect(() => {
		if (compositionId === null || maxZoom === null) {
			return;
		}

		setMaxZoom(compositionId, maxZoom);
	}, [compositionId, maxZoom, setMaxZoom]);

	const width = useMemo(() => {
		const zoom =
			compositionId !== null
				? (zoomMap[compositionId] ?? TIMELINE_MIN_ZOOM)
				: TIMELINE_MIN_ZOOM;

		if (timelineViewportWidth === null) {
			return sliderAreaRef.current?.clientWidth ?? null;
		}

		return timelineViewportWidth * zoom;
	}, [compositionId, timelineViewportWidth, zoomMap]);

	return (
		<TimelineWidthContext.Provider value={width}>
			{children}
		</TimelineWidthContext.Provider>
	);
};
