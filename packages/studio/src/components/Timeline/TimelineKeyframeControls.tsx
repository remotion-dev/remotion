import {isSchemaFieldKeyframable} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusKeyframed,
	DragOverrideValue,
	GetDragOverrides,
	GetEffectDragOverrides,
	InteractivitySchema,
	PropStatuses,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals, useVideoConfig} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BLUE, LIGHT_GRAY, LIGHT_TEXT, WHITE} from '../../helpers/colors';
import type {
	SequenceNodePathInfo,
	TrackWithHash,
} from '../../helpers/get-timeline-sequence-sort-key';
import {
	buildTimelineTree,
	type TimelineTreeNode,
} from '../../helpers/timeline-layout';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';
import {
	callAddKeyframes,
	type AddEffectKeyframeChange,
	type AddSequenceKeyframeChange,
} from './call-add-keyframe';
import {
	callDeleteKeyframes,
	type DeleteEffectKeyframeChange,
	type DeleteSequenceKeyframeChange,
} from './call-delete-keyframe';
import {getEasingSelectionAfterKeyframeDelete} from './get-easing-selection-after-keyframe-delete';
import {
	getNextKeyframeDisplayFrame,
	getPreviousKeyframeDisplayFrame,
	hasKeyframeAtSourceFrame,
} from './get-keyframe-navigation';
import {getTimelineKeyframes} from './get-timeline-keyframes';
import {TimelineKeyframeDiamondIcon} from './TimelineKeyframeDiamondIcon';
import {useTimelineKeyframeTracks} from './TimelineKeyframeTracksContext';
import {
	getTimelineSelectionFromNodePathInfo,
	getTimelineSelectionKey,
	useTimelineSelection,
	type TimelineSelection,
} from './TimelineSelection';
import {canEditEasingForInterpolationFunction} from './update-selected-easing';

const controlsContainerStyle: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexShrink: 0,
	gap: 1,
	marginRight: 4,
};

const navButtonStyle: React.CSSProperties = {
	alignItems: 'center',
	background: 'none',
	border: 'none',
	color: WHITE,
	cursor: 'pointer',
	display: 'flex',
	flexShrink: 0,
	height: 14,
	justifyContent: 'center',
	lineHeight: 1,
	outline: 'none',
	padding: 0,
	userSelect: 'none',
	width: 14,
};

const isKeyframedStatus = (
	status: CanUpdateSequencePropStatus,
): status is CanUpdateSequencePropStatusKeyframed => {
	return status.status === 'keyframed';
};

const diamondButtonStyle: React.CSSProperties = {
	...navButtonStyle,
	background: 'none',
};

const svgStyle: React.CSSProperties = {display: 'block'};

type KeyframeControlTarget = {
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly fieldKey: string;
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly fileName: string;
	readonly keyframeDisplayOffset: number;
	readonly sourceFrame: number;
	readonly defaultValue: unknown;
	readonly dragOverrideValue: DragOverrideValue | undefined;
	readonly schema: InteractivitySchema;
	readonly effectIndex: number | null;
};

const isKeyframeControlSelection = (
	selection: TimelineSelection,
): selection is TimelineSelection & {
	readonly type: 'sequence-prop' | 'sequence-effect-prop';
} => {
	return (
		selection.type === 'sequence-prop' ||
		selection.type === 'sequence-effect-prop'
	);
};

export const getSelectedKeyframeControlNodePathInfos = ({
	clickedNodePathInfo,
	selectedItems,
}: {
	readonly clickedNodePathInfo: SequenceNodePathInfo;
	readonly selectedItems: readonly TimelineSelection[];
}): readonly SequenceNodePathInfo[] => {
	const clickedSelection =
		getTimelineSelectionFromNodePathInfo(clickedNodePathInfo);
	if (
		clickedSelection === null ||
		!isKeyframeControlSelection(clickedSelection)
	) {
		return [clickedNodePathInfo];
	}

	const clickedSelectionKey = getTimelineSelectionKey(clickedSelection);
	const selectedKeyframeControls = selectedItems.filter(
		isKeyframeControlSelection,
	);
	const clickedIsSelected = selectedKeyframeControls.some(
		(selection) => getTimelineSelectionKey(selection) === clickedSelectionKey,
	);

	if (!clickedIsSelected || selectedKeyframeControls.length <= 1) {
		return [clickedNodePathInfo];
	}

	return selectedKeyframeControls.map((selection) => selection.nodePathInfo);
};

