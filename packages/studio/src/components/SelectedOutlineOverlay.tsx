import {PlayerInternals} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	Internals,
	type GetDragOverrides,
	type InteractivitySchema,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {
	isStudioInteractivityEnabled,
	isStudioSelectionEnabled,
} from '../helpers/interactivity-enabled';
import {timelineSequenceNodePathToKey} from '../helpers/timeline-node-path-key';
import {useIsFullscreen} from '../helpers/use-is-fullscreen';
import {useKeybinding} from '../helpers/use-keybinding';
import {useRuntimeValueSnapshots} from '../helpers/use-runtime-values';
import {EditorShowGuidesContext} from '../state/editor-guides';
import {EditorShowOutlinesContext} from '../state/editor-outlines';
import {ScaleLockContext} from '../state/scale-lock';
import {
	useSetTimelineSequenceHover,
	useTimelineSequenceHoverState,
} from '../state/timeline-sequence-hover';
import {showNotification} from './Notifications/NotificationCenter';
import {
	clearSelectedOutlineDragOverrides,
	getSelectedOutlineActiveSchema,
	getSelectedOutlineDragChanges,
	getSelectedOutlineDragStates,
	getSelectedOutlineDragValues,
	getSelectedOutlineKeyboardNudgeDeltas,
	getSelectedOutlineKeyboardNudgeDirection,
	type SelectedOutlineKeyboardNudgeDirection,
	type SelectedOutlineKeyframedDragChange,
	type SelectedOutlineStaticDragChange,
} from './selected-outline-drag';
import {type SelectedOutline} from './selected-outline-geometry';
import {
	getSelectedCropInfo,
	getSelectedEffectFieldsBySequenceKey,
	getSelectedSequenceKeys,
	getSelectedTransformOriginInfo,
	getSequenceKeysContainingSelection,
	getSequencesWithSelectableOutlines,
	measureOutlines,
	outlinesAreEqual,
} from './selected-outline-measurement';
import {orderOutlinesForRendering} from './selected-outline-order';
import {
	getSelectedOutlineSnapTargets,
	type SelectedOutlineSnapPoint,
} from './selected-outline-snap';
import {
	canEditSelectedOutlineCrop,
	cropFieldKeys,
	rotateFieldKey,
	scaleFieldKey,
	transformOriginFieldKey,
	translateFieldKey,
	type SelectedOutlineCropDragTarget,
	type SelectedOutlineCropFieldKey,
	type SelectedOutlineKeyboardNudgeSession,
	type SelectedOutlineTarget,
} from './selected-outline-types';
import {getSelectedUvHandles} from './selected-outline-uv';
import {SelectedOutlineElement} from './SelectedOutlineElement';
import {SelectedOutlineSnapIndicators} from './SelectedOutlineSnapIndicators';
import {SelectedOutlineTransformOriginHandle} from './SelectedOutlineTransformOriginHandle';
import {
	SelectedOutlineUvHandleCircleLayer,
	SelectedOutlineUvHandleConnectionLayer,
} from './SelectedOutlineUvControls';
import {callAddKeyframes} from './Timeline/call-add-keyframe';
import {getCurrentDuration, getCurrentFps} from './Timeline/imperative-state';
import {saveSequenceProps} from './Timeline/save-sequence-prop';
import {ensureFrameIsInViewport} from './Timeline/timeline-scroll-logic';
import {
	useTimelineSelection,
	type TimelineSelection,
	type TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';

export {orderOutlinesForRendering};

export {
	applySelectedOutlineDragAxisLock,
	applySelectedOutlineTransformOriginAxisLock,
	compensateTranslateForTransformOrigin,
	getSelectedOutlineActiveSchema,
	getSelectedOutlineCropDragChanges,
	getSelectedOutlineCropDragValues,
	getSelectedOutlineCropFollowingTransformOrigin,
	getSelectedOutlineDragChanges,
	getSelectedOutlineDragValues,
	getSelectedOutlineKeyboardNudgeDelta,
	getSelectedOutlineKeyboardNudgeDeltas,
	getSelectedOutlineRotationDragChanges,
	getSelectedOutlineRotationDragStates,
	getSelectedOutlineRotationDragValues,
	getSelectedOutlineScaleDragChanges,
	getSelectedOutlineScaleDragStates,
	getSelectedOutlineScaleDragValues,
	getSelectedOutlineScaleEdgeInfo,
	getSelectedOutlineTransformOriginDragChanges,
	getSelectedOutlineTransformOriginLockedAxis,
	isSelectedOutlineDragPastThreshold,
	selectedOutlineTransformOriginSnapThresholdPx,
	selectedOutlineUvSnapThresholdPx,
	snapSelectedOutlineRotationDeltaDegrees,
	snapSelectedOutlineTransformOriginUv,
	snapSelectedOutlineUv,
} from './selected-outline-drag';
export {
	getOutlineSelectionInteraction,
	getSelectedCropInfo,
	getSelectedEffectFieldsBySequenceKey,
	getSelectedOutlineRotationCornerInfo,
	getSelectedOutlineRotationDeltaDegrees,
	getSelectedOutlineRotationPivot,
	getSelectedSequenceKeys,
	getSequencesWithSelectableOutlines,
	getTransformedSvgViewportPoints,
} from './selected-outline-measurement';
export {selectedOutlineDragThresholdPx} from './selected-outline-types';

const getEffectiveCropValue = ({
	activeSchema,
	dragOverrides,
	fieldKey,
	frame,
	propStatuses,
	runtimeValues,
}: {
	readonly activeSchema: InteractivitySchema | null;
	readonly dragOverrides: ReturnType<GetDragOverrides>;
	readonly fieldKey: string;
	readonly frame: number;
	readonly propStatuses: ReturnType<typeof Internals.getPropStatusesCtx>;
	readonly runtimeValues: Readonly<Record<string, unknown>>;
}): number => {
	const fieldSchema = activeSchema?.[fieldKey];
	if (fieldSchema?.type !== 'number') {
		return 0;
	}

	const propStatus = propStatuses?.[fieldKey];
	const value =
		propStatus?.status === 'static' || propStatus?.status === 'keyframed'
			? Internals.getEffectiveVisualModeValue({
					propStatus,
					dragOverrideValue: dragOverrides[fieldKey],
					defaultValue: fieldSchema.default,
					frame,
					shouldResortToDefaultValueIfUndefined: true,
				})
			: (runtimeValues[fieldKey] ?? fieldSchema.default);

	return typeof value === 'number' && Number.isFinite(value) ? value : 0;
};

const getCropDragFields = ({
	activeSchema,
	cropValues,
	propStatuses,
}: {
	readonly activeSchema: InteractivitySchema | null;
	readonly cropValues: Record<SelectedOutlineCropFieldKey, number>;
	readonly propStatuses: ReturnType<typeof Internals.getPropStatusesCtx>;
}): SelectedOutlineCropDragTarget['fields'] | null => {
	if (
		!canEditSelectedOutlineCrop({
			schema: activeSchema,
			propStatuses,
		})
	) {
		return null;
	}

	const fields: Partial<SelectedOutlineCropDragTarget['fields']> = {};

	for (const fieldKey of Object.values(cropFieldKeys)) {
		const fieldSchema = activeSchema?.[fieldKey];
		const propStatus = propStatuses?.[fieldKey];
		const canEditStatus =
			propStatus?.status === 'static' ||
			(propStatus?.status === 'keyframed' &&
				propStatus.interpolationFunction === 'interpolate');

		if (fieldSchema?.type !== 'number' || !canEditStatus) {
			return null;
		}

		fields[fieldKey] = {
			defaultValue: fieldSchema.default,
			fieldSchema,
			propStatus,
			value: cropValues[fieldKey],
		};
	}

	return fields as SelectedOutlineCropDragTarget['fields'];
};

export type {
	SelectedOutlineDragState,
	SelectedOutlineRotationDragState,
	SelectedOutlineScaleDragState,
} from './selected-outline-types';

const outlineContainer: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	pointerEvents: 'none',
	overflow: 'visible',
};

