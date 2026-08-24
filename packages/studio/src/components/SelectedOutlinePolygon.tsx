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
import {
	startCapturedPointerSession,
	type PointerSessionEndReason,
} from '../helpers/pointer-session';
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
	getSelectedOutlineSnapTargets,
	type SelectedOutlineSnapPoint,
} from './selected-outline-snap';
import {
	translateFieldKey,
	type SelectedOutlineDragTarget,
	type SelectedOutlineLayoutTarget,
	type SelectedOutlineTarget,
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
	const points = useMemo(
		() => outline.points.map(pointToString).join(' '),
		[outline.points],
	);
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
			nodePath,
		};
	}, [getLayoutTarget, previewServerState]);

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
			const ownerSvg = polygonRef.current?.ownerSVGElement;
			let pointerInsideSelectedOutline = false;
			if (ownerSvg) {
				const screenPoint = ownerSvg.createSVGPoint();
				screenPoint.x = event.clientX;
				screenPoint.y = event.clientY;
				pointerInsideSelectedOutline = Array.from(
					ownerSvg.querySelectorAll<SVGPolygonElement>(
						'polygon[data-remotion-directly-selected-outline="true"]',
					),
				).some((selectedPolygon) => {
					const screenTransform = selectedPolygon.getScreenCTM();
					if (screenTransform === null) {
						return false;
					}

					const polygonPoint = screenPoint.matrixTransform(
						screenTransform.inverse(),
					);
					return (
						selectedPolygon.isPointInFill(polygonPoint) ||
						selectedPolygon.isPointInStroke(polygonPoint)
					);
				});
			}

			const deferSelection =
				!selected &&
				!interaction.shiftKey &&
				!interaction.toggleKey &&
				(containsSelection || pointerInsideSelectedOutline);
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

			const startPointerX = event.clientX;
			const startPointerY = event.clientY;
			const dragExistingSelection = selected || deferSelection;
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

			const dragStates = getSelectedOutlineDragStates({
				dragTargets,
				getDragOverrides,
				timelinePosition: getCurrentFrame(),
			});
			const dragOutlines = dragExistingSelection
				? getAllDragOutlines()
				: [outline];
			const [{clientId}] = dragTargets;
			let lastValues = new Map<string, string>();
			let currentPointerX = startPointerX;
			let currentPointerY = startPointerY;
			let axisLocked = false;
			let dragStarted = false;
			let snappingDisabled = event.metaKey || event.ctrlKey;
			let snapTargets: ReturnType<typeof getSelectedOutlineSnapTargets> | null =
				null;

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
					snapTargets ??= getSelectedOutlineSnapTargets({
						compositionHeight,
						compositionWidth,
						guides:
							editorShowGuides && canvasContent?.type === 'composition'
								? guidesList.filter(
										(guide) =>
											guide.compositionId === canvasContent.compositionId,
									)
								: [],
					});
					const snapResult = findSelectedOutlineSnap({
						allowX: axisLockedDirection !== 'vertical',
						allowY: axisLockedDirection !== 'horizontal',
						deltaX,
						deltaY,
						outlines: dragOutlines,
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

			const onPointerUp = (reason: PointerSessionEndReason) => {
				dragAwareDoubleClick.endPointerGesture(dragStarted);
				window.removeEventListener('keydown', onKeyChange);
				window.removeEventListener('keyup', onKeyChange);
				if (dragStarted) {
					stopForcingSpecificCursor();
					onSnapPointsChange([]);
					onDraggingChange(false);
				}

				const changes = getSelectedOutlineDragChanges({
					dragStates,
					lastValues,
				});

				if (changes.length === 0) {
					clearSelectedOutlineDragOverrides({clearDragOverrides, dragStates});
					if (deferSelection && !dragStarted && reason === 'pointerup') {
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
						clearSelectedOutlineDragOverrides({clearDragOverrides, dragStates});
					});
			};

			startCapturedPointerSession({
				event,
				captureTarget: event.currentTarget,
				onMove: onPointerMove,
				onEnd: onPointerUp,
			});
			window.addEventListener('keydown', onKeyChange);
			window.addEventListener('keyup', onKeyChange);
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
		],
	);

	const onDoubleClick = React.useCallback(
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
				nodePath: effectDrop.nodePath,
				clientId: effectDrop.clientId,
			});
		},
		[getEffectDropTarget],
	);

	return (
		<polygon
			ref={polygonRef}
			{...{
				[PREVENT_CLEAR_SELECTION_ON_POINTER_DOWN_ATTR]: 'true',
				[SELECTED_OUTLINE_KEY_ATTR]: outline.key,
			}}
			data-remotion-directly-selected-outline={
				directlySelected ? 'true' : undefined
			}
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
			onPointerDownCapture={dragAwareDoubleClick.beginPointerGesture}
			onDoubleClick={onDoubleClick}
			onDragOver={onEffectDragOver}
			onDragLeave={onEffectDragLeave}
			onDrop={onEffectDrop}
		/>
	);
};

export const SelectedOutlinePolygon = React.memo(
	SelectedOutlinePolygonUnmemoized,
);
