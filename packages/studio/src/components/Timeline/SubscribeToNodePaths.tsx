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
	if (sequence.controls === null || !visualModeEnvEnabled) {
		return;
	}

	const previewConnected = previewServerState.type === 'connected';

	const visualModeActive = visualModeEnvEnabled && previewConnected;

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const originalLocation = useResolvedStack(sequence.stack ?? null);

	// eslint-disable-next-line react-hooks/rules-of-hooks
	useSequencePropsSubscription({
		overrideId: sequence.controls.overrideId,
		schema: sequence.controls.schema,
		originalLocation,
		visualModeEnabled: visualModeActive,
	});

	return null;
};
