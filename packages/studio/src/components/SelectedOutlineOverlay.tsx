import {PlayerInternals} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	Internals,
	type GetDragOverrides,
	type InteractivitySchema,
	type RuntimeValueStore,
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
import {useRuntimeValueSnapshots} from '../helpers/use-runtime-values';
import {EditorShowOutlinesContext} from '../state/editor-outlines';
import {ScaleLockContext} from '../state/scale-lock';
import {useSetTimelineSequenceHover} from '../state/timeline-sequence-hover';
import {getSelectedOutlineActiveSchema} from './selected-outline-drag';
import {
	getSelectedCropInfo,
	getSelectedEffectFieldsBySequenceKey,
	getSelectedSequenceKeys,
	getSelectedTransformOriginInfo,
	getSequenceKeysContainingSelection,
	getSequencesWithSelectableOutlines,
} from './selected-outline-measurement';
import {orderOutlinesForRendering} from './selected-outline-order';
import {
	canEditSelectedOutlineCrop,
	cropFieldKeys,
	rotateFieldKey,
	scaleFieldKey,
	transformOriginFieldKey,
	translateFieldKey,
	type SelectedOutlineCropDragTarget,
	type SelectedOutlineCropFieldKey,
	type SelectedOutlineLayoutTarget,
	type SelectedOutlineTarget,
} from './selected-outline-types';
import {SelectedOutlineKeyboardControls} from './SelectedOutlineKeyboardControls';
import {SelectedOutlineRenderer} from './SelectedOutlineRenderer';
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

type SelectedOutlineOverlayProps = {
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly scale: number;
	readonly translationX: number;
	readonly translationY: number;
};

const SelectedOutlineOverlayUnmemoized: React.FC<
	SelectedOutlineOverlayProps
