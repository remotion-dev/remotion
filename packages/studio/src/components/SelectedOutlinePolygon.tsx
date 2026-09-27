import {CanvasInternals} from '@remotion/canvas';
import React, {useContext, useMemo, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	BLUE,
	TIMELINE_DROP_BLUE_ALPHA_12,
	TRANSPARENT,
} from '../helpers/colors';
import {createDragAwareDoubleClickTracker} from '../helpers/drag-aware-double-click';
import {isStudioInteractivityEnabled} from '../helpers/interactivity-enabled';
import {isMac} from '../helpers/is-mac';
import {EditorShowGuidesContext} from '../state/editor-guides';
import {EditorSnappingContext} from '../state/editor-snapping';
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
	clearSelectedOutlineDragOverrides,
	type SelectedOutlineKeyframedDragChange,
	type SelectedOutlineStaticDragChange,
} from './selected-outline-drag';
import type {SelectedOutline} from './selected-outline-geometry';
import {
	getSelectedOutlineSnapTargets,
	type SelectedOutlineSnapPoint,
} from './selected-outline-snap';
import type {
	SelectedOutlineDragTarget,
	SelectedOutlineLayoutTarget,
	SelectedOutlineTarget,
} from './selected-outline-types';
import {callAddKeyframes} from './Timeline/call-add-keyframe';
import {commitPendingInspectorFields} from './Timeline/focus-inspector-field';
import {getCurrentFrame} from './Timeline/imperative-state';
import {saveSequenceProps} from './Timeline/save-sequence-prop';
import {PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR} from './Timeline/should-clear-selection-on-pointer-down';
import type {
	TimelineSelection,
	TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';
import {useTimelineSelection} from './Timeline/TimelineSelection';

const {
	CanvasOutlinePolygon,
	getCanvasOutlineTranslateDragStates,
	handleCanvasOutlinePointerDown,
	startCanvasOutlineTranslateDrag,
} = CanvasInternals;

export const SELECTED_OUTLINE_KEY_ATTR =
	'data-remotion-studio-selected-outline-key';

const SelectedOutlinePolygonUnmemoized: React.FC<{
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly containsSelection: boolean;
	readonly directlySelected: boolean;
	readonly dragging: boolean;
	readonly getAllDragOutlines: () => readonly SelectedOutline[];
	readonly getAllDragTargets: () => readonly SelectedOutlineDragTarget[];
	readonly getLayoutTarget: () => SelectedOutlineLayoutTarget | undefined;
	readonly getTarget: () => SelectedOutlineTarget | undefined;
	readonly hasTarget: boolean;
	readonly hovered: boolean;
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
		sequenceWasDragged: boolean,
	) => boolean;
	readonly scale: number;
	readonly showSelectedOutline: boolean;
	readonly translateWithCommandKey: boolean;
}> = ({
	compositionHeight,
	compositionWidth,
	containsSelection,
	directlySelected,
	dragging,
	getAllDragOutlines,
	getAllDragTargets,
	getLayoutTarget,
	getTarget,
	hasTarget,
	hovered,
	outline,
	onDraggingChange,
	onHoverChange,
	onSnapPointsChange,
	onSelect,
	onDoubleClickTarget,
	scale,
	showSelectedOutline,
	translateWithCommandKey,
}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const dragAwareDoubleClick = useMemo(
		() => createDragAwareDoubleClickTracker(),
		[],
	);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {editorSnapping} = useContext(EditorSnappingContext);
	const {editorShowGuides, guidesList} = useContext(EditorShowGuidesContext);
	const polygonRef = useRef<SVGPolygonElement>(null);
	const {selectItems} = useTimelineSelection();
	const [effectDropHovered, setEffectDropHovered] = useState(false);
	const visible = showSelectedOutline || hovered;
	const getEffectDropTarget = React.useCallback(() => {
		if (
			previewServerState.type !== 'connected' ||
			!isStudioInteractivityEnabled()
		) {
			return null;
		}

		const target = getLayoutTarget();
		if (target?.sequence.controls?.supportsEffects !== true) {
			return null;
		}

		const nodePath = target.nodePathInfo.sequenceSubscriptionKey;
		return {
			clientId: previewServerState.clientId,
			fileName: nodePath.absolutePath,
			nodePathInfo: target.nodePathInfo,
		};
	}, [getLayoutTarget, previewServerState]);

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGPolygonElement>) => {
			const target = getTarget();
			const decision = handleCanvasOutlinePointerDown({
				event,
				polygon: polygonRef.current,
				hasTarget: target !== undefined,
				selected: target?.selected ?? false,
				containsSelection,
				translateWithCommandKey,
				isMac,
			});
			if (decision === null || target === undefined) {
				return;
			}

			const {drag} = target;
			const {
				interaction,
				temporaryTranslate,
				shouldUpdateSelection,
				deferSelection,
				dragExistingSelection,
			} = decision;
			if (!deferSelection && shouldUpdateSelection) {
				onSelect(target.selection, interaction);
			}

			if (
				interaction.shiftKey ||
				interaction.toggleKey ||
				(drag === null && !deferSelection)
			) {
				return;
			}

			if (commitPendingInspectorFields()) {
				if (deferSelection) {
					onSelect(target.selection, interaction);
				}

				return;
			}

			const dragTargets = dragExistingSelection
				? getAllDragTargets()
				: drag === null
					? []
					: [drag];
			if (dragTargets.length === 0) {
				if (deferSelection) {
					onSelect(target.selection, interaction);
				}

				return;
			}

			const [{clientId}] = dragTargets;
			startCanvasOutlineTranslateDrag({
				event,
				captureTarget: event.currentTarget,
				dragStates: getCanvasOutlineTranslateDragStates({
					dragTargets,
					getDragOverrides,
					timelinePosition: getCurrentFrame(),
				}),
				scale,
				snapping: editorSnapping
					? {
							outlines: dragExistingSelection
								? getAllDragOutlines()
								: [outline],
							getTargets: () =>
								getSelectedOutlineSnapTargets({
									compositionHeight,
									compositionWidth,
									guides:
										editorShowGuides && canvasContent?.type === 'composition'
											? guidesList.filter(
													(guide) =>
														guide.compositionId === canvasContent.compositionId,
												)
											: [],
								}),
							onSnapPointsChange,
							// Command already means "translate" in rotation mode.
							modifierDisablesSnapping: !temporaryTranslate,
						}
					: null,
				setDragOverrides,
				clearDragOverrides,
				onDragStart: () => {
					onDraggingChange(true);
					forceSpecificCursor('default');
				},
				onDragEnd: ({changes, dragged, released, session}) => {
					dragAwareDoubleClick.endPointerGesture(dragged);
					if (dragged) {
						stopForcingSpecificCursor();
						onDraggingChange(false);
					}

					if (changes.length === 0) {
						if (deferSelection && !dragged && released) {
							onSelect(target.selection, interaction);
						}

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
									clientId,
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
							clientId,
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
							clearSelectedOutlineDragOverrides({
								clearDragOverrides,
								dragStates: session.dragStates,
							});
						});
				},
			});
		},
		[
			canvasContent,
			clearDragOverrides,
			compositionHeight,
			compositionWidth,
			containsSelection,
			dragAwareDoubleClick,
			editorShowGuides,
			editorSnapping,
			getAllDragOutlines,
			getAllDragTargets,
			getDragOverrides,
			getTarget,
			guidesList,
			onDraggingChange,
			onSelect,
			onSnapPointsChange,
			outline,
			scale,
			setPropStatuses,
			setDragOverrides,
			translateWithCommandKey,
		],
	);

	const performDoubleClick = React.useCallback(
		(event: React.MouseEvent<SVGPolygonElement>) => {
			const target = getTarget();
			if (target === undefined) {
				return;
			}

			if (
				!onDoubleClickTarget(
					target,
					event.button,
					dragAwareDoubleClick.consumePointerGestureWasDragged(),
				)
			) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
		},
		[dragAwareDoubleClick, getTarget, onDoubleClickTarget],
	);
	const onClick = React.useCallback(
		(event: React.MouseEvent<SVGPolygonElement>) => {
			if (!dragAwareDoubleClick.acceptClickAsDoubleClick(event)) {
				return;
			}

			performDoubleClick(event);
		},
		[dragAwareDoubleClick, performDoubleClick],
	);

	const onEffectDragOver = React.useCallback(
		(event: React.DragEvent<SVGPolygonElement>) => {
			if (!hasEffectDragType(event.dataTransfer)) {
				return;
			}

			const effectDrop = getEffectDropTarget();
			if (effectDrop === null) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = 'copy';
			setEffectDropHovered(true);
		},
		[getEffectDropTarget],
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
			if (!hasEffectDragType(event.dataTransfer)) {
				return;
			}

			const effectDrop = getEffectDropTarget();
			if (effectDrop === null) {
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
				nodePathInfo: effectDrop.nodePathInfo,
				clientId: effectDrop.clientId,
				selectItems,
			});
		},
		[getEffectDropTarget, selectItems],
	);

	return (
		<CanvasOutlinePolygon
			ref={polygonRef}
			{...{
				[PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR]: 'true',
				[SELECTED_OUTLINE_KEY_ATTR]: outline.key,
			}}
			outline={outline}
			directlySelected={directlySelected}
			dragging={dragging}
			fill={effectDropHovered ? TIMELINE_DROP_BLUE_ALPHA_12 : TRANSPARENT}
			stroke={BLUE}
			visible={visible || effectDropHovered}
			interactive={hasTarget}
			onHoverChange={onHoverChange}
			onPointerDown={onPointerDown}
			onPointerDownCapture={dragAwareDoubleClick.beginPointerGesture}
			onClick={onClick}
			onDragOver={onEffectDragOver}
			onDragLeave={onEffectDragLeave}
			onDrop={onEffectDrop}
		/>
	);
};

export const SelectedOutlinePolygon = React.memo(
	SelectedOutlinePolygonUnmemoized,
);
