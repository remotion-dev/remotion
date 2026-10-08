import {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {Internals} from 'remotion';
import type {CanvasOutline, CanvasOutlineTarget} from './outline-geometry';
import {
	canvasOutlinesAreEqual,
	measureCanvasOutlineTargets,
} from './outline-measurement';
import {getCanvasOutlineNodes} from './outline-nodes';

export const useCanvasOutlineMeasurements = ({
	contentRoot,
	targets,
}: {
	/** Observe composition mutations separately from the host's zoom and pan. */
	readonly contentRoot: HTMLElement;
	readonly targets: readonly CanvasOutlineTarget[];
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
	const updateOutlines = useCallback(() => {
		if (targets.length === 0) {
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
			// The composition's layout size is independent of its host's zoom.
			nextObservedElements.add(contentRoot);

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

		const nextOutlines = measureCanvasOutlineTargets(contentRoot, targets);
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
	}, [contentRoot, targets]);

	useLayoutEffect(() => {
		latestUpdateRef.current = updateOutlines;

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

		const ownerWindow = contentRoot.ownerDocument.defaultView;
		const onCommit = () => {
			if (
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
				Internals.CommittedMetadataInternals.eventName,
				onCommit,
			);
			scheduleUpdate();
		} else {
			updateOutlines();
		}

		return () => {
			active = false;
			ownerWindow?.removeEventListener(
				Internals.CommittedMetadataInternals.eventName,
				onCommit,
			);
			latestUpdateRef.current = () => undefined;
		};
	}, [contentRoot, targets, updateOutlines]);

	useLayoutEffect(() => {
		const ownerWindow = contentRoot.ownerDocument.defaultView;
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
	}, [contentRoot]);

	useLayoutEffect(() => {
		const ownerWindow = contentRoot.ownerDocument.defaultView;
		if (!ownerWindow || typeof ownerWindow.MutationObserver === 'undefined') {
			return;
		}

		// The host owns the root's zoom transform. Its layout size is observed
		// separately; only composition mutations change normalized geometry.
		const observer = new ownerWindow.MutationObserver((mutations) => {
			if (
				mutations.some(
					(mutation) =>
						mutation.target !== contentRoot || mutation.type !== 'attributes',
				)
			) {
				latestUpdateRef.current();
			}
		});
		observer.observe(contentRoot, {
			attributes: true,
			characterData: true,
			childList: true,
			subtree: true,
		});
		return () => observer.disconnect();
	}, [contentRoot]);

	return outlines;
};
