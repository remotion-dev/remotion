import React, {useContext, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import {TRANSPARENT} from '../helpers/colors';
import {startEscapeCancelableCapturedPointerSession} from '../helpers/escape-cancelable-pointer-session';
import {isPointerSessionRelease} from '../helpers/pointer-session';
import {EditorSnappingContext} from '../state/editor-snapping';
import {createCanvasDragPreview} from './canvas-drag-preview';
import {ContextMenuForTarget} from './ContextMenu';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from './ForceSpecificCursor';
import {showNotification} from './Notifications/NotificationCenter';
import {
	getSelectedOutlineRotationDragChanges,
	getSelectedOutlineRotationDragStates,
	getSelectedOutlineRotationDragValues,
	isSelectedOutlineDragPastThreshold,
	snapSelectedOutlineRotationDeltaDegrees,
	type SelectedOutlineKeyframedDragChange,
	type SelectedOutlineStaticDragChange,
} from './selected-outline-drag';
import type {SelectedOutline} from './selected-outline-geometry';
import {
	getAngleDegrees,
	getOutlineSelectionInteraction,
	getRotationCursor,
	getSelectedOutlineRotationCornerInfo,
	getSelectedOutlineRotationDeltaDegrees,
	getSelectedOutlineRotationPivot,
	type SelectedOutlineRotationCorner,
} from './selected-outline-measurement';
import {
	rotateFieldKey,
	type SelectedOutlineContextMenuOpenHandler,
	type SelectedOutlineRotationDragTarget,
	type SelectedOutlineTarget,
} from './selected-outline-types';
import {svgPointToClientPoint} from './svg-point-to-client-point';
import {commitPendingInspectorFields} from './Timeline/focus-inspector-field';
import {getCurrentFrame} from './Timeline/imperative-state';
import {saveSequencePropsWithResult} from './Timeline/save-sequence-prop';
import type {
	TimelineSelection,
	TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';

export const SelectedOutlineRotationCornerHandle: React.FC<{
	readonly getAllRotationDragTargets: () => readonly SelectedOutlineRotationDragTarget[];
	readonly corner: SelectedOutlineRotationCorner;
	readonly dragging: boolean;
	readonly handlePoint: {readonly x: number; readonly y: number};
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onContextMenuOpen: SelectedOutlineContextMenuOpenHandler;
	readonly onContextMenuOpenChange: (open: boolean) => void;
	readonly onHoverChange: (key: string | null) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction: TimelineSelectionInteraction,
	) => void;
	readonly radius: number;
	readonly target: SelectedOutlineTarget | undefined;
}> = ({
	getAllRotationDragTargets,
	corner,
	dragging,
	handlePoint,
	outline,
	onDraggingChange,
	onContextMenuOpen,
	onContextMenuOpenChange,
	onHoverChange,
	onSelect,
	radius,
	target,
}) => {
	const dragOverridesRef = useContext(
		Internals.VisualModeDragOverridesRefContext,
	);
	const {setPropStatuses, updateDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const {editorSnapping} = useContext(EditorSnappingContext);
	const rotationDrag = target?.rotationDrag ?? null;
	const selected = target?.selected ?? false;
	const containsSelection = target?.containsSelection ?? false;
	const circleRef = useRef<SVGCircleElement>(null);
	const cornerInfo = useMemo(
		() => getSelectedOutlineRotationCornerInfo(outline.points, corner),
		[corner, outline.points],
	);

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGCircleElement>) => {
			if (event.button !== 0 || rotationDrag === null) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const svg = event.currentTarget.ownerSVGElement;
			if (svg === null) {
				return;
			}

			const interaction = getOutlineSelectionInteraction(event);
			const shouldUpdateSelection =
				(!selected && !containsSelection) || interaction.toggleKey;
			if (shouldUpdateSelection && target !== undefined) {
				onSelect(target.selection, {
					shiftKey: false,
					toggleKey: interaction.toggleKey,
				});
			}

			if (interaction.toggleKey) {
				return;
			}

			if (commitPendingInspectorFields()) {
				return;
			}

			const startPointer = {x: event.clientX, y: event.clientY};
			const svgRect = svg.getBoundingClientRect();
			const center = svgPointToClientPoint(
				getSelectedOutlineRotationPivot({
					dimensions: outline.dimensions,
					points: outline.uncroppedPoints ?? outline.points,
					transformOriginValue: rotationDrag.transformOriginValue,
				}),
				svgRect,
			);
			const preview = createCanvasDragPreview({
				updateDragOverrides,
				setPropStatuses,
				setPropStatusesBatch: null,
				getPropStatuses: (nodePath) =>
					propStatusesRef.current[
						Internals.makeSequencePropsSubscriptionKey(nodePath)
					],
			});
			const dragStates = getSelectedOutlineRotationDragStates({
				dragTargets: selected ? getAllRotationDragTargets() : [rotationDrag],
				getDragOverrides: dragOverridesRef.current.getDragOverrides,
				timelinePosition: getCurrentFrame(),
			});
			let previousAngle = getAngleDegrees(center, {
				x: event.clientX,
				y: event.clientY,
			});
			let accumulatedDelta = 0;
			let rotationLocked = event.shiftKey;
			let lastValues = new Map<string, string>();
			let dragStarted = false;

			const updateRotationDragOverrides = () => {
				const rotationDeltaDegrees =
					rotationLocked && editorSnapping
						? snapSelectedOutlineRotationDeltaDegrees({
								dragStates,
								rotationDeltaDegrees: accumulatedDelta,
							})
						: accumulatedDelta;
				lastValues = getSelectedOutlineRotationDragValues({
					dragStates,
					rotationDeltaDegrees,
				});
				forceSpecificCursor(
					getRotationCursor(cornerInfo.cursorDegrees + rotationDeltaDegrees),
				);

				for (const dragState of dragStates) {
					const value = lastValues.get(dragState.key);
					if (value === undefined) {
						throw new Error('Expected rotation drag value to be available');
					}

					if (dragState.target.propStatus.status === 'keyframed') {
						preview.setDragOverrides(
							dragState.target.nodePath,
							rotateFieldKey,
							Internals.makeKeyframedDragOverride({
								status: dragState.target.propStatus,
								frame: dragState.sourceFrame,
								value,
							}),
						);
					} else {
						preview.setDragOverrides(
							dragState.target.nodePath,
							rotateFieldKey,
							Internals.makeStaticDragOverride(value),
						);
					}
				}
			};

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

				const nextAngle = getAngleDegrees(center, {
					x: moveEvent.clientX,
					y: moveEvent.clientY,
				});
				accumulatedDelta += getSelectedOutlineRotationDeltaDegrees({
					from: previousAngle,
					to: nextAngle,
				});
				previousAngle = nextAngle;
				rotationLocked = moveEvent.shiftKey;
				updateRotationDragOverrides();
			};

			const onKeyChange = (keyEvent: KeyboardEvent) => {
				if (keyEvent.key !== 'Shift') {
					return;
				}

				const nextRotationLocked = keyEvent.type === 'keydown';
				if (nextRotationLocked === rotationLocked) {
					return;
				}

				rotationLocked = nextRotationLocked;
				if (dragStarted) {
					updateRotationDragOverrides();
				}
			};

			const finishDrag = (commit: boolean) => {
				window.removeEventListener('keydown', onKeyChange);
				window.removeEventListener('keyup', onKeyChange);
				if (dragStarted) {
					stopForcingSpecificCursor();
					onDraggingChange(false);
				}

				const changes = getSelectedOutlineRotationDragChanges({
					dragStates,
					lastValues,
				});

				if (!commit || changes.length === 0) {
					preview.cancel();
					return;
				}

				const changesToSave: (
					| SelectedOutlineStaticDragChange
					| SelectedOutlineKeyframedDragChange
				)[] = [];
				for (const change of changes) {
					const nodePath = preview.getNodePath(change.nodePath);
					if (nodePath === null) {
						preview.cancel();
						return;
					}

					changesToSave.push({...change, nodePath});
				}

				const staticChanges = changesToSave.filter(
					(change): change is SelectedOutlineStaticDragChange =>
						change.type === 'static',
				);
				const keyframedChanges = changesToSave.filter(
					(change): change is SelectedOutlineKeyframedDragChange =>
						change.type === 'keyframed',
				);

				saveSequencePropsWithResult({
					changes: staticChanges,
					addedKeyframes: keyframedChanges,
					movedKeyframes: null,
					setPropStatuses: preview.setPropStatuses,
					clientId: rotationDrag.clientId,
					undoLabel:
						changes.length > 1
							? 'Rotate selected sequences'
							: 'Rotate sequence',
					redoLabel:
						changes.length > 1
							? 'Rotate selected sequences back'
							: 'Rotate sequence back',
				})
					.then((response) => {
						if (response && !response.canUpdate) {
							throw new Error(
								'The layer could not be updated. Try the edit again.',
							);
						}

						preview.acknowledge(response);
					})
					.catch((err) => {
						preview.fail();
						showNotification(
							`Could not save sequence props: ${
								err instanceof Error ? err.message : String(err)
							}`,
							4000,
						);
					});
			};

			startEscapeCancelableCapturedPointerSession({
				event,
				captureTarget: event.currentTarget,
				onMove: onPointerMove,
				onEnd: (reason, endEvent) => {
					finishDrag(isPointerSessionRelease(reason, endEvent));
				},
			});
			window.addEventListener('keydown', onKeyChange);
			window.addEventListener('keyup', onKeyChange);
		},
		[
			containsSelection,
			cornerInfo,
			editorSnapping,
			dragOverridesRef,
			getAllRotationDragTargets,
			onDraggingChange,
			outline.dimensions,
			outline.points,
			outline.uncroppedPoints,
			onSelect,
			rotationDrag,
			selected,
			setPropStatuses,
			updateDragOverrides,
			propStatusesRef,
			target,
		],
	);

	if (rotationDrag === null) {
		return null;
	}

	return (
		<>
			<circle
				ref={circleRef}
				cx={handlePoint.x}
				cy={handlePoint.y}
				r={radius}
				fill={TRANSPARENT}
				stroke={TRANSPARENT}
				vectorEffect="non-scaling-stroke"
				pointerEvents="all"
				cursor={cornerInfo.cursor}
				data-remotion-studio-rotation-corner={corner}
				data-remotion-studio-rotation-corner-contains-selection={
					containsSelection
				}
				onPointerEnter={() => {
					if (!dragging) {
						onHoverChange(outline.key);
					}
				}}
				onPointerLeave={() => {
					if (!dragging) {
						onHoverChange(null);
					}
				}}
				onPointerDown={onPointerDown}
			/>
			<ContextMenuForTarget
				triggerRef={circleRef}
				getItems={onContextMenuOpen}
				onOpenChange={onContextMenuOpenChange}
			/>
		</>
	);
};
