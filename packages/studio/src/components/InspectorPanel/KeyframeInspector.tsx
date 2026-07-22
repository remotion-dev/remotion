import {
	canMoveKeyframesWithoutCollisions,
	moveKeyframesInPropStatus,
} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import type {
	CanUpdateSequencePropStatusKeyframed,
	DragOverrideValue,
	InteractivitySchema,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals, useVideoConfig} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	getEffectFieldsToShow,
	getFieldsToShow,
	type EffectSchemaFieldInfo,
	type SchemaFieldInfo,
} from '../../helpers/timeline-layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {InputDragger} from '../NewComposition/InputDragger';
import {
	callDeleteEffectKeyframe,
	callDeleteSequenceKeyframe,
} from '../Timeline/call-delete-keyframe';
import {callMoveKeyframes} from '../Timeline/call-move-keyframe';
import {getEasingSelectionAfterKeyframeDelete} from '../Timeline/get-easing-selection-after-keyframe-delete';
import {parseKeyframeFieldFromNodePath} from '../Timeline/parse-keyframe-field-from-node-path';
import {TimelineEffectPropValue} from '../Timeline/TimelineEffectPropItem';
import {
	getTimelineSelectionFromNodePathInfo,
	useTimelineSelection,
	type TimelineSelection,
} from '../Timeline/TimelineSelection';
import {TimelineSequenceKeyframedValue} from '../Timeline/TimelineSequencePropItem';
import {canEditEasingForInterpolationFunction} from '../Timeline/update-selected-easing';
import {
	InspectorActionSection,
	InspectorBackAction,
	InspectorDetailRow,
	InspectorInlineAction,
	InspectorMessage,
	InspectorSectionDivider,
} from './common';
import {
	clampInspectorKeyframeDisplayFrame,
	getInspectorKeyframeSourceFrame,
} from './keyframe-inspector-frame';
import {KeyframeEasingNavigator} from './KeyframeEasingNavigator';
import {SequenceInspectorSections} from './SequenceInspectorHeader';
import {
	detailsBeforeInlineAction,
	detailsWithInlineAction,
	keyframeEditorRow,
	keyframeEditorValue,
	selectedContainer,
} from './styles';
import {useTrackForSelection} from './use-track-for-selection';

type KeyframeEditorDetails =
	| {
			readonly type: 'sequence';
			readonly field: SchemaFieldInfo;
			readonly fieldLabel: string;
			readonly fileName: string;
			readonly nodePath: SequencePropsSubscriptionKey;
			readonly propStatus: CanUpdateSequencePropStatusKeyframed;
			readonly schema: InteractivitySchema;
			readonly keyframeDisplayOffset: number;
			readonly sourceFrame: number;
	  }
	| {
			readonly type: 'effect';
			readonly effectIndex: number;
			readonly field: EffectSchemaFieldInfo;
			readonly fieldLabel: string;
			readonly fileName: string;
			readonly nodePath: SequencePropsSubscriptionKey;
			readonly propStatus: CanUpdateSequencePropStatusKeyframed;
			readonly schema: InteractivitySchema;
			readonly keyframeDisplayOffset: number;
			readonly sourceFrame: number;
			readonly validatedLocation: CodePosition;
	  };

const makeMovedKeyframedDragOverride = ({
	details,
	toFrame,
}: {
	readonly details: KeyframeEditorDetails;
	readonly toFrame: number;
}): DragOverrideValue | null => {
	if (
		!canMoveKeyframesWithoutCollisions({
			status: details.propStatus,
			moves: [{fromFrame: details.sourceFrame, toFrame}],
		})
	) {
		return null;
	}

	const movedStatus = moveKeyframesInPropStatus({
		status: details.propStatus,
		moves: [{fromFrame: details.sourceFrame, toFrame}],
	});

	if (movedStatus.status !== 'keyframed') {
		return null;
	}

	return {
		type: 'keyframed',
		status: movedStatus,
	};
};

const removeKeyframeIcon: React.CSSProperties = {
	display: 'block',
	flexShrink: 0,
	height: 16,
	width: 16,
};

