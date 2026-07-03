import {
	optimisticUpdateForPropStatuses,
	type SaveSequencePropSourceEdit,
} from '@remotion/studio-shared';
import type {
	CanUpdateSequencePropsResponse,
	SequencePropsSubscriptionKey,
	InteractivitySchema,
} from 'remotion';
import {callApi} from '../call-api';
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
	setPropStatuses,
	clientId,
	undoLabel,
	redoLabel,
}: SaveSequencePropsOptions): Promise<void> => {
	if (changes.length === 0) {
		return Promise.resolve();
	}

	if (changes.length === 1) {
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
					clientId,
					undoLabel,
					redoLabel,
				}),
			errorLabel: 'Could not save sequence prop',
		});
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
		clientId,
		undoLabel,
		redoLabel,
	}).then(() => undefined);
};
