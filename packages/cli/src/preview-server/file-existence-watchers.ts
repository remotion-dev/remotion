import path from 'node:path';
import {installFileWatcher} from '../file-watcher';
import {waitForLiveEventsListener} from './live-events';

const fileExistenceWatchers: Record<string, Record<string, () => void>> = {};

export const subscribeToFileExistenceWatchers = ({
	file: relativeFile,
	remotionRoot,
	clientId,
}: {
	file: string;
	remotionRoot: string;
	clientId: string;
}): {exists: boolean} => {
	const file = path.resolve(remotionRoot, relativeFile);

	const {unwatch, exists} = installFileWatcher({
		file,
		onChange: (type) => {
			if (type === 'created') {
				waitForLiveEventsListener().then((listener) => {
					listener.sendEventToClient({
						type: 'watched-file-undeleted',
						// Must be relative file because that's what the client expects
						file: relativeFile,
					});
				});
			}

			if (type === 'deleted') {
				waitForLiveEventsListener().then((listener) => {
					listener.sendEventToClient({
						type: 'watched-file-deleted',
						// Must be relative file because that's what the client expects
						file: relativeFile,
					});
				});
			}
		},
	});
	if (!fileExistenceWatchers[clientId]) {
		fileExistenceWatchers[clientId] = {};
	}

	fileExistenceWatchers[clientId][file] = unwatch;

	return {exists};
};

export const unsubscribeFromFileExistenceWatchers = ({
	file,
	remotionRoot,
	clientId,
}: {
	file: string;
	remotionRoot: string;
	clientId: string;
}) => {
	const actualPath = path.resolve(remotionRoot, file);
	if (!fileExistenceWatchers[clientId]) {
		return;
	}

	fileExistenceWatchers[clientId][actualPath]?.();
	delete fileExistenceWatchers[clientId][actualPath];
};

export const unsubscribeClientFileExistenceWatchers = (clientId: string) => {
	if (!fileExistenceWatchers[clientId]) {
		return;
	}

	Object.values(fileExistenceWatchers[clientId]).forEach((unwatch) => {
		unwatch();
	});

	delete fileExistenceWatchers[clientId];
};
