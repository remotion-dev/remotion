import {optimisticUpdateForCodeValues} from '@remotion/studio-shared';
import type {
	CanUpdateSequencePropsResponse,
	SequencePropsSubscriptionKey,
	SequenceSchema,
} from 'remotion';
import {callApi} from '../call-api';
import {enqueueSavePropChange} from './save-prop-queue';

export type SetCodeValues = (
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
	schema: SequenceSchema;
};

export const saveSequenceProps = ({
	changes,
	setCodeValues,
	clientId,
	undoLabel,
	redoLabel,
}: {
	changes: SaveSequencePropChange[];
	setCodeValues: SetCodeValues;
	clientId: string;
	undoLabel: string | null;
	redoLabel: string | null;
}): Promise<void> => {
	if (changes.length === 0) {
		return Promise.resolve();
	}

	for (const change of changes) {
		setCodeValues(change.nodePath, (prev) =>
			optimisticUpdateForCodeValues({
				previous: prev,
				fieldKey: change.fieldKey,
				value: change.value,
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
				value: JSON.stringify(change.value),
				defaultValue: change.defaultValue,
				schema: change.schema,
			};
		}),
		clientId,
		undoLabel,
		redoLabel,
	}).then(() => undefined);
};

export const saveSequenceProp = ({
	fileName,
	nodePath,
	fieldKey,
	value,
	defaultValue,
	schema,
	setCodeValues,
	clientId,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	value: unknown;
	defaultValue: string | null;
	schema: SequenceSchema;
	setCodeValues: SetCodeValues;
	clientId: string;
}): Promise<void> => {
	return enqueueSavePropChange({
		nodePath,
		setCodeValues,
		applyOptimistic: (prev) =>
			optimisticUpdateForCodeValues({
				previous: prev,
				fieldKey,
				value,
				schema,
			}),
		apiCall: () =>
			callApi('/api/save-sequence-props', {
				edits: [
					{
						fileName,
						nodePath,
						key: fieldKey,
						value: JSON.stringify(value),
						defaultValue,
						schema,
					},
				],
				clientId,
				undoLabel: null,
				redoLabel: null,
			}),
		errorLabel: 'Could not save sequence prop',
	});
};
