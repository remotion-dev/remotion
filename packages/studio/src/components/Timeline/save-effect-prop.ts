import {optimisticUpdateForEffectCodeValues} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, SequenceSchema} from 'remotion';
import {callApi} from '../call-api';
import {enqueueSavePropChange} from './save-prop-queue';
import type {SetCodeValues} from './save-sequence-prop';

export type SaveEffectPropChange = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	fieldKey: string;
	value: unknown;
	defaultValue: string | null;
	schema: SequenceSchema;
};

type SaveEffectPropsOptions = {
	changes: SaveEffectPropChange[];
	setCodeValues: SetCodeValues;
	clientId: string;
	undoLabel: string | null;
	redoLabel: string | null;
};

type SaveEffectPropOptions = SaveEffectPropChange & {
	setCodeValues: SetCodeValues;
	clientId: string;
};

export const saveEffectProps = ({
	changes,
	setCodeValues,
	clientId,
	undoLabel,
	redoLabel,
}: SaveEffectPropsOptions): Promise<void> => {
	if (changes.length === 0) {
		return Promise.resolve();
	}

	for (const change of changes) {
		setCodeValues(change.nodePath, (prev) =>
			optimisticUpdateForEffectCodeValues({
				previous: prev,
				effectIndex: change.effectIndex,
				fieldKey: change.fieldKey,
				value: change.value,
				schema: change.schema,
			}),
		);
	}

	return callApi('/api/save-effect-props', {
		edits: changes.map((change) => {
			return {
				fileName: change.fileName,
				sequenceNodePath: change.nodePath,
				effectIndex: change.effectIndex,
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

export const saveEffectProp = ({
	fileName,
	nodePath,
	effectIndex,
	fieldKey,
	value,
	defaultValue,
	schema,
	setCodeValues,
	clientId,
}: SaveEffectPropOptions): Promise<void> => {
	return enqueueSavePropChange({
		nodePath,
		setCodeValues,
		applyOptimistic: (prev) =>
			optimisticUpdateForEffectCodeValues({
				previous: prev,
				effectIndex,
				fieldKey,
				value,
				schema,
			}),
		apiCall: () =>
			callApi('/api/save-effect-props', {
				edits: [
					{
						fileName,
						sequenceNodePath: nodePath,
						effectIndex,
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
		errorLabel: 'Could not save effect prop',
	});
};
