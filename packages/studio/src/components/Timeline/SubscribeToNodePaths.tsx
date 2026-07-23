import {useMemo, type FC} from 'react';
import type {
	EffectDefinition,
	JsxComponentIdentity,
	InteractivitySchema,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {useResolveStackAndReactToChange} from './use-resolved-stack-react-to-change';
import {useSequencePropsSubscription} from './use-sequence-props-subscription';

export const SubscribeToNodePaths: FC<{
	readonly overrideId: string;
	readonly componentIdentity: JsxComponentIdentity | null;
	readonly schema: InteractivitySchema;
	readonly getStack: () => string | null;
	readonly effects: readonly EffectDefinition<unknown>[];
}> = ({overrideId, componentIdentity, schema, getStack, effects}) => {
	const originalLocation = useResolveStackAndReactToChange(getStack);

	const effectSubscriptions = useMemo<InteractivitySchema[]>(() => {
		return effects
			.map((effect): InteractivitySchema | null => {
				return effect.schema;
			})
			.filter(NoReactInternals.truthy);
	}, [effects]);

	useSequencePropsSubscription({
		overrideId,
		componentIdentity,
		schema,
		effects: effectSubscriptions,
		originalLocation,
	});

	return null;
};
