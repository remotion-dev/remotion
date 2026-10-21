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
	const {resolvedLocation, stack, preferMappedNodePath, stackIsResolved} =
		useResolveStackAndReactToChange(getStack, overrideId);

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
		// The inspector can retain its old location during refresh, but subscribing
		// with it could target a different JSX node in the updated source.
		originalLocation: stackIsResolved ? resolvedLocation : null,
		preferMappedNodePath,
		stack,
	});

	return null;
};
