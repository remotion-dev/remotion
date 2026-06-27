import React, {createContext, useCallback, useMemo, useState} from 'react';
import {flushSync} from 'react-dom';
import {
	getCurrentDuration,
	getCurrentFrame,
} from '../components/Timeline/imperative-state';
import {zoomAndPreserveCursor} from '../components/Timeline/timeline-scroll-logic';
import {getZoomFromLocalStorage} from '../components/ZoomPersistor';

export const TIMELINE_MIN_ZOOM = 1;
export const TIMELINE_MAX_ZOOM = 5;

export type TimelineSetZoomOptions = {
	anchorFrame: number | null;
	anchorContentX: number | null;
};

export const TimelineZoomCtx = createContext<{
	zoom: Record<string, number>;
	setZoom: (
		compositionId: string,
		prev: (prevZoom: number) => number,
		options?: TimelineSetZoomOptions,
	) => void;
}>({
	zoom: {},
	setZoom: () => {
		throw new Error('has no context');
	},
});

export const TimelineZoomContext: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [zoom, setZoomState] = useState<Record<string, number>>(() =>
		getZoomFromLocalStorage(),
	);

	const setZoom = useCallback(
		(
			compositionId: string,
			callback: (prevZoomLevel: number) => number,
			options?: TimelineSetZoomOptions,
		) => {
			flushSync(() => {
				setZoomState((prevZoomMap) => {
					const newZoomWithFloatingPointErrors = Math.min(
						TIMELINE_MAX_ZOOM,
						Math.max(
							TIMELINE_MIN_ZOOM,
							callback(prevZoomMap[compositionId] ?? TIMELINE_MIN_ZOOM),
						),
					);
					const newZoom = Math.round(newZoomWithFloatingPointErrors * 10) / 10;

					const anchorFrame = options?.anchorFrame ?? null;
					const anchorContentX = options?.anchorContentX ?? null;

					zoomAndPreserveCursor({
						oldZoom: prevZoomMap[compositionId] ?? TIMELINE_MIN_ZOOM,
						newZoom,
						currentDurationInFrames: getCurrentDuration(),
						currentFrame: getCurrentFrame(),
						anchorFrame,
						anchorContentX,
					});
					return {...prevZoomMap, [compositionId]: newZoom};
				});
			});
		},
		[],
	);

	const value = useMemo(() => {
		return {
			zoom,
			setZoom,
		};
	}, [zoom, setZoom]);

	return (
		<TimelineZoomCtx.Provider value={value}>
			{children}
		</TimelineZoomCtx.Provider>
	);
};
