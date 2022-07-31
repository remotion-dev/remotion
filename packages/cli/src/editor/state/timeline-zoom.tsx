import React, {createContext, useMemo, useState} from 'react';
import {
	getCurrentDuration,
	getCurrentFrame,
} from '../components/Timeline/imperative-state';
import {zoomAndPreserveCursor} from '../components/Timeline/timeline-scroll-logic';

export const TIMELINE_MIN_ZOOM = 1;
export const TIMELINE_MAX_ZOOM = 5;

export const TimelineZoomCtx = createContext<{
	zoom: number;
	setZoom: (prev: (prevZoom: number) => number) => void;
}>({
	zoom: -1,
	setZoom: () => {
		throw new Error('has no context');
	},
});

export const TimelineZoomContext: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const [zoom, setZoom] = useState(TIMELINE_MIN_ZOOM);

	const value = useMemo(() => {
		return {
			zoom,
			setZoom: (callback: (prevZoom: number) => number) => {
				setZoom((prevZoom) => {
					const newZoom = Math.min(
						TIMELINE_MAX_ZOOM,
						Math.max(TIMELINE_MIN_ZOOM, callback(prevZoom))
					);
					zoomAndPreserveCursor({
						oldZoom: prevZoom,
						newZoom,
						currentDurationInFrames: getCurrentDuration(),
						currentFrame: getCurrentFrame(),
					});
					return newZoom;
				});
			},
		};
	}, [zoom]);

	return (
		<TimelineZoomCtx.Provider value={value}>
			{children}
		</TimelineZoomCtx.Provider>
	);
};
