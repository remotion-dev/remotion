import type {EventSourceEvent} from '@remotion/studio-shared';
import {useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';

export const SequencePropsObserver = () => {
	const {subscribeToEvent} = useContext(StudioServerConnectionCtx);
	const {setCodeValues} = useContext(Internals.VisualModeSettersContext);

	useEffect(() => {
		const handleEvent = (event: EventSourceEvent) => {
			if (event.type !== 'sequence-props-updated') {
				return;
			}

			if (event.result.canUpdate) {
				setCodeValues(event.nodePath, event.result.props);
			} else {
				setCodeValues(event.nodePath, null);
			}
		};

		const unsubscribe = subscribeToEvent('sequence-props-updated', handleEvent);

		return () => {
			unsubscribe();
		};
	}, [setCodeValues, subscribeToEvent]);

	return null;
};
