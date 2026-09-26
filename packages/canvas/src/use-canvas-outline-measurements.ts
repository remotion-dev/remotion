import type {MutableRefObject, RefObject} from 'react';
import {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {Internals} from 'remotion';
import type {CanvasOutline, CanvasOutlineTarget} from './outline-geometry';
import {
	canvasOutlinesAreEqual,
	measureCanvasOutlineTargets,
} from './outline-measurement';
import {getCanvasOutlineNodes} from './outline-nodes';

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
			resizeObserverRef.current?.disconnect();
			observedElementsRef.current = new Set();
			if (outlinesRef.current.length === 0) {
				return;
			}

			outlinesRef.current = [];
			setOutlines(outlinesRef.current);
			return;
		}

		const resizeObserver = resizeObserverRef.current;
		if (resizeObserver !== null) {
			const nextObservedElements = new Set<Element>();
			if (containerRef.current !== null) {
				nextObservedElements.add(containerRef.current);
			}

			for (const target of targets) {
				for (const node of getCanvasOutlineNodes(target.ref)) {
					const element =
						node.nodeType === 1 ? (node as Element) : node.parentElement;
					if (element !== null) {
						nextObservedElements.add(element);
					}
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

		// The Fiber observer discovers nodes after React's layout effects. Batch
		// automatic measurements after that commit, including child-only updates
		// while paused, instead of measuring stale nodes and measuring again.
		let active = true;
		let scheduled = false;
		const scheduleUpdate = () => {
			if (scheduled) return;
			scheduled = true;
			queueMicrotask(() => {
				scheduled = false;
				if (active) updateOutlines();
			});
		};

		const ownerWindow = containerRef.current?.ownerDocument.defaultView;
		const hasAutomaticTargets = targets.some(
			(target) =>
				target.ref.current instanceof Element &&
				Internals.SequenceOutlineInternals.getNodes(
					target.ref as RefObject<Element | null>,
				) !== null,
		);
		const customOutlineCleanups = targets.flatMap((target) => {
			const outline = target.ref.current;
			if (outline === null || outline instanceof Element) {
				return [];
			}

			return [outline.subscribeToOutlineChanges(scheduleUpdate)];
		});
		if (hasAutomaticTargets) {
			latestUpdateRef.current = scheduleUpdate;
			ownerWindow?.addEventListener(
				Internals.CommitOrderInternals.eventName,
				scheduleUpdate,
			);
			scheduleUpdate();
		} else {
			updateOutlines();
		}

		return () => {
			active = false;
			customOutlineCleanups.forEach((cleanup) => cleanup());
			ownerWindow?.removeEventListener(
				Internals.CommitOrderInternals.eventName,
				scheduleUpdate,
			);
			latestUpdateRef.current = () => undefined;
			if (updateOutlinesRef?.current === updateOutlines) {
				updateOutlinesRef.current = () => undefined;
			}
		};
	}, [containerRef, targets, updateOutlines, updateOutlinesRef]);

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
		latestUpdateRef.current();

		return () => {
			if (animationFrame !== null) {
				ownerWindow.cancelAnimationFrame(animationFrame);
			}

			resizeObserver.disconnect();
			resizeObserverRef.current = null;
			observedElementsRef.current = new Set();
		};
	}, [containerRef]);

	return outlines;
};
