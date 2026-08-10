import React, {useContext, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import {TRANSPARENT} from '../helpers/colors';
import {startPointerSession} from '../helpers/pointer-session';
import {EditorSnappingContext} from '../state/editor-snapping';
import {ContextMenuForTarget} from './ContextMenu';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from './ForceSpecificCursor';
import {showNotification} from './Notifications/NotificationCenter';
import {
	clearSelectedOutlineRotationDragOverrides,
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
import {callAddKeyframes} from './Timeline/call-add-keyframe';
import {commitPendingInspectorFields} from './Timeline/focus-inspector-field';
import {getCurrentFrame} from './Timeline/imperative-state';
import {saveSequenceProps} from './Timeline/save-sequence-prop';
import type {
	TimelineSelection,
	TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';

export const SelectedOutlineRotationCornerHandle: React.FC<{
	readonly getAllRotationDragTargets: () => readonly SelectedOutlineRotationDragTarget[];
	readonly corner: SelectedOutlineRotationCorner;
	readonly dragging: boolean;
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onContextMenuOpen: SelectedOutlineContextMenuOpenHandler;
	readonly onContextMenuOpenChange: (open: boolean) => void;
	readonly onHoverChange: (key: string | null) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction: TimelineSelectionInteraction,
	) => void;
	readonly target: SelectedOutlineTarget | undefined;
}> = ({
	getAllRotationDragTargets,
	corner,
	dragging,
	outline,
	onDraggingChange,
	onContextMenuOpen,
	onContextMenuOpenChange,
	onHoverChange,
	onSelect,
	target,
}) => {
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {editorSnapping} = useContext(EditorSnappingContext);
	const rotationDrag = target?.rotationDrag ?? null;
	const selected = target?.selected ?? false;
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
			const shouldUpdateSelection = !selected || interaction.toggleKey;
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
			const dragStates = getSelectedOutlineRotationDragStates({
				dragTargets: selected ? getAllRotationDragTargets() : [rotationDrag],
				getDragOverrides,
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

			const onPointerUp = () => {
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
								undoLabel:
									changes.length > 1
										? 'Rotate selected sequences'
										: 'Rotate sequence',
								redoLabel:
									changes.length > 1
										? 'Rotate selected sequences back'
										: 'Rotate sequence back',
							})
						: Promise.resolve(),
					callAddKeyframes({
						sequenceKeyframes: keyframedChanges,
						effectKeyframes: [],
						setPropStatuses,
						clientId: rotationDrag.clientId,
					}),
				])
					.catch((err) => {
						showNotification(
							`Could not save sequence props: ${
								err instanceof Error ? err.message : String(err)
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
			window.addEventListener('keydown', onKeyChange);
			window.addEventListener('keyup', onKeyChange);
		},
		[
			clearDragOverrides,
			cornerInfo,
			editorSnapping,
			getDragOverrides,
			getAllRotationDragTargets,
			onDraggingChange,
			outline.dimensions,
			outline.points,
			outline.uncroppedPoints,
			onSelect,
			rotationDrag,
			selected,
			setPropStatuses,
			setDragOverrides,
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
				cx={cornerInfo.point.x}
				cy={cornerInfo.point.y}
				r={12}
				fill={TRANSPARENT}
				stroke={TRANSPARENT}
				vectorEffect="non-scaling-stroke"
				pointerEvents="all"
				cursor={cornerInfo.cursor}
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