export const SelectedOutlineOverlay: React.FC<{
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly scale: number;
	readonly translationX: number;
	readonly translationY: number;
}> = ({
	compositionHeight,
	compositionWidth,
	scale,
	translationX,
	translationY,
}) => {
	const {selectedItems, selectItem} = useTimelineSelection();
	const {sequences} = useContext(Internals.SequenceManager);
	const {canvasContent, compositions} = useContext(
		Internals.CompositionManager,
	);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {getScaleLockState} = useContext(ScaleLockContext);
	const {editorShowOutlines} = useContext(EditorShowOutlinesContext);
	const hoveredSequence = useTimelineSequenceHoverState();
	const setHoveredSequence = useSetTimelineSequenceHover();
	const {editorShowGuides, guidesList} = useContext(EditorShowGuidesContext);
	const isFullscreen = useIsFullscreen();
	const {frameBack, frameForward, getCurrentFrame, seek} =
		PlayerInternals.usePlayerMethods();
	const keybindings = useKeybinding();
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const [outlines, setOutlines] = useState<readonly SelectedOutline[]>([]);
	const [draggingOutline, setDraggingOutline] = useState(false);
	const [activeSnapPoints, setActiveSnapPoints] = useState<
		readonly SelectedOutlineSnapPoint[]
	>([]);
	const overlayRef = useRef<SVGSVGElement>(null);
	const keyboardNudgeSessionRef =
		useRef<SelectedOutlineKeyboardNudgeSession | null>(null);
	const saveKeyboardNudgeSessionRef = useRef<() => void>(() => undefined);
	const updateOutlinesRef = useRef<() => void>(() => undefined);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const resizeObserverAnimationFrameRef = useRef<number | null>(null);
	const observedOutlineElementsRef = useRef<ReadonlySet<Element>>(new Set());
	const previewInteractive =
		previewServerState.type === 'connected' && isStudioInteractivityEnabled();
	const previewSelectionAvailable =
		previewServerState.type === 'connected' || window.remotion_isReadOnlyStudio;

	const onDraggingChange = React.useCallback(
		(dragging: boolean) => {
			setDraggingOutline(dragging);
			if (dragging) {
				setHoveredSequence((currentHover) =>
					currentHover?.source === 'canvas' ? null : currentHover,
				);
			} else {
				setActiveSnapPoints([]);
			}
		},
		[setHoveredSequence],
	);
	const onSnapPointsChange = useCallback(
		(snapPoints: readonly SelectedOutlineSnapPoint[]) => {
			setActiveSnapPoints(snapPoints);
		},
		[],
	);
	const selectOutlineItem = useCallback(
		(item: TimelineSelection, interaction?: TimelineSelectionInteraction) => {
			selectItem(item, interaction, undefined, {reveal: true});
		},
		[selectItem],
	);
	const selectableOutlines = useMemo(() => {
		if (
			isFullscreen ||
			!isStudioSelectionEnabled() ||
			!previewSelectionAvailable ||
			!editorShowOutlines
		) {
			return [];
		}

		return getSequencesWithSelectableOutlines({
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
			compositions,
			timelinePosition,
		});
	}, [
		compositions,
		editorShowOutlines,
		isFullscreen,
		overrideIdToNodePathMappings,
		previewSelectionAvailable,
		sequences,
		timelinePosition,
	]);
	const outlineRuntimeControls = useMemo(() => {
		const selectedSequenceKeys = getSelectedSequenceKeys(selectedItems);
		const sequenceKeysContainingSelection =
			getSequenceKeysContainingSelection(selectedItems);
		return selectableOutlines.flatMap(({key, nodePathInfo, sequence}) => {
			const nodePathKey = timelineSequenceNodePathToKey(
				nodePathInfo.sequenceSubscriptionKey,
			);
			if (
				!selectedSequenceKeys.has(key) &&
				!sequenceKeysContainingSelection.has(key) &&
				hoveredSequence?.nodePathKey !== nodePathKey
			) {
				return [];
			}

			return sequence.controls ? [sequence.controls] : [];
		});
	}, [hoveredSequence?.nodePathKey, selectedItems, selectableOutlines]);
	const outlineRuntimeSnapshots = useRuntimeValueSnapshots(
		outlineRuntimeControls,
	);
	const outlineRuntimeValuesByStore = useMemo(
		() =>
			new Map(
				outlineRuntimeControls.map((controls, index) => [
					controls.runtimeValues,
					outlineRuntimeSnapshots[index],
				]),
			),
		[outlineRuntimeControls, outlineRuntimeSnapshots],
	);

	const outlineTargets = useMemo((): SelectedOutlineTarget[] => {
		if (
			isFullscreen ||
			!isStudioSelectionEnabled() ||
			!previewSelectionAvailable ||
			!editorShowOutlines
		) {
			return [];
		}

		const selectedSequenceKeys = getSelectedSequenceKeys(selectedItems);
		const sequenceKeysContainingSelection =
			getSequenceKeysContainingSelection(selectedItems);
		const selectedEffectsBySequenceKey =
			getSelectedEffectFieldsBySequenceKey(selectedItems);
		const selectedTransformOriginInfo =
			getSelectedTransformOriginInfo(selectedItems);
		const selectedCropInfo = getSelectedCropInfo(selectedItems);
		const clientId =
			previewServerState.type === 'connected'
				? previewServerState.clientId
				: null;

		const firstNodePathInfoBySourceNode = new Map<
			string,
			SequenceNodePathInfo
		>();
		const selectedSourceNodeKeys = new Set<string>();
		for (const {key, nodePathInfo} of selectableOutlines) {
			const sourceNodeKey = timelineSequenceNodePathToKey(
				nodePathInfo.sequenceSubscriptionKey,
			);
			if (selectedSequenceKeys.has(key)) {
				selectedSourceNodeKeys.add(sourceNodeKey);
			}

			const currentFirst = firstNodePathInfoBySourceNode.get(sourceNodeKey);
			if (
				currentFirst === undefined ||
				nodePathInfo.index < currentFirst.index
			) {
				firstNodePathInfoBySourceNode.set(sourceNodeKey, nodePathInfo);
			}
		}

		return selectableOutlines.map((selectableOutline) => {
			const {key, keyframeDisplayOffset, nodePathInfo, sequence} =
				selectableOutline;
			if (sequence.refForOutline === null) {
				throw new Error('Expected sequence to have a ref for outline');
			}

			const selected = selectedSequenceKeys.has(key);
			const containsSelection = sequenceKeysContainingSelection.has(key);
			const nodePath = nodePathInfo.sequenceSubscriptionKey;
			const sourceNodeKey = timelineSequenceNodePathToKey(nodePath);
			const showSelectedOutline =
				containsSelection || selectedSourceNodeKeys.has(sourceNodeKey);
			const selectionNodePathInfo =
				firstNodePathInfoBySourceNode.get(sourceNodeKey);
			if (selectionNodePathInfo === undefined) {
				throw new Error('Expected a first sequence for the source node');
			}

			const {controls} = sequence;
			const nodePropStatuses = Internals.getPropStatusesCtx(
				propStatuses,
				nodePath,
			);
			const sourceFrame = timelinePosition - keyframeDisplayOffset;
			const dragOverrides = getDragOverrides(nodePath) ?? {};
			const runtimeValues = controls
				? (outlineRuntimeValuesByStore.get(controls.runtimeValues) ??
					controls.runtimeValues.getSnapshot())
				: {};
			const activeSchema = controls
				? getSelectedOutlineActiveSchema({
						schema: controls.schema,
						currentRuntimeValueDotNotation: runtimeValues,
						dragOverrides,
						propStatus: nodePropStatuses,
						frame: sourceFrame,
					})
				: null;
			const cropValues = {
				cropLeft: getEffectiveCropValue({
					activeSchema,
					dragOverrides,
					fieldKey: cropFieldKeys.left,
					frame: sourceFrame,
					propStatuses: nodePropStatuses,
					runtimeValues,
				}),
				cropRight: getEffectiveCropValue({
					activeSchema,
					dragOverrides,
					fieldKey: cropFieldKeys.right,
					frame: sourceFrame,
					propStatuses: nodePropStatuses,
					runtimeValues,
				}),
				cropTop: getEffectiveCropValue({
					activeSchema,
					dragOverrides,
					fieldKey: cropFieldKeys.top,
					frame: sourceFrame,
					propStatuses: nodePropStatuses,
					runtimeValues,
				}),
				cropBottom: getEffectiveCropValue({
					activeSchema,
					dragOverrides,
					fieldKey: cropFieldKeys.bottom,
					frame: sourceFrame,
					propStatuses: nodePropStatuses,
					runtimeValues,
				}),
			};
			const crop = Internals.resolveSequenceCrop(cropValues);
			const cropFields = getCropDragFields({
				activeSchema,
				cropValues,
				propStatuses: nodePropStatuses,
			});
			const fieldSchema = activeSchema?.[translateFieldKey];
			const propStatus = nodePropStatuses?.[translateFieldKey];
			const scaleFieldSchema = activeSchema?.[scaleFieldKey];
			const scalePropStatus = nodePropStatuses?.[scaleFieldKey];
			const rotationFieldSchema = activeSchema?.[rotateFieldKey];
			const rotationPropStatus = nodePropStatuses?.[rotateFieldKey];
			const transformOriginFieldSchema =
				activeSchema?.[transformOriginFieldKey];
			const transformOriginPropStatus =
				nodePropStatuses?.[transformOriginFieldKey];
			const transformOriginValueForRotation =
				transformOriginFieldSchema?.type === 'transform-origin' &&
				(transformOriginPropStatus?.status === 'static' ||
					transformOriginPropStatus?.status === 'keyframed')
					? String(
							Internals.getEffectiveVisualModeValue({
								propStatus: transformOriginPropStatus,
								dragOverrideValue: dragOverrides[transformOriginFieldKey],
								defaultValue: transformOriginFieldSchema.default,
								frame: sourceFrame,
								shouldResortToDefaultValueIfUndefined: true,
							}) ?? transformOriginFieldSchema.default,
						)
					: '50% 50%';
			const canDragStatus =
				propStatus?.status === 'static' ||
				(propStatus?.status === 'keyframed' &&
					propStatus.interpolationFunction === 'interpolate');
			const canRotationDragStatus =
				rotationPropStatus?.status === 'static' ||
				(rotationPropStatus?.status === 'keyframed' &&
					rotationPropStatus.interpolationFunction === 'interpolate');
			const canDrag =
				previewInteractive &&
				controls !== null &&
				fieldSchema?.type === 'translate' &&
				canDragStatus;
			const canScaleDragStatus =
				scalePropStatus?.status === 'static' ||
				(scalePropStatus?.status === 'keyframed' &&
					scalePropStatus.interpolationFunction === 'interpolate');
			const canScaleDrag =
				previewInteractive &&
				controls !== null &&
				scaleFieldSchema?.type === 'scale' &&
				canScaleDragStatus;
			const canRotationDrag =
				previewInteractive &&
				controls !== null &&
				rotationFieldSchema?.type === 'rotation-css' &&
				canRotationDragStatus;
			const selectedForTransformOrigin =
				selectedTransformOriginInfo?.sequenceKey === key;
			const transformOriginSourceFrame =
				selectedTransformOriginInfo?.displayFrame === null ||
				selectedTransformOriginInfo?.displayFrame === undefined
					? sourceFrame
					: selectedTransformOriginInfo.displayFrame - keyframeDisplayOffset;
			const canTransformOriginStatus =
				transformOriginPropStatus?.status === 'static' ||
				(transformOriginPropStatus?.status === 'keyframed' &&
					transformOriginPropStatus.interpolationFunction === 'interpolate');
			const canTransformOriginTranslateStatus =
				propStatus?.status === 'static' ||
				(propStatus?.status === 'keyframed' &&
					propStatus.interpolationFunction === 'interpolate');
			const canTransformOriginDrag =
				previewInteractive &&
				selectedForTransformOrigin &&
				controls !== null &&
				transformOriginFieldSchema?.type === 'transform-origin' &&
				fieldSchema?.type === 'translate' &&
				canTransformOriginStatus &&
				canTransformOriginTranslateStatus;
			const selectedForCrop = selectedCropInfo?.sequenceKey === key;
			const cropSourceFrame =
				selectedCropInfo?.displayFrame === null ||
				selectedCropInfo?.displayFrame === undefined
					? sourceFrame
					: selectedCropInfo.displayFrame - keyframeDisplayOffset;
			const canCropDrag =
				previewInteractive &&
				selectedForCrop &&
				controls !== null &&
				cropFields !== null;
			const canDropEffect =
				previewInteractive && controls?.supportsEffects === true;
			return {
				key,
				canCrop: previewInteractive && controls !== null && cropFields !== null,
				crop,
				cropDrag: canCropDrag
					? {
							clientId: previewServerState.clientId,
							fields: cropFields,
							nodePath,
							schema: controls.schema,
							sourceFrame: cropSourceFrame,
							transformOrigin:
								transformOriginFieldSchema?.type === 'transform-origin' &&
								transformOriginPropStatus !== undefined
									? {
											defaultValue: transformOriginFieldSchema.default,
											propStatus: transformOriginPropStatus,
											value: transformOriginValueForRotation,
										}
									: null,
						}
					: null,
				containsSelection,
				effectDrop: canDropEffect
					? {
							clientId: previewServerState.clientId,
							fileName: nodePath.absolutePath,
							nodePath,
						}
					: null,
				nodePathInfo,
				ref: sequence.refForOutline,
				selected,
				showSelectedOutline,
				selection: {
					type: 'sequence',
					nodePathInfo: selectionNodePathInfo,
				},
				sequence,
				drag: canDrag
					? {
							propStatus,
							clientId: previewServerState.clientId,
							fieldDefault: fieldSchema.default,
							keyframeDisplayOffset,
							nodePath,
							schema: controls.schema,
						}
					: null,
				scaleDrag: canScaleDrag
					? {
							propStatus: scalePropStatus,
							clientId: previewServerState.clientId,
							fieldDefault: scaleFieldSchema.default,
							fieldSchema: scaleFieldSchema,
							keyframeDisplayOffset,
							linked: getScaleLockState({
								nodePath,
								fieldKey: scaleFieldKey,
								defaultValue: (() => {
									const dragOverrideValue = dragOverrides[scaleFieldKey];
									const effectiveValue = Internals.getEffectiveVisualModeValue({
										propStatus: scalePropStatus,
										dragOverrideValue,
										defaultValue: scaleFieldSchema.default,
										shouldResortToDefaultValueIfUndefined: true,
									});
									const [x, y] =
										NoReactInternals.parseScaleValue(effectiveValue);
									return x === y;
								})(),
							}),
							nodePath,
							schema: controls.schema,
						}
					: null,
				rotationDrag: canRotationDrag
					? {
							propStatus: rotationPropStatus,
							clientId: previewServerState.clientId,
							fieldDefault: rotationFieldSchema.default,
							fieldSchema: rotationFieldSchema,
							keyframeDisplayOffset,
							nodePath,
							schema: controls.schema,
							transformOriginValue: transformOriginValueForRotation,
						}
					: null,
				transformOriginDrag: canTransformOriginDrag
					? {
							clientId: previewServerState.clientId,
							keyframeDisplayOffset,
							nodePath,
							originDefault: transformOriginFieldSchema.default,
							originPropStatus: transformOriginPropStatus,
							originValue: String(
								Internals.getEffectiveVisualModeValue({
									propStatus: transformOriginPropStatus,
									dragOverrideValue: dragOverrides[transformOriginFieldKey],
									defaultValue: transformOriginFieldSchema.default,
									frame: transformOriginSourceFrame,
									shouldResortToDefaultValueIfUndefined: true,
								}) ?? transformOriginFieldSchema.default,
							),
							rotateValue: String(
								rotationPropStatus?.status === 'static' ||
									rotationPropStatus?.status === 'keyframed'
									? (Internals.getEffectiveVisualModeValue({
											propStatus: rotationPropStatus,
											dragOverrideValue: dragOverrides[rotateFieldKey],
											defaultValue:
												rotationFieldSchema?.type === 'rotation-css'
													? rotationFieldSchema.default
													: '0deg',
											frame: transformOriginSourceFrame,
											shouldResortToDefaultValueIfUndefined: true,
										}) ?? '0deg')
									: '0deg',
							),
							scaleValue:
								scalePropStatus?.status === 'static' ||
								scalePropStatus?.status === 'keyframed'
									? String(
											Internals.getEffectiveVisualModeValue({
												propStatus: scalePropStatus,
												dragOverrideValue: dragOverrides[scaleFieldKey],
												defaultValue:
													scaleFieldSchema?.type === 'scale'
														? scaleFieldSchema.default
														: 1,
												frame: transformOriginSourceFrame,
												shouldResortToDefaultValueIfUndefined: true,
											}) ?? 1,
										)
									: '1',
							schema: controls.schema,
							sourceFrame: transformOriginSourceFrame,
							translateDefault: fieldSchema.default,
							translatePropStatus: propStatus,
							translateValue: String(
								Internals.getEffectiveVisualModeValue({
									propStatus,
									dragOverrideValue: dragOverrides[translateFieldKey],
									defaultValue: fieldSchema.default,
									frame: transformOriginSourceFrame,
									shouldResortToDefaultValueIfUndefined: true,
								}) ?? fieldSchema.default,
							),
						}
					: null,
				uvHandles: containsSelection
					? getSelectedUvHandles({
							propStatuses,
							clientId,
							getEffectDragOverrides,
							nodePath,
							selectedEffects: selectedEffectsBySequenceKey.get(key),
							sequence,
							sourceFrame: timelinePosition - keyframeDisplayOffset,
						})
					: [],
			};
		});
	}, [
		propStatuses,
		getDragOverrides,
		getEffectDragOverrides,
		getScaleLockState,
		editorShowOutlines,
		isFullscreen,
		previewInteractive,
		previewSelectionAvailable,
		previewServerState,
		selectedItems,
		selectableOutlines,
		timelinePosition,
		outlineRuntimeValuesByStore,
	]);
	useEffect(() => {
		if (
			hoveredSequence?.source === 'canvas' &&
			!outlineTargets.some((target) => target.key === hoveredSequence.key)
		) {
			setHoveredSequence((currentHover) =>
				currentHover?.source === 'canvas' ? null : currentHover,
			);
		}
	}, [hoveredSequence, outlineTargets, setHoveredSequence]);

	const targetsByKey = useMemo(() => {
		return new Map(outlineTargets.map((target) => [target.key, target]));
	}, [outlineTargets]);
	const outlinesForRendering = useMemo(() => {
		return orderOutlinesForRendering({outlines, sequences, targetsByKey});
	}, [outlines, sequences, targetsByKey]);
	const outlinesByKey = useMemo(() => {
		return new Map(outlines.map((outline) => [outline.key, outline]));
	}, [outlines]);
	const allDragTargets = useMemo(() => {
		return outlineTargets.flatMap((target) =>
			(target.selected || target.containsSelection) && target.drag !== null
				? [target.drag]
				: [],
		);
	}, [outlineTargets]);
	const allDragOutlines = useMemo(() => {
		return outlineTargets.flatMap((target) => {
			if (
				(!target.selected && !target.containsSelection) ||
				target.drag === null
			) {
				return [];
			}

			const outline = outlinesByKey.get(target.key);
			return outline === undefined ? [] : [outline];
		});
	}, [outlineTargets, outlinesByKey]);
	const allDragTargetsRef = useRef(allDragTargets);
	const allDragOutlinesRef = useRef(allDragOutlines);
	useLayoutEffect(() => {
		allDragTargetsRef.current = allDragTargets;
		allDragOutlinesRef.current = allDragOutlines;
	}, [allDragOutlines, allDragTargets]);
	const getAllDragTargets = useCallback(() => allDragTargetsRef.current, []);
	const getAllDragOutlines = useCallback(() => allDragOutlinesRef.current, []);
	const allScaleDragTargets = useMemo(() => {
		return outlineTargets.flatMap((target) =>
			target.selected && target.scaleDrag !== null ? [target.scaleDrag] : [],
		);
	}, [outlineTargets]);
	const allRotationDragTargets = useMemo(() => {
		return outlineTargets.flatMap((target) =>
			target.selected && target.rotationDrag !== null
				? [target.rotationDrag]
				: [],
		);
	}, [outlineTargets]);
	const guidesForSnap = useMemo(() => {
		if (!editorShowGuides || canvasContent?.type !== 'composition') {
			return [];
		}

		return guidesList.filter(
			(guide) => guide.compositionId === canvasContent.compositionId,
		);
	}, [canvasContent, editorShowGuides, guidesList]);
	const snapTargets = useMemo(() => {
		return getSelectedOutlineSnapTargets({
			compositionHeight,
			compositionWidth,
			guides: guidesForSnap,
		});
	}, [compositionHeight, compositionWidth, guidesForSnap]);

	const saveKeyboardNudgeSession = useCallback(() => {
		const session = keyboardNudgeSessionRef.current;
		if (session === null) {
			return;
		}

		keyboardNudgeSessionRef.current = null;
		const changes = getSelectedOutlineDragChanges({
			dragStates: session.dragStates,
			lastValues: session.lastValues,
		});

		if (changes.length === 0) {
			clearSelectedOutlineDragOverrides({
				clearDragOverrides,
				dragStates: session.dragStates,
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
						clientId: session.clientId,
						undoLabel:
							changes.length > 1 ? 'Move selected sequences' : 'Move sequence',
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
				clientId: session.clientId,
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
	}, [clearDragOverrides, setPropStatuses]);

	useEffect(() => {
		saveKeyboardNudgeSessionRef.current = saveKeyboardNudgeSession;
	}, [saveKeyboardNudgeSession]);

	useEffect(() => {
		return () => {
			saveKeyboardNudgeSessionRef.current();
		};
	}, []);

	const seekWithArrowKey = useCallback(
		(
			event: KeyboardEvent,
			direction: SelectedOutlineKeyboardNudgeDirection,
		) => {
			if (direction === 'up' || direction === 'down') {
				return;
			}

			event.preventDefault();

			if (direction === 'left') {
				if (event.altKey) {
					seek(0);
					ensureFrameIsInViewport({
						direction: 'fit-left',
						durationInFrames: getCurrentDuration(),
						frame: 0,
					});
				} else if (event.shiftKey) {
					frameBack(getCurrentFps());
					ensureFrameIsInViewport({
						direction: 'fit-left',
						durationInFrames: getCurrentDuration(),
						frame: Math.max(0, getCurrentFrame() - getCurrentFps()),
					});
				} else {
					frameBack(1);
					ensureFrameIsInViewport({
						direction: 'fit-left',
						durationInFrames: getCurrentDuration(),
						frame: Math.max(0, getCurrentFrame() - 1),
					});
				}

				return;
			}

			if (event.altKey) {
				seek(getCurrentDuration() - 1);
				ensureFrameIsInViewport({
					direction: 'fit-right',
					durationInFrames: getCurrentDuration() - 1,
					frame: getCurrentDuration() - 1,
				});
			} else if (event.shiftKey) {
				frameForward(getCurrentFps());
				ensureFrameIsInViewport({
					direction: 'fit-right',
					durationInFrames: getCurrentDuration(),
					frame: Math.min(
						getCurrentDuration() - 1,
						getCurrentFrame() + getCurrentFps(),
					),
				});
			} else {
				frameForward(1);
				ensureFrameIsInViewport({
					direction: 'fit-right',
					durationInFrames: getCurrentDuration(),
					frame: Math.min(getCurrentDuration() - 1, getCurrentFrame() + 1),
				});
			}
		},
		[frameBack, frameForward, getCurrentFrame, seek],
	);

	const onArrowKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const direction = getSelectedOutlineKeyboardNudgeDirection(event.key);

			if (direction === null) {
				return;
			}

			if (selectedItems.length === 0 || allDragTargets.length === 0) {
				seekWithArrowKey(event, direction);
				return;
			}

			if (event.altKey) {
				seekWithArrowKey(event, direction);
				return;
			}

			event.preventDefault();

			const activeSession =
				keyboardNudgeSessionRef.current ??
				((): SelectedOutlineKeyboardNudgeSession => {
					const [firstDragTarget] = allDragTargets;
					if (firstDragTarget === undefined) {
						throw new Error('Expected a drag target');
					}

					return {
						clientId: firstDragTarget.clientId,
						deltaX: 0,
						deltaY: 0,
						dragStates: getSelectedOutlineDragStates({
							dragTargets: allDragTargets,
							getDragOverrides,
							timelinePosition: getCurrentFrame(),
						}),
						lastValues: new Map(),
					};
				})();

			keyboardNudgeSessionRef.current = activeSession;
			const nextDeltas = getSelectedOutlineKeyboardNudgeDeltas({
				deltaX: activeSession.deltaX,
				deltaY: activeSession.deltaY,
				direction,
				shiftKey: event.shiftKey,
			});
			activeSession.deltaX = nextDeltas.deltaX;
			activeSession.deltaY = nextDeltas.deltaY;

			const lastValues = getSelectedOutlineDragValues({
				dragStates: activeSession.dragStates,
				deltaX: activeSession.deltaX,
				deltaY: activeSession.deltaY,
			});
			activeSession.lastValues = lastValues;

			for (const dragState of activeSession.dragStates) {
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
		},
		[
			allDragTargets,
			getCurrentFrame,
			getDragOverrides,
			seekWithArrowKey,
			selectedItems.length,
			setDragOverrides,
		],
	);

	const onArrowKeyUp = useCallback(
		(event: KeyboardEvent) => {
			const direction = getSelectedOutlineKeyboardNudgeDirection(event.key);

			if (direction === null || keyboardNudgeSessionRef.current === null) {
				return;
			}

			event.preventDefault();
			saveKeyboardNudgeSession();
		},
		[saveKeyboardNudgeSession],
	);

	useEffect(() => {
		const keyDownBindings = (
			['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'] as const
		).map((key) =>
			keybindings.registerKeybinding({
				event: 'keydown',
				key,
				callback: onArrowKeyDown,
				commandCtrlKey: false,
				preventDefault: false,
				triggerIfInputFieldFocused: false,
				keepRegisteredWhenNotHighestContext: false,
			}),
		);
		const keyUpBindings = (
			['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'] as const
		).map((key) =>
			keybindings.registerKeybinding({
				event: 'keyup',
				key,
				callback: onArrowKeyUp,
				commandCtrlKey: false,
				preventDefault: false,
				triggerIfInputFieldFocused: false,
				keepRegisteredWhenNotHighestContext: false,
			}),
		);

		return () => {
			for (const binding of [...keyDownBindings, ...keyUpBindings]) {
				binding.unregister();
			}
		};
	}, [keybindings, onArrowKeyDown, onArrowKeyUp, saveKeyboardNudgeSession]);

	const updateOutlines = useCallback(() => {
		if (overlayRef.current === null || outlineTargets.length === 0) {
			setOutlines((prevOutlines) =>
				prevOutlines.length === 0 ? prevOutlines : [],
			);
			return;
		}

		const nextOutlines = measureOutlines(overlayRef.current, outlineTargets);
		setOutlines((prevOutlines) =>
			outlinesAreEqual(prevOutlines, nextOutlines)
				? prevOutlines
				: nextOutlines,
		);
	}, [outlineTargets]);
	useLayoutEffect(() => {
		updateOutlinesRef.current = updateOutlines;
	}, [updateOutlines]);

	useLayoutEffect(() => {
		updateOutlines();
	}, [outlineTargets, scale, translationX, translationY, updateOutlines]);

	useLayoutEffect(() => {
		if (typeof ResizeObserver === 'undefined') {
			return;
		}

		const resizeObserver = new ResizeObserver(() => {
			if (resizeObserverAnimationFrameRef.current !== null) {
				return;
			}

			resizeObserverAnimationFrameRef.current = requestAnimationFrame(() => {
				resizeObserverAnimationFrameRef.current = null;
				updateOutlinesRef.current();
			});
		});
		resizeObserverRef.current = resizeObserver;

		return () => {
			if (resizeObserverAnimationFrameRef.current !== null) {
				cancelAnimationFrame(resizeObserverAnimationFrameRef.current);
				resizeObserverAnimationFrameRef.current = null;
			}

			resizeObserver.disconnect();
			resizeObserverRef.current = null;
			observedOutlineElementsRef.current = new Set();
		};
	}, []);

	useLayoutEffect(() => {
		const resizeObserver = resizeObserverRef.current;
		if (resizeObserver === null) {
			return;
		}

		const nextObservedElements = new Set<Element>();
		if (overlayRef.current !== null) {
			nextObservedElements.add(overlayRef.current);
		}

		for (const target of outlineTargets) {
			if (target.ref.current !== null) {
				nextObservedElements.add(target.ref.current);
			}
		}

		for (const element of observedOutlineElementsRef.current) {
			if (!nextObservedElements.has(element)) {
				resizeObserver.unobserve(element);
			}
		}

		for (const element of nextObservedElements) {
			if (!observedOutlineElementsRef.current.has(element)) {
				resizeObserver.observe(element);
			}
		}

		observedOutlineElementsRef.current = nextObservedElements;
	}, [outlineTargets]);

	if (outlineTargets.length === 0) {
		return null;
	}

	return (
		<svg
			ref={overlayRef}
			style={outlineContainer}
			width="100%"
			height="100%"
			aria-hidden="true"
		>
			<SelectedOutlineSnapIndicators
				activeSnapPoints={activeSnapPoints}
				compositionHeight={compositionHeight}
				compositionWidth={compositionWidth}
				scale={scale}
			/>
			{outlinesForRendering.map((outline) => (
				<SelectedOutlineElement
					key={outline.key}
					allRotationDragTargets={allRotationDragTargets}
					allScaleDragTargets={allScaleDragTargets}
					dragging={draggingOutline}
					getAllDragOutlines={getAllDragOutlines}
					getAllDragTargets={getAllDragTargets}
					outline={outline}
					onDraggingChange={onDraggingChange}
					onSnapPointsChange={onSnapPointsChange}
					onSelect={selectOutlineItem}
					scale={scale}
					snapTargets={snapTargets}
					target={targetsByKey.get(outline.key)}
				/>
			))}
			{/* Keep transform-origin handles above every transparent outline polygon so SVG hit-testing reaches the selected knob first. */}
			{outlinesForRendering.map((outline) => (
				<SelectedOutlineTransformOriginHandle
					key={`${outline.key}-transform-origin`}
					outline={outline}
					onDraggingChange={onDraggingChange}
					target={targetsByKey.get(outline.key)}
				/>
			))}
			{/* Keep UV controls above every transparent outline polygon so SVG hit-testing reaches the handles first. */}
			{outlinesForRendering.map((outline) => (
				<SelectedOutlineUvHandleConnectionLayer
					key={`${outline.key}-uv-connection-lines`}
					outline={outline}
					target={targetsByKey.get(outline.key)}
				/>
			))}
			{outlinesForRendering.map((outline) => (
				<SelectedOutlineUvHandleCircleLayer
					key={`${outline.key}-uv-handles`}
					onDraggingChange={onDraggingChange}
					onSelect={selectOutlineItem}
					outline={outline}
					target={targetsByKey.get(outline.key)}
				/>
			))}
		</svg>
	);
};
