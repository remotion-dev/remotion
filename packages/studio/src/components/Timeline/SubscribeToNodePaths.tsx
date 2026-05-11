import type React from 'react';
import {useContext} from 'react';
import type {TSequence} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {useResolvedStack} from './use-resolved-stack';
import {useSequencePropsSubscription} from './use-sequence-props-subscription';

export const SubscribeToNodePaths: React.FC<{
	readonly sequence: TSequence;
}> = ({sequence}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);

	const visualModeEnvEnabled = Boolean(
		process.env.EXPERIMENTAL_VISUAL_MODE_ENABLED,
	);
	const previewConnected = previewServerState.type === 'connected';

	const visualModeActive = visualModeEnvEnabled && previewConnected;

	const originalLocation = useResolvedStack(sequence.stack ?? null);
	useSequencePropsSubscription(sequence, originalLocation, visualModeActive);

	return null;
};
