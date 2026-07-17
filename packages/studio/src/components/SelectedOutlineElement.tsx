import React, {useContext, useMemo, useRef, useState} from 'react';
import type {ResolvedStackLocation} from 'remotion';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	BLUE,
	SELECTED_OUTLINE_DROP_SHADOW,
	TIMELINE_DROP_BLUE_ALPHA_12,
	TRANSPARENT,
} from '../helpers/colors';
import {formatFileLocation} from '../helpers/format-file-location';
import {openOriginalPositionInEditor} from '../helpers/open-in-editor';
import {EditorSnappingContext} from '../state/editor-snapping';
import {ModalsContext} from '../state/modals';
import {callApi} from './call-api';
import {useConfirmationDialog} from './ConfirmationDialog';
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
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {
	applySelectedOutlineDragAxisLock,
	applySelectedOutlineTransformOriginAxisLock,
	clearSelectedOutlineDragOverrides,
	clearSelectedOutlineRotationDragOverrides,
	clearSelectedOutlineScaleDragOverrides,
	compensateTranslateForTransformOrigin,
	getSelectedOutlineDragChanges,
	getSelectedOutlineDragStates,
	getSelectedOutlineDragValues,
	getSelectedOutlineRotationDragChanges,
	getSelectedOutlineRotationDragStates,
	getSelectedOutlineRotationDragValues,
	getSelectedOutlineScaleDragChanges,
	getSelectedOutlineScaleDragStates,
	getSelectedOutlineScaleDragValues,
	getSelectedOutlineScaleEdgeInfo,
	getSelectedOutlineTransformOriginLockedAxis,
	isSelectedOutlineDragPastThreshold,
	parseCssRotationToRadians,
	snapSelectedOutlineRotationDeltaDegrees,
	snapSelectedOutlineTransformOriginUv,
	uvsEqual,
	type SelectedOutlineKeyframedDragChange,
	type SelectedOutlineScaleEdge,
	type SelectedOutlineStaticDragChange,
} from './selected-outline-drag';
import type {OutlinePoint, SelectedOutline} from './selected-outline-geometry';
import {
	dot,
	getAngleDegrees,
	getOutlineDoubleClickAction,
	getOutlineSelectionInteraction,
	getRotationCursor,
	getSelectedOutlineRotationCornerInfo,
	getSelectedOutlineRotationDeltaDegrees,
	getSelectedOutlineRotationPivot,
	pointToString,
	type SelectedOutlineRotationCorner,
} from './selected-outline-measurement';
import {
	findSelectedOutlineSnap,
	type SelectedOutlineSnapPoint,
	type SelectedOutlineSnapTarget,
} from './selected-outline-snap';
import {
	rotateFieldKey,
	scaleFieldKey,
	transformOriginFieldKey,
	translateFieldKey,
	type SelectedOutlineContextMenuOpenHandler,
	type SelectedOutlineDragTarget,
	type SelectedOutlineRotationDragTarget,
	type SelectedOutlineScaleDragTarget,
	type SelectedOutlineTarget,
} from './selected-outline-types';
import {
	getUvCoordinateForPoint,
	getUvHandlePosition,
} from './selected-outline-uv';
import {
	callAddKeyframes,
	callAddSequenceKeyframe,
	type AddSequenceKeyframeChange,
} from './Timeline/call-add-keyframe';
import {disableSequenceInteractivity} from './Timeline/disable-sequence-interactivity';
import {duplicateSequencesFromSource} from './Timeline/duplicate-selected-timeline-item';
import {commitPendingInspectorFields} from './Timeline/focus-inspector-field';
import {getSequenceContextMenuItems} from './Timeline/get-sequence-context-menu-items';
import {saveSequenceProps} from './Timeline/save-sequence-prop';
import {getTimelineAssetLinkInfo} from './Timeline/timeline-asset-link';
import {
	parseTranslate,
	serializeTranslate,
} from './Timeline/timeline-translate-utils';
import type {
	TimelineSelection,
	TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';
import {getOriginalLocationFromStack} from './Timeline/TimelineStack/get-stack';
import {
	parseTransformOrigin,
	parsedTransformOriginToUv,
	serializeTransformOrigin,
} from './Timeline/transform-origin-utils';
import {useSelectAsset} from './use-select-asset';

const emptyContextMenuValues: readonly ComboboxValue[] = [];

export const SelectedOutlineTransformOriginHandle: React.FC<{
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly target: SelectedOutlineTarget | undefined;
}> = ({outline, onDraggingChange, target}) => {
	const {setDragOverrides, clearDragOverrides, setPropStatuses} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {editorSnapping} = useContext(EditorSnappingContext);
	const transformOriginDrag = target?.transformOriginDrag ?? null;

	const parsed = useMemo(
		() =>
			transformOriginDrag === null
				? null
				: parseTransformOrigin(transformOriginDrag.originValue),
		[transformOriginDrag],
	);
	const uv = useMemo(() => {
		if (parsed === null || outline.dimensions === null) {
			return null;
		}

		return parsedTransformOriginToUv({
			parsed,
			width: outline.dimensions.width,
			height: outline.dimensions.height,
		});
	}, [outline.dimensions, parsed]);
	const position = useMemo(
		() => (uv === null ? null : getUvHandlePosition(outline.points, uv)),
		[outline.points, uv],
	);

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGGElement>) => {
			if (
				event.button !== 0 ||
				transformOriginDrag === null ||
				parsed === null ||
				uv === null ||
				outline.dimensions === null
			) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			const svg = event.currentTarget.ownerSVGElement;
			if (svg === null) {
				return;
			}

			const rotation = parseCssRotationToRadians(
				transformOriginDrag.rotateValue,
			);
			if (rotation === null) {
				return;
			}

			const {dimensions} = outline;
			if (dimensions === null) {
				return;
			}

			const [scaleX, scaleY] = NoReactInternals.parseScaleValue(
				transformOriginDrag.scaleValue,
			);
			const startTranslate = parseTranslate(transformOriginDrag.translateValue);
			const svgRect = svg.getBoundingClientRect();
			const defaultOrigin =
				transformOriginDrag.originDefault !== undefined
					? JSON.stringify(transformOriginDrag.originDefault)
					: null;
			const defaultTranslate =
				transformOriginDrag.translateDefault !== undefined
					? JSON.stringify(transformOriginDrag.translateDefault)
					: null;

			let last: {
				readonly uv: readonly [number, number];
				readonly origin: string;
				readonly translate: string;
			} | null = null;
			let currentPointerX = event.clientX;
			let currentPointerY = event.clientY;
			let axisLocked = event.shiftKey;

			onDraggingChange(true);
			forceSpecificCursor('crosshair');

			const updateFromPointerPosition = () => {
				const point = {
					x: currentPointerX - svgRect.left,
					y: currentPointerY - svgRect.top,
				};
				const rawUv = getUvCoordinateForPoint(outline.points, point);
				const lockedAxis = getSelectedOutlineTransformOriginLockedAxis({
					axisLocked,
					dimensions,
					startUv: uv,
					uv: rawUv,
				});
				const axisLockedUv = applySelectedOutlineTransformOriginAxisLock({
					lockedAxis,
					startUv: uv,
					uv: rawUv,
				});
				const snapPoint =
					lockedAxis === null
						? point
						: getUvHandlePosition(outline.points, axisLockedUv);
				const snappedUv = editorSnapping
					? snapSelectedOutlineTransformOriginUv({
							point: snapPoint,
							points: outline.points,
							uv: axisLockedUv,
						})
					: axisLockedUv;
				const nextUv = applySelectedOutlineTransformOriginAxisLock({
					lockedAxis,
					startUv: uv,
					uv: snappedUv,
				});
				const deltaOrigin = [
					(nextUv[0] - uv[0]) * dimensions.width,
					(nextUv[1] - uv[1]) * dimensions.height,
				] as const;
				const [nextTranslateX, nextTranslateY] =
					compensateTranslateForTransformOrigin({
						startTranslate,
						deltaOrigin,
						rotate: rotation,
						scale: [scaleX, scaleY],
					});
				const origin = serializeTransformOrigin({
					uv: nextUv,
					z: parsed.z,
				});
				const translate = serializeTranslate(nextTranslateX, nextTranslateY);
				last = {uv: nextUv, origin, translate};

				setDragOverrides(
					transformOriginDrag.nodePath,
					transformOriginFieldKey,
					transformOriginDrag.originPropStatus.status === 'keyframed'
						? Internals.makeKeyframedDragOverride({
								status: transformOriginDrag.originPropStatus,
								frame: transformOriginDrag.sourceFrame,
								value: origin,
							})
						: Internals.makeStaticDragOverride(origin),
				);
				setDragOverrides(
					transformOriginDrag.nodePath,
					translateFieldKey,
					transformOriginDrag.translatePropStatus.status === 'keyframed'
						? Internals.makeKeyframedDragOverride({
								status: transformOriginDrag.translatePropStatus,
								frame: transformOriginDrag.sourceFrame,
								value: translate,
							})
						: Internals.makeStaticDragOverride(translate),
				);
			};

			updateFromPointerPosition();

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();
				currentPointerX = moveEvent.clientX;
				currentPointerY = moveEvent.clientY;
				axisLocked = moveEvent.shiftKey;
				updateFromPointerPosition();
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
				updateFromPointerPosition();
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
				window.removeEventListener('keydown', onKeyChange);
				window.removeEventListener('keyup', onKeyChange);
				stopForcingSpecificCursor();
				onDraggingChange(false);

				if (last === null || uvsEqual(last.uv, uv)) {
					clearDragOverrides(transformOriginDrag.nodePath);
					return;
				}

				const originChanged = last.origin !== transformOriginDrag.originValue;
				const translateChanged =
					last.translate !== transformOriginDrag.translateValue;
				if (!originChanged && !translateChanged) {
					clearDragOverrides(transformOriginDrag.nodePath);
					return;
				}

				const shouldSaveAsKeyframes =
					transformOriginDrag.originPropStatus.status === 'keyframed' ||
					transformOriginDrag.translatePropStatus.status === 'keyframed';

				const promise = shouldSaveAsKeyframes
					? callAddKeyframes({
							sequenceKeyframes: [
								originChanged
									? {
											fileName: transformOriginDrag.nodePath.absolutePath,
											nodePath: transformOriginDrag.nodePath,
											fieldKey: transformOriginFieldKey,
											sourceFrame: transformOriginDrag.sourceFrame,
											value: last.origin,
											schema: transformOriginDrag.schema,
										}
									: null,
								translateChanged
									? {
											fileName: transformOriginDrag.nodePath.absolutePath,
											nodePath: transformOriginDrag.nodePath,
											fieldKey: translateFieldKey,
											sourceFrame: transformOriginDrag.sourceFrame,
											value: last.translate,
											schema: transformOriginDrag.schema,
										}
									: null,
							].filter(
								NoReactInternals.truthy,
							) satisfies AddSequenceKeyframeChange[],
							effectKeyframes: [],
							setPropStatuses,
							clientId: transformOriginDrag.clientId,
						})
					: saveSequenceProps({
							changes: [
								originChanged
									? {
											fileName: transformOriginDrag.nodePath.absolutePath,
											nodePath: transformOriginDrag.nodePath,
											fieldKey: transformOriginFieldKey,
											value: last.origin,
											defaultValue: defaultOrigin,
											schema: transformOriginDrag.schema,
										}
									: null,
								translateChanged
									? {
											fileName: transformOriginDrag.nodePath.absolutePath,
											nodePath: transformOriginDrag.nodePath,
											fieldKey: translateFieldKey,
											value: last.translate,
											defaultValue: defaultTranslate,
											schema: transformOriginDrag.schema,
										}
									: null,
							].filter(NoReactInternals.truthy),
							setPropStatuses,
							clientId: transformOriginDrag.clientId,
							undoLabel: 'Move transform origin',
							redoLabel: 'Move transform origin back',
						});

				promise
					.catch((err) => {
						showNotification(
							`Could not save transform origin: ${
								err instanceof Error ? err.message : String(err)
							}`,
							4000,
						);
					})
					.finally(() => {
						clearDragOverrides(transformOriginDrag.nodePath);
					});
			};

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerUp);
			window.addEventListener('keydown', onKeyChange);
			window.addEventListener('keyup', onKeyChange);
		},
		[
			clearDragOverrides,
			editorSnapping,
			onDraggingChange,
			outline,
			parsed,
			setDragOverrides,
			setPropStatuses,
			transformOriginDrag,
			uv,
		],
	);

	if (
		transformOriginDrag === null ||
		parsed === null ||
		uv === null ||
		position === null
	) {
		return null;
	}

	return (
		<g
			pointerEvents="all"
			cursor="crosshair"
			onPointerDown={onPointerDown}
			aria-hidden="true"
			style={{
				filter: SELECTED_OUTLINE_DROP_SHADOW,
			}}
		>
			<circle
				cx={position.x}
				cy={position.y}
				r={4}
				stroke={BLUE}
				fill="none"
				strokeWidth={2}
				vectorEffect="non-scaling-stroke"
			/>
			<line
				x1={position.x - 8}
				y1={position.y}
				x2={position.x + 8}
				y2={position.y}
				stroke={BLUE}
				strokeWidth={2}
				vectorEffect="non-scaling-stroke"
			/>
			<line
				x1={position.x}
				y1={position.y - 8}
				x2={position.x}
				y2={position.y + 8}
				stroke={BLUE}
				strokeWidth={2}
				vectorEffect="non-scaling-stroke"
			/>
		</g>
	);
};

