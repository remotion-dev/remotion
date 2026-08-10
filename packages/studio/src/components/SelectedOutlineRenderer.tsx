import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	useSetTimelineSequenceHover,
	useTimelineSequenceHoverState,
} from '../state/timeline-sequence-hover';
import type {SelectedOutline} from './selected-outline-geometry';
import {
	measureOutlines,
	outlinesAreEqual,
} from './selected-outline-measurement';
import {orderOutlinesForRendering} from './selected-outline-order';
import type {
	SelectedOutlineLayoutTarget,
	SelectedOutlineTarget,
} from './selected-outline-types';
import {SelectedOutlineElement} from './SelectedOutlineElement';
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

type SelectedOutlineRenderState = {
	readonly outlines: readonly SelectedOutline[];
	readonly targets: readonly SelectedOutlineLayoutTarget[];
};

const emptyRenderState: SelectedOutlineRenderState = {
	outlines: [],
	targets: [],
};

const SelectedOutlineHoverCleanup: React.FC<{
	readonly targets: readonly SelectedOutlineLayoutTarget[];
}> = ({targets}) => {
	const hoveredSequence = useTimelineSequenceHoverState();
	const setHoveredSequence = useSetTimelineSequenceHover();

	useEffect(() => {
		if (
			hoveredSequence?.source === 'canvas' &&
			!targets.some((target) => target.key === hoveredSequence.key)
		) {
			setHoveredSequence((currentHover) =>
				currentHover?.source === 'canvas' ? null : currentHover,
			);
		}
	}, [hoveredSequence, setHoveredSequence, targets]);

	return null;
};

const SelectedOutlineRendererUnmemoized: React.FC<{
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly dragging: boolean;
	readonly getLatestOutlineTargetByKey: (
		key: string,
	) => SelectedOutlineTarget | undefined;
	readonly getOutlineTargets: () => readonly SelectedOutlineLayoutTarget[];
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
	getOutlineTargets,
	onDraggingChange,
	onContextMenuOpenChange,
	onSelect,
	scale,
	sequences,
	updateOutlinesRef,
}) => {
	const [renderState, setRenderState] =
		useState<SelectedOutlineRenderState>(emptyRenderState);
	const overlayRef = useRef<SVGSVGElement>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const resizeObserverAnimationFrameRef = useRef<number | null>(null);
	const observedOutlineElementsRef = useRef<ReadonlySet<Element>>(new Set());

	const updateOutlines = useCallback(() => {
		const targets = getOutlineTargets();
		if (overlayRef.current === null || targets.length === 0) {
			setRenderState((prevState) =>
				prevState.targets.length === 0 ? prevState : emptyRenderState,
			);
			return;
		}

		const nextOutlines = measureOutlines(overlayRef.current, targets);
		setRenderState((prevState) => {
			const outlines = outlinesAreEqual(prevState.outlines, nextOutlines)
				? prevState.outlines
				: nextOutlines;
			if (prevState.targets === targets && prevState.outlines === outlines) {
				return prevState;
			}

			return {outlines, targets};
		});
	}, [getOutlineTargets]);

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

		for (const target of renderState.targets) {
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
	}, [renderState.targets]);

	const targetsByKey = useMemo(() => {
		return new Map(renderState.targets.map((target) => [target.key, target]));
	}, [renderState.targets]);
	const outlinesForRendering = useMemo(() => {
		return orderOutlinesForRendering({
			outlines: renderState.outlines,
			sequences,
			targetsByKey,
		});
	}, [renderState.outlines, sequences, targetsByKey]);
	const outlinesByKey = useMemo(() => {
		return new Map(
			renderState.outlines.map((outline) => [outline.key, outline]),
		);
	}, [renderState.outlines]);
	const targetsRef = useRef(renderState.targets);
	const outlinesByKeyRef = useRef(outlinesByKey);
	useLayoutEffect(() => {
		targetsRef.current = renderState.targets;
		outlinesByKeyRef.current = outlinesByKey;
	}, [outlinesByKey, renderState.targets]);
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
			<SelectedOutlineHoverCleanup targets={renderState.targets} />
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
					getAllRotationDragTargets={getAllRotationDragTargets}
					getAllScaleDragTargets={getAllScaleDragTargets}
					getLatestTargetByKey={getLatestOutlineTargetByKey}
					outline={outline}
					onDraggingChange={onDraggingChange}
					onContextMenuOpenChange={onContextMenuOpenChange}
					onSnapPointsChange={onSnapPointsChange}
					onSelect={onSelect}
					scale={scale}
					layoutTarget={targetsByKey.get(outline.key)}
				/>
			))}
			{/* Keep UV controls above every transparent outline polygon so SVG hit-testing reaches the handles first. */}
			{outlinesForRendering.map((outline) => (
				<SelectedOutlineUvHandleConnectionLayer
					key={`${outline.key}-uv-connection-lines`}
					outline={outline}
					layoutTarget={targetsByKey.get(outline.key)}
				/>
			))}
			{outlinesForRendering.map((outline) => (
				<SelectedOutlineUvHandleCircleLayer
					key={`${outline.key}-uv-handles`}
					onDraggingChange={onDraggingChange}
					onSelect={onSelect}
					outline={outline}
					layoutTarget={targetsByKey.get(outline.key)}
				/>
			))}
			{/* Keep transform-origin handles above the canvas rotation surface so the knob stays visible in rotation mode and hit-testable while editing the origin. */}
			{outlinesForRendering.map((outline) => (
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