const TrashIcon: React.FC<{readonly color: string}> = ({color}) => {
	return (
		<svg viewBox="0 0 448 512" style={removeKeyframeIcon}>
			<path
				fill={color}
				d="M160.5 27.4c2-6.8 8.3-11.4 15.3-11.4l96.4 0c7.1 0 13.3 4.6 15.3 11.4l11 36.6-149 0 11-36.6zM116.1 64L16 64C7.2 64 0 71.2 0 80S7.2 96 16 96l416 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-100.1 0-13.7-45.8C312.1-2.1 293.4-16 272.2-16l-96.4 0c-21.2 0-39.9 13.9-46 34.2L116.1 64zM28.7 144L51.6 452.7c2.5 33.4 30.3 59.3 63.8 59.3l217.1 0c33.5 0 61.3-25.9 63.8-59.3l22.9-308.7-32.1 0-22.7 306.4c-1.2 16.7-15.2 29.6-31.9 29.6l-217.1 0c-16.8 0-30.7-12.9-31.9-29.6L60.8 144 28.7 144z"
			/>
		</svg>
	);
};

export const KeyframeInspector: React.FC<{
	readonly selection: Extract<TimelineSelection, {type: 'keyframe'}>;
}> = ({selection}) => {
	const track = useTrackForSelection(selection);
	const videoConfig = useVideoConfig();
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {
		clearDragOverrides,
		clearEffectDragOverrides,
		setDragOverrides,
		setEffectDragOverrides,
		setPropStatuses,
	} = useContext(Internals.VisualModeSettersContext);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {selectItems} = useTimelineSelection();
	const [draftFrame, setDraftFrame] = useState(selection.frame);
	const parentSelection = useMemo(
		() => getTimelineSelectionFromNodePathInfo(selection.nodePathInfo),
		[selection.nodePathInfo],
	);

	useEffect(() => {
		setDraftFrame(selection.frame);
	}, [selection.frame]);

	const details = useMemo<KeyframeEditorDetails | null>(() => {
		if (!track || !track.sequence.controls) {
			return null;
		}

		const keyframeField = parseKeyframeFieldFromNodePath(
			selection.nodePathInfo.auxiliaryKeys,
		);
		if (keyframeField === null) {
			return null;
		}

		const nodePath = selection.nodePathInfo.sequenceSubscriptionKey;
		const {keyframeDisplayOffset} = track;
		const sourceFrame = selection.frame - keyframeDisplayOffset;

		if (keyframeField.type === 'sequence') {
			const sequenceFields = getFieldsToShow({
				schema: track.sequence.controls.schema,
				currentRuntimeValueDotNotation:
					track.sequence.controls.currentRuntimeValueDotNotation,
				getDragOverrides,
				propStatuses,
				nodePath,
				includeTextContent: false,
			});
			const sequenceField =
				sequenceFields?.find(
					(candidate) => candidate.key === keyframeField.fieldKey,
				) ?? null;
			const sequencePropStatus =
				Internals.getPropStatusesCtx(propStatuses, nodePath)?.[
					keyframeField.fieldKey
				] ?? null;

			if (!sequenceField || sequencePropStatus?.status !== 'keyframed') {
				return null;
			}

			return {
				type: 'sequence',
				field: sequenceField,
				fieldLabel: sequenceField.description ?? sequenceField.key,
				fileName: nodePath.absolutePath,
				keyframeDisplayOffset,
				nodePath,
				propStatus: sequencePropStatus,
				schema: track.sequence.controls.schema,
				sourceFrame,
			};
		}

		const effect = track.sequence.effects[keyframeField.effectIndex];
		if (!effect) {
			return null;
		}

		const effectFields = getEffectFieldsToShow({
			effect,
			effectIndex: keyframeField.effectIndex,
			nodePath,
			propStatuses,
			getEffectDragOverrides,
		});
		const effectField =
			effectFields.find(
				(candidate) => candidate.key === keyframeField.fieldKey,
			) ?? null;
		const effectStatus = Internals.getEffectPropStatusesCtx({
			propStatuses,
			nodePath,
			effectIndex: keyframeField.effectIndex,
		});
		const effectPropStatus =
			effectStatus.type === 'can-update-effect'
				? (effectStatus.props[keyframeField.fieldKey] ?? null)
				: null;

		if (!effectField || effectPropStatus?.status !== 'keyframed') {
			return null;
		}

		return {
			type: 'effect',
			effectIndex: keyframeField.effectIndex,
			field: effectField,
			fieldLabel: effectField.description ?? effectField.key,
			fileName: nodePath.absolutePath,
			keyframeDisplayOffset,
			nodePath,
			propStatus: effectPropStatus,
			schema: effect.schema,
			sourceFrame,
			validatedLocation: {
				source: nodePath.absolutePath,
				line: 1,
				column: 0,
			},
		};
	}, [
		getDragOverrides,
		getEffectDragOverrides,
		propStatuses,
		selection,
		track,
	]);

	const clearFrameDragOverride = useCallback(
		(detailsToClear: KeyframeEditorDetails | null) => {
			if (detailsToClear === null) {
				return;
			}

			if (detailsToClear.type === 'sequence') {
				clearDragOverrides(detailsToClear.nodePath);
				return;
			}

			clearEffectDragOverrides(
				detailsToClear.nodePath,
				detailsToClear.effectIndex,
			);
		},
		[clearDragOverrides, clearEffectDragOverrides],
	);

	const onFrameChange = useCallback(
		(value: number) => {
			const displayFrame = clampInspectorKeyframeDisplayFrame({
				durationInFrames: videoConfig.durationInFrames,
				frame: value,
			});

			setDraftFrame(displayFrame);

			if (details === null) {
				return;
			}

			const toFrame = getInspectorKeyframeSourceFrame({
				displayFrame,
				keyframeDisplayOffset: details.keyframeDisplayOffset,
			});

			if (displayFrame === selection.frame || toFrame === details.sourceFrame) {
				clearFrameDragOverride(details);
				return;
			}

			const dragOverrideValue = makeMovedKeyframedDragOverride({
				details,
				toFrame,
			});

			if (dragOverrideValue === null) {
				clearFrameDragOverride(details);
				return;
			}

			if (details.type === 'sequence') {
				setDragOverrides(
					details.nodePath,
					details.field.key,
					dragOverrideValue,
				);
				return;
			}

			setEffectDragOverrides(
				details.nodePath,
				details.effectIndex,
				details.field.key,
				dragOverrideValue,
			);
		},
		[
			clearFrameDragOverride,
			details,
			selection.frame,
			setDragOverrides,
			setEffectDragOverrides,
			videoConfig.durationInFrames,
		],
	);

	const onFrameChangeEnd = useCallback(
		(value: number) => {
			if (details === null || previewServerState.type !== 'connected') {
				clearFrameDragOverride(details);
				setDraftFrame(selection.frame);
				return;
			}

			const displayFrame = clampInspectorKeyframeDisplayFrame({
				durationInFrames: videoConfig.durationInFrames,
				frame: value,
			});
			const toFrame = getInspectorKeyframeSourceFrame({
				displayFrame,
				keyframeDisplayOffset: details.keyframeDisplayOffset,
			});

			setDraftFrame(displayFrame);
			clearFrameDragOverride(details);

			if (displayFrame === selection.frame || toFrame === details.sourceFrame) {
				return;
			}

			if (makeMovedKeyframedDragOverride({details, toFrame}) === null) {
				setDraftFrame(selection.frame);
				return;
			}

			selectItems(
				[
					{
						...selection,
						frame: displayFrame,
					},
				],
				{reveal: true},
			);

			const move = {
				fileName: details.fileName,
				nodePath: details.nodePath,
				fieldKey: details.field.key,
				fromFrame: details.sourceFrame,
				toFrame,
				schema: details.schema,
			};

			callMoveKeyframes({
				sequenceKeyframes: details.type === 'sequence' ? [move] : [],
				effectKeyframes:
					details.type === 'effect'
						? [
								{
									...move,
									effectIndex: details.effectIndex,
								},
							]
						: [],
				setPropStatuses,
				clientId: previewServerState.clientId,
			}).catch(() => undefined);
		},
		[
			clearFrameDragOverride,
			details,
			previewServerState,
			selection,
			selectItems,
			setPropStatuses,
			videoConfig.durationInFrames,
		],
	);

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

	const removeDisabled = previewServerState.type !== 'connected';
	const onRemoveKeyframe = useCallback<
		React.MouseEventHandler<HTMLButtonElement>
	>(
		(event) => {
			event.stopPropagation();
			if (details === null || previewServerState.type !== 'connected') {
				return;
			}

			const easingSelection = canEditEasingForInterpolationFunction(
				details.propStatus.interpolationFunction,
			)
				? getEasingSelectionAfterKeyframeDelete({
						deletedSourceFrames: [details.sourceFrame],
						keyframeDisplayOffset: details.keyframeDisplayOffset,
						nodePathInfo: selection.nodePathInfo,
						propStatus: details.propStatus,
						timelinePosition,
					})
				: null;
			if (easingSelection !== null) {
				selectItems([easingSelection], {reveal: true});
			} else if (parentSelection !== null) {
				selectItems([parentSelection], {reveal: true});
			}

			if (details.type === 'sequence') {
				callDeleteSequenceKeyframe({
					fileName: details.fileName,
					nodePath: details.nodePath,
					fieldKey: details.field.key,
					sourceFrame: details.sourceFrame,
					schema: details.schema,
					setPropStatuses,
					clientId: previewServerState.clientId,
				}).catch(() => undefined);
				return;
			}

			callDeleteEffectKeyframe({
				fileName: details.fileName,
				nodePath: details.nodePath,
				effectIndex: details.effectIndex,
				fieldKey: details.field.key,
				sourceFrame: details.sourceFrame,
				schema: details.schema,
				setPropStatuses,
				clientId: previewServerState.clientId,
			}).catch(() => undefined);
		},
		[
			details,
			parentSelection,
			previewServerState,
			selectItems,
			selection.nodePathInfo,
			setPropStatuses,
			timelinePosition,
		],
	);

	if (details === null || track === null) {
		return <InspectorMessage>Keyframe unavailable</InspectorMessage>;
	}

	return (
		<div style={selectedContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<SequenceInspectorSections track={track} />
			<InspectorSectionDivider />
			<InspectorBackAction
				disabled={parentSelection === null}
				onClick={onSelectParent}
				title="Back to property"
			>
				{details.fieldLabel}
			</InspectorBackAction>
			<InspectorSectionDivider />
			<KeyframeEasingNavigator
				currentSelection={selection}
				includeEasings={canEditEasingForInterpolationFunction(
					details.propStatus.interpolationFunction,
				)}
				keyframes={details.propStatus.keyframes.map((keyframe) => ({
					...keyframe,
					frame: keyframe.frame + details.keyframeDisplayOffset,
				}))}
				nodePathInfo={selection.nodePathInfo}
			/>
			<div style={detailsWithInlineAction}>
				<div style={detailsBeforeInlineAction}>
					<InspectorDetailRow label="Frame">
						<InputDragger
							type="number"
							value={draftFrame}
							status="ok"
							onValueChange={onFrameChange}
							onValueChangeEnd={onFrameChangeEnd}
							onTextChange={() => undefined}
							min={0}
							max={Math.max(0, videoConfig.durationInFrames - 1)}
							step={1}
							formatter={(value) => String(Math.round(Number(value)))}
							rightAlign
							small
						/>
					</InspectorDetailRow>
					<div style={keyframeEditorRow}>
						<InspectorDetailRow label={details.fieldLabel}>
							<div style={keyframeEditorValue}>
								{details.type === 'sequence' ? (
									<TimelineSequenceKeyframedValue
										field={details.field}
										fileName={details.fileName}
										nodePath={details.nodePath}
										schema={details.schema}
										propStatus={details.propStatus}
										sourceFrame={details.sourceFrame}
									/>
								) : (
									<TimelineEffectPropValue
										field={details.field}
										nodePath={details.nodePath}
										validatedLocation={details.validatedLocation}
										sourceFrame={details.sourceFrame}
									/>
								)}
							</div>
						</InspectorDetailRow>
					</div>
				</div>
				<InspectorActionSection>
					<InspectorInlineAction
						disabled={removeDisabled}
						onClick={onRemoveKeyframe}
						renderIcon={(color) => <TrashIcon color={color} />}
					>
						Remove keyframe
					</InspectorInlineAction>
				</InspectorActionSection>
			</div>
		</div>
	);
};
