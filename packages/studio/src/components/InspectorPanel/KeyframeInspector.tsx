import React, {useContext, useMemo} from 'react';
import type {
	CanUpdateSequencePropStatusKeyframed,
	InteractivitySchema,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {
	getEffectFieldsToShow,
	getFieldsToShow,
	type EffectSchemaFieldInfo,
	type SchemaFieldInfo,
} from '../../helpers/timeline-layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {parseKeyframeFieldFromNodePath} from '../Timeline/parse-keyframe-field-from-node-path';
import {TimelineEffectPropValue} from '../Timeline/TimelineEffectPropItem';
import type {TimelineSelection} from '../Timeline/TimelineSelection';
import {TimelineSequenceKeyframedValue} from '../Timeline/TimelineSequencePropItem';
import {
	InspectorDetailRow,
	InspectorMessage,
	InspectorSectionHeader,
} from './common';
import {
	detailsContainer,
	keyframeEditorLabel,
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
			readonly sourceFrame: number;
	  }
	| {
			readonly type: 'effect';
			readonly field: EffectSchemaFieldInfo;
			readonly fieldLabel: string;
			readonly nodePath: SequencePropsSubscriptionKey;
			readonly sourceFrame: number;
			readonly validatedLocation: CodePosition;
	  };

export const KeyframeInspector: React.FC<{
	readonly selection: Extract<TimelineSelection, {type: 'keyframe'}>;
}> = ({selection}) => {
	const track = useTrackForSelection(selection);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);

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
			field: effectField,
			fieldLabel: effectField.description ?? effectField.key,
			nodePath,
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

	if (details === null) {
		return <InspectorMessage>Keyframe unavailable</InspectorMessage>;
	}

	return (
		<div style={selectedContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<InspectorSectionHeader>Keyframe</InspectorSectionHeader>
			<div style={detailsContainer}>
				<InspectorDetailRow label="Frame">{selection.frame}</InspectorDetailRow>
				<div style={keyframeEditorRow}>
					<div style={keyframeEditorLabel}>{details.fieldLabel}</div>
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
				</div>
			</div>
		</div>
	);
};
