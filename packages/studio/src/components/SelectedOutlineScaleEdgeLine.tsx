import React, {useContext, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import {TRANSPARENT} from '../helpers/colors';
import {startPointerSession} from '../helpers/pointer-session';
import {ContextMenuForTarget} from './ContextMenu';
import {
	forceSpecificCursor,
	stopForcingSpecificCursor,
} from './ForceSpecificCursor';
import {showNotification} from './Notifications/NotificationCenter';
import {
	clearSelectedOutlineScaleDragOverrides,
	getSelectedOutlineScaleDragChanges,
	getSelectedOutlineScaleDragStates,
	getSelectedOutlineScaleDragValues,
	getSelectedOutlineScaleEdgeInfo,
	isSelectedOutlineDragPastThreshold,
	type SelectedOutlineKeyframedDragChange,
	type SelectedOutlineScaleEdge,
	type SelectedOutlineStaticDragChange,
} from './selected-outline-drag';
import type {SelectedOutline} from './selected-outline-geometry';
import {
	dot,
	getOutlineSelectionInteraction,
} from './selected-outline-measurement';
import {
	scaleFieldKey,
	type SelectedOutlineContextMenuOpenHandler,
	type SelectedOutlineScaleDragTarget,
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

export const SelectedOutlineScaleEdgeLine: React.FC<{
	readonly allScaleDragTargets: readonly SelectedOutlineScaleDragTarget[];
	readonly dragging: boolean;
	readonly edge: SelectedOutlineScaleEdge;
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onContextMenuOpen: SelectedOutlineContextMenuOpenHandler;
	readonly onHoverChange: (key: string | null) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction: TimelineSelectionInteraction,
	) => void;
	readonly target: SelectedOutlineTarget | undefined;
}> = ({
	allScaleDragTargets,
	dragging,
	edge,
	outline,
	onDraggingChange,
	onContextMenuOpen,
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
	const scaleDrag = target?.scaleDrag ?? null;
	const selected = target?.selected ?? false;
	const lineRef = useRef<SVGLineElement>(null);
	const edgeInfo = useMemo(
		() => getSelectedOutlineScaleEdgeInfo(outline.points, edge),
		[edge, outline.points],
	);

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGLineElement>) => {
			if (event.button !== 0 || scaleDrag === null || edgeInfo === null) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const interaction = getOutlineSelectionInteraction(event);
			const shouldUpdateSelection =
				!selected || interaction.shiftKey || interaction.toggleKey;
			if (shouldUpdateSelection && target !== undefined) {
				onSelect(target.selection, interaction);
			}

			if (interaction.shiftKey || interaction.toggleKey) {
				return;
			}

			if (commitPendingInspectorFields()) {
				return;
			}

			const startPointer = {x: event.clientX, y: event.clientY};
			const dragStates = getSelectedOutlineScaleDragStates({
				dragTargets: selected ? allScaleDragTargets : [scaleDrag],
				getDragOverrides,
				timelinePosition: getCurrentFrame(),
			});
			let lastValues = new Map<string, number | string>();
			let dragStarted = false;

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();

				const delta = {
					x: moveEvent.clientX - startPointer.x,
					y: moveEvent.clientY - startPointer.y,
				};
				if (!dragStarted) {
					if (
						!isSelectedOutlineDragPastThreshold({
							deltaX: delta.x,
							deltaY: delta.y,
						})
					) {
						return;
					}

					dragStarted = true;
					onDraggingChange(true);
					forceSpecificCursor(edgeInfo.cursor);
				}

				const projectedDelta = dot(delta, edgeInfo.normal);
				const scaleFactor = Math.max(
					0.001,
					1 + projectedDelta / edgeInfo.extent,
				);

				lastValues = getSelectedOutlineScaleDragValues({
					dragStates,
					axis: edgeInfo.axis,
					scaleFactor,
				});

				for (const dragState of dragStates) {
					const value = lastValues.get(dragState.key);
					if (value === undefined) {
						throw new Error('Expected scale drag value to be available');
					}

					if (dragState.target.propStatus.status === 'keyframed') {
						setDragOverrides(
							dragState.target.nodePath,
							scaleFieldKey,
							Internals.makeKeyframedDragOverride({
								status: dragState.target.propStatus,
								frame: dragState.sourceFrame,
								value,
							}),
						);
					} else {
						setDragOverrides(
							dragState.target.nodePath,
							scaleFieldKey,
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

				const changes = getSelectedOutlineScaleDragChanges({
					dragStates,
					lastValues,
				});

				if (changes.length === 0) {
					clearSelectedOutlineScaleDragOverrides({
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
								clientId: scaleDrag.clientId,
								undoLabel:
									changes.length > 1
										? 'Scale selected sequences'
										: 'Scale sequence',
								redoLabel:
									changes.length > 1
										? 'Scale selected sequences back'
										: 'Scale sequence back',
							})
						: Promise.resolve(),
					callAddKeyframes({
						sequenceKeyframes: keyframedChanges,
						effectKeyframes: [],
						setPropStatuses,
						clientId: scaleDrag.clientId,
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
						clearSelectedOutlineScaleDragOverrides({
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
			allScaleDragTargets,
			clearDragOverrides,
			edgeInfo,
			getDragOverrides,
			onDraggingChange,
			onSelect,
			scaleDrag,
			selected,
			setPropStatuses,
			setDragOverrides,
			target,
		],
	);

	if (scaleDrag === null || edgeInfo === null) {
		return null;
	}

	return (
		<>
			<line
				ref={lineRef}
				x1={edgeInfo.start.x}
				y1={edgeInfo.start.y}
				x2={edgeInfo.end.x}
				y2={edgeInfo.end.y}
				stroke={TRANSPARENT}
				strokeWidth={12}
				vectorEffect="non-scaling-stroke"
				pointerEvents="stroke"
				cursor={edgeInfo.cursor}
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
			<ContextMenuForTarget triggerRef={lineRef} getItems={onContextMenuOpen} />
		</>
	);
};
