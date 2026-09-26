import {CanvasInternals} from '@remotion/canvas';
import React, {
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
} from 'react';
import type {_InternalTypes} from 'remotion';
import {timelineSequenceNodePathToKey} from '../helpers/timeline-node-path-key';
import {TimelineSequenceHoverContext} from '../state/timeline-sequence-hover';
import {ContextMenuForTarget} from './ContextMenu';
import {CustomOutlinePositionControls} from './CustomOutlinePositionControls';
import {CustomOutlineValueChangeBridge} from './CustomOutlineValueChangeBridge';
import type {SelectedOutline} from './selected-outline-geometry';
import type {orderOutlinesForRendering} from './selected-outline-order';
import type {
	SelectedOutlineContextMenuOpenHandler,
	SelectedOutlineDragTarget,
	SelectedOutlineLayoutTarget,
	SelectedOutlineTarget,
} from './selected-outline-types';
import {SelectedOutlineEditingHandles} from './SelectedOutlineEditingHandles';
import {SelectedOutlineElement} from './SelectedOutlineElement';
import {SelectedOutlinePathPoints} from './SelectedOutlinePathPoints';
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

const {useCanvasOutlines} = CanvasInternals;
type CustomSequenceOutline = _InternalTypes['CustomSequenceOutline'];

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
	readonly getAllDragTargets: () => readonly SelectedOutlineDragTarget[];
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
	getAllDragTargets,
	getLatestOutlineTargetByKey,
	outlineTargets,
	onDraggingChange,
	onContextMenuOpenChange,
	onSelect,
	scale,
	sequences,
	updateOutlinesRef,
}) => {
	const overlayRef = useRef<SVGSVGElement>(null);
	const selectedCustomOutlinesRef = useRef<ReadonlySet<CustomSequenceOutline>>(
		new Set(),
	);
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
	const hoverController = useContext(TimelineSequenceHoverContext);
	const {
		outlinesForRendering,
		outlinesByKey,
		targetsByKey,
		hoveredNodePathKey,
	} = useCanvasOutlines({
		containerRef: overlayRef,
		targets: outlineTargets,
		sequences,
		hoverController,
		freezeOrder: dragging,
		updateOutlinesRef,
	});
	useLayoutEffect(() => {
		const nextSelectedCustomOutlines = new Set<CustomSequenceOutline>();
		for (const target of outlineTargets) {
			const outline = target.ref.current;
			if (outline === null || outline instanceof Element) continue;
			if (target.selected || target.containsSelection) {
				nextSelectedCustomOutlines.add(outline);
			}
		}

		for (const outline of selectedCustomOutlinesRef.current) {
			if (!nextSelectedCustomOutlines.has(outline)) {
				outline.setSelected(false);
			}
		}

		for (const outline of nextSelectedCustomOutlines) {
			if (!selectedCustomOutlinesRef.current.has(outline)) {
				outline.setSelected(true);
			}
		}

		selectedCustomOutlinesRef.current = nextSelectedCustomOutlines;
	}, [outlineTargets]);
	useLayoutEffect(() => {
		return () => {
			for (const outline of selectedCustomOutlinesRef.current) {
				outline.setSelected(false);
			}
		};
	}, []);
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
			const targetOutline = target?.ref.current;
			const hasCustomPositionControls =
				targetOutline !== null &&
				targetOutline !== undefined &&
				!(targetOutline instanceof Element) &&
				targetOutline.positionControls !== null;
			if (
				!hasCustomPositionControls &&
				(target?.containsSelection === true ||
					(target !== undefined &&
						timelineSequenceNodePathToKey(
							target.nodePathInfo.sequenceSubscriptionKey,
						) === hoveredNodePathKey))
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
	const getAllDragOutlines = useCallback(
		() =>
			targetsRef.current.flatMap((target) => {
				const customOutline = target.ref.current;
				if (
					(!target.selected && !target.containsSelection) ||
					(customOutline !== null &&
						!(customOutline instanceof Element) &&
						customOutline.positionControls !== null) ||
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
				const outline = outlinesByKeyRef.current.get(target.key);
				if (outline !== undefined && outline.path !== null) {
					// Path outlines do not render scale handles.
					return [];
				}

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
				const outline = outlinesByKeyRef.current.get(target.key);
				if (outline !== undefined && outline.path !== null) {
					// Path outlines do not render rotation handles.
					return [];
				}

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
			<CustomOutlineValueChangeBridge targets={outlineTargets} />
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
			{outlinesForRendering.map((outline) => {
				const target = targetsByKey.get(outline.key);
				const pathDrag = target?.containsSelection
					? (getLatestOutlineTargetByKey(outline.key)?.pathDrag ?? null)
					: null;
				return outline.path !== null && pathDrag !== null ? (
					<SelectedOutlinePathPoints
						key={`${outline.key}-path-points`}
						outline={outline}
						pathDrag={pathDrag}
						onDraggingChange={onDraggingChange}
					/>
				) : null;
			})}
			{outlinesForRendering.map((outline) => {
				const target = targetsByKey.get(outline.key);
				return (
					<CustomOutlinePositionControls
						key={`${outline.key}-custom-position-controls`}
						compositionHeight={compositionHeight}
						compositionWidth={compositionWidth}
						onDraggingChange={onDraggingChange}
						onSelect={onSelect}
						outline={outline}
						scale={scale}
						target={target}
						visible={
							target !== undefined &&
							timelineSequenceNodePathToKey(
								target.nodePathInfo.sequenceSubscriptionKey,
							) === hoveredNodePathKey
						}
					/>
				);
			})}
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
