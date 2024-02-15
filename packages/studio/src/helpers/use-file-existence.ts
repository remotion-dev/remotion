import type {EventSourceEvent} from '@remotion/studio-shared';
import {useContext, useEffect, useRef, useState} from 'react';
import {
	subscribeToFileExistenceWatcher,
	unsubscribeFromFileExistenceWatcher,
} from '../components/RenderQueue/actions';
import {StudioServerConnectionCtx} from './client-id';

export const useFileExistence = (outName: string) => {
	const [exists, setExists] = useState(false);

	const {previewServerState: state, subscribeToEvent} = useContext(
		StudioServerConnectionCtx,
	);
	const clientId = state.type === 'connected' ? state.clientId : undefined;

	const currentOutName = useRef('');
	currentOutName.current = outName;

	useEffect(() => {
		if (!clientId) {
			return;
		}

		subscribeToFileExistenceWatcher({
			file: outName,
			clientId,
		}).then((_exists) => {
			if (currentOutName.current === outName) {
				setExists(_exists);
			}
		});

		return () => {
			unsubscribeFromFileExistenceWatcher({file: outName, clientId});
		};
	}, [clientId, outName]);

	useEffect(() => {
		const listener = (event: EventSourceEvent) => {
			if (event.type !== 'watched-file-deleted') {
				return;
			}

			if (event.file !== currentOutName.current) {
				return;
			}

			if (currentOutName.current === outName) {
				setExists(false);
			}
		};

		const unsub = subscribeToEvent('watched-file-deleted', listener);
		return () => {
			unsub();
		};
	}, [outName, subscribeToEvent]);

	useEffect(() => {
		const listener = (event: EventSourceEvent) => {
			if (event.type !== 'watched-file-undeleted') {
				return;
			}

			if (event.file !== outName) {
				return;
			}

			if (currentOutName.current === outName) {
				setExists(true);
			}
		};

		const unsub = subscribeToEvent('watched-file-undeleted', listener);
		return () => {
			unsub();
		};
	}, [outName, subscribeToEvent]);

	return exists;
};
