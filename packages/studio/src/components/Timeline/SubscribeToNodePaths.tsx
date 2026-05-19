import {useMemo, type FC} from 'react';
import type {EffectDefinition, SequenceSchema} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {useResolveStackAndReactToChange} from './use-resolved-stack-react-to-change';
import {useSequencePropsSubscription} from './use-sequence-props-subscription';

export const SubscribeToNodePaths: FC<{
	readonly overrideId: string;
	readonly schema: SequenceSchema;
	readonly getStack: () => string | null;
	readonly effects: readonly EffectDefinition<unknown>[];
}> = ({overrideId, schema, getStack, effects}) => {
	const originalLocation = useResolveStackAndReactToChange(getStack);

	const effectSubscriptions = useMemo<SequenceSchema[]>(() => {
		return effects
			.map((effect): SequenceSchema | null => {
				return effect.schema;
			})
			.filter(NoReactInternals.truthy);
	}, [effects]);

	useSequencePropsSubscription({
		overrideId,
		schema,
		effects: effectSubscriptions,
		originalLocation,
	});

	return null;
};
