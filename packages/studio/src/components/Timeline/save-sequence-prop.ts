import {
	optimisticUpdateForPropStatuses,
	type SaveSequencePropEdit,
} from '@remotion/studio-shared';
import type {
	CanUpdateSequencePropsResponse,
	SequencePropsSubscriptionKey,
	SequenceSchema,
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
	defaultValue: string | null | undefined;
	schema: SequenceSchema;
};

type SaveSequencePropsOptions = {
	changes: SaveSequencePropChange[];
	setPropStatuses: SetPropStatuses;
	clientId: string;
	undoLabel: string;
	redoLabel: string;
};

const changeToEdit = (change: SaveSequencePropChange): SaveSequencePropEdit => {
	const base = {
		fileName: change.fileName,
		nodePath: change.nodePath,
		key: change.fieldKey,
		schema: change.schema,
	};

	if (change.value === undefined && change.defaultValue === undefined) {
		return base;
	}

	if (change.defaultValue === undefined) {
		throw new Error(
			'Expected defaultValue to be defined for sequence prop save',
		);
	}

	return {
		...base,
		defaultValue: change.defaultValue,
		value: JSON.stringify(change.value),
	};
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
					schema: change.schema,
				}),
			apiCall: () =>
				callApi('/api/save-sequence-props', {
					edits: [changeToEdit(change)],
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
				schema: change.schema,
			}),
		);
	}

	return callApi('/api/save-sequence-props', {
		edits: changes.map(changeToEdit),
		clientId,
		undoLabel,
		redoLabel,
	}).then(() => undefined);
};