const findFieldNode = (
	nodes: readonly TimelineTreeNode[],
	nodePathInfoKey: string,
): (TimelineTreeNode & {readonly kind: 'field'}) | null => {
	for (const node of nodes) {
		if (timelineNodePathInfoToKey(node.nodePathInfo) === nodePathInfoKey) {
			return node.kind === 'field' ? node : null;
		}

		if (node.kind === 'group') {
			const child = findFieldNode(node.children, nodePathInfoKey);
			if (child !== null) {
				return child;
			}
		}
	}

	return null;
};

const findTrackForNodePathInfo = ({
	tracks,
	nodePathInfo,
}: {
	readonly tracks: readonly TrackWithHash[];
	readonly nodePathInfo: SequenceNodePathInfo;
}): TrackWithHash | null => {
	return (
		tracks.find((track) => {
			if (track.nodePathInfo === null) {
				return false;
			}

			return (
				timelineNodePathInfoToKey({
					...track.nodePathInfo,
					auxiliaryKeys: [],
				}) ===
				timelineNodePathInfoToKey({
					...nodePathInfo,
					auxiliaryKeys: [],
				})
			);
		}) ?? null
	);
};

const resolveKeyframeControlTarget = ({
	nodePathInfo,
	tracks,
	propStatuses,
	getDragOverrides,
	getEffectDragOverrides,
	timelinePosition,
}: {
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly tracks: readonly TrackWithHash[];
	readonly propStatuses: PropStatuses;
	readonly getDragOverrides: GetDragOverrides;
	readonly getEffectDragOverrides: GetEffectDragOverrides;
	readonly timelinePosition: number;
}): KeyframeControlTarget | null => {
	const track = findTrackForNodePathInfo({tracks, nodePathInfo});
	if (
		track === null ||
		track.nodePathInfo === null ||
		!track.sequence.controls
	) {
		return null;
	}

	const tree = buildTimelineTree({
		sequence: track.sequence,
		nodePathInfo: track.nodePathInfo,
		getDragOverrides,
		getEffectDragOverrides,
		propStatuses,
		includeTextContent: false,
		includeSourceControls: false,
	});
	const fieldNode = findFieldNode(
		tree,
		timelineNodePathInfoToKey(nodePathInfo),
	);
	if (fieldNode === null || fieldNode.field === null) {
		return null;
	}

	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	if (fieldNode.field.kind === 'sequence-field') {
		const sequencePropStatuses = Internals.getPropStatusesCtx(
			propStatuses,
			nodePath,
		);
		const sequenceSelectedPropStatus =
			sequencePropStatuses?.[fieldNode.field.key] ?? null;
		if (sequenceSelectedPropStatus === null) {
			return null;
		}

		return {
			nodePathInfo,
			fieldKey: fieldNode.field.key,
			propStatus: sequenceSelectedPropStatus,
			nodePath,
			fileName: nodePath.absolutePath,
			keyframeDisplayOffset: track.keyframeDisplayOffset,
			sourceFrame: timelinePosition - track.keyframeDisplayOffset,
			defaultValue: fieldNode.field.fieldSchema.default,
			dragOverrideValue: (getDragOverrides(nodePath) ?? {})[
				fieldNode.field.key
			],
			schema: track.sequence.controls.schema,
			effectIndex: null,
		};
	}

	const effectStatus = Internals.getEffectPropStatusesCtx({
		propStatuses,
		nodePath,
		effectIndex: fieldNode.field.effectIndex,
	});
	const effectSelectedPropStatus =
		effectStatus.type === 'can-update-effect'
			? (effectStatus.props?.[fieldNode.field.key] ?? null)
			: null;
	if (effectSelectedPropStatus === null) {
		return null;
	}

	return {
		nodePathInfo,
		fieldKey: fieldNode.field.key,
		propStatus: effectSelectedPropStatus,
		nodePath,
		fileName: nodePath.absolutePath,
		keyframeDisplayOffset: track.keyframeDisplayOffset,
		sourceFrame: timelinePosition - track.keyframeDisplayOffset,
		defaultValue: fieldNode.field.fieldSchema.default,
		dragOverrideValue: getEffectDragOverrides(
			nodePath,
			fieldNode.field.effectIndex,
		)[fieldNode.field.key],
		schema: fieldNode.field.effectSchema,
		effectIndex: fieldNode.field.effectIndex,
	};
};

