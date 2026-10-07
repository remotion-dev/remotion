import type {MutableRefObject, RefObject} from 'react';
import {useCallback, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Internals} from 'remotion';
import type {CanvasOutline, CanvasOutlineTarget} from './outline-geometry';
import {scaleCanvasOutline} from './outline-geometry';
import {
	canvasOutlinesAreEqual,
	measureCanvasOutlineTargets,
} from './outline-measurement';
import {getCanvasOutlineNodes} from './outline-nodes';

export const useCanvasOutlineMeasurements = ({
	containerRef,
	contentRoot,
	scale,
	targets,
	updateOutlinesRef,
}: {
	readonly containerRef: RefObject<SVGSVGElement | null>;
	/** Observe composition mutations separately from the host's zoom and pan. */
	readonly contentRoot: Element | null;
	/** Cache at scale 1 and project to this scale. Null keeps container coordinates. */
	readonly scale: number | null;
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
	const measuredNodesRef = useRef(
		new Map<CanvasOutlineTarget['ref'], readonly (Element | Text)[] | null>(),
	);
	const scaleRef = useRef(scale);
	const normalize = scale !== null;
	useLayoutEffect(() => {
		scaleRef.current = scale;
	}, [scale]);

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
			// Zoom changes the overlay's CSS size, but only transforms its contents.
			if (!normalize) {
				nextObservedElements.add(container);
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

		const measurementScale = scaleRef.current;
		const measuredOutlines = measureCanvasOutlineTargets(
			container,
			targets,
			contentRoot === null || measurementScale === null
				? null
				: {root: contentRoot, scale: measurementScale},
		);
		const nextOutlines =
			measurementScale === null
				? measuredOutlines
				: measuredOutlines.map((outline) =>
						scaleCanvasOutline(outline, 1 / measurementScale),
					);
		measuredNodesRef.current = new Map(
			targets.map((target) => [
				target.ref,
				Internals.SequenceOutlineInternals.getNodes(target.ref),
			]),
		);
		if (canvasOutlinesAreEqual(outlinesRef.current, nextOutlines)) {
			return;
		}

		outlinesRef.current = nextOutlines;
		setOutlines(nextOutlines);
	}, [containerRef, contentRoot, normalize, targets]);

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
		const onCommit = () => {
			if (
				!normalize ||
				targets.some(
					(target) =>
						measuredNodesRef.current.get(target.ref) !==
						Internals.SequenceOutlineInternals.getNodes(target.ref),
				)
			) {
				scheduleUpdate();
			}
		};

		const hasAutomaticTargets = targets.some(
			(target) =>
				Internals.SequenceOutlineInternals.getNodes(target.ref) !== null,
		);
		if (hasAutomaticTargets) {
			latestUpdateRef.current = scheduleUpdate;
			ownerWindow?.addEventListener(
				Internals.CommitOrderInternals.eventName,
				onCommit,
			);
			scheduleUpdate();
		} else {
			updateOutlines();
		}

		return () => {
			active = false;
			ownerWindow?.removeEventListener(
				Internals.CommitOrderInternals.eventName,
				onCommit,
			);
			latestUpdateRef.current = () => undefined;
			if (updateOutlinesRef?.current === updateOutlines) {
				updateOutlinesRef.current = () => undefined;
			}
		};
	}, [containerRef, normalize, targets, updateOutlines, updateOutlinesRef]);

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

	useLayoutEffect(() => {
		const ownerWindow = contentRoot?.ownerDocument.defaultView;
		if (
			contentRoot === null ||
			!ownerWindow ||
			typeof ownerWindow.MutationObserver === 'undefined'
		) {
			return;
		}

		// Includes descendant-only edits and transforms on composition ancestors,
		// while the host's scaled container and the outline overlay stay outside.
		const observer = new ownerWindow.MutationObserver(() =>
			latestUpdateRef.current(),
		);
		observer.observe(contentRoot, {
			attributes: true,
			characterData: true,
			childList: true,
			subtree: true,
		});
		return () => observer.disconnect();
	}, [contentRoot]);

	// Controls keep using overlay pixels, while zoom only projects cached geometry.
	return useMemo(
		() =>
			scale === null
				? outlines
				: outlines.map((outline) => scaleCanvasOutline(outline, scale)),
		[outlines, scale],
	);
};
