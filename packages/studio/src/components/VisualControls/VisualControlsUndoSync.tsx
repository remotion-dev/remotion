import type {EventSourceEvent} from '@remotion/studio-shared';
import type React from 'react';
import {useContext, useEffect} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {SetVisualControlsContext} from '../../visual-controls/VisualControls';

export const VisualControlsUndoSync: React.FC = () => {
	const {subscribeToEvent} = useContext(StudioServerConnectionCtx);
	const {updateValue} = useContext(SetVisualControlsContext);

	useEffect(() => {
		const unsub = subscribeToEvent(
			'visual-control-values-changed',
			(event: EventSourceEvent) => {
				if (event.type !== 'visual-control-values-changed') {
					return;
				}

				for (const entry of event.values) {
					updateValue(entry.id, entry.isUndefined ? undefined : entry.value);
				}
			},
		);

		return () => unsub();
	}, [subscribeToEvent, updateValue]);

	return null;
};
