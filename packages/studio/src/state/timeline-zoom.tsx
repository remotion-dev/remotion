import React, {createContext, useCallback, useMemo, useState} from 'react';
import {flushSync} from 'react-dom';
import {
	getCurrentDuration,
	getCurrentFrame,
} from '../components/Timeline/imperative-state';
import {prepareToPreserveTimelineCursor} from '../components/Timeline/timeline-scroll-logic';
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
			// Capture the old geometry before committing the new timeline width.
			const preserveTimelineCursor = prepareToPreserveTimelineCursor({
				currentDurationInFrames: getCurrentDuration(),
				currentFrame: getCurrentFrame(),
				anchorFrame: options?.anchorFrame ?? null,
				anchorContentX: options?.anchorContentX ?? null,
			});

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

					return {...prevZoomMap, [compositionId]: newZoom};
				});
			});

			// The new scroll range exists now, so the browser will not clamp the offset
			// against the previous width.
			preserveTimelineCursor();
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
