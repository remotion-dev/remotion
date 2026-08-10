import React, {useContext} from 'react';
import {Internals} from 'remotion';
import {TRANSPARENT} from '../helpers/colors';
import {startPointerSession} from '../helpers/pointer-session';
import {EditorSnappingContext} from '../state/editor-snapping';
import {canvasRotationCursor} from './canvas-rotation-cursor';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from './ForceSpecificCursor';
import {showNotification} from './Notifications/NotificationCenter';
import {
	clearSelectedOutlineRotationDragOverrides,
	getSelectedOutline3DRotationDragValues,
	getSelectedOutlineRotationDragChanges,
	getSelectedOutlineRotationDragStates,
	getSelectedOutlineRotationDragValues,
	getSelectedOutlineScaleEdgeInfo,
	isSelectedOutlineDragPastThreshold,
	snapSelectedOutlineRotationDeltaDegrees,
	type SelectedOutlineKeyframedDragChange,
	type SelectedOutlineStaticDragChange,
} from './selected-outline-drag';
import type {SelectedOutline} from './selected-outline-geometry';
import {
	getAngleDegrees,
	getSelectedOutlineRotationCornerInfo,
	getSelectedOutlineRotationDeltaDegrees,
	getSelectedOutlineRotationPivot,
} from './selected-outline-measurement';
import {
	rotateFieldKey,
	type SelectedOutlineLayoutTarget,
	type SelectedOutlineTarget,
} from './selected-outline-types';
import {svgPointToClientPoint} from './svg-point-to-client-point';
import {callAddKeyframes} from './Timeline/call-add-keyframe';
import {commitPendingInspectorFields} from './Timeline/focus-inspector-field';
import {getCurrentFrame} from './Timeline/imperative-state';
import {saveSequenceProps} from './Timeline/save-sequence-prop';

const rotationDegreesPerPixel = 0.5;

