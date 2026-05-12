import type React from 'react';
import type {SequenceSchema} from 'remotion';
import {useResolvedStack} from './use-resolved-stack';
import {useSequencePropsSubscription} from './use-sequence-props-subscription';

export const SubscribeToNodePaths: React.FC<{
	readonly overrideId: string;
	readonly schema: SequenceSchema;
	readonly stack: string;
}> = ({overrideId, schema, stack}) => {
	const originalLocation = useResolvedStack(stack);

	useSequencePropsSubscription({
		overrideId,
		schema,
		originalLocation,
	});

	return null;
};
