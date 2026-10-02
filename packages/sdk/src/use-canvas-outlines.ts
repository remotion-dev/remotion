import type {MutableRefObject, RefObject} from 'react';
import {useEffect, useMemo, useRef} from 'react';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';
import type {CanvasHoverController} from './hover';
import {useCanvasHover} from './hover';
import type {CanvasOutlineTarget} from './outline-geometry';
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
}: {
	readonly containerRef: RefObject<SVGSVGElement | null>;
	readonly targets: readonly Target[];
	readonly sequences: readonly CanvasOutlineSequenceParent[];
	readonly hoverController: CanvasHoverController;
	readonly freezeOrder: boolean;
	readonly updateOutlinesRef: MutableRefObject<() => void> | null;
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
	const outlines = useCanvasOutlineMeasurements({
		containerRef,
		targets: measurementTargets,
		updateOutlinesRef,
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
			renderingOrderRef.current = ordered.map((outline) => outline.key);
			return ordered;
		}

		const currentOutlinesByKey = new Map(
			outlines.map((outline) => [outline.key, outline]),
		);
		const frozenKeys = new Set(renderingOrderRef.current);
		renderingOrderRef.current = [
			...renderingOrderRef.current,
			...outlines
				.filter((outline) => !frozenKeys.has(outline.key))
				.map((outline) => outline.key),
		];
		return renderingOrderRef.current.flatMap((key) => {
			const outline = currentOutlinesByKey.get(key);
			return outline === undefined ? [] : [outline];
		});
	}, [freezeOrder, outlines, sequences, targetsByKey]);
	const outlinesByKey = useMemo(
		() => new Map(outlines.map((outline) => [outline.key, outline])),
		[outlines],
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
		targetsByKey,
		hoveredNodePathKey,
	};
};
