import type {CanUpdateDefaultPropsResponse} from '@remotion/studio-shared';
import {installFileWatcher} from '../file-watcher';
import {waitForLiveEventsListener} from './live-events';
import {
	computeCanUpdateDefaultProps,
	computeCanUpdateDefaultPropsFromContent,
} from './routes/can-update-default-props';

// Global file watcher — at most one for the root file
let globalWatcher: {
	unwatch: () => void;
	rootFile: string;
	refCount: number;
} | null = null;

// Per-compositionId set of subscribed clientIds
const subscriptions: Record<string, Set<string>> = {};

// Cached config for recomputation on file change
let watcherConfig: {
	remotionRoot: string;
	entryPoint: string;
} | null = null;

const ensureGlobalWatcher = (rootFile: string) => {
	if (globalWatcher) {
		globalWatcher.refCount++;
		return;
	}

	const {unwatch} = installFileWatcher({
		file: rootFile,
		existenceOnly: false,
		onChange: (event) => {
			if (event.type === 'deleted') {
				return;
			}

			if (!watcherConfig) {
				return;
			}

			const compositionIds = Object.keys(subscriptions);
			for (const compositionId of compositionIds) {
				if (subscriptions[compositionId].size === 0) {
					continue;
				}

				const clientIds = [...subscriptions[compositionId]];
				const newResult = computeCanUpdateDefaultPropsFromContent(
					event.content,
					compositionId,
				);
				waitForLiveEventsListener().then((listener) => {
					const updateEvent = {
						type: 'default-props-updatable-changed' as const,
						compositionId,
						result: newResult,
					};
					for (const cId of clientIds) {
						listener.sendEventToClientId(cId, updateEvent);
					}
				});
			}
		},
	});

	globalWatcher = {unwatch, rootFile, refCount: 1};
};

const releaseGlobalWatcher = () => {
	if (!globalWatcher) {
		return;
	}

	globalWatcher.refCount--;
	if (globalWatcher.refCount <= 0) {
		globalWatcher.unwatch();
		globalWatcher = null;
		watcherConfig = null;
	}
};

export const subscribeToDefaultPropsWatchers = async ({
	compositionId,
	clientId,
	remotionRoot,
	entryPoint,
}: {
	compositionId: string;
	clientId: string;
	remotionRoot: string;
	entryPoint: string;
}): Promise<CanUpdateDefaultPropsResponse> => {
	const {result, rootFile} = await computeCanUpdateDefaultProps({
		compositionId,
		remotionRoot,
		entryPoint,
	});

	// Remove from any previous subscription for this client+composition
	if (subscriptions[compositionId]?.has(clientId)) {
		subscriptions[compositionId].delete(clientId);
		releaseGlobalWatcher();
	}

	if (rootFile) {
		watcherConfig = {remotionRoot, entryPoint};

		if (!subscriptions[compositionId]) {
			subscriptions[compositionId] = new Set();
		}

		subscriptions[compositionId].add(clientId);
		ensureGlobalWatcher(rootFile);
	}

	return result;
};

export const unsubscribeFromDefaultPropsWatchers = ({
	compositionId,
	clientId,
}: {
	compositionId: string;
	clientId: string;
}) => {
	if (!subscriptions[compositionId]?.has(clientId)) {
		return;
	}

	subscriptions[compositionId].delete(clientId);
	if (subscriptions[compositionId].size === 0) {
		delete subscriptions[compositionId];
	}

	releaseGlobalWatcher();
};

export const unsubscribeClientDefaultPropsWatchers = (clientId: string) => {
	for (const compositionId of Object.keys(subscriptions)) {
		if (subscriptions[compositionId].has(clientId)) {
			subscriptions[compositionId].delete(clientId);
			if (subscriptions[compositionId].size === 0) {
				delete subscriptions[compositionId];
			}

			releaseGlobalWatcher();
		}
	}
};
