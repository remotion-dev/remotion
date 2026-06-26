import {optimisticUpdateForPropStatuses} from '@remotion/studio-shared';
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
	valueExpression?: string | null;
	defaultValue: string | null;
	schema: InteractivitySchema;
};

type SaveSequencePropsOptions = {
	changes: SaveSequencePropChange[];
	setPropStatuses: SetPropStatuses;
	clientId: string;
	undoLabel: string;
	redoLabel: string;
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
							value: JSON.stringify(change.value),
							valueExpression: change.valueExpression ?? null,
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
				value: JSON.stringify(change.value),
				valueExpression: change.valueExpression ?? null,
				defaultValue: change.defaultValue,
				schema: change.schema,
			};
		}),
		clientId,
		undoLabel,
		redoLabel,
	}).then(() => undefined);
};
