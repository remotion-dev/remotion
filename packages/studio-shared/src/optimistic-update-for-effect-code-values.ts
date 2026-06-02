import {
	type CanUpdateEffectPropsResponse,
	type CanUpdateSequencePropsResponse,
	type CanUpdateSequencePropStatus,
	type SequenceSchema,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';

export const optimisticUpdateForEffectCodeValues = ({
	previous,
	effectIndex,
	fieldKey,
	value,
	schema,
}: {
	previous: CanUpdateSequencePropsResponse;
	effectIndex: number;
	fieldKey: string;
	value: unknown;
	schema: SequenceSchema;
}): CanUpdateSequencePropsResponse => {
	if (!previous.canUpdate) {
		return previous;
	}

	const targetIndex = previous.effects.findIndex(
		(e) => e.effectIndex === effectIndex,
	);
	if (targetIndex === -1) {
		return previous;
	}

	const target = previous.effects[targetIndex];
	if (!target.canUpdate) {
		return previous;
	}

	const props: Record<string, CanUpdateSequencePropStatus> = {
		...target.props,
		[fieldKey]: {canUpdate: true, codeValue: value, keyframed: false},
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

	const updatedEffect: CanUpdateEffectPropsResponse = {
		...target,
		props,
	};

	const effects = [...previous.effects];
	effects[targetIndex] = updatedEffect;

	return {
		...previous,
		effects,
	};
};
