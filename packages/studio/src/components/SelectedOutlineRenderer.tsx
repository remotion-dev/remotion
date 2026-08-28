import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {timelineSequenceNodePathToKey} from '../helpers/timeline-node-path-key';
import {
	useSetTimelineSequenceHover,
	useTimelineSequenceHoverState,
} from '../state/timeline-sequence-hover';
import {ContextMenuForTarget} from './ContextMenu';
import type {SelectedOutline} from './selected-outline-geometry';
import {
	measureOutlines,
	outlinesAreEqual,
} from './selected-outline-measurement';
import {orderOutlinesForRendering} from './selected-outline-order';
import type {
	SelectedOutlineContextMenuOpenHandler,
	SelectedOutlineLayoutTarget,
	SelectedOutlineTarget,
} from './selected-outline-types';
import {SelectedOutlineEditingHandles} from './SelectedOutlineEditingHandles';
import {SelectedOutlineElement} from './SelectedOutlineElement';
import {SELECTED_OUTLINE_KEY_ATTR} from './SelectedOutlinePolygon';
import {
	SelectedOutlineSnapIndicators,
	type UpdateSelectedOutlineSnapPoints,
} from './SelectedOutlineSnapIndicators';
import {SelectedOutlineTransformOriginHandle} from './SelectedOutlineTransformOriginHandle';
import {
	SelectedOutlineUvHandleCircleLayer,
	SelectedOutlineUvHandleConnectionLayer,
} from './SelectedOutlineUvControls';
import type {
	TimelineSelection,
	TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';

const outlineContainer: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	pointerEvents: 'none',
	overflow: 'visible',
};

