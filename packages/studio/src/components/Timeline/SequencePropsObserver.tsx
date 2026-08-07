import {type EventSourceEvent} from '@remotion/studio-shared';
import {useContext, useEffect, useLayoutEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {FastRefreshContext} from '../../fast-refresh-context';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {ExpandedTracksSetterContext} from '../ExpandedTracksProvider';

export const SequencePropsObserver = () => {
	const {subscribeToEvent} = useContext(StudioServerConnectionCtx);
	const {remapPropStatuses, setPropStatuses} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {fastRefreshes} = useContext(FastRefreshContext);
	const {migrateExpandedTracksForSubscriptionKey} = useContext(
		ExpandedTracksSetterContext,
	);
	const pendingRemappings = useRef<
		Extract<EventSourceEvent, {type: 'sequence-props-remapped'}>[]
	>([]);

	useEffect(() => {
		const handleEvent = (event: EventSourceEvent) => {
			if (event.type !== 'sequence-props-updated') {
				return;
			}

			setPropStatuses(event.nodePath, () => event.result);
		};

		const handleRemapping = (event: EventSourceEvent) => {
			if (event.type !== 'sequence-props-remapped') {
				return;
			}

			pendingRemappings.current.push(event);
		};

		const unsubscribe = subscribeToEvent('sequence-props-updated', handleEvent);
		const unsubscribeFromRemappings = subscribeToEvent(
			'sequence-props-remapped',
			handleRemapping,
		);

		return () => {
			unsubscribe();
			unsubscribeFromRemappings();
		};
	}, [setPropStatuses, subscribeToEvent]);

	useLayoutEffect(() => {
		const events = pendingRemappings.current;
		pendingRemappings.current = [];
		if (events.length === 0) {
			return;
		}

		remapPropStatuses(events);

		for (const event of events) {
			if (event.nodePath === null) {
				continue;
			}

			migrateExpandedTracksForSubscriptionKey(
				event.previousNodePath,
				event.nodePath,
			);
		}
	}, [
		fastRefreshes,
		migrateExpandedTracksForSubscriptionKey,
		remapPropStatuses,
	]);

	return null;
};
