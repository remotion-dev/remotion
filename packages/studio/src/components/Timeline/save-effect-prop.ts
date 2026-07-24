import {
	optimisticUpdateForEffectPropStatuses,
	type EffectClipboardParam,
	type SaveMultipleEffectPropsEdit,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, InteractivitySchema} from 'remotion';
import {callApi} from '../call-api';
import {applyEffectResponseToPropStatuses} from './apply-effect-response-to-prop-statuses';
import {enqueueSavePropChange} from './save-prop-queue';
import type {SetPropStatuses} from './save-sequence-prop';

type SaveEffectPropBase = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	fieldKey: string;
	defaultValue: string | null;
	schema: InteractivitySchema;
	setPropStatuses: SetPropStatuses;
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

type WithoutSaveContext<T> = T extends unknown
	? Omit<T, 'setPropStatuses' | 'clientId'>
	: never;

type SaveMultipleEffectPropChange = WithoutSaveContext<SaveEffectPropInput>;

type SaveMultipleEffectPropsOptions = {
	changes: SaveMultipleEffectPropChange[];
	setPropStatuses: SetPropStatuses;
	clientId: string;
	undoLabel: string;
	redoLabel: string;
};

export const saveMultipleEffectProps = ({
	changes,
	setPropStatuses,
	clientId,
	undoLabel,
	redoLabel,
}: SaveMultipleEffectPropsOptions): Promise<void> => {
	if (changes.length === 0) {
		return Promise.resolve();
	}

	for (const change of changes) {
		if (change.type === 'effect-param') {
			continue;
		}

		setPropStatuses(change.nodePath, (prev) =>
			optimisticUpdateForEffectPropStatuses({
				previous: prev,
				effectIndex: change.effectIndex,
				fieldKey: change.fieldKey,
				value: change.value,
				schema: change.schema,
			}),
		);
	}

	return callApi('/api/save-multiple-effect-props', {
		edits: changes.map(
			(change): SaveMultipleEffectPropsEdit =>
				change.type === 'effect-param'
					? {
							type: 'effect-param',
							fileName: change.fileName,
							sequenceNodePath: change.nodePath,
							effectIndex: change.effectIndex,
							key: change.fieldKey,
							effectParam: change.effectParam,
							defaultValue: change.defaultValue,
							schema: change.schema,
						}
					: {
							type: 'value',
							fileName: change.fileName,
							sequenceNodePath: change.nodePath,
							effectIndex: change.effectIndex,
							key: change.fieldKey,
							value: JSON.stringify(change.value),
							defaultValue: change.defaultValue,
							schema: change.schema,
						},
		),
		clientId,
		undoLabel,
		redoLabel,
	}).then((response) => {
		for (const result of response.results) {
			setPropStatuses(result.sequenceNodePath, (prev) =>
				applyEffectResponseToPropStatuses({
					previous: prev,
					response: result.status,
				}),
			);
		}
	});
};

export const saveEffectProp = (input: SaveEffectPropInput): Promise<void> => {
	const {
		fileName,
		nodePath,
		effectIndex,
		fieldKey,
		defaultValue,
		schema,
		setPropStatuses,
		clientId,
	} = input;

	return enqueueSavePropChange({
		nodePath,
		setPropStatuses,
		applyOptimistic: (prev) =>
			input.type === 'effect-param'
				? prev
				: optimisticUpdateForEffectPropStatuses({
						previous: prev,
						effectIndex,
						fieldKey,
						value: input.value,
						schema,
					}),
		applyServerResponse: (prev, response) =>
			applyEffectResponseToPropStatuses({previous: prev, response}),
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
