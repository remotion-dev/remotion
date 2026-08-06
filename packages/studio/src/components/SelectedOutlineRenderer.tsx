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
import type {SelectedOutlineSnapPoint} from './selected-outline-snap';
import type {SelectedOutlineTarget} from './selected-outline-types';
import {SelectedOutlineElement} from './SelectedOutlineElement';
import {SelectedOutlineSnapIndicators} from './SelectedOutlineSnapIndicators';
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
	readonly targets: readonly SelectedOutlineTarget[];
};

const emptyRenderState: SelectedOutlineRenderState = {
	outlines: [],
	targets: [],
};

const SelectedOutlineHoverCleanup: React.FC<{
	readonly targets: readonly SelectedOutlineTarget[];
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
	readonly activeSnapPoints: readonly SelectedOutlineSnapPoint[];
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly dragging: boolean;
	readonly getLatestOutlineTargetByKey: (
		key: string,
	) => SelectedOutlineTarget | undefined;
	readonly getOutlineTargets: () => readonly SelectedOutlineTarget[];
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onSnapPointsChange: (
		snapPoints: readonly SelectedOutlineSnapPoint[],
	) => void;
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
	activeSnapPoints,
	compositionHeight,
	compositionWidth,
	dragging,
	getLatestOutlineTargetByKey,
	getOutlineTargets,
	onDraggingChange,
	onSelect,
	onSnapPointsChange,
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
	const allDragTargets = useMemo(() => {
		return renderState.targets.flatMap((target) =>
			(target.selected || target.containsSelection) && target.drag !== null
				? [target.drag]
				: [],
		);
	}, [renderState.targets]);
	const allDragOutlines = useMemo(() => {
		return renderState.targets.flatMap((target) => {
			if (
				(!target.selected && !target.containsSelection) ||
				target.drag === null
			) {
				return [];
			}

			const outline = outlinesByKey.get(target.key);
			return outline === undefined ? [] : [outline];
		});
	}, [outlinesByKey, renderState.targets]);
	const allDragTargetsRef = useRef(allDragTargets);
	const allDragOutlinesRef = useRef(allDragOutlines);
	useLayoutEffect(() => {
		allDragTargetsRef.current = allDragTargets;
		allDragOutlinesRef.current = allDragOutlines;
	}, [allDragOutlines, allDragTargets]);
	const getAllDragTargets = useCallback(() => allDragTargetsRef.current, []);
	const getAllDragOutlines = useCallback(() => allDragOutlinesRef.current, []);
	const allScaleDragTargets = useMemo(() => {
		return renderState.targets.flatMap((target) =>
			target.selected && target.scaleDrag !== null ? [target.scaleDrag] : [],
		);
	}, [renderState.targets]);
	const allRotationDragTargets = useMemo(() => {
		return renderState.targets.flatMap((target) =>
			target.selected && target.rotationDrag !== null
				? [target.rotationDrag]
				: [],
		);
	}, [renderState.targets]);

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
				activeSnapPoints={activeSnapPoints}
				compositionHeight={compositionHeight}
				compositionWidth={compositionWidth}
				scale={scale}
			/>
			{outlinesForRendering.map((outline) => (
				<SelectedOutlineElement
					key={outline.key}
					allRotationDragTargets={allRotationDragTargets}
					allScaleDragTargets={allScaleDragTargets}
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
					scale={scale}
					target={targetsByKey.get(outline.key)}
				/>
			))}
			{/* Keep transform-origin handles above every transparent outline polygon so SVG hit-testing reaches the selected knob first. */}
			{outlinesForRendering.map((outline) => (
				<SelectedOutlineTransformOriginHandle
					key={`${outline.key}-transform-origin`}
					outline={outline}
					onDraggingChange={onDraggingChange}
					target={targetsByKey.get(outline.key)}
				/>
			))}
			{/* Keep UV controls above every transparent outline polygon so SVG hit-testing reaches the handles first. */}
			{outlinesForRendering.map((outline) => (
				<SelectedOutlineUvHandleConnectionLayer
					key={`${outline.key}-uv-connection-lines`}
					outline={outline}
					target={targetsByKey.get(outline.key)}
				/>
			))}
			{outlinesForRendering.map((outline) => (
				<SelectedOutlineUvHandleCircleLayer
					key={`${outline.key}-uv-handles`}
					onDraggingChange={onDraggingChange}
					onSelect={onSelect}
					outline={outline}
					target={targetsByKey.get(outline.key)}
				/>
			))}
		</svg>
	);
};

export const SelectedOutlineRenderer = React.memo(
	SelectedOutlineRendererUnmemoized,
);
