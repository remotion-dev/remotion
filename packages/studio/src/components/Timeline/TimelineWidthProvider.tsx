import {PlayerInternals} from '@remotion/player';
import {createContext, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {TIMELINE_MIN_ZOOM, TimelineZoomCtx} from '../../state/timeline-zoom';
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

	const width = useMemo(() => {
		const zoom =
			canvasContent?.type === 'composition'
				? (zoomMap[canvasContent.compositionId] ?? TIMELINE_MIN_ZOOM)
				: TIMELINE_MIN_ZOOM;

		const scrollableWidth = size?.width ?? scrollableRef.current?.clientWidth;
		if (scrollableWidth === undefined) {
			return sliderAreaRef.current?.clientWidth ?? null;
		}

		return scrollableWidth * zoom;
	}, [canvasContent, size?.width, zoomMap]);

	return (
		<TimelineWidthContext.Provider value={width}>
			{children}
		</TimelineWidthContext.Provider>
	);
};
