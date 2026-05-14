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

			setCodeValues(event.nodePath, () => event.result);
		};

		const unsubscribe = subscribeToEvent('sequence-props-updated', handleEvent);

		return () => {
			unsubscribe();
		};
	}, [setCodeValues, subscribeToEvent]);

	return null;
};