const SelectedOutlinePolygon: React.FC<{
	readonly allDragTargets: readonly SelectedOutlineDragTarget[];
	readonly allDragOutlines: readonly SelectedOutline[];
	readonly contextMenuValues: readonly ComboboxValue[];
	readonly dragging: boolean;
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
	readonly snapTargets: readonly SelectedOutlineSnapTarget[];
	readonly target: SelectedOutlineTarget | undefined;
}> = ({
	allDragTargets,
	allDragOutlines,
	contextMenuValues,
	dragging,
	hovered,
	onContextMenuOpen,
	outline,
	onDraggingChange,
	onHoverChange,
	onSnapPointsChange,
	onSelect,
	onDoubleClickTarget,
	scale,
	snapTargets,
	target,
}) => {
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {editorSnapping} = useContext(EditorSnappingContext);
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const timelinePositionRef = useRef(timelinePosition);
	timelinePositionRef.current = timelinePosition;
	const polygonRef = useRef<SVGPolygonElement>(null);
	const points = useMemo(
		() => outline.points.map(pointToString).join(' '),
		[outline.points],
	);
	const drag = target?.drag ?? null;
	const selected = target?.selected ?? false;
	const containsSelection = target?.containsSelection ?? false;
	const effectDrop = target?.effectDrop ?? null;
	const [effectDropHovered, setEffectDropHovered] = useState(false);
	const visible = containsSelection || hovered;

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<SVGPolygonElement>) => {
			if (event.button !== 0 || target === undefined) {
				return;
			}

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
				dragTargets: selected ? allDragTargets : [drag],
				getDragOverrides,
				timelinePosition: timelinePositionRef.current,
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
						outlines: selected ? allDragOutlines : [outline],
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
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
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
					...keyframedChanges.map((change) =>
						callAddSequenceKeyframe({
							fileName: change.fileName,
							nodePath: change.nodePath,
							fieldKey: change.fieldKey,
							sourceFrame: change.sourceFrame,
							value: change.value,
							schema: change.schema,
							setPropStatuses,
							clientId: change.clientId,
						}),
					),
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

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerUp);
			window.addEventListener('keydown', onKeyChange);
			window.addEventListener('keyup', onKeyChange);
		},
		[
			allDragTargets,
			allDragOutlines,
			clearDragOverrides,
			drag,
			editorSnapping,
			getDragOverrides,
			onDraggingChange,
			onSelect,
			onSnapPointsChange,
			outline,
			scale,
			selected,
			setPropStatuses,
			setDragOverrides,
			snapTargets,
			target,
		],
	);

	const onDoubleClick = React.useCallback(
		(event: React.MouseEvent<SVGPolygonElement>) => {
			if (target === undefined) {
				return;
			}

			if (!onDoubleClickTarget(target, event.button)) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
		},
		[onDoubleClickTarget, target],
	);

	const onEffectDragOver = React.useCallback(
		(event: React.DragEvent<SVGPolygonElement>) => {
			if (effectDrop === null || !hasEffectDragType(event.dataTransfer)) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = 'copy';
			setEffectDropHovered(true);
		},
		[effectDrop],
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
		[effectDrop],
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
				pointerEvents={target === undefined ? undefined : 'all'}
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
				onDragOver={effectDrop === null ? undefined : onEffectDragOver}
				onDragLeave={effectDrop === null ? undefined : onEffectDragLeave}
				onDrop={effectDrop === null ? undefined : onEffectDrop}
			/>
			<ContextMenuForTarget
				triggerRef={polygonRef}
				values={[...contextMenuValues]}
				onOpen={onContextMenuOpen}
			/>
		</>
	);
};

