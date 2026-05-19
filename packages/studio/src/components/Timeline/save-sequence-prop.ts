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

export const saveSequenceProp = ({
	fileName,
	nodePath,
	fieldKey,
	value,
	defaultValue,
	schema,
	setCodeValues,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	value: unknown;
	defaultValue: string | null;
	schema: SequenceSchema;
	setCodeValues: SetCodeValues;
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
				fileName,
				nodePath,
				key: fieldKey,
				value: JSON.stringify(value),
				defaultValue,
				schema,
			}),
		errorLabel: 'Could not save sequence prop',
	});
};
