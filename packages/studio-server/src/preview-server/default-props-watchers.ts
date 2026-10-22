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

// Each client watches its own resolved registration file or root-file fallback.
const watchers: Record<
	string,
	Map<string, {unwatch: () => void; clientIds: Set<string>}>
> = {};

const removeClient = (compositionId: string, clientId: string) => {
	const compositionWatchers = watchers[compositionId];
	if (!compositionWatchers) {
		return;
	}

	for (const [file, watcher] of compositionWatchers) {
		watcher.clientIds.delete(clientId);
		if (watcher.clientIds.size === 0) {
			watcher.unwatch();
			compositionWatchers.delete(file);
		}
	}

	if (compositionWatchers.size === 0) {
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

	watchers[compositionId] ??= new Map();
	const compositionWatchers = watchers[compositionId];
	if (!compositionWatchers.has(compositionFile)) {
		const clientIds = new Set<string>();
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
		compositionWatchers.set(compositionFile, {unwatch, clientIds});
	}

	compositionWatchers.get(compositionFile)!.clientIds.add(clientId);

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
