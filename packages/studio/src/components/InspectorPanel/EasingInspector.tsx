import React, {useCallback, useContext, useMemo} from 'react';
import type {DragOverrideValue} from 'remotion';
import {Internals, useVideoConfig} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	getEffectFieldsToShow,
	getFieldsToShow,
} from '../../helpers/timeline-layout';
import {Plus} from '../../icons/plus';
import {renderFrame} from '../../state/render-frame';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {
	callAddEffectKeyframe,
	callAddSequenceKeyframe,
} from '../Timeline/call-add-keyframe';
import {EasingEditor} from '../Timeline/EasingEditorModal';
import {
	getTimelineSelectionFromNodePathInfo,
	getTimelineSelectionKey,
	useTimelineSelection,
} from '../Timeline/TimelineSelection';
import {
	getSelectedEasingUpdate,
	type EasingSelection,
} from '../Timeline/update-selected-easing';
import {
	InspectorBackHeaderWithDivider,
	InspectorInlineAction,
	InspectorMessage,
} from './common';
import {getEasingSelectionFromCurrentKeyframes} from './easing-inspector-selection';
import {KeyframeEasingNavigator} from './KeyframeEasingNavigator';
import {KeyframeSettings} from './KeyframeSettings';
import {SequenceInspectorHeaderWithDivider} from './SequenceInspectorHeader';
import {
	detailsContainer,
	inspectorSectionDivider,
	sectionHeaderTitle,
	selectedContainer,
} from './styles';
import {useTrackForSelection} from './use-track-for-selection';

type EasingInspectorDetails = {
	readonly defaultValue: unknown;
	readonly dragOverrideValue: DragOverrideValue | undefined;
	readonly fieldLabel: string;
};

const addKeyframeIcon: React.CSSProperties = {
	display: 'block',
	height: 13,
	width: 12,
};