const hasTargetKeyframeAtCurrentFrame = (target: KeyframeControlTarget) => {
	if (!isKeyframedStatus(target.propStatus)) {
		return false;
	}

	return hasKeyframeAtSourceFrame(
		target.propStatus.keyframes,
		target.sourceFrame,
	);
};

const getAddChange = (
	target: KeyframeControlTarget,
): AddSequenceKeyframeChange | AddEffectKeyframeChange | null => {
	if (
		target.propStatus.status === 'computed' ||
		!isSchemaFieldKeyframable({schema: target.schema, key: target.fieldKey}) ||
		hasTargetKeyframeAtCurrentFrame(target)
	) {
		return null;
	}

	const value = getCurrentKeyframeValue({
		propStatus: target.propStatus,
		jsxFrame: target.sourceFrame,
		defaultValue: target.defaultValue,
		dragOverrideValue: target.dragOverrideValue,
	});
	if (value === null) {
		return null;
	}

	const change = {
		fileName: target.fileName,
		nodePath: target.nodePath,
		fieldKey: target.fieldKey,
		sourceFrame: target.sourceFrame,
		value,
		schema: target.schema,
	};

	if (target.effectIndex === null) {
		return change;
	}

	return {
		...change,
		effectIndex: target.effectIndex,
	};
};

const getDeleteChange = (
	target: KeyframeControlTarget,
): DeleteSequenceKeyframeChange | DeleteEffectKeyframeChange | null => {
	if (!hasTargetKeyframeAtCurrentFrame(target)) {
		return null;
	}

	const change = {
		fileName: target.fileName,
		nodePath: target.nodePath,
		fieldKey: target.fieldKey,
		sourceFrame: target.sourceFrame,
		schema: target.schema,
	};

	if (target.effectIndex === null) {
		return change;
	}

	return {
		...change,
		effectIndex: target.effectIndex,
	};
};

const hasEffectIndex = <T extends object>(
	change: T,
): change is T & {readonly effectIndex: number} => {
	return 'effectIndex' in change;
};

function getCurrentKeyframeValue({
	propStatus,
	jsxFrame,
	defaultValue,
	dragOverrideValue,
}: {
	propStatus: CanUpdateSequencePropStatus;
	jsxFrame: number;
	defaultValue: unknown;
	dragOverrideValue: DragOverrideValue | undefined;
}): unknown | null {
	if (isKeyframedStatus(propStatus)) {
		return Internals.getEffectiveVisualModeValue({
			propStatus,
			dragOverrideValue,
			frame: jsxFrame,
			defaultValue,
			shouldResortToDefaultValueIfUndefined: true,
		});
	}

	if (propStatus.status === 'static') {
		return Internals.getEffectiveVisualModeValue({
			propStatus,
			dragOverrideValue,
			frame: jsxFrame,
			defaultValue,
			shouldResortToDefaultValueIfUndefined: true,
		});
	}

	return null;
}

