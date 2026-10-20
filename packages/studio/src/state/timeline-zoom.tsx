import React, {
	createContext,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {flushSync} from 'react-dom';
import {
	getCurrentDuration,
	getCurrentFrame,
} from '../components/Timeline/imperative-state';
import {scrollableRef} from '../components/Timeline/timeline-refs';
import {prepareToPreserveTimelineCursor} from '../components/Timeline/timeline-scroll-logic';
import {syncTimelineViewport} from '../components/Timeline/TimelineViewport';
import {getZoomFromLocalStorage} from '../components/ZoomPersistor';
import {
	clampTimelineZoom,
	getTimelineZoom,
} from '../helpers/get-timeline-max-zoom';

export type TimelineSetZoomOptions = {
	anchorFrame: number | null;
	anchorContentX: number | null;
};

type TimelineZoomContextValue = {
	zoom: Record<string, number>;
	setZoom: (
		videoId: string,
		prev: (prevZoom: number) => number,
		options?: TimelineSetZoomOptions,
	) => void;
};

export const TimelineZoomCtx = createContext<TimelineZoomContextValue>({
	zoom: {},
	setZoom: () => {
		throw new Error('has no context');
	},
});

export const TimelineZoomActiveContext = createContext(false);

export const TimelineZoomImperativeContext = createContext<
	Pick<TimelineZoomContextValue, 'setZoom'> & {
		getZoom: (videoId: string) => number | null;
		beginZoom: () => void;
		endZoom: () => void;
	}
>({
	getZoom: () => null,
	beginZoom: () => undefined,
	endZoom: () => undefined,
	setZoom: () => {
		throw new Error('has no context');
	},
});

export const TimelineZoomContext: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [isZooming, setIsZooming] = useState(false);
	const zoomHeld = useRef(false);
	const zoomIdleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const endZoom = useCallback(() => {
		zoomHeld.current = false;
		if (zoomIdleTimeout.current !== null) {
			clearTimeout(zoomIdleTimeout.current);
			zoomIdleTimeout.current = null;
		}

		setIsZooming(false);
	}, []);
	const beginZoom = useCallback(() => {
		zoomHeld.current = true;
		if (zoomIdleTimeout.current !== null) {
			clearTimeout(zoomIdleTimeout.current);
			zoomIdleTimeout.current = null;
		}

		setIsZooming(true);
	}, []);
	useEffect(() => {
		window.addEventListener('blur', endZoom);
		return () => {
			window.removeEventListener('blur', endZoom);
			if (zoomIdleTimeout.current !== null) {
				clearTimeout(zoomIdleTimeout.current);
			}
		};
	}, [endZoom]);
	const [zoom, setZoomState] = useState<Record<string, number>>(() =>
		getZoomFromLocalStorage(),
	);
	const zoomRef = useRef(zoom);
	useLayoutEffect(() => {
		zoomRef.current = zoom;
	}, [zoom]);

	const setZoom = useCallback(
		(
			videoId: string,
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
				setIsZooming(true);
				setZoomState((prevZoomMap) => {
					const durationInFrames = getCurrentDuration();
					const timelineViewportWidth = scrollableRef.current?.clientWidth ?? 0;
					const previousZoom = getTimelineZoom({
						durationInFrames,
						timelineViewportWidth,
						zoom: prevZoomMap[videoId] ?? null,
					});
					const newZoom = clampTimelineZoom({
						zoom: callback(previousZoom),
						durationInFrames,
						timelineViewportWidth,
					});

					return {...prevZoomMap, [videoId]: newZoom};
				});
			});

			// The new scroll range exists now, so the browser will not clamp the offset
			// against the previous width.
			preserveTimelineCursor();
			// A large zoom can move beyond the old horizontal render window. Commit
			// the new window before the browser paints the new scroll position.
			flushSync(syncTimelineViewport);
			// Wheel events and zoom buttons have no explicit interaction end.
			// Slider drags and native pinch gestures keep the interaction held.
			if (zoomIdleTimeout.current !== null) {
				clearTimeout(zoomIdleTimeout.current);
			}

			if (!zoomHeld.current) {
				zoomIdleTimeout.current = setTimeout(endZoom, 150);
			}
		},
		[endZoom],
	);

	const value = useMemo(() => {
		return {
			zoom,
			setZoom,
		};
	}, [zoom, setZoom]);
	const imperativeValue = useMemo(() => {
		return {
			getZoom: (videoId: string) => zoomRef.current[videoId] ?? null,
			setZoom,
			beginZoom,
			endZoom,
		};
	}, [beginZoom, endZoom, setZoom]);

	return (
		<TimelineZoomCtx.Provider value={value}>
			<TimelineZoomImperativeContext.Provider value={imperativeValue}>
				<TimelineZoomActiveContext.Provider value={isZooming}>
					{children}
				</TimelineZoomActiveContext.Provider>
			</TimelineZoomImperativeContext.Provider>
		</TimelineZoomCtx.Provider>
	);
};
