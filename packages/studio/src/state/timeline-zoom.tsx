import React, {createContext, useMemo, useState} from 'react';
import {
	getCurrentDuration,
	getCurrentFrame,
} from '../components/Timeline/imperative-state';
import {zoomAndPreserveCursor} from '../components/Timeline/timeline-scroll-logic';
import {getZoomFromLocalStorage} from '../components/ZoomPersistor';

export const TIMELINE_MIN_ZOOM = 1;
export const TIMELINE_MAX_ZOOM = 5;

export const TimelineZoomCtx = createContext<{
	zoom: Record<string, number>;
	setZoom: (compositionId: string, prev: (prevZoom: number) => number) => void;
}>({
	zoom: {},
	setZoom: () => {
		throw new Error('has no context');
	},
});

export const TimelineZoomContext: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [zoom, setZoom] = useState<Record<string, number>>(() =>
		getZoomFromLocalStorage(),
	);

	const value = useMemo(() => {
		return {
			zoom,
			setZoom: (
				compositionId: string,
				callback: (prevZoomLevel: number) => number,
			) => {
				setZoom((prevZoomMap) => {
					const newZoomWithFloatingPointErrors = Math.min(
						TIMELINE_MAX_ZOOM,
						Math.max(
							TIMELINE_MIN_ZOOM,
							callback(prevZoomMap[compositionId] ?? TIMELINE_MIN_ZOOM),
						),
					);
					const newZoom = Math.round(newZoomWithFloatingPointErrors * 10) / 10;

					zoomAndPreserveCursor({
						oldZoom: prevZoomMap[compositionId] ?? TIMELINE_MIN_ZOOM,
						newZoom,
						currentDurationInFrames: getCurrentDuration(),
						currentFrame: getCurrentFrame(),
					});
					return {...prevZoomMap, [compositionId]: newZoom};
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
