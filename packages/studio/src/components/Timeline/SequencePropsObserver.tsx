import {type EventSourceEvent} from '@remotion/studio-shared';
import {useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {FastRefreshContext} from '../../fast-refresh-context';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {ExpandedTracksSetterContext} from '../ExpandedTracksProvider';

export const SequencePropsObserver = () => {
	const {subscribeToEvent} = useContext(StudioServerConnectionCtx);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
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

			// This event arrives before Fast Refresh commits the new tree. Static
			// overrides from either path would therefore belong to the wrong tree.
			const notFound = {
				canUpdate: false as const,
				reason: 'not-found' as const,
			};
			setPropStatuses(event.previousNodePath, () => notFound);
			if (event.nodePath !== null) {
				setPropStatuses(event.nodePath, () => notFound);
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

	useEffect(() => {
		const events = pendingRemappings.current;
		pendingRemappings.current = [];

		for (const event of events) {
			if (event.nodePath === null) {
				continue;
			}

			migrateExpandedTracksForSubscriptionKey(
				event.previousNodePath,
				event.nodePath,
			);
		}
	}, [fastRefreshes, migrateExpandedTracksForSubscriptionKey]);

	return null;
};
