import {useEffect, useState} from 'react';
import {subscribeToEvent, unsubscribeFromEvent} from '../../event-source';
import type {EventSourceEvent} from '../../event-source-events';
import {
	subscribeToFileExistenceWatcher,
	unsubscribeFromFileExistenceWatcher,
} from '../components/RenderQueue/actions';

export const useFileExistence = (outName: string) => {
	const [exists, setExists] = useState(false);

	// TODO: React to updates
	useEffect(() => {
		subscribeToFileExistenceWatcher({file: outName}).then((_exists) => {
			setExists(_exists);
		});

		return () => {
			unsubscribeFromFileExistenceWatcher({file: outName});
		};
	}, [outName]);

	useEffect(() => {
		const listener = (event: EventSourceEvent) => {
			if (event.type !== 'watched-file-deleted') {
				return;
			}

			if (event.file !== outName) {
				return;
			}

			setExists(false);
		};

		subscribeToEvent('watched-file-deleted', listener);
		return () => unsubscribeFromEvent('watched-file-deleted', listener);
	}, [outName]);

	useEffect(() => {
		const listener = (event: EventSourceEvent) => {
			if (event.type !== 'watched-file-undeleted') {
				return;
			}

			if (event.file !== outName) {
				return;
			}

			setExists(true);
		};

		subscribeToEvent('watched-file-undeleted', listener);
		return () => unsubscribeFromEvent('watched-file-undeleted', listener);
	}, [outName]);

	return exists;
};
