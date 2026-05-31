import type {
	CodeValues,
	OverrideIdToNodePaths,
	SequenceFieldSchema,
	SequencePropsSubscriptionKey,
	SequenceSchema,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {saveEffectProps} from './save-effect-prop';
import {saveSequenceProps} from './save-sequence-prop';
import type {SetCodeValues} from './save-sequence-prop';
import type {TimelineSelection} from './TimelineSelection';

type SequencePropResetTarget = {
	readonly type: 'sequence-prop';
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly fieldKey: string;
	readonly value: unknown;
	readonly defaultValue: string | null;
	readonly schema: SequenceSchema;
};

type EffectPropResetTarget = {
	readonly type: 'effect-prop';
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly effectIndex: number;
	readonly fieldKey: string;
	readonly value: unknown;
	readonly defaultValue: string | null;
	readonly schema: SequenceSchema;
};

type TimelinePropResetTarget = SequencePropResetTarget | EffectPropResetTarget;

const isPropResetSelection = (
	selection: TimelineSelection,
): selection is TimelineSelection & {
	type: 'sequence-prop' | 'sequence-effect-prop';
} =>
	selection.type === 'sequence-prop' ||
	selection.type === 'sequence-effect-prop';

const isVisibleFieldSchema = (
	fieldSchema: SequenceFieldSchema | undefined,
): fieldSchema is Exclude<SequenceFieldSchema, {type: 'hidden'}> =>
	fieldSchema !== undefined && fieldSchema.type !== 'hidden';

const isNonDefaultCodeValue = ({
	codeValue,
	defaultValue,
}: {
	readonly codeValue: unknown;
	readonly defaultValue: unknown;
}) =>
	JSON.stringify(codeValue ?? defaultValue) !== JSON.stringify(defaultValue);

const getDefaultValue = (
	fieldSchema: Exclude<SequenceFieldSchema, {type: 'hidden'}>,
) =>
	fieldSchema.default !== undefined
		? JSON.stringify(fieldSchema.default)
		: null;

export const getTimelinePropResetTargets = ({
	selections,
	sequences,
	overrideIdsToNodePaths,
	codeValues,
}: {
	readonly selections: readonly TimelineSelection[];
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly codeValues: CodeValues;
}): TimelinePropResetTarget[] | null => {
	const firstSelection = selections[0];
	if (!firstSelection || !isPropResetSelection(firstSelection)) {
		return null;
	}

	const resetTargets: TimelinePropResetTarget[] = [];
	for (const selection of selections) {
		if (
			!isPropResetSelection(selection) ||
			selection.type !== firstSelection.type
		) {
			throw new Error(
				`Assertion failed: Cannot reset timeline selections of different types (${firstSelection.type}, ${selection.type})`,
			);
		}

		const track = findTrackForNodePathInfo({
			sequences,
			overrideIdsToNodePaths,
			nodePathInfo: selection.nodePathInfo,
		});
		const sequence = track?.sequence ?? null;
		if (!sequence) {
			continue;
		}

		const nodePath = selection.nodePathInfo.sequenceSubscriptionKey;
		if (selection.type === 'sequence-prop') {
			if (!sequence.controls) {
				continue;
			}

			const sequenceFieldSchema = sequence.controls.schema[selection.key];
			const sequencePropStatus = Internals.getCodeValuesCtx(
				codeValues,
				nodePath,
			)?.[selection.key];
			if (
				!isVisibleFieldSchema(sequenceFieldSchema) ||
				!sequencePropStatus?.canUpdate ||
				!isNonDefaultCodeValue({
					codeValue: sequencePropStatus.codeValue,
					defaultValue: sequenceFieldSchema.default,
				})
			) {
				continue;
			}

			resetTargets.push({
				type: 'sequence-prop',
				fileName: nodePath.absolutePath,
				nodePath,
				fieldKey: selection.key,
				value: sequenceFieldSchema.default,
				defaultValue: getDefaultValue(sequenceFieldSchema),
				schema: sequence.controls.schema,
			});
			continue;
		}

		const effect = sequence.effects[selection.i];
		const fieldSchema = effect?.schema[selection.key];
		const effectStatus = Internals.getEffectCodeValuesCtx({
			codeValues,
			nodePath,
			effectIndex: selection.i,
		});
		const propStatus =
			effectStatus.type === 'can-update-effect'
				? effectStatus.props[selection.key]
				: null;
		if (
			!effect ||
			!isVisibleFieldSchema(fieldSchema) ||
			!propStatus?.canUpdate ||
			!isNonDefaultCodeValue({
				codeValue: propStatus.codeValue,
				defaultValue: fieldSchema.default,
			})
		) {
			continue;
		}

		resetTargets.push({
			type: 'effect-prop',
			fileName: nodePath.absolutePath,
			nodePath,
			effectIndex: selection.i,
			fieldKey: selection.key,
			value: fieldSchema.default,
			defaultValue: getDefaultValue(fieldSchema),
			schema: effect.schema,
		});
	}

	return resetTargets;
};

export const resetSelectedTimelineProps = ({
	selections,
	sequences,
	overrideIdsToNodePaths,
	codeValues,
	setCodeValues,
	clientId,
}: {
	readonly selections: readonly TimelineSelection[];
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly codeValues: CodeValues;
	readonly setCodeValues: SetCodeValues;
	readonly clientId: string;
}): Promise<void> | null => {
	const resetTargets = getTimelinePropResetTargets({
		selections,
		sequences,
		overrideIdsToNodePaths,
		codeValues,
	});
	if (resetTargets === null || resetTargets.length === 0) {
		return null;
	}

	const sequencePropTargets = resetTargets.filter(
		(target): target is SequencePropResetTarget =>
			target.type === 'sequence-prop',
	);
	const effectPropTargets = resetTargets.filter(
		(target): target is EffectPropResetTarget => target.type === 'effect-prop',
	);

	const resetPromises = [
		saveSequenceProps({
			changes: sequencePropTargets,
			setCodeValues,
			clientId,
			undoLabel: null,
			redoLabel: null,
		}),
		saveEffectProps({
			changes: effectPropTargets,
			setCodeValues,
			clientId,
			undoLabel: null,
			redoLabel: null,
		}),
	];

	return Promise.all(resetPromises).then(() => undefined);
};