export const shouldShowTimelineKeyframeControls = ({
	propStatus,
	selected,
	keyframable,
}: {
	propStatus: CanUpdateSequencePropStatus | null;
	selected: boolean;
	keyframable: boolean;
}): boolean => {
	if (propStatus === null) {
		return false;
	}

	if (!keyframable && !isKeyframedStatus(propStatus)) {
		return false;
	}

	if (selected) {
		return true;
	}

	return isKeyframedStatus(propStatus);
};

export type TimelineKeyframeControlsMode = 'timeline' | 'inspector';

export const shouldShowTimelineKeyframeNavigation = ({
	propStatus,
	selected,
}: {
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly selected: boolean;
}) => {
	if (selected) {
		return true;
	}

	return isKeyframedStatus(propStatus);
};

export const TimelineKeyframeControls: React.FC<{
	readonly fieldKey: string;
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly fileName: string;
	readonly keyframeDisplayOffset: number;
	readonly defaultValue: unknown;
	readonly dragOverrideValue: DragOverrideValue | undefined;
	readonly schema: InteractivitySchema;
	readonly effectIndex: number | null;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly mode?: TimelineKeyframeControlsMode;
}> = ({
	fieldKey,
	propStatus,
	nodePath,
	fileName,
	keyframeDisplayOffset,
	defaultValue,
	dragOverrideValue,
	schema,
	effectIndex,
	nodePathInfo,
	mode = 'timeline',
}) => {
	const videoConfig = useVideoConfig();
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const setFrame = Internals.useTimelineSetFrame();
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {selectedItems, selectItems} = useTimelineSelection();
	const tracks = useTimelineKeyframeTracks();

	const clientId =
		previewServerState.type === 'connected'
			? previewServerState.clientId
			: null;

	const jsxFrame = timelinePosition - keyframeDisplayOffset;
	const keyframes = useMemo(
		() => getTimelineKeyframes(propStatus, keyframeDisplayOffset),
		[propStatus, keyframeDisplayOffset],
	);

	const hasKeyframeAtCurrentFrame = useMemo(() => {
		if (!isKeyframedStatus(propStatus)) {
			return false;
		}

		return hasKeyframeAtSourceFrame(
			(propStatus as CanUpdateSequencePropStatusKeyframed).keyframes,
			jsxFrame,
		);
	}, [jsxFrame, propStatus]);

	const previousDisplayFrame = useMemo(
		() =>
			getPreviousKeyframeDisplayFrame(
				keyframes,
				timelinePosition,
				videoConfig.durationInFrames,
			),
		[keyframes, timelinePosition, videoConfig.durationInFrames],
	);
	const nextDisplayFrame = useMemo(
		() =>
			getNextKeyframeDisplayFrame(
				keyframes,
				timelinePosition,
				videoConfig.durationInFrames,
			),
		[keyframes, timelinePosition, videoConfig.durationInFrames],
	);
	const propertySelected = useMemo(() => {
		const propertySelection =
			getTimelineSelectionFromNodePathInfo(nodePathInfo);
		if (propertySelection === null) {
			return false;
		}

		const propertySelectionKey = getTimelineSelectionKey(propertySelection);
		return selectedItems.some(
			(selection) =>
				getTimelineSelectionKey(selection) === propertySelectionKey,
		);
	}, [nodePathInfo, selectedItems]);
	const showNavigationButtons = shouldShowTimelineKeyframeNavigation({
		propStatus,
		selected: propertySelected,
	});

	const keyframable = isSchemaFieldKeyframable({
		schema,
		key: fieldKey,
	});
	const canAddKeyframe = keyframable;
	const canToggleKeyframe =
		propStatus.status !== 'computed' &&
		(hasKeyframeAtCurrentFrame || canAddKeyframe);

	const selectedNodePathInfos = useMemo(
		() =>
			getSelectedKeyframeControlNodePathInfos({
				clickedNodePathInfo: nodePathInfo,
				selectedItems,
			}),
		[nodePathInfo, selectedItems],
	);

	const clickedTarget = useMemo(
		(): KeyframeControlTarget => ({
			nodePathInfo,
			fieldKey,
			propStatus,
			nodePath,
			fileName,
			keyframeDisplayOffset,
			sourceFrame: jsxFrame,
			defaultValue,
			dragOverrideValue,
			schema,
			effectIndex,
		}),
		[
			defaultValue,
			dragOverrideValue,
			effectIndex,
			fieldKey,
			fileName,
			jsxFrame,
			keyframeDisplayOffset,
			nodePath,
			nodePathInfo,
			propStatus,
			schema,
		],
	);

	const keyframeToggleTargets = useMemo((): KeyframeControlTarget[] => {
		const clickedNodePathInfoKey = timelineNodePathInfoToKey(nodePathInfo);
		return selectedNodePathInfos.flatMap((selectedNodePathInfo) => {
			if (
				timelineNodePathInfoToKey(selectedNodePathInfo) ===
				clickedNodePathInfoKey
			) {
				return [clickedTarget];
			}

			const target = resolveKeyframeControlTarget({
				nodePathInfo: selectedNodePathInfo,
				tracks,
				propStatuses,
				getDragOverrides,
				getEffectDragOverrides,
				timelinePosition,
			});

			return target === null ? [] : [target];
		});
	}, [
		clickedTarget,
		getDragOverrides,
		getEffectDragOverrides,
		nodePathInfo,
		propStatuses,
		selectedNodePathInfos,
		timelinePosition,
		tracks,
	]);

	const seekToDisplayFrame = useCallback(
		(frame: number) => {
			setFrame((current) => {
				const next = {...current, [videoConfig.id]: frame};
				Internals.persistCurrentFrame(next);
				return next;
			});
		},
		[setFrame, videoConfig.id],
	);

	const onPrevious = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			if (previousDisplayFrame !== null) {
				seekToDisplayFrame(previousDisplayFrame);
			}
		},
		[previousDisplayFrame, seekToDisplayFrame],
	);

	const onNext = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			if (nextDisplayFrame !== null) {
				seekToDisplayFrame(nextDisplayFrame);
			}
		},
		[nextDisplayFrame, seekToDisplayFrame],
	);

	const onToggleKeyframe = useCallback(
		async (e: React.PointerEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			if (!clientId || !canToggleKeyframe) {
				return;
			}

			if (hasKeyframeAtCurrentFrame) {
				const deleteTargets = keyframeToggleTargets.flatMap((target) => {
					const change = getDeleteChange(target);
					return change === null ? [] : [{target, change}];
				});
				const singleDeleteTarget = deleteTargets[0];
				const easingSelection =
					deleteTargets.length === 1 &&
					singleDeleteTarget &&
					isKeyframedStatus(singleDeleteTarget.target.propStatus) &&
					canEditEasingForInterpolationFunction(
						singleDeleteTarget.target.propStatus.interpolationFunction,
					)
						? getEasingSelectionAfterKeyframeDelete({
								deletedSourceFrames: [singleDeleteTarget.target.sourceFrame],
								keyframeDisplayOffset:
									singleDeleteTarget.target.keyframeDisplayOffset,
								nodePathInfo: singleDeleteTarget.target.nodePathInfo,
								propStatus: singleDeleteTarget.target.propStatus,
								timelinePosition,
							})
						: null;
				const deleteChanges = deleteTargets.map(({change}) => change);
				await callDeleteKeyframes({
					sequenceKeyframes: deleteChanges.filter(
						(change): change is DeleteSequenceKeyframeChange =>
							!hasEffectIndex(change),
					),
					effectKeyframes: deleteChanges.filter(
						(change): change is DeleteEffectKeyframeChange =>
							hasEffectIndex(change),
					),
					setPropStatuses,
					clientId,
				});
				if (mode === 'timeline' && easingSelection !== null) {
					selectItems([easingSelection], {reveal: true});
				}

				return;
			}

			const addChanges = keyframeToggleTargets.flatMap((target) => {
				const change = getAddChange(target);
				return change === null ? [] : [{target, change}];
			});
			if (addChanges.length === 0) {
				return;
			}

			const addChangeValues = addChanges.map(({change}) => change);
			await callAddKeyframes({
				sequenceKeyframes: addChangeValues.filter(
					(change): change is AddSequenceKeyframeChange =>
						!hasEffectIndex(change),
				),
				effectKeyframes: addChangeValues.filter(
					(change): change is AddEffectKeyframeChange => hasEffectIndex(change),
				),
				setPropStatuses,
				clientId,
			});
			if (mode === 'timeline') {
				selectItems(
					addChanges.map(({target}) => ({
						type: 'keyframe' as const,
						nodePathInfo: target.nodePathInfo,
						frame: target.sourceFrame + target.keyframeDisplayOffset,
					})),
					{reveal: true},
				);
			}
		},
		[
			canToggleKeyframe,
			clientId,
			hasKeyframeAtCurrentFrame,
			keyframeToggleTargets,
			mode,
			selectItems,
			setPropStatuses,
			timelinePosition,
		],
	);

	const previousDisabled = previousDisplayFrame === null;
	const nextDisabled = nextDisplayFrame === null;

	const previousStyle = useMemo(
		(): React.CSSProperties => ({
			...navButtonStyle,
			cursor: previousDisabled ? 'default' : 'pointer',
			opacity: previousDisabled ? 0.35 : 1,
			visibility: showNavigationButtons ? 'visible' : 'hidden',
		}),
		[previousDisabled, showNavigationButtons],
	);

	const nextStyle = useMemo(
		(): React.CSSProperties => ({
			...navButtonStyle,
			cursor: nextDisabled ? 'default' : 'pointer',
			opacity: nextDisabled ? 0.35 : 1,
			visibility: showNavigationButtons ? 'visible' : 'hidden',
		}),
		[nextDisabled, showNavigationButtons],
	);

	const diamondStyle = useMemo(
		(): React.CSSProperties => ({
			...diamondButtonStyle,
			cursor: canToggleKeyframe && clientId ? 'pointer' : 'default',
			opacity: canToggleKeyframe && clientId ? 1 : 0.35,
		}),
		[canToggleKeyframe, clientId],
	);

	const diamondColor = hasKeyframeAtCurrentFrame ? BLUE : LIGHT_TEXT;

	return (
		<div style={controlsContainerStyle}>
			<button
				type="button"
				style={previousStyle}
				disabled={previousDisabled}
				onPointerDown={previousDisabled ? undefined : onPrevious}
				aria-label="Go to previous keyframe"
				title="Previous keyframe"
			>
				<svg width="14" height="14" viewBox="0 0 10 10" style={svgStyle}>
					<path d="M7 1.5L3 5L7 8.5Z" fill={LIGHT_GRAY} />
				</svg>
			</button>
			<button
				type="button"
				style={diamondStyle}
				disabled={!canToggleKeyframe || !clientId}
				onPointerDown={
					canToggleKeyframe && clientId ? onToggleKeyframe : undefined
				}
				aria-label={
					hasKeyframeAtCurrentFrame ? 'Remove keyframe' : 'Add keyframe'
				}
				title={hasKeyframeAtCurrentFrame ? 'Remove keyframe' : 'Add keyframe'}
			>
				<TimelineKeyframeDiamondIcon color={diamondColor} size={12} />
			</button>
			<button
				type="button"
				style={nextStyle}
				disabled={nextDisabled}
				onPointerDown={nextDisabled ? undefined : onNext}
				aria-label="Go to next keyframe"
				title="Next keyframe"
			>
				<svg width="14" height="14" viewBox="0 0 10 10" style={svgStyle}>
					<path d="M3 1.5L7 5L3 8.5Z" fill={LIGHT_GRAY} />
				</svg>
			</button>
		</div>
	);
};
