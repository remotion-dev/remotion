import {
	type CanUpdateSequencePropsResponse,
	type CanUpdateSequencePropStatus,
	type CanUpdateSequencePropStatusWithCodeValue,
	type InteractivitySchema,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';

const getOptimisticMultiplicationStatus = ({
	previousStatus,
	optimisticValue,
}: {
	previousStatus: CanUpdateSequencePropStatus | undefined;
	optimisticValue: unknown;
}): CanUpdateSequencePropStatusWithCodeValue | null => {
	if (
		previousStatus?.status !== 'multiplication' ||
		typeof optimisticValue !== 'number'
	) {
		return null;
	}

	const multiplier = optimisticValue / previousStatus.multiplicand;
	if (!Number.isFinite(multiplier) || multiplier === 0) {
		return null;
	}

	return {
		...previousStatus,
		codeValue: optimisticValue,
		multiplier,
	};
};

export const optimisticUpdateForPropStatuses = ({
	previous,
	fieldKey,
	value,
	defaultValue,
	schema,
}: {
	previous: CanUpdateSequencePropsResponse;
	fieldKey: string;
	value: unknown;
	defaultValue?: string | null;
	schema: InteractivitySchema;
}): CanUpdateSequencePropsResponse => {
	if (!previous.canUpdate) {
		return previous;
	}

	const serializedValue = JSON.stringify(value);
	const optimisticValue =
		defaultValue !== null && defaultValue === serializedValue
			? undefined
			: value;
	const previousStatus = previous.props[fieldKey];
	const nextStatus: CanUpdateSequencePropStatus =
		getOptimisticMultiplicationStatus({
			previousStatus,
			optimisticValue,
		}) ?? {status: 'static', codeValue: optimisticValue};

	const props: Record<string, CanUpdateSequencePropStatus> = {
		...previous.props,
		[fieldKey]: nextStatus,
	};

	if (schema[fieldKey]?.type === 'enum') {
		const propsToDelete = NoReactInternals.findPropsToDelete({
			schema,
			key: fieldKey,
			value,
		});
		for (const propToDelete of propsToDelete) {
			delete props[propToDelete];
		}
	}

	return {
		canUpdate: true,
		props,
		effects: previous.effects,
	};
};
