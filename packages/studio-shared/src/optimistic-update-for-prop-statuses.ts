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
	schema,
}: {
	previous: CanUpdateSequencePropsResponse;
	fieldKey: string;
	value: unknown;
	schema: InteractivitySchema;
}): CanUpdateSequencePropsResponse => {
	if (!previous.canUpdate) {
		return previous;
	}

	const props: Record<string, CanUpdateSequencePropStatus> = {
		...previous.props,
		[fieldKey]: {status: 'static', codeValue: value},
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
