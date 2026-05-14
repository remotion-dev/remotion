import type {EffectSubscription} from '@remotion/studio-shared';
import {useMemo, type FC} from 'react';
import type {EffectDefinitionAndStack, SequenceSchema} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {useResolvedStack} from './use-resolved-stack';
import {useSequencePropsSubscription} from './use-sequence-props-subscription';

export const SubscribeToNodePaths: FC<{
	readonly overrideId: string;
	readonly schema: SequenceSchema;
	readonly stack: string;
	readonly effects: EffectDefinitionAndStack<unknown>[];
}> = ({overrideId, schema, stack, effects}) => {
	const originalLocation = useResolvedStack(stack);

	const effectSubscriptions = useMemo<EffectSubscription[]>(() => {
		return effects
			.map((effect): EffectSubscription | null => {
				if (!effect.definition.schema) {
					return null;
				}

				return {
					effectIndex: effect.sourceIndex,
					factoryName: effect.definition.factoryName,
					schema: effect.definition.schema,
				};
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
