import {
	optimisticAddSequenceKeyframe,
	optimisticUpdateForPropStatuses,
	type SaveSequencePropSourceEdit,
} from '@remotion/studio-shared';
import type {
	CanUpdateSequencePropsResponse,
	SequencePropsSubscriptionKey,
	InteractivitySchema,
} from 'remotion';
import {callApi} from '../call-api';
import type {AddSequenceKeyframeChange} from './call-add-keyframe';
import {
	applyOptimisticKeyframeMoves,
	type MoveEffectKeyframeChange,
	type MoveSequenceKeyframeChange,
} from './call-move-keyframe';
import {enqueueSavePropChange} from './save-prop-queue';

export type SetPropStatuses = (
	nodePath: SequencePropsSubscriptionKey,
	values: (
		prev: CanUpdateSequencePropsResponse,
	) => CanUpdateSequencePropsResponse,
) => void;

export type SaveSequencePropChange = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	value: unknown;
	defaultValue: string | null;
	schema: InteractivitySchema;
	sourceEdit?: SaveSequencePropSourceEdit;
};

type SaveSequencePropsOptions = {
	changes: SaveSequencePropChange[];
	addedKeyframes: AddSequenceKeyframeChange[] | null;
	movedKeyframes: {
		sequenceKeyframes: MoveSequenceKeyframeChange[];
		effectKeyframes: MoveEffectKeyframeChange[];
	} | null;
	setPropStatuses: SetPropStatuses;
	clientId: string;
	undoLabel: string;
	redoLabel: string;
};

const serializeSequencePropValue = (value: unknown) => {
	if (value === undefined) {
		return {type: 'undefined' as const};
	}

	return {type: 'json' as const, serialized: JSON.stringify(value)};
};

export const saveSequenceProps = ({
	changes,
	addedKeyframes,
	movedKeyframes,
	setPropStatuses,
	clientId,
	undoLabel,
	redoLabel,
}: SaveSequencePropsOptions): Promise<void> => {
	const keyframesToAdd = addedKeyframes === null ? [] : addedKeyframes;
	const sequenceKeyframes =
		movedKeyframes === null ? [] : movedKeyframes.sequenceKeyframes;
	const effectKeyframes =
		movedKeyframes === null ? [] : movedKeyframes.effectKeyframes;
	if (
		changes.length === 0 &&
		keyframesToAdd.length === 0 &&
		sequenceKeyframes.length === 0 &&
		effectKeyframes.length === 0
	) {
		return Promise.resolve();
	}

	if (
		changes.length === 1 &&
		keyframesToAdd.length === 0 &&
		sequenceKeyframes.length === 0 &&
		effectKeyframes.length === 0
	) {
		const change = changes[0];
		if (change === undefined) {
			throw new Error('Expected a sequence prop change');
		}

		return enqueueSavePropChange({
			nodePath: change.nodePath,
			setPropStatuses,
			applyOptimistic: (prev) =>
				optimisticUpdateForPropStatuses({
					previous: prev,
					fieldKey: change.fieldKey,
					value: change.value,
					defaultValue: change.defaultValue,
					schema: change.schema,
				}),
			apiCall: () =>
				callApi('/api/save-sequence-props', {
					edits: [
						{
							fileName: change.fileName,
							nodePath: change.nodePath,
							key: change.fieldKey,
							value: serializeSequencePropValue(change.value),
							defaultValue: change.defaultValue,
							schema: change.schema,
							sourceEdit: change.sourceEdit ?? null,
						},
					],
					addedKeyframes: null,
					movedKeyframes: null,
					clientId,
					undoLabel,
					redoLabel,
				}),
			errorLabel: 'Could not save sequence prop',
		});
	}

	applyOptimisticKeyframeMoves({
		sequenceKeyframes,
		effectKeyframes,
		setPropStatuses,
	});

	for (const keyframe of keyframesToAdd) {
		setPropStatuses(keyframe.nodePath, (prev) =>
			optimisticAddSequenceKeyframe({
				previous: prev,
				fieldKey: keyframe.fieldKey,
				frame: keyframe.sourceFrame,
				value: keyframe.value,
				schema: keyframe.schema,
			}),
		);
	}

	for (const change of changes) {
		setPropStatuses(change.nodePath, (prev) =>
			optimisticUpdateForPropStatuses({
				previous: prev,
				fieldKey: change.fieldKey,
				value: change.value,
				defaultValue: change.defaultValue,
				schema: change.schema,
			}),
		);
	}

	return callApi('/api/save-sequence-props', {
		edits: changes.map((change) => {
			return {
				fileName: change.fileName,
				nodePath: change.nodePath,
				key: change.fieldKey,
				value: serializeSequencePropValue(change.value),
				defaultValue: change.defaultValue,
				schema: change.schema,
				sourceEdit: change.sourceEdit ?? null,
			};
		}),
		addedKeyframes:
			addedKeyframes === null
				? null
				: addedKeyframes.map((keyframe) => ({
						fileName: keyframe.fileName,
						nodePath: keyframe.nodePath,
						key: keyframe.fieldKey,
						frame: keyframe.sourceFrame,
						value: JSON.stringify(keyframe.value),
						schema: keyframe.schema,
					})),
		movedKeyframes:
			movedKeyframes === null
				? null
				: {
						sequenceKeyframes: sequenceKeyframes.map((keyframe) => ({
							fileName: keyframe.fileName,
							nodePath: keyframe.nodePath,
							key: keyframe.fieldKey,
							fromFrame: keyframe.fromFrame,
							toFrame: keyframe.toFrame,
							schema: keyframe.schema,
						})),
						effectKeyframes: effectKeyframes.map((keyframe) => ({
							fileName: keyframe.fileName,
							sequenceNodePath: keyframe.nodePath,
							effectIndex: keyframe.effectIndex,
							key: keyframe.fieldKey,
							fromFrame: keyframe.fromFrame,
							toFrame: keyframe.toFrame,
							schema: keyframe.schema,
						})),
					},
		clientId,
		undoLabel,
		redoLabel,
	}).then(() => undefined);
};
