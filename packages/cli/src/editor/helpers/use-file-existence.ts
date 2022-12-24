import {useEffect, useState} from 'react';
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

	return exists;
};
