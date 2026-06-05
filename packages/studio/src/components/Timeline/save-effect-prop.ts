import {
	optimisticUpdateForEffectCodeValues,
	type EffectClipboardParam,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, SequenceSchema} from 'remotion';
import {callApi} from '../call-api';
import {applyEffectResponseToCodeValues} from './apply-effect-response-to-code-values';
import {enqueueSavePropChange} from './save-prop-queue';
import type {SetCodeValues} from './save-sequence-prop';

export const saveEffectProp = ({
	fileName,
	nodePath,
	effectIndex,
	fieldKey,
	value,
	effectParam,
	defaultValue,
	schema,
	setCodeValues,
	clientId,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	fieldKey: string;
	value?: unknown;
	effectParam?: EffectClipboardParam;
	defaultValue: string | null;
	schema: SequenceSchema;
	setCodeValues: SetCodeValues;
	clientId: string;
}): Promise<void> => {
	return enqueueSavePropChange({
		nodePath,
		setCodeValues,
		applyOptimistic: (prev) =>
			effectParam
				? prev
				: optimisticUpdateForEffectCodeValues({
						previous: prev,
						effectIndex,
						fieldKey,
						value,
						schema,
					}),
		applyServerResponse: (prev, response) =>
			applyEffectResponseToCodeValues({previous: prev, response}),
		apiCall: () =>
			callApi(
				'/api/save-effect-props',
				effectParam
					? {
							type: 'effect-param',
							fileName,
							sequenceNodePath: nodePath,
							effectIndex,
							key: fieldKey,
							effectParam,
							defaultValue,
							schema,
							clientId,
						}
					: {
							fileName,
							sequenceNodePath: nodePath,
							effectIndex,
							key: fieldKey,
							value: JSON.stringify(value),
							defaultValue,
							schema,
							clientId,
						},
			),
		errorLabel: 'Could not save effect prop',
	});
};