> = ({
	compositionHeight,
	compositionWidth,
	scale,
	translationX,
	translationY,
}) => {
	const {selectedItems, selectItem} = useTimelineSelection();
	const {sequences} = useContext(Internals.SequenceManager);
	const {compositions} = useContext(Internals.CompositionManager);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {getScaleLockState} = useContext(ScaleLockContext);
	const {editorShowOutlines} = useContext(EditorShowOutlinesContext);
	const setHoveredSequence = useSetTimelineSequenceHover();
	const isFullscreen = useIsFullscreen();
	const {getCurrentFrame} = PlayerInternals.usePlayerMethods();
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const [draggingOutline, setDraggingOutline] = useState(false);
	const updateOutlinesRef = useRef<() => void>(() => undefined);
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
			}
		},
		[setHoveredSequence],
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
	const selectedSequenceKeys = useMemo(
		() => getSelectedSequenceKeys(selectedItems),
		[selectedItems],
	);
	const sequenceKeysContainingSelection = useMemo(
		() => getSequenceKeysContainingSelection(selectedItems),
		[selectedItems],
	);
	const selectedEffectsBySequenceKey = useMemo(
		() => getSelectedEffectFieldsBySequenceKey(selectedItems),
		[selectedItems],
	);
	const selectedTransformOriginInfo = useMemo(
		() => getSelectedTransformOriginInfo(selectedItems),
		[selectedItems],
	);
	const selectedCropInfo = useMemo(
		() => getSelectedCropInfo(selectedItems),
		[selectedItems],
	);
	const {firstNodePathInfoBySourceNode, selectedSourceNodeKeys} =
		useMemo(() => {
			const firstBySourceNode = new Map<string, SequenceNodePathInfo>();
			const selectedSourceNodes = new Set<string>();
			for (const {key, nodePathInfo} of selectableOutlines) {
				const sourceNodeKey = timelineSequenceNodePathToKey(
					nodePathInfo.sequenceSubscriptionKey,
				);
				if (selectedSequenceKeys.has(key)) {
					selectedSourceNodes.add(sourceNodeKey);
				}

				const currentFirst = firstBySourceNode.get(sourceNodeKey);
				if (
					currentFirst === undefined ||
					nodePathInfo.index < currentFirst.index
				) {
					firstBySourceNode.set(sourceNodeKey, nodePathInfo);
				}
			}

			return {
				firstNodePathInfoBySourceNode: firstBySourceNode,
				selectedSourceNodeKeys: selectedSourceNodes,
			};
		}, [selectableOutlines, selectedSequenceKeys]);
	const outlineRuntimeControls = useMemo(() => {
		return selectableOutlines.flatMap(({key, sequence}) => {
			if (
				!selectedSequenceKeys.has(key) &&
				!sequenceKeysContainingSelection.has(key)
			) {
				return [];
			}

			return sequence.controls ? [sequence.controls] : [];
		});
	}, [
		selectableOutlines,
		selectedSequenceKeys,
		sequenceKeysContainingSelection,
	]);
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

	const calculateOutlineTargets = useCallback(
		({
			mode,
			runtimeValuesByStore,
			targetKey,
			targetTimelinePosition,
		}: {
			readonly mode: 'controls' | 'layout';
			readonly runtimeValuesByStore: ReadonlyMap<
				RuntimeValueStore,
				Readonly<Record<string, unknown>>
			>;
			readonly targetKey: string | null;
			readonly targetTimelinePosition: number;
		}): SelectedOutlineLayoutTarget[] => {
			if (
				isFullscreen ||
				!isStudioSelectionEnabled() ||
				!previewSelectionAvailable ||
				!editorShowOutlines
			) {
				return [];
			}

			return selectableOutlines.flatMap((selectableOutline) => {
				const {key, keyframeDisplayOffset, nodePathInfo, sequence} =
					selectableOutline;
				if (targetKey !== null && targetKey !== key) {
					return [];
				}

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
				const sourceFrame = targetTimelinePosition - keyframeDisplayOffset;
				const dragOverrides = getDragOverrides(nodePath) ?? {};
				const runtimeValues = controls
					? (runtimeValuesByStore.get(controls.runtimeValues) ??
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
				const selectedForTransformOrigin =
					selectedTransformOriginInfo?.sequenceKey === key;
				const selectedForCrop = selectedCropInfo?.sequenceKey === key;
				const selectedForUvHandles = selectedEffectsBySequenceKey.has(key);
				const layoutTarget: SelectedOutlineLayoutTarget = {
					key,
					containsSelection,
					crop,
					keyframeDisplayOffset,
					nodePathInfo,
					ref: sequence.refForOutline,
					selected,
					selectedForCrop,
					selectedForTransformOrigin,
					selectedForUvHandles,
					showSelectedOutline,
					selection: {
						type: 'sequence',
						nodePathInfo: selectionNodePathInfo,
					},
					sequence,
				};
				if (mode === 'layout') {
					return [layoutTarget];
				}

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
				return [
					{
						...layoutTarget,
						canCrop:
							previewInteractive && controls !== null && cropFields !== null,
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
											const effectiveValue =
												Internals.getEffectiveVisualModeValue({
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
					} satisfies SelectedOutlineTarget,
				];
			});
		},
		[
			propStatuses,
			getDragOverrides,
			getScaleLockState,
			editorShowOutlines,
			isFullscreen,
			previewInteractive,
			previewSelectionAvailable,
			previewServerState,
			firstNodePathInfoBySourceNode,
			selectedCropInfo,
			selectedEffectsBySequenceKey,
			selectedSequenceKeys,
			selectedSourceNodeKeys,
			selectedTransformOriginInfo,
			sequenceKeysContainingSelection,
			selectableOutlines,
		],
	);
	const outlineTargets = useMemo(
		() =>
			calculateOutlineTargets({
				mode: 'layout',
				runtimeValuesByStore: outlineRuntimeValuesByStore,
				targetKey: null,
				targetTimelinePosition: timelinePosition,
			}),
		[calculateOutlineTargets, outlineRuntimeValuesByStore, timelinePosition],
	);
	const calculateOutlineTargetsRef = useRef(calculateOutlineTargets);
	useLayoutEffect(() => {
		calculateOutlineTargetsRef.current = calculateOutlineTargets;
	}, [calculateOutlineTargets]);
	const getLatestOutlineTargetByKey = useCallback(
		(key: string) => {
			const target = calculateOutlineTargetsRef.current({
				mode: 'controls',
				runtimeValuesByStore: new Map(),
				targetKey: key,
				targetTimelinePosition: getCurrentFrame(),
			})[0];
			return target as SelectedOutlineTarget | undefined;
		},
		[getCurrentFrame],
	);

	const outlineTargetsRef =
		useRef<readonly SelectedOutlineLayoutTarget[]>(outlineTargets);
	const getOutlineTargets = useCallback(() => outlineTargetsRef.current, []);
	useLayoutEffect(() => {
		outlineTargetsRef.current = outlineTargets;
		updateOutlinesRef.current();
	}, [outlineTargets, scale, translationX, translationY]);
	return (
		<>
			<SelectedOutlineRenderer
				compositionHeight={compositionHeight}
				compositionWidth={compositionWidth}
				dragging={draggingOutline}
				getLatestOutlineTargetByKey={getLatestOutlineTargetByKey}
				getOutlineTargets={getOutlineTargets}
				onDraggingChange={onDraggingChange}
				onSelect={selectOutlineItem}
				scale={scale}
				sequences={sequences}
				updateOutlinesRef={updateOutlinesRef}
			/>
			<SelectedOutlineKeyboardControls
				getLatestOutlineTargetByKey={getLatestOutlineTargetByKey}
				selectableOutlines={selectableOutlines}
			/>
		</>
	);
};

export const SelectedOutlineOverlay = React.memo(
	SelectedOutlineOverlayUnmemoized,
);
