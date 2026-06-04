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

type SaveSequencePropsOptions = {
	changes: SaveSequencePropChange[];
	setCodeValues: SetCodeValues;
	clientId: string;
	undoLabel: string;
	redoLabel: string;
};

export const saveSequenceProps = ({
	changes,
	setCodeValues,
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
			setCodeValues,
			applyOptimistic: (prev) =>
				optimisticUpdateForCodeValues({
					previous: prev,
					fieldKey: change.fieldKey,
					value: change.value,
					schema: change.schema,
				}),
			apiCall: () =>
				callApi('/api/save-sequence-props', {
					edits: [
						{
							fileName: change.fileName,
							nodePath: change.nodePath,
							key: change.fieldKey,
							value: JSON.stringify(change.value),
							defaultValue: change.defaultValue,
							schema: change.schema,
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
