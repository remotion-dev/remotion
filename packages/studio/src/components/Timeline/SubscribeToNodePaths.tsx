import type React from 'react';
import type {SequenceSchema, TSequence} from 'remotion';
import {useResolvedStack} from './use-resolved-stack';
import {useSequencePropsSubscription} from './use-sequence-props-subscription';

export const SubscribeToNodePaths: React.FC<{
	readonly sequence: TSequence;
	readonly overrideId: string;
	readonly schema: SequenceSchema;
}> = ({sequence, overrideId, schema}) => {
	const originalLocation = useResolvedStack(sequence.stack ?? null);

	useSequencePropsSubscription({
		overrideId,
		schema,
		originalLocation,
	});

	return null;
};