export const SelectedOutlineCanvasRotation: React.FC<{
	readonly getLatestTargetByKey: (
		key: string,
	) => SelectedOutlineTarget | undefined;
	readonly layoutTarget: SelectedOutlineLayoutTarget;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly outline: SelectedOutline;
}> = ({getLatestTargetByKey, layoutTarget, onDraggingChange, outline}) => {
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {editorSnapping} = useContext(EditorSnappingContext);

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGPathElement>) => {
			if (event.button !== 0) {
				return;
			}

			const target = getLatestTargetByKey(layoutTarget.key);
			const rotationDrag = target?.rotationDrag ?? null;
			if (rotationDrag === null || !target?.selectedForRotation) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			if (commitPendingInspectorFields()) {
				return;
			}

			const svg = event.currentTarget.ownerSVGElement;
			if (svg === null) {
				return;
			}

			const startPointer = {x: event.clientX, y: event.clientY};
			const center = svgPointToClientPoint(
				getSelectedOutlineRotationPivot({
					dimensions: outline.dimensions,
					points: outline.uncroppedPoints ?? outline.points,
					transformOriginValue: rotationDrag.transformOriginValue,
				}),
				svg.getBoundingClientRect(),
			);
			const dragStates = getSelectedOutlineRotationDragStates({
				dragTargets: [rotationDrag],
				getDragOverrides,
				timelinePosition: getCurrentFrame(),
			});
			let previousAngle = getAngleDegrees(center, startPointer);
			let accumulatedDelta = 0;
			let lastValues = new Map<string, string>();
			let dragStarted = false;

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();
				const screenDeltaX = moveEvent.clientX - startPointer.x;
				const screenDeltaY = moveEvent.clientY - startPointer.y;
				if (!dragStarted) {
					if (
						!isSelectedOutlineDragPastThreshold({
							deltaX: screenDeltaX,
							deltaY: screenDeltaY,
						})
					) {
						return;
					}

					dragStarted = true;
					onDraggingChange(true);
				}

				if (rotationDrag.transform3DMode) {
					const startRotation = dragStates[0]?.startRotation ?? [0, 0, 0];
					let rotationXDeltaDegrees = -screenDeltaY * rotationDegreesPerPixel;
					let rotationYDeltaDegrees = screenDeltaX * rotationDegreesPerPixel;
					if (moveEvent.shiftKey && editorSnapping) {
						rotationXDeltaDegrees =
							Math.round((startRotation[0] + rotationXDeltaDegrees) / 15) * 15 -
							startRotation[0];
						rotationYDeltaDegrees =
							Math.round((startRotation[1] + rotationYDeltaDegrees) / 15) * 15 -
							startRotation[1];
					}

					lastValues = getSelectedOutline3DRotationDragValues({
						dragStates,
						rotationXDeltaDegrees,
						rotationYDeltaDegrees,
					});
					forceSpecificCursor(canvasRotationCursor);
				} else {
					const nextAngle = getAngleDegrees(center, {
						x: moveEvent.clientX,
						y: moveEvent.clientY,
					});
					accumulatedDelta += getSelectedOutlineRotationDeltaDegrees({
						from: previousAngle,
						to: nextAngle,
					});
					previousAngle = nextAngle;
					const rotationDeltaDegrees =
						moveEvent.shiftKey && editorSnapping
							? snapSelectedOutlineRotationDeltaDegrees({
									dragStates,
									rotationDeltaDegrees: accumulatedDelta,
								})
							: accumulatedDelta;
					lastValues = getSelectedOutlineRotationDragValues({
						dragStates,
						rotationDeltaDegrees,
					});
					forceSpecificCursor(canvasRotationCursor);
				}

				for (const dragState of dragStates) {
					const value = lastValues.get(dragState.key);
					if (value === undefined) {
						throw new Error('Expected rotation drag value to be available');
					}

					if (dragState.target.propStatus.status === 'keyframed') {
						setDragOverrides(
							dragState.target.nodePath,
							rotateFieldKey,
							Internals.makeKeyframedDragOverride({
								status: dragState.target.propStatus,
								frame: dragState.sourceFrame,
								value,
							}),
						);
					} else {
						setDragOverrides(
							dragState.target.nodePath,
							rotateFieldKey,
							Internals.makeStaticDragOverride(value),
						);
					}
				}
			};

			const onPointerUp = () => {
				if (dragStarted) {
					stopForcingSpecificCursor();
					onDraggingChange(false);
				}

				const changes = getSelectedOutlineRotationDragChanges({
					dragStates,
					lastValues,
				});
				if (changes.length === 0) {
					clearSelectedOutlineRotationDragOverrides({
						clearDragOverrides,
						dragStates,
					});
					return;
				}

				const staticChanges = changes.filter(
					(change): change is SelectedOutlineStaticDragChange =>
						change.type === 'static',
				);
				const keyframedChanges = changes.filter(
					(change): change is SelectedOutlineKeyframedDragChange =>
						change.type === 'keyframed',
				);

				Promise.all([
					staticChanges.length > 0
						? saveSequenceProps({
								changes: staticChanges,
								addedKeyframes: null,
								movedKeyframes: null,
								setPropStatuses,
								clientId: rotationDrag.clientId,
								undoLabel: 'Rotate sequence',
								redoLabel: 'Rotate sequence back',
							})
						: Promise.resolve(),
					callAddKeyframes({
						sequenceKeyframes: keyframedChanges,
						effectKeyframes: [],
						setPropStatuses,
						clientId: rotationDrag.clientId,
					}),
				])
					.catch((error) => {
						showNotification(
							`Could not save sequence props: ${
								error instanceof Error ? error.message : String(error)
							}`,
							4000,
						);
					})
					.finally(() => {
						clearSelectedOutlineRotationDragOverrides({
							clearDragOverrides,
							dragStates,
						});
					});
			};

			startPointerSession({
				event,
				target: event.currentTarget,
				onMove: onPointerMove,
				onEnd: onPointerUp,
			});
		},
		[
			clearDragOverrides,
			editorSnapping,
			getDragOverrides,
			getLatestTargetByKey,
			layoutTarget.key,
			onDraggingChange,
			outline.dimensions,
			outline.points,
			outline.uncroppedPoints,
			setDragOverrides,
			setPropStatuses,
		],
	);
	const cornerHoles = (
		['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const
	)
		.map((corner) => {
			const {point} = getSelectedOutlineRotationCornerInfo(
				outline.points,
				corner,
			);
			return `M ${point.x - 12} ${point.y} a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0 z`;
		})
		.join(' ');
	const scaleEdgeHoles = (['top', 'right', 'bottom', 'left'] as const)
		.map((edge) => {
			const edgeInfo = getSelectedOutlineScaleEdgeInfo(outline.points, edge);
			if (edgeInfo === null) {
				return '';
			}

			const deltaX = edgeInfo.end.x - edgeInfo.start.x;
			const deltaY = edgeInfo.end.y - edgeInfo.start.y;
			const length = Math.hypot(deltaX, deltaY);
			if (length <= 24) {
				return '';
			}

			const tangentX = deltaX / length;
			const tangentY = deltaY / length;
			const startX = edgeInfo.start.x + tangentX * 12;
			const startY = edgeInfo.start.y + tangentY * 12;
			const endX = edgeInfo.end.x - tangentX * 12;
			const endY = edgeInfo.end.y - tangentY * 12;
			const offsetX = edgeInfo.normal.x * 6;
			const offsetY = edgeInfo.normal.y * 6;
			return `M ${startX + offsetX} ${startY + offsetY} L ${endX + offsetX} ${endY + offsetY} L ${endX - offsetX} ${endY - offsetY} L ${startX - offsetX} ${startY - offsetY} Z`;
		})
		.join(' ');

	return (
		<>
			<rect
				x={0}
				y={0}
				width="100%"
				height="100%"
				fill={TRANSPARENT}
				pointerEvents="none"
				data-remotion-studio-canvas-rotation
			/>
			<path
				d={`M -100000 -100000 H 100000 V 100000 H -100000 Z ${cornerHoles} ${scaleEdgeHoles}`}
				fill={TRANSPARENT}
				fillRule="evenodd"
				pointerEvents="fill"
				cursor={canvasRotationCursor}
				onPointerDown={onPointerDown}
			/>
		</>
	);
};
