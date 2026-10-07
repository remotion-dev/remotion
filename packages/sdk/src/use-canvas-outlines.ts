import type {MutableRefObject, RefObject} from 'react';
import {useEffect, useMemo, useRef} from 'react';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';
import type {CanvasHoverController} from './hover';
import {useCanvasHover} from './hover';
import type {
	CanvasOutlineTarget,
	CanvasOutlineViewport,
} from './outline-geometry';
import type {
	CanvasOutlineOrderTarget,
	CanvasOutlineSequenceParent,
} from './outline-order';
import {orderCanvasOutlinesForRendering} from './outline-order';
import {timelineSequenceNodePathToKey} from './timeline-sequence-node-path-to-key';
import {useCanvasOutlineMeasurements} from './use-canvas-outline-measurements';

export type CanvasOutlineRenderTarget = Omit<
	CanvasOutlineTarget,
	'includeOutsideContainer'
> &
	CanvasOutlineOrderTarget & {
		readonly nodePathInfo: SequenceNodePathInfo;
		readonly showSelectedOutline: boolean;
	};

/** Measure and order a host's outline targets without subscribing to playback. */
export const useCanvasOutlines = <Target extends CanvasOutlineRenderTarget>({
	containerRef,
	targets,
	sequences,
	hoverController,
	freezeOrder,
	updateOutlinesRef,
	viewport,
}: {
	readonly containerRef: RefObject<SVGSVGElement | null>;
	readonly targets: readonly Target[];
	readonly sequences: readonly CanvasOutlineSequenceParent[];
	readonly hoverController: CanvasHoverController;
	readonly freezeOrder: boolean;
	readonly updateOutlinesRef: MutableRefObject<() => void> | null;
	readonly viewport: CanvasOutlineViewport | null;
}) => {
	const hover = useCanvasHover(hoverController);
	const hoveredNodePathKey = hover?.nodePathKey ?? null;
	const hoveredTimelineNodePathKey =
		hover?.source === 'timeline' ? hoveredNodePathKey : null;
	const measurementTargets = useMemo(
		() =>
			targets.map((target) => ({
				crop: target.crop,
				includeOutsideContainer:
					target.showSelectedOutline ||
					timelineSequenceNodePathToKey(
						target.nodePathInfo.sequenceSubscriptionKey,
					) === hoveredTimelineNodePathKey,
				key: target.key,
				ref: target.ref,
			})),
		[hoveredTimelineNodePathKey, targets],
	);
	const {outlines, renderingOutlines, renderingTransform} =
		useCanvasOutlineMeasurements({
			containerRef,
			targets: measurementTargets,
			updateOutlinesRef,
			viewport,
		});
	const targetsByKey = useMemo(
		() => new Map(targets.map((target) => [target.key, target])),
		[targets],
	);

	// Moving a captured polygon in the DOM can cancel the host's pointer session.
	const renderingOrderRef = useRef<readonly string[]>([]);
	const outlinesForRendering = useMemo(() => {
		if (!freezeOrder || renderingOrderRef.current.length === 0) {
			const ordered = orderCanvasOutlinesForRendering({
				outlines,
				sequences,
				targetsByKey,
			});
			const keys = ordered.map((outline) => outline.key);
			if (
				keys.length !== renderingOrderRef.current.length ||
				keys.some((key, index) => key !== renderingOrderRef.current[index])
			) {
				renderingOrderRef.current = keys;
			}

			return ordered;
		}

		const currentOutlinesByKey = new Map(
			outlines.map((outline) => [outline.key, outline]),
		);
		const frozenKeys = new Set(renderingOrderRef.current);
		const addedKeys = outlines
			.filter((outline) => !frozenKeys.has(outline.key))
			.map((outline) => outline.key);
		if (addedKeys.length > 0) {
			renderingOrderRef.current = [...renderingOrderRef.current, ...addedKeys];
		}

		return renderingOrderRef.current.flatMap((key) => {
			const outline = currentOutlinesByKey.get(key);
			return outline === undefined ? [] : [outline];
		});
	}, [freezeOrder, outlines, sequences, targetsByKey]);
	const visibleRenderingOrderRef = useRef<readonly string[]>([]);
	const renderingOrder = useMemo(() => {
		// The frozen order also retains keys that temporarily leave the canvas.
		// Only mount outlines that are currently visible in that order.
		const keys = outlinesForRendering.map((outline) => outline.key);
		if (
			keys.length !== visibleRenderingOrderRef.current.length ||
			keys.some((key, index) => key !== visibleRenderingOrderRef.current[index])
		) {
			visibleRenderingOrderRef.current = keys;
		}

		return visibleRenderingOrderRef.current;
	}, [outlinesForRendering]);
	const outlinesByKey = useMemo(
		() => new Map(outlines.map((outline) => [outline.key, outline])),
		[outlines],
	);
	const renderingOutlinesByKey = useMemo(
		() => new Map(renderingOutlines.map((outline) => [outline.key, outline])),
		[renderingOutlines],
	);

	useEffect(() => {
		if (
			hover?.source !== 'canvas' ||
			(targetsByKey.has(hover.key) && outlinesByKey.has(hover.key))
		) {
			return;
		}

		hoverController.setHoveredSequence((current) =>
			current?.source === 'canvas' && current.key === hover.key
				? null
				: current,
		);
	}, [hover, hoverController, outlinesByKey, targetsByKey]);

	return {
		outlines,
		outlinesForRendering,
		outlinesByKey,
		renderingOutlinesByKey,
		renderingTransform,
		renderingOrder,
		targetsByKey,
		hoveredNodePathKey,
	};
};
