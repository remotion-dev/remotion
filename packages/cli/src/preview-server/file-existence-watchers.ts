import path from 'path';
import {installFileWatcher} from '../file-watcher';
import {waitForLiveEventsListener} from './live-events';

const fileExistenceWatchers: Record<string, () => void> = {};

export const subscribeToFileExistenceWatchers = ({
	file: relativeFile,
	remotionRoot,
}: {
	file: string;
	remotionRoot: string;
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
	fileExistenceWatchers[file] = unwatch;

	return {exists};
};

export const unsubscribeFromFileExistenceWatchers = ({
	file,
	remotionRoot,
}: {
	file: string;
	remotionRoot: string;
}) => {
	const actualPath = path.resolve(remotionRoot, file);
	fileExistenceWatchers[actualPath]?.();
	delete fileExistenceWatchers[actualPath];
};
