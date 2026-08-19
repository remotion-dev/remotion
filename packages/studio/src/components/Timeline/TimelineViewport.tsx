import React, {
	createContext,
	useCallback,
	useLayoutEffect,
	useState,
} from 'react';

type TimelineRenderWindow = {
	readonly left: number;
	readonly width: number;
};

export const TimelineViewportContext =
	createContext<TimelineRenderWindow | null>(null);

const getRenderWindow = (scrollable: HTMLDivElement): TimelineRenderWindow => {
	const viewportWidth = scrollable.clientWidth;
	if (viewportWidth === 0) {
		return {left: 0, width: 0};
	}

	const currentSection = Math.floor(scrollable.scrollLeft / viewportWidth);
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
	const [renderWindow, setRenderWindow] = useState<TimelineRenderWindow>({
		left: 0,
		width: window.innerWidth * 3,
	});

	const update = useCallback(() => {
		const element = scrollable.current;
		if (!element) {
			return;
		}

		const next = getRenderWindow(element);
		setRenderWindow((previous) => {
			if (previous.left === next.left && previous.width === next.width) {
				return previous;
			}

			return next;
		});
	}, [scrollable]);

	useLayoutEffect(() => {
		let element: HTMLDivElement | null = null;
		let resizeObserver: ResizeObserver | null = null;
		const animationFrame = requestAnimationFrame(() => {
			element = scrollable.current;
			if (!element) {
				return;
			}

			resizeObserver = new ResizeObserver(update);
			resizeObserver.observe(element);
			update();
			element.addEventListener('scroll', update);
		});

		return () => {
			cancelAnimationFrame(animationFrame);
			resizeObserver?.disconnect();
			element?.removeEventListener('scroll', update);
		};
	}, [scrollable, update]);

	return (
		<TimelineViewportContext.Provider value={renderWindow}>
			{children}
		</TimelineViewportContext.Provider>
	);
};
