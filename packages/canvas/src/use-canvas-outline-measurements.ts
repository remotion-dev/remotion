import type {MutableRefObject, RefObject} from 'react';
import {useCallback, useLayoutEffect, useRef, useState} from 'react';
import type {CanvasOutline, CanvasOutlineTarget} from './outline-geometry';
import {
	canvasOutlinesAreEqual,
	measureCanvasOutlineTargets,
} from './outline-measurement';

export const useCanvasOutlineMeasurements = ({
	containerRef,
	targets,
	updateOutlinesRef,
}: {
	readonly containerRef: RefObject<SVGSVGElement | null>;
	readonly targets: readonly CanvasOutlineTarget[];
	readonly updateOutlinesRef: MutableRefObject<() => void> | null;
}): readonly CanvasOutline[] => {
	// Derived targets can change identity on every render. Keep only geometry in
	// state so measuring in a layout effect cannot cause an update loop.
	const [outlines, setOutlines] = useState<readonly CanvasOutline[]>([]);
	const outlinesRef = useRef(outlines);
	const latestUpdateRef = useRef<() => void>(() => undefined);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const observedElementsRef = useRef<ReadonlySet<Element>>(new Set());

	const updateOutlines = useCallback(() => {
		const container = containerRef.current;
		if (container === null || targets.length === 0) {
			if (outlinesRef.current.length === 0) {
				return;
			}

			outlinesRef.current = [];
			setOutlines(outlinesRef.current);
			return;
		}

		const nextOutlines = measureCanvasOutlineTargets(container, targets);
		if (canvasOutlinesAreEqual(outlinesRef.current, nextOutlines)) {
			return;
		}

		outlinesRef.current = nextOutlines;
		setOutlines(nextOutlines);
	}, [containerRef, targets]);

	useLayoutEffect(() => {
		latestUpdateRef.current = updateOutlines;
		if (updateOutlinesRef !== null) {
			updateOutlinesRef.current = updateOutlines;
		}

		updateOutlines();
		return () => {
			latestUpdateRef.current = () => undefined;
			if (updateOutlinesRef?.current === updateOutlines) {
				updateOutlinesRef.current = () => undefined;
			}
		};
	}, [updateOutlines, updateOutlinesRef]);

	useLayoutEffect(() => {
		const ownerWindow = containerRef.current?.ownerDocument.defaultView;
		if (!ownerWindow || typeof ownerWindow.ResizeObserver === 'undefined') {
			return;
		}

		let animationFrame: number | null = null;
		const resizeObserver = new ownerWindow.ResizeObserver(() => {
			if (animationFrame !== null) {
				return;
			}

			animationFrame = ownerWindow.requestAnimationFrame(() => {
				animationFrame = null;
				latestUpdateRef.current();
			});
		});
		resizeObserverRef.current = resizeObserver;

		return () => {
			if (animationFrame !== null) {
				ownerWindow.cancelAnimationFrame(animationFrame);
			}

			resizeObserver.disconnect();
			resizeObserverRef.current = null;
			observedElementsRef.current = new Set();
		};
	}, [containerRef]);

	useLayoutEffect(() => {
		const resizeObserver = resizeObserverRef.current;
		if (resizeObserver === null) {
			return;
		}

		const nextObservedElements = new Set<Element>();
		if (containerRef.current !== null) {
			nextObservedElements.add(containerRef.current);
		}

		for (const target of targets) {
			if (target.ref.current !== null) {
				nextObservedElements.add(target.ref.current);
			}
		}

		for (const element of observedElementsRef.current) {
			if (!nextObservedElements.has(element)) {
				resizeObserver.unobserve(element);
			}
		}

		for (const element of nextObservedElements) {
			if (!observedElementsRef.current.has(element)) {
				resizeObserver.observe(element);
			}
		}

		observedElementsRef.current = nextObservedElements;
	}, [containerRef, targets]);

	return outlines;
};
