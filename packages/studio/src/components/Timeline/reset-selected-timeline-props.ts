import {getEffectFieldsToShow} from '@remotion/studio-shared';
import type {
	CanUpdateSequencePropStatus,
	OverrideIdToNodePaths,
	PropStatuses,
	InteractivitySchemaField,
	SequencePropsSubscriptionKey,
	InteractivitySchema,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {saveEffectProp} from './save-effect-prop';
import type {SetPropStatuses} from './save-sequence-prop';
import {saveSequenceProps} from './save-sequence-prop';
import type {TimelineSelection} from './TimelineSelection';

type SequencePropResetTarget = {
	readonly type: 'sequence-prop';
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly fieldKey: string;
	readonly value: unknown;
	readonly defaultValue: string | null;
	readonly schema: InteractivitySchema;
};

type EffectPropResetTarget = {
	readonly type: 'effect-prop';
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly effectIndex: number;
	readonly fieldKey: string;
	readonly value: unknown;
	readonly defaultValue: string | null;
	readonly schema: InteractivitySchema;
};

type TimelinePropResetTarget = SequencePropResetTarget | EffectPropResetTarget;

type PropResetSelection = TimelineSelection & {
	type: 'sequence-prop' | 'sequence-effect-prop';
};

const isPropResetSelection = (
	selection: TimelineSelection,
): selection is PropResetSelection =>
	selection.type === 'sequence-prop' ||
	selection.type === 'sequence-effect-prop';

function assertPropResetSelections(
	selections: readonly TimelineSelection[],
): asserts selections is readonly PropResetSelection[] {
	for (const selection of selections) {
		if (!isPropResetSelection(selection)) {
			throw new Error(
				`Assertion failed: Cannot reset timeline selection of type ${selection.type}`,
			);
		}
	}
}

const isVisibleFieldSchema = (
	fieldSchema: InteractivitySchemaField | undefined,
): fieldSchema is Exclude<InteractivitySchemaField, {type: 'hidden'}> =>
	fieldSchema !== undefined && fieldSchema.type !== 'hidden';

const isNonDefaultCodeValue = ({
	propStatus,
	defaultValue,
}: {
	readonly propStatus: unknown;
	readonly defaultValue: unknown;
}) =>
	JSON.stringify(propStatus ?? defaultValue) !== JSON.stringify(defaultValue);

const isResettablePropStatus = ({
	propStatus,
	defaultValue,
}: {
	readonly propStatus: CanUpdateSequencePropStatus | null | undefined;
	readonly defaultValue: unknown;
}) => {
	if (!propStatus) {
		return false;
	}

	if (defaultValue === undefined) {
		return false;
	}

	if (propStatus.status === 'keyframed') {
		return true;
	}

	if (propStatus.status === 'computed') {
		return false;
	}

	return isNonDefaultCodeValue({
		propStatus: propStatus.codeValue,
		defaultValue,
	});
};

const getDefaultValue = (
	fieldSchema: Exclude<InteractivitySchemaField, {type: 'hidden'}>,
) =>
	fieldSchema.default !== undefined
		? JSON.stringify(fieldSchema.default)
		: null;

const getActiveFieldSchema = ({
	schema,
	key,
	resolveValue,
}: {
	readonly schema: InteractivitySchema;
	readonly key: string;
	readonly resolveValue: (key: string) => unknown;
}) => {
	return Internals.flattenActiveSchema(schema, resolveValue)[key];
};

export const getTimelinePropResetTargets = ({
	selections,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
}: {
	readonly selections: readonly TimelineSelection[];
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly propStatuses: PropStatuses;
}): TimelinePropResetTarget[] | null => {
	const propSelections = selections.filter(isPropResetSelection);
	if (propSelections.length === 0) {
		return null;
	}

	if (propSelections.length !== selections.length) {
		return null;
	}

	assertPropResetSelections(selections);

	const resetTargets: TimelinePropResetTarget[] = [];
	for (const selection of selections) {
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

			const sequencePropStatus = Internals.getPropStatusesCtx(
				propStatuses,
				nodePath,
			);
			const {merged: sequenceValuesDotNotation} =
				Internals.computeEffectiveSchemaValuesDotNotation({
					schema: sequence.controls.schema,
					currentValue: sequence.controls.currentRuntimeValueDotNotation,
					overrideValues: {},
					propStatus: sequencePropStatus,
					frame: null,
				});
			const sequenceFieldSchema = getActiveFieldSchema({
				schema: sequence.controls.schema,
				key: selection.key,
				resolveValue: (key) => sequenceValuesDotNotation[key],
			});
			const selectedPropStatus = sequencePropStatus?.[selection.key];
			if (
				!isVisibleFieldSchema(sequenceFieldSchema) ||
				!isResettablePropStatus({
					propStatus: selectedPropStatus,
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
		const field = effect
			? getEffectFieldsToShow({
					effect,
					effectIndex: selection.i,
					nodePath,
					propStatuses,
					getEffectDragOverrides: () => ({}),
				}).find((candidate) => candidate.key === selection.key)
			: null;
		const fieldSchema = field?.fieldSchema;
		const effectStatus = Internals.getEffectPropStatusesCtx({
			propStatuses,
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
			!isResettablePropStatus({
				propStatus,
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
	propStatuses,
	setPropStatuses,
	clientId,
}: {
	readonly selections: readonly TimelineSelection[];
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly propStatuses: PropStatuses;
	readonly setPropStatuses: SetPropStatuses;
	readonly clientId: string;
}): Promise<void> | null => {
	const resetTargets = getTimelinePropResetTargets({
		selections,
		sequences,
		overrideIdsToNodePaths,
		propStatuses,
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

	const resetPromises: Promise<void>[] = [];

	if (sequencePropTargets.length > 0) {
		resetPromises.push(
			saveSequenceProps({
				addedKeyframes: null,
				movedKeyframes: null,
				changes: sequencePropTargets.map((target) => ({
					fileName: target.fileName,
					nodePath: target.nodePath,
					fieldKey: target.fieldKey,
					value: target.value,
					defaultValue: target.defaultValue,
					schema: target.schema,
				})),
				setPropStatuses,
				clientId,
				undoLabel:
					sequencePropTargets.length > 1
						? 'Reset selected sequence props'
						: 'Reset sequence prop',
				redoLabel:
					sequencePropTargets.length > 1
						? 'Reapply selected sequence props'
						: 'Reapply sequence prop',
			}),
		);
	}

	for (const target of effectPropTargets) {
		resetPromises.push(
			saveEffectProp({
				type: 'value',
				fileName: target.fileName,
				nodePath: target.nodePath,
				effectIndex: target.effectIndex,
				fieldKey: target.fieldKey,
				value: target.value,
				defaultValue: target.defaultValue,
				schema: target.schema,
				setPropStatuses,
				clientId,
			}),
		);
	}

	return Promise.all(resetPromises).then(() => undefined);
};
