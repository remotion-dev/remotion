import {
	optimisticUpdateForEffectCodeValues,
	type EffectClipboardParam,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, SequenceSchema} from 'remotion';
import {callApi} from '../call-api';
import {applyEffectResponseToCodeValues} from './apply-effect-response-to-code-values';
import {enqueueSavePropChange} from './save-prop-queue';
import type {SetCodeValues} from './save-sequence-prop';

type SaveEffectPropBase = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	fieldKey: string;
	defaultValue: string | null;
	schema: SequenceSchema;
	setCodeValues: SetCodeValues;
	clientId: string;
};

type SaveEffectPropValue = SaveEffectPropBase & {
	type: 'value';
	value: unknown;
};

type SaveEffectPropEffectParam = SaveEffectPropBase & {
	type: 'effect-param';
	effectParam: EffectClipboardParam;
};

type SaveEffectPropInput = SaveEffectPropValue | SaveEffectPropEffectParam;

export const saveEffectProp = (input: SaveEffectPropInput): Promise<void> => {
	const {
		fileName,
		nodePath,
		effectIndex,
		fieldKey,
		defaultValue,
		schema,
		setCodeValues,
		clientId,
	} = input;

	return enqueueSavePropChange({
		nodePath,
		setCodeValues,
		applyOptimistic: (prev) =>
			input.type === 'effect-param'
				? prev
				: optimisticUpdateForEffectCodeValues({
						previous: prev,
						effectIndex,
						fieldKey,
						value: input.value,
						schema,
					}),
		applyServerResponse: (prev, response) =>
			applyEffectResponseToCodeValues({previous: prev, response}),
		apiCall: () =>
			callApi(
				'/api/save-effect-props',
				input.type === 'effect-param'
					? {
							type: 'effect-param',
							fileName,
							sequenceNodePath: nodePath,
							effectIndex,
							key: fieldKey,
							effectParam: input.effectParam,
							defaultValue,
							schema,
							clientId,
						}
					: {
							type: 'value',
							fileName,
							sequenceNodePath: nodePath,
							effectIndex,
							key: fieldKey,
							value: JSON.stringify(input.value),
							defaultValue,
							schema,
							clientId,
						},
			),
		errorLabel: 'Could not save effect prop',
	});
};
