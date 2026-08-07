import {
	stringifySequenceSubscriptionKey,
	type EventSourceEvent,
} from '@remotion/studio-shared';
import {useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {ExpandedTracksSetterContext} from '../ExpandedTracksProvider';

export const SequencePropsObserver = () => {
	const {subscribeToEvent} = useContext(StudioServerConnectionCtx);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const overrideIdToNodePathMappingsRef = useRef(overrideIdToNodePathMappings);
	overrideIdToNodePathMappingsRef.current = overrideIdToNodePathMappings;
	const {setOverrideIdToNodePath} = useContext(
		Internals.OverrideIdsToNodePathsSettersContext,
	);
	const {migrateExpandedTracksForSubscriptionKey} = useContext(
		ExpandedTracksSetterContext,
	);

	useEffect(() => {
		const handleEvent = (event: EventSourceEvent) => {
			if (event.type !== 'sequence-props-updated') {
				return;
			}

			setPropStatuses(event.nodePath, () => event.result);
			if (!event.previousNodePath) {
				return;
			}

			const previousKey = stringifySequenceSubscriptionKey(
				event.previousNodePath,
			);
			for (const [overrideId, nodePath] of Object.entries(
				overrideIdToNodePathMappingsRef.current,
			)) {
				if (stringifySequenceSubscriptionKey(nodePath) === previousKey) {
					setOverrideIdToNodePath(overrideId, event.nodePath);
				}
			}

			migrateExpandedTracksForSubscriptionKey(
				event.previousNodePath,
				event.nodePath,
			);
		};

		const unsubscribe = subscribeToEvent('sequence-props-updated', handleEvent);

		return () => {
			unsubscribe();
		};
	}, [
		migrateExpandedTracksForSubscriptionKey,
		setOverrideIdToNodePath,
		setPropStatuses,
		subscribeToEvent,
	]);

	return null;
};
