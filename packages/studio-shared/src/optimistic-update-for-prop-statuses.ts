import {
	type CanUpdateSequencePropsResponse,
	type CanUpdateSequencePropStatus,
	type InteractivitySchema,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';

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

	const props: Record<string, CanUpdateSequencePropStatus> = {
		...previous.props,
		[fieldKey]: {status: 'static', codeValue: optimisticValue},
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
