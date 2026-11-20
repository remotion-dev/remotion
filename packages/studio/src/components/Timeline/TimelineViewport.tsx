import React, {
	createContext,
	useCallback,
	useContext,
	useLayoutEffect,
	useState,
} from 'react';
import {TimelineViewportWidthContext} from './TimelineWidthProvider';

type TimelineRenderWindow = {
	readonly left: number;
	readonly width: number;
};

export const TimelineViewportContext =
	createContext<TimelineRenderWindow | null>(null);

let updateTimelineViewport: (() => void) | null = null;

export const syncTimelineViewport = () => {
	updateTimelineViewport?.();
};

export const getTimelineRenderWindow = (
	scrollLeft: number,
	viewportWidth: number,
): TimelineRenderWindow => {
	if (viewportWidth === 0) {
		return {left: 0, width: 0};
	}

	// Move the render window half a viewport before the visible viewport reaches
	// its right edge. This keeps at least half a viewport rendered ahead while
	// retaining the three-viewport-wide window.
	const currentSection = Math.floor(
		(scrollLeft + viewportWidth / 2) / viewportWidth,
	);
	const left = Math.max(0, (currentSection - 1) * viewportWidth);

	return {
		left,
		width: viewportWidth * 3,
	};
};

export const TimelineViewportProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly scrollable: React.RefObject<HTMLDivElement | null>;
}> = ({children, scrollable}) => {
	const viewportWidth = useContext(TimelineViewportWidthContext) ?? 0;
	const [renderWindow, setRenderWindow] = useState(() =>
		getTimelineRenderWindow(0, viewportWidth),
	);

	const update = useCallback(() => {
		const element = scrollable.current;
		if (!element) {
			return;
		}

		const next = getTimelineRenderWindow(element.scrollLeft, viewportWidth);
		setRenderWindow((previous) => {
			if (previous.left === next.left && previous.width === next.width) {
				return previous;
			}

			return next;
		});
	}, [scrollable, viewportWidth]);

	useLayoutEffect(() => {
		const element = scrollable.current;
		updateTimelineViewport = update;
		update();
		element?.addEventListener('scroll', update);

		return () => {
			if (updateTimelineViewport === update) {
				updateTimelineViewport = null;
			}

			element?.removeEventListener('scroll', update);
		};
	}, [scrollable, update]);

	return (
		<TimelineViewportContext.Provider value={renderWindow}>
			{children}
		</TimelineViewportContext.Provider>
	);
};
