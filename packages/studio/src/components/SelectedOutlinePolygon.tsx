import React, {useContext, useMemo, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {
	BLUE,
	TIMELINE_DROP_BLUE_ALPHA_12,
	TRANSPARENT,
} from '../helpers/colors';
import {startPointerSession} from '../helpers/pointer-session';
import {EditorSnappingContext} from '../state/editor-snapping';
import {ContextMenuForTarget} from './ContextMenu';
import {
	addEffectFromDragData,
	getEffectDragData,
	hasEffectDragType,
	hasExplicitEffectDragType,
} from './effect-drag-and-drop';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from './ForceSpecificCursor';
import {showNotification} from './Notifications/NotificationCenter';
import {
	applySelectedOutlineDragAxisLock,
	clearSelectedOutlineDragOverrides,
	getSelectedOutlineDragChanges,
	getSelectedOutlineDragStates,
	getSelectedOutlineDragValues,
	isSelectedOutlineDragPastThreshold,
	type SelectedOutlineKeyframedDragChange,
	type SelectedOutlineStaticDragChange,
} from './selected-outline-drag';
import type {SelectedOutline} from './selected-outline-geometry';
import {
	getOutlineSelectionInteraction,
	pointToString,
} from './selected-outline-measurement';
import {
	findSelectedOutlineSnap,
	type SelectedOutlineSnapPoint,
	type SelectedOutlineSnapTarget,
} from './selected-outline-snap';
import {
	translateFieldKey,
	type SelectedOutlineContextMenuOpenHandler,
	type SelectedOutlineDragTarget,
	type SelectedOutlineTarget,
} from './selected-outline-types';
import {callAddKeyframes} from './Timeline/call-add-keyframe';
import {commitPendingInspectorFields} from './Timeline/focus-inspector-field';
import {getCurrentFrame} from './Timeline/imperative-state';
import {saveSequenceProps} from './Timeline/save-sequence-prop';
import type {
	TimelineSelection,
	TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';

const SelectedOutlinePolygonUnmemoized: React.FC<{
	readonly dragging: boolean;
	readonly getAllDragOutlines: () => readonly SelectedOutline[];
	readonly getAllDragTargets: () => readonly SelectedOutlineDragTarget[];
	readonly getTarget: () => SelectedOutlineTarget | undefined;
	readonly hasEffectDrop: boolean;
	readonly hasTarget: boolean;
	readonly hovered: boolean;
	readonly onContextMenuOpen: SelectedOutlineContextMenuOpenHandler;
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onHoverChange: (key: string | null) => void;
	readonly onSnapPointsChange: (
		snapPoints: readonly SelectedOutlineSnapPoint[],
	) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction: TimelineSelectionInteraction,
	) => void;
	readonly onDoubleClickTarget: (
		target: SelectedOutlineTarget,
		button: number,
	) => boolean;
	readonly scale: number;
	readonly showSelectedOutline: boolean;
	readonly snapTargets: readonly SelectedOutlineSnapTarget[];
}> = ({
	dragging,
	getAllDragOutlines,
	getAllDragTargets,
	getTarget,
	hasEffectDrop,
	hasTarget,
	hovered,
	onContextMenuOpen,
	outline,
	onDraggingChange,
	onHoverChange,
	onSnapPointsChange,
	onSelect,
	onDoubleClickTarget,
	scale,
	showSelectedOutline,
	snapTargets,
}) => {
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {editorSnapping} = useContext(EditorSnappingContext);
	const polygonRef = useRef<SVGPolygonElement>(null);
	const points = useMemo(
		() => outline.points.map(pointToString).join(' '),
		[outline.points],
	);
	const [effectDropHovered, setEffectDropHovered] = useState(false);
	const visible = showSelectedOutline || hovered;

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGPolygonElement>) => {
			const target = getTarget();
			if (event.button !== 0 || target === undefined) {
				return;
			}

			const {drag, selected} = target;

			event.preventDefault();
			event.stopPropagation();

			const interaction = getOutlineSelectionInteraction(event);
			const shouldUpdateSelection =
				!selected || interaction.shiftKey || interaction.toggleKey;
			if (shouldUpdateSelection) {
				onSelect(target.selection, interaction);
			}

			if (drag === null || interaction.shiftKey || interaction.toggleKey) {
				return;
			}

			if (commitPendingInspectorFields()) {
				return;
			}

			const startPointerX = event.clientX;
			const startPointerY = event.clientY;
			const dragStates = getSelectedOutlineDragStates({
				dragTargets: selected ? getAllDragTargets() : [drag],
				getDragOverrides,
				timelinePosition: getCurrentFrame(),
			});
			let lastValues = new Map<string, string>();
			let currentPointerX = startPointerX;
			let currentPointerY = startPointerY;
			let axisLocked = false;
			let dragStarted = false;
			let snappingDisabled = event.metaKey || event.ctrlKey;

			const updateDragOverrides = () => {
				const screenDeltaX = currentPointerX - startPointerX;
				const screenDeltaY = currentPointerY - startPointerY;
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
					forceSpecificCursor('default');
				}

				const axisLockedDirection = axisLocked
					? Math.abs(screenDeltaX) >= Math.abs(screenDeltaY)
						? 'horizontal'
						: 'vertical'
					: null;
				const dragDelta = applySelectedOutlineDragAxisLock({
					deltaX: screenDeltaX / scale,
					deltaY: screenDeltaY / scale,
					axisLocked,
				});
				let {deltaX, deltaY} = dragDelta;

				if (editorSnapping && !snappingDisabled) {
					const snapResult = findSelectedOutlineSnap({
						allowX: axisLockedDirection !== 'vertical',
						allowY: axisLockedDirection !== 'horizontal',
						deltaX,
						deltaY,
						outlines: selected ? getAllDragOutlines() : [outline],
						scale,
						targets: snapTargets,
					});

					if (snapResult.snapOffsetX !== null) {
						deltaX += snapResult.snapOffsetX;
					}

					if (snapResult.snapOffsetY !== null) {
						deltaY += snapResult.snapOffsetY;
					}

					onSnapPointsChange(snapResult.activeSnapPoints);
				} else {
					onSnapPointsChange([]);
				}

				lastValues = getSelectedOutlineDragValues({
					dragStates,
					deltaX,
					deltaY,
				});
				for (const dragState of dragStates) {
					const value = lastValues.get(dragState.key);
					if (value === undefined) {
						throw new Error('Expected drag value to be available');
					}

					if (dragState.target.propStatus.status === 'keyframed') {
						setDragOverrides(
							dragState.target.nodePath,
							translateFieldKey,
							Internals.makeKeyframedDragOverride({
								status: dragState.target.propStatus,
								frame: dragState.sourceFrame,
								value,
							}),
						);
					} else {
						setDragOverrides(
							dragState.target.nodePath,
							translateFieldKey,
							Internals.makeStaticDragOverride(value),
						);
					}
				}
			};

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();
				currentPointerX = moveEvent.clientX;
				currentPointerY = moveEvent.clientY;
				axisLocked = moveEvent.shiftKey;
				snappingDisabled = moveEvent.metaKey || moveEvent.ctrlKey;
				updateDragOverrides();
			};

			const onKeyChange = (keyEvent: KeyboardEvent) => {
				if (keyEvent.key !== 'Shift') {
					return;
				}

				const nextAxisLocked = keyEvent.type === 'keydown';
				if (nextAxisLocked === axisLocked) {
					return;
				}

				axisLocked = nextAxisLocked;
				updateDragOverrides();
			};

			const onPointerUp = () => {
				window.removeEventListener('keydown', onKeyChange);
				window.removeEventListener('keyup', onKeyChange);
				if (dragStarted) {
					stopForcingSpecificCursor();
					onDraggingChange(false);
				}

				const changes = getSelectedOutlineDragChanges({
					dragStates,
					lastValues,
				});

				if (changes.length === 0) {
					clearSelectedOutlineDragOverrides({clearDragOverrides, dragStates});
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
								clientId: drag.clientId,
								undoLabel:
									changes.length > 1
										? 'Move selected sequences'
										: 'Move sequence',
								redoLabel:
									changes.length > 1
										? 'Move selected sequences back'
										: 'Move sequence back',
							})
						: Promise.resolve(),
					callAddKeyframes({
						sequenceKeyframes: keyframedChanges,
						effectKeyframes: [],
						setPropStatuses,
						clientId: drag.clientId,
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
						clearSelectedOutlineDragOverrides({clearDragOverrides, dragStates});
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
			editorSnapping,
			getAllDragOutlines,
			getAllDragTargets,
			getDragOverrides,
			getTarget,
			onDraggingChange,
			onSelect,
			onSnapPointsChange,
			outline,
			scale,
			setPropStatuses,
			setDragOverrides,
			snapTargets,
		],
	);

	const onDoubleClick = React.useCallback(
		(event: React.MouseEvent<SVGPolygonElement>) => {
			const target = getTarget();
			if (target === undefined) {
				return;
			}

			if (!onDoubleClickTarget(target, event.button)) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
		},
		[getTarget, onDoubleClickTarget],
	);

	const onEffectDragOver = React.useCallback(
		(event: React.DragEvent<SVGPolygonElement>) => {
			const effectDrop = getTarget()?.effectDrop ?? null;
			if (effectDrop === null || !hasEffectDragType(event.dataTransfer)) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = 'copy';
			setEffectDropHovered(true);
		},
		[getTarget],
	);

	const onEffectDragLeave = React.useCallback(
		(event: React.DragEvent<SVGPolygonElement>) => {
			if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
				return;
			}

			setEffectDropHovered(false);
		},
		[],
	);

	const onEffectDrop = React.useCallback(
		async (event: React.DragEvent<SVGPolygonElement>) => {
			const effectDrop = getTarget()?.effectDrop ?? null;
			if (effectDrop === null || !hasEffectDragType(event.dataTransfer)) {
				return;
			}

			const dragData = getEffectDragData(event.dataTransfer);
			if (!dragData) {
				if (hasExplicitEffectDragType(event.dataTransfer)) {
					event.preventDefault();
					event.stopPropagation();
					setEffectDropHovered(false);
					showNotification('Could not read effect drag data', 3000);
				}

				return;
			}

			event.preventDefault();
			event.stopPropagation();
			setEffectDropHovered(false);

			await addEffectFromDragData({
				dragData,
				fileName: effectDrop.fileName,
				nodePath: effectDrop.nodePath,
				clientId: effectDrop.clientId,
			});
		},
		[getTarget],
	);

	return (
		<>
			<polygon
				ref={polygonRef}
				points={points}
				fill={effectDropHovered ? TIMELINE_DROP_BLUE_ALPHA_12 : TRANSPARENT}
				stroke={BLUE}
				strokeOpacity={visible || effectDropHovered ? 1 : 0}
				strokeWidth={2}
				vectorEffect="non-scaling-stroke"
				pointerEvents={hasTarget ? 'all' : undefined}
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
				onDoubleClick={onDoubleClick}
				onDragOver={hasEffectDrop ? onEffectDragOver : undefined}
				onDragLeave={hasEffectDrop ? onEffectDragLeave : undefined}
				onDrop={hasEffectDrop ? onEffectDrop : undefined}
			/>
			<ContextMenuForTarget
				triggerRef={polygonRef}
				getItems={onContextMenuOpen}
			/>
		</>
	);
};

export const SelectedOutlinePolygon = React.memo(
	SelectedOutlinePolygonUnmemoized,
);