export const EasingInspector: React.FC<{
	readonly selection: EasingSelection;
}> = ({selection}) => {
	const track = useTrackForSelection(selection);
	const videoConfig = useVideoConfig();
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const {sequences} = useContext(Internals.SequenceManager);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {selectItems} = useTimelineSelection();
	const parentSelection = useMemo(
		() => getTimelineSelectionFromNodePathInfo(selection.nodePathInfo),
		[selection.nodePathInfo],
	);

	const easingUpdate = useMemo(
		() =>
			getSelectedEasingUpdate({
				selection,
				sequences,
				overrideIdsToNodePaths: overrideIdToNodePathMappings,
				propStatuses,
			}),
		[overrideIdToNodePathMappings, propStatuses, selection, sequences],
	);
	const initialEasing = easingUpdate?.currentEasing ?? null;
	const easingDetails = useMemo<EasingInspectorDetails | null>(() => {
		if (easingUpdate === null || track === null) {
			return null;
		}

		if (easingUpdate.type === 'sequence') {
			const sequenceDragOverrideValue = (getDragOverrides(
				easingUpdate.nodePath,
			) ?? {})[easingUpdate.fieldKey];
			if (!track.sequence.controls) {
				return {
					defaultValue: undefined,
					dragOverrideValue: sequenceDragOverrideValue,
					fieldLabel: easingUpdate.fieldKey,
				};
			}

			const sequenceFields = getFieldsToShow({
				schema: track.sequence.controls.schema,
				currentRuntimeValueDotNotation:
					track.sequence.controls.currentRuntimeValueDotNotation,
				getDragOverrides,
				propStatuses,
				nodePath: easingUpdate.nodePath,
			});
			const sequenceField =
				sequenceFields?.find(
					(candidate) => candidate.key === easingUpdate.fieldKey,
				) ?? null;

			return {
				defaultValue: sequenceField?.fieldSchema.default,
				dragOverrideValue: sequenceDragOverrideValue,
				fieldLabel:
					sequenceField?.description ??
					sequenceField?.key ??
					easingUpdate.fieldKey,
			};
		}

		const effectDragOverrideValue = getEffectDragOverrides(
			easingUpdate.nodePath,
			easingUpdate.effectIndex,
		)[easingUpdate.fieldKey];
		const effect = track.sequence.effects[easingUpdate.effectIndex];
		if (!effect) {
			return {
				defaultValue: undefined,
				dragOverrideValue: effectDragOverrideValue,
				fieldLabel: easingUpdate.fieldKey,
			};
		}

		const effectFields = getEffectFieldsToShow({
			effect,
			effectIndex: easingUpdate.effectIndex,
			nodePath: easingUpdate.nodePath,
			propStatuses,
			getEffectDragOverrides,
		});
		const effectField =
			effectFields.find(
				(candidate) => candidate.key === easingUpdate.fieldKey,
			) ?? null;

		return {
			defaultValue: effectField?.fieldSchema.default,
			dragOverrideValue: effectDragOverrideValue,
			fieldLabel:
				effectField?.description ?? effectField?.key ?? easingUpdate.fieldKey,
		};
	}, [
		easingUpdate,
		getDragOverrides,
		getEffectDragOverrides,
		propStatuses,
		track,
	]);
	const fieldLabel = easingDetails?.fieldLabel ?? null;

	const currentEasingSelection = useMemo(() => {
		if (easingUpdate === null || track === null) {
			return null;
		}

		return getEasingSelectionFromCurrentKeyframes({
			keyframeDisplayOffset: track.keyframeDisplayOffset,
			nodePathInfo: selection.nodePathInfo,
			propStatus: easingUpdate.propStatus,
			segmentIndex: easingUpdate.segmentIndex,
		});
	}, [easingUpdate, selection.nodePathInfo, track]);

	const state = useMemo(() => {
		if (initialEasing === null || currentEasingSelection === null) {
			return null;
		}

		return {
			initialEasing,
			selections: [currentEasingSelection],
		};
	}, [currentEasingSelection, initialEasing]);

	const onSelectParent = useCallback<
		React.MouseEventHandler<HTMLButtonElement>
	>(
		(event) => {
			event.stopPropagation();
			if (parentSelection === null) {
				return;
			}

			selectItems([parentSelection], {reveal: true});
		},
		[parentSelection, selectItems],
	);

	const canAddKeyframeAtPlayhead =
		currentEasingSelection !== null &&
		timelinePosition > currentEasingSelection.fromFrame &&
		timelinePosition < currentEasingSelection.toFrame;
	const addKeyframeTime = renderFrame(timelinePosition, videoConfig.fps);
	const addKeyframeDisabled = previewServerState.type !== 'connected';
	const onAddKeyframeAtPlayhead = useCallback<
		React.MouseEventHandler<HTMLButtonElement>
	>(
		(event) => {
			event.stopPropagation();
			if (
				!canAddKeyframeAtPlayhead ||
				easingUpdate === null ||
				easingDetails === null ||
				track === null ||
				previewServerState.type !== 'connected'
			) {
				return;
			}

			const sourceFrame = timelinePosition - track.keyframeDisplayOffset;
			const value = Internals.getEffectiveVisualModeValue({
				propStatus: easingUpdate.propStatus,
				dragOverrideValue: easingDetails.dragOverrideValue,
				defaultValue: easingDetails.defaultValue,
				frame: sourceFrame,
				shouldResortToDefaultValueIfUndefined: true,
			});
			const keyframeSelection = {
				type: 'keyframe' as const,
				nodePathInfo: selection.nodePathInfo,
				frame: timelinePosition,
			};

			if (easingUpdate.type === 'sequence') {
				callAddSequenceKeyframe({
					fileName: easingUpdate.fileName,
					nodePath: easingUpdate.nodePath,
					fieldKey: easingUpdate.fieldKey,
					sourceFrame,
					value,
					schema: easingUpdate.schema,
					setPropStatuses,
					clientId: previewServerState.clientId,
				}).catch(() => undefined);
			} else {
				callAddEffectKeyframe({
					fileName: easingUpdate.fileName,
					nodePath: easingUpdate.nodePath,
					effectIndex: easingUpdate.effectIndex,
					fieldKey: easingUpdate.fieldKey,
					sourceFrame,
					value,
					schema: easingUpdate.schema,
					setPropStatuses,
					clientId: previewServerState.clientId,
				}).catch(() => undefined);
			}

			selectItems([keyframeSelection], {reveal: true});
		},
		[
			canAddKeyframeAtPlayhead,
			easingDetails,
			easingUpdate,
			previewServerState,
			selectItems,
			selection.nodePathInfo,
			setPropStatuses,
			timelinePosition,
			track,
		],
	);

	const renderHeader = useCallback(
		() => (
			<>
				<InspectorBackHeaderWithDivider
					disabled={parentSelection === null}
					onClick={onSelectParent}
					title="Back to property"
				>
					<div style={sectionHeaderTitle}>{fieldLabel}</div>
				</InspectorBackHeaderWithDivider>
				{easingUpdate === null || track === null ? null : (
					<KeyframeEasingNavigator
						currentSelection={currentEasingSelection ?? selection}
						includeEasings
						keyframes={easingUpdate.propStatus.keyframes.map((keyframe) => ({
							...keyframe,
							frame: keyframe.frame + track.keyframeDisplayOffset,
						}))}
						nodePathInfo={selection.nodePathInfo}
					/>
				)}
			</>
		),
		[
			currentEasingSelection,
			easingUpdate,
			fieldLabel,
			onSelectParent,
			parentSelection,
			selection,
			track,
		],
	);

	if (
		state === null ||
		track === null ||
		currentEasingSelection === null ||
		easingUpdate === null
	) {
		return <InspectorMessage>Easing unavailable</InspectorMessage>;
	}

	return (
		<div style={selectedContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<SequenceInspectorHeaderWithDivider track={track} />
			<EasingEditor
				key={getTimelineSelectionKey(currentEasingSelection)}
				state={state}
				renderHeader={renderHeader}
			/>
			<KeyframeSettings update={easingUpdate} />
			{canAddKeyframeAtPlayhead ? (
				<>
					<div style={inspectorSectionDivider} />
					<div style={detailsContainer}>
						<InspectorInlineAction
							disabled={addKeyframeDisabled}
							onClick={onAddKeyframeAtPlayhead}
							renderIcon={(color) => (
								<Plus color={color} style={addKeyframeIcon} />
							)}
						>
							{`Add keyframe at ${addKeyframeTime}`}
						</InspectorInlineAction>
					</div>
				</>
			) : null}
		</div>
	);
};
