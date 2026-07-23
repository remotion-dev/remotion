import React, {
	createContext,
	useCallback,
	useMemo,
	useRef,
	useState,
} from 'react';
import {flushSync} from 'react-dom';
import {
	getCurrentDuration,
	getCurrentFrame,
} from '../components/Timeline/imperative-state';
import {prepareToPreserveTimelineCursor} from '../components/Timeline/timeline-scroll-logic';
import {getZoomFromLocalStorage} from '../components/ZoomPersistor';
import {TIMELINE_PADDING} from '../helpers/timeline-layout';

export const TIMELINE_MIN_ZOOM = 1;
const MINIMUM_FRAME_WIDTH = 20;

export const getTimelineZoomSliderValue = ({
	maxZoom,
	zoom,
}: {
	maxZoom: number;
	zoom: number;
}) => {
	if (maxZoom <= TIMELINE_MIN_ZOOM) {
		return 0;
	}

	const clampedZoom = Math.min(maxZoom, Math.max(TIMELINE_MIN_ZOOM, zoom));
	return (
		Math.log(clampedZoom / TIMELINE_MIN_ZOOM) /
		Math.log(maxZoom / TIMELINE_MIN_ZOOM)
	);
};

export const getTimelineZoomFromSliderValue = ({
	maxZoom,
	sliderValue,
}: {
	maxZoom: number;
	sliderValue: number;
}) => {
	if (maxZoom <= TIMELINE_MIN_ZOOM) {
		return TIMELINE_MIN_ZOOM;
	}

	const clampedSliderValue = Math.min(1, Math.max(0, sliderValue));
	return (
		TIMELINE_MIN_ZOOM * (maxZoom / TIMELINE_MIN_ZOOM) ** clampedSliderValue
	);
};

export const getMaxTimelineZoom = ({
	durationInFrames,
	timelineViewportWidth,
}: {
	durationInFrames: number;
	timelineViewportWidth: number;
}) => {
	if (durationInFrames <= 0 || timelineViewportWidth <= 0) {
		return TIMELINE_MIN_ZOOM;
	}

	const zoom =
		(durationInFrames * MINIMUM_FRAME_WIDTH + TIMELINE_PADDING * 2) /
		timelineViewportWidth;

	return Math.max(TIMELINE_MIN_ZOOM, Math.ceil(zoom * 10) / 10);
};

export type TimelineSetZoomOptions = {
	anchorFrame: number | null;
	anchorContentX: number | null;
};

export const TimelineZoomCtx = createContext<{
	zoom: Record<string, number>;
	maxZoom: Record<string, number>;
	setMaxZoom: (compositionId: string, maxZoom: number) => void;
	setZoom: (
		compositionId: string,
		prev: (prevZoom: number) => number,
		options?: TimelineSetZoomOptions,
	) => void;
}>({
	zoom: {},
	maxZoom: {},
	setMaxZoom: () => {
		throw new Error('has no context');
	},
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
	const [maxZoom, setMaxZoomState] = useState<Record<string, number>>({});
	const maxZoomRef = useRef(maxZoom);
	maxZoomRef.current = maxZoom;

	const setMaxZoom = useCallback(
		(compositionId: string, newMaxZoom: number) => {
			setZoomState((previousZoom) => {
				const zoomForComposition = previousZoom[compositionId];
				if (
					zoomForComposition === undefined ||
					zoomForComposition <= newMaxZoom
				) {
					return previousZoom;
				}

				return {...previousZoom, [compositionId]: newMaxZoom};
			});
			setMaxZoomState((previousMaxZoom) => {
				if (previousMaxZoom[compositionId] === newMaxZoom) {
					return previousMaxZoom;
				}

				return {...previousMaxZoom, [compositionId]: newMaxZoom};
			});
		},
		[],
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
					const maximumZoom = maxZoomRef.current[compositionId] ?? Infinity;
					const previousZoom = Math.min(
						maximumZoom,
						prevZoomMap[compositionId] ?? TIMELINE_MIN_ZOOM,
					);
					const newZoomWithFloatingPointErrors = Math.min(
						maximumZoom,
						Math.max(TIMELINE_MIN_ZOOM, callback(previousZoom)),
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
		const constrainedZoom = Object.fromEntries(
			Object.entries(zoom).map(([compositionId, zoomLevel]) => [
				compositionId,
				Math.min(zoomLevel, maxZoom[compositionId] ?? Infinity),
			]),
		);

		return {
			zoom: constrainedZoom,
			maxZoom,
			setMaxZoom,
			setZoom,
		};
	}, [maxZoom, setMaxZoom, setZoom, zoom]);

	return (
		<TimelineZoomCtx.Provider value={value}>
			{children}
		</TimelineZoomCtx.Provider>
	);
};
