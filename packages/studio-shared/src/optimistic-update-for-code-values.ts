import type {
	CanUpdateSequencePropsResponse,
	CanUpdateSequencePropStatus,
	SequenceSchema,
} from 'remotion';
import {findPropsToDelete} from './find-props-to-delete';

export const optimisticUpdateForCodeValues = ({
	previous,
	fieldKey,
	value,
	schema,
}: {
	previous: CanUpdateSequencePropsResponse;
	fieldKey: string;
	value: unknown;
	schema: SequenceSchema;
}): CanUpdateSequencePropsResponse => {
	if (!previous.canUpdate) {
		return previous;
	}

	const props: Record<string, CanUpdateSequencePropStatus> = {
		...previous.props,
		[fieldKey]: {canUpdate: true, codeValue: value},
	};

	const propsToDelete = findPropsToDelete({
		schema,
		key: fieldKey,
		value,
	});

	for (const propToDelete of propsToDelete) {
		delete props[propToDelete];
	}

	return {
		canUpdate: true,
		props,
	};
};