const SelectedOutlineScaleEdgeLine: React.FC<{
	readonly allScaleDragTargets: readonly SelectedOutlineScaleDragTarget[];
	readonly contextMenuValues: readonly ComboboxValue[];
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
	contextMenuValues,
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
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const timelinePositionRef = useRef(timelinePosition);
	timelinePositionRef.current = timelinePosition;
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
				timelinePosition: timelinePositionRef.current,
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
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
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
					...keyframedChanges.map((change) =>
						callAddSequenceKeyframe({
							fileName: change.fileName,
							nodePath: change.nodePath,
							fieldKey: change.fieldKey,
							sourceFrame: change.sourceFrame,
							value: change.value,
							schema: change.schema,
							setPropStatuses,
							clientId: change.clientId,
						}),
					),
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

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerUp);
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
			<ContextMenuForTarget
				triggerRef={lineRef}
				values={[...contextMenuValues]}
				onOpen={onContextMenuOpen}
			/>
		</>
	);
};

const svgPointToClientPoint = (
	point: OutlinePoint,
	rect: DOMRect,
): OutlinePoint => {
	return {
		x: point.x + rect.left,
		y: point.y + rect.top,
	};
};

const SelectedOutlineRotationCornerHandle: React.FC<{
	readonly allRotationDragTargets: readonly SelectedOutlineRotationDragTarget[];
	readonly contextMenuValues: readonly ComboboxValue[];
	readonly corner: SelectedOutlineRotationCorner;
	readonly dragging: boolean;
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
	allRotationDragTargets,
	contextMenuValues,
	corner,
	dragging,
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
	const {editorSnapping} = useContext(EditorSnappingContext);
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const timelinePositionRef = useRef(timelinePosition);
	timelinePositionRef.current = timelinePosition;
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
					points: outline.points,
					transformOriginValue: rotationDrag.transformOriginValue,
				}),
				svgRect,
			);
			const dragStates = getSelectedOutlineRotationDragStates({
				dragTargets: selected ? allRotationDragTargets : [rotationDrag],
				getDragOverrides,
				timelinePosition: timelinePositionRef.current,
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
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
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
					...keyframedChanges.map((change) =>
						callAddSequenceKeyframe({
							fileName: change.fileName,
							nodePath: change.nodePath,
							fieldKey: change.fieldKey,
							sourceFrame: change.sourceFrame,
							value: change.value,
							schema: change.schema,
							setPropStatuses,
							clientId: change.clientId,
						}),
					),
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

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
			window.addEventListener('pointercancel', onPointerUp);
			window.addEventListener('keydown', onKeyChange);
			window.addEventListener('keyup', onKeyChange);
		},
		[
			allRotationDragTargets,
			clearDragOverrides,
			cornerInfo,
			editorSnapping,
			getDragOverrides,
			onDraggingChange,
			outline.dimensions,
			outline.points,
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
				values={[...contextMenuValues]}
				onOpen={onContextMenuOpen}
			/>
		</>
	);
};

