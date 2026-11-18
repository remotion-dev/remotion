import {
	optimisticUpdateForEffectPropStatuses,
	type EffectClipboardParam,
	type SaveMultipleEffectPropsEdit,
} from '@remotion/studio-shared';
import type {SequencePropsSubscriptionKey, InteractivitySchema} from 'remotion';
import {
	attachOptimisticEffectPropHistory,
	createOptimisticEffectPropUpdate,
} from '../../helpers/optimistic-effect-props';
import {
	saveEffectProps as saveEffectPropsApi,
	saveMultipleEffectProps as saveMultipleEffectPropsApi,
} from '../effect-operations-api';
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

	const updates = changes.map((change) =>
		createOptimisticEffectPropUpdate({
			nodePath: change.nodePath,
			effectIndex: change.effectIndex,
			fieldKey: change.fieldKey,
			schema: change.schema,
			applyOptimistic: (previous) =>
				change.type === 'effect-param'
					? previous
					: optimisticUpdateForEffectPropStatuses({
							previous,
							effectIndex: change.effectIndex,
							fieldKey: change.fieldKey,
							value: change.value,
							schema: change.schema,
						}),
		}),
	);
	changes.forEach((change, index) => {
		setPropStatuses(change.nodePath, updates[index].applyOptimistic);
	});
	const groups = new Map<string, number[]>();
	changes.forEach((change, index) => {
		const key = JSON.stringify([
			change.fileName,
			change.nodePath.nodePath,
			change.effectIndex,
		]);
		groups.set(key, [...(groups.get(key) ?? []), index]);
	});

	return saveMultipleEffectPropsApi(
		attachOptimisticEffectPropHistory(
			{
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
			},
			updates,
		),
	)
		.then((response) => {
			const targets = [...groups.values()];
			for (const [resultIndex, result] of response.results.entries()) {
				for (const index of targets[resultIndex] ?? []) {
					setPropStatuses(changes[index].nodePath, (previous) =>
						updates[index].applyResponse(previous, result.status),
					);
				}
			}
		})
		.catch((error) => {
			for (const update of updates) update.rollback();
			throw error;
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

	const update = createOptimisticEffectPropUpdate({
		nodePath,
		effectIndex,
		fieldKey,
		schema,
		applyOptimistic: (previous) =>
			input.type === 'effect-param'
				? previous
				: optimisticUpdateForEffectPropStatuses({
						previous,
						effectIndex,
						fieldKey,
						value: input.value,
						schema,
					}),
	});
	return enqueueSavePropChange({
		nodePath,
		setPropStatuses,
		applyOptimistic: update.applyOptimistic,
		applyServerResponse: (previous, response) =>
			update.optimistic ? previous : update.applyResponse(previous, response),
		apiCall: () =>
			saveEffectPropsApi(
				attachOptimisticEffectPropHistory(
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
					[update],
				),
			)
				.then((response) => {
					if (update.optimistic) {
						setPropStatuses(nodePath, (previous) =>
							update.applyResponse(previous, response),
						);
					}

					return response;
				})
				.catch((error) => {
					update.rollback();
					throw error;
				}),
		errorLabel: 'Could not save effect prop',
	});
};
