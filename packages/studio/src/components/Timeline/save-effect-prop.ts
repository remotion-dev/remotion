import {optimisticUpdateForEffectCodeValues} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, SequenceSchema} from 'remotion';
import {callApi} from '../call-api';
import {enqueueSavePropChange} from './save-prop-queue';
import type {SetCodeValues} from './save-sequence-prop';

export const saveEffectProp = ({
	fileName,
	nodePath,
	effectIndex,
	fieldKey,
	value,
	defaultValue,
	schema,
	setCodeValues,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
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
			optimisticUpdateForEffectCodeValues({
				previous: prev,
				effectIndex,
				fieldKey,
				value,
				schema,
			}),
		apiCall: () =>
			callApi('/api/save-effect-props', {
				fileName,
				sequenceNodePath: nodePath,
				effectIndex,
				key: fieldKey,
				value: JSON.stringify(value),
				defaultValue,
				schema,
			}),
		mergeServerResponse: (prev, data) => {
			if (!prev.canUpdate) {
				return prev;
			}

			const idx = prev.effects.findIndex((e) => e.effectIndex === effectIndex);
			if (idx === -1) {
				return {...prev, effects: [...prev.effects, data]};
			}

			const nextEffects = [...prev.effects];
			nextEffects[idx] = data;
			return {...prev, effects: nextEffects};
		},
		errorLabel: 'Could not save effect prop',
	});
};
