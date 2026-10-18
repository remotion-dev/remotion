import type {
	CanUpdateDefaultPropsResponse,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import {installFileWatcher} from '../file-watcher';
import {waitForLiveEventsListener} from './live-events';
import {
	computeCanUpdateDefaultProps,
	computeCanUpdateDefaultPropsFromContent,
} from './routes/can-update-default-props';

// Per-compositionId watcher on the file that registers the composition
const watchers: Record<
	string,
	{
		unwatch: () => void;
		compositionFile: string;
		clientIds: Set<string>;
	}
> = {};

const removeClient = (compositionId: string, clientId: string) => {
	const watcher = watchers[compositionId];
	if (!watcher?.clientIds.has(clientId)) {
		return;
	}

	watcher.clientIds.delete(clientId);
	if (watcher.clientIds.size === 0) {
		watcher.unwatch();
		delete watchers[compositionId];
	}
};

export const subscribeToDefaultPropsWatchers = async ({
	compositionId,
	clientId,
	symbolicatedStack,
	remotionRoot,
	entryPoint,
}: {
	compositionId: string;
	clientId: string;
	symbolicatedStack: SymbolicatedStackFrame | null;
	remotionRoot: string;
	entryPoint: string;
}): Promise<CanUpdateDefaultPropsResponse> => {
	const {result, compositionFile} = await computeCanUpdateDefaultProps({
		compositionId,
		symbolicatedStack,
		remotionRoot,
		entryPoint,
	});

	// Remove from any previous subscription for this client+composition
	removeClient(compositionId, clientId);

	if (!compositionFile) {
		return result;
	}

	// The composition may have moved to another file since the watcher was installed
	if (watchers[compositionId]?.compositionFile !== compositionFile) {
		watchers[compositionId]?.unwatch();
		const clientIds = new Set(watchers[compositionId]?.clientIds);
		const {unwatch} = installFileWatcher({
			file: compositionFile,
			existenceOnly: false,
			onChange: (event) => {
				if (event.type === 'deleted') {
					return;
				}

				const newResult = computeCanUpdateDefaultPropsFromContent(
					event.content,
					compositionId,
				);
				const subscribedClientIds = [...clientIds];
				waitForLiveEventsListener().then((listener) => {
					const updateEvent = {
						type: 'default-props-updatable-changed' as const,
						compositionId,
						result: newResult,
					};
					for (const cId of subscribedClientIds) {
						listener.sendEventToClientId(cId, updateEvent);
					}
				});
			},
		});
		watchers[compositionId] = {unwatch, compositionFile, clientIds};
	}

	watchers[compositionId].clientIds.add(clientId);

	return result;
};

export const unsubscribeFromDefaultPropsWatchers = ({
	compositionId,
	clientId,
}: {
	compositionId: string;
	clientId: string;
}) => {
	removeClient(compositionId, clientId);
};

export const unsubscribeClientDefaultPropsWatchers = (clientId: string) => {
	for (const compositionId of Object.keys(watchers)) {
		removeClient(compositionId, clientId);
	}
};
