import path from 'node:path';
import type {
	CanUpdateSequencePropsResponse,
	SequenceNodePath,
} from '@remotion/studio-shared';
import {installFileWatcher} from '../file-watcher';
import {waitForLiveEventsListener} from './live-events';
import {
	computeSequencePropsStatus,
	computeSequencePropsStatusByLine,
} from './routes/can-update-sequence-props';

type WatcherInfo = {
	unwatch: () => void;
};

const sequencePropsWatchers: Record<string, Record<string, WatcherInfo>> = {};

const makeWatcherKey = ({
	absolutePath,
	nodePath,
}: {
	absolutePath: string;
	nodePath: SequenceNodePath;
}): string => {
	return `${absolutePath}:${JSON.stringify(nodePath)}`;
};

export const subscribeToSequencePropsWatchers = ({
	fileName,
	line,
	keys,
	remotionRoot,
	clientId,
}: {
	fileName: string;
	line: number;
	keys: string[];
	remotionRoot: string;
	clientId: string;
}): CanUpdateSequencePropsResponse => {
	const absolutePath = path.resolve(remotionRoot, fileName);

	// Initial lookup by line+column to resolve the nodePath
	const initialResult = computeSequencePropsStatusByLine({
		fileName,
		line,
		keys,
		remotionRoot,
	});

	if (!initialResult.canUpdate) {
		return initialResult;
	}

	const {nodePath} = initialResult;
	const watcherKey = makeWatcherKey({absolutePath, nodePath});

	// Unwatch any existing watcher for the same key
	if (sequencePropsWatchers[clientId]?.[watcherKey]) {
		sequencePropsWatchers[clientId][watcherKey].unwatch();
	}

	const {unwatch} = installFileWatcher({
		file: absolutePath,
		onChange: (type) => {
			if (type === 'deleted') {
				return;
			}

			const result = computeSequencePropsStatus({
				fileName,
				nodePath,
				keys,
				remotionRoot,
			});

			waitForLiveEventsListener().then((listener) => {
				listener.sendEventToClient({
					type: 'sequence-props-updated',
					fileName,
					nodePath,
					result,
				});
			});
		},
	});

	if (!sequencePropsWatchers[clientId]) {
		sequencePropsWatchers[clientId] = {};
	}

	sequencePropsWatchers[clientId][watcherKey] = {unwatch};

	return initialResult;
};

export const unsubscribeFromSequencePropsWatchers = ({
	fileName,
	nodePath,
	remotionRoot,
	clientId,
}: {
	fileName: string;
	nodePath: SequenceNodePath;
	remotionRoot: string;
	clientId: string;
}) => {
	const absolutePath = path.resolve(remotionRoot, fileName);
	const watcherKey = makeWatcherKey({absolutePath, nodePath});

	if (
		!sequencePropsWatchers[clientId] ||
		!sequencePropsWatchers[clientId][watcherKey]
	) {
		// eslint-disable-next-line no-console
		console.warn(
			`Unexpected: unsubscribe for sequence props watcher that does not exist (clientId=${clientId}, key=${watcherKey})`,
		);
		return;
	}

	sequencePropsWatchers[clientId][watcherKey].unwatch();
	delete sequencePropsWatchers[clientId][watcherKey];
};

export const unsubscribeClientSequencePropsWatchers = (clientId: string) => {
	if (!sequencePropsWatchers[clientId]) {
		return;
	}

	Object.values(sequencePropsWatchers[clientId]).forEach((watcher) => {
		watcher.unwatch();
	});

	delete sequencePropsWatchers[clientId];
};
