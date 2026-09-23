import {
	calculateTimeline,
	getCanvasSelectableOutlines,
	getCanvasVisibleOutlineTargets,
	getCanvasActiveOutlineTargets,
	getCanvasOutlineActivity,
	getCanvasOutlineLayoutTargets,
} from '@remotion/canvas';
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
import {
	isStudioInteractivityEnabled,
	isStudioSelectionEnabled,
} from '../helpers/interactivity-enabled';
import {useIsFullscreen} from '../helpers/use-is-fullscreen';
import {useRuntimeValueSnapshots} from '../helpers/use-runtime-values';
import {EditorShowOutlinesContext} from '../state/editor-outlines';
import {ScaleLockContext} from '../state/scale-lock';
import {
	useSetTimelineSequenceHover,
	useTimelineSequenceHoverState,
} from '../state/timeline-sequence-hover';
import {Transform3DModeStateContext} from '../state/transform-3d-mode';
import {getSelectedOutlineActiveSchema} from './selected-outline-drag';
import {
	getSelectedCropInfo,
	getSelectedEffectFieldsBySequenceKey,
	getSelectedRotationInfo,
	getSelectedSequenceKeys,
	getSelectedTransformOriginInfo,
	getSequenceKeysContainingSelection,
	type getSequencesWithSelectableOutlines,
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
	type SelectedOutlineDragTarget,
	type SelectedOutlineLayoutTarget,
	type SelectedOutlineTarget,
} from './selected-outline-types';
import {SelectedOutlineKeyboardControls} from './SelectedOutlineKeyboardControls';
import {SelectedOutlineRenderer} from './SelectedOutlineRenderer';
import {getKeyframeDisplayOffset} from './Timeline/get-timeline-keyframes';
import {
	useCurrentTimelineSelectionStateAsRef,
	useTimelineSelection,
	type TimelineSelection,
	type TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';
import {propStatusHas3DTransformValue} from './Timeline/transform-3d-mode';

export {orderOutlinesForRendering};

export {
	applySelectedOutlineDragAxisLock,
	applySelectedOutlineTransformOriginAxisLock,
	compensateTranslateForTransformOrigin,
	getSelectedOutline3DRotationDragValues,
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

type SelectableOutlines = Readonly<
	ReturnType<typeof getSequencesWithSelectableOutlines>
>;

type CalculateOutlineTargetsOptions = {
	readonly mode: 'controls' | 'layout';
	readonly runtimeValuesByStore: ReadonlyMap<
		RuntimeValueStore,
		Readonly<Record<string, unknown>>
	>;
	readonly selectableOutlines: SelectableOutlines;
	readonly targetKey: string | null;
	readonly targetTimelinePosition: number;
};

type CalculateOutlineTargets = (
	options: CalculateOutlineTargetsOptions,
) => SelectedOutlineLayoutTarget[];

const calculateOutlineTargets = ({
	connectedClientId,
	editorShowOutlines,
	getDragOverrides,
	getScaleLockState,
	isFullscreen,
	manuallyEnabled3DTransformSequenceKeys,
	mode,
	previewSelectionAvailable,
	propStatuses,
	runtimeValuesByStore,
	selectableOutlines,
	selectedCropInfo,
	selectedEffectsBySequenceKey,
	selectedRotationInfo,
	selectedSequenceKeys,
	selectedTransformOriginInfo,
	sequenceKeysContainingSelection,
	studioInteractivityEnabled,
	targetKey,
	targetTimelinePosition,
}: CalculateOutlineTargetsOptions & {
	readonly connectedClientId: string | null;
	readonly editorShowOutlines: boolean;
	readonly getDragOverrides: React.ContextType<
		typeof Internals.VisualModeDragOverridesContext
	>['getDragOverrides'];
	readonly getScaleLockState: React.ContextType<
		typeof ScaleLockContext
	>['getScaleLockState'];
	readonly isFullscreen: boolean;
	readonly manuallyEnabled3DTransformSequenceKeys: ReadonlySet<string>;
	readonly previewSelectionAvailable: boolean;
	readonly propStatuses: React.ContextType<
		typeof Internals.VisualModePropStatusesContext
	>['propStatuses'];
	readonly selectedCropInfo: ReturnType<typeof getSelectedCropInfo>;
	readonly selectedEffectsBySequenceKey: ReturnType<
		typeof getSelectedEffectFieldsBySequenceKey
	>;
	readonly selectedRotationInfo: ReturnType<typeof getSelectedRotationInfo>;
	readonly selectedSequenceKeys: ReadonlySet<string>;
	readonly selectedTransformOriginInfo: ReturnType<
		typeof getSelectedTransformOriginInfo
	>;
	readonly sequenceKeysContainingSelection: ReadonlySet<string>;
	readonly studioInteractivityEnabled: boolean;
}): SelectedOutlineLayoutTarget[] => {
	if (
		isFullscreen ||
		!isStudioSelectionEnabled() ||
		!previewSelectionAvailable ||
		!editorShowOutlines
	) {
		return [];
	}

	const previewInteractive =
		connectedClientId !== null && studioInteractivityEnabled;

	return getCanvasOutlineLayoutTargets({
		selectableOutlines,
		selectedSequenceKeys,
		sequenceKeysContainingSelection,
		targetKey,
	}).flatMap((canvasLayoutTarget) => {
		const {key, keyframeDisplayOffset, nodePathInfo, sequence} =
			canvasLayoutTarget;
		const nodePath = nodePathInfo.sequenceSubscriptionKey;

		const {controls} = sequence;
		const nodePropStatuses = Internals.getPropStatusesCtx(
			propStatuses,
			nodePath,
		);
		const firstKeyframedStatus = Object.values(nodePropStatuses ?? {}).find(
			(status) => status.status === 'keyframed',
		);
		const nodeKeyframeDisplayOffset = getKeyframeDisplayOffset({
			propStatus: firstKeyframedStatus,
			keyframeDisplayOffset,
		});
		const sourceFrame = targetTimelinePosition - nodeKeyframeDisplayOffset;
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
		const selectedForRotation = selectedRotationInfo?.sequenceKey === key;
		const selectedForUvHandles = selectedEffectsBySequenceKey.has(key);
		const fieldSchema = activeSchema?.[translateFieldKey];
		const propStatus = nodePropStatuses?.[translateFieldKey];
		const scaleFieldSchema = activeSchema?.[scaleFieldKey];
		const scalePropStatus = nodePropStatuses?.[scaleFieldKey];
		const rotationFieldSchema = activeSchema?.[rotateFieldKey];
		const rotationPropStatus = nodePropStatuses?.[rotateFieldKey];
		const transformOriginFieldSchema = activeSchema?.[transformOriginFieldKey];
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
		const layoutTarget: SelectedOutlineLayoutTarget = {
			...canvasLayoutTarget,
			crop,
			keyframeDisplayOffset: nodeKeyframeDisplayOffset,
			selectedForCrop,
			selectedForRotation,
			selectedForTransformOrigin,
			selectedForUvHandles,
			transformOriginValue: transformOriginValueForRotation,
		};
		if (mode === 'layout') {
			return [layoutTarget];
		}

		const cropFields = getCropDragFields({
			activeSchema,
			cropValues,
			propStatuses: nodePropStatuses,
		});
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
		const transform3DMode =
			manuallyEnabled3DTransformSequenceKeys.has(key) ||
			[
				'style.translate',
				'style.scale',
				'style.rotate',
				'style.transformOrigin',
			].some((fieldKey) =>
				propStatusHas3DTransformValue({
					fieldKey,
					propStatus: nodePropStatuses?.[fieldKey],
					runtimeValue: runtimeValues[fieldKey],
				}),
			);
		const transformOriginSourceFrame =
			selectedTransformOriginInfo?.displayFrame === null ||
			selectedTransformOriginInfo?.displayFrame === undefined
				? sourceFrame
				: selectedTransformOriginInfo.displayFrame -
					getKeyframeDisplayOffset({
						propStatus: transformOriginPropStatus,
						keyframeDisplayOffset,
					});
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
			(selectedForTransformOrigin || selectedForRotation) &&
			controls !== null &&
			transformOriginFieldSchema?.type === 'transform-origin' &&
			fieldSchema?.type === 'translate' &&
			canTransformOriginStatus &&
			canTransformOriginTranslateStatus;
		const cropSourceFrame =
			selectedCropInfo?.displayFrame === null ||
			selectedCropInfo?.displayFrame === undefined
				? sourceFrame
				: selectedCropInfo.displayFrame - nodeKeyframeDisplayOffset;
		const canCropDrag =
			previewInteractive &&
			selectedForCrop &&
			controls !== null &&
			cropFields !== null;
		return [
			{
				...layoutTarget,
				canCrop: previewInteractive && controls !== null && cropFields !== null,
				cropDrag: canCropDrag
					? {
							clientId: connectedClientId,
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
							clientId: connectedClientId,
							fieldDefault: fieldSchema.default,
							keyframeDisplayOffset: getKeyframeDisplayOffset({
								propStatus,
								keyframeDisplayOffset,
							}),
							nodePath,
							schema: controls.schema,
						}
					: null,
				scaleDrag: canScaleDrag
					? {
							propStatus: scalePropStatus,
							clientId: connectedClientId,
							fieldDefault: scaleFieldSchema.default,
							fieldSchema: scaleFieldSchema,
							keyframeDisplayOffset: getKeyframeDisplayOffset({
								propStatus: scalePropStatus,
								keyframeDisplayOffset,
							}),
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
							clientId: connectedClientId,
							fieldDefault: rotationFieldSchema.default,
							fieldSchema: rotationFieldSchema,
							keyframeDisplayOffset: getKeyframeDisplayOffset({
								propStatus: rotationPropStatus,
								keyframeDisplayOffset,
							}),
							nodePath,
							schema: controls.schema,
							transform3DMode,
							transformOriginValue: transformOriginValueForRotation,
						}
					: null,
				transformOriginDrag: canTransformOriginDrag
					? {
							clientId: connectedClientId,
							keyframeDisplayOffset: getKeyframeDisplayOffset({
								propStatus: transformOriginPropStatus,
								keyframeDisplayOffset,
							}),
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
};

export type {
	SelectedOutlineDragState,
	SelectedOutlineRotationDragState,
	SelectedOutlineScaleDragState,
} from './selected-outline-types';

type SelectedOutlineOverlayProps = {
	readonly canvasHovered: boolean;
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly scale: number;
	readonly translationX: number;
	readonly translationY: number;
};

type ActiveSelectedOutlineOverlayProps = Omit<
	SelectedOutlineOverlayProps,
	'canvasHovered'
> & {
	readonly calculateOutlineTargetsForCurrentState: CalculateOutlineTargets;
	readonly draggingOutline: boolean;
	readonly getAllDragTargets: () => readonly SelectedOutlineDragTarget[];
	readonly getLatestOutlineTargetByKey: (
		key: string,
	) => SelectedOutlineTarget | undefined;
	readonly getSelectableOutlines: (
		timelinePosition: number,
	) => ReturnType<typeof getSequencesWithSelectableOutlines>;
	readonly hoveredTimelineNodePathKey: string | null;
	readonly measureAllOutlines: boolean;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onContextMenuOpenChange: (open: boolean) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction?: TimelineSelectionInteraction,
	) => void;
	readonly selectedSequenceKeys: ReadonlySet<string>;
	readonly sequenceKeysContainingSelection: ReadonlySet<string>;
	readonly sequences: React.ContextType<
		typeof Internals.SequenceManager
	>['sequences'];
};

const ActiveSelectedOutlineOverlayUnmemoized: React.FC<
	ActiveSelectedOutlineOverlayProps
> = ({
	calculateOutlineTargetsForCurrentState,
	compositionHeight,
	compositionWidth,
	draggingOutline,
	getAllDragTargets,
	getLatestOutlineTargetByKey,
	getSelectableOutlines,
	hoveredTimelineNodePathKey,
	measureAllOutlines,
	onDraggingChange,
	onContextMenuOpenChange,
	onSelect,
	scale,
	selectedSequenceKeys,
	sequenceKeysContainingSelection,
	sequences,
	translationX,
	translationY,
}) => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const updateOutlinesRef = useRef<() => void>(() => undefined);
	const selectableOutlines = useMemo(() => {
		return getSelectableOutlines(timelinePosition);
	}, [getSelectableOutlines, timelinePosition]);
	const selectableOutlinesForLayout = useMemo(
		() =>
			getCanvasActiveOutlineTargets({
				targets: selectableOutlines,
				selectedSequenceKeys,
				sequenceKeysContainingSelection,
				hoveredNodePathKey: hoveredTimelineNodePathKey,
				measureAll: measureAllOutlines,
			}),
		[
			hoveredTimelineNodePathKey,
			measureAllOutlines,
			selectableOutlines,
			selectedSequenceKeys,
			sequenceKeysContainingSelection,
		],
	);
	const outlineRuntimeControls = useMemo(() => {
		return selectableOutlinesForLayout.flatMap(({key, sequence}) => {
			if (
				!selectedSequenceKeys.has(key) &&
				!sequenceKeysContainingSelection.has(key)
			) {
				return [];
			}

			return sequence.controls ? [sequence.controls] : [];
		});
	}, [
		selectableOutlinesForLayout,
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

	const outlineTargets = useMemo(
		() =>
			calculateOutlineTargetsForCurrentState({
				mode: 'layout',
				runtimeValuesByStore: outlineRuntimeValuesByStore,
				selectableOutlines: selectableOutlinesForLayout,
				targetKey: null,
				targetTimelinePosition: timelinePosition,
			}),
		[
			calculateOutlineTargetsForCurrentState,
			outlineRuntimeValuesByStore,
			selectableOutlinesForLayout,
			timelinePosition,
		],
	);

	useLayoutEffect(() => {
		updateOutlinesRef.current();
	}, [scale, translationX, translationY]);
	return (
		<SelectedOutlineRenderer
			compositionHeight={compositionHeight}
			compositionWidth={compositionWidth}
			dragging={draggingOutline}
			getAllDragTargets={getAllDragTargets}
			getLatestOutlineTargetByKey={getLatestOutlineTargetByKey}
			outlineTargets={outlineTargets}
			onDraggingChange={onDraggingChange}
			onContextMenuOpenChange={onContextMenuOpenChange}
			onSelect={onSelect}
			scale={scale}
			sequences={sequences}
			updateOutlinesRef={updateOutlinesRef}
		/>
	);
};

const ActiveSelectedOutlineOverlay = React.memo(
	ActiveSelectedOutlineOverlayUnmemoized,
);

const SelectedOutlineOverlayUnmemoized: React.FC<
	SelectedOutlineOverlayProps
> = ({
	canvasHovered,
	compositionHeight,
	compositionWidth,
	scale,
	translationX,
	translationY,
}) => {
	const {selectedItems, selectItem} = useTimelineSelection();
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
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
	const {manuallyEnabledSequenceKeys} = useContext(Transform3DModeStateContext);
	const {editorShowOutlines} = useContext(EditorShowOutlinesContext);
	const setHoveredSequence = useSetTimelineSequenceHover();
	const hoveredSequence = useTimelineSequenceHoverState();
	const isFullscreen = useIsFullscreen();
	const {getCurrentFrame} = PlayerInternals.usePlayerMethods();
	const [draggingOutline, setDraggingOutline] = useState(false);
	const [canvasContextMenuOpen, setCanvasContextMenuOpen] = useState(false);
	const previewSelectionAvailable =
		previewServerState.type === 'connected' || window.remotion_isReadOnlyStudio;
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
	const selectedRotationInfo = useMemo(
		() => getSelectedRotationInfo(selectedItems),
		[selectedItems],
	);
	const selectedCropInfo = useMemo(
		() => getSelectedCropInfo(selectedItems),
		[selectedItems],
	);
	const getSelectableOutlines = useMemo(() => {
		// Resolve source identities once per sequence snapshot, on first demand.
		// Playback only filters the cached candidates by their visible range.
		let selectableOutlines: ReturnType<
			typeof getSequencesWithSelectableOutlines
		> | null = null;
		return (timelinePosition: number | null) => {
			if (
				isFullscreen ||
				!isStudioSelectionEnabled() ||
				!previewSelectionAvailable ||
				!editorShowOutlines
			) {
				return [];
			}

			selectableOutlines ??= getCanvasSelectableOutlines({
				tracks: calculateTimeline({
					sequences: [...sequences],
					overrideIdsToNodePaths: overrideIdToNodePathMappings,
					compositions,
				}),
				timelinePosition: null,
				resolveSequenceNodePathInfo: null,
			});
			return timelinePosition === null
				? selectableOutlines
				: getCanvasVisibleOutlineTargets({
						targets: selectableOutlines,
						timelinePosition,
					});
		};
	}, [
		compositions,
		editorShowOutlines,
		isFullscreen,
		overrideIdToNodePathMappings,
		previewSelectionAvailable,
		sequences,
	]);

	const calculateOutlineTargetsForCurrentState =
		useCallback<CalculateOutlineTargets>(
			(options) =>
				calculateOutlineTargets({
					...options,
					connectedClientId:
						previewServerState.type === 'connected'
							? previewServerState.clientId
							: null,
					editorShowOutlines,
					getDragOverrides,
					getScaleLockState,
					isFullscreen,
					manuallyEnabled3DTransformSequenceKeys: manuallyEnabledSequenceKeys,
					previewSelectionAvailable,
					propStatuses,
					selectedCropInfo,
					selectedEffectsBySequenceKey,
					selectedRotationInfo,
					selectedSequenceKeys,
					selectedTransformOriginInfo,
					sequenceKeysContainingSelection,
					studioInteractivityEnabled: isStudioInteractivityEnabled(),
				}),
			[
				editorShowOutlines,
				getDragOverrides,
				getScaleLockState,
				isFullscreen,
				manuallyEnabledSequenceKeys,
				previewSelectionAvailable,
				previewServerState,
				propStatuses,
				selectedCropInfo,
				selectedEffectsBySequenceKey,
				selectedRotationInfo,
				selectedSequenceKeys,
				selectedTransformOriginInfo,
				sequenceKeysContainingSelection,
			],
		);

	const getSelectableOutlinesRef = useRef(getSelectableOutlines);
	const selectableOutlinesCacheRef = useRef<{
		readonly getSelectableOutlines: typeof getSelectableOutlines;
		readonly selectableOutlines: ReturnType<
			typeof getSequencesWithSelectableOutlines
		>;
		readonly timelinePosition: number;
	} | null>(null);
	useLayoutEffect(() => {
		getSelectableOutlinesRef.current = getSelectableOutlines;
	}, [getSelectableOutlines]);
	const getSelectableOutlinesAtFrame = useCallback(
		(timelinePosition: number) => {
			const currentGetSelectableOutlines = getSelectableOutlinesRef.current;
			const cached = selectableOutlinesCacheRef.current;
			if (
				cached?.timelinePosition === timelinePosition &&
				cached.getSelectableOutlines === currentGetSelectableOutlines
			) {
				return cached.selectableOutlines;
			}

			const selectableOutlines = currentGetSelectableOutlines(timelinePosition);
			selectableOutlinesCacheRef.current = {
				getSelectableOutlines: currentGetSelectableOutlines,
				selectableOutlines,
				timelinePosition,
			};
			return selectableOutlines;
		},
		[],
	);
	const getLatestOutlineTargetByKey = useCallback(
		(key: string) => {
			const timelinePosition = getCurrentFrame();
			const target = calculateOutlineTargetsForCurrentState({
				mode: 'controls',
				runtimeValuesByStore: new Map(),
				selectableOutlines: getSelectableOutlinesAtFrame(timelinePosition),
				targetKey: key,
				targetTimelinePosition: timelinePosition,
			})[0];
			return target as SelectedOutlineTarget | undefined;
		},
		[
			calculateOutlineTargetsForCurrentState,
			getCurrentFrame,
			getSelectableOutlinesAtFrame,
		],
	);
	const getAllDragTargets = useCallback((): SelectedOutlineDragTarget[] => {
		// Selected layers can be outside the current frame and have no mounted DOM.
		// Only outline measurement and snapping need to be restricted to visible layers.
		const selectedKeys = getSequenceKeysContainingSelection(
			currentSelection.current.selectedItems,
		);
		if (selectedKeys.size === 0) {
			return [];
		}

		const selectableOutlines = getSelectableOutlines(null).filter(({key}) =>
			selectedKeys.has(key),
		);
		const targets = calculateOutlineTargetsForCurrentState({
			mode: 'controls',
			runtimeValuesByStore: new Map(),
			selectableOutlines,
			targetKey: null,
			targetTimelinePosition: getCurrentFrame(),
		}) as SelectedOutlineTarget[];
		const dragTargets = new Map<string, SelectedOutlineDragTarget>();
		for (const {drag} of targets) {
			if (drag === null) {
				continue;
			}

			const sourceNodeKey = Internals.makeSequencePropsSubscriptionKey(
				drag.nodePath,
			);
			if (!dragTargets.has(sourceNodeKey)) {
				dragTargets.set(sourceNodeKey, drag);
			}
		}

		return [...dragTargets.values()];
	}, [
		calculateOutlineTargetsForCurrentState,
		currentSelection,
		getCurrentFrame,
		getSelectableOutlines,
	]);
	const onDraggingChange = useCallback(
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
	const {measurementActive, measureAllOutlines, hoveredTimelineNodePathKey} =
		getCanvasOutlineActivity({
			canvasHovered,
			dragging: draggingOutline,
			contextMenuOpen: canvasContextMenuOpen,
			hasSelection: sequenceKeysContainingSelection.size > 0,
			hoveredSequence,
		});
	useLayoutEffect(() => {
		if (measurementActive) {
			return;
		}

		setHoveredSequence((currentHover) =>
			currentHover?.source === 'canvas' ? null : currentHover,
		);
	}, [measurementActive, setHoveredSequence]);

	return (
		<>
			<SelectedOutlineKeyboardControls getAllDragTargets={getAllDragTargets} />
			{measurementActive ? (
				<ActiveSelectedOutlineOverlay
					calculateOutlineTargetsForCurrentState={
						calculateOutlineTargetsForCurrentState
					}
					compositionHeight={compositionHeight}
					compositionWidth={compositionWidth}
					draggingOutline={draggingOutline}
					getAllDragTargets={getAllDragTargets}
					getLatestOutlineTargetByKey={getLatestOutlineTargetByKey}
					getSelectableOutlines={getSelectableOutlines}
					hoveredTimelineNodePathKey={hoveredTimelineNodePathKey}
					measureAllOutlines={measureAllOutlines}
					onDraggingChange={onDraggingChange}
					onContextMenuOpenChange={setCanvasContextMenuOpen}
					onSelect={selectOutlineItem}
					scale={scale}
					selectedSequenceKeys={selectedSequenceKeys}
					sequenceKeysContainingSelection={sequenceKeysContainingSelection}
					sequences={sequences}
					translationX={translationX}
					translationY={translationY}
				/>
			) : null}
		</>
	);
};

export const SelectedOutlineOverlay = React.memo(
	SelectedOutlineOverlayUnmemoized,
);
