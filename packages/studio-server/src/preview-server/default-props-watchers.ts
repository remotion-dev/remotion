import type {CanUpdateDefaultPropsResponse} from '@remotion/studio-shared';
import {installFileWatcher} from '../file-watcher';
import {waitForLiveEventsListener} from './live-events';
import {computeCanUpdateDefaultProps} from './routes/can-update-default-props';

type WatcherInfo = {
	unwatch: () => void;
};

const defaultPropsWatchers: Record<string, Record<string, WatcherInfo>> = {};

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

	// Unwatch any existing watcher for the same key
	if (defaultPropsWatchers[clientId]?.[compositionId]) {
		defaultPropsWatchers[clientId][compositionId].unwatch();
	}

	if (rootFile) {
		const {unwatch} = installFileWatcher({
			file: rootFile,
			onChange: (type) => {
				if (type === 'deleted') {
					return;
				}

				computeCanUpdateDefaultProps({
					compositionId,
					remotionRoot,
					entryPoint,
				}).then(({result: newResult}) => {
					waitForLiveEventsListener().then((listener) => {
						listener.sendEventToClient({
							type: 'default-props-updatable-changed',
							compositionId,
							result: newResult,
						});
					});
				});
			},
		});

		if (!defaultPropsWatchers[clientId]) {
			defaultPropsWatchers[clientId] = {};
		}

		defaultPropsWatchers[clientId][compositionId] = {unwatch};
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
	if (
		!defaultPropsWatchers[clientId] ||
		!defaultPropsWatchers[clientId][compositionId]
	) {
		return;
	}

	defaultPropsWatchers[clientId][compositionId].unwatch();
	delete defaultPropsWatchers[clientId][compositionId];
};

export const unsubscribeClientDefaultPropsWatchers = (clientId: string) => {
	if (!defaultPropsWatchers[clientId]) {
		return;
	}

	Object.values(defaultPropsWatchers[clientId]).forEach((watcher) => {
		watcher.unwatch();
	});

	delete defaultPropsWatchers[clientId];
};
