import React, {useContext, useMemo, useRef, useState} from 'react';
import type {ResolvedStackLocation} from 'remotion';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {BLUE} from '../helpers/colors';
import {formatFileLocation} from '../helpers/format-file-location';
import {openOriginalPositionInEditor} from '../helpers/open-in-editor';
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
	isSelectedOutlineDragPastThreshold,
	parseCssRotationToRadians,
	uvsEqual,
	type SelectedOutlineKeyframedDragChange,
	type SelectedOutlineScaleEdge,
	type SelectedOutlineStaticDragChange,
} from './selected-outline-drag';
import type {OutlinePoint, SelectedOutline} from './selected-outline-geometry';
import {
	dot,
	getAngleDegrees,
	getOutlineSelectionInteraction,
	getRotationCursor,
	getSelectedOutlineRotationCornerInfo,
	getSelectedOutlineRotationDeltaDegrees,
	getSelectedOutlineRotationPivot,
	pointToString,
	type SelectedOutlineRotationCorner,
} from './selected-outline-measurement';
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
import {saveSequenceProps} from './Timeline/save-sequence-prop';
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

const emptyContextMenuValues: readonly ComboboxValue[] = [];

const SelectedOutlineTransformOriginHandle: React.FC<{
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly target: SelectedOutlineTarget | undefined;
}> = ({outline, onDraggingChange, target}) => {
	const {setDragOverrides, clearDragOverrides, setPropStatuses} = useContext(
		Internals.VisualModeSettersContext,
	);
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

			onDraggingChange(true);
			forceSpecificCursor('crosshair');

			const updateFromPointerEvent = (
				pointerEvent: PointerEvent | React.PointerEvent<SVGGElement>,
			) => {
				const point = {
					x: pointerEvent.clientX - svgRect.left,
					y: pointerEvent.clientY - svgRect.top,
				};
				const nextUv = getUvCoordinateForPoint(outline.points, point);
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

			updateFromPointerEvent(event);

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();
				updateFromPointerEvent(moveEvent);
			};

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
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
		},
		[
			clearDragOverrides,
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
	readonly contextMenuValues: readonly ComboboxValue[];
	readonly dragging: boolean;
	readonly hovered: boolean;
	readonly onContextMenuOpen: SelectedOutlineContextMenuOpenHandler;
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onHoverChange: (key: string | null) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction: TimelineSelectionInteraction,
	) => void;
	readonly scale: number;
	readonly target: SelectedOutlineTarget | undefined;
}> = ({
	allDragTargets,
	contextMenuValues,
	dragging,
	hovered,
	onContextMenuOpen,
	outline,
	onDraggingChange,
	onHoverChange,
	onSelect,
	scale,
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
				}

				const dragDelta = applySelectedOutlineDragAxisLock({
					deltaX: screenDeltaX / scale,
					deltaY: screenDeltaY / scale,
					axisLocked,
				});

				lastValues = getSelectedOutlineDragValues({
					dragStates,
					deltaX: dragDelta.deltaX,
					deltaY: dragDelta.deltaY,
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
			clearDragOverrides,
			drag,
			getDragOverrides,
			onDraggingChange,
			onSelect,
			scale,
			selected,
			setPropStatuses,
			setDragOverrides,
			target,
		],
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
				fill={effectDropHovered ? 'rgba(0, 155, 255, 0.12)' : 'transparent'}
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

			onDraggingChange(true);
			forceSpecificCursor(edgeInfo.cursor);

			const startPointer = {x: event.clientX, y: event.clientY};
			const dragStates = getSelectedOutlineScaleDragStates({
				dragTargets: selected ? allScaleDragTargets : [scaleDrag],
				getDragOverrides,
				timelinePosition: timelinePositionRef.current,
			});
			let lastValues = new Map<string, number | string>();

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();

				const delta = {
					x: moveEvent.clientX - startPointer.x,
					y: moveEvent.clientY - startPointer.y,
				};
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
				stopForcingSpecificCursor();
				onDraggingChange(false);

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
				stroke="transparent"
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
			const shouldUpdateSelection =
				!selected || interaction.shiftKey || interaction.toggleKey;
			if (shouldUpdateSelection && target !== undefined) {
				onSelect(target.selection, interaction);
			}

			if (interaction.shiftKey || interaction.toggleKey) {
				return;
			}

			onDraggingChange(true);
			forceSpecificCursor(cornerInfo.cursor);

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
			let lastValues = new Map<string, string>();

			const onPointerMove = (moveEvent: PointerEvent) => {
				moveEvent.preventDefault();

				const nextAngle = getAngleDegrees(center, {
					x: moveEvent.clientX,
					y: moveEvent.clientY,
				});
				accumulatedDelta += getSelectedOutlineRotationDeltaDegrees({
					from: previousAngle,
					to: nextAngle,
				});
				previousAngle = nextAngle;
				lastValues = getSelectedOutlineRotationDragValues({
					dragStates,
					rotationDeltaDegrees: accumulatedDelta,
				});
				forceSpecificCursor(
					getRotationCursor(cornerInfo.cursorDegrees + accumulatedDelta),
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

			const onPointerUp = () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				window.removeEventListener('pointercancel', onPointerUp);
				stopForcingSpecificCursor();
				onDraggingChange(false);

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
		},
		[
			allRotationDragTargets,
			clearDragOverrides,
			cornerInfo,
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
				fill="transparent"
				stroke="transparent"
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
	readonly allRotationDragTargets: readonly SelectedOutlineRotationDragTarget[];
	readonly allScaleDragTargets: readonly SelectedOutlineScaleDragTarget[];
	readonly dragging: boolean;
	readonly hovered: boolean;
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onHoverChange: (key: string | null) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction: TimelineSelectionInteraction,
	) => void;
	readonly scale: number;
	readonly target: SelectedOutlineTarget | undefined;
}> = ({
	allDragTargets,
	allRotationDragTargets,
	allScaleDragTargets,
	dragging,
	hovered,
	outline,
	onDraggingChange,
	onHoverChange,
	onSelect,
	scale,
	target,
}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const updateResolvedStackTrace = useContext(
		Internals.SequenceStackTracesUpdateContext,
	);

	const onContextMenuOpen = React.useCallback(async () => {
		if (target === undefined || previewServerState.type !== 'connected') {
			return false;
		}

		if (!target.selected) {
			onSelect(target.selection, {shiftKey: false, toggleKey: false});
		}

		const stack = target.sequence.getStack();
		let originalLocation: ResolvedStackLocation | null = null;
		if (stack) {
			try {
				originalLocation = await getOriginalLocationFromStack(
					stack,
					'sequence',
				);
			} catch (err) {
				showNotification((err as Error).message, 2000);
			}
		}

		if (stack) {
			updateResolvedStackTrace(stack, originalLocation);
		}

		const fileLocation = formatFileLocation({
			location: originalLocation,
			root: window.remotion_cwd,
		});
		const editorName = window.remotion_editorName;
		const disableInteractivityDisabled = !target.sequence.showInTimeline;

		return [
			editorName
				? {
						type: 'item' as const,
						id: 'show-outline-in-editor',
						keyHint: null,
						label: `Show in ${editorName}`,
						leftItem: null,
						disabled: !originalLocation,
						onClick: () => {
							if (!originalLocation) {
								return;
							}

							openOriginalPositionInEditor(originalLocation).catch((err) => {
								showNotification((err as Error).message, 2000);
							});
						},
						quickSwitcherLabel: null,
						subMenu: null,
						value: 'show-outline-in-editor',
					}
				: null,
			{
				type: 'item' as const,
				id: 'copy-outline-file-location',
				keyHint: null,
				label: 'Copy file location',
				leftItem: null,
				disabled: !fileLocation,
				onClick: () => {
					if (!fileLocation) {
						return;
					}

					navigator.clipboard
						.writeText(fileLocation)
						.then(() => {
							showNotification('Copied file location to clipboard', 1000);
						})
						.catch((err) => {
							showNotification(
								`Could not copy to clipboard: ${(err as Error).message}`,
								1000,
							);
						});
				},
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'copy-outline-file-location',
			},
			{
				type: 'item' as const,
				id: 'disable-outline-interactivity',
				keyHint: null,
				label: 'Disable interactivity',
				leftItem: null,
				disabled: disableInteractivityDisabled,
				onClick: () => {
					if (
						disableInteractivityDisabled ||
						previewServerState.type !== 'connected'
					) {
						return;
					}

					const nodePath = target.nodePathInfo.sequenceSubscriptionKey;
					disableSequenceInteractivity({
						fileName: nodePath.absolutePath,
						nodePath,
						setPropStatuses,
						clientId: previewServerState.clientId,
					});
				},
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'disable-outline-interactivity',
			},
		].filter(NoReactInternals.truthy);
	}, [
		onSelect,
		previewServerState,
		setPropStatuses,
		target,
		updateResolvedStackTrace,
	]);

	return (
		<>
			<SelectedOutlinePolygon
				allDragTargets={allDragTargets}
				contextMenuValues={emptyContextMenuValues}
				dragging={dragging}
				hovered={hovered}
				outline={outline}
				onContextMenuOpen={onContextMenuOpen}
				onDraggingChange={onDraggingChange}
				onHoverChange={onHoverChange}
				onSelect={onSelect}
				scale={scale}
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
			<SelectedOutlineTransformOriginHandle
				outline={outline}
				onDraggingChange={onDraggingChange}
				target={target}
			/>
		</>
	);
};