export const SelectedOutlineElement: React.FC<{
	readonly allDragTargets: readonly SelectedOutlineDragTarget[];
	readonly allDragOutlines: readonly SelectedOutline[];
	readonly allRotationDragTargets: readonly SelectedOutlineRotationDragTarget[];
	readonly allScaleDragTargets: readonly SelectedOutlineScaleDragTarget[];
	readonly dragging: boolean;
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
	readonly scale: number;
	readonly snapTargets: readonly SelectedOutlineSnapTarget[];
	readonly target: SelectedOutlineTarget | undefined;
}> = ({
	allDragTargets,
	allDragOutlines,
	allRotationDragTargets,
	allScaleDragTargets,
	dragging,
	hovered,
	outline,
	onDraggingChange,
	onHoverChange,
	onSnapPointsChange,
	onSelect,
	scale,
	snapTargets,
	target,
}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const updateResolvedStackTrace = useContext(
		Internals.SequenceStackTracesUpdateContext,
	);
	const confirm = useConfirmationDialog();
	const selectAsset = useSelectAsset();
	const {setSelectedModal} = useContext(ModalsContext);

	const resolveOriginalLocation = React.useCallback(
		async (resolveTarget: SelectedOutlineTarget) => {
			const stack = resolveTarget.sequence.getStack();
			if (!stack) {
				return null;
			}

			let originalLocation: ResolvedStackLocation | null = null;
			try {
				originalLocation = await getOriginalLocationFromStack(
					stack,
					'sequence',
				);
			} catch (err) {
				showNotification((err as Error).message, 2000);
			}

			updateResolvedStackTrace(stack, originalLocation);
			return originalLocation;
		},
		[updateResolvedStackTrace],
	);

	const onDoubleClickTarget = React.useCallback(
		(doubleClickTarget: SelectedOutlineTarget, button: number) => {
			const action = getOutlineDoubleClickAction({
				button,
				canOpenInEditor:
					previewServerState.type === 'connected' &&
					Boolean(window.remotion_editorName),
			});

			if (action === null) {
				return false;
			}

			const openTargetInEditor = async () => {
				const originalLocation =
					await resolveOriginalLocation(doubleClickTarget);
				if (originalLocation === null) {
					return;
				}

				await openOriginalPositionInEditor(originalLocation);
			};

			openTargetInEditor().catch((err) => {
				showNotification((err as Error).message, 2000);
			});

			return true;
		},
		[previewServerState.type, resolveOriginalLocation],
	);

	const onContextMenuOpen = React.useCallback(async () => {
		if (target === undefined || previewServerState.type !== 'connected') {
			return false;
		}

		if (!target.selected) {
			onSelect(target.selection, {shiftKey: false, toggleKey: false});
		}

		const originalLocation = await resolveOriginalLocation(target);

		const fileLocation = formatFileLocation({
			location: originalLocation,
			root: window.remotion_cwd,
		});
		const nodePath = target.nodePathInfo.sequenceSubscriptionKey;
		const mediaSrc =
			target.sequence.type === 'audio' ||
			target.sequence.type === 'video' ||
			target.sequence.type === 'image'
				? target.sequence.src
				: null;
		const assetLinkInfo = mediaSrc ? getTimelineAssetLinkInfo(mediaSrc) : null;
		const canOpenInEditor = Boolean(
			window.remotion_editorName && originalLocation,
		);
		const disableInteractivityDisabled = !target.sequence.showInTimeline;
		const sourceEditDisabled =
			!target.sequence.controls || !nodePath.absolutePath;
		const canAddEffect =
			target.nodePathInfo.supportsEffects &&
			!sourceEditDisabled &&
			previewServerState.type === 'connected';

		return getSequenceContextMenuItems({
			assetLinkInfo,
			canOpenInEditor,
			deleteDisabled: sourceEditDisabled,
			disableInteractivityDisabled,
			duplicateDisabled: sourceEditDisabled,
			fileLocation,
			includeSourceEditItems: true,
			onDeleteSequenceFromSource: async () => {
				if (sourceEditDisabled || previewServerState.type !== 'connected') {
					return;
				}

				if (target.nodePathInfo.numberOfSequencesWithThisNodePath > 1) {
					const shouldDelete = await confirm({
						title: 'Delete sequence?',
						message:
							'This sequence is programmatically duplicated ' +
							target.nodePathInfo.numberOfSequencesWithThisNodePath +
							' times in the code. Deleting removes all instances. Continue?',
						confirmLabel: 'Delete',
					});
					if (!shouldDelete) {
						return;
					}
				}

				try {
					const result = await callApi('/api/delete-jsx-node', {
						nodes: [
							{
								fileName: nodePath.absolutePath,
								nodePath: nodePath.nodePath,
							},
						],
					});
					if (result.success) {
						showNotification('Removed sequence from source file', 2000);
					} else {
						showNotification(result.reason, 4000);
					}
				} catch (err) {
					showNotification((err as Error).message, 4000);
				}
			},
			onDisableSequenceInteractivity: () => {
				if (
					disableInteractivityDisabled ||
					previewServerState.type !== 'connected'
				) {
					return;
				}

				disableSequenceInteractivity({
					fileName: nodePath.absolutePath,
					nodePath,
					setPropStatuses,
					clientId: previewServerState.clientId,
				});
			},
			onDuplicateSequenceFromSource: () => {
				if (sourceEditDisabled) {
					return;
				}

				duplicateSequencesFromSource([target.nodePathInfo], confirm).catch(
					() => undefined,
				);
			},
			openInEditor: () => {
				if (!originalLocation) {
					return;
				}

				openOriginalPositionInEditor(originalLocation).catch((err) => {
					showNotification((err as Error).message, 2000);
				});
			},
			originalLocation,
			selectAsset,
			sequence: target.sequence,
			sourceActions: [
				...(target.nodePathInfo.supportsEffects
					? [
							{
								type: 'item' as const,
								id: 'add-effect',
								keyHint: null,
								label: 'Add effect...',
								leftItem: null,
								disabled: !canAddEffect,
								onClick: () => {
									if (
										!canAddEffect ||
										previewServerState.type !== 'connected'
									) {
										return;
									}

									setSelectedModal({
										type: 'add-effect',
										clientId: previewServerState.clientId,
										fileName: nodePath.absolutePath,
										nodePath,
									});
								},
								quickSwitcherLabel: null,
								subMenu: null,
								value: 'add-effect',
							},
							{
								type: 'divider' as const,
								id: 'add-effect-divider',
							},
						]
					: []),
			],
		});
	}, [
		confirm,
		onSelect,
		previewServerState,
		resolveOriginalLocation,
		selectAsset,
		setSelectedModal,
		setPropStatuses,
		target,
	]);

	return (
		<>
			<SelectedOutlinePolygon
				allDragTargets={allDragTargets}
				allDragOutlines={allDragOutlines}
				contextMenuValues={emptyContextMenuValues}
				dragging={dragging}
				hovered={hovered}
				outline={outline}
				onContextMenuOpen={onContextMenuOpen}
				onDraggingChange={onDraggingChange}
				onHoverChange={onHoverChange}
				onSnapPointsChange={onSnapPointsChange}
				onSelect={onSelect}
				onDoubleClickTarget={onDoubleClickTarget}
				scale={scale}
				snapTargets={snapTargets}
				target={target}
			/>
			{target?.containsSelection || hovered
				? (['top', 'right', 'bottom', 'left'] as const).map((edge) => (
						<SelectedOutlineScaleEdgeLine
							key={edge}
							allScaleDragTargets={allScaleDragTargets}
							contextMenuValues={emptyContextMenuValues}
							dragging={dragging}
							edge={edge}
							outline={outline}
							onContextMenuOpen={onContextMenuOpen}
							onDraggingChange={onDraggingChange}
							onHoverChange={onHoverChange}
							onSelect={onSelect}
							target={target}
						/>
					))
				: null}
			{target?.containsSelection || hovered
				? (
						['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const
					).map((corner) => (
						<SelectedOutlineRotationCornerHandle
							key={corner}
							allRotationDragTargets={allRotationDragTargets}
							contextMenuValues={emptyContextMenuValues}
							corner={corner}
							dragging={dragging}
							outline={outline}
							onContextMenuOpen={onContextMenuOpen}
							onDraggingChange={onDraggingChange}
							onHoverChange={onHoverChange}
							onSelect={onSelect}
							target={target}
						/>
					))
				: null}
		</>
	);
};