const SelectedOutlineRendererUnmemoized: React.FC<{
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly dragging: boolean;
	readonly getLatestOutlineTargetByKey: (
		key: string,
	) => SelectedOutlineTarget | undefined;
	readonly outlineTargets: readonly SelectedOutlineLayoutTarget[];
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onContextMenuOpenChange: (open: boolean) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction?: TimelineSelectionInteraction,
	) => void;
	readonly scale: number;
	readonly sequences: Parameters<
		typeof orderOutlinesForRendering
	>[0]['sequences'];
	readonly updateOutlinesRef: React.MutableRefObject<() => void>;
}> = ({
	compositionHeight,
	compositionWidth,
	dragging,
	getLatestOutlineTargetByKey,
	outlineTargets,
	onDraggingChange,
	onContextMenuOpenChange,
	onSelect,
	scale,
	sequences,
	updateOutlinesRef,
}) => {
	// Targets are derived props and can receive a new identity on every render.
	// Keep only measured geometry in state to avoid layout-effect update loops.
	const [outlines, setOutlines] = useState<readonly SelectedOutline[]>([]);
	const overlayRef = useRef<SVGSVGElement>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const resizeObserverAnimationFrameRef = useRef<number | null>(null);
	const observedOutlineElementsRef = useRef<ReadonlySet<Element>>(new Set());
	const contextMenuOpenHandlersRef = useRef(
		new Map<string, SelectedOutlineContextMenuOpenHandler>(),
	);
	const registerContextMenuOpen = useCallback(
		(key: string, handler: SelectedOutlineContextMenuOpenHandler | null) => {
			if (handler === null) {
				contextMenuOpenHandlersRef.current.delete(key);
			} else {
				contextMenuOpenHandlersRef.current.set(key, handler);
			}
		},
		[],
	);
	const getContextMenuOpenByKey = useCallback(
		(key: string) => contextMenuOpenHandlersRef.current.get(key),
		[],
	);
	const getDelegatedContextMenuItems = useCallback(
		(event: MouseEvent) => {
			if (!(event.target instanceof Element)) {
				return false;
			}

			const polygon = event.target.closest<SVGPolygonElement>(
				`polygon[${SELECTED_OUTLINE_KEY_ATTR}]`,
			);
			if (polygon?.ownerSVGElement !== overlayRef.current) {
				return false;
			}

			const key = polygon.getAttribute(SELECTED_OUTLINE_KEY_ATTR);
			return key === null ? false : (getContextMenuOpenByKey(key)?.() ?? false);
		},
		[getContextMenuOpenByKey],
	);
	const hoveredSequence = useTimelineSequenceHoverState();
	const setHoveredSequence = useSetTimelineSequenceHover();
	const hoveredNodePathKey = hoveredSequence?.nodePathKey ?? null;
	const hoveredTimelineNodePathKey =
		hoveredSequence?.source === 'timeline' ? hoveredNodePathKey : null;

	const updateOutlines = useCallback(() => {
		if (overlayRef.current === null || outlineTargets.length === 0) {
			setOutlines((previousOutlines) =>
				previousOutlines.length === 0 ? previousOutlines : [],
			);
			return;
		}

		const nextOutlines = measureOutlines(
			overlayRef.current,
			outlineTargets,
			hoveredTimelineNodePathKey,
		);
		setOutlines((previousOutlines) =>
			outlinesAreEqual(previousOutlines, nextOutlines)
				? previousOutlines
				: nextOutlines,
		);
	}, [hoveredTimelineNodePathKey, outlineTargets]);

	useLayoutEffect(() => {
		updateOutlinesRef.current = updateOutlines;
		updateOutlines();
		return () => {
			if (updateOutlinesRef.current === updateOutlines) {
				updateOutlinesRef.current = () => undefined;
			}
		};
	}, [updateOutlines, updateOutlinesRef]);

	useLayoutEffect(() => {
		if (typeof ResizeObserver === 'undefined') {
			return;
		}

		const resizeObserver = new ResizeObserver(() => {
			if (resizeObserverAnimationFrameRef.current !== null) {
				return;
			}

			resizeObserverAnimationFrameRef.current = requestAnimationFrame(() => {
				resizeObserverAnimationFrameRef.current = null;
				updateOutlinesRef.current();
			});
		});
		resizeObserverRef.current = resizeObserver;

		return () => {
			if (resizeObserverAnimationFrameRef.current !== null) {
				cancelAnimationFrame(resizeObserverAnimationFrameRef.current);
				resizeObserverAnimationFrameRef.current = null;
			}

			resizeObserver.disconnect();
			resizeObserverRef.current = null;
			observedOutlineElementsRef.current = new Set();
		};
	}, [updateOutlinesRef]);

	useLayoutEffect(() => {
		const resizeObserver = resizeObserverRef.current;
		if (resizeObserver === null) {
			return;
		}

		const nextObservedElements = new Set<Element>();
		if (overlayRef.current !== null) {
			nextObservedElements.add(overlayRef.current);
		}

		for (const target of outlineTargets) {
			if (target.ref.current !== null) {
				nextObservedElements.add(target.ref.current);
			}
		}

		for (const element of observedOutlineElementsRef.current) {
			if (!nextObservedElements.has(element)) {
				resizeObserver.unobserve(element);
			}
		}

		for (const element of nextObservedElements) {
			if (!observedOutlineElementsRef.current.has(element)) {
				resizeObserver.observe(element);
			}
		}

		observedOutlineElementsRef.current = nextObservedElements;
	}, [outlineTargets]);

	const targetsByKey = useMemo(() => {
		return new Map(outlineTargets.map((target) => [target.key, target]));
	}, [outlineTargets]);
	useEffect(() => {
		if (
			hoveredSequence?.source === 'canvas' &&
			!outlineTargets.some((target) => target.key === hoveredSequence.key)
		) {
			setHoveredSequence((currentHover) =>
				currentHover?.source === 'canvas' ? null : currentHover,
			);
		}
	}, [hoveredSequence, outlineTargets, setHoveredSequence]);
	// Reordering a captured SVG target can cancel the active pointer session.
	const outlineRenderingOrderRef = useRef<readonly string[]>([]);
	const outlinesForRendering = useMemo(() => {
		if (!dragging || outlineRenderingOrderRef.current.length === 0) {
			const orderedOutlines = orderOutlinesForRendering({
				outlines,
				sequences,
				targetsByKey,
			});
			outlineRenderingOrderRef.current = orderedOutlines.map(
				(outline) => outline.key,
			);
			return orderedOutlines;
		}

		const currentOutlinesByKey = new Map(
			outlines.map((outline) => [outline.key, outline]),
		);
		const frozenKeys = new Set(outlineRenderingOrderRef.current);
		const newOutlines = outlines.filter(
			(outline) => !frozenKeys.has(outline.key),
		);
		outlineRenderingOrderRef.current = [
			...outlineRenderingOrderRef.current,
			...newOutlines.map((outline) => outline.key),
		];
		return outlineRenderingOrderRef.current.flatMap((key) => {
			const outline = currentOutlinesByKey.get(key);
			return outline === undefined ? [] : [outline];
		});
	}, [dragging, outlines, sequences, targetsByKey]);
	const outlinesByKey = useMemo(() => {
		return new Map(outlines.map((outline) => [outline.key, outline]));
	}, [outlines]);
	const {
		outlinesForEditingHandles,
		outlinesForTransformOrigin,
		outlinesForUvHandles,
	} = useMemo(() => {
		const editingHandles: SelectedOutline[] = [];
		const transformOrigin: SelectedOutline[] = [];
		const uvHandles: SelectedOutline[] = [];
		for (const outline of outlinesForRendering) {
			const target = targetsByKey.get(outline.key);
			if (
				target?.containsSelection === true ||
				(target !== undefined &&
					timelineSequenceNodePathToKey(
						target.nodePathInfo.sequenceSubscriptionKey,
					) === hoveredNodePathKey)
			) {
				editingHandles.push(outline);
			}

			if (target?.selectedForUvHandles === true) {
				uvHandles.push(outline);
			}

			if (
				target?.selectedForTransformOrigin === true ||
				target?.selectedForRotation === true
			) {
				transformOrigin.push(outline);
			}
		}

		return {
			outlinesForEditingHandles: editingHandles,
			outlinesForTransformOrigin: transformOrigin,
			outlinesForUvHandles: uvHandles,
		};
	}, [hoveredNodePathKey, outlinesForRendering, targetsByKey]);
	const targetsRef = useRef(outlineTargets);
	const outlinesByKeyRef = useRef(outlinesByKey);
	useLayoutEffect(() => {
		targetsRef.current = outlineTargets;
		outlinesByKeyRef.current = outlinesByKey;
	}, [outlineTargets, outlinesByKey]);
	const getAllDragTargets = useCallback(
		() =>
			targetsRef.current.flatMap((target) => {
				if (!target.selected && !target.containsSelection) {
					return [];
				}

				const drag = getLatestOutlineTargetByKey(target.key)?.drag ?? null;
				return drag === null ? [] : [drag];
			}),
		[getLatestOutlineTargetByKey],
	);
	const getAllDragOutlines = useCallback(
		() =>
			targetsRef.current.flatMap((target) => {
				if (
					(!target.selected && !target.containsSelection) ||
					(getLatestOutlineTargetByKey(target.key)?.drag ?? null) === null
				) {
					return [];
				}

				const outline = outlinesByKeyRef.current.get(target.key);
				return outline === undefined ? [] : [outline];
			}),
		[getLatestOutlineTargetByKey],
	);
	const getAllScaleDragTargets = useCallback(
		() =>
			targetsRef.current.flatMap((target) => {
				const scaleDrag = target.selected
					? (getLatestOutlineTargetByKey(target.key)?.scaleDrag ?? null)
					: null;
				return scaleDrag === null ? [] : [scaleDrag];
			}),
		[getLatestOutlineTargetByKey],
	);
	const getAllRotationDragTargets = useCallback(
		() =>
			targetsRef.current.flatMap((target) => {
				const rotationDrag = target.selected
					? (getLatestOutlineTargetByKey(target.key)?.rotationDrag ?? null)
					: null;
				return rotationDrag === null ? [] : [rotationDrag];
			}),
		[getLatestOutlineTargetByKey],
	);
	const updateSnapPointsRef = useRef<UpdateSelectedOutlineSnapPoints>(
		() => undefined,
	);
	const onSnapPointsChange = useCallback<UpdateSelectedOutlineSnapPoints>(
		(snapPoints) => updateSnapPointsRef.current(snapPoints),
		[],
	);

	return (
		<svg
			ref={overlayRef}
			style={outlineContainer}
			width="100%"
			height="100%"
			aria-hidden="true"
		>
			<ContextMenuForTarget
				triggerRef={overlayRef}
				getItems={getDelegatedContextMenuItems}
				onOpenChange={onContextMenuOpenChange}
			/>
			<SelectedOutlineSnapIndicators
				compositionHeight={compositionHeight}
				compositionWidth={compositionWidth}
				scale={scale}
				updateSnapPointsRef={updateSnapPointsRef}
			/>
			{outlinesForRendering.map((outline) => (
				<SelectedOutlineElement
					key={outline.key}
					compositionHeight={compositionHeight}
					compositionWidth={compositionWidth}
					dragging={dragging}
					getAllDragOutlines={getAllDragOutlines}
					getAllDragTargets={getAllDragTargets}
					getLatestTargetByKey={getLatestOutlineTargetByKey}
					outline={outline}
					onDraggingChange={onDraggingChange}
					onSnapPointsChange={onSnapPointsChange}
					onSelect={onSelect}
					registerContextMenuOpen={registerContextMenuOpen}
					scale={scale}
					layoutTarget={targetsByKey.get(outline.key)}
				/>
			))}
			{/* Render editing handles after all outline polygons so selected controls stay visible and hit-testable over unrelated sequences. */}
			{outlinesForEditingHandles.map((outline) => (
				<SelectedOutlineEditingHandles
					key={`${outline.key}-editing-handles`}
					dragging={dragging}
					getAllRotationDragTargets={getAllRotationDragTargets}
					getAllScaleDragTargets={getAllScaleDragTargets}
					getContextMenuOpenByKey={getContextMenuOpenByKey}
					getLatestTargetByKey={getLatestOutlineTargetByKey}
					layoutTarget={targetsByKey.get(outline.key)}
					onContextMenuOpenChange={onContextMenuOpenChange}
					onDraggingChange={onDraggingChange}
					onSelect={onSelect}
					outline={outline}
				/>
			))}
			{/* Keep UV controls above every transparent outline polygon so SVG hit-testing reaches the handles first. */}
			{outlinesForUvHandles.map((outline) => (
				<SelectedOutlineUvHandleConnectionLayer
					key={`${outline.key}-uv-connection-lines`}
					outline={outline}
					layoutTarget={targetsByKey.get(outline.key)}
				/>
			))}
			{outlinesForUvHandles.map((outline) => (
				<SelectedOutlineUvHandleCircleLayer
					key={`${outline.key}-uv-handles`}
					onDraggingChange={onDraggingChange}
					onSelect={onSelect}
					outline={outline}
					layoutTarget={targetsByKey.get(outline.key)}
				/>
			))}
			{/* Keep transform-origin handles above the canvas rotation surface so the knob stays visible in rotation mode and hit-testable while editing the origin. */}
			{outlinesForTransformOrigin.map((outline) => (
				<SelectedOutlineTransformOriginHandle
					key={`${outline.key}-transform-origin`}
					outline={outline}
					onDraggingChange={onDraggingChange}
					getLatestTargetByKey={getLatestOutlineTargetByKey}
					layoutTarget={targetsByKey.get(outline.key)}
				/>
			))}
		</svg>
	);
};

export const SelectedOutlineRenderer = React.memo(
	SelectedOutlineRendererUnmemoized,
);
