import {PlayerInternals} from '@remotion/player';
import {createContext, useContext, useLayoutEffect, useMemo} from 'react';
import {Internals} from 'remotion';
import {
	getTimelineWidth,
	getTimelineZoom,
} from '../../helpers/get-timeline-max-zoom';
import {AudioLevelsContext} from '../../state/audio-levels';
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
	const {visible: audioLevelsVisible} = useContext(AudioLevelsContext);
	const {zoom: zoomMap} = useContext(TimelineZoomCtx);
	const videoConfig = Internals.useUnsafeVideoConfig();

	// Toggling the audio levels panel resizes the timeline in the same commit.
	// Measure it before paint instead of waiting for the resize observer, so
	// the tracks are not painted at the previous width first.
	const refreshSize = size?.refresh;
	useLayoutEffect(() => {
		refreshSize?.();
	}, [audioLevelsVisible, refreshSize]);

	const width = useMemo(() => {
		const scrollableWidth = size?.width ?? scrollableRef.current?.clientWidth;
		if (scrollableWidth === undefined) {
			return sliderAreaRef.current?.clientWidth ?? null;
		}

		const durationInFrames = videoConfig?.durationInFrames ?? 1;
		const zoom = getTimelineZoom({
			durationInFrames,
			timelineViewportWidth: scrollableWidth,
			zoom: videoConfig ? (zoomMap[videoConfig.id] ?? null) : null,
		});

		return getTimelineWidth({durationInFrames, zoom});
	}, [size?.width, videoConfig, zoomMap]);

	return (
		<TimelineWidthContext.Provider value={width}>
			{children}
		</TimelineWidthContext.Provider>
	);
};
